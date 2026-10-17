import React, { useState } from 'react';
import { User } from '../types';
import { DEMO_ADMIN } from '../services/storage';
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onCancel?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onCancel }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Sign In state
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [step, setStep] = useState<'username' | 'password'>('username');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Sign Up state
  const [signupName, setSignupName] = useState('');
  const [signupRoll, setSignupRoll] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const input = usernameOrEmail.trim().toLowerCase();
    if (!input) {
      setErrorMessage(
        isAdminMode
          ? 'Please enter admin username or email.'
          : 'Please enter your roll number or college email.'
      );
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
        id: 'usr-' + Date.now(),
        name: trimmed.includes('@') ? trimmed.split('@')[0] : trimmed,
        role: 'student',
        studentId: trimmed || '250222',
        department: 'College Campus',
        email: trimmed.includes('@') ? trimmed : `${trimmed.toLowerCase()}@college.edu`,
        phone: '+91 98765 43210',
      };
      onLogin(studentUser);
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!signupName.trim() || !signupRoll.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    const newUser: User = {
      id: 'usr-student-' + Date.now(),
      name: signupName.trim(),
      role: 'student',
      studentId: signupRoll.trim().toUpperCase(),
      department: 'Campus Student',
      email: signupEmail.trim(),
      phone: signupPhone.trim() || '+91 98765 43210',
    };

    onLogin(newUser);
  };

  return (
    <div className="min-h-screen bg-[#f3f6fa] flex flex-col justify-center items-center py-10 px-4 font-segoe select-none">
      {/* Main Card */}
      <div className="relative w-full max-w-[440px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#e5e7eb] p-8 sm:p-10 text-left my-auto">
        {/* Top-left back arrow inside the card */}
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
            {isAdminMode
              ? 'Admin login'
              : authMode === 'signup'
              ? 'Create student account'
              : 'Sign in'}
          </h1>
          <p className="text-xs text-[#6b7280] mt-1">
            {isAdminMode
              ? 'Access central xerox operator desk'
              : authMode === 'signup'
              ? 'Register with your college roll number to upload assignments'
              : 'Access your campus printing portal'}
          </p>
        </div>

        {/* Auth Mode Toggle Tabs (Sign In vs Sign Up) */}
        {!isAdminMode && (
          <div className="flex border-b border-[#e5e7eb] mt-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMessage('');
              }}
              className={`flex-1 pb-2.5 text-xs font-semibold text-center transition-colors border-b-2 ${
                authMode === 'signin'
                  ? 'border-[#0062e0] text-[#0062e0]'
                  : 'border-transparent text-[#6b7280] hover:text-[#111827]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMessage('');
              }}
              className={`flex-1 pb-2.5 text-xs font-semibold text-center transition-colors border-b-2 ${
                authMode === 'signup'
                  ? 'border-[#0062e0] text-[#0062e0]'
                  : 'border-transparent text-[#6b7280] hover:text-[#111827]'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-2.5 text-xs bg-[#fed9cc] text-[#d83b01] rounded-md font-medium">
            {errorMessage}
          </div>
        )}

        {/* Form: Sign In Flow */}
        {authMode === 'signin' || isAdminMode ? (
          step === 'username' ? (
            <form onSubmit={handleNext} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1.5">
                  {isAdminMode ? 'Admin username or email' : 'Roll number or email'}
                </label>
                <input
                  type="text"
                  autoFocus
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder={
                    isAdminMode
                      ? 'admin or admin@college.edu'
                      : 'e.g. 250222 or student@college.edu'
                  }
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
                    setStep('username');
                    setErrorMessage('');
                  }}
                  className="text-xs text-[#0062e0] hover:underline font-medium"
                >
                  {isAdminMode ? 'Student login' : 'Admin login'}
                </button>
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-[#0062e0] hover:bg-[#0052be] active:bg-[#004299] text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-2 shadow-sm"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
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
                className="w-full mt-2 bg-[#0062e0] hover:bg-[#0052be] text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors shadow-sm"
              >
                Sign in as {isAdminMode ? 'Admin' : 'Student'}
              </button>
            </form>
          )
        ) : (
          /* Form: Sign Up Flow */
          <form onSubmit={handleSignUpSubmit} className="mt-5 space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="e.g. Sumit Jangra"
                className="w-full px-3.5 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:border-[#0062e0] focus:ring-1 focus:ring-[#0062e0] transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">
                  Roll Number *
                </label>
                <input
                  type="text"
                  required
                  value={signupRoll}
                  onChange={(e) => setSignupRoll(e.target.value)}
                  placeholder="e.g. 250222"
                  className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:border-[#0062e0] focus:ring-1 focus:ring-[#0062e0] transition-colors uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#374151] mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:border-[#0062e0] focus:ring-1 focus:ring-[#0062e0] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">
                College Email *
              </label>
              <input
                type="email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full px-3.5 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:border-[#0062e0] focus:ring-1 focus:ring-[#0062e0] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1">
                Create Password *
              </label>
              <input
                type="password"
                required
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="Choose a password"
                className="w-full px-3.5 py-2 text-sm border border-[#d1d5db] rounded-lg focus:outline-none focus:border-[#0062e0] focus:ring-1 focus:ring-[#0062e0] transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-3 bg-[#0062e0] hover:bg-[#0052be] active:bg-[#004299] text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              Create Account & Sign In
            </button>
          </form>
        )}

        {/* Footer links */}
        <div className="flex items-center justify-center space-x-6 text-xs text-[#6b7280] mt-8 pt-4 border-t border-[#f3f4f6]">
          <span className="hover:underline cursor-pointer">Help</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">Privacy</span>
        </div>
      </div>

      <div className="text-xs text-[#605e5c] py-2 flex flex-col items-center space-y-1">
        <span className="font-semibold text-[#242424]">Xeroxic • ait xerox shop</span>
        <span>Operating: 8:30 AM – 4:00 PM (Mon–Sat)</span>
      </div>
    </div>
  );
};
