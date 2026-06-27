'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Determine initial theme on client mount
    if (document.documentElement.classList.contains('light')) {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="p-2 rounded-full border border-cork-shadow hover:border-burnt-sienna text-warm-cream transition-all duration-300 cursor-pointer flex items-center justify-center bg-transparent"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 stroke-[1.5]" />
      ) : (
        <Moon className="w-4 h-4 stroke-[1.5]" />
      )}
    </button>
  );
}
