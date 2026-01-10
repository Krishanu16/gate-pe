import React from 'react';
import { Link } from '@tanstack/react-router';
import { Home, AlertTriangle } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#ecfdf5] flex flex-col items-center justify-center p-4 text-center font-sans">
      <div className="bg-white p-10 rounded-3xl shadow-xl border-4 border-[#0f766e] max-w-lg w-full">
        <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
           <AlertTriangle size={48} className="text-[#0f766e]" />
        </div>
        <h1 className="text-6xl font-black text-gray-800 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-gray-600 mb-6 font-handwritten">Drilling too deep?</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
           The page you are looking for has either evaporated or never existed. Let's get you back to the surface.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 bg-[#0f766e] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#0d9488] transition-transform hover:-translate-y-1 shadow-lg"
        >
           <Home size={20} /> Back to Home
        </Link>
      </div>
    </div>
  );
}