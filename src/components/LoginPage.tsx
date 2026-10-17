import React, { useState } from 'react';
import { User } from '../types';
import { DEMO_STUDENT, DEMO_ADMIN } from '../services/storage';
import { XeroxicLogo } from './XeroxicLogo';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onCancel?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onCancel }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [step, setStep] = useState<'username' | 'password'>('username');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const input = usernameOrEmail.trim().toLowerCase();
    if (!input) {
      setErrorMessage('Please enter your username or email address.');
      return;
    }

    // Direct match or prompt password
    if (input === 'admin' || input === 'admin@college.edu') {
      setIsAdminMode(true);
      setStep('password');
      return;
    }

    if (input === 'student' || input === 'student@college.edu' || input.includes('2024') || input.includes('@')) {
      setIsAdminMode(false);
      setStep('password');
      return;
    }

    // Default to student if valid string
    setStep('password');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdminMode) {
      onLogin(DEMO_ADMIN);
    } else {
      onLogin(DEMO_STUDENT);
    }
  };

  const handleQuickLogin = (role: 'student' | 'admin') => {
    if (role === 'student') {
      onLogin(DEMO_STUDENT);
    } else {
      onLogin(DEMO_ADMIN);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6fa] flex flex-col justify-between items-center py-10 px-4 font-segoe select-none">
      {/* Top back navigation if available */}
      <div className="w-full max-w-[440px] flex justify-start">
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs text-[#605e5c] hover:text-[#242424] flex items-center space-x-1.5 py-1 px-2 rounded hover:bg-white/60 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
        )}
      </div>

      {/* Main Card exactly matching Image 1 */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#e5e7eb] p-8 sm:p-10 text-left my-auto">
        {/* Brand Header matching Image 1 */}
        <div className="flex flex-col items-center text-center">
          {/* Blue folded document logo + Xeroxic text matching Image 1 */}
          <div className="flex items-center space-x-2.5">
            <svg
              className="w-8 h-8 text-[#0062e0]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
            </svg>
            <span className="text-2xl font-bold text-[#0062e0] tracking-tight">Xeroxic</span>
          </div>

          <h1 className="text-2xl font-semibold text-[#111827] tracking-tight mt-6">
            {isAdminMode ? 'Admin sign-in' : 'Sign in'}
          </h1>
          <p className="text-xs text-[#6b7280] mt-1">
            {isAdminMode ? 'Access the central printing desk' : 'Access your campus printing portal'}
          </p>
        </div>

        {/* Form */}
        {step === 'username' ? (
          <form onSubmit={handleNext} className="mt-6 space-y-4">
            {errorMessage && (
              <div className="p-2.5 text-xs bg-[#fed9cc] text-[#d83b01] rounded-md">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">
                {isAdminMode ? 'Admin username or email' : 'Username or email'}
              </label>
              <input
                type="text"
                autoFocus
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="Enter your username or email"
                className="w-full px-3.5 py-2.5 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:border-[#0062e0] focus:ring-1 focus:ring-[#0062e0] transition-colors"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsAdminMode(!isAdminMode);
                  setUsernameOrEmail(isAdminMode ? 'student@college.edu' : 'admin@college.edu');
                  setErrorMessage('');
                }}
                className="text-xs text-[#0062e0] hover:underline font-medium"
              >
                {isAdminMode ? 'Student sign-in' : 'Admin sign-in'}
              </button>
            </div>

            <button
              type="submit"
              className="w-full mt-3 bg-[#0062e0] hover:bg-[#0052be] active:bg-[#004299] text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-2 shadow-sm"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[#374151]">
                  Enter password
                </label>
                <button
                  type="button"
                  onClick={() => setStep('username')}
                  className="text-xs text-[#0062e0] hover:underline"
                >
                  Change
                </button>
              </div>
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-3.5 py-2.5 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:border-[#0062e0] focus:ring-1 focus:ring-[#0062e0] transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-3 bg-[#0062e0] hover:bg-[#0052be] text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              Sign in as {isAdminMode ? 'Admin' : 'Student'}
            </button>
          </form>
        )}

        {/* 1-Click Quick Demo Shortcuts for instant access */}
        <div className="mt-8 pt-5 border-t border-[#f3f4f6]">
          <div className="text-[11px] uppercase tracking-wider text-center text-[#9ca3af] mb-2.5 font-medium">
            Demo quick login
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('student')}
              className="text-xs py-2 px-2 bg-[#f3f6fa] hover:bg-[#e6edf5] text-[#242424] font-medium rounded-lg border border-[#e5e7eb] transition-colors text-center"
            >
              Student Portal
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="text-xs py-2 px-2 bg-[#f3f6fa] hover:bg-[#e6edf5] text-[#242424] font-medium rounded-lg border border-[#e5e7eb] transition-colors text-center"
            >
              Admin Desk
            </button>
          </div>
        </div>

        {/* Footer links matching Image 1 */}
        <div className="flex items-center justify-center space-x-6 text-xs text-[#6b7280] mt-8">
          <span className="hover:underline cursor-pointer">Help</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">Privacy</span>
        </div>
      </div>

      <div className="text-xs text-[#9ca3af] py-2">
        Xeroxic • College Xerox & Document Station
      </div>
    </div>
  );
};
