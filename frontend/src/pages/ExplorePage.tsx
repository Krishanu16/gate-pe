import React from 'react';
import { Link } from '@tanstack/react-router';
import { 
  ArrowRight, PlayCircle, BookOpen, Check, 
  Monitor, Lock, Unlock, Home
} from 'lucide-react';

export function ExplorePage() {
  return (
    <div className="min-h-screen bg-[#ecfdf5] font-sans">
      
      {/* HEADER */}
      <header className="bg-white border-b-4 border-[#0f766e] p-6 sticky top-0 z-30 shadow-sm">
         <div className="max-w-5xl mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 font-bold text-gray-800 hover:text-[#0f766e]">
               <Home size={20} /> <span className="hidden sm:inline">Home</span>
            </Link>
            <h1 className="text-xl font-bold text-[#0f766e] font-handwritten">Free Trial Access</h1>
            <Link to="/signup" className="bg-[#0f766e] text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#0d9488]">
               Create Account
            </Link>
         </div>
      </header>

      <main className="max-w-5xl mx-auto py-12 px-6">
         
         <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-4 font-handwritten">
               Try Before You Buy.
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
               Experience the quality of our handwritten notes and the real exam interface. No credit card required.
            </p>
         </div>

         {/* CONTENT GRID */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            
            {/* CARD 1: MODULE 1 */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-teal-500 overflow-hidden relative">
               <div className="bg-teal-500 text-white p-2 text-center text-sm font-bold uppercase tracking-wider">
                  Unlocked & Free
               </div>
               <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                     <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center text-4xl">📚</div>
                     <Unlock className="text-teal-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Module 1: Introduction</h2>
                  <p className="text-gray-500 text-sm mb-6">
                     Learn the basics of the Petroleum Industry. Access full notes and the first chapter quiz.
                  </p>
                  
                  <ul className="space-y-3 mb-8">
                     <li className="flex items-center gap-2 text-sm text-gray-700 font-bold">
                        <Check size={16} className="text-teal-500"/> Full Handwritten PDF
                     </li>
                     <li className="flex items-center gap-2 text-sm text-gray-700 font-bold">
                        <Check size={16} className="text-teal-500"/> Concept Explainer
                     </li>
                     <li className="flex items-center gap-2 text-sm text-gray-700 font-bold">
                        <Check size={16} className="text-teal-500"/> Practice Quiz (10 Qs)
                     </li>
                  </ul>

                  <Link to="/dashboard" className="w-full block text-center bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition-colors">
                     Start Learning Now
                  </Link>
               </div>
            </div>

            {/* CARD 2: MOCK TEST */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden opacity-90">
               <div className="bg-gray-200 text-gray-600 p-2 text-center text-sm font-bold uppercase tracking-wider">
                  Premium Preview
               </div>
               <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                     <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-4xl">💻</div>
                     <Lock className="text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Full Length Mock Test</h2>
                  <p className="text-gray-500 text-sm mb-6">
                     Simulate the real GATE exam environment. 65 Questions, 3 Hours.
                  </p>
                  
                  <ul className="space-y-3 mb-8">
                     <li className="flex items-center gap-2 text-sm text-gray-500">
                        <Monitor size={16}/> TCS iON Interface
                     </li>
                     <li className="flex items-center gap-2 text-sm text-gray-500">
                        <Monitor size={16}/> Virtual Calculator
                     </li>
                     <li className="flex items-center gap-2 text-sm text-gray-500">
                        <Monitor size={16}/> Detailed Solutions
                     </li>
                  </ul>

                  <Link to="/enroll" className="w-full block text-center border-2 border-teal-600 text-teal-600 py-3 rounded-xl font-bold hover:bg-teal-50 transition-colors">
                     Unlock Premium
                  </Link>
               </div>
            </div>

         </div>

         {/* CTA */}
         <div className="bg-[#0f766e] rounded-3xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4 font-handwritten">Ready to Start?</h2>
            <p className="mb-8 text-teal-100">Create a free account to access Module 1 instantly. No payment needed.</p>
            <Link to="/signup" className="inline-flex items-center gap-2 bg-white text-teal-800 px-8 py-4 rounded-xl font-bold text-lg hover:bg-teal-50 transition-colors">
               Create Free Account <ArrowRight size={20} />
            </Link>
         </div>

      </main>
    </div>
  );
}