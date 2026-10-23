import React, { useState, useEffect } from 'react';
import { User } from '../types';
import {
  verifyStudentLogin,
  verifyAdminLogin,
  registerStudentAccount,
  getRememberedLogin,
  saveRememberedLogin,
  ADMIN_CREDENTIALS,
  getRegisteredAccounts
} from '../services/storage';
import { ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { VanJourneyBackground } from './VanJourneyBackground';
import { ThemeToggle } from './ThemeToggle';

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
  const [successMessage, setSuccessMessage] = useState('');

  // Sign Up state
  const [signupName, setSignupName] = useState('');
  const [signupRoll, setSignupRoll] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupDepartment, setSignupDepartment] = useState('Computer Science & Engineering');

  // Load remembered credentials on mount
  useEffect(() => {
    const remembered = getRememberedLogin();
    if (remembered && remembered.identifier) {
      setUsernameOrEmail(remembered.identifier);
      if (remembered.isAdmin) {
        setIsAdminMode(true);
      }
    }
  }, []);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const input = usernameOrEmail.trim();
    if (!input) {
      setErrorMessage(
        isAdminMode
          ? 'Please enter admin username or email.'
          : 'Please enter your roll number or college email.'
      );
      return;
    }

    if (isAdminMode) {
      const lower = input.toLowerCase();
      if (lower !== 'admin' && lower !== 'admin@college.edu' && lower !== 'admin@xeroxic.edu') {
        setErrorMessage('Invalid admin username. Please enter "admin".');
        return;
      }
      setStep('password');
      return;
    }

    // Student: Verify that the account actually exists in registered accounts!
    const accounts = getRegisteredAccounts();
    const cleanId = input.toLowerCase();
    const exists = accounts.some(
      (a) =>
        a.rollNumber.toLowerCase() === cleanId ||
        a.email.toLowerCase() === cleanId
    );

    if (!exists) {
      setErrorMessage(
        `No registered account found for "${input}". You must create an account in the "Sign Up" tab first.`
      );
      return;
    }

    setStep('password');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (isAdminMode) {
      const res = verifyAdminLogin(usernameOrEmail, password);
      if (!res.success) {
        setErrorMessage(res.message || 'Incorrect admin password.');
        return;
      }
      saveRememberedLogin(usernameOrEmail.trim(), true);
      if (res.user) onLogin(res.user);
    } else {
      const res = verifyStudentLogin(usernameOrEmail, password);
      if (!res.success) {
        setErrorMessage(res.message || 'Incorrect password.');
        return;
      }
      saveRememberedLogin(usernameOrEmail.trim().toUpperCase(), false);
      if (res.user) onLogin(res.user);
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!signupName.trim() || !signupRoll.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (signupPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    const res = registerStudentAccount({
      name: signupName.trim(),
      rollNumber: signupRoll.trim(),
      email: signupEmail.trim(),
      phone: signupPhone.trim(),
      department: signupDepartment.trim(),
      password: signupPassword.trim(),
    });

    if (!res.success) {
      setErrorMessage(res.message || 'Could not register account.');
      return;
    }

    // Account created successfully! Save remembered roll number and log in directly
    saveRememberedLogin(signupRoll.trim().toUpperCase(), false);

    const newUser: User = {
      id: res.account!.id,
      name: res.account!.name,
      email: res.account!.email,
      role: 'student',
      studentId: res.account!.rollNumber,
      department: res.account!.department,
      phone: res.account!.phone,
      balance: 350,
    };

    onLogin(newUser);
  };

  return (
    <div className="min-h-screen bg-linen dark:bg-[#0c0d10] text-aubergine-ink dark:text-[#f4f4f6] flex flex-col justify-center items-center py-10 px-4 select-none relative overflow-hidden transition-colors duration-300">
      {/* Ambient Gradient Glow Backdrop Layer */}
      <div className="ambient-glow-layer fixed inset-0 pointer-events-none -z-10 transition-all duration-500 ease-out" />

      {/* Background 2D Monochrome Van Driving Animation */}
      <VanJourneyBackground hideControls />

      {/* Top Right Corner Dark Mode Option */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle showLabel />
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-[460px] bg-paper-white dark:bg-[#16181d] rounded-[20px] shadow-elevated ring-1 ring-black/[0.06] dark:ring-white/10 border border-bone dark:border-white/10 p-8 sm:p-10 text-left my-auto transition-colors duration-300">
        {/* Top-left back arrow inside the card */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Back to Home"
            title="Back to Home"
            className="absolute top-5 left-5 p-2 text-warm-ash hover:text-aubergine-ink hover:bg-bone rounded-full transition-colors"
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
              className="h-10 w-auto object-contain dark:mix-blend-screen dark:invert dark:brightness-200 transition-all"
            />
          </div>

          <h1 className="text-2xl font-semibold text-aubergine-ink tracking-tight mt-6">
            {isAdminMode
              ? 'Admin Login'
              : authMode === 'signup'
              ? 'Create Student Account'
              : 'Sign in to Xeroxic'}
          </h1>
          <p className="text-xs text-warm-ash mt-1">
            {isAdminMode
              ? 'Access Xerox operator print desk & live queue'
              : authMode === 'signup'
              ? 'Register once with your college roll number to upload assignments'
              : 'Enter your registered roll number or email'}
          </p>
        </div>

        {/* Auth Mode Toggle Tabs (Sign In vs Sign Up) */}
        {!isAdminMode && (
          <div className="flex border-b border-bone mt-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setStep('username');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 pb-2.5 text-xs font-semibold text-center transition-colors border-b-2 ${
                authMode === 'signin'
                  ? 'border-espresso text-espresso'
                  : 'border-transparent text-warm-ash hover:text-aubergine-ink'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 pb-2.5 text-xs font-semibold text-center transition-colors border-b-2 ${
                authMode === 'signup'
                  ? 'border-espresso text-espresso'
                  : 'border-transparent text-warm-ash hover:text-aubergine-ink'
              }`}
            >
              Sign Up (Register First)
            </button>
          </div>
        )}

        {/* Error / Success Feedback */}
        {errorMessage && (
          <div className="mt-4 p-3 text-xs bg-status-queued/10 text-status-queued rounded-[12px] font-medium flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-3 text-xs bg-status-ready/10 text-status-ready rounded-[12px] font-medium flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form: Sign In Flow */}
        {authMode === 'signin' || isAdminMode ? (
          step === 'username' ? (
            <form onSubmit={handleNext} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-aubergine-ink mb-1.5">
                  {isAdminMode ? 'Admin Username or Email' : 'Roll Number or College Email'}
                </label>
                <input
                  type="text"
                  autoFocus
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder={
                    isAdminMode
                      ? 'admin'
                      : 'e.g. 2024CS1092 or student@college.edu'
                  }
                  className="w-full px-3.5 py-2.5 text-sm border border-outline/30 rounded-[12px] focus:ring-2 focus:ring-espresso focus:outline-none transition-colors"
                />
              </div>

              {/* Toggle Admin / Student login on the right */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-stone">
                  {isAdminMode ? 'Operator Portal' : 'Student Access'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const nextMode = !isAdminMode;
                    setIsAdminMode(nextMode);
                    setUsernameOrEmail(nextMode ? 'admin' : '');
                    setStep('username');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-xs text-espresso hover:underline font-semibold"
                >
                  {isAdminMode ? '← Back to Student Login' : 'Admin Login →'}
                </button>
              </div>

              {/* Preset credentials note */}
              <div className="p-2.5 bg-linen dark:bg-[#20232a] border border-bone dark:border-white/10 rounded-[12px] text-[11px] text-stone dark:text-[#a1a1aa] space-y-1">
                {isAdminMode ? (
                  <div className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-espresso shrink-0" />
                    <span>
                      Fixed Admin: ID: <strong className="text-aubergine-ink">admin</strong> | Password: <strong className="text-aubergine-ink">admin@123</strong>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span>
                      Demo Student: <strong className="text-aubergine-ink">2024CS1092</strong> (Pass: <strong className="text-aubergine-ink">student123</strong>)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setErrorMessage('');
                      }}
                      className="text-espresso hover:underline font-semibold"
                    >
                      New user? Sign Up
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-espresso hover:bg-espresso/90 active:bg-espresso/80 text-paper-white py-2.5 px-4 rounded-full font-medium text-sm transition-colors flex items-center justify-center space-x-2 shadow-sm"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-aubergine-ink">
                    Enter Password for <span className="font-semibold text-aubergine-ink">{usernameOrEmail}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('username');
                      setPassword('');
                      setErrorMessage('');
                    }}
                    className="text-xs text-espresso hover:underline"
                  >
                    Change ID
                  </button>
                </div>
                <input
                  type="password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 text-sm border border-outline/30 rounded-[12px] focus:ring-2 focus:ring-espresso focus:outline-none transition-colors"
                />
              </div>

              {isAdminMode && (
                <div className="text-[11px] text-stone">
                  Admin Password: <code className="font-mono font-semibold bg-bone px-1 py-0.5 rounded">admin@123</code>
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-2 bg-espresso hover:bg-espresso/90 text-paper-white py-2.5 px-4 rounded-full font-medium text-sm transition-colors shadow-sm flex items-center justify-center space-x-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Sign in as {isAdminMode ? 'Admin Operator' : 'Student'}</span>
              </button>
            </form>
          )
        ) : (
          /* Form: Sign Up Flow */
          <form onSubmit={handleSignUpSubmit} className="mt-5 space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-aubergine-ink mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="e.g. Sumit Jangra"
                className="w-full px-3.5 py-2 text-sm border border-outline/30 rounded-[12px] focus:ring-2 focus:ring-espresso focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-aubergine-ink mb-1">
                  Roll Number *
                </label>
                <input
                  type="text"
                  required
                  value={signupRoll}
                  onChange={(e) => setSignupRoll(e.target.value)}
                  placeholder="e.g. 250222"
                  className="w-full px-3 py-2 text-sm border border-outline/30 rounded-[12px] focus:ring-2 focus:ring-espresso focus:outline-none transition-colors uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-aubergine-ink mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 text-sm border border-outline/30 rounded-[12px] focus:ring-2 focus:ring-espresso focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-aubergine-ink mb-1">
                College Email *
              </label>
              <input
                type="email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full px-3.5 py-2 text-sm border border-outline/30 rounded-[12px] focus:ring-2 focus:ring-espresso focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-aubergine-ink mb-1">
                Department
              </label>
              <input
                type="text"
                value={signupDepartment}
                onChange={(e) => setSignupDepartment(e.target.value)}
                placeholder="Computer Science & Engineering"
                className="w-full px-3.5 py-2 text-sm border border-outline/30 rounded-[12px] focus:ring-2 focus:ring-espresso focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-aubergine-ink mb-1">
                Create Password *
              </label>
              <input
                type="password"
                required
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                placeholder="Choose a password (min 4 characters)"
                className="w-full px-3.5 py-2 text-sm border border-outline/30 rounded-[12px] focus:ring-2 focus:ring-espresso focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-3 bg-espresso hover:bg-espresso/90 active:bg-espresso/80 text-paper-white py-2.5 px-4 rounded-full font-medium text-sm transition-colors shadow-sm flex items-center justify-center space-x-2"
            >
              <span>Create Account & Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Footer links */}
        <div className="flex items-center justify-center space-x-6 text-xs text-stone mt-8 pt-4 border-t border-bone">
          <span className="hover:underline cursor-pointer">Help Desk</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">Xerox Counter</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">Shopping Complex</span>
        </div>
      </div>

      <div className="relative z-10 text-xs text-warm-ash py-2 flex flex-col items-center space-y-1">
        <span className="font-semibold text-aubergine-ink">Xeroxic • ait xerox shop</span>
        <span>Operating: 8:30 AM – 4:00 PM (Mon–Sat)</span>
      </div>
    </div>
  );
};
