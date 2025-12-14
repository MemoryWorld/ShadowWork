'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createMockSession, isValidEmail } from '@/lib/mockAuth';

/**
 * Mock Login Page
 * 
 * Simple email-only login for MVP demo
 * No password required - perfect for showcasing the platform
 */

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEnterprise, setIsEnterprise] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Create mock session
    setIsLoading(true);
    
    // Simulate API delay for realism
    setTimeout(() => {
      createMockSession(email);
      if (typeof window !== 'undefined') {
        if (isEnterprise) {
          localStorage.setItem('shadowwork_role', 'enterprise');
        } else {
          localStorage.removeItem('shadowwork_role');
        }
      }
      
      // Redirect to home page
      router.push('/');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl"></div>
            <span className="text-2xl font-bold text-gray-900">ShadowWork</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Enter your email to continue your coding journey
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                disabled={isLoading}
              />
              {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span> {error}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enterprise"
                checked={isEnterprise}
                onChange={(e) => setIsEnterprise(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="enterprise" className="text-sm text-gray-700">
                Sign in as enterprise (demo)
              </label>
            </div>

            {/* Demo Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Demo Mode:</strong> No password needed! Just enter any email to continue.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚪</span>
                  Signing in...
                </span>
              ) : (
                'Continue'
              )}
            </button>
          </form>

          {/* Alternative Actions */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to Home
            </button>
          </div>
        </div>

        {/* Quick Start Tips */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Try: demo@shadowwork.dev</p>
        </div>
      </div>
    </div>
  );
}
