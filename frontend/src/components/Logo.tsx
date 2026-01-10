import React from 'react';

export const Logo = ({ className = "", showText = true }: { className?: string, showText?: boolean }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* THE ICON: Oil Drop inside a Shield */}
      <svg 
        width="40" 
        height="40" 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="text-[#0f766e]"
      >
        {/* Shield Outline */}
        <path 
          d="M50 5L15 20V50C15 75 30 90 50 95C70 90 85 75 85 50V20L50 5Z" 
          fill="#ecfdf5" 
          stroke="currentColor" 
          strokeWidth="6"
          strokeLinejoin="round"
        />
        {/* Oil Drop (Center) */}
        <path 
          d="M50 28C50 28 32 50 32 62C32 72 40 80 50 80C60 80 68 72 68 62C68 50 50 28 50 28Z" 
          fill="currentColor" 
        />
        {/* Shine on Drop */}
        <path 
          d="M55 45C55 45 60 55 58 65" 
          stroke="#ecfdf5" 
          strokeWidth="3" 
          strokeLinecap="round"
        />
      </svg>

      {/* THE TEXT BRANDING */}
      {showText && (
        <div className="flex flex-col leading-none select-none">
          <span className="font-sans font-black text-xl tracking-wider text-gray-800 uppercase">
            PETRO
          </span>
          <span className="font-handwritten text-2xl font-bold text-[#0f766e] -mt-1 transform -rotate-2">
            Elite
          </span>
        </div>
      )}
    </div>
  );
};