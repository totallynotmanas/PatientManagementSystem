import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateAccount() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleSignUp = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation
    if (!name.trim() || !email || !phone || !password || !confirmPassword) {
      setError('Please complete all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Very basic phone check (10 digits after removing non-digits)
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    // TODO: Later → send to backend API
    console.log('Patient registration attempt:', { name, email, phone });

    setSuccess('Account created successfully! Redirecting to sign in...');
    setTimeout(() => {
      navigate('/');
    }, 2200);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Left Panel - Completely new design */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white p-12 flex-col justify-between">
        <div>
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Your Health,<br />Your Control
          </h1>
          <p className="text-xl opacity-90 max-w-lg leading-relaxed">
            Join a secure, patient-centered platform that puts you at the center of your care — with full visibility, privacy controls, and direct access to your healthcare team.
          </p>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-2">🔒</div>
              <h3 className="font-semibold text-lg">Bank-grade Security</h3>
              <p className="text-sm opacity-80 mt-1">End-to-end encryption & HIPAA compliant</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-2">📱</div>
              <h3 className="font-semibold text-lg">Always Connected</h3>
              <p className="text-sm opacity-80 mt-1">Access records & communicate 24/7</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <p className="text-sm opacity-90 italic">
              “Your medical data belongs to you. We only facilitate secure, consented access.”
            </p>
            <p className="text-xs mt-3 opacity-70">— Our Privacy Promise</p>
          </div>
        </div>

        <div className="text-sm opacity-70">
          © 2026 SecureCare Platform • All rights reserved
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Create Your Patient Account</h2>
            <p className="mt-3 text-gray-600">
              Get started with secure access to your health records and care team
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                Mobile Number
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                required
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3.5 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 shadow-sm"
            >
              Create Account
            </button>

            <div className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <button
                type="button"
                className="font-medium text-blue-600 hover:text-blue-500 transition"
                onClick={() => navigate('/')}
              >
                Sign in
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 mt-8">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-gray-500 underline hover:text-gray-700">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-gray-500 underline hover:text-gray-700">
                Privacy Policy
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}