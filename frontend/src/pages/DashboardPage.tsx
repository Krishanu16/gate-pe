import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, useNavigate } from '@tanstack/react-router';
import { db } from '@/lib/firebase';
import { 
  doc, setDoc, updateDoc, addDoc, deleteDoc, 
  arrayUnion, arrayRemove, collection, getDocs, query, orderBy, limit 
} from 'firebase/firestore';
import { toast } from 'sonner';
import { Logo } from '../components/Logo';
import { 
  Search, Lock, FileText, CheckCircle, 
  Award, Clock, X, ChevronDown, ChevronRight, ChevronLeft,
  Bookmark, Star, LayoutGrid, ListChecks, Shield, AlertOctagon,
  BarChart2, Zap, Settings, User, LogOut, Smartphone, Download, AlertTriangle, Save, ZoomIn, ZoomOut, ShieldAlert,
  Trophy, Bell, Flame, Sparkles, BrainCircuit, ArrowRight, Calculator, Trash2, Timer, Grid, CheckSquare,
  MessageCircle, ThumbsUp, MessageSquare, Send, PlusCircle, Tag, Crown, HelpCircle, Layers, Play
} from 'lucide-react';

// --- IMPORT REACT-PDF ---
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// --- IMPORT GOOGLE AI & MARKDOWN ---
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; 
import confetti from 'canvas-confetti';

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
      white-space: nowrap;
    }
    .nav-tab.active {
      background: #0f766e;
      color: white;
      border-color: #065f46;
      box-shadow: 3px 3px 0px #065f46;
    }
    .nav-tab.hover:not(.active) {
      background: #d1fae5;
      color: #065f46;
    }

    /* FLASHCARD STYLES (FIXED LAYOUT) */
    .flashcard { perspective: 1000px; height: 400px; } 
    .flashcard-inner { position: relative; width: 100%; height: 100%; text-align: center; transition: transform 0.6s; transform-style: preserve-3d; cursor: pointer; }
    .flashcard.flipped .flashcard-inner { transform: rotateY(180deg); }
    
    .flashcard-front, .flashcard-back { 
        position: absolute; 
        width: 100%; 
        height: 100%; 
        -webkit-backface-visibility: hidden; 
        backface-visibility: hidden; 
        border-radius: 16px; 
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); 
        border: 2px solid #0f766e; 
        overflow: hidden; 
        display: block; 
    }
    
    .flashcard-front { background-color: white; color: #1f2937; }
    .flashcard-back { background-color: #0f766e; color: white; transform: rotateY(180deg); }
    
    /* Absolute Positioning for Labels to prevent overlap */
    .card-label {
        position: absolute;
        top: 20px;
        left: 0;
        width: 100%;
        text-align: center;
        z-index: 10;
        pointer-events: none;
    }
    
    .card-counter {
        position: absolute;
        top: 15px;
        right: 15px;
        z-index: 10;
    }

    .card-click-hint {
        position: absolute;
        bottom: 15px;
        width: 100%;
        text-align: center;
        font-size: 0.75rem;
        color: #9ca3af;
        z-index: 10;
    }

    /* SCROLLABLE CONTENT AREAS FOR FLASHCARDS */
    .card-content-scroll {
        margin-top: 60px; /* Push content down below label */
        height: calc(100% - 80px); /* Leave space for bottom hint */
        overflow-y: auto;
        padding: 0 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    /* PREMIUM TEXT GRADIENT */
    .text-premium {
        background: linear-gradient(to right, #b45309, #d97706, #b45309);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 800;
    }
    
    /* PDF VIEWER STYLES */
    .pdf-container { user-select: none; -webkit-user-select: none; }
    .react-pdf__Page__canvas { margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border-radius: 4px; }

    /* MARKDOWN STYLES */
    .prose strong { color: inherit; }
    .katex { font-size: 1.1em; }
  `}</style>
);

export function DashboardPage() {
  const { user, logout, loading, userProfile } = useAuth();
  const navigate = useNavigate();

  // --- DATA STATE ---
  const [modules, setModules] = useState<any[]>([]);
  const [testSeries, setTestSeries] = useState<any[]>([]);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [contentLoading, setContentLoading] = useState(true);

  // --- USER PROGRESS ---
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [bookmarkedLessons, setBookmarkedLessons] = useState<Set<string>>(new Set());
  const [masteryBadges, setMasteryBadges] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(1);
  const [achievements, setAchievements] = useState<string[]>([]);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Modules'); 
  const [viewingLesson, setViewingLesson] = useState<any>(null);
  const [quizModule, setQuizModule] = useState<any>(null); 
  const [showLockModal, setShowLockModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSecurityPolicy, setShowSecurityPolicy] = useState(false);
  const [showNotices, setShowNotices] = useState(false);
  const [hasUnreadNotices, setHasUnreadNotices] = useState(false); // SMART NOTIFICATION
  const [showCalculator, setShowCalculator] = useState(false);
  
  // Rankings Timer
  const [timeUntilReset, setTimeUntilReset] = useState("");

  // Settings & Profile
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newName, setNewName] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetReason, setResetReason] = useState('');

  // PWA / Install
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showIOSInstall, setShowIOSInstall] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  // Flashcard State
// --- MISSING FLASHCARD STATE & LOGIC ---
  const [activeDeck, setActiveDeck] = useState<any[] | null>(null);
  const [activeDeckTitle, setActiveDeckTitle] = useState<string>("");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardTopic, setFlashcardTopic] = useState('');
  const [isGeneratingCards, setIsGeneratingCards] = useState(false);
  const [savedDecks, setSavedDecks] = useState<any[]>([]);

  // Group Admin Cards by Category
  const groupedAdminCards = useMemo(() => {
      const groups: Record<string, any[]> = {};
      flashcards.forEach(fc => {
          const cat = fc.category || 'General Cards';
          if(!groups[cat]) groups[cat] = [];
          groups[cat].push(fc);
      });
      return groups;
  }, [flashcards]);

  // Handler to start a deck
  const handleStartDeck = (deck: any[], title: string) => {
      if(!deck || deck.length === 0) { 
          toast.error("This deck is empty."); 
          return; 
      }
      setActiveDeck(deck);
      setActiveDeckTitle(title);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  // --- AI SEARCH STATE ---
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRelatedLessons, setAiRelatedLessons] = useState<any[]>([]);

  // --- TEST ENGINE STATE ---
  const [activeTest, setActiveTest] = useState<any>(null);
  const [testTimeLeft, setTestTimeLeft] = useState(180 * 60);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({});
  const [questionStatus, setQuestionStatus] = useState<Record<number, 'visited' | 'answered' | 'marked' | 'marked_answered'>>({});

  // --- FORUM STATE ---
  const [forumPosts, setForumPosts] = useState<any[]>([]);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', body: '', tag: 'General' });
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  // --- DERIVED STATE ---
  const isPaidUser = userProfile?.isPaid || false; 
  const greeting = useMemo(() => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good Morning";
      if (hour < 18) return "Good Afternoon";
      return "Good Evening";
  }, []);

  // --- EFFECTS ---
  useEffect(() => {
    if (!user) return;
    const fetchContent = async () => {
        try {
            // 1. Modules (Robust Sort)
            const modSnap = await getDocs(query(collection(db, "modules"), orderBy("order", "asc")));
            setModules(modSnap.docs.map(d => ({id: d.id, ...d.data()})));

            // 2. Tests
            const testSnap = await getDocs(collection(db, "testSeries"));
            setTestSeries(testSnap.docs.map(d => ({id: d.id, ...d.data()})));

            // 3. Flashcards (Global)
            const flashSnap = await getDocs(collection(db, "flashcards"));
            setFlashcards(flashSnap.docs.map(d => ({id: d.id, ...d.data()})));

            // 4. Leaderboard (PERFORMANCE BASED: Total Test Score)
            try {
                const userRef = collection(db, "users");
                // Fetch users (Limit to 50 for efficiency)
                const userSnap = await getDocs(query(userRef, limit(50))); 
                
                const rankedUsers = userSnap.docs.map(doc => {
                    const data = doc.data();
                    // Calculate Score: Sum of all test scores in the array
                    const totalScore = (data.testResults || []).reduce((acc: number, curr: any) => acc + (parseFloat(curr.score) || 0), 0);
                    return { 
                        id: doc.id, 
                        name: data.name || "Anonymous", 
                        badges: data.masteryBadges?.length || 0,
                        score: totalScore.toFixed(1) // Keep 1 decimal
                    };
                })
                .sort((a, b) => parseFloat(b.score) - parseFloat(a.score)) // Sort Descending Score
                .slice(0, 10); // Keep Top 10

                setLeaderboard(rankedUsers);
            } catch (err) {
                console.error("Leaderboard error:", err);
            }

            // 5. Fetch User Saved Decks (Explicit Path)
            try {
              const decksSnap = await getDocs(collection(db, "users", user.uid, "saved_flashcards"));
              const fetchedDecks = decksSnap.docs.map(d => ({id: d.id, ...d.data()}));
              setSavedDecks(fetchedDecks);
            } catch (e) { console.log("No saved decks yet"); }

            // 6. Fetch Forum Posts
            const forumSnap = await getDocs(query(collection(db, "forum_posts"), orderBy("createdAt", "desc"), limit(20)));
            setForumPosts(forumSnap.docs.map(d => ({id: d.id, ...d.data()})));

            // 7. Notices & Smart Notification Logic
            try {
                const noticeRef = collection(db, "notices");
                const noticeSnap = await getDocs(query(noticeRef, orderBy("date", "desc"), limit(5)));
                
                if (!noticeSnap.empty) {
                    const fetchedNotices = noticeSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                    setNotices(fetchedNotices);

                    // Check Local Storage
                    const lastReadId = localStorage.getItem('lastReadNoticeId');
                    // Show red dot ONLY if the newest notice ID is different from what we saved
                    if (fetchedNotices[0].id !== lastReadId) {
                        setHasUnreadNotices(true);
                    }
                } else {
                    setNotices([{ id: 'default', text: "Welcome to Petro Elite! Check here for updates.", date: "Just now", type: "info" }]);
                }
            } catch (err) {
                console.log("Notice fetch error:", err);
            }

        } catch (e) {
            console.error("Error fetching content:", e);
        } finally {
            setContentLoading(false);
        }
    };
    fetchContent();
  }, [user]);

  // Weekly Timer Logic (Updated for Seconds)
  useEffect(() => {
    const updateTimer = () => {
        const now = new Date();
        const nextSunday = new Date(now);
        nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
        nextSunday.setHours(24, 0, 0, 0); // Midnight Sunday

        const diff = nextSunday.getTime() - now.getTime();
        
        if (diff <= 0) {
            setTimeUntilReset("Resetting...");
        } else {
            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60); // Added Seconds
            setTimeUntilReset(`${d}d ${h}h ${m}m ${s}s`);
        }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000); // Update every second
    return () => clearInterval(interval);
  }, []);

  // Gamification Engine
  useEffect(() => {
    if (!user || !userProfile) return;
    const runGamification = async () => {
      const today = new Date().toLocaleDateString();
      const lastLogin = userProfile.lastLoginDate;
      let newStreak = userProfile.streak || 1;
      let newAchievements = userProfile.achievements || [];
      let updates: any = {};
      let badgeEarned = false;

      if (lastLogin !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastLogin === yesterday.toLocaleDateString()) newStreak += 1; else newStreak = 1;
        updates.lastLoginDate = today; updates.streak = newStreak;
      }
      setStreak(newStreak);

      const grantBadge = (badge: string) => {
        if (!newAchievements.includes(badge)) {
          newAchievements.push(badge);
          badgeEarned = true;
          toast.success(`Badge Unlocked: ${badge}! 🏆`);
        }
      };

      if (newStreak >= 7) grantBadge("Week Warrior");
      if (userProfile.testResults?.length > 0) grantBadge("Test Pilot");
      const hasHighScore = userProfile.testResults?.some((r: any) => (r.score / r.totalQ) >= 0.8);
      if (hasHighScore) grantBadge("Scholar");

      if (Object.keys(updates).length > 0 || badgeEarned) {
        await updateDoc(doc(db, "users", user.uid), { ...updates, achievements: newAchievements });
        setAchievements(newAchievements);
        if (badgeEarned) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#0f766e', '#fbbf24', '#ef4444'] });
      } else { setAchievements(newAchievements); }
    };
    runGamification();
  }, [user, userProfile]);

  // Timer Effect (Tests)
  useEffect(() => {
    if (!activeTest || testTimeLeft <= 0) return;
    const timer = setInterval(() => setTestTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [activeTest, testTimeLeft]);

  // PWA Install Listener
  useEffect(() => {
    const handler = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Search Filter
  const filteredModules = useMemo(() => {
    if (!searchQuery) return modules;
    return modules.map(mod => {
      const modMatches = mod.title.toLowerCase().includes(searchQuery.toLowerCase());
      const lessonMatches = mod.lessons?.some((l:any) => l.title.toLowerCase().includes(searchQuery.toLowerCase()));
      if (modMatches || lessonMatches) return mod;
      return null;
    }).filter(Boolean);
  }, [searchQuery, modules]);

  // Saved Lessons (Bookmarks Fetching)
  useEffect(() => {
    if (userProfile) {
        if (userProfile.completedLessons) setCompletedLessons(new Set(userProfile.completedLessons));
        if (userProfile.bookmarks) setBookmarkedLessons(new Set(userProfile.bookmarks)); // LOAD BOOKMARKS FROM FIRESTORE
        if (userProfile.masteryBadges) setMasteryBadges(new Set(userProfile.masteryBadges));
        setNewName(user?.displayName || '');
    }
  }, [userProfile, user]);

  const savedLessonsList = useMemo(() => {
    const saved: any[] = [];
    modules.forEach(mod => {
        mod.lessons?.forEach((l:any) => {
            if (bookmarkedLessons.has(l.id)) saved.push({ ...l, moduleTitle: mod.title, moduleId: mod.id });
        });
    });
    return saved;
  }, [bookmarkedLessons, modules]);

  if (loading || contentLoading) return <div className="h-screen flex items-center justify-center font-handwritten text-[#0f766e]">Loading Dashboard...</div>;
  if (!user) return <Navigate to="/signup" replace />; 

  // --- HANDLERS ---
  const handleOpenNotices = () => {
    setShowNotices(true);
    setHasUnreadNotices(false); // Clear Red Dot
    if (notices.length > 0) {
        localStorage.setItem('lastReadNoticeId', notices[0].id); // Save current ID as read
    }
  };

  const handleLessonStart = async (lesson: any, moduleId: string) => {
    if (!isPaidUser && moduleId !== 'module-1') { setShowLockModal(true); return; }
    setViewingLesson(lesson);
    if (user && !completedLessons.has(lesson.id)) {
      try {
        await setDoc(doc(db, "users", user.uid), { completedLessons: arrayUnion(lesson.id) }, { merge: true });
        setCompletedLessons(prev => new Set(prev).add(lesson.id));
      } catch (e) { console.error(e); }
    }
  };

  const toggleBookmark = async (lessonId: string) => {
    if (!user) return;
    const isBookmarked = bookmarkedLessons.has(lessonId);
    setBookmarkedLessons(prev => { const n = new Set(prev); isBookmarked ? n.delete(lessonId) : n.add(lessonId); return n; });
    try {
      await updateDoc(doc(db, "users", user.uid), { bookmarks: isBookmarked ? arrayRemove(lessonId) : arrayUnion(lessonId) });
      toast.success(isBookmarked ? "Removed from Saved" : "Saved to Bookmarks");
    } catch (e) { toast.error("Failed to update"); }
  };

  const handleQuizSubmit = async (score: number, total: number) => {
    if ((score/total)*100 >= 80) {
      toast.success(`Score: ${score}/${total} - Mastery Earned! 🏅`);
      if (user && quizModule) {
        await setDoc(doc(db, "users", user.uid), { masteryBadges: arrayUnion(quizModule.id) }, { merge: true });
        setMasteryBadges(prev => new Set(prev).add(quizModule.id));
      }
    } else { toast.error(`Score: ${score}/${total} - Try again!`); }
    setQuizModule(null);
  };

  // --- AI FLASHCARD LOGIC ---
  // --- HELPER: Generate Cards (AI) ---
  const handleGenerateFlashcards = async () => {
    if (!flashcardTopic.trim()) { toast.error("Please enter a topic first!"); return; }
    if (!import.meta.env.VITE_GEMINI_API_KEY) { toast.error("AI Key missing"); return; }

    setIsGeneratingCards(true);
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `
        You are an expert Petroleum Engineering Tutor. Generate 5 Flashcards on "${flashcardTopic}".
        Rules:
        1. "q": Question/Concept. "a": detailed Answer.
        2. Use strictly LaTeX format for math formulas (wrap in $ signs). E.g. $E=mc^2$.
        3. Return strictly valid JSON array: [{ "q": "...", "a": "..." }].
        4. No markdown ticks around the JSON.
      `;
      
      const result = await model.generateContent(prompt);
      const cleanJson = result.response.text().replace(/```json|```/g, "").trim();
      const newCards = JSON.parse(cleanJson);
      
      setFlashcards(newCards); 
      handleStartDeck(newCards, `AI: ${flashcardTopic}`); // Auto-start the generated deck
      toast.success(`Generated cards on ${flashcardTopic}!`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate cards. Try again.");
    } finally {
      setIsGeneratingCards(false);
    }
  };

  // --- HELPER: Save Deck ---
  const handleSaveDeck = async () => {
    if (!activeDeck || activeDeck.length === 0) return;
    try {
      const docRef = await addDoc(collection(db, "users", user.uid, "saved_flashcards"), {
        topic: activeDeckTitle || "Generated Deck", 
        cards: activeDeck, 
        date: new Date().toISOString()
      });
      setSavedDecks(prev => [...prev, { id: docRef.id, topic: activeDeckTitle || "Generated Deck", cards: activeDeck, date: new Date().toISOString() }]);
      toast.success("Deck saved!");
    } catch (e) { toast.error("Failed to save."); }
  };

  // --- HELPER: Delete Deck ---
  const handleDeleteDeck = async (deckId: string) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "saved_flashcards", deckId));
      setSavedDecks(prev => prev.filter(d => d.id !== deckId));
      toast.success("Deck deleted.");
    } catch (e) { toast.error("Could not delete."); }
  };

  // --- HELPER: Load Saved Deck ---
  const handleLoadDeck = (deck: any) => {
    handleStartDeck(deck.cards, deck.topic);
  };

  // --- AI SEARCH LOGIC ---
  const handleAiSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!aiQuery.trim()) return;
      if (!import.meta.env.VITE_GEMINI_API_KEY) { toast.error("AI Service Unavailable"); return; }

      setAiLoading(true); setAiResponse(''); setAiRelatedLessons([]);
      
      const matches: any[] = [];
      modules.forEach(mod => {
          mod.lessons?.forEach((l: any) => {
              if (l.title.toLowerCase().includes(aiQuery.toLowerCase())) matches.push({...l, moduleTitle: mod.title, moduleId: mod.id});
          });
      });
      setAiRelatedLessons(matches.slice(0, 3));

      try {
          const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});
          const prompt = `
            You are 'PetroBot', an elite Petroleum Engineering consultant.
            Question: "${aiQuery}"
            Rules:
            1. Answer clearly and professionally.
            2. Use LaTeX for ALL formulas (wrap in $...$).
            3. Provide a practical example if possible.
          `;
          const result = await model.generateContent(prompt);
          setAiResponse(result.response.text());
      } catch (error) {
          toast.error("AI Brain is offline.");
          setAiResponse("I couldn't process that. Try again.");
      } finally { setAiLoading(false); }
  };

  // --- FORUM LOGIC ---
  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.body.trim()) { toast.error("Please fill all fields"); return; }
    
    const postData = {
      title: newPost.title, body: newPost.body, tag: newPost.tag,
      author: user.displayName || "Anonymous", authorId: user.uid,
      createdAt: new Date().toISOString(), votes: [], comments: []
    };
    try {
      const docRef = await addDoc(collection(db, "forum_posts"), postData);
      setForumPosts(prev => [{ id: docRef.id, ...postData }, ...prev]);
      setShowNewPostModal(false); setNewPost({ title: '', body: '', tag: 'General' });
      toast.success("Post live!");
    } catch (e) { toast.error("Failed to post."); }
  };

  const handleVote = async (postId: string, currentVotes: string[]) => {
    const isVoted = currentVotes.includes(user.uid);
    let newVotes = isVoted ? currentVotes.filter(id => id !== user.uid) : [...currentVotes, user.uid];
    setForumPosts(prev => prev.map(p => p.id === postId ? { ...p, votes: newVotes } : p));
    try { await updateDoc(doc(db, "forum_posts", postId), { votes: newVotes }); } catch (e) { console.error(e); }
  };

  const handleAddComment = async (postId: string) => {
    if (!newComment.trim()) return;
    const commentData = { text: newComment, author: user.displayName, createdAt: new Date().toISOString() };
    setForumPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...(p.comments || []), commentData] } : p));
    try { await updateDoc(doc(db, "forum_posts", postId), { comments: arrayUnion(commentData) }); setNewComment(''); } catch (e) { toast.error("Failed to comment"); }
  };

  // --- INSTALL LOGIC ---
  const handleInstallClick = () => {
    if (installPrompt) {
        installPrompt.prompt().then((res:any) => {
            if (res.outcome === 'accepted') setInstallPrompt(null);
        });
        return;
    }
    // Show manual guide for others (iOS/PC)
    setShowInstallGuide(true);
  };

  // --- USER LOGIC ---
  const handleUpdateProfile = async () => {
    if (!user || !newName.trim()) return;
    try {
        await updateDoc(doc(db, "users", user.uid), { name: newName });
        toast.success("Profile updated!"); setIsEditingProfile(false);
    } catch (error) { toast.error("Failed to update profile."); }
  };

  const handleResetRequest = async () => {
      if (!resetReason.trim()) { toast.error("Please provide a reason."); return; }
      try {
          await addDoc(collection(db, "device_reset_requests"), {
              userId: user.uid, userEmail: user.email, reason: resetReason, status: 'pending', createdAt: new Date().toISOString()
          });
          toast.success("Request sent to Admin!"); setShowResetModal(false); setResetReason('');
      } catch (error) { toast.error("Failed to send request."); }
  };

  // --- MOCK TEST LOGIC ---
  const startMockTest = (testId: string) => {
    const mockQuestions = Array.from({ length: 65 }).map((_, i) => ({
        id: i + 1,
        text: i < 10 ? `General Aptitude Q${i + 1}: Choose the correct synonym for 'Ephemeral'.` : `Technical Q${i + 1}: Calculate porosity if bulk density is 2.4 g/cc and grain density is 2.65 g/cc.`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct: 0, marks: i < 30 ? 1 : 2, negative: i < 30 ? 0.33 : 0.66
    }));
    setActiveTest({ id: testId, title: "Full Length Mock Test - 1", questions: mockQuestions });
    setTestTimeLeft(180 * 60); setUserAnswers({}); setQuestionStatus({}); setCurrentQIndex(0);
    document.documentElement.requestFullscreen().catch(() => {});
  };

  const handleAnswer = (optionIdx: number) => { setUserAnswers(prev => ({...prev, [currentQIndex]: optionIdx})); };
  const handleSaveNext = () => {
      const status = userAnswers[currentQIndex] !== undefined ? 'answered' : 'visited';
      setQuestionStatus(prev => ({...prev, [currentQIndex]: status}));
      if (currentQIndex < (activeTest?.questions.length || 0) - 1) setCurrentQIndex(prev => prev + 1);
  };
  const submitTest = async () => {
      if (!activeTest) return;
      let score = 0, correct = 0, wrong = 0;
      activeTest.questions.forEach((q: any, idx: number) => {
          const ans = userAnswers[idx];
          if (ans !== undefined) {
              if (ans === q.correct) { score += q.marks; correct++; }
              else { score -= q.negative; wrong++; }
          }
      });
      try {
          await updateDoc(doc(db, "users", user.uid), {
              testResults: arrayUnion({ testId: activeTest.id, title: activeTest.title, score: score.toFixed(2), totalQ: activeTest.questions.length, date: new Date().toISOString() })
          });
          toast.success(`Test Submitted! Score: ${score.toFixed(2)}`);
          setActiveTest(null); document.exitFullscreen().catch(() => {});
      } catch (e) { toast.error("Error submitting result"); }
  };

  // --- TABS CONFIG ---
  const tabs = [
    { id: 'Modules', icon: <LayoutGrid size={18} />, label: 'Modules' },
    { id: 'Community', icon: <MessageCircle size={18} />, label: 'Community' },
    { id: 'PetroAI', icon: <BrainCircuit size={18} />, label: 'PetroAI' },
    { id: 'Test Series', icon: <ListChecks size={18} />, label: 'Tests' },
    { id: 'Quizzes', icon: <Award size={18} />, label: 'Quizzes' },
    { id: 'Rankings', icon: <Trophy size={18} />, label: 'Rankings' },
    { id: 'Analytics', icon: <BarChart2 size={18} />, label: 'Stats' },
    { id: 'Saved', icon: <Bookmark size={18} />, label: 'Saved' },
    { id: 'Flashcards', icon: <Zap size={18} />, label: 'Flashcards' },
  ];

  // --- TEST MODE RENDER HIJACK ---
  if (activeTest) {
      const q = activeTest.questions[currentQIndex];
      const formatTime = (s: number) => { const m = Math.floor(s / 60); const sec = s % 60; return `${m}:${sec < 10 ? '0' : ''}${sec}`; };

      return (
          <div className="min-h-screen bg-gray-100 flex flex-col font-sans select-none">
              <div className="bg-white border-b p-2 flex justify-between items-center h-14 shadow-sm">
                  <div className="font-bold text-lg text-[#0f766e] flex items-center gap-2"><div className="bg-teal-600 text-white p-1 rounded"><Logo /></div> {activeTest.title}</div>
                  <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end"><span className="text-xs text-gray-500">Time Left</span><span className="font-mono text-xl font-bold text-gray-800 bg-gray-100 px-2 rounded border border-gray-300">{formatTime(testTimeLeft)}</span></div>
                      <button onClick={submitTest} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-bold text-sm">Submit Test</button>
                  </div>
              </div>
              <div className="flex-1 flex overflow-hidden">
                  <div className="flex-1 flex flex-col p-4 overflow-y-auto">
                      <div className="flex gap-2 mb-4"><button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-t-lg text-sm">Technical</button><button className="px-4 py-2 bg-gray-200 text-gray-600 font-bold rounded-t-lg text-sm hover:bg-gray-300">Aptitude</button></div>
                      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm flex-1">
                          <div className="flex justify-between border-b pb-4 mb-4"><h3 className="font-bold text-lg text-gray-800">Question {currentQIndex + 1}</h3><div className="flex gap-2 text-xs font-bold"><span className="text-green-600">+ {q.marks} marks</span><span className="text-red-500">- {q.negative} marks</span></div></div>
                          <p className="text-lg text-gray-800 mb-8 leading-relaxed">{q.text}</p>
                          <div className="space-y-3 max-w-2xl">
                              {q.options.map((opt: string, idx: number) => (
                                  <div key={idx} onClick={() => handleAnswer(idx)} className={`p-4 border-2 rounded-lg cursor-pointer flex items-center gap-3 transition-all ${userAnswers[currentQIndex] === idx ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${userAnswers[currentQIndex] === idx ? 'border-blue-500' : 'border-gray-400'}`}>{userAnswers[currentQIndex] === idx && <div className="w-3 h-3 bg-blue-500 rounded-full" />}</div>
                                      <span className="font-medium text-gray-700">{opt}</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                      <div className="mt-4 flex justify-between">
                          <div className="flex gap-2"><button onClick={() => { const status = userAnswers[currentQIndex] !== undefined ? 'marked_answered' : 'marked'; setQuestionStatus(prev => ({...prev, [currentQIndex]: status})); if(currentQIndex < activeTest.questions.length - 1) setCurrentQIndex(prev => prev + 1); }} className="px-4 py-2 bg-purple-100 text-purple-700 font-bold rounded border border-purple-200 hover:bg-purple-200">Mark for Review</button><button onClick={() => { setUserAnswers(prev => { const n = {...prev}; delete n[currentQIndex]; return n; }) }} className="px-4 py-2 bg-gray-100 text-gray-600 font-bold rounded border border-gray-300 hover:bg-gray-200">Clear</button></div>
                          <button onClick={handleSaveNext} className="px-8 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 shadow-lg flex items-center gap-2">Save & Next <ChevronRight size={16}/></button>
                      </div>
                  </div>
                  <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
                      <div className="p-4 bg-gray-50 border-b">
                          <div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-xl">{user.displayName?.charAt(0)}</div><div><div className="font-bold text-sm">{user.displayName}</div></div></div>
                          <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 font-bold">
                              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-sm"/> Answered</div><div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded-sm"/> Not Answered</div><div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-200 rounded-sm"/> Not Visited</div><div className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-500 rounded-full"/> Marked</div>
                          </div>
                      </div>
                      <div className="p-4 flex-1 overflow-y-auto">
                          <h4 className="font-bold text-gray-700 mb-2 text-sm bg-blue-50 p-2 rounded">Question Palette</h4>
                          <div className="grid grid-cols-5 gap-2">
                              {activeTest.questions.map((_: any, i: number) => {
                                  const status = questionStatus[i];
                                  let bgClass = "bg-gray-100 text-gray-600";
                                  if (status === 'answered') bgClass = "bg-green-500 text-white";
                                  else if (status === 'visited') bgClass = "bg-red-500 text-white";
                                  else if (status === 'marked') bgClass = "bg-purple-500 text-white rounded-full";
                                  else if (status === 'marked_answered') bgClass = "bg-purple-500 text-white ring-2 ring-green-400";
                                  return ( <button key={i} onClick={() => setCurrentQIndex(i)} className={`h-10 w-10 rounded font-bold text-sm flex items-center justify-center transition-all ${bgClass} ${currentQIndex === i ? "ring-2 ring-blue-500 ring-offset-1" : ""}`}>{i + 1}</button> );
                              })}
                          </div>
                      </div>
                  </div>
              </div>
              {showCalculator && <DraggableCalculator onClose={() => setShowCalculator(false)} />}
          </div>
      );
  }

  // --- DASHBOARD RENDER ---
  return (
    <div className="min-h-screen grid-background handwritten-body flex flex-col">
      <Styles />

      <header className="bg-white border-b-[3px] border-[#0f766e] sticky top-0 z-40 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4"><Logo />
            {!isPaidUser ? (
                <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-bold border border-orange-200">Free Plan</span>
            ) : (
                <span className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 text-xs px-2 py-1 rounded-full font-bold border border-amber-300 flex items-center gap-1 shadow-sm">
                    <Crown size={12} className="fill-amber-500"/> Premium
                </span>
            )}
          </div>
          <div className="relative w-full md:w-96"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-[#0f766e] focus:outline-none focus:ring-2 focus:ring-[#14b8a6] font-sans" /></div>
          <div className="flex items-center gap-2">
             <button onClick={() => setShowCalculator(!showCalculator)} className={`p-2 rounded-full transition-colors ${showCalculator ? 'bg-teal-100 text-teal-700' : 'text-gray-500 hover:bg-gray-100'}`} title="Virtual Calculator"><Calculator size={20} /></button>
             <button onClick={handleOpenNotices} className="p-2 text-gray-500 hover:bg-yellow-50 hover:text-yellow-600 rounded-full transition-colors relative" title="Notices"><Bell size={20} />{hasUnreadNotices && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}</button>
             
             {/* INSTALL BUTTON: Force visible for everyone, with fallback */}
             <button 
                onClick={handleInstallClick} 
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors" 
                title="Install App"
             >
                <Download size={20} />
             </button>

             <button onClick={() => setShowSecurityPolicy(true)} className="p-2 text-teal-600 hover:bg-teal-50 rounded-full transition-colors" title="Security Policy"><ShieldAlert size={20} /></button>
             <button onClick={() => setShowSettings(true)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors" title="Settings"><Settings size={20} /></button>
             <div className="hidden md:block text-right px-2"><div className="font-bold text-gray-800">{user.displayName}</div><div className="text-xs text-gray-500">{user.email}</div></div>
             <button onClick={() => logout().then(() => navigate({ to: '/' }))} className="btn-secondary px-4 py-2 rounded-lg font-bold text-sm">Logout</button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        <div className="mb-8 flex justify-between items-end">
           <div><div className="text-gray-500 font-bold text-sm mb-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div><h2 className="handwritten-title text-4xl font-bold text-gray-800">{greeting}, {user.displayName?.split(' ')[0]}!</h2></div>
           <div className="flex flex-col items-end gap-2">
               <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold transition-all ${streak > 1 ? 'bg-orange-100 border-orange-200 text-orange-700 animate-pulse' : 'bg-gray-100 border-gray-200 text-gray-500'}`}><Flame className={streak > 1 ? "fill-orange-500 text-orange-500" : "text-gray-400"} size={20} /><span>{streak} Day Streak</span></div>
               {achievements.length > 0 && ( <div className="flex gap-1">{achievements.includes("Week Warrior") && <span title="Week Warrior" className="text-xl cursor-help">🔥</span>}{achievements.includes("Scholar") && <span title="Scholar" className="text-xl cursor-help">🎓</span>}{achievements.includes("Test Pilot") && <span title="Test Pilot" className="text-xl cursor-help">🚀</span>}</div> )}
           </div>
        </div>

        <div className="flex overflow-x-auto pb-2 gap-3 mb-8 border-b border-gray-200">
           {tabs.map(tab => (<div key={tab.id} onClick={() => setActiveTab(tab.id)} className={`nav-tab flex items-center gap-2 ${activeTab === tab.id ? 'active' : 'text-gray-600'}`}>{tab.icon} {tab.label}</div>))}
        </div>

        {/* 1. MODULES */}
        {activeTab === 'Modules' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredModules.length === 0 ? <div className="text-gray-500 italic">No modules found. Admin needs to add content.</div> : 
            filteredModules.map((module: any) => {
              const isLocked = !isPaidUser && module.id !== 'module-1' && !module.isFree;
              const isMastered = masteryBadges.has(module.id);
              const isExpanded = expandedModules.has(module.id);
              const totalLessons = module.lessons?.length || 0;
              const completedCount = module.lessons?.filter((l: any) => completedLessons.has(l.id)).length || 0;
              const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

              return (
                <div key={module.id} className={`module-card ${isLocked ? 'locked' : ''}`}>
                  <div onClick={() => { if (isLocked) setShowLockModal(true); else setExpandedModules(prev => { const n = new Set(prev); isExpanded ? n.delete(module.id) : n.add(module.id); return n; }); }} className="p-5 cursor-pointer bg-white relative">
                      <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-4">
                             <div className="text-4xl bg-teal-50 p-2 rounded-lg border border-teal-100">{module.icon}</div>
                             <div><h4 className="handwritten-title text-2xl font-bold text-gray-800 flex items-center gap-2">{module.title} {isMastered && <Award className="text-yellow-500 fill-yellow-100" size={20} />}</h4><p className="text-sm text-gray-500 font-sans">{totalLessons} lessons</p></div>
                          </div>
                          {isLocked ? <Lock className="text-gray-400" /> : <ChevronDown className={`text-[#0f766e] transform transition ${isExpanded ? 'rotate-180':''}`} />}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1"><div className="bg-[#14b8a6] h-2.5 rounded-full" style={{ width: `${progress}%` }}></div></div>
                  </div>
                  <div className={`bg-gray-50 border-t border-[#0f766e] transition-all duration-300 ${isExpanded && !isLocked ? 'max-h-[500px] opacity-100 overflow-y-auto' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                      {module.lessons?.map((lesson: any) => {
                        const isDone = completedLessons.has(lesson.id);
                        const isSaved = bookmarkedLessons.has(lesson.id);
                        return (
                          <div key={lesson.id} className="flex items-center justify-between p-3 border-b border-gray-200 hover:bg-teal-50 transition-colors">
                             <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => handleLessonStart(lesson, module.id)}>
                                {isDone ? <CheckCircle size={18} className="text-teal-600" /> : <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-300" />}
                                <div><div className="font-bold text-gray-700 text-sm">{lesson.title}</div></div>
                             </div>
                             <button onClick={() => toggleBookmark(lesson.id)} className="text-gray-400 hover:text-yellow-500 p-2">{isSaved ? <Star size={18} className="text-yellow-500 fill-yellow-500" /> : <Star size={18} />}</button>
                          </div>
                        );
                      })}
                      <div className="p-3 bg-teal-100 flex justify-center"><button onClick={() => setQuizModule(module)} className="w-full btn-secondary py-2 rounded-lg font-bold flex items-center justify-center gap-2"><Award size={18} /> Take Module Quiz</button></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* --- COMMUNITY FORUM TAB --- */}
        {activeTab === 'Community' && (
            <div className="max-w-3xl mx-auto animate-in fade-in duration-500 relative min-h-[50vh]">
                <div className="flex justify-between items-center mb-6">
                    <div><h2 className="text-2xl font-bold text-gray-800">Student Discussions</h2><p className="text-gray-500 text-sm">Ask doubts, share tips, and learn together.</p></div>
                    <button onClick={() => setShowNewPostModal(true)} className="btn-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"><PlusCircle size={18} /> New Post</button>
                </div>
                <div className="space-y-4">
                    {forumPosts.length === 0 ? ( <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200"><MessageSquare size={48} className="mx-auto text-gray-300 mb-4" /><p className="text-gray-500 font-medium">Be the first to start a discussion!</p></div> ) : forumPosts.map(post => (
                        <div key={post.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-teal-300 transition-colors">
                            <div className="flex justify-between items-start mb-3"><div><span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full mb-2 inline-block ${post.tag === 'Drilling' ? 'bg-blue-100 text-blue-700' : post.tag === 'Production' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{post.tag}</span><h3 className="text-lg font-bold text-gray-900 leading-tight">{post.title}</h3></div><span className="text-xs text-gray-400 whitespace-nowrap">{new Date(post.createdAt).toLocaleDateString()}</span></div>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.body}</p>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100"><div className="flex gap-4"><button onClick={() => handleVote(post.id, post.votes || [])} className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${post.votes?.includes(user.uid) ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}><ThumbsUp size={16} className={post.votes?.includes(user.uid) ? 'fill-blue-600' : ''} />{post.votes?.length || 0}</button><button onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)} className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-teal-600 transition-colors"><MessageCircle size={16} />{post.comments?.length || 0} Comments</button></div><span className="text-xs font-medium text-gray-400">by {post.author}</span></div>
                            {expandedPostId === post.id && ( <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50 -mx-5 -mb-5 p-5 rounded-b-xl animate-in fade-in"><div className="space-y-3 mb-4 max-h-60 overflow-y-auto">{post.comments?.length === 0 && <p className="text-xs text-gray-400 italic">No comments yet.</p>}{post.comments?.map((c: any, i: number) => ( <div key={i} className="bg-white p-3 rounded-lg border border-gray-200 text-sm shadow-sm"><div className="flex justify-between mb-1"><span className="font-bold text-teal-700 text-xs">{c.author}</span><span className="text-[10px] text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span></div><p className="text-gray-700">{c.text}</p></div> ))}</div><div className="flex gap-2"><input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a helpful reply..." className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500" onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)} /><button onClick={() => handleAddComment(post.id)} className="bg-teal-600 text-white p-2 rounded-lg hover:bg-teal-700"><Send size={16} /></button></div></div> )}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- PETRO AI SEARCH TAB --- */}
        {activeTab === 'PetroAI' && (
            <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
                <div className="bg-white rounded-2xl shadow-xl border-4 border-indigo-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white text-center"><Sparkles size={48} className="mx-auto mb-2 text-yellow-300" /><h2 className="text-3xl font-black mb-2">PetroBot AI</h2><p className="opacity-90">Ask anything about Petroleum Engineering. Get instant answers.</p></div>
                    <div className="p-6">
                        <form onSubmit={handleAiSearch} className="relative mb-8">
                            <input type="text" value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} placeholder="e.g. Explain Darcy's Law formula..." className="w-full pl-5 pr-14 py-4 rounded-xl border-2 border-indigo-100 focus:border-indigo-500 focus:outline-none text-lg shadow-sm" />
                            <button type="submit" disabled={aiLoading} className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-4 rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50">{aiLoading ? '...' : <ArrowRight />}</button>
                        </form>
                        {aiLoading && ( <div className="text-center py-10"><div className="animate-spin w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"></div><p className="text-indigo-600 font-bold animate-pulse">Consulting the knowledge base...</p></div> )}
                        {!aiLoading && aiResponse && (
                            <div className="space-y-6">
                                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 prose text-gray-800"><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{aiResponse}</ReactMarkdown></div>
                                {aiRelatedLessons.length > 0 && (
                                    <div><h3 className="font-bold text-gray-500 uppercase text-xs mb-3">Related Course Material</h3><div className="grid gap-3">{aiRelatedLessons.map((l:any, idx) => ( <div key={idx} onClick={() => handleLessonStart(l, l.moduleId)} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-teal-500 hover:shadow-md transition-all"><div className="flex items-center gap-3"><FileText className="text-teal-600" size={20} /><div><div className="font-bold text-gray-800">{l.title}</div><div className="text-xs text-gray-500">From module: {l.moduleTitle}</div></div></div><ChevronRight size={16} className="text-gray-400" /></div> ))}</div></div>
                                )}
                            </div>
                        )}
                        {!aiLoading && !aiResponse && ( <div className="text-center text-gray-400 py-10"><BrainCircuit size={48} className="mx-auto mb-4 opacity-20" /><p>Try asking: "What is casing design?" or "Calculate mud weight"</p></div> )}
                    </div>
                </div>
            </div>
        )}

        {/* --- RANKINGS TAB --- */}
        {activeTab === 'Rankings' && (
            <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-white rounded-2xl shadow-xl border-2 border-yellow-400 overflow-hidden">
                    <div className="bg-yellow-400 p-6 text-center">
                        <Trophy size={48} className="mx-auto text-yellow-800 mb-2 drop-shadow-sm" />
                        <h2 className="text-3xl font-black text-yellow-900 uppercase tracking-wide">Elite Leaderboard</h2>
                        <p className="text-yellow-800 font-bold opacity-80">Top performers based on their statistics</p>
                        <div className="mt-4 bg-white/20 p-2 rounded-lg inline-block backdrop-blur-sm">
                            <span className="font-mono font-bold text-yellow-900 text-sm">Resets in: {timeUntilReset}</span>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 text-center border-b border-yellow-100">
                        <p className="text-xs font-bold text-orange-800 flex items-center justify-center gap-2">
                            <Crown size={14} className="fill-orange-600"/> TOP 3 Elite Performers get special rewards every week!
                        </p>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {leaderboard.length === 0 ? ( <div className="p-8 text-center text-gray-500">No rankings yet. Be the first!</div> ) : leaderboard.map((u, idx) => (
                            <div key={idx} className={`p-4 flex items-center justify-between ${idx < 3 ? 'bg-yellow-50/50' : 'bg-white'}`}>
                                <div className="flex items-center gap-4"><div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${idx === 0 ? 'bg-yellow-100 text-yellow-600' : idx === 1 ? 'bg-gray-100 text-gray-600' : idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-teal-50 text-teal-600'}`}>#{idx + 1}</div><div className="font-bold text-gray-800">{u.name} {u.id === user.uid && <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded ml-2">(You)</span>}</div></div>
                                <div className="font-bold text-gray-600 flex items-center gap-2">
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-black text-gray-800">{u.score} pts</span>
                                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">{u.badges} badges</span>
                                    </div>
                                    {idx < 3 && <Award size={20} className="text-yellow-500 fill-yellow-500"/>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'Test Series' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {testSeries.length === 0 ? <div className="text-gray-500 italic">No tests available.</div> :
            testSeries.map((test) => (
               <div key={test.id} className="module-card p-6 bg-white flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-start mb-4"><h4 className="font-bold text-xl text-gray-800 font-handwritten">{test.title}</h4><span className={`text-xs px-2 py-1 rounded font-bold ${test.price === 'Free' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{test.price}</span></div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-6"><span className="flex items-center gap-1"><FileText size={14}/> {test.questions?.length || 0} Qs</span><span className="flex items-center gap-1"><Clock size={14}/> {test.time}</span></div>
                  </div>
                  {test.price !== 'Free' && !isPaidUser ? (
                     <button onClick={() => setShowLockModal(true)} className="w-full btn-secondary py-2 rounded-lg font-bold flex items-center justify-center gap-2 text-gray-500 border-gray-300 shadow-none"><Lock size={14} /> Unlock</button>
                  ) : <button onClick={() => startMockTest(test.id)} className="w-full btn-primary py-2 rounded-lg font-bold">Start Test</button>}
               </div>
            ))}
          </div>
        )}

        {activeTab === 'Quizzes' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
              {modules.map(module => (
                 <div key={module.id} className="module-card p-6 bg-white"><h4 className="font-bold text-lg mb-2">{module.title}</h4><p className="text-sm text-gray-500 mb-4">{module.quiz?.length || 0} Questions</p><button onClick={() => setQuizModule(module)} className="w-full btn-primary py-2 rounded-lg font-bold">Take Quiz</button></div>
              ))}
           </div>
        )}

        {activeTab === 'Saved' && (
            <div className="animate-in fade-in duration-300">
                {savedLessonsList.length === 0 ? ( <div className="text-center py-20 text-gray-500"><Bookmark size={48} className="mx-auto mb-4 text-gray-300" /><h3 className="text-xl font-bold mb-2">No Saved Items Yet</h3></div> ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {savedLessonsList.map((lesson: any) => (
                            <div key={lesson.id} className="module-card p-4 bg-white flex items-center justify-between">
                                <div className="flex items-center gap-4" onClick={() => handleLessonStart(lesson, lesson.moduleId)}><div className="bg-teal-50 p-3 rounded-lg text-[#0f766e] cursor-pointer"><FileText size={24} /></div><div className="cursor-pointer"><h4 className="font-bold text-lg text-gray-800">{lesson.title}</h4><p className="text-xs text-gray-500">From: {lesson.moduleTitle}</p></div></div>
                                <button onClick={() => toggleBookmark(lesson.id)} className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-full"><Star size={20} className="fill-yellow-500"/></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {activeTab === 'Analytics' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-100 flex items-center justify-between"><div><p className="text-gray-500 font-bold mb-1">Lessons Completed</p><h3 className="text-4xl font-black text-[#0f766e]">{completedLessons.size}</h3></div><div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-teal-600"><CheckCircle size={32} /></div></div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-teal-100 flex items-center justify-between"><div><p className="text-gray-500 font-bold mb-1">Mastery Badges</p><h3 className="text-4xl font-black text-yellow-500">{masteryBadges.size}</h3></div><div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600"><Award size={32} /></div></div>
                </div>
                <div className="bg-white p-8 rounded-2xl border-2 border-gray-100">
                    <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2"><BarChart2 /> Performance Chart</h3>
                    {!userProfile?.testResults || userProfile.testResults.length === 0 ? ( <div className="text-center text-gray-400 py-10"><p>No tests taken yet.</p></div> ) : (
                        <div className="space-y-4">
                            {userProfile.testResults.map((result: any, idx: number) => {
                                const percentage = result.totalQ > 0 ? (result.score / result.totalQ) * 100 : 0;
                                return ( <div key={idx}><div className="flex justify-between text-sm font-bold mb-1"><span>{result.title}</span><span>{result.score} / {result.totalQ}</span></div><div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden"><div className={`h-4 rounded-full transition-all duration-1000 ${percentage > 75 ? 'bg-green-500' : percentage > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${percentage}%` }}></div></div><div className="text-xs text-gray-400 text-right mt-1">{new Date(result.date).toLocaleDateString()}</div></div> );
                            })}
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* --- FLASHCARDS TAB --- */}
        {activeTab === 'Flashcards' && (
            <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
                <div className="text-center mb-8"><h2 className="handwritten-title text-3xl font-bold text-gray-800">Formula Blitz ⚡</h2></div>
                
                {/* 1. DECK SELECTION MODE */}
                {!activeDeck ? (
                    <div className="space-y-8">
                        {/* Generator */}
                        <div className="flex gap-2 bg-white p-4 rounded-xl border-2 border-teal-100 shadow-sm max-w-xl mx-auto">
                            <input type="text" value={flashcardTopic} onChange={(e) => setFlashcardTopic(e.target.value)} placeholder="Generate new cards (e.g. Thermodynamics)..." className="flex-1 px-4 py-2 rounded-lg outline-none font-sans text-gray-700 border" onKeyDown={(e) => e.key === 'Enter' && handleGenerateFlashcards()}/>
                            <button onClick={handleGenerateFlashcards} disabled={isGeneratingCards} className="btn-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-70">{isGeneratingCards ? "..." : <><Sparkles size={18} /> Generate</>}</button>
                        </div>

                        {/* Admin Decks (Categorized) */}
                        <div>
                            <h3 className="font-bold text-gray-600 mb-4 flex items-center gap-2"><Layers size={20}/> Course Decks</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {Object.keys(groupedAdminCards).map(cat => (
                                    <div key={cat} onClick={() => handleStartDeck(groupedAdminCards[cat], cat)} className="bg-white p-6 rounded-xl border-2 border-gray-100 hover:border-teal-500 cursor-pointer transition-all shadow-sm group">
                                        <h4 className="font-bold text-xl text-teal-800 mb-1">{cat}</h4>
                                        <p className="text-sm text-gray-500">{groupedAdminCards[cat].length} Cards</p>
                                        <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity"><div className="bg-teal-50 p-2 rounded-full text-teal-600"><Play size={20} className="fill-teal-600"/></div></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Saved Decks */}
                        {savedDecks.length > 0 && (
                            <div>
                                <h3 className="font-bold text-gray-600 mb-4 flex items-center gap-2"><Bookmark size={20}/> My Saved Decks</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {savedDecks.map(deck => (
                                        <div key={deck.id} className="bg-white p-5 rounded-xl border border-gray-200 hover:border-teal-500 shadow-sm relative group">
                                            <div onClick={() => handleLoadDeck(deck)} className="cursor-pointer">
                                                <h4 className="font-bold text-gray-800">{deck.topic}</h4>
                                                <p className="text-xs text-gray-400 mt-1">{deck.cards?.length} cards • {new Date(deck.date).toLocaleDateString()}</p>
                                            </div>
                                            <button onClick={() => handleDeleteDeck(deck.id)} className="absolute top-2 right-2 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // 2. PLAYER MODE
                    <div className="max-w-xl mx-auto">
                        <div className="flex justify-between items-center mb-4">
                            <button onClick={() => setActiveDeck(null)} className="flex items-center gap-2 text-gray-500 hover:text-teal-600 font-bold"><ChevronLeft size={20}/> Back to Library</button>
                            <span className="font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-lg">{activeDeckTitle}</span>
                        </div>
                        
                        <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
                            <div className="flashcard-inner">
                                <div className="flashcard-front">
                                    <div className="card-counter text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">CARD {currentCardIndex + 1}/{activeDeck.length}</div>
                                    <span className="card-label text-sm font-bold text-gray-400 uppercase tracking-widest">Question</span>
                                    <div className="card-content-scroll">
                                        <div className="text-xl font-bold px-4 prose prose-lg text-center mx-auto"><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{activeDeck[currentCardIndex]?.q}</ReactMarkdown></div>
                                    </div>
                                    <p className="card-click-hint">Click to flip</p>
                                </div>
                                <div className="flashcard-back">
                                    <span className="card-label text-sm font-bold text-teal-100 uppercase tracking-widest">Answer</span>
                                    <div className="card-content-scroll">
                                        <div className="text-lg font-medium px-4 leading-relaxed prose prose-invert text-center mx-auto"><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{activeDeck[currentCardIndex]?.a}</ReactMarkdown></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between mt-8 items-center">
                            <button onClick={() => { setIsFlipped(false); setCurrentCardIndex(prev => (prev === 0 ? activeDeck.length - 1 : prev - 1)); }} className="btn-secondary px-6 py-2 rounded-xl font-bold flex items-center gap-2"><ChevronLeft size={18} /> Prev</button>
                            <div className="flex gap-1">{activeDeck.map((_, idx) => ( <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === currentCardIndex ? 'bg-teal-600 w-4' : 'bg-gray-300'}`}/> ))}</div>
                            <button onClick={() => { setIsFlipped(false); setCurrentCardIndex(prev => (prev === activeDeck.length - 1 ? 0 : prev + 1)); }} className="btn-primary px-6 py-2 rounded-xl font-bold flex items-center gap-2">Next <ChevronRight size={18} /></button>
                        </div>
                        
                        {/* Only show save if it's an AI generated session (not already saved) */}
                        {activeDeckTitle.startsWith("AI:") && (
                            <div className="mt-8 text-center">
                                <button onClick={handleSaveDeck} className="text-teal-600 font-bold hover:underline flex items-center justify-center gap-2 mx-auto"><Save size={18}/> Save this generated deck</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}

      </main>

      {/* --- ALL MODALS (MOVED TO ROOT TO FIX Z-INDEX) --- */}
      {showCalculator && <DraggableCalculator onClose={() => setShowCalculator(false)} />}
      
      {quizModule && <QuizModal module={quizModule} onClose={() => setQuizModule(null)} onSubmit={handleQuizSubmit} />}
      
      {showNotices && ( <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowNotices(false)}><div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}><div className="bg-[#0f766e] p-4 text-white flex justify-between items-center"><h3 className="font-bold text-lg flex items-center gap-2"><Bell size={20}/> Notice Board</h3><button onClick={() => setShowNotices(false)}><X size={20}/></button></div><div className="p-4 bg-gray-50 max-h-[60vh] overflow-y-auto">{notices.map((n) => ( <div key={n.id} className="bg-white p-4 rounded-xl border border-gray-200 mb-3 shadow-sm"><div className="flex justify-between items-start mb-1"><span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${n.type === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{n.type}</span><span className="text-xs text-gray-400">{n.date}</span></div><p className="text-gray-800 font-medium text-sm">{n.text}</p></div> ))}</div></div></div> )}
      
      {showNewPostModal && ( <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in" onClick={() => setShowNewPostModal(false)}><div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6" onClick={e => e.stopPropagation()}><div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-gray-800">Start a Discussion</h3><button onClick={() => setShowNewPostModal(false)}><X className="text-gray-400 hover:text-gray-600" /></button></div><div className="space-y-4"><div><label className="block text-sm font-bold text-gray-700 mb-1">Title</label><input value={newPost.title} onChange={(e) => setNewPost({...newPost, title: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl focus:border-teal-500 outline-none font-bold" placeholder="e.g. How to solve Darcy's equation?" /></div><div><label className="block text-sm font-bold text-gray-700 mb-1">Category</label><div className="flex gap-2">{['General', 'Drilling', 'Reservoir', 'Production'].map(tag => ( <button key={tag} onClick={() => setNewPost({...newPost, tag})} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${newPost.tag === tag ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-200'}`}>{tag}</button> ))}</div></div><div><label className="block text-sm font-bold text-gray-700 mb-1">Details</label><textarea value={newPost.body} onChange={(e) => setNewPost({...newPost, body: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl focus:border-teal-500 outline-none h-32 resize-none" placeholder="Describe your question in detail..." /></div><button onClick={handleCreatePost} className="w-full btn-primary py-3 rounded-xl font-bold text-lg shadow-lg">Post Discussion</button></div></div></div> )}
      
      {showInstallGuide && ( <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowInstallGuide(false)}><div className="bg-white w-full max-w-md rounded-2xl p-6 text-center relative" onClick={e => e.stopPropagation()}><button onClick={() => setShowInstallGuide(false)} className="absolute top-2 right-2 p-2 text-gray-400"><X size={20}/></button><Smartphone size={48} className="mx-auto text-teal-600 mb-4" /><h3 className="font-bold text-xl mb-2">Install App</h3><div className="text-left text-sm text-gray-600 space-y-3 bg-gray-50 p-4 rounded-xl mb-4"><p><strong>Android/Chrome:</strong> Click the 3 dots (⋮) top right → "Install App".</p><p><strong>iOS (Safari):</strong> Tap Share (<span className="font-bold text-blue-500">⎋</span>) → "Add to Home Screen".</p><p><strong>PC/Mac:</strong> Look for the Install icon (⬇️) in the address bar.</p></div><button onClick={() => setShowInstallGuide(false)} className="w-full btn-primary py-2 rounded-lg font-bold">Got it!</button></div></div> )}
      
      {showIOSInstall && ( <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowIOSInstall(false)}><div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center relative" onClick={e => e.stopPropagation()}><button onClick={() => setShowIOSInstall(false)} className="absolute top-2 right-2 p-2 text-gray-400"><X size={20}/></button><Smartphone size={48} className="mx-auto text-teal-600 mb-4" /><h3 className="font-bold text-xl mb-2">Install on iOS</h3><p className="text-gray-600 mb-6 text-sm">Tap the <span className="font-bold text-blue-500">Share</span> button and select <span className="font-bold">Add to Home Screen</span>.</p><button onClick={() => setShowIOSInstall(false)} className="w-full btn-primary py-2 rounded-lg font-bold">Got it!</button></div></div> )}
      
      {showSettings && ( 
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50"><h3 className="font-bold text-xl flex items-center gap-2"><Settings size={20} /> Settings</h3><button onClick={() => setShowSettings(false)} className="p-1 hover:bg-gray-200 rounded-full"><X size={20}/></button></div>
                <div className="p-6 space-y-6">
                    {isEditingProfile ? (<div className="bg-gray-50 p-4 rounded-xl border border-gray-200"><label className="block text-sm font-bold text-gray-700 mb-2">Display Name</label><input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 mb-3"/><div className="flex gap-2"><button onClick={() => setIsEditingProfile(false)} className="flex-1 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg">Cancel</button><button onClick={handleUpdateProfile} className="flex-1 btn-primary py-2 rounded-lg font-bold flex items-center justify-center gap-2"><Save size={16}/> Save</button></div></div>) : (<div className="flex items-center gap-4"><div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-2xl">{user.displayName?.charAt(0) || "U"}</div><div><h4 className="font-bold text-lg">{user.displayName}</h4><p className="text-sm text-gray-500">{user.email}</p><span className="text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded border border-teal-100 mt-1 inline-block">{isPaidUser ? "Premium Student" : "Free Plan"}</span></div></div>)}
                    <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-4 rounded-xl border border-teal-100">
                        <h4 className="font-bold text-teal-800 text-sm mb-3 flex items-center gap-2"><Trophy size={14} /> Achievements ({achievements.length})</h4>
                        <div className="flex flex-wrap gap-2">
                            {achievements.length === 0 ? <span className="text-xs text-gray-400 italic">No badges yet. Keep studying!</span> : null}
                            {achievements.includes("Week Warrior") && (<div className="bg-white px-2 py-1 rounded shadow-sm border border-orange-100 flex items-center gap-1 text-xs font-bold text-orange-600" title="7 Day Streak"><Flame size={12} className="fill-orange-500"/> Week Warrior</div>)}
                            {achievements.includes("Scholar") && (<div className="bg-white px-2 py-1 rounded shadow-sm border border-yellow-100 flex items-center gap-1 text-xs font-bold text-yellow-600" title="Scored 80%+"><Award size={12} className="fill-yellow-500"/> Scholar</div>)}
                            {achievements.includes("Test Pilot") && (<div className="bg-white px-2 py-1 rounded shadow-sm border border-blue-100 flex items-center gap-1 text-xs font-bold text-blue-600" title="Took first test"><CheckCircle size={12} /> Test Pilot</div>)}
                        </div>
                    </div>
                    <div className="space-y-2">
                        {!isEditingProfile && <button onClick={() => setIsEditingProfile(true)} className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-teal-500 hover:bg-teal-50 transition-all"><span className="flex items-center gap-3 font-bold text-gray-700"><User size={18}/> Edit Profile</span><ChevronRight size={16} className="text-gray-400"/></button>}
                        <button onClick={() => setShowResetModal(true)} className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-teal-500 hover:bg-teal-50 transition-all"><span className="flex items-center gap-3 font-bold text-gray-700"><Smartphone size={18}/> Reset Device ID</span><ChevronRight size={16} className="text-gray-400"/></button>
                        {/* FORCE INSTALL BUTTON VISIBILITY HERE */}
                        <button onClick={handleInstallClick} className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-teal-500 hover:bg-teal-50 transition-all"><span className="flex items-center gap-3 font-bold text-gray-700"><Download size={18}/> Install App</span><ChevronRight size={16} className="text-gray-400"/></button>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3"><AlertTriangle className="text-yellow-600 shrink-0" size={24} /><div className="text-xs text-yellow-800"><p className="font-bold mb-1">Security Policy</p><p>You can access your account from only <strong>2 devices</strong> (1 Primary + 1 Secondary). Request a reset if you lost a device.</p></div></div>
                    <button onClick={() => logout().then(() => navigate({ to: '/' }))} className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-bold border border-red-100 hover:bg-red-100 flex items-center justify-center gap-2"><LogOut size={18} /> Sign Out</button>
                </div>
            </div>
        </div>
      )}
      
      {showSecurityPolicy && ( <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowSecurityPolicy(false)}><div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 relative" onClick={e => e.stopPropagation()}><button onClick={() => setShowSecurityPolicy(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X /></button><div className="w-16 h-16 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto mb-4"><ShieldAlert size={32} /></div><h3 className="font-bold text-xl mb-4 text-center text-gray-800">Security Policy</h3><div className="space-y-4 text-sm text-gray-600"><p>For account security and to prevent piracy, Petro Elite strictly enforces a <strong>2-Device Limit</strong>.</p><ul className="list-disc pl-5 space-y-2"><li><strong>Primary Device:</strong> Your main computer or laptop.</li><li><strong>Secondary Device:</strong> Your mobile phone or tablet.</li></ul><div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-yellow-800 text-xs font-bold">Warning: Attempting to log in from a 3rd device will lock your account automatically.</div></div><button onClick={() => setShowSecurityPolicy(false)} className="w-full btn-primary py-2 rounded-lg font-bold mt-6">I Understand</button></div></div> )}
      {showResetModal && ( <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"><div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6"><h3 className="font-bold text-xl mb-2 text-gray-800">Request Device Reset</h3><p className="text-sm text-gray-500 mb-4">Reason for resetting secondary device?</p><textarea className="w-full p-3 border border-gray-300 rounded-xl mb-4 h-24 text-sm" placeholder="e.g. Lost phone..." value={resetReason} onChange={(e) => setResetReason(e.target.value)}></textarea><div className="flex gap-3"><button onClick={() => setShowResetModal(false)} className="flex-1 py-2 text-gray-600 font-bold bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button><button onClick={handleResetRequest} className="flex-1 btn-primary py-2 rounded-lg font-bold">Submit</button></div></div></div> )}
      {showLockModal && ( <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"><div className="bg-white max-w-md w-full rounded-2xl p-8 text-center shadow-2xl border-4 border-orange-100 relative"><button onClick={() => setShowLockModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X /></button><div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4"><Lock size={32} /></div><h2 className="handwritten-title text-3xl font-bold text-gray-800 mb-2">Unlock Full Access</h2><p className="text-gray-600 mb-6">Upgrade to <strong>Premium</strong> to unlock all content.</p><div className="flex gap-3 justify-center"><button onClick={() => setShowLockModal(false)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Maybe Later</button><button onClick={() => navigate({ to: '/enroll' })} className="btn-primary px-6 py-2 rounded-lg font-bold shadow-lg">Upgrade</button></div></div></div> )}
      
      {/* SECURE VIEWER WITH SOCRATIC AI */}
      {viewingLesson && ( <SecurePDFViewer url={viewingLesson.contentUrl} title={viewingLesson.title} user={user} onClose={() => setViewingLesson(null)} /> )}
    </div>
  );
}

// --- HELPER COMPONENTS ---

function QuizModal({ module, onClose, onSubmit }: any) {
  const [answers, setAnswers] = useState<number[]>(new Array(module.quiz?.length || 0).fill(-1));
  const calculateScore = () => answers.reduce((acc, ans, i) => ans === module.quiz[i].answer ? acc + 1 : acc, 0);
  const handleSubmit = () => { if (answers.includes(-1)) toast.error("Answer all questions!"); else onSubmit(calculateScore(), module.quiz.length); };
  if (!module.quiz || module.quiz.length === 0) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
         <div className="p-6 bg-[#0f766e] text-white flex justify-between items-center"><h3 className="font-bold text-xl flex items-center gap-2"><Award /> Quiz: {module.title}</h3><button onClick={onClose}><X /></button></div>
         <div className="p-8 overflow-y-auto flex-1">{module.quiz.map((q: any, idx: number) => (
              <div key={idx} className="mb-8"><p className="font-bold text-lg text-gray-800 mb-4">{idx + 1}. {q.q}</p><div className="space-y-2">{q.options.map((opt: string, optIdx: number) => (
                 <div key={optIdx} onClick={() => { const n = [...answers]; n[idx] = optIdx; setAnswers(n); }} className={`p-3 rounded-lg border-2 cursor-pointer flex items-center gap-3 ${answers[idx] === optIdx ? 'border-[#0f766e] bg-teal-50 text-[#0f766e] font-bold' : 'border-gray-200'}`}><div className={`w-4 h-4 rounded-full border-2 ${answers[idx] === optIdx ? 'border-[#0f766e] bg-[#0f766e]' : 'border-gray-300'}`}/>{opt}</div>
              ))}</div></div>))}</div>
         <div className="p-4 border-t bg-gray-50 flex justify-end gap-3"><button onClick={onClose} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg">Cancel</button><button onClick={handleSubmit} className="btn-primary px-6 py-2 rounded-lg font-bold">Submit Quiz</button></div>
      </div>
    </div>
  );
}

// --- ULTRA SECURE VIEWER (BLOB FETCHING + MOBILE DEFENSE + WATERMARK) ---
function SecurePDFViewer({ url, title, user, onClose }: { url: string, title: string, user: any, onClose: () => void }) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [ip, setIp] = useState("Loading IP...");
    
    // Security State
    const [isSecurityBreach, setIsSecurityBreach] = useState(false);
    const [breachMessage, setBreachMessage] = useState("");

    // Chat State
    const [showChat, setShowChat] = useState(false);
    const [chatQuery, setChatQuery] = useState("");
    const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([
        { role: 'ai', text: "Hi! I'm PetroBot. Reading something tough? Ask me to explain!" }
    ]);
    const [isChatLoading, setIsChatLoading] = useState(false);

    // --- NEW: BLOB STATE ---
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [loadingError, setLoadingError] = useState("");

    // 1. Fetch IP
    useEffect(() => {
        fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => setIp(data.ip))
            .catch(() => setIp("IP Hidden"));
    }, []);

    // 2. --- SECURE BLOB FETCHING ---
    useEffect(() => {
        let active = true;
        const fetchSecurely = async () => {
            try {
                // Fetch the PDF using the authenticated session (cookies/tokens handled by browser)
                const response = await fetch(url);
                if (!response.ok) throw new Error("Failed to load secure content");
                
                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);
                
                if (active) setBlobUrl(objectUrl);
            } catch (err) {
                if (active) setLoadingError("Security Token Expired. Please reload.");
            }
        };
        if (url) fetchSecurely();
        
        return () => { 
            active = false; 
            if (blobUrl) URL.revokeObjectURL(blobUrl); // Cleanup memory
        };
    }, [url]);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => setNumPages(numPages);

    // --- SECURITY SUITE (PRESERVED) ---
    useEffect(() => {
        const triggerBreach = (msg: string) => {
            setIsSecurityBreach(true);
            setBreachMessage(msg);
            setTimeout(() => setIsSecurityBreach(false), 3000);
        };

        // 1. FOCUS & VISIBILITY (Stops Snipping Tools & Mobile Screenshots)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                triggerBreach("Security Alert: App moved to background.");
            }
        };

        const handleBlur = () => {
            triggerBreach("Content Hidden: Window lost focus.");
        };

        // 2. SCREENSHOT KEY DETECTION (Desktop)
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.key === 'PrintScreen' || 
                (e.metaKey && e.shiftKey) || // Mac Cmd+Shift
                (e.ctrlKey && e.key === 'p') || // Print
                (e.metaKey && e.key === 'p') 
            ) {
                e.preventDefault();
                triggerBreach("Screenshots disabled.");
                toast.error("Screenshots are strictly prohibited!");
            }
        };

        // 3. CLIPBOARD POISONING
        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault();
            e.clipboardData?.setData('text/plain', `⚠ WARNING: Content tracked to ${user.email}. ID: ${ip}`);
            toast.error("Copying is disabled.");
        };

        // 4. CONTEXT MENU BLOCK
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            return false;
        };

        window.addEventListener('blur', handleBlur);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [user.email, ip]);

    // AI Handler (Preserved)
    const handleAskAI = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatQuery.trim()) return;
        if (!import.meta.env.VITE_GEMINI_API_KEY) { toast.error("AI Key missing"); return; }

        const newHistory = [...chatHistory, { role: 'user' as const, text: chatQuery }];
        setChatHistory(newHistory); setChatQuery(""); setIsChatLoading(true);

        try {
            const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const prompt = `You are an expert tutor helping a student read a document titled "${title}". Student Question: "${chatQuery}". Rules: Keep answers short. Be Socratic. Use LaTeX ($...$).`;
            const result = await model.generateContent(prompt);
            setChatHistory([...newHistory, { role: 'ai', text: result.response.text() }]);
        } catch (error) { setChatHistory([...newHistory, { role: 'ai', text: "My brain is offline briefly." }]); } finally { setIsChatLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-gray-900 flex flex-col select-none print:hidden">
           
           {/* --- LAYER 1: SECURITY CURTAIN (Highest Z-Index) --- */}
           {isSecurityBreach && (
               <div className="absolute inset-0 z-[9999] bg-black flex flex-col items-center justify-center text-white">
                   <AlertOctagon size={64} className="text-red-500 mb-4 animate-pulse" />
                   <h2 className="text-2xl font-bold mb-2">Security Warning</h2>
                   <p className="text-gray-400">{breachMessage}</p>
                   <p className="text-xs text-gray-600 mt-8">Session ID: {user.uid}</p>
               </div>
           )}

           {/* --- LAYER 2: GLOBAL WATERMARK (Over everything) --- */}
           <div className="fixed inset-0 z-[500] pointer-events-none flex flex-wrap content-center justify-center gap-24 opacity-15 overflow-hidden mix-blend-multiply">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className="transform -rotate-45 text-slate-900 font-black text-lg whitespace-nowrap">
                        {user.email} <br/> <span className="font-mono text-xs">{ip}</span>
                    </div>
                ))}
           </div>

           {/* HEADER */}
           <div className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 shrink-0 z-[110] relative">
               <div className="flex items-center gap-3"><Shield className="text-green-500" size={18} /><span className="text-gray-300 font-mono text-sm md:text-base truncate max-w-[200px] md:max-w-none">{title}</span></div>
               <div className="flex gap-4 items-center">
                   <button onClick={() => setShowChat(!showChat)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${showChat ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}><Sparkles size={16} /> {showChat ? 'Close AI' : 'Ask AI'}</button>
                   <div className="h-6 w-px bg-gray-600 mx-2"></div>
                   <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="text-gray-400 hover:text-white"><ZoomOut size={20}/></button>
                   <span className="text-gray-400 text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
                   <button onClick={() => setScale(s => Math.min(2.0, s + 0.1))} className="text-gray-400 hover:text-white"><ZoomIn size={20}/></button>
                   <button onClick={onClose} className="text-gray-400 hover:text-red-500 ml-4"><X size={24} /></button>
               </div>
           </div>

           {/* CONTENT AREA */}
           <div className="flex-1 flex overflow-hidden relative z-[50]">
               <div className={`flex-1 relative overflow-auto flex justify-center p-4 bg-gray-900 transition-all duration-300`}>
                   
                   {/* PDF RENDERER (USING BLOB URL NOW) */}
                   <div className="relative shadow-2xl border border-gray-700">
                      {loadingError ? (
                          <div className="text-red-400 mt-20 font-bold">{loadingError}</div>
                      ) : blobUrl ? (
                          <Document 
                            file={blobUrl} // <--- USING SECURE BLOB HERE
                            onLoadSuccess={onDocumentLoadSuccess} 
                            loading={<div className="text-white mt-20">Decrypting Secure Document...</div>}
                            error={<div className="text-red-400 mt-20">Security Check Failed. Reload.</div>}
                          >
                              <Page 
                                  pageNumber={pageNumber} 
                                  scale={scale} 
                                  renderTextLayer={false} 
                                  renderAnnotationLayer={false} 
                                  className="border border-gray-700 pointer-events-none" 
                              />
                          </Document>
                      ) : <div className="text-white mt-20">Loading Content...</div>}
                   </div>
               </div>

               {/* AI SIDE PANEL (Preserved) */}
               <div className={`bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ${showChat ? 'w-96 translate-x-0' : 'w-0 translate-x-full absolute right-0 h-full'}`}>
                   <div className="p-4 bg-indigo-600 text-white font-bold flex justify-between items-center shrink-0"><span className="flex items-center gap-2"><BrainCircuit size={18}/> PetroBot Tutor</span><button onClick={() => setShowChat(false)}><X size={18}/></button></div>
                   <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                       {chatHistory.map((msg, idx) => ( <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>{msg.role === 'ai' ? <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{msg.text}</ReactMarkdown></div> : msg.text}</div></div> ))}
                       {isChatLoading && ( <div className="flex justify-start"><div className="bg-white border border-gray-200 p-3 rounded-xl rounded-bl-none shadow-sm flex gap-1"><div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div><div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div></div></div> )}
                   </div>
                   <div className="p-3 border-t border-gray-200 bg-white"><form onSubmit={handleAskAI} className="relative"><input value={chatQuery} onChange={(e) => setChatQuery(e.target.value)} placeholder="Ask about this page..." className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm" /><button type="submit" disabled={!chatQuery.trim() || isChatLoading} className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"><ArrowRight size={16} /></button></form></div>
               </div>
           </div>

           {/* FOOTER CONTROLS */}
           <div className="h-16 bg-gray-900 border-t border-gray-800 flex items-center justify-between px-6 shrink-0 z-[110] relative">
               <div className="hidden md:flex items-center gap-2 text-xs text-red-400 font-bold uppercase tracking-wider"><AlertOctagon size={14}/>HIGH SECURITY ACTIVE • IP LOGGED IN: {ip}</div>
               <div className="flex items-center gap-4 mx-auto md:mx-0">
                   <button onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber <= 1} className="p-2 rounded-full bg-gray-800 text-white disabled:opacity-30 hover:bg-gray-700"><ChevronLeft size={20}/></button>
                   <span className="text-white font-mono">Page {pageNumber} of {numPages || '--'}</span>
                   <button onClick={() => setPageNumber(p => Math.min(numPages || 1, p + 1))} disabled={pageNumber >= (numPages || 1)} className="p-2 rounded-full bg-gray-800 text-white disabled:opacity-30 hover:bg-gray-700"><ChevronRight size={20}/></button>
               </div>
               <div className="w-0 md:w-40"></div>
           </div>
        </div>
    );
}

function DraggableCalculator({ onClose }: { onClose: () => void }) {
    const [input, setInput] = useState("");
    const [result, setResult] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: window.innerWidth - 350, y: 100 });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => { setIsDragging(true); setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y }); };
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => { if (isDragging) setPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y }); };
        const handleMouseUp = () => setIsDragging(false);
        if (isDragging) { window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp); }
        return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
    }, [isDragging, dragOffset]);

    const handlePress = (val: string) => {
        if (val === 'C') { setInput(""); setResult(""); }
        else if (val === 'DEL') { setInput(prev => prev.slice(0, -1)); }
        else if (val === '=') {
            try {
                let evalString = input.replace(/sin/g, 'Math.sin').replace(/cos/g, 'Math.cos').replace(/tan/g, 'Math.tan').replace(/log/g, 'Math.log10').replace(/ln/g, 'Math.log').replace(/sqrt/g, 'Math.sqrt').replace(/\^/g, '**').replace(/pi/g, 'Math.PI').replace(/e/g, 'Math.E');
                const res = new Function('return ' + evalString)();
                if (isNaN(res) || !isFinite(res)) setResult("Error"); else setResult(String(Number(res).toFixed(4)));
            } catch (e) { setResult("Error"); }
        }
        else if (['sin','cos','tan','log','ln','sqrt'].includes(val)) setInput(prev => prev + val + "(");
        else setInput(prev => prev + val);
    };

    const keys = [['C', 'DEL', '(', ')', '%'], ['sin', 'cos', 'tan', 'log', 'ln'], ['7', '8', '9', '/', 'sqrt'], ['4', '5', '6', '*', '^'], ['1', '2', '3', '-', 'pi'], ['0', '.', '=', '+', 'e']];

    return (
        <div className="fixed z-[200] bg-gray-800 rounded-xl shadow-2xl border-2 border-gray-600 overflow-hidden w-80 font-mono" style={{ left: position.x, top: position.y }}>
            <div className="bg-gray-900 p-2 cursor-move flex justify-between items-center border-b border-gray-700 select-none" onMouseDown={handleMouseDown}><div className="flex items-center gap-2"><Calculator size={14} className="text-teal-400"/><span className="text-xs text-gray-300 font-bold tracking-wider">GATE VIRTUAL CALC</span></div><button onClick={onClose} className="text-gray-500 hover:text-red-400"><X size={16}/></button></div>
            <div className="bg-[#e0f2f1] p-4 text-right border-b-4 border-gray-600 h-24 flex flex-col justify-end shadow-inner"><div className="text-gray-500 text-xs h-4 overflow-hidden">{input}</div><div className="text-3xl font-bold text-gray-900 overflow-hidden truncate">{result || (input ? "" : "0")}</div></div>
            <div className="p-2 grid grid-cols-5 gap-1 bg-gray-700">{keys.flat().map((k) => ( <button key={k} onClick={() => handlePress(k)} className={`h-10 rounded text-sm font-bold shadow-sm transition-all active:scale-95 active:brightness-75 ${k === '=' ? 'bg-teal-600 text-white col-span-1 shadow-teal-900' : ['C', 'DEL'].includes(k) ? 'bg-red-500 text-white shadow-red-900' : ['+', '-', '*', '/', '(', ')'].includes(k) ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-900'}`}>{k}</button> ))}</div>
            <div className="bg-gray-900 text-[10px] text-center text-gray-500 py-1">Use mouse only (Exam Mode)</div>
        </div>
    );
}