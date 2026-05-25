import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full transition-all duration-300 relative overflow-hidden min-w-[85px] sm:min-w-[105px]"
      style={{
        background: isDark
          ? 'rgba(255,255,255,0.05)'
          : 'rgba(0,0,0,0.06)',

        border: `1px solid ${
          isDark
            ? 'rgba(255,255,255,0.1)'
            : 'rgba(0,0,0,0.12)'
        }`,

        cursor: 'pointer',

        color: isDark
          ? 'rgba(255,255,255,0.7)'
          : 'rgba(0,0,0,0.7)',

        fontWeight: 500,
        letterSpacing: '0.3px',
      }}

      onMouseEnter={e => {
        e.currentTarget.style.borderColor =
          'rgba(193,18,31,0.4)';

        e.currentTarget.style.color =
          isDark ? '#fff' : '#0a0a0a';
      }}

      onMouseLeave={e => {
        e.currentTarget.style.borderColor =
          isDark
            ? 'rgba(255,255,255,0.1)'
            : 'rgba(0,0,0,0.12)';

        e.currentTarget.style.color =
          isDark
            ? 'rgba(255,255,255,0.7)'
            : 'rgba(0,0,0,0.7)';
      }}
    >
      <span
        className="text-sm sm:text-base"
        style={{
          transition: 'transform 0.3s'
        }}
      >
        {isDark ? '☀️' : '🌙'}
      </span>

      <span className="text-[11px] sm:text-sm">
        {isDark ? 'Light' : 'Dark'}
      </span>
    </button>
  );
};

export default ThemeToggle;