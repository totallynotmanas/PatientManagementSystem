import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Lock, AlertCircle, CheckCircle, X, Eye, EyeOff, 
  Shield, KeyRound, Check
} from 'lucide-react';
import { validateResetToken, resetPassword } from '../services/supabaseAuth';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [success, setSuccess] = useState('');
  const [passwordReset, setPasswordReset] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ newPassword: '', confirmPassword: '' });

  // Password strength indicators
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    noWeakPatterns: true
  });

  // Validate token on mount
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setValidatingToken(false);
        setError('No reset token provided. Please request a new password reset link.');
        return;
      }

      try {
        const result = await validateResetToken(token);
        if (result.valid) {
          setTokenValid(true);
        } else {
          setError('This password reset link is invalid or has expired. Please request a new one.');
        }
      } catch (err) {
        setError('This password reset link is invalid or has expired. Please request a new one.');
      } finally {
        setValidatingToken(false);
      }
    };

    checkToken();
  }, [token]);

  // Password strength checker
  useEffect(() => {
    const weakPatterns = ['password', '123456', 'qwerty', 'admin', 'letmein'];
    const lowerPassword = newPassword.toLowerCase();
    const hasWeakPattern = weakPatterns.some(pattern => lowerPassword.includes(pattern));

    setPasswordStrength({
      length: newPassword.length >= 12,
      noWeakPatterns: !hasWeakPattern
    });
  }, [newPassword]);

  const validatePassword = (value) => {
    if (!value) return 'Password is required';
    if (value.length < 12) return 'Password must be at least 12 characters';
    
    const weakPatterns = ['password', '123456', 'qwerty', 'admin', 'letmein'];
    const lowerValue = value.toLowerCase();
    if (weakPatterns.some(pattern => lowerValue.includes(pattern))) {
      return 'Password contains a common weak pattern';
    }
    
    return '';
  };

  const validateConfirmPassword = (value) => {
    if (!value) return 'Please confirm your password';
    if (value !== newPassword) return 'Passwords do not match';
    return '';
  };

  const handlePasswordBlur = () => {
    setFieldErrors(prev => ({ ...prev, newPassword: validatePassword(newPassword) }));
  };

  const handleConfirmPasswordBlur = () => {
    setFieldErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(confirmPassword) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate both fields
    const passwordError = validatePassword(newPassword);
    const confirmError = validateConfirmPassword(confirmPassword);

    if (passwordError || confirmError) {
      setFieldErrors({ newPassword: passwordError, confirmPassword: confirmError });
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(token, newPassword, confirmPassword);
      
      if (result.success) {
        setSuccess('Your password has been reset successfully!');
        setPasswordReset(true);
      } else {
        setError(result.error || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state while validating token
  if (validatingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-slate-400">Validating reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-teal-600 p-8 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-2">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-white text-xl font-bold">SecureHealth</span>
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          <h1 className="text-2xl font-bold text-white leading-tight">
            Create a new password
          </h1>
          <p className="text-blue-100 text-sm">
            Choose a strong password to keep your account secure.
          </p>
          
          <div className="space-y-2 mt-4">
            <div className="flex items-center space-x-2 text-white/90 text-sm">
              <KeyRound className="h-4 w-4" />
              <span>Minimum 12 characters required</span>
            </div>
            <div className="flex items-center space-x-2 text-white/90 text-sm">
              <Shield className="h-4 w-4" />
              <span>Cannot reuse previous passwords</span>
            </div>
            <div className="flex items-center space-x-2 text-white/90 text-sm">
              <Lock className="h-4 w-4" />
              <span>No common weak patterns allowed</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-blue-200 text-xs">
          © 2026 SecureHealth. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={() => navigate('/login')}
            className="flex items-center text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 mb-4 transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Login
          </button>

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center space-x-2 mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-teal-600 p-1.5 rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-gray-900 dark:text-slate-100 text-lg font-bold">SecureHealth</span>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 border border-gray-100 dark:border-slate-700">
            {/* Invalid Token State */}
            {!tokenValid && !validatingToken && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full mb-3">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">Invalid Link</h2>
                <p className="text-gray-600 dark:text-slate-400 text-sm mb-4">{error}</p>
                <Link
                  to="/forgot-password"
                  className="inline-block w-full py-2 px-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 transition-all text-center"
                >
                  Request New Reset Link
                </Link>
              </div>
            )}

            {/* Password Reset Success State */}
            {passwordReset && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-1">Password Reset!</h2>
                <p className="text-gray-600 dark:text-slate-400 text-sm mb-4">Your password has been successfully updated.</p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-2 px-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Sign In with New Password
                </button>
              </div>
            )}

            {/* Reset Password Form */}
            {tokenValid && !passwordReset && (
              <>
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3">
                    <KeyRound className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Set New Password</h2>
                  <p className="text-gray-600 dark:text-slate-400 text-xs mt-1">Create a strong password for your account</p>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start animate-fade-in">
                    <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-red-700 dark:text-red-300 text-xs font-medium">{error}</p>
                    </div>
                    <button onClick={() => setError('')} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* New Password */}
                  <div className="space-y-1">
                    <label htmlFor="newPassword" className="block text-xs font-semibold text-gray-700 dark:text-slate-200">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                      </div>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        id="newPassword"
                        className={`w-full border-2 rounded-lg pl-8 pr-10 py-2 text-sm focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-500 ${
                          fieldErrors.newPassword
                            ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        onBlur={handlePasswordBlur}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {fieldErrors.newPassword && (
                      <p className="text-red-500 dark:text-red-400 text-xs flex items-center mt-1">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {fieldErrors.newPassword}
                      </p>
                    )}
                  </div>

                  {/* Password Strength Indicators */}
                  <div className="space-y-1 p-2 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs font-medium text-gray-700 dark:text-slate-200">Password requirements:</p>
                    <div className="space-y-0.5">
                      <div className={`flex items-center text-xs ${passwordStrength.length ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-slate-400'}`}>
                        {passwordStrength.length ? (
                          <Check className="h-3 w-3 mr-1.5" />
                        ) : (
                          <div className="w-3 h-3 mr-1.5 rounded-full border-2 border-gray-300 dark:border-slate-500" />
                        )}
                        At least 12 characters
                      </div>
                      <div className={`flex items-center text-xs ${passwordStrength.noWeakPatterns ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                        {passwordStrength.noWeakPatterns ? (
                          <Check className="h-3 w-3 mr-1.5" />
                        ) : (
                          <AlertCircle className="h-3 w-3 mr-1.5" />
                        )}
                        No common weak patterns
                      </div>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-700 dark:text-slate-200">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        className={`w-full border-2 rounded-lg pl-8 pr-10 py-2 text-sm focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-500 ${
                          fieldErrors.confirmPassword
                            ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onBlur={handleConfirmPasswordBlur}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-red-500 dark:text-red-400 text-xs flex items-center mt-1">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {fieldErrors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !newPassword || !confirmPassword}
                    className={`w-full py-2 px-3 rounded-lg text-sm font-semibold text-white transition-all flex items-center justify-center space-x-2 ${
                      loading || !newPassword || !confirmPassword
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Resetting...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-4 w-4" />
                        <span>Reset Password</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* Help Text */}
            {tokenValid && !passwordReset && (
              <div className="mt-4 text-center text-xs text-gray-500 dark:text-slate-400">
                Remember your password?{' '}
                <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
