import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!email || !password) {
      setError('Please enter email and password');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Attempt login
    const result = await login(email, password);
    
    if (result.success) {
      // Login successful - redirect to dashboard
      navigate('/dashboard');
    } else {
      // Login failed - show error
      setError(result.error || 'Login failed. Please check your credentials and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen rounded-lg shadow-lg overflow-hidden font-sans">
      {/* Left Blue Panel */}
      <div className="flex-1 bg-gradient-to-br from-blue-600 to-blue-400 p-12 text-white flex flex-col justify-center space-y-8">
        <h2 className="text-4xl font-extrabold leading-tight">Expert Specialists at Your Service</h2>
        <p className="max-w-md">
          Our team of dedicated healthcare professionals brings years of experience and compassionate care to every patient interaction.
        </p>
        <div className="flex space-x-6">
          <div className="bg-blue-500 p-5 rounded-lg shadow-lg w-40">
            <p className="font-bold text-lg">5000+ Doctors</p>
            <p className="text-sm">Verified healthcare professionals</p>
          </div>
          <div className="bg-blue-500 p-5 rounded-lg shadow-lg w-40">
            <p className="font-bold text-lg">24/7 Care</p>
            <p className="text-sm">Always available for you</p>
          </div>
        </div>
      </div>

      {/* Right White Panel */}
      <div className="flex-1 bg-white p-12 flex flex-col justify-center rounded-r-lg shadow-xl">
        <div className="max-w-md mx-auto w-full">
          <h2 className="text-3xl font-bold mb-2 text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mb-8">Sign in to access your account</p>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-semibold text-gray-700">Email Address</label>
              <input
                type="email"
                id="email"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-semibold text-gray-700">Password</label>
              <input
                type="password"
                id="password"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
              </div>
            </div>
            
            <button
              type="button"
              className="w-full bg-blue-50 text-blue-600 py-3 rounded-lg font-semibold border-2 border-blue-200 hover:bg-blue-100 transition duration-200"
              onClick={() => navigate('/create')}
            >
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}