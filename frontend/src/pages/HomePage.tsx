import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { 
  ArrowRight, CheckCircle, FileText, Award, 
  ChevronDown, CheckSquare, Clock, ShieldCheck, Zap,
  Layers, PenTool, Database, Monitor, LockKeyhole, BookHeart
} from 'lucide-react';
import { Logo } from '@/components/Logo';

const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Caveat:wght@400;700&display=swap');
    
    html { scroll-behavior: smooth; }

    .grid-background {
      background-color: #ecfdf5;
      background-image: 
        linear-gradient(#a7f3d0 1px, transparent 1px),
        linear-gradient(90deg, #a7f3d0 1px, transparent 1px);
      background-size: 30px 30px;
    }
    
    .handwritten-title { font-family: 'Caveat', cursive; }
    .handwritten-body { font-family: 'Architects Daughter', cursive; }

    .blob {
      position: absolute;
      filter: blur(60px);
      z-index: 0;
      opacity: 0.6;
    }
    .blob-1 { top: -10%; left: -10%; width: 500px; height: 500px; background: #ccfbf1; border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
    .blob-2 { bottom: -10%; right: -10%; width: 600px; height: 600px; background: #ffe4e6; border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }

    /* GATE Interface Simulator CSS */
    .gate-sim-header { background: #3b82f6; color: white; padding: 10px; font-size: 12px; font-weight: bold; }
    .gate-sim-body { background: white; height: 300px; display: flex; }
    .gate-sim-q { flex: 1; padding: 20px; border-right: 1px solid #ddd; }
    .gate-sim-palette { width: 100px; background: #eef2f6; padding: 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 5px; align-content: start; }
    .gate-btn-mock { height: 25px; width: 25px; background: #ddd; border-radius: 2px; }
    .gate-btn-mock.green { background: #22c55e; clip-path: circle(50%); }
    .gate-btn-mock.red { background: #ef4444; clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%); }
  `}</style>
);

export function HomePage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden font-sans text-gray-800">
      <Styles />
      
      {/* NAVBAR */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md border-b border-teal-100 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-600">
            <a href="#features" className="hover:text-[#0f766e] transition-colors">Features</a>
            <a href="#test-series" className="hover:text-[#0f766e] transition-colors">Test Series</a>
            <a href="#animations" className="hover:text-[#0f766e] transition-colors">Visual Learning</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-600 font-bold hover:text-[#0f766e] text-sm hidden sm:block">Login</Link>
            <Link to="/explore" className="bg-[#0f766e] text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-[#0d9488] transition-all shadow-lg shadow-teal-200/50">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative pt-36 pb-20 px-6 grid-background">
        <div className="blob blob-1"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          
          {/* UPDATED BADGE */}
          <div className="inline-flex items-center gap-2 bg-white border border-teal-200 rounded-full px-4 py-1.5 mb-8 shadow-sm animate-in fade-in zoom-in duration-500">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-sm font-bold text-gray-600">The Revolution in Petroleum Engineering Education</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-[1.1]">
            Elite Petroleum <br/>
            <span className="text-[#0f766e] handwritten-title relative">
              knowledge
              <svg className="absolute w-full h-3 -bottom-2 left-0 text-[#0f766e] opacity-40" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.00026 6.99996C18.4424 4.58232 75.9002 -0.844781 198.001 2.99996" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed font-handwritten">
             Stop reading 1000-page textbooks. Master Petroleum Engineering with concise handwritten notes featuring visual diagrams for better understanding, and real GATE-style mock tests.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/enroll" className="w-full sm:w-auto px-8 py-4 bg-[#0f766e] text-white rounded-xl font-bold text-lg shadow-[6px_6px_0px_#065f46] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_#065f46] transition-all flex items-center justify-center gap-2">
              Start Free Trial <ArrowRight size={20} />
            </Link>
            {/* UPDATED EXPLORE LINK */}
            <Link to="/explore" className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-bold text-lg hover:border-teal-500 hover:text-teal-600 transition-all flex items-center justify-center gap-2">
              <Zap size={20} /> Explore Now (Free)
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto border-t border-teal-100 pt-10">
            <StatBox label="Concise Material" value="Handwritten Notes" icon={<PenTool className="text-teal-600 mb-2" />} />
            <StatBox label="Real Exam Feel" value="TCS iON Interface" icon={<Monitor className="text-teal-600 mb-2" />} />
            <StatBox label="No Piracy" value="Elite Security" icon={<LockKeyhole className="text-teal-600 mb-2" />} />
          </div>
        </div>
      </header>

      {/* FEATURE 1: REAL GATE INTERFACE */}
      <div id="features">
          <section className="py-20 px-6 bg-gray-900 text-white overflow-hidden relative">
             <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[100px] opacity-20"></div>
             <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
                <div className="flex-1 space-y-6">
                   <div className="inline-block bg-blue-600/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                      Exam Day Ready
                   </div>
                   <h2 className="text-4xl md:text-5xl font-black leading-tight">
                      Train on the <br/>
                      <span className="text-blue-400">Actual GATE Interface</span>
                   </h2>
                   <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
                      Don't let the interface surprise you on exam day. Our test engine is a pixel-perfect replica of the <strong>TCS iON</strong> interface used in GATE.
                   </p>
                   <ul className="space-y-4">
                      <ListItem text="Same Button Layout (Save & Next)" dark />
                      <ListItem text="Virtual Calculator Integrated" dark />
                      <ListItem text="Question Palette Color Codes" dark />
                      <ListItem text="Real-time Timer & Auto-Submit" dark />
                   </ul>
                </div>
                
                <div className="flex-1 w-full">
                   <div className="rounded-xl overflow-hidden shadow-2xl border-4 border-gray-700 bg-gray-800 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                      <div className="bg-gray-700 p-3 flex gap-2">
                         <div className="w-3 h-3 rounded-full bg-red-500"></div>
                         <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                         <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="gate-sim-header flex justify-between">
                         <span>GATE Petroleum Engineering 2026</span>
                         <span className="flex items-center gap-2"><Clock size={12}/> 179:45 Remaining</span>
                      </div>
                      <div className="gate-sim-body font-sans text-gray-800">
                         <div className="gate-sim-q p-6 relative">
                            <div className="font-bold text-blue-800 mb-2 border-b pb-2">Question No. 15</div>
                            <p className="text-sm mb-4">A reservoir rock has a porosity of 20% and water saturation of 30%. Calculate the hydrocarbon pore volume...</p>
                            <div className="space-y-2">
                               {['A. 0.14', 'B. 0.20', 'C. 0.15', 'D. 0.35'].map(opt => (
                                  <div key={opt} className="flex gap-2 items-center text-xs p-2 border rounded bg-gray-50">
                                     <input type="radio" disabled /> {opt}
                                  </div>
                               ))}
                            </div>
                            <div className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-1 text-xs font-bold rounded shadow-sm">Save & Next</div>
                         </div>
                         <div className="gate-sim-palette border-l">
                            {Array.from({length: 12}).map((_, i) => (
                               <div key={i} className={`gate-btn-mock ${i < 4 ? 'green' : (i===4 ? 'red' : '')}`}></div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </section>
      </div>

      {/* FEATURE 2: VISUAL LEARNING */}
      <section id="animations" className="py-24 px-6 bg-white">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
               <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-1 rounded-2xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-gray-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-32 h-32 border-4 border-blue-400 rounded-full animate-ping opacity-20 absolute"></div>
                          <div className="w-24 h-24 border-4 border-blue-500 rounded-full animate-ping delay-100 opacity-40 absolute"></div>
                          <Database className="text-white w-16 h-16 relative z-10 animate-bounce" />
                      </div>
                      <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded text-white text-xs font-mono">
                         Resevoir_Simulation.mp4
                      </div>
                  </div>
               </div>
            </div>
            <div className="flex-1">
               <h2 className="text-4xl font-black text-gray-900 mb-6">
                  Learn with <span className="text-purple-600 handwritten-title">Visuals.</span>
               </h2>
               <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Petroleum Engineering involves complex subsurface machinery and fluid dynamics. We don't just write about it; we show it.
               </p>
               <div className="space-y-6">
                  <FeatureItem 
                     title="Drilling Rig Operations" 
                     desc="See how the drill string, mud circulation, and BOP stack work in 3D."
                     icon={<Layers size={20} className="text-purple-600"/>}
                  />
                  <FeatureItem 
                     title="Reservoir Phase Behavior" 
                     desc="Visualize PVT diagrams and phase envelopes changing with pressure."
                     icon={<ActivityGraph size={20} className="text-purple-600"/>}
                  />
                  <FeatureItem 
                     title="Enhanced Oil Recovery" 
                     desc="Understand waterflooding and gas injection sweep efficiency visually."
                     icon={<Zap size={20} className="text-purple-600"/>}
                  />
               </div>
            </div>
         </div>
      </section>

      {/* RESTORED: FEATURE 3 - HANDWRITTEN NOTES */}
      <section className="py-24 px-6 bg-[#ecfdf5] relative overflow-hidden">
        <div className="blob blob-2 opacity-50"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row-reverse items-center gap-12 relative z-10">
           <div className="flex-1 text-left">
              <h2 className="text-4xl font-black text-gray-900 mb-6">
                 Notes that actually <br/> <span className="text-[#0f766e] handwritten-title">make sense.</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                 Stop reading 1000-page textbooks. Our handwritten notes are concise, colorful, and cover 100% of the GATE syllabus. Optimized for quick revision.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <ListItem text="Flowcharts & Diagrams" />
                 <ListItem text="Formula Sheets Included" />
                 <ListItem text="Highlighting Key Concepts" />
              </div>
           </div>
           
           <div className="flex-1 w-full">
              {/* Note Preview Visual */}
              <div className="relative group">
                 <div className="absolute inset-0 bg-[#0f766e] rounded-2xl rotate-6 group-hover:rotate-3 transition-transform"></div>
                 <div className="relative bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
                    <div className="h-4 w-1/3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-2 w-full bg-gray-100 rounded mb-2"></div>
                    <div className="h-2 w-full bg-gray-100 rounded mb-2"></div>
                    <div className="h-2 w-2/3 bg-gray-100 rounded mb-6"></div>
                    
                    {/* Fake Handwritten Diagram */}
                    <div className="h-40 bg-yellow-50 rounded border border-yellow-100 flex items-center justify-center text-yellow-600 font-handwritten text-2xl rotate-[-2deg]">
                       <span className="border-b-2 border-yellow-300 pb-1">Reservoir Diagram</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* FEATURE 4: TEST SERIES */}
      <section id="test-series" className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Comprehensive Test Series</h2>
            <p className="text-gray-500 max-w-xl mx-auto font-handwritten text-xl">Practice makes perfect. Tests for every stage of preparation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestCard 
              title="20+ Topic Tests"
              count="20 Tests"
              desc="Short 30-min tests to master specific concepts like Porosity, Darcy's Law, or Drilling Fluids."
              icon={<CheckSquare size={24}/>}
              color="bg-yellow-50 text-yellow-700 border-yellow-200"
            />
            <TestCard 
              title="15+ Subject Tests"
              count="15 Tests"
              desc="90-min tests covering entire subjects like Reservoir, Production, or Math."
              icon={<FileText size={24}/>}
              color="bg-teal-50 text-teal-700 border-teal-200"
            />
            <TestCard 
              title="10 Full Length Mocks"
              count="10 Tests"
              desc="180-min standard GATE simulation. 65 Questions. Exact exam difficulty level."
              icon={<Award size={24}/>}
              color="bg-purple-50 text-purple-700 border-purple-200"
            />
          </div>
        </div>
      </section>

      {/* RESTORED: FAQ SECTION */}
      <section className="py-20 px-6 bg-white">
         <div className="max-w-3xl mx-auto">
            <h2 className="text-center text-3xl font-black text-gray-900 mb-10">Frequently Asked Questions</h2>
            <div className="space-y-4">
               <FaqItem q="Can I access the course on Mobile?" a="Yes! Our platform works perfectly on both Desktop (for tests) and Mobile (for notes/videos)." />
               <FaqItem q="Is the test interface exactly like GATE?" a="Yes. We have replicated the TCS iON interface pixel-by-pixel, including the Virtual Calculator and Color Palette." />
               <FaqItem q="Can I get a refund?" a="Yes, we offer a 7-day money-back guarantee if you are not satisfied with the content." />
            </div>
         </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto bg-[#0f766e] rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-6 handwritten-title">Ready to top GATE 2026?</h2>
            <p className="text-teal-100 text-lg mb-10 max-w-xl mx-auto">
              Become a PETRO ELITE member today.
            </p>
            <Link to="/enroll" className="inline-block bg-white text-[#0f766e] px-10 py-4 rounded-xl font-bold text-xl hover:bg-teal-50 transition-colors shadow-lg">
              Enroll for ₹1499
            </Link>
            <p className="mt-6 text-sm text-teal-200 font-bold flex items-center justify-center gap-2">
               <ShieldCheck size={16}/> 100% Secure Payment • 7-Day Refund Policy
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-12 text-center">
         <div className="flex justify-center items-center gap-2 mb-4 text-gray-400 font-bold">
           <div className="bg-gray-200 p-1 rounded">PE</div> PETRO Elite
         </div>
         <p className="text-gray-500 text-sm">© 2026. Made for Engineers, by Engineers.</p>
         <div className="mt-4 flex justify-center gap-6 text-sm font-bold text-gray-400">
            <Link to="/legal" className="hover:text-[#0f766e]">Privacy Policy</Link>
            <Link to="/legal" className="hover:text-[#0f766e]">Terms of Use</Link>
         </div>
      </footer>
    </div>
  );
}

// --- SUB-COMPONENTS ---
function StatBox({ label, value, icon }: any) {
   return (
      <div className="flex flex-col items-center">
         {icon}
         <div className="text-xl font-black text-gray-800">{value}</div>
         <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</div>
      </div>
   );
}

function ListItem({ text, dark }: any) {
   return (
      <div className={`flex items-center gap-3 font-bold ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
         <CheckCircle className={dark ? 'text-blue-400' : 'text-[#0f766e]'} size={20} /> 
         {text}
      </div>
   );
}

function FeatureItem({ title, desc, icon }: any) {
   return (
      <div className="flex gap-4">
         <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
            {icon}
         </div>
         <div>
            <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
            <p className="text-gray-600 text-sm">{desc}</p>
         </div>
      </div>
   );
}

function ActivityGraph({size, className}: any) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
}

function TestCard({ title, count, desc, icon, color }: any) {
   return (
      <div className={`p-8 rounded-2xl border-2 hover:-translate-y-1 transition-transform ${color} bg-opacity-30 bg-white`}>
         <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white rounded-xl shadow-sm">{icon}</div>
            <span className="text-xs font-black uppercase tracking-wider bg-white px-2 py-1 rounded border border-gray-100">{count}</span>
         </div>
         <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
         <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
      </div>
   );
}

function FaqItem({ q, a }: any) {
   const [isOpen, setIsOpen] = useState(false);
   return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
         <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 text-left font-bold text-gray-800 hover:bg-gray-50">
            {q}
            <ChevronDown className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} size={18} />
         </button>
         {isOpen && <div className="p-4 pt-0 text-gray-600 text-sm leading-relaxed border-t border-gray-100 bg-gray-50">{a}</div>}
      </div>
   );
}