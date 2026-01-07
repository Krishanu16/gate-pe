import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, useNavigate } from '@tanstack/react-router';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { toast } from 'sonner';
import { 
  Search, Lock, PlayCircle, FileText, CheckCircle, 
  Award, Clock, AlertTriangle, X, ChevronRight, ChevronDown,
  Bookmark, Star, LayoutGrid, ListChecks, Shield, AlertOctagon,
  BarChart2, Zap, Settings // <--- New Imports
} from 'lucide-react';

// --- IMPORT REACT-PDF ---
import { Document, Page, pdfjs } from 'react-pdf';
// Set the worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
      border: 2px solid #0f766e;
      box-shadow: 4px 4px 0px #0f766e;
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.2s ease;
    }
    .module-card:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0px #0f766e; }
    
    .module-card.locked {
      opacity: 0.8;
      border-color: #94a3b8;
      box-shadow: 4px 4px 0px #94a3b8;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: white;
      color: #0f766e;
      border: 2px solid #0f766e;
      box-shadow: 3px 3px 0px #0f766e;
      transition: all 0.1s ease;
    }
    .btn-secondary:hover { transform: translate(-2px, -2px); box-shadow: 5px 5px 0px #0f766e; background: #f0fdfa; }

    .btn-primary {
      background: #14b8a6; color: white;
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
    
    /* PDF CANVAS OVERRIDES */
    .react-pdf__Page__canvas {
        margin: 0 auto;
        box-shadow: 0px 4px 20px rgba(0,0,0,0.1);
        border-radius: 8px;
    }
    .react-pdf__Page__textContent {
        display: none !important; /* Disable text selection layer */
    }
    .react-pdf__Page__annotationLayer {
        display: none !important; /* Disable link layer */
    }
  `}</style>
);

// --- MOCK DATA ---
const MODULES = [
  {
    id: "module-1",
    title: "Introduction to Petroleum",
    icon: "📚",
    lessons: [
      { id: "m1l1", title: "History of Petroleum Industry", type: 'note', pages: 15, duration: '10m' },
      { id: "m1l2", title: "Basic Concepts & Terminology", type: 'note', pages: 0, duration: '15m' },
      { id: "m1l3", title: "Career Opportunities", type: 'note', pages: 12, duration: '8m' }
    ],
    quiz: [
      { q: "Who drilled the first commercial oil well?", options: ["Drake", "Rockefeller", "Ford"], answer: 0 },
      { q: "What constitutes the majority of natural gas?", options: ["Methane", "Ethane", "Propane"], answer: 0 }
    ]
  },
  {
    id: "module-2",
    title: "Geology & Geophysics",
    icon: "🌍",
    lessons: [
      { id: "m2l1", title: "Sedimentary Rocks", type: 'note', pages: 20, duration: '25m' },
      { id: "m2l2", title: "Structural Geology", type: 'note', pages: 0, duration: '30m' },
      { id: "m2l3", title: "Seismic Interpretation", type: 'note', pages: 16, duration: '20m' }
    ],
    quiz: [
      { q: "Which rock type is most associated with oil?", options: ["Igneous", "Sedimentary", "Metamorphic"], answer: 1 },
      { q: "What is used to measure formation resistivity?", options: ["Sonic Log", "Gamma Ray", "Laterolog"], answer: 2 }
    ]
  },
  {
    id: "module-3",
    title: "Reservoir Engineering",
    icon: "🔬",
    lessons: [
      { id: "m3l1", title: "Fluid Properties", type: 'note', pages: 22, duration: '30m' },
      { id: "m3l2", title: "Material Balance", type: 'note', pages: 24, duration: '40m' }
    ],
    quiz: [{ q: "PVT stands for?", options: ["Pressure Volume Temp", "Petroleum Viscosity Time"], answer: 0 }]
  },
  {
    id: "module-4",
    title: "Drilling Engineering",
    icon: "🛢️",
    lessons: [
      { id: "m4l1", title: "Drilling Rigs", type: 'note', pages: 26, duration: '45m' },
      { id: "m4l2", title: "Drilling Fluids", type: 'note', pages: 24, duration: '40m' }
    ],
    quiz: [{ q: "Function of mud?", options: ["Cooling", "Heating", "None"], answer: 0 }]
  }
];

const TEST_SERIES = [
  { id: "test-1", title: "GATE 2025 Mock Test 1", questions: 65, time: "180 mins", price: "Free" },
  { id: "test-2", title: "Reservoir Subject Test", questions: 30, time: "90 mins", price: "₹99" },
  { id: "test-3", title: "GATE 2026 Full Length", questions: 65, time: "180 mins", price: "₹149" },
];

export function DashboardPage() {
  const { user, logout, loading, userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only run this check if we are done loading and have a user
    if (!loading && user && userProfile) {
       // If the 'onboardingComplete' flag is missing or false
       if (!userProfile.onboardingComplete) {
          console.log("Onboarding incomplete. Redirecting...");
          navigate({ to: '/onboarding' });
       }
    }
  }, [loading, user, userProfile, navigate]);

  // --- STATE ---
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [bookmarkedLessons, setBookmarkedLessons] = useState<Set<string>>(new Set());
  const [masteryBadges, setMasteryBadges] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(['module-1']));
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Modules'); 
  const [viewingLesson, setViewingLesson] = useState<any>(null);
  const [quizModule, setQuizModule] = useState<any>(null); 
  const [showLockModal, setShowLockModal] = useState(false);

  // --- NAVIGATION TABS CONFIG ---
  // Define tabs inside component to access navigate
  const tabs = [
    { id: 'Modules', icon: <LayoutGrid size={18} />, label: 'Course Modules', type: 'internal' },
    { id: 'Test Series', icon: <ListChecks size={18} />, label: 'Test Series', type: 'internal' },
    { id: 'Quizzes', icon: <Award size={18} />, label: 'Module Quizzes', type: 'internal' },
    { id: 'Saved', icon: <Bookmark size={18} />, label: 'Saved Items', type: 'internal' },
    // NEW LINKS
    { id: 'Analytics', icon: <BarChart2 size={18} />, label: 'Performance', type: 'link', path: '/analytics' },
    { id: 'Flashcards', icon: <Zap size={18} />, label: 'Formula Blitz', type: 'link', path: '/flashcards' },
  ];

  // --- DERIVED STATE ---
  const isPaidUser = userProfile?.isPaid || false; 

  // --- EFFECTS ---
  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const docRef = doc(db, "users", user.uid);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.completedLessons) setCompletedLessons(new Set(data.completedLessons));
          if (data.bookmarks) setBookmarkedLessons(new Set(data.bookmarks));
          if (data.masteryBadges) setMasteryBadges(new Set(data.masteryBadges));
        }
      };
      fetchUserData();
    }
  }, [user]);

  // --- ACTIONS ---

  const handleLessonStart = async (lesson: any, moduleId: string) => {
    if (!isPaidUser && moduleId !== 'module-1') {
      setShowLockModal(true);
      return;
    }
    setViewingLesson(lesson);

    if (user && !completedLessons.has(lesson.id)) {
      try {
        await setDoc(doc(db, "users", user.uid), {
          completedLessons: arrayUnion(lesson.id)
        }, { merge: true });
        setCompletedLessons(prev => new Set(prev).add(lesson.id));
      } catch (e) { console.error("Error saving progress", e); }
    }
  };

  const toggleBookmark = async (lessonId: string) => {
    if (!user) return;
    const isBookmarked = bookmarkedLessons.has(lessonId);
    
    // Optimistic Update
    const newBookmarks = new Set(bookmarkedLessons);
    if (isBookmarked) newBookmarks.delete(lessonId);
    else newBookmarks.add(lessonId);
    setBookmarkedLessons(newBookmarks);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        bookmarks: isBookmarked ? arrayRemove(lessonId) : arrayUnion(lessonId)
      });
      toast.success(isBookmarked ? "Removed from Saved Items" : "Saved to Bookmarks 🔖");
    } catch (e) {
      console.error("Error updating bookmark", e);
      toast.error("Failed to update bookmark");
    }
  };

  const handleQuizSubmit = async (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) {
      toast.success(`You scored ${score}/${total}! Mastery Badge Earned! 🏅`);
      if (user && quizModule) {
        await setDoc(doc(db, "users", user.uid), {
          masteryBadges: arrayUnion(quizModule.id)
        }, { merge: true });
        setMasteryBadges(prev => new Set(prev).add(quizModule.id));
      }
    } else {
      toast.error(`You scored ${score}/${total}. Try again to earn the badge!`);
    }
    setQuizModule(null);
  };

  // --- DATA FILTERING ---
  const filteredModules = useMemo(() => {
    if (!searchQuery) return MODULES;
    return MODULES.map(mod => {
      const modMatches = mod.title.toLowerCase().includes(searchQuery.toLowerCase());
      const lessonMatches = mod.lessons.some(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()));
      if (modMatches || lessonMatches) return mod;
      return null;
    }).filter(Boolean);
  }, [searchQuery]);

  const savedLessonsList = useMemo(() => {
    const saved: any[] = [];
    MODULES.forEach(mod => {
        mod.lessons.forEach(l => {
            if (bookmarkedLessons.has(l.id)) {
                saved.push({ ...l, moduleTitle: mod.title, moduleId: mod.id });
            }
        });
    });
    return saved;
  }, [bookmarkedLessons]);


  if (loading) return <div className="h-screen flex items-center justify-center text-2xl font-handwritten">Loading Dashboard...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen grid-background handwritten-body flex flex-col">
      <Styles />

      {/* --- HEADER --- */}
      <header className="bg-white border-b-[3px] border-[#0f766e] sticky top-0 z-40 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
             <h1 className="handwritten-title text-3xl font-bold text-gray-800">PE 2026</h1>
             {!isPaidUser && <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-bold border border-orange-200">Free Plan</span>}
          </div>

          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search topics, lessons..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-[#0f766e] focus:outline-none focus:ring-2 focus:ring-[#14b8a6] font-sans"
            />
          </div>

          <div className="flex items-center gap-3">
             {/* NEW: Settings Button */}
             <button onClick={() => navigate({ to: '/settings' })} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors" title="Settings">
                <Settings size={20} />
             </button>

             <div className="hidden md:block text-right">
                <div className="font-bold text-gray-800">{user.displayName}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
             </div>
             <button onClick={() => logout().then(() => navigate({ to: '/' }))} className="btn-secondary px-4 py-2 rounded-lg font-bold text-sm">Logout</button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        
        {/* --- WELCOME --- */}
        <div className="mb-6">
           <h2 className="handwritten-title text-4xl font-bold text-gray-800 mb-2">My Learning Dashboard</h2>
        </div>

        {/* --- NAVIGATION TABS --- */}
        <div className="flex flex-wrap gap-3 mb-8 border-b border-gray-200 pb-4">
           {tabs.map(tab => (
             <div 
               key={tab.id}
               onClick={() => {
                 if (tab.type === 'link' && tab.path) navigate({ to: tab.path });
                 else setActiveTab(tab.id);
               }}
               className={`nav-tab flex items-center gap-2 ${activeTab === tab.id ? 'active' : 'text-gray-600'}`}
             >
               {tab.icon} {tab.label}
             </div>
           ))}
        </div>

        {/* ================= CONTENT AREA ================= */}

        {activeTab === 'Modules' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredModules.map((module: any) => {
              const isLocked = !isPaidUser && module.id !== 'module-1';
              const isMastered = masteryBadges.has(module.id);
              const isExpanded = expandedModules.has(module.id);
              
              const completedCount = module.lessons.filter((l: any) => completedLessons.has(l.id)).length;
              const progress = Math.round((completedCount / module.lessons.length) * 100);

              return (
                <div key={module.id} className={`module-card ${isLocked ? 'locked' : ''}`}>
                  {/* Card Header */}
                  <div 
                    onClick={() => {
                        if (isLocked) setShowLockModal(true);
                        else setExpandedModules(prev => {
                            const newSet = new Set(prev);
                            isExpanded ? newSet.delete(module.id) : newSet.add(module.id);
                            return newSet;
                        });
                    }}
                    className="p-5 cursor-pointer bg-white relative"
                  >
                     <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                           <div className="text-4xl bg-teal-50 p-2 rounded-lg border border-teal-100">{module.icon}</div>
                           <div>
                              <h4 className="handwritten-title text-2xl font-bold text-gray-800 flex items-center gap-2">
                                {module.title}
                                {isMastered && <Award className="text-yellow-500 fill-yellow-100" size={20} />}
                              </h4>
                              <p className="text-sm text-gray-500 font-sans">{module.lessons.length} lessons • {module.quiz?.length || 0} quiz Qs</p>
                           </div>
                        </div>
                        {isLocked ? <Lock className="text-gray-400" /> : (
                            <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                <ChevronDown className="text-[#0f766e]" />
                            </div>
                        )}
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                        <div className="bg-[#14b8a6] h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                     </div>
                     <div className="flex justify-between text-xs text-gray-500 font-sans">
                        <span>{progress}% Completed</span>
                        {isMastered && <span className="text-yellow-600 font-bold">Mastered!</span>}
                     </div>
                  </div>

                  {/* Lessons List */}
                  <div className={`bg-gray-50 border-t border-[#0f766e] transition-all duration-300 ${isExpanded && !isLocked ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                     {module.lessons.map((lesson: any) => {
                       const isDone = completedLessons.has(lesson.id);
                       const isSaved = bookmarkedLessons.has(lesson.id);
                       return (
                         <div key={lesson.id} className="flex items-center justify-between p-3 border-b border-gray-200 hover:bg-teal-50 transition-colors">
                            <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => handleLessonStart(lesson, module.id)}>
                               {isDone ? <CheckCircle size={18} className="text-teal-600" /> : <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-300" />}
                               <div>
                                  <div className="font-bold text-gray-700 text-sm">{lesson.title}</div>
                                  <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <FileText size={12} /> Note • {lesson.duration}
                                  </div>
                               </div>
                            </div>
                            <button onClick={() => toggleBookmark(lesson.id)} className="text-gray-400 hover:text-yellow-500 p-2">
                                {isSaved ? <Star size={18} className="text-yellow-500 fill-yellow-500" /> : <Star size={18} />}
                            </button>
                         </div>
                       );
                     })}
                     <div className="p-3 bg-teal-100 flex justify-center">
                        <button onClick={() => setQuizModule(module)} className="w-full btn-secondary py-2 rounded-lg font-bold flex items-center justify-center gap-2">
                           <Award size={18} /> Take Module Quiz
                        </button>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 2. TEST SERIES VIEW */}
        {activeTab === 'Test Series' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {TEST_SERIES.map((test) => (
               <div key={test.id} className="module-card p-6 bg-white flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                       <h4 className="font-bold text-xl text-gray-800 font-handwritten">{test.title}</h4>
                       <span className={`text-xs px-2 py-1 rounded font-bold ${test.price === 'Free' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                         {test.price}
                       </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                       <span className="flex items-center gap-1"><FileText size={14}/> {test.questions} Qs</span>
                       <span className="flex items-center gap-1"><Clock size={14}/> {test.time}</span>
                    </div>
                  </div>
                  {test.price !== 'Free' && !isPaidUser ? (
                     <button onClick={() => setShowLockModal(true)} className="w-full btn-secondary py-2 rounded-lg font-bold flex items-center justify-center gap-2 text-gray-500 border-gray-300 shadow-none">
                       <Lock size={14} /> Unlock
                     </button>
                  ) : (
                     <button 
                       onClick={() => navigate({ to: '/test/$testId', params: { testId: test.id } })}
                       className="w-full btn-primary py-2 rounded-lg font-bold"
                     >
                       Start Test
                     </button>
                  )}
               </div>
            ))}
          </div>
        )}

        {/* 3. MODULE QUIZZES VIEW */}
        {activeTab === 'Quizzes' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
              {MODULES.map(module => {
                  const isLocked = !isPaidUser && module.id !== 'module-1';
                  const isMastered = masteryBadges.has(module.id);
                  return (
                      <div key={module.id} className={`module-card p-6 ${isLocked ? 'locked' : ''} bg-white relative`}>
                          <div className="flex items-center gap-4 mb-4">
                              <div className="text-3xl bg-teal-50 p-2 rounded-lg">{module.icon}</div>
                              <div>
                                  <h4 className="font-bold text-lg">{module.title}</h4>
                                  <p className="text-xs text-gray-500">{module.quiz?.length || 0} Questions</p>
                              </div>
                          </div>
                          {isMastered ? (
                              <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg text-center font-bold border border-yellow-200 mb-2">
                                  🏆 Mastery Earned!
                              </div>
                          ) : (
                              <p className="text-sm text-gray-600 mb-4">Score 80% or more to earn your mastery badge.</p>
                          )}
                          
                          <button 
                             onClick={() => isLocked ? setShowLockModal(true) : setQuizModule(module)}
                             className={`w-full py-2 rounded-lg font-bold flex items-center justify-center gap-2 ${isLocked ? 'btn-secondary text-gray-400' : 'btn-primary'}`}
                          >
                             {isLocked ? <Lock size={16}/> : <Award size={16}/>} 
                             {isLocked ? 'Unlock Quiz' : 'Take Quiz'}
                          </button>
                      </div>
                  );
              })}
           </div>
        )}

        {/* 4. SAVED ITEMS VIEW */}
        {activeTab === 'Saved' && (
            <div className="animate-in fade-in duration-300">
                {savedLessonsList.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <Bookmark size={48} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="text-xl font-bold mb-2">No Saved Items Yet</h3>
                        <p>Click the <Star size={14} className="inline"/> icon on any lesson to bookmark it here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {savedLessonsList.map((lesson: any) => (
                            <div key={lesson.id} className="module-card p-4 bg-white flex items-center justify-between">
                                <div className="flex items-center gap-4" onClick={() => handleLessonStart(lesson, lesson.moduleId)}>
                                    <div className="bg-teal-50 p-3 rounded-lg text-[#0f766e] cursor-pointer">
                                        <FileText size={24} />
                                    </div>
                                    <div className="cursor-pointer">
                                        <h4 className="font-bold text-lg text-gray-800">{lesson.title}</h4>
                                        <p className="text-xs text-gray-500">From: {lesson.moduleTitle}</p>
                                    </div>
                                </div>
                                <button onClick={() => toggleBookmark(lesson.id)} className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-full">
                                    <Star size={20} className="fill-yellow-500"/>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

      </main>

      {/* --- SECURE VIEWER MODAL (With Anti-Leak Watermark) --- */}
      {viewingLesson && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-0 overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
           
           {/* Close Button */}
           <button onClick={() => setViewingLesson(null)} className="absolute top-4 right-6 text-white/50 hover:text-white transition-colors z-[120]">
             <X size={32} />
           </button>

           <div className="w-full h-full flex flex-col">
              {/* Header */}
              <div className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shrink-0 z-[110]">
                 <div className="flex items-center gap-3">
                    <Shield className="text-green-500" size={18} />
                    <span className="text-gray-300 font-mono text-sm">SECURE VIEWER • LOGGED SESSION</span>
                 </div>
                 <div className="text-gray-400 font-bold">{viewingLesson.title}</div>
                 <div className="w-20"></div> {/* Spacer */}
              </div>

              {/* Main Content Area */}
              <div className="flex-1 relative bg-gray-900 flex items-center justify-center overflow-auto p-4 md:p-8">
                 
                 {/* -------------------------------------------------- */}
                 {/* 1. DYNAMIC WATERMARK LAYER (Rotated & Repeating)   */}
                 {/* -------------------------------------------------- */}
                 <div className="absolute inset-0 pointer-events-none z-[100] overflow-hidden select-none flex flex-wrap content-center justify-center gap-32 opacity-[0.05]">
                    {Array.from({ length: 20 }).map((_, i) => (
                       <div key={i} className="transform -rotate-45 text-white font-black text-2xl whitespace-nowrap">
                          {user.email} <br/> <span className="text-sm font-mono">{user.uid.slice(0, 8)} • {new Date().toLocaleDateString()}</span>
                       </div>
                    ))}
                 </div>

                 {/* -------------------------------------------------- */}
                 {/* 2. DOCUMENT CONTAINER (CANVAS RENDERER)            */}
                 {/* -------------------------------------------------- */}
                 <div className="bg-white shadow-2xl relative z-10 max-w-4xl w-full min-h-[80vh] flex flex-col items-center">
                    
                    {/* PDF RENDERER using React-PDF */}
                    {viewingLesson.contentUrl ? (
                        <div className="w-full h-full bg-gray-100 overflow-auto flex justify-center">
                           <Document
                              file={viewingLesson.contentUrl}
                              loading={<div className="p-10 text-gray-500">Loading Document...</div>}
                              error={<div className="p-10 text-red-500">Failed to load PDF.</div>}
                              className="shadow-lg"
                           >
                              <Page 
                                pageNumber={1} 
                                renderTextLayer={false} 
                                renderAnnotationLayer={false}
                                width={800} // Fixed width for consistency
                                className="border-b border-gray-200"
                              />
                              {/* In a real app, you would map through numPages to show all pages */}
                           </Document>
                        </div>
                    ) : (
                        // Fallback Placeholder
                        <div className="p-12 text-center text-gray-400">
                           <FileText size={64} className="mx-auto mb-4 opacity-20" />
                           <h3 className="text-xl font-bold mb-2">Content Not Available</h3>
                           <p>The secure content for this lesson hasn't been uploaded yet.</p>
                        </div>
                    )}
                    
                 </div>

              </div>
              
              {/* Footer Warning */}
              <div className="h-10 bg-red-900/90 text-red-100 text-xs flex items-center justify-center gap-2 shrink-0 z-[110]">
                 <AlertOctagon size={14} />
                 <span className="font-bold tracking-wider uppercase"> DO NOT SHARE • IP ADDRESS LOGGED • ACCOUNT WILL BE BANNED FOR LEAKS</span>
              </div>
           </div>
        </div>
      )}

      {/* --- QUIZ MODAL --- */}
      {quizModule && (
         <QuizModal 
           module={quizModule} 
           onClose={() => setQuizModule(null)} 
           onSubmit={handleQuizSubmit} 
         />
      )}

      {/* --- LOCK / UPSELL MODAL --- */}
      {showLockModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-white max-w-md w-full rounded-2xl p-8 text-center shadow-2xl border-4 border-orange-100 relative">
              <button onClick={() => setShowLockModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X /></button>
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Lock size={32} />
              </div>
              <h2 className="handwritten-title text-3xl font-bold text-gray-800 mb-2">Unlock Full Access</h2>
              <p className="text-gray-600 mb-6">
                 You are on the Free Plan. Upgrade to <strong>Premium</strong> to unlock all 12 modules, videos, and test series.
              </p>
              <div className="flex gap-3 justify-center">
                 <button onClick={() => setShowLockModal(false)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Maybe Later</button>
                 <button onClick={() => navigate({ to: '/enroll' })} className="btn-primary px-6 py-2 rounded-lg font-bold shadow-lg">Upgrade for ₹1499</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}

// --- SUB-COMPONENTS ---

function QuizModal({ module, onClose, onSubmit }: any) {
  const [answers, setAnswers] = useState<number[]>(new Array(module.quiz?.length || 0).fill(-1));

  const calculateScore = () => {
    let score = 0;
    module.quiz.forEach((q: any, i: number) => {
      if (answers[i] === q.answer) score++;
    });
    return score;
  };

  const handleSubmit = () => {
    if (answers.includes(-1)) {
      toast.error("Please answer all questions!");
      return;
    }
    const score = calculateScore();
    onSubmit(score, module.quiz.length);
  };

  if (!module.quiz || module.quiz.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
         <div className="p-6 bg-[#0f766e] text-white flex justify-between items-center">
            <h3 className="font-bold text-xl flex items-center gap-2"><Award /> Quiz: {module.title}</h3>
            <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full"><X /></button>
         </div>
         
         <div className="p-8 overflow-y-auto flex-1">
            {module.quiz.map((q: any, idx: number) => (
              <div key={idx} className="mb-8">
                 <p className="font-bold text-lg text-gray-800 mb-4">{idx + 1}. {q.q}</p>
                 <div className="space-y-2">
                    {q.options.map((opt: string, optIdx: number) => (
                       <div 
                         key={optIdx}
                         onClick={() => {
                           const newAns = [...answers];
                           newAns[idx] = optIdx;
                           setAnswers(newAns);
                         }}
                         className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-3
                           ${answers[idx] === optIdx 
                              ? 'border-[#0f766e] bg-teal-50 text-[#0f766e] font-bold shadow-md' 
                              : 'border-gray-200 hover:border-teal-200'
                           }`}
                       >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${answers[idx] === optIdx ? 'border-[#0f766e]' : 'border-gray-300'}`}>
                             {answers[idx] === optIdx && <div className="w-2 h-2 bg-[#0f766e] rounded-full" />}
                          </div>
                          {opt}
                       </div>
                    ))}
                 </div>
              </div>
            ))}
         </div>

         <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg">Cancel</button>
            <button onClick={handleSubmit} className="btn-primary px-6 py-2 rounded-lg font-bold">Submit Quiz</button>
         </div>
      </div>
    </div>
  );
}