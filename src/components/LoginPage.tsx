import React, { useState } from 'react';
import { User } from '../types';
import { DEMO_STUDENT, DEMO_ADMIN } from '../services/storage';
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
      setErrorMessage(isAdminMode ? 'Please enter admin username or email.' : 'Please enter your roll number or email.');
      return;
    }

    if (input === 'admin' || input.includes('admin')) {
      setIsAdminMode(true);
      setStep('password');
      return;
    }

    setStep('password');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdminMode) {
      onLogin(DEMO_ADMIN);
    } else {
      const trimmed = usernameOrEmail.trim();
      const studentUser: User = {
        id: 'student-' + Date.now(),
        name: trimmed.includes('@') ? trimmed.split('@')[0] : (trimmed || DEMO_STUDENT.name),
        role: 'student',
        studentId: trimmed.toUpperCase() || DEMO_STUDENT.studentId,
        department: DEMO_STUDENT.department,
        email: trimmed.includes('@') ? trimmed : `${trimmed.toLowerCase() || 'student'}@college.edu`,
      };
      onLogin(studentUser);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6fa] flex flex-col justify-center items-center py-10 px-4 font-segoe select-none">
      {/* Main Card */}
      <div className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#e5e7eb] p-8 sm:p-10 text-left my-auto">
        {/* Top-left arrow inside the card */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Back to Home"
            title="Back to Home"
            className="absolute top-5 left-5 p-2 text-[#605e5c] hover:text-[#242424] hover:bg-[#f3f4f6] rounded-full transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        {/* Brand Header with Xeroxic Logo */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center">
            <img
              src="/xeroxic-logo-cropped.png"
              alt="Xeroxic Logo"
              className="h-10 w-auto object-contain"
            />
          </div>

          <h1 className="text-2xl font-semibold text-[#111827] tracking-tight mt-6">
            {isAdminMode ? 'Admin login' : 'Sign in'}
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
                placeholder={isAdminMode ? 'Enter admin username or email' : 'Enter your roll number or email'}
                className="w-full px-3.5 py-2.5 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:border-[#0062e0] focus:ring-1 focus:ring-[#0062e0] transition-colors"
              />
            </div>

            {/* Admin login aligned to the right */}
            <div className="flex items-center justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsAdminMode(!isAdminMode);
                  setUsernameOrEmail('');
                  setErrorMessage('');
                }}
                className="text-xs text-[#0062e0] hover:underline font-medium"
              >
                {isAdminMode ? 'Student login' : 'Admin login'}
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

        {/* Footer links matching Image 1 */}
        <div className="flex items-center justify-center space-x-6 text-xs text-[#6b7280] mt-8">
          <span className="hover:underline cursor-pointer">Help</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">Privacy</span>
        </div>
      </div>
    </div>
  );
};
