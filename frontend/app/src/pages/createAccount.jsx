import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Lock, Calendar, MapPin, FileText, Stethoscope, Briefcase } from 'lucide-react';

export default function CreateAccount() {
  const [role, setRole] = useState('PATIENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Common Profile Fields
  const [fullName, setFullName] = useState('');

  // Patient Specific
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');

  // Doctor Specific
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialization, setSpecialization] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic Validation
    if (!email || !password || !confirmPassword || !fullName) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 12) {
      setError('Password must be at least 12 characters');
      return;
    }

    // Role Specific Validation
    if (role === 'PATIENT') {
      if (!dob) {
        setError('Date of Birth is required for patients');
        return;
      }
    } else if (role === 'DOCTOR') {
      if (!licenseNumber) {
        setError('License Number is required for doctors');
        return;
      }
    }

    setLoading(true);
    try {
      // Construct payload matching schema requirements (using snake_case for backend)
      const userData = {
        role,
        full_name: fullName,
        ...(role === 'PATIENT' && { date_of_birth: dob, address }),
        ...(role === 'DOCTOR' && { license_number: licenseNumber, specialization }),
        // Add other roles if needed, default allows generic creation
      };

      const result = await signup(email, password, userData);

      if (result.success) {
        setSuccess('Account created successfully! Redirecting to sign in...');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Animated Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20 dark:border-slate-700/50">

            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:col-span-2 bg-gradient-to-br from-blue-600 to-purple-700 p-8 flex-col justify-between text-white relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                <div>
                  <h1 className="text-3xl font-bold leading-tight">Join Our <br />Platform</h1>
                  <p className="mt-2 text-blue-100 text-sm">Create an account to manage your health or practice.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                      <User className="w-5 h-5 text-blue-200" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Personalized Profiles</p>
                      <p className="text-xs text-blue-200">Tailored to your role</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                      <Lock className="w-5 h-5 text-blue-200" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Secure Data</p>
                      <p className="text-xs text-blue-200">Encryption & Compliance</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 text-xs text-blue-200">
                © 2026 Healthcare Management System
              </div>

              {/* Decorative Circles */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl"></div>
            </div>

            {/* Right Panel - Form */}
            <div className="lg:col-span-3 p-8 overflow-y-auto max-h-[90vh]">
              <div className="max-w-md mx-auto space-y-6">

                <div className="space-y-1 text-center lg:text-left">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Create Account</h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Fill in your details to register</p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">

                  {/* Role Selection */}
                  <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 dark:bg-slate-700/50 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setRole('PATIENT')}
                      className={`py-2 px-4 rounded-md text-xs font-semibold transition-all ${role === 'PATIENT'
                        ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                        }`}
                    >
                      Patient
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('DOCTOR')}
                      className={`py-2 px-4 rounded-md text-xs font-semibold transition-all ${role === 'DOCTOR'
                        ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
                        }`}
                    >
                      Doctor / Staff
                    </button>
                  </div>

                  {/* Additional Role Select for Staff (if Doctor tab selected) */}
                  {role !== 'PATIENT' && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700 dark:text-slate-200">Staff Role</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="DOCTOR">Doctor</option>
                        <option value="NURSE">Nurse</option>
                        <option value="LAB_TECH">Lab Technician</option>
                        <option value="ADMIN">Administrator</option>
                      </select>
                    </div>
                  )}

                  {/* Common Fields */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700 dark:text-slate-200">Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          required
                          className="w-full border border-gray-300 dark:border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="John Doe"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700 dark:text-slate-200">Email Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          required
                          className="w-full border border-gray-300 dark:border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Conditional Patient Fields */}
                    {role === 'PATIENT' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-in">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-700 dark:text-slate-200">Date of Birth</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Calendar className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              type="date"
                              required
                              className="w-full border border-gray-300 dark:border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                              value={dob}
                              onChange={(e) => setDob(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-700 dark:text-slate-200">City/Address</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <MapPin className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              className="w-full border border-gray-300 dark:border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                              placeholder="New York, NY"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Conditional Doctor Fields */}
                    {role === 'DOCTOR' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-in">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-700 dark:text-slate-200">License Number</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FileText className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              required
                              className="w-full border border-gray-300 dark:border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                              placeholder="LIC-12345"
                              value={licenseNumber}
                              onChange={(e) => setLicenseNumber(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-700 dark:text-slate-200">Specialization</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Stethoscope className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              className="w-full border border-gray-300 dark:border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                              placeholder="Cardiology"
                              value={specialization}
                              onChange={(e) => setSpecialization(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Other Role Fields (Optional placeholders) */}
                    {(role === 'NURSE' || role === 'EXT_TECH') && (
                      <div className="space-y-1 animate-fade-in">
                        <label className="text-xs font-semibold text-gray-700 dark:text-slate-200">Department / Unit</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Briefcase className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            className="w-full border border-gray-300 dark:border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. ICU, Lab A"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700 dark:text-slate-200">Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          required
                          className="w-full border border-gray-300 dark:border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Min 12 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-700 dark:text-slate-200">Confirm Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          required
                          className="w-full border border-gray-300 dark:border-slate-600 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Re-enter password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>

                  </div>

                  {/* Feedback Messages */}
                  {error && (
                    <div className="text-xs bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-center font-medium animate-pulse">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="text-xs bg-green-50 text-green-600 p-3 rounded-lg border border-green-200 text-center font-medium">
                      {success}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-lg text-sm font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating Account...
                      </span>
                    ) : 'Create Account'}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => navigate('/')}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Already have an account? Sign In
                    </button>
                  </div>

                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
