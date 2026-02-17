import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Shield, AlertCircle, CheckCircle, X, 
  Smartphone, Mail, RefreshCw, HelpCircle, ChevronDown, ChevronUp,
  Phone, Lock
} from 'lucide-react';
import { verifyOtp, resendOtp } from '../services/supabaseAuth';
import { RESEND_COOLDOWN_SECONDS, MAX_VERIFICATION_ATTEMPTS } from '../mocks/auth';

export default function TwoFactorAuth() {
  const navigate = useNavigate();
  
  // Get stored 2FA session data
  const [tempToken] = useState(() => sessionStorage.getItem('2fa_temp_token'));
  const [user] = useState(() => {
    const userData = sessionStorage.getItem('2fa_user');
    return userData ? JSON.parse(userData) : null;
  });

  // OTP input state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [showBackupCode, setShowBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [attempts, setAttempts] = useState(MAX_VERIFICATION_ATTEMPTS);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);
  
  // Feedback state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  
  // Refs for OTP inputs
  const inputRefs = useRef([]);

  // Redirect if no 2FA session
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutCountdown > 0) {
      const timer = setTimeout(() => setLockoutCountdown(lockoutCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (lockoutCountdown === 0 && isLocked) {
      setIsLocked(false);
      setAttempts(MAX_VERIFICATION_ATTEMPTS);
    }
  }, [lockoutCountdown, isLocked]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Auto-submit when OTP is complete
  useEffect(() => {
    const code = otp.join('');
    if (code.length === 6 && !verifying && !showBackupCode) {
      handleVerifyOTP();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace - move to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle left arrow
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle right arrow
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length && i < 6; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      
      // Focus the next empty input or last input
      const nextEmptyIndex = pastedData.length < 6 ? pastedData.length : 5;
      inputRefs.current[nextEmptyIndex]?.focus();
    }
  };

  const clearOtp = () => {
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const handleVerifyOTP = async () => {
    if (isLocked) return;
    
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const result = await verifyOtp(user?.email, code);

      if (result.success) {
        setSuccess('Verification successful! Redirecting to your dashboard...');
        // Clear 2FA session data
        sessionStorage.removeItem('2fa_temp_token');
        sessionStorage.removeItem('2fa_user');
        
        setTimeout(() => {
          const role = (result.role || user?.role || 'PATIENT').toUpperCase();
          const roleMap = {
            'PATIENT': 'patient',
            'DOCTOR': 'doctor',
            'NURSE': 'nurse',
            'ADMIN': 'admin',
            'LAB_TECH': 'lab'
          };
          navigate(`/dashboard/${roleMap[role] || 'patient'}`);
        }, 1500);
      } else {
        const newAttempts = attempts - 1;
        setAttempts(newAttempts);
        
        if (newAttempts <= 0) {
          setIsLocked(true);
          setLockoutCountdown(15 * 60); // 15 minutes
          setError('Too many failed attempts. Please try again in 15 minutes.');
        } else {
          setError(`${result.error || 'Invalid code'} ${newAttempts} ${newAttempts === 1 ? 'attempt' : 'attempts'} remaining.`);
        }
        
        clearOtp();
        setVerifying(false);
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
      setVerifying(false);
    }
  };

  const handleVerifyBackupCode = async () => {
    if (isLocked) return;
    
    if (!backupCode.trim()) {
      setError('Please enter a backup code');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const result = { success: false, error: 'Backup codes are not enabled' };

      if (result.success) {
        setSuccess('Backup code verified! Redirecting to your dashboard...');
        sessionStorage.removeItem('2fa_temp_token');
        sessionStorage.removeItem('2fa_user');
        
        setTimeout(() => {
          navigate(result.redirectTo);
        }, 1500);
      } else {
        const newAttempts = attempts - 1;
        setAttempts(newAttempts);
        
        if (newAttempts <= 0) {
          setIsLocked(true);
          setLockoutCountdown(15 * 60);
          setError('Too many failed attempts. Please try again in 15 minutes.');
        } else {
          setError(`${result.error} ${newAttempts} ${newAttempts === 1 ? 'attempt' : 'attempts'} remaining.`);
        }
        
        setBackupCode('');
        setVerifying(false);
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setCanResend(false);
    setCountdown(RESEND_COOLDOWN_SECONDS);
    
    try {
      await resendOtp(user?.email);
      setSuccess('A new verification code has been sent!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    }
  };

  const handleBackToLogin = () => {
    sessionStorage.removeItem('2fa_temp_token');
    sessionStorage.removeItem('2fa_user');
    navigate('/login');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const dismissError = () => setError('');

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Animated Background */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={handleBackToLogin}
            className="flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 mb-4 transition-colors group text-sm"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Login</span>
          </button>

          {/* Main Card */}
          <div className="glass-card dark:bg-slate-800/80 dark:border-slate-700/50 p-6 rounded-2xl animate-fade-in">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-3">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">Two-Factor Authentication</h1>
              <p className="text-gray-600 dark:text-slate-400 text-xs">Enter the verification code sent to your device</p>
              
              {/* User Info */}
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                <Mail className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  {user.maskedEmail || user.email}
                </span>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between animate-shake">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 flex-shrink-0" />
                  <span>{error}</span>
                </div>
                <button 
                  onClick={dismissError}
                  className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                  aria-label="Dismiss error"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Success Alert */}
            {success && (
              <div className="mb-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                <span>{success}</span>
              </div>
            )}

            {/* Lockout Warning */}
            {isLocked && (
              <div className="mb-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                <span>Account locked. Try again in {formatTime(lockoutCountdown)}</span>
              </div>
            )}

            {!showBackupCode ? (
              /* OTP Input Section */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-3 text-center">
                    Enter 6-digit verification code
                  </label>
                  
                  {/* OTP Input Boxes */}
                  <div className="flex justify-center gap-1.5 sm:gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={index === 0 ? handleOtpPaste : undefined}
                        disabled={isLocked || verifying}
                        className={`w-10 h-12 sm:w-11 sm:h-13 text-center text-xl font-bold rounded-lg border-2 focus:outline-none focus:ring-2 transition-all ${
                          isLocked || verifying
                            ? 'bg-gray-100 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-400 dark:text-slate-500 cursor-not-allowed'
                            : error
                            ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500 animate-shake bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100'
                            : digit
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 focus:ring-blue-500 text-gray-900 dark:text-slate-100'
                            : 'border-gray-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100'
                        }`}
                        aria-label={`Digit ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Verification Method Indicator */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Code sent to {user.maskedPhone || user.maskedEmail}</span>
                </div>

                {/* Verify Button */}
                <button
                  onClick={handleVerifyOTP}
                  disabled={otp.join('').length !== 6 || verifying || isLocked}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {verifying ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      Verify & Continue
                    </>
                  )}
                </button>

                {/* Resend Code Section */}
                <div className="text-center space-y-1">
                  <p className="text-xs text-gray-500 dark:text-slate-400">Didn't receive a code?</p>
                  {canResend ? (
                    <button
                      onClick={handleResendCode}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-xs flex items-center gap-1 mx-auto transition-colors"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Resend Code
                    </button>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-slate-500">
                      Resend code in {countdown}s
                    </p>
                  )}
                </div>

                {/* Backup Code Link */}
                <div className="text-center pt-3 border-t border-gray-200 dark:border-slate-700">
                  <button
                    onClick={() => setShowBackupCode(true)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    Use backup code instead
                  </button>
                </div>
              </div>
            ) : (
              /* Backup Code Section */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">
                    Enter one of your backup codes
                  </label>
                  <input
                    type="text"
                    value={backupCode}
                    onChange={(e) => {
                      setBackupCode(e.target.value.toUpperCase());
                      setError('');
                    }}
                    disabled={isLocked || verifying}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    className={`w-full border-2 rounded-lg px-3 py-2 text-center font-mono text-base tracking-wider focus:outline-none focus:ring-2 transition-all ${
                      isLocked || verifying
                        ? 'bg-gray-100 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-400 dark:text-slate-500 cursor-not-allowed'
                        : error
                        ? 'border-red-300 dark:border-red-500 focus:ring-red-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100'
                        : 'border-gray-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100'
                    }`}
                  />
                </div>

                {/* Verify Backup Code Button */}
                <button
                  onClick={handleVerifyBackupCode}
                  disabled={!backupCode.trim() || verifying || isLocked}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {verifying ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Verify Backup Code
                    </>
                  )}
                </button>

                {/* Back to OTP Link */}
                <div className="text-center">
                  <button
                    onClick={() => {
                      setShowBackupCode(false);
                      setBackupCode('');
                      setError('');
                    }}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                  >
                    Back to verification code
                  </button>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="mt-4 flex items-center gap-1.5 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <p className="text-[10px] text-blue-700 dark:text-blue-300">
                For your security, this code will expire in 10 minutes.
              </p>
            </div>

            {/* Help Section */}
            <div className="mt-4">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="w-full flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-1.5 text-gray-700 dark:text-slate-300">
                  <HelpCircle className="h-4 w-4" />
                  <span className="font-medium text-xs">Having trouble?</span>
                </div>
                {showHelp ? (
                  <ChevronUp className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                )}
              </button>
              
              {showHelp && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg space-y-2 text-xs text-gray-600 dark:text-slate-400 animate-fade-in">
                  <p>• Make sure you're checking the correct device</p>
                  <p>• Check your spam folder for the email</p>
                  <p className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    Contact IT support: support@hospital.com
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    Call helpdesk: (555) 123-4567
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center text-[10px] text-gray-500 dark:text-slate-500">
            <p>© 2026 Healthcare Management System. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
