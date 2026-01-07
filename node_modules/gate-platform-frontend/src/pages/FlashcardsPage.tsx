import React, { useState } from 'react';
import { RotateCw, ThumbsUp, ThumbsDown, Zap } from 'lucide-react';

const FLASHCARDS = [
  { id: 1, title: "Darcy's Law (Linear)", front: "q = ?", back: "q = (k * A * ΔP) / (μ * L)" },
  { id: 2, title: "Formation Volume Factor (Bo)", front: "Definition?", back: "Bo = (Vol of Oil at Res Cond) / (Vol of Oil at Std Cond)" },
  { id: 3, title: "Archie's Equation", front: "Sw = ?", back: "Sw = ( (a * Rw) / (φ^m * Rt) ) ^ (1/n)" },
  { id: 4, title: "API Gravity", front: "Formula?", back: "API = (141.5 / SG) - 131.5" },
];

export function FlashcardsPage() {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => setIndex((prev) => (prev + 1) % FLASHCARDS.length), 200);
  };

  const card = FLASHCARDS[index];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
         <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
         <div className="absolute bottom-20 right-20 w-64 h-64 bg-teal-500 rounded-full blur-3xl"></div>
      </div>

      <div className="z-10 text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 flex items-center justify-center gap-3">
          <Zap className="text-yellow-400 fill-yellow-400" /> Formula Blitz
        </h1>
        <p className="text-slate-400">Master {FLASHCARDS.length} essential formulas</p>
      </div>

      {/* CARD CONTAINER */}
      <div className="relative w-full max-w-md h-80 perspective-1000 group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`w-full h-full relative transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* FRONT */}
          <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 border-b-8 border-teal-500">
             <span className="text-teal-600 font-bold text-sm tracking-widest uppercase mb-4">{card.title}</span>
             <h2 className="text-4xl font-black text-gray-800 text-center">{card.front}</h2>
             <p className="absolute bottom-6 text-gray-400 text-xs font-bold animate-pulse">TAP TO REVEAL</p>
          </div>

          {/* BACK */}
          <div className="absolute inset-0 backface-hidden bg-slate-800 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 border-b-8 border-purple-500 rotate-y-180 text-white">
             <span className="text-purple-400 font-bold text-sm tracking-widest uppercase mb-4">Formula</span>
             <h2 className="text-2xl md:text-3xl font-mono font-bold text-center leading-relaxed">{card.back}</h2>
          </div>

        </div>
      </div>

      {/* CONTROLS */}
      <div className="mt-10 flex gap-6">
        <button onClick={nextCard} className="p-4 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-all border-2 border-red-500/50">
           <ThumbsDown size={32} />
        </button>
        <button onClick={() => setIsFlipped(!isFlipped)} className="p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all backdrop-blur-sm">
           <RotateCw size={32} />
        </button>
        <button onClick={nextCard} className="p-4 bg-green-500/20 text-green-400 rounded-full hover:bg-green-500 hover:text-white transition-all border-2 border-green-500/50">
           <ThumbsUp size={32} />
        </button>
      </div>
      
      <p className="mt-6 text-slate-500 text-sm">Swipe left if forgotten, right if mastered.</p>

      {/* Inline Styles for 3D Flip */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}