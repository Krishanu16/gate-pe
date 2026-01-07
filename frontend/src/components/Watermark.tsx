import React from 'react';

export const Watermark = ({ email, userId }: { email: string, userId: string }) => {
  // Create a repeating pattern string
  const watermarkText = `${email} - ${userId.slice(0, 6)} - IP LOGGED`;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden flex flex-wrap content-center justify-center opacity-20 select-none">
      {/* Generate multiple instances to cover the whole screen */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="w-64 h-32 flex items-center justify-center transform -rotate-45 text-gray-500 text-sm font-bold whitespace-nowrap">
          {watermarkText}
        </div>
      ))}
    </div>
  );
};