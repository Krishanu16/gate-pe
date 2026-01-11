import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth'; // Import Auth
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { toast } from 'sonner';
import { Logo } from '../components/Logo';
import { 
  Search, Lock, FileText, CheckCircle, 
  Award, Clock, X, ChevronDown, ChevronRight,
  LayoutGrid, ListChecks, Shield, Zap,
  BarChart2, PlayCircle, Sparkles, BrainCircuit, 
  ArrowRight, Calculator, MessageCircle, Star, Trophy, Layers, Bookmark, Crown, Play
} from 'lucide-react';

// --- STYLES ---
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Caveat:wght@400;700&display=swap');

    .grid-background {
      background-color: #ecfdf5;
      background-image: 
        linear-gradient(#a7f3d0 1px, transparent 1px),
        linear-gradient(90deg, #a7f3d0 1px, transparent 1px);
      background-size: 24px 24px;
    }

    .handwritten-title { font-family: 'Caveat', cursive, sans-serif; }
    .handwritten-body { font-family: 'Architects Daughter', cursive, sans-serif; }

    .module-card {
      background: white;
      border: 2px solid #cbd5e1;
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.2s ease;
    }
    .module-card:hover { transform: translate(-2px, -2px); box-shadow: 4px 4px 0px #94a3b8; }
    
    .btn-primary {
      background: #0f766e; color: white;
      border: 2px solid #065f46;
      box-shadow: 3px 3px 0px #065f46;
      transition: all 0.1s ease;
    }
    .btn-primary:hover { transform: translate(-2px, -2px); box-shadow: 5px 5px 0px #065f46; background: #0d9488; }

    .nav-tab {
      cursor: pointer;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: bold;
      transition: all 0.2s;
      border: 2px solid transparent;
      white-space: nowrap;
      color: #4b5563;
    }
    .nav-tab.active {
      background: #0f766e;
      color: white;
      border-color: #065f46;
      box-shadow: 3px 3px 0px #065f46;
    }
    .nav-tab:hover:not(.active) {
      background: #d1fae5;
      color: #065f46;
    }
    
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

export function ExplorePage() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Auth Hook
  
  const [modules, setModules] = useState<any[]>([]);
  const [testSeries, setTestSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [activeTab, setActiveTab] = useState('Demo Materials'); // Default to Demo
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalReason, setAuthModalReason] = useState("limit"); // 'limit' or 'content'
  
  // Feature State
  const [demoAiQuery, setDemoAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchPublicData = async () => {
        try {
            // Fetch Modules (Simulating that some are "Demo" modules)
            const contentSnap = await getDocs(query(collection(db, "modules"), orderBy("order", "asc")));
            setModules(contentSnap.docs.map(d => ({id: d.id, ...d.data()})));

            const testSnap = await getDocs(collection(db, "testSeries"));
            setTestSeries(testSnap.docs.map(d => ({id: d.id, ...d.data()})));
        } catch (e) {
            console.error("Error loading preview:", e);
        } finally {
            setLoading(false);
        }
    };
    fetchPublicData();
  }, []);

  // --- LIMITED ACCESS LOGIC ---
  const checkAccess = (featureKey: string, limit: number = 2): boolean => {
      // 1. Mandatory Login Check
      if (!user) {
          navigate({ to: '/signup' }); // Force Signup/Login
          return false;
      }

      // 2. Usage Limit Check (Stored in LocalStorage for Demo)
      const currentUsage = parseInt(localStorage.getItem(`demo_usage_${featureKey}_${user.uid}`) || '0');
      
      if (currentUsage < limit) {
          // Allow Access & Increment
          localStorage.setItem(`demo_usage_${featureKey}_${user.uid}`, (currentUsage + 1).toString());
          toast.info(`Free Trial: ${limit - (currentUsage + 1)} uses remaining.`);
          return true;
      } else {
          // Block Access
          setAuthModalReason("limit");
          setShowAuthModal(true);
          return false;
      }
  };

  // --- HANDLERS ---
  const handleModuleExpand = (id: string) => {
      setExpandedModules(prev => {
          const n = new Set(prev);
          n.has(id) ? n.delete(id) : n.add(id);
          return n;
      });
  };

  const handleAiDemo = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!demoAiQuery.trim()) return;

      // 1. Check Access (Limit 2 Queries)
      if (!checkAccess('ai_tutor', 2)) return;

      // 2. Execute AI Logic
      setIsAiLoading(true);
      try {
          if (!import.meta.env.VITE_GEMINI_API_KEY) throw new Error("No API Key");
          const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
          const result = await model.generateContent(`Petroleum Engineering Question: ${demoAiQuery}. Keep it short (max 50 words).`);
          setAiResponse(result.response.text());
      } catch (err) {
          toast.error("AI Service Busy. Try again.");
      } finally {
          setIsAiLoading(false);
      }
  };

  const handleStartDemoTest = (testId: string) => {
      if (checkAccess('demo_test', 1)) {
          // In a real app, navigate to the test player with a demo flag
          toast.success("Starting Demo Test Environment...");
          setTimeout(() => navigate({ to: '/dashboard' }), 1000); 
      }
  };

  // Tabs Configuration
  const tabs = [
    { id: 'Demo Materials', icon: <PlayCircle size={18} />, label: 'Free Demo Materials' },
    { id: 'Modules', icon: <LayoutGrid size={18} />, label: 'Full Syllabus' },
    { id: 'PetroAI', icon: <BrainCircuit size={18} />, label: 'AI Tutor' },
    { id: 'Test Series', icon: <ListChecks size={18} />, label: 'Test Series' },
    { id: 'Rankings', icon: <Trophy size={18} />, label: 'Rankings' },
  ];

  if (loading) return <div className="h-screen flex items-center justify-center font-handwritten text-[#0f766e]">Loading Preview...</div>;

  return (
    <div className="min-h-screen grid-background handwritten-body flex flex-col font-sans">
      <Styles />

      {/* HEADER */}
      <header className="bg-white border-b-[3px] border-[#0f766e] sticky top-0 z-40 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="hidden md:inline-block text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded-full font-bold border border-teal-300">Explore Mode</span>
          </div>
          <div className="flex items-center gap-4">
             {!user && <Link to="/login" className="text-gray-600 font-bold hover:text-[#0f766e] text-sm">Login</Link>}
             <Link to="/enroll" className="btn-primary px-5 py-2 rounded-lg font-bold text-sm shadow-md">Get Full Access</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 pb-24">
        
        {/* HERO BANNER */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="relative z-10">
                <h1 className="font-handwritten font-bold text-4xl mb-2">Welcome to Petro Elite</h1>
                <p className="opacity-90 max-w-xl text-lg">Experience the platform before you join. <br/> <span className="font-bold text-yellow-300">Create a free account to try demos.</span></p>
            </div>
        </div>

        {/* TABS SCROLLABLE */}
        <div className="flex overflow-x-auto pb-2 gap-3 mb-8 border-b border-gray-200 no-scrollbar">
           {tabs.map(tab => (
               <div key={tab.id} onClick={() => setActiveTab(tab.id)} className={`nav-tab flex items-center gap-2 ${activeTab === tab.id ? 'active' : ''}`}>
                   {tab.icon} {tab.label}
               </div>
           ))}
        </div>

        {/* --- 1. FREE DEMO MATERIALS TAB --- */}
        {activeTab === 'Demo Materials' && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3 items-center text-blue-800">
                    <PlayCircle className="shrink-0" />
                    <div>
                        <h3 className="font-bold text-lg">Try Before You Buy</h3>
                        <p className="text-sm">These materials are completely free. You just need to create an account to view them.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Simulated Demo Content */}
                    <div className="module-card p-6 bg-white hover:border-teal-500 cursor-pointer group" onClick={() => checkAccess('demo_pdf', 100) && toast.success("Opening Demo PDF...")}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-red-50 p-3 rounded-lg text-red-600"><FileText size={24} /></div>
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Free Demo</span>
                        </div>
                        <h4 className="font-bold text-xl text-gray-800 mb-2">Reservoir Rock Properties</h4>
                        <p className="text-gray-500 text-sm mb-4">Complete handwritten notes on Porosity and Permeability with diagrams.</p>
                        <div className="text-teal-600 font-bold text-sm flex items-center gap-2 group-hover:underline">Read Notes <ArrowRight size={16}/></div>
                    </div>

                    <div className="module-card p-6 bg-white hover:border-teal-500 cursor-pointer group" onClick={() => handleStartDemoTest('demo_test_1')}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-purple-50 p-3 rounded-lg text-purple-600"><ListChecks size={24} /></div>
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Free Demo</span>
                        </div>
                        <h4 className="font-bold text-xl text-gray-800 mb-2">General Aptitude Mini-Test</h4>
                        <p className="text-gray-500 text-sm mb-4">15 Questions | 20 Minutes. Experience the exact GATE interface.</p>
                        <div className="text-teal-600 font-bold text-sm flex items-center gap-2 group-hover:underline">Start Test <ArrowRight size={16}/></div>
                    </div>

                    <div className="module-card p-6 bg-white hover:border-teal-500 cursor-pointer group" onClick={() => checkAccess('demo_flashcard', 100) && toast.success("Opening Flashcards...")}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-yellow-50 p-3 rounded-lg text-yellow-600"><Zap size={24} /></div>
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Free Demo</span>
                        </div>
                        <h4 className="font-bold text-xl text-gray-800 mb-2">Drilling Fluids Flashcards</h4>
                        <p className="text-gray-500 text-sm mb-4">20 High-yield cards to memorize mud properties.</p>
                        <div className="text-teal-600 font-bold text-sm flex items-center gap-2 group-hover:underline">Practice Now <ArrowRight size={16}/></div>
                    </div>
                </div>
            </div>
        )}

        {/* --- 2. FULL SYLLABUS (Modules) --- */}
        {activeTab === 'Modules' && (
            <div className="space-y-6 animate-in fade-in">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 mb-4 text-center">
                    <p className="text-gray-600 text-sm"><Lock size={14} className="inline mr-1"/> These are premium modules. Join to unlock 500+ hours of content.</p>
                </div>
                {modules.map((module: any) => (
                    <div key={module.id} className="module-card opacity-90 hover:opacity-100">
                        <div onClick={() => handleModuleExpand(module.id)} className="p-5 cursor-pointer bg-white relative flex justify-between items-center hover:bg-gray-50 transition-colors">
                            <div className="flex gap-4 items-center">
                                <div className="text-3xl bg-gray-50 p-2 rounded-lg border border-gray-200">{module.icon}</div>
                                <div>
                                    <h4 className="font-bold text-xl text-gray-800">{module.title}</h4>
                                    <p className="text-sm text-gray-500">{module.lessons?.length || 0} lessons • Premium</p>
                                </div>
                            </div>
                            <ChevronDown className="text-gray-400" />
                        </div>
                        {expandedModules.has(module.id) && (
                            <div className="border-t border-gray-200 bg-gray-50">
                                {module.lessons?.map((lesson: any) => (
                                    <div key={lesson.id} className="flex items-center justify-between p-4 border-b border-gray-100">
                                        <div className="flex items-center gap-4 text-gray-500">
                                            <Lock size={16} />
                                            <div className="font-bold text-sm">{lesson.title}</div>
                                        </div>
                                        <button onClick={() => setShowAuthModal(true)} className="text-xs font-bold text-gray-400 hover:text-teal-600">Locked</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}

        {/* --- 3. PETRO AI DEMO --- */}
        {activeTab === 'PetroAI' && (
            <div className="max-w-2xl mx-auto animate-in fade-in">
                <div className="bg-white rounded-2xl shadow-xl border-2 border-indigo-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white text-center">
                        <BrainCircuit size={48} className="mx-auto mb-4 text-white/90" />
                        <h2 className="text-3xl font-black mb-2">PetroBot Demo</h2>
                        <p className="opacity-90 text-sm">Create a free account to try 2 queries for free.</p>
                    </div>
                    
                    <div className="p-6 bg-gray-50 min-h-[300px] flex flex-col justify-between">
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-start"><div className="bg-white border border-gray-200 p-3 rounded-xl rounded-bl-none shadow-sm max-w-[85%] text-sm text-gray-700"><span className="font-bold text-indigo-600 block mb-1 text-xs">PetroBot</span>Hello! Ask me anything about Reservoir Engineering or Drilling.</div></div>
                            {aiResponse && (
                                <div className="flex justify-start animate-in fade-in"><div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl rounded-bl-none shadow-sm max-w-[85%] text-sm text-indigo-900"><span className="font-bold text-indigo-600 block mb-1 text-xs">PetroBot</span>{aiResponse}</div></div>
                            )}
                        </div>

                        <form onSubmit={handleAiDemo} className="relative">
                            <input 
                                type="text" 
                                value={demoAiQuery}
                                onChange={(e) => setDemoAiQuery(e.target.value)}
                                placeholder="Ask a question (Login required)..." 
                                className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                            />
                            <button type="submit" disabled={isAiLoading} className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                                {isAiLoading ? <span className="animate-spin text-xs">...</span> : <ArrowRight size={16} />}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        )}

        {/* --- 4. TESTS & RANKINGS (Teasers) --- */}
        {(activeTab === 'Test Series' || activeTab === 'Rankings') && (
            <div className="text-center py-12 animate-in fade-in">
                <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 shadow-xl max-w-xl mx-auto">
                    {activeTab === 'Test Series' ? <ListChecks size={64} className="mx-auto text-teal-600 mb-4"/> : <Trophy size={64} className="mx-auto text-yellow-500 mb-4"/>}
                    <h3 className="text-2xl font-black text-gray-800 mb-2">Premium Feature</h3>
                    <p className="text-gray-500 mb-6">
                        {activeTab === 'Test Series' 
                            ? "Access 50+ Topic Tests, Subject Tests, and Full Mocks with our Premium Plans."
                            : "See how you rank against students across India. Leaderboards unlock with enrollment."}
                    </p>
                    <button onClick={() => setShowAuthModal(true)} className="btn-primary px-8 py-3 rounded-xl font-bold shadow-lg">View Plans</button>
                </div>
            </div>
        )}

      </main>

      {/* STICKY BOTTOM CTA */}
      <div className="fixed bottom-0 w-full bg-white border-t border-teal-100 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
              <div className="hidden md:block">
                  <p className="font-bold text-gray-800">Ready to master Petroleum?</p>
                  <p className="text-xs text-gray-500">Join the elite community today.</p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                  <Link to="/enroll" className="flex-1 md:flex-none btn-primary px-8 py-3 rounded-xl font-bold text-center shadow-lg animate-pulse hover:animate-none">
                      Unlock Full Access
                  </Link>
              </div>
          </div>
      </div>

      {/* AUTH/LIMIT MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setShowAuthModal(false)}>
            <div className="bg-white max-w-sm w-full rounded-2xl p-8 text-center shadow-2xl border-4 border-white relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X /></button>
                
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md">
                    {authModalReason === 'limit' ? <Clock size={32}/> : <Crown size={32}/>}
                </div>
                
                <h2 className="handwritten-title text-3xl font-bold text-gray-800 mb-2">
                    {authModalReason === 'limit' ? "Free Limit Reached" : "Premium Feature"}
                </h2>
                <p className="text-gray-600 mb-6 text-sm">
                    {authModalReason === 'limit' 
                        ? "You've used your free demo attempts. Unlock unlimited access to continue." 
                        : "This content is reserved for Elite members. Upgrade to access."}
                </p>
                
                <div className="space-y-3">
                    <Link to="/enroll" className="block w-full bg-[#0f766e] text-white py-3 rounded-xl font-bold hover:bg-[#0d9488] shadow-lg transition-all transform active:scale-95">
                        View Plans
                    </Link>
                    {!user && (
                        <Link to="/login" className="block w-full py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </div>
      )}

    </div>
  );
}