import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';

function getInitialTheme(): Theme {
  // Check local storage first
  const storedTheme = localStorage.getItem('theme') as Theme | null;
  if (storedTheme) {
    return storedTheme;
  }

  // If no stored preference, check system preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia(COLOR_SCHEME_QUERY).matches ? 'dark' : 'light';
  }

  // Default to light theme
  return 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return {
    theme,
    setTheme,
  };
}
