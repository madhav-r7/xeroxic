export type Theme = 'dark' | 'light';

const THEME_KEY = 'xeroxic_theme';

/**
 * Returns current theme from localStorage, defaulting to 'dark'
 */
export function getStoredTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch (e) {
    // localStorage may be disabled
  }
  return 'dark'; // Default to dark mode as requested
}

/**
 * Saves theme to localStorage and updates <html class="dark">
 */
export function setStoredTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    // localStorage may be disabled
  }

  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  window.dispatchEvent(new CustomEvent('xeroxic_theme_changed', { detail: theme }));
}

/**
 * Initializes theme on page load (defaults to dark)
 */
export function initTheme(): Theme {
  const theme = getStoredTheme();
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  return theme;
}
