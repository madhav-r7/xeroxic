import React, { useState } from 'react';
import { User } from '../types';
import { DEMO_STUDENT, DEMO_ADMIN } from '../services/storage';
import { XeroxicLogo } from './XeroxicLogo';
import { UserCheck, Shield, KeyRound, Mail, ArrowRight, CheckCircle2, Info } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<'student' | 'admin'>('student');
  const [email, setEmail] = useState('student@college.edu');
  const [password, setPassword] = useState('password123');
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRoleSelect = (role: 'student' | 'admin') => {
    setSelectedRole(role);
    setErrorMessage('');
    if (role === 'student') {
      setEmail('student@college.edu');
      setPassword('password123');
    } else {
      setEmail('admin@college.edu');
      setPassword('adminpassword');
    }
  };

  const handleQuickLogin = (role: 'student' | 'admin') => {
    if (role === 'student') {
      onLogin(DEMO_STUDENT);
    } else {
      onLogin(DEMO_ADMIN);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === 'student@college.edu' || cleanEmail === 'student') {
      onLogin(DEMO_STUDENT);
    } else if (cleanEmail === 'admin@college.edu' || cleanEmail === 'admin') {
      onLogin(DEMO_ADMIN);
    } else {
      setErrorMessage('Please use one of the two accounts configured below.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f2f1] flex flex-col justify-between text-[#242424] font-segoe">
      {/* Top Header */}
      <div className="bg-white border-b border-[#e1dfdd] py-2 px-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <XeroxicLogo size="sm" />
            <div className="h-4 w-[1px] bg-[#d2d0ce]" />
            <span className="font-semibold text-xs tracking-wide text-[#242424]">COLLEGE XEROX STATION</span>
          </div>
          <span className="text-xs text-[#605e5c] hidden sm:inline">Library Ground Floor • Counter 1 & 2</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[480px]">
          {/* Main Card */}
          <div className="bg-white border border-[#e1dfdd] shadow-[0_4px_16px_rgba(0,0,0,0.08)] p-8 sm:p-10 rounded-[2px]">
            {/* Xeroxic Logo & Title */}
            <div className="mb-6 text-center sm:text-left">
              <div className="mb-3 flex justify-center sm:justify-start">
                <XeroxicLogo size="lg" />
              </div>
              <h1 className="text-2xl font-semibold text-[#242424] tracking-tight">Sign in</h1>
              <p className="text-xs text-[#605e5c] mt-1">
                Choose your account to enter the college printing portal
              </p>
            </div>

            {/* Two Account Selector Cards (Student & Admin) */}
            <div className="space-y-3 mb-6">
              <div className="text-xs font-semibold text-[#605e5c] uppercase tracking-wider">
                Select account type
              </div>

              {/* Student Account Card */}
              <div
                onClick={() => handleRoleSelect('student')}
                className={`p-3.5 rounded-[4px] border cursor-pointer transition-all flex items-start justify-between ${
                  selectedRole === 'student'
                    ? 'border-[#0067b8] bg-[#e6f2fb]/50 shadow-sm'
                    : 'border-[#edebe9] hover:border-[#a19f9d] bg-white'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-full bg-[#0067b8] text-white flex items-center justify-center shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-sm font-semibold text-[#242424]">Student Account</span>
                      <span className="text-[10px] bg-[#107c10]/10 text-[#107c10] font-semibold px-1.5 py-0.5 rounded">
                        Assignments
                      </span>
                    </div>
                    <div className="text-xs text-[#605e5c] mt-0.5">student@college.edu</div>
                    <div className="text-[11px] text-[#797775]">Upload assignments and track printing status</div>
                  </div>
                </div>
                {selectedRole === 'student' && (
                  <CheckCircle2 className="w-5 h-5 text-[#0067b8] shrink-0 mt-0.5" />
                )}
              </div>

              {/* Admin Account Card */}
              <div
                onClick={() => handleRoleSelect('admin')}
                className={`p-3.5 rounded-[4px] border cursor-pointer transition-all flex items-start justify-between ${
                  selectedRole === 'admin'
                    ? 'border-[#0067b8] bg-[#e6f2fb]/50 shadow-sm'
                    : 'border-[#edebe9] hover:border-[#a19f9d] bg-white'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-full bg-[#323130] text-white flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-sm font-semibold text-[#242424]">Xerox Admin Desk</span>
                      <span className="text-[10px] bg-[#0067b8]/10 text-[#0067b8] font-semibold px-1.5 py-0.5 rounded">
                        Shop Operator
                      </span>
                    </div>
                    <div className="text-xs text-[#605e5c] mt-0.5">admin@college.edu</div>
                    <div className="text-[11px] text-[#797775]">View print queue, print orders, and mark ready</div>
                  </div>
                </div>
                {selectedRole === 'admin' && (
                  <CheckCircle2 className="w-5 h-5 text-[#0067b8] shrink-0 mt-0.5" />
                )}
              </div>
            </div>

            {/* Credential form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 text-xs bg-[#fed9cc] text-[#d83b01] border border-[#f4b69e] rounded-[3px]">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#242424] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#797775]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm border border-[#8a8886] rounded-[2px] focus:outline-none focus:border-[#0067b8] focus:ring-1 focus:ring-[#0067b8] transition-colors"
                    placeholder="name@college.edu"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#242424] mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#797775]">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm border border-[#8a8886] rounded-[2px] focus:outline-none focus:border-[#0067b8] focus:ring-1 focus:ring-[#0067b8] transition-colors"
                    placeholder="Enter password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 text-[#605e5c] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                    className="rounded border-[#8a8886] text-[#0067b8] focus:ring-[#0067b8]"
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  className="w-full bg-[#0067b8] hover:bg-[#005da6] active:bg-[#004e8c] text-white py-2.5 px-4 rounded-[2px] font-semibold text-sm transition-colors flex items-center justify-center space-x-2 shadow-sm"
                >
                  <span>Sign in as {selectedRole === 'student' ? 'Student' : 'Xerox Admin'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Instant 1-Click login shortcut */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#edebe9]" />
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase tracking-wider text-[#797775]">
                    <span className="bg-white px-2">Instant Demo Login</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('student')}
                    className="text-xs py-2 px-2 bg-[#f3f2f1] hover:bg-[#edebe9] text-[#242424] font-medium border border-[#d2d0ce] rounded-[2px] transition-colors flex items-center justify-center space-x-1"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-[#0067b8]" />
                    <span>Quick Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin')}
                    className="text-xs py-2 px-2 bg-[#f3f2f1] hover:bg-[#edebe9] text-[#242424] font-medium border border-[#d2d0ce] rounded-[2px] transition-colors flex items-center justify-center space-x-1"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#323130]" />
                    <span>Quick Admin</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Note box */}
            <div className="mt-6 pt-4 border-t border-[#edebe9] flex items-start space-x-2 text-[11px] text-[#605e5c]">
              <Info className="w-3.5 h-3.5 text-[#0067b8] shrink-0 mt-0.5" />
              <span>
                Upload your assignment, get your Token ID, and pick up your printed pages from the Xerox shop counter.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e1dfdd] py-3 px-6 text-xs text-[#605e5c]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>Xeroxic • College Xerox & Printing Station</div>
          <div className="flex items-center space-x-5">
            <span>Operating: 8:30 AM – 7:30 PM (Mon–Sat)</span>
            <span>Library Ground Floor</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
