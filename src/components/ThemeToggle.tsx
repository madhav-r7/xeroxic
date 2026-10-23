import React, { useState, useEffect } from 'react';
import { getStoredTheme, setStoredTheme, Theme } from '../services/theme';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = false,
}) => {
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());

  useEffect(() => {
    const handleThemeChange = (e: any) => {
      if (e.detail) {
        setTheme(e.detail);
      } else {
        setTheme(getStoredTheme());
      }
    };

    window.addEventListener('xeroxic_theme_changed', handleThemeChange);
    return () => {
      window.removeEventListener('xeroxic_theme_changed', handleThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    setStoredTheme(nextTheme);
  };

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Dark mode enabled (click for light)' : 'Light mode enabled (click for dark)'}
      className={`relative inline-flex items-center justify-center gap-1.5 h-9 px-2.5 rounded-full border border-bone bg-paper-white hover:bg-bone/70 text-aubergine-ink transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-espresso ${className}`}
    >
      {/* Half Moon Icon: Circle with filled half */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`w-4 h-4 transition-transform duration-500 ease-out ${
          isDark ? 'rotate-0 text-aubergine-ink' : '-rotate-180 text-aubergine-ink'
        }`}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
      </svg>

      {showLabel && (
        <span className="text-xs font-medium text-warm-ash select-none hidden sm:inline">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
};
