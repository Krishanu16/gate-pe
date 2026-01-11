import React from 'react';

// Define the interface to fix the TypeScript error
interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'white'; // Added this prop
}

export const Logo = ({ className = "", showText = true, variant = 'default' }: LogoProps) => {
  
  // 1. Determine colors based on the variant
  const isWhite = variant === 'white';

  // Icon Colors
  const iconBaseColor = isWhite ? "text-white" : "text-[#0f766e]";
  const shieldFill = isWhite ? "rgba(255,255,255,0.1)" : "#ecfdf5"; // Transparent white on dark, Mint on light
  const shineColor = isWhite ? "#0f766e" : "#ecfdf5"; // Shine needs to contrast with the drop

  // Text Colors
  const petroTextColor = isWhite ? "text-white" : "text-gray-800";
  const eliteTextColor = isWhite ? "text-teal-200" : "text-[#0f766e]";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      
      {/* THE ICON: Oil Drop inside a Shield */}
      <svg 
        width="40" 
        height="40" 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={iconBaseColor} // Dynamic Color
      >
        {/* Shield Outline */}
        <path 
          d="M50 5L15 20V50C15 75 30 90 50 95C70 90 85 75 85 50V20L50 5Z" 
          fill={shieldFill} 
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
          stroke={shineColor} 
          strokeWidth="3" 
          strokeLinecap="round"
        />
      </svg>

      {/* THE TEXT BRANDING */}
      {showText && (
        <div className="flex flex-col leading-none select-none">
          <span className={`font-sans font-black text-xl tracking-wider uppercase ${petroTextColor}`}>
            PETRO
          </span>
          <span className={`font-handwritten text-2xl font-bold -mt-1 transform -rotate-2 ${eliteTextColor}`}>
            Elite
          </span>
        </div>
      )}
    </div>
  );
};