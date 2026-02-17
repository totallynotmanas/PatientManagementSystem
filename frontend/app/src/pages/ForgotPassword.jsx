import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, AlertCircle, CheckCircle, X, Send, Shield } from 'lucide-react';
import { forgotPassword } from '../services/supabaseAuth';

export default function ForgotPassword() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [fieldError, setFieldError] = useState('');

  // Email validation
  const validateEmail = (value) => {
    if (!value) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleEmailBlur = () => {
    setFieldError(validateEmail(email));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      setFieldError(emailError);
      return;
    }

    setLoading(true);

    try {
      const result = await forgotPassword(email);
      
      if (result.success) {
        setSuccess('If an account exists with this email, a password reset link has been sent.');
        setEmailSent(true);
      } else {
        // For security, we show the same message even on error
        setSuccess('If an account exists with this email, a password reset link has been sent.');
        setEmailSent(true);
      }
    } catch (err) {
      // For security, we don't reveal if email exists or not
      setSuccess('If an account exists with this email, a password reset link has been sent.');
      setEmailSent(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    setSuccess('');
    
    try {
      await forgotPassword(email);
      setSuccess('A new reset link has been sent to your email.');
    } catch (err) {
      setSuccess('A new reset link has been sent to your email.');
    } finally {
      setLoading(false);
    }
  };

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
            Forgot your password?
          </h1>
          <p className="text-blue-100 text-sm">
            No worries! Enter your email and we'll send you a secure link to reset your password.
          </p>
          
          <div className="space-y-2 mt-4">
            <div className="flex items-center space-x-2 text-white/90 text-sm">
              <Mail className="h-4 w-4" />
              <span>Check your email for a reset link</span>
            </div>
            <div className="flex items-center space-x-2 text-white/90 text-sm">
              <Shield className="h-4 w-4" />
              <span>Link expires in 30 minutes</span>
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
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Reset Password</h2>
              <p className="text-gray-600 dark:text-slate-400 mt-2">
                {emailSent 
                  ? 'Check your email for instructions'
                  : 'Enter your email to receive a reset link'
                }
              </p>
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

            {/* Success Alert */}
            {success && (
              <div className="mb-4 p-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg flex items-start animate-fade-in">
                <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-green-700 dark:text-green-300 text-xs font-medium">{success}</p>
                </div>
                <button onClick={() => setSuccess('')} className="text-green-500 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {!emailSent ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Email Input */}
                <div className="space-y-1">
                  <label htmlFor="email" className="block text-xs font-semibold text-gray-700 dark:text-slate-200">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      className={`w-full border-2 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-500 ${
                        fieldError
                          ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={handleEmailBlur}
                      disabled={loading}
                    />
                  </div>
                  {fieldError && (
                    <p className="text-red-500 dark:text-red-400 text-xs flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {fieldError}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !email}
                  className={`w-full py-2 px-3 rounded-lg text-sm font-semibold text-white transition-all flex items-center justify-center space-x-2 ${
                    loading || !email
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Reset Link</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                {/* Email Sent State */}
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <p className="text-gray-700 dark:text-slate-300 text-xs mb-1">
                    We've sent an email to:
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-slate-100 text-sm">{email}</p>
                </div>

                <div className="text-center text-xs text-gray-600 dark:text-slate-400">
                  <p>Didn't receive the email?</p>
                  <button
                    onClick={handleResendEmail}
                    disabled={loading}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium mt-1 disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Click to resend'}
                  </button>
                </div>

                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-2 px-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Return to Login
                </button>
              </div>
            )}

            {/* Help Text */}
            <div className="mt-4 text-center text-xs text-gray-500 dark:text-slate-400">
              Remember your password?{' '}
              <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
