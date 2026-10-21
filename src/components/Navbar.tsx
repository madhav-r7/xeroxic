import React from 'react';
import { User } from '../types';
import { XeroxicLogo } from './XeroxicLogo';
import { LogOut, UserCheck, Shield } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenSignIn: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  onTabChange,
  onOpenSignIn,
  onLogout,
}) => {
  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'upload', label: 'Upload & Print' },
    { id: 'rates', label: 'Rate Card' },
    { id: 'track', label: 'Track Orders' },
    ...(isAdmin ? [{ id: 'queue', label: 'Operator Queue' }] : []),
  ];

  return (
    <header className="bg-paper-white/95 backdrop-blur-md sticky top-0 z-40 select-none shadow-[0_1px_8px_rgba(22,15,12,0.04)] border-b border-bone/60">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand & Status */}
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => onTabChange('home')}
            >
              <XeroxicLogo size="md" />
              <span className="font-semibold text-lg tracking-tight text-espresso hidden sm:block">Xeroxic</span>
            </div>
            {/* Live status pill */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-bone/60">
              <span className="w-1.5 h-1.5 rounded-full bg-status-ready inline-block"></span>
              <span className="text-xs font-medium text-on-surface">Counter 1 & 2 Active</span>
            </div>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-espresso text-paper-white'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-bone/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right: User & CTA */}
          <div className="flex items-center gap-3">
            {/* New Print Job CTA */}
            <button
              onClick={() => onTabChange('upload')}
              className="hidden sm:inline-flex items-center justify-center bg-espresso hover:bg-espresso/90 text-paper-white text-sm font-medium px-4 py-2 rounded-full transition-colors shadow-sm"
            >
              New Print Job
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                {/* User pill */}
                <div className="flex items-center gap-2 bg-bone/60 px-3 py-1.5 rounded-full">
                  <div className="w-7 h-7 rounded-full bg-espresso text-paper-white flex items-center justify-center text-xs font-semibold">
                    {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="hidden md:flex flex-col pr-0.5">
                    <span className="text-xs font-semibold text-espresso leading-tight flex items-center gap-1">
                      {user.name.split(' ')[0]}
                      {isStudent ? (
                        <UserCheck className="w-3 h-3 text-status-ready" />
                      ) : (
                        <Shield className="w-3 h-3 text-warm-ash" />
                      )}
                    </span>
                    <span className="text-[10px] text-warm-ash leading-tight">
                      {isStudent ? user.studentId : 'Operator'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="p-2 text-warm-ash hover:text-status-queued hover:bg-bone rounded-full transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenSignIn}
                  className="text-sm font-medium text-on-surface-variant hover:text-on-surface px-3 py-1.5 rounded-full hover:bg-bone/60 transition-colors"
                >
                  Sign in
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile subnav */}
        <div className="lg:hidden flex overflow-x-auto pb-2 gap-1.5 pt-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
                activeTab === item.id ? 'bg-espresso text-paper-white' : 'text-on-surface-variant bg-bone/60 hover:bg-bone'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
