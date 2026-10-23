import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  className = '', 
  variant = 'dark',
  size = 'md' 
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <Link 
      to="/" 
      className={`inline-flex items-center gap-2.5 font-bold tracking-tight whitespace-nowrap shrink-0 group transition-transform ${className}`}
      aria-label="Home Tutor Homepage"
    >
      {/* Home + Graduation Cap Logo Concept */}
      <div className={`relative flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 shadow-md ${iconSizes[size]}`}>
        <svg 
          viewBox="0 0 36 36" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-full p-1.5"
        >
          {/* House Roof Line */}
          <path 
            d="M5 19L18 7L31 19" 
            stroke="#00FF48" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          {/* House Body Base */}
          <path 
            d="M9 16.5V28C9 28.5523 9.44772 29 10 29H26C26.5523 29 27 28.5523 27 28V16.5" 
            stroke="#94A3B8" 
            strokeWidth="1.8" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          {/* Graduation Cap Mortarboard in Center */}
          <path 
            d="M18 13.5L25 17.5L18 21.5L11 17.5L18 13.5Z" 
            fill="#00FF48" 
          />
          {/* Graduation Cap Lower Band */}
          <path 
            d="M13.5 19.5V23.5C13.5 24.5 15.5 25.5 18 25.5C20.5 25.5 22.5 24.5 22.5 23.5V19.5" 
            stroke="#00FF48" 
            strokeWidth="1.6" 
            strokeLinecap="round" 
          />
          {/* Tassel */}
          <path 
            d="M25 17.5V22.5M25 22.5C24.5 22.5 24 23 24 23.5C24 24 24.5 24.5 25 24.5C25.5 24.5 26 24 26 23.5C26 23 25.5 22.5 25 22.5Z" 
            stroke="#00FF48" 
            strokeWidth="1.4" 
            strokeLinecap="round" 
          />
        </svg>
      </div>

      <div className="flex flex-col leading-none">
        <span className={`font-extrabold ${textSizes[size]} ${variant === 'light' ? 'text-white' : 'text-slate-900'}`}>
          Home<span className="text-[#00C938] group-hover:text-[#00FF48] transition-colors">Tutor</span>
        </span>
      </div>
    </Link>
  );
};
