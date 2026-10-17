import React from 'react';
import { User } from '../types';
import { XeroxicLogo } from './XeroxicLogo';
import { Printer, UserCheck, Shield, LogOut, ArrowLeftRight, Clock, HelpCircle, FileText } from 'lucide-react';

interface NavbarProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSwitchRole: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  onTabChange,
  onSwitchRole,
  onLogout,
}) => {
  const isStudent = user.role === 'student';

  return (
    <header className="bg-white border-b border-[#e1dfdd] sticky top-0 z-40 select-none shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      {/* Top Banner Bar */}
      <div className="bg-[#004e8c] text-white text-xs px-4 py-1 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="font-semibold tracking-wide">COLLEGE XEROX STATION</span>
          <span className="text-[#a6d8ff]">|</span>
          <span className="text-gray-200">Library Ground Floor • Counter 1 & 2</span>
          <span className="text-[#a6d8ff] hidden sm:inline">|</span>
          <span className="text-emerald-300 hidden sm:inline flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            Shop Open
          </span>
        </div>
        <div className="flex items-center space-x-3 text-xs text-gray-200">
          <span>8:30 AM – 7:30 PM</span>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Brand with Xeroxic Logo */}
          <div className="flex items-center space-x-6">
            <div
              className="flex items-center space-x-2.5 cursor-pointer"
              onClick={() => onTabChange(isStudent ? 'upload' : 'queue')}
            >
              <XeroxicLogo size="md" />
              <div className="h-5 w-[1px] bg-[#d2d0ce]" />
              <span className="text-xs bg-[#e6f2fb] text-[#0067b8] font-medium px-2 py-0.5 rounded-[3px] border border-[#cbe4f9]">
                {isStudent ? 'Student Desk' : 'Xerox Admin Desk'}
              </span>
            </div>

            {/* Navigation tabs */}
            <nav className="hidden md:flex space-x-1">
              {isStudent ? (
                <>
                  <button
                    onClick={() => onTabChange('upload')}
                    className={`px-3.5 py-4 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                      activeTab === 'upload'
                        ? 'border-[#0067b8] text-[#0067b8] font-semibold'
                        : 'border-transparent text-[#605e5c] hover:text-[#242424] hover:border-[#a19f9d]'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Upload Assignment</span>
                  </button>
                  <button
                    onClick={() => onTabChange('track')}
                    className={`px-3.5 py-4 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                      activeTab === 'track'
                        ? 'border-[#0067b8] text-[#0067b8] font-semibold'
                        : 'border-transparent text-[#605e5c] hover:text-[#242424] hover:border-[#a19f9d]'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>Track Printing</span>
                  </button>
                  <button
                    onClick={() => onTabChange('rates')}
                    className={`px-3.5 py-4 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                      activeTab === 'rates'
                        ? 'border-[#0067b8] text-[#0067b8] font-semibold'
                        : 'border-transparent text-[#605e5c] hover:text-[#242424] hover:border-[#a19f9d]'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Rate Card</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onTabChange('queue')}
                    className={`px-3.5 py-4 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                      activeTab === 'queue'
                        ? 'border-[#0067b8] text-[#0067b8] font-semibold'
                        : 'border-transparent text-[#605e5c] hover:text-[#242424] hover:border-[#a19f9d]'
                    }`}
                  >
                    <Printer className="w-4 h-4" />
                    <span>Live Print Queue</span>
                  </button>
                  <button
                    onClick={() => onTabChange('history')}
                    className={`px-3.5 py-4 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                      activeTab === 'history'
                        ? 'border-[#0067b8] text-[#0067b8] font-semibold'
                        : 'border-transparent text-[#605e5c] hover:text-[#242424] hover:border-[#a19f9d]'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Completed Orders</span>
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Right: Role Switcher & User Avatar */}
          <div className="flex items-center space-x-3">
            {/* Quick Switch Role */}
            <button
              onClick={onSwitchRole}
              title={isStudent ? 'Switch to Xerox Operator Admin View' : 'Switch to Student View'}
              className="text-xs bg-[#f3f2f1] hover:bg-[#edebe9] text-[#242424] px-2.5 py-1.5 rounded-[4px] border border-[#d2d0ce] flex items-center space-x-1.5 transition-colors font-medium"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#0067b8]" />
              <span className="hidden sm:inline">Switch to {isStudent ? 'Admin View' : 'Student View'}</span>
              <span className="sm:hidden">{isStudent ? 'Admin' : 'Student'}</span>
            </button>

            {/* Profile pill */}
            <div className="flex items-center space-x-2 pl-2 border-l border-[#e1dfdd]">
              <div className="w-8 h-8 rounded-full bg-[#0067b8] text-white flex items-center justify-center text-xs font-semibold tracking-wider">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-[#242424] leading-tight flex items-center gap-1">
                  <span>{user.name}</span>
                  {isStudent ? (
                    <UserCheck className="w-3.5 h-3.5 text-[#107c10]" />
                  ) : (
                    <Shield className="w-3.5 h-3.5 text-[#0067b8]" />
                  )}
                </div>
                <div className="text-[11px] text-[#605e5c] leading-tight">
                  {isStudent ? user.studentId : 'Counter Operator'}
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              title="Sign out"
              className="p-1.5 text-[#605e5c] hover:text-[#d83b01] hover:bg-[#fed9cc]/40 rounded-[4px] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile subnav */}
      <div className="md:hidden flex overflow-x-auto border-t border-[#edebe9] px-4 py-1.5 space-x-2 bg-[#faf9f8]">
        {isStudent ? (
          <>
            <button
              onClick={() => onTabChange('upload')}
              className={`text-xs px-3 py-1 rounded-[3px] font-medium whitespace-nowrap ${
                activeTab === 'upload' ? 'bg-[#0067b8] text-white' : 'text-[#605e5c]'
              }`}
            >
              Upload Assignment
            </button>
            <button
              onClick={() => onTabChange('track')}
              className={`text-xs px-3 py-1 rounded-[3px] font-medium whitespace-nowrap ${
                activeTab === 'track' ? 'bg-[#0067b8] text-white' : 'text-[#605e5c]'
              }`}
            >
              Track Status
            </button>
            <button
              onClick={() => onTabChange('rates')}
              className={`text-xs px-3 py-1 rounded-[3px] font-medium whitespace-nowrap ${
                activeTab === 'rates' ? 'bg-[#0067b8] text-white' : 'text-[#605e5c]'
              }`}
            >
              Rate Card
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onTabChange('queue')}
              className={`text-xs px-3 py-1 rounded-[3px] font-medium whitespace-nowrap ${
                activeTab === 'queue' ? 'bg-[#0067b8] text-white' : 'text-[#605e5c]'
              }`}
            >
              Live Queue
            </button>
            <button
              onClick={() => onTabChange('history')}
              className={`text-xs px-3 py-1 rounded-[3px] font-medium whitespace-nowrap ${
                activeTab === 'history' ? 'bg-[#0067b8] text-white' : 'text-[#605e5c]'
              }`}
            >
              Completed Orders
            </button>
          </>
        )}
      </div>
    </header>
  );
};
