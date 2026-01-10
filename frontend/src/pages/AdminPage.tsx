import React, { useState, useEffect, useMemo } from 'react';
import { Logo } from '../components/Logo';
import { useAuth } from '../hooks/useAuth';
import { Navigate, Link } from '@tanstack/react-router';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, query, orderBy, writeBatch, limit, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from 'sonner';
import { GoogleGenerativeAI } from "@google/generative-ai"; // AI SDK
import { 
  Users, DollarSign, Search, Unlock, Smartphone, Trash2, 
  Plus, Eye, Save, X, ListChecks, HelpCircle,
  RefreshCw, Home, LayoutDashboard, ArrowUp, ArrowDown, AlertTriangle, ShieldCheck, FileText, Upload, Bell, MessageSquare, Layers, Sparkles, Loader2
} from 'lucide-react';

// --- STYLES ---
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Caveat:wght@400;700&display=swap');

    .handwritten-title { font-family: 'Caveat', cursive, sans-serif; }
    .handwritten-body { font-family: 'Architects Daughter', cursive, sans-serif; }

    .admin-card {
      background: white;
      border: 3px solid #0f766e;
      box-shadow: 4px 4px 0px #0f766e;
      border-radius: 12px;
      overflow: hidden;
    }

    .btn-action {
      transition: all 0.2s;
    }
    .btn-action:hover { transform: scale(1.1); }
    
    .nav-tab {
      cursor: pointer;
      padding: 10px 20px;
      font-weight: bold;
      border-bottom: 4px solid transparent;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .nav-tab.active {
      border-bottom-color: #0f766e;
      color: #0f766e;
      background: #f0fdfa;
    }
    .nav-tab:hover:not(.active) { background: #f0fdfa; }

    .input-handwritten {
      font-family: 'Architects Daughter', cursive, sans-serif;
      border: 2px solid #cbd5e1;
      border-radius: 8px;
      padding: 10px;
      width: 100%;
      color: #111827; /* Dark Gray for visibility */
      background-color: #ffffff;
      font-size: 1rem;
    }
    .input-handwritten:focus {
      border-color: #0f766e;
      outline: none;
      box-shadow: 0 0 0 2px rgba(15, 118, 110, 0.1);
    }
  `}</style>
);

export function AdminPage() {
  const { user, userProfile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('students');

  // --- ROLE CHECKS ---
  const isMaster = userProfile?.role === 'admin_master'; 
  const isAcademic = userProfile?.role === 'admin_academic'; 
  const hasAccess = isMaster || isAcademic;

  // --- DATA STATE ---
  const [students, setStudents] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [testSeries, setTestSeries] = useState<any[]>([]);
  const [resetRequests, setResetRequests] = useState<any[]>([]);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [forumPosts, setForumPosts] = useState<any[]>([]);
  
  // --- UI STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [studentFilter, setStudentFilter] = useState('all'); 
  const [selectedStudent, setSelectedStudent] = useState<any>(null); 
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({ text: '', type: 'info' });
  
  // --- AI STATES ---
  const [isDraftingNotice, setIsDraftingNotice] = useState(false);
  const [flashcardGenTopic, setFlashcardGenTopic] = useState('');
  const [isGenFlashcards, setIsGenFlashcards] = useState(false);

  // --- CONFIRMATION STATE ---
  const [confirmModal, setConfirmModal] = useState<{
      type: 'delete' | 'premium' | 'reset' | 'approve_request' | 'reject_request';
      id: string;
      data?: any;
      title: string;
      message: string;
      confirmBtnText: string;
      confirmBtnColor: string;
  } | null>(null);
  
  // Editors
  const [editingModule, setEditingModule] = useState<any>(null);
  const [editingTest, setEditingTest] = useState<any>(null);
  const [editingFlashcard, setEditingFlashcard] = useState<any>(null);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !hasAccess) return;
      try {
        if (isMaster) {
             const usersSnap = await getDocs(query(collection(db, "users"), orderBy("name", "asc")));
             setStudents(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
             
             const requestsSnap = await getDocs(collection(db, "device_reset_requests"));
             setResetRequests(requestsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }

        const modulesSnap = await getDocs(collection(db, "modules"));
        const mods = modulesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setModules(mods.sort((a:any, b:any) => (a.order || 0) - (b.order || 0)));

        const testsSnap = await getDocs(collection(db, "testSeries"));
        setTestSeries(testsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const flashSnap = await getDocs(collection(db, "flashcards"));
        setFlashcards(flashSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Fetch Notices
        const noticeSnap = await getDocs(query(collection(db, "notices"), orderBy("date", "desc")));
        setNotices(noticeSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        // Fetch Forum Posts
        const forumSnap = await getDocs(query(collection(db, "forum_posts"), orderBy("createdAt", "desc"), limit(50)));
        setForumPosts(forumSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    fetchData();
    if (isAcademic && !isMaster) setActiveTab('content'); 
  }, [user, hasAccess, isAcademic, isMaster]);

  // --- ACTION HANDLERS ---

  const handleDelete = (type: string, id: string) => {
      setConfirmModal({
          type: 'delete',
          id,
          data: { resourceType: type },
          title: `Delete ${type}?`,
          message: `Are you sure you want to delete this ${type}? This action cannot be undone.`,
          confirmBtnText: 'Delete',
          confirmBtnColor: 'bg-red-600 hover:bg-red-700'
      });
  };

  const handleTogglePremium = (id: string, currentStatus: boolean) => {
      setConfirmModal({
          type: 'premium',
          id,
          data: { currentStatus },
          title: currentStatus ? 'Revoke Premium?' : 'Grant Premium?',
          message: currentStatus 
            ? 'This will downgrade the user to the Free plan immediately.' 
            : 'This will upgrade the user to the Premium plan with full access.',
          confirmBtnText: currentStatus ? 'Revoke Access' : 'Grant Access',
          confirmBtnColor: currentStatus ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'
      });
  };

  const handleResetDevice = (id: string) => {
      setConfirmModal({
          type: 'reset',
          id,
          title: 'Reset Secondary Device?',
          message: 'This will clear the Secondary Device ID for this user. The Primary Device ID cannot be reset.',
          confirmBtnText: 'Reset Secondary',
          confirmBtnColor: 'bg-purple-600 hover:bg-purple-700'
      });
  };

  // --- NOTICE LOGIC (WITH AI) ---
  const handleAiDraftNotice = async () => {
      if (!newNotice.text.trim()) { toast.error("Type a rough draft first!"); return; }
      if (!import.meta.env.VITE_GEMINI_API_KEY) { toast.error("AI Key Missing"); return; }

      setIsDraftingNotice(true);
      try {
          const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

          const tone = newNotice.type === 'urgent' ? "Urgent and Important" : 
                       newNotice.type === 'success' ? "Exciting and Motivational" : "Professional and Clear";

          const prompt = `
            Rewrite this rough announcement for a Petroleum Engineering student portal.
            Rough Draft: "${newNotice.text}"
            Tone: ${tone}
            Rules: Keep it concise (under 25 words). Use 1 relevant emoji at the start.
            Output: Just the rewritten text.
          `;

          const result = await model.generateContent(prompt);
          const polishedText = result.response.text().trim();
          
          setNewNotice({ ...newNotice, text: polishedText });
          toast.success("AI polished your notice! ✨");
      } catch (e) {
          console.error(e);
          toast.error("AI is busy. Try again.");
      } finally {
          setIsDraftingNotice(false);
      }
  };

  const handleCreateNotice = async () => {
      if(!newNotice.text) return;
      try {
          const docRef = await addDoc(collection(db, "notices"), {
              text: newNotice.text,
              type: newNotice.type,
              date: new Date().toISOString()
          });
          setNotices(prev => [{ id: docRef.id, text: newNotice.text, type: newNotice.type, date: new Date().toISOString() }, ...prev]);
          setNewNotice({ text: '', type: 'info' });
          toast.success("Notice Posted!");
      } catch(e) { toast.error("Failed to post notice"); }
  };

  // --- FLASHCARD AI LOGIC ---
  const handleAiGenerateDeck = async () => {
      if (!flashcardGenTopic.trim()) { toast.error("Enter a topic first!"); return; }
      if (!import.meta.env.VITE_GEMINI_API_KEY) { toast.error("AI Key Missing"); return; }

      setIsGenFlashcards(true);
      try {
          const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

          const prompt = `
            Act as a Professor of Petroleum Engineering.
            Create 10 advanced flashcards on the topic: "${flashcardGenTopic}".
            Format: A pure JSON array of objects with keys "q" (question) and "a" (short answer).
            Rules: Focus on formulas, definitions, and critical GATE exam concepts. No markdown formatting.
          `;

          const result = await model.generateContent(prompt);
          const cleanJson = result.response.text().replace(/```json|```/g, "").trim();
          const cards = JSON.parse(cleanJson);

          // Batch write to Firestore
          const batch = writeBatch(db);
          cards.forEach((card: any) => {
              const docRef = doc(collection(db, "flashcards")); // Auto-ID
              batch.set(docRef, {
                  q: card.q,
                  a: card.a,
                  category: flashcardGenTopic, // Use topic as category
                  createdAt: new Date().toISOString()
              });
          });

          await batch.commit();

          // Update local state
          const newCards = cards.map((c: any) => ({ ...c, category: flashcardGenTopic }));
          setFlashcards(prev => [...newCards, ...prev]); // Add to top
          setFlashcardGenTopic('');
          toast.success(`Success! Added ${cards.length} cards to "${flashcardGenTopic}"`);

      } catch (e) {
          console.error(e);
          toast.error("AI Generation failed. Try again.");
      } finally {
          setIsGenFlashcards(false);
      }
  };

  // --- EXECUTE ACTIONS ---
  const executeConfirmation = async () => {
      if (!confirmModal) return;
      const { type, id, data } = confirmModal;

      try {
          if (type === 'delete') {
              const collectionName = data.resourceType === 'student' ? 'users' : 
                                     data.resourceType === 'module' ? 'modules' :
                                     data.resourceType === 'test' ? 'testSeries' : 
                                     data.resourceType === 'flashcard' ? 'flashcards' :
                                     data.resourceType === 'notice' ? 'notices' : 'forum_posts';
              
              await deleteDoc(doc(db, collectionName, id));
              
              // Update local state
              if (data.resourceType === 'student') setStudents(prev => prev.filter(s => s.id !== id));
              if (data.resourceType === 'module') setModules(prev => prev.filter(m => m.id !== id));
              if (data.resourceType === 'test') setTestSeries(prev => prev.filter(t => t.id !== id));
              if (data.resourceType === 'flashcard') setFlashcards(prev => prev.filter(f => f.id !== id));
              if (data.resourceType === 'notice') setNotices(prev => prev.filter(n => n.id !== id));
              if (data.resourceType === 'post') setForumPosts(prev => prev.filter(p => p.id !== id));
              
              toast.success("Deleted successfully.");
          } 
          else if (type === 'premium') {
              const newStatus = !data.currentStatus;
              await updateDoc(doc(db, "users", id), { isPaid: newStatus });
              setStudents(prev => prev.map(s => s.id === id ? { ...s, isPaid: newStatus } : s));
              toast.success(`User is now ${newStatus ? 'Premium' : 'Free'}.`);
          }
          else if (type === 'reset') {
              await updateDoc(doc(db, "users", id), { secondaryDeviceID: null });
              setStudents(prev => prev.map(s => s.id === id ? { ...s, secondaryDeviceID: null } : s));
              toast.success("Secondary device lock cleared.");
          }
          else if (type === 'approve_request') {
              await updateDoc(doc(db, "users", data.userId), { secondaryDeviceID: null });
              await deleteDoc(doc(db, "device_reset_requests", id));
              setResetRequests(prev => prev.filter(r => r.id !== id));
              setStudents(prev => prev.map(s => s.id === data.userId ? { ...s, secondaryDeviceID: null } : s));
              toast.success("Request approved & secondary device reset.");
          }
          else if (type === 'reject_request') {
              await deleteDoc(doc(db, "device_reset_requests", id));
              setResetRequests(prev => prev.filter(r => r.id !== id));
              toast.success("Request rejected.");
          }
      } catch (e) {
          console.error(e);
          toast.error("Action failed.");
      } finally {
          setConfirmModal(null);
      }
  };

  // --- MODULE REORDERING ---
  const handleMoveModule = async (index: number, direction: 'up' | 'down') => {
      const newModules = [...modules];
      if (direction === 'up' && index > 0) {
          [newModules[index], newModules[index-1]] = [newModules[index-1], newModules[index]];
      } else if (direction === 'down' && index < newModules.length - 1) {
          [newModules[index], newModules[index+1]] = [newModules[index+1], newModules[index]];
      } else {
          return;
      }

      setModules(newModules); 

      const batch = writeBatch(db);
      newModules.forEach((m, i) => {
          batch.update(doc(db, "modules", m.id), { order: i });
      });
      try {
          await batch.commit();
          toast.success("Order updated");
      } catch (e) { toast.error("Failed to save order"); }
  };

  // --- DATA SAVERS ---
  const handleSaveModule = async (module: any) => {
    try {
      if (module.id.startsWith('new-')) {
        const { id, ...data } = module;
        data.order = modules.length;
        await addDoc(collection(db, "modules"), data);
      } else {
        await updateDoc(doc(db, "modules", module.id), module);
      }
      toast.success("Module saved!");
      setEditingModule(null);
      const snap = await getDocs(collection(db, "modules"));
      setModules(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a:any, b:any) => (a.order||0)-(b.order||0)));
    } catch (e) { toast.error("Save failed."); }
  };

  const handleSaveTest = async (test: any) => {
    try {
      if (test.id.startsWith('new-')) {
        const { id, ...data } = test;
        await addDoc(collection(db, "testSeries"), data);
      } else {
        await updateDoc(doc(db, "testSeries", test.id), test);
      }
      toast.success("Test Series saved!");
      setEditingTest(null);
      const snap = await getDocs(collection(db, "testSeries"));
      setTestSeries(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { toast.error("Save failed."); }
  };

  const handleSaveFlashcard = async (fc: any) => {
      try {
          // Default category if empty
          const dataToSave = { ...fc, category: fc.category || 'General' };
          
          if (fc.id.startsWith('new-')) {
              const { id, ...data } = dataToSave;
              await addDoc(collection(db, "flashcards"), data);
          } else {
              await updateDoc(doc(db, "flashcards", fc.id), dataToSave);
          }
          const snap = await getDocs(collection(db, "flashcards"));
          setFlashcards(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          setEditingFlashcard(null);
          toast.success("Flashcard saved!");
      } catch (e) { toast.error("Failed."); }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    try {
      await addDoc(collection(db, "users"), {
        name: formData.get('name'),
        email: formData.get('email'),
        role: formData.get('role') || 'student',
        isPaid: formData.get('isPaid') === 'on',
        enrolledAt: new Date().toISOString(),
        completedLessons: [], primaryDeviceID: null, secondaryDeviceID: null
      });
      const snap = await getDocs(query(collection(db, "users"), orderBy("name", "asc")));
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      toast.success("User added!");
      setIsAddUserModalOpen(false);
    } catch (e) { toast.error("Failed."); }
  };

  // --- FILTERS ---
  const filteredStudents = useMemo(() => {
      return students.filter(s => {
          const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.email?.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesFilter = studentFilter === 'all' 
              ? true 
              : studentFilter === 'premium' ? s.isPaid : !s.isPaid;
          return matchesSearch && matchesFilter;
      });
  }, [students, searchTerm, studentFilter]);

  // --- FLASHCARD GROUPING ---
  const groupedFlashcards = useMemo(() => {
      const groups: Record<string, any[]> = {};
      flashcards.forEach(fc => {
          const cat = fc.category || 'General';
          if(!groups[cat]) groups[cat] = [];
          groups[cat].push(fc);
      });
      return groups;
  }, [flashcards]);

  const stats = useMemo(() => ({ total: students.length, premium: students.filter(s => s.isPaid).length, revenue: students.filter(s => s.isPaid).length * 1499 }), [students]);

  if (loading) return <div className="p-20 text-center font-handwritten text-2xl">Loading Admin Panel...</div>;
  if (!user || !hasAccess) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-[#ecfdf5] handwritten-body flex flex-col font-sans">
      <Styles />

      {/* HEADER */}
      <header className="bg-white border-b-4 border-[#0f766e] p-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
                <Logo />
                <div className="hidden md:block">
                    <h1 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Console Access</h1>
                    <p className="text-sm font-bold text-[#0f766e]">{isMaster ? "Founder / Master Admin" : "Chief Academic Officer"}</p>
                </div>
            </div>
            
            <div className="flex gap-1 overflow-x-auto bg-gray-50 p-1 rounded-xl border border-gray-200 max-w-full">
                {isMaster && <button onClick={() => setActiveTab('students')} className={`nav-tab rounded-lg text-sm ${activeTab === 'students' ? 'active' : 'text-gray-500'}`}>Students</button>}
                {isMaster && <button onClick={() => setActiveTab('resets')} className={`nav-tab rounded-lg text-sm ${activeTab === 'resets' ? 'active' : 'text-gray-500'}`}>Requests {resetRequests.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">{resetRequests.length}</span>}</button>}
                <button onClick={() => setActiveTab('notices')} className={`nav-tab rounded-lg text-sm ${activeTab === 'notices' ? 'active' : 'text-gray-500'}`}>Notices</button>
                <button onClick={() => setActiveTab('community')} className={`nav-tab rounded-lg text-sm ${activeTab === 'community' ? 'active' : 'text-gray-500'}`}>Community</button>
                <button onClick={() => setActiveTab('content')} className={`nav-tab rounded-lg text-sm ${activeTab === 'content' ? 'active' : 'text-gray-500'}`}>Modules</button>
                <button onClick={() => setActiveTab('tests')} className={`nav-tab rounded-lg text-sm ${activeTab === 'tests' ? 'active' : 'text-gray-500'}`}>Tests</button>
                <button onClick={() => setActiveTab('flashcards')} className={`nav-tab rounded-lg text-sm ${activeTab === 'flashcards' ? 'active' : 'text-gray-500'}`}>Flashcards</button>
            </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        
        {/* 1. STUDENTS TAB */}
        {activeTab === 'students' && isMaster && (
          <div className="space-y-6 animate-in fade-in">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="admin-card p-6 flex items-center gap-4 bg-white">
                   <div className="bg-blue-100 p-4 rounded-full text-blue-600"><Users size={24}/></div>
                   <div><div className="text-3xl font-bold">{stats.total}</div><div className="text-gray-500">Total Enrollment</div></div>
                </div>
                <div className="admin-card p-6 flex items-center gap-4 bg-white">
                   <div className="bg-green-100 p-4 rounded-full text-green-600"><DollarSign size={24}/></div>
                   <div><div className="text-3xl font-bold">₹{stats.revenue.toLocaleString()}</div><div className="text-gray-500">Revenue</div></div>
                </div>
                <div className="admin-card p-6 flex items-center gap-4 bg-white">
                   <div className="bg-purple-100 p-4 rounded-full text-purple-600"><Unlock size={24}/></div>
                   <div><div className="text-3xl font-bold">{stats.premium}</div><div className="text-gray-500">Premium Users</div></div>
                </div>
             </div>

             <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-6 rounded-xl border-2 border-teal-100 shadow-sm">
                <div className="flex gap-4 flex-1">
                    <div className="flex-1 max-w-md">
                        <input type="text" placeholder="Search students..." className="input-handwritten pl-4 h-11" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {['all', 'premium', 'free'].map(f => (
                            <button 
                                key={f}
                                onClick={() => setStudentFilter(f)} 
                                className={`px-3 py-1 rounded-md text-sm font-bold capitalize transition-all ${studentFilter === f ? 'bg-white shadow text-[#0f766e]' : 'text-gray-500'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsAddUserModalOpen(true)} className="bg-[#0f766e] text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-md hover:shadow-lg"><Plus size={20} /> Add Student</button>
                </div>
             </div>

             <div className="admin-card bg-white overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                   <thead className="bg-teal-50 border-b-2 border-teal-100 text-teal-800">
                      <tr><th className="p-4">Student</th><th className="p-4">Status</th><th className="p-4">Devices</th><th className="p-4 text-center">Actions</th></tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {filteredStudents.map(s => (
                         <tr key={s.id} className="hover:bg-gray-50">
                            <td className="p-4">
                               <div className="font-bold text-gray-800">{s.name}</div>
                               <div className="text-sm text-gray-500">{s.email}</div>
                            </td>
                            <td className="p-4">{s.isPaid ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Premium</span> : <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">Free</span>}</td>
                            <td className="p-4 flex gap-2">
                               <div className={`p-1 rounded border ${s.primaryDeviceID ? 'bg-teal-100 border-teal-300 text-teal-700' : 'bg-gray-100 text-gray-300'}`} title="Primary"><Smartphone size={16}/></div>
                               <div className={`p-1 rounded border ${s.secondaryDeviceID ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-gray-100 text-gray-300'}`} title="Secondary"><Smartphone size={16}/></div>
                            </td>
                            <td className="p-4 text-center space-x-2">
                               <button onClick={() => setSelectedStudent(s)} className="btn-action p-2 bg-gray-100 rounded text-gray-600"><Eye size={16}/></button>
                               <button onClick={() => handleTogglePremium(s.id, s.isPaid)} className={`btn-action p-2 rounded text-white ${s.isPaid ? 'bg-orange-500' : 'bg-green-500'}`}>{s.isPaid ? <DollarSign size={16}/> : <Unlock size={16}/>}</button>
                               <button onClick={() => handleResetDevice(s.id)} className="btn-action p-2 bg-purple-100 text-purple-600 rounded"><RefreshCw size={16}/></button>
                               <button onClick={() => handleDelete('student', s.id)} className="btn-action p-2 bg-red-100 text-red-600 rounded"><Trash2 size={16}/></button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {/* 2. NOTICE BOARD TAB (AI POWERED) */}
        {activeTab === 'notices' && (
            <div className="space-y-6 animate-in fade-in">
                <div className="flex justify-between items-center">
                    <h2 className="handwritten-title text-3xl font-bold text-gray-800">Notice Board</h2>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex justify-between items-end">
                            <label className="font-bold text-gray-700 text-sm uppercase tracking-wide">Write a new notice:</label>
                            
                            {/* AI BUTTON */}
                            <button 
                                onClick={handleAiDraftNotice}
                                disabled={isDraftingNotice || !newNotice.text}
                                className="text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg font-bold border border-purple-200 flex items-center gap-1 hover:bg-purple-100 transition-colors disabled:opacity-50"
                            >
                                {isDraftingNotice ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14} />} 
                                {isDraftingNotice ? 'Polishing...' : 'Polish with AI'}
                            </button>
                        </div>

                        <textarea 
                            className="input-handwritten w-full h-24 text-lg p-4 border-2 border-gray-300 focus:border-teal-500 rounded-xl" 
                            placeholder="e.g. class cancelled rain (Click AI to polish this)..." 
                            value={newNotice.text} 
                            onChange={e => setNewNotice({...newNotice, text: e.target.value})} 
                        />
                        
                        <div className="flex gap-2 justify-end items-center">
                            <select className="input-handwritten w-40 h-10 py-0" value={newNotice.type} onChange={e => setNewNotice({...newNotice, type: e.target.value})}>
                                <option value="info">Info (Blue)</option>
                                <option value="urgent">Urgent (Red)</option>
                                <option value="success">Success (Green)</option>
                            </select>
                            <button onClick={handleCreateNotice} className="bg-[#0f766e] text-white px-6 py-2 rounded-lg font-bold hover:bg-teal-700 transition-colors shadow-lg">Post Notice</button>
                        </div>
                    </div>
                    
                    <h3 className="font-bold text-gray-500 mb-2">Active Notices</h3>
                    <div className="space-y-2">
                        {notices.map(n => (
                            <div key={n.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-teal-200 transition-all">
                                <div className="flex gap-4 items-center">
                                    <div className={`p-2 rounded-full ${n.type === 'urgent' ? 'bg-red-100 text-red-600' : n.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                        <Bell size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-lg">{n.text}</p>
                                        <div className="flex gap-2 text-xs font-bold mt-1">
                                            <span className={`uppercase ${n.type === 'urgent' ? 'text-red-500' : n.type === 'success' ? 'text-green-500' : 'text-blue-500'}`}>{n.type}</span>
                                            <span className="text-gray-400">• {new Date(n.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => handleDelete('notice', n.id)} className="text-gray-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={20}/></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* 3. COMMUNITY CONTROL TAB */}
        {activeTab === 'community' && (
            <div className="space-y-6 animate-in fade-in">
                <h2 className="handwritten-title text-3xl font-bold text-gray-800">Community Moderation</h2>
                <div className="grid gap-4">
                    {forumPosts.map(post => (
                        <div key={post.id} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-start">
                            <div>
                                <div className="flex gap-2 items-center mb-1">
                                    <span className="font-bold text-teal-700 text-sm">{post.author}</span>
                                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">{post.tag}</span>
                                </div>
                                <h3 className="font-bold text-gray-900">{post.title}</h3>
                                <p className="text-sm text-gray-600 line-clamp-1">{post.body}</p>
                            </div>
                            <button onClick={() => handleDelete('post', post.id)} className="text-red-400 hover:text-red-600 p-2 bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* 4. MODULES TAB (WITH AI QUIZ) */}
        {activeTab === 'content' && (
           <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center">
                 <h2 className="handwritten-title text-3xl font-bold text-gray-800">Modules</h2>
                 <button onClick={() => setEditingModule({ id: 'new-'+Date.now(), title: '', icon: '📚', lessons: [], quiz: [] })} className="bg-[#0f766e] text-white px-4 py-2 rounded-lg font-bold flex gap-2 items-center"><Plus size={18} /> New Module</button>
              </div>
              <div className="grid gap-4">
                 {modules.map((m, idx) => (
                    <div key={m.id} className="admin-card bg-white p-4 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="flex flex-col gap-1">
                             <button onClick={() => handleMoveModule(idx, 'up')} disabled={idx === 0} className="p-1 hover:bg-gray-100 rounded text-gray-400 disabled:opacity-30"><ArrowUp size={16}/></button>
                             <button onClick={() => handleMoveModule(idx, 'down')} disabled={idx === modules.length - 1} className="p-1 hover:bg-gray-100 rounded text-gray-400 disabled:opacity-30"><ArrowDown size={16}/></button>
                          </div>
                          <div className="text-3xl bg-teal-50 p-2 rounded">{m.icon}</div>
                          <div><h3 className="font-bold text-xl">{m.title}</h3><p className="text-sm text-gray-500">{m.lessons?.length || 0} Lessons • {m.quiz?.length || 0} Quiz Qs</p></div>
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => setEditingModule(m)} className="btn-action px-4 py-2 border-2 border-[#0f766e] text-[#0f766e] rounded-lg font-bold">Edit</button>
                          {isMaster && <button onClick={() => handleDelete('module', m.id)} className="btn-action p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={20}/></button>}
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* 5. TESTS TAB */}
        {activeTab === 'tests' && (
           <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center">
                 <h2 className="handwritten-title text-3xl font-bold text-gray-800">Test Series</h2>
                 <button onClick={() => setEditingTest({ id: 'new-'+Date.now(), title: '', price: 'Free', time: '180 mins', questions: [] })} className="bg-[#0f766e] text-white px-4 py-2 rounded-lg font-bold flex gap-2 items-center"><Plus size={18} /> New Test</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {testSeries.map(test => (
                    <div key={test.id} className="admin-card bg-white p-6 relative group">
                       <h3 className="font-bold text-xl text-gray-800 mb-2">{test.title}</h3>
                       <div className="flex gap-2 mb-4"><span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold">{test.questions?.length || 0} Qs</span></div>
                       <button onClick={() => setEditingTest(test)} className="w-full py-2 border-2 border-[#0f766e] text-[#0f766e] rounded-lg font-bold hover:bg-teal-50 text-sm">Manage</button>
                       {isMaster && <button onClick={() => handleDelete('test', test.id)} className="absolute top-4 right-4 p-1.5 bg-red-50 text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>}
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* 6. FLASHCARDS TAB (AI POWERED) */}
        {activeTab === 'flashcards' && (
            <div className="space-y-8 animate-in fade-in">
                
                {/* AI GENERATOR PANEL */}
                <div className="bg-indigo-50 border-2 border-indigo-100 p-6 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex-1">
                        <h3 className="font-bold text-indigo-900 text-lg flex items-center gap-2"><Sparkles className="text-yellow-500 fill-yellow-500" size={20}/> AI Deck Creator</h3>
                        <p className="text-sm text-indigo-700">Instantly create a 10-card deck for any topic.</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <input 
                            className="input-handwritten flex-1 md:w-64" 
                            placeholder="e.g. Drilling Mud Properties" 
                            value={flashcardGenTopic} 
                            onChange={e => setFlashcardGenTopic(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAiGenerateDeck()}
                        />
                        <button 
                            onClick={handleAiGenerateDeck} 
                            disabled={isGenFlashcards}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-lg transition-all"
                        >
                            {isGenFlashcards ? <Loader2 size={18} className="animate-spin"/> : <Plus size={18} />}
                            {isGenFlashcards ? "Generating..." : "Auto-Generate"}
                        </button>
                    </div>
                </div>

                {/* MANUAL CONTROLS */}
                <div className="flex justify-between items-center border-b pb-4">
                    <h2 className="handwritten-title text-3xl font-bold text-gray-800">Card Library</h2>
                    <button onClick={() => setEditingFlashcard({ id: 'new-'+Date.now(), q: '', a: '', category: '' })} className="bg-white text-gray-600 border-2 border-gray-200 px-4 py-2 rounded-lg font-bold flex gap-2 items-center hover:border-teal-500 hover:text-teal-600 transition-colors"><Plus size={18} /> Manual Add</button>
                </div>
                
                {/* GROUPED DISPLAY */}
                {Object.keys(groupedFlashcards).length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                        <Layers size={48} className="mx-auto text-gray-300 mb-2"/>
                        <p className="text-gray-500 font-bold">No cards yet. Use the AI Creator above!</p>
                    </div>
                ) : (
                 Object.keys(groupedFlashcards).map(category => (
                    <div key={category} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-xl text-teal-800 mb-4 flex items-center gap-2 border-b pb-2">
                            <Layers size={20}/> {category} 
                            <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">{groupedFlashcards[category].length} Cards</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {groupedFlashcards[category].map((fc: any) => (
                                <div key={fc.id} className="bg-gray-50 p-4 border border-gray-200 rounded-xl relative group hover:border-[#0f766e] transition-all h-40 flex flex-col">
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className="font-bold text-gray-500 text-[10px] uppercase mb-1">Question</h4>
                                        <p className="font-bold text-gray-800 text-sm line-clamp-2 leading-tight">{fc.q}</p>
                                    </div>
                                    <div className="flex-1 overflow-hidden mt-2 pt-2 border-t border-gray-200">
                                        <h4 className="font-bold text-teal-600 text-[10px] uppercase mb-1">Answer</h4>
                                        <p className="text-xs text-gray-600 font-mono line-clamp-2">{fc.a}</p>
                                    </div>
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-1 rounded-lg shadow-sm border">
                                        <button onClick={() => setEditingFlashcard(fc)} className="p-1.5 rounded hover:bg-gray-100 text-blue-500"><Eye size={14}/></button>
                                        <button onClick={() => handleDelete('flashcard', fc.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                 ))
                )}
            </div>
        )}

        {/* 7. DEVICE RESET REQUESTS TAB */}
        {activeTab === 'resets' && isMaster && (
            <div className="space-y-6 animate-in fade-in">
                <h2 className="handwritten-title text-3xl font-bold text-gray-800">Device Reset Requests</h2>
                {resetRequests.length === 0 ? (
                    <div className="p-10 text-center border-2 border-dashed border-gray-300 rounded-xl bg-white text-gray-500">
                        <ListChecks size={48} className="mx-auto mb-4 text-green-500"/>
                        <p className="font-bold">No pending requests.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {resetRequests.map(req => (
                            <div key={req.id} className="admin-card bg-white p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">{req.userEmail}</h3>
                                    <p className="text-sm text-gray-500 mb-2">Requested: {new Date(req.createdAt).toLocaleDateString()}</p>
                                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-sm text-gray-700 max-w-xl">
                                        <span className="font-bold">Reason:</span> {req.reason}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setConfirmModal({type: 'reject_request', id: req.id, title: 'Reject Request?', message: 'This will delete the request without resetting devices.', confirmBtnText: 'Reject', confirmBtnColor: 'bg-red-600 hover:bg-red-700'})} className="px-4 py-2 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200">Reject</button>
                                    <button onClick={() => setConfirmModal({type: 'approve_request', id: req.id, data: {userId: req.userId}, title: 'Reset Secondary Device?', message: 'This will unlock the Secondary Device for this user.', confirmBtnText: 'Approve & Reset', confirmBtnColor: 'bg-teal-600 hover:bg-teal-700'})} className="px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 flex items-center gap-2"><RefreshCw size={16}/> Approve Reset</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

      </main>

      {/* --- FOOTER --- */}
      <footer className="p-6 border-t bg-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
           <Link to="/" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#0f766e] transition-colors"><Home size={16}/> Homepage</Link>
           <Link to="/dashboard" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#0f766e] transition-colors"><LayoutDashboard size={16}/> Student View</Link>
        </div>
      </footer>

      {/* --- MODALS --- */}
      
      {/* 1. UNIVERSAL CONFIRMATION MODAL */}
      {confirmModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
              <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-2xl border-4 border-gray-100">
                  <div className="flex flex-col items-center text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white mb-4 ${confirmModal.type.includes('delete') || confirmModal.type === 'reject_request' ? 'bg-red-500' : 'bg-blue-500'}`}>
                          <AlertTriangle size={24}/>
                      </div>
                      <h3 className="font-bold text-xl mb-2">{confirmModal.title}</h3>
                      <p className="text-gray-500 mb-6 text-sm">{confirmModal.message}</p>
                      <div className="flex gap-3 w-full">
                          <button onClick={() => setConfirmModal(null)} className="flex-1 py-2 font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
                          <button onClick={executeConfirmation} className={`flex-1 py-2 text-white font-bold rounded-lg ${confirmModal.confirmBtnColor}`}>{confirmModal.confirmBtnText}</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* 2. ADD USER MODAL */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
           <div className="bg-white p-8 rounded-xl w-full max-w-md shadow-2xl border-4 border-[#0f766e]">
              <h2 className="handwritten-title text-3xl font-bold mb-6">Add User</h2>
              <form onSubmit={handleAddStudent} className="space-y-4">
                 <input name="name" required className="input-handwritten" placeholder="Full Name" />
                 <input name="email" type="email" required className="input-handwritten" placeholder="Email" />
                 <select name="role" className="input-handwritten"><option value="student">Student</option><option value="admin_academic">CAO</option>{isMaster && <option value="admin_master">Master Admin</option>}</select>
                 <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"><input name="isPaid" type="checkbox" className="w-5 h-5 text-teal-600" /><label className="font-bold text-gray-700">Premium Account?</label></div>
                 <div className="flex gap-3 pt-4"><button type="button" onClick={() => setIsAddUserModalOpen(false)} className="flex-1 py-2 font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button><button type="submit" className="flex-1 py-2 bg-[#0f766e] text-white font-bold rounded-lg">Add User</button></div>
              </form>
           </div>
        </div>
      )}

      {/* 3. STUDENT VIEW MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
           <div className="bg-white p-8 rounded-xl w-full max-w-lg shadow-2xl relative">
              <button onClick={() => setSelectedStudent(null)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X /></button>
              <div className="flex items-center gap-4 mb-6 border-b pb-4">
                 <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 text-2xl font-bold">{selectedStudent.name?.charAt(0)}</div>
                 <div>
                    <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                    <p className="text-gray-500">{selectedStudent.email}</p>
                    <div className="mt-1">{selectedStudent.isPaid ? <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">Premium</span> : <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded">Free</span>}</div>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-6 text-sm">
                 <div><label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Enrolled</label><p className="font-bold">{selectedStudent.enrolledAt ? new Date(selectedStudent.enrolledAt).toLocaleDateString() : 'N/A'}</p></div>
                 <div><label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Role</label><p className="font-bold capitalize">{selectedStudent.role || 'Student'}</p></div>
                 
                 <div className="col-span-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2 text-gray-500 font-bold text-xs uppercase"><ShieldCheck size={14}/> Security Status</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-xs text-gray-400">Primary Device</span>
                            <div className="font-mono text-xs truncate bg-white border p-1 rounded mt-1">{selectedStudent.primaryDeviceID || 'Not Linked'}</div>
                        </div>
                        <div>
                            <span className="text-xs text-gray-400">Secondary Device</span>
                            <div className="font-mono text-xs truncate bg-white border p-1 rounded mt-1">{selectedStudent.secondaryDeviceID || 'Not Linked'}</div>
                        </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* 4. FLASHCARD EDITOR */}
      {editingFlashcard && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl border-4 border-[#0f766e]">
                  <h3 className="font-bold text-xl mb-4">Edit Flashcard</h3>
                  <div className="space-y-4">
                      <div><label className="font-bold text-xs uppercase text-gray-500">Category / Deck</label><input className="input-handwritten w-full" value={editingFlashcard.category || ''} onChange={e => setEditingFlashcard({...editingFlashcard, category: e.target.value})} placeholder="e.g. Drilling (Optional)" /></div>
                      <div><label className="font-bold text-xs uppercase text-gray-500">Question</label><textarea className="input-handwritten w-full" value={editingFlashcard.q} onChange={e => setEditingFlashcard({...editingFlashcard, q: e.target.value})} /></div>
                      <div><label className="font-bold text-xs uppercase text-gray-500">Answer</label><textarea className="input-handwritten w-full" value={editingFlashcard.a} onChange={e => setEditingFlashcard({...editingFlashcard, a: e.target.value})} /></div>
                      <div className="flex gap-3 pt-2">
                          <button onClick={() => setEditingFlashcard(null)} className="flex-1 py-2 font-bold text-gray-500 bg-gray-100 rounded-lg">Cancel</button>
                          <button onClick={() => handleSaveFlashcard(editingFlashcard)} className="flex-1 py-2 bg-[#0f766e] text-white font-bold rounded-lg">Save</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* 5. MODULE EDITOR (PDF-ONLY + AI) */}
      {editingModule && <ModuleEditor module={editingModule} onClose={() => setEditingModule(null)} onSave={handleSaveModule} />}
      
      {/* 6. TEST EDITOR */}
      {editingTest && <TestEditor test={editingTest} onClose={() => setEditingTest(null)} onSave={handleSaveTest} />}

    </div>
  );
}

// --- SUB-COMPONENTS ---

// 1. MODULE EDITOR (PDF-Only Version + AI)
function ModuleEditor({ module, onClose, onSave }: any) {
    const [formData, setFormData] = useState(module);
    const [tab, setTab] = useState('lessons'); // lessons | quiz
    const [uploading, setUploading] = useState(false);
    const [editingLessonQuiz, setEditingLessonQuiz] = useState<number | null>(null);
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

    const updateLesson = (idx: number, field: string, val: string) => {
        const newLessons = [...formData.lessons];
        newLessons[idx] = { ...newLessons[idx], [field]: val };
        setFormData({ ...formData, lessons: newLessons });
    };

    const updateLessonQuiz = (lessonIdx: number, newQuiz: any[]) => {
        const newLessons = [...formData.lessons];
        newLessons[lessonIdx].quiz = newQuiz;
        setFormData({ ...formData, lessons: newLessons });
        setEditingLessonQuiz(null);
    };

    const handleFileUpload = async (idx: number, file: File) => {
        if (!file) return;
        setUploading(true);

        try {
            const fileRef = ref(storage, `modules/${Date.now()}_${file.name}`);
            await uploadBytes(fileRef, file);
            const downloadURL = await getDownloadURL(fileRef);
            const type = 'pdf'; 
            
            const newLessons = [...formData.lessons];
            newLessons[idx] = { 
                ...newLessons[idx], 
                contentUrl: downloadURL, 
                type: type 
            };
            setFormData({ ...formData, lessons: newLessons });
            toast.success(`Uploaded ${type.toUpperCase()} to Firebase!`);
        } catch (e: any) { 
            console.error("Upload Error:", e);
            toast.error(`Upload failed: ${e.message}`); 
        } 
        finally { setUploading(false); }
    };

    // --- AI QUIZ GENERATOR FUNCTION ---
    const handleAiGenerateQuiz = async (lessonIndex: number) => {
        const lesson = formData.lessons[lessonIndex];
        
        if (!lesson.title) { toast.error("Please enter a Lesson Title first."); return; }
        if (!import.meta.env.VITE_GEMINI_API_KEY) { toast.error("AI Key Missing"); return; }

        setIsGeneratingQuiz(true);
        try {
            const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `
                Create a 5-question multiple choice quiz for a Petroleum Engineering student about "${lesson.title}".
                Difficulty: GATE Exam Level (Hard).
                Format: JSON Array ONLY. No markdown.
                Structure: [{ "q": "Question", "options": ["A", "B", "C", "D"], "answer": 0 (index of correct), "explanation": "Reason" }]
            `;

            const result = await model.generateContent(prompt);
            const text = result.response.text().replace(/```json|```/g, "").trim();
            const aiQuiz = JSON.parse(text);

            const newLessons = [...formData.lessons];
            const existingQuiz = newLessons[lessonIndex].quiz || [];
            newLessons[lessonIndex].quiz = [...existingQuiz, ...aiQuiz];
            
            setFormData({ ...formData, lessons: newLessons });
            toast.success(`AI generated ${aiQuiz.length} questions!`);
        } catch (e) {
            console.error(e);
            toast.error("AI Generation Failed. Try again.");
        } finally {
            setIsGeneratingQuiz(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto py-10">
            <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl flex flex-col max-h-full">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h2 className="font-bold text-2xl">Edit Module</h2>
                    <button onClick={onClose}><X className="text-gray-400 hover:text-red-500" /></button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2"><label className="font-bold text-sm">Title</label><input className="input-handwritten" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div>
                        <div><label className="font-bold text-sm">Icon</label><input className="input-handwritten text-center" value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} /></div>
                    </div>

                    <div className="flex gap-4 border-b">
                        <button onClick={() => setTab('lessons')} className={`pb-2 font-bold ${tab === 'lessons' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-400'}`}>Lessons</button>
                        <button onClick={() => setTab('quiz')} className={`pb-2 font-bold ${tab === 'quiz' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-400'}`}>Module Quiz</button>
                    </div>

                    <div className="overflow-y-auto h-[400px] border p-4 rounded-xl bg-gray-50">
                        {tab === 'lessons' ? (
                            <div className="space-y-4">
                                {formData.lessons?.map((l: any, idx: number) => (
                                    <div key={idx} className="bg-white p-4 rounded shadow-sm border border-gray-200 flex flex-col gap-3">
                                        <div className="flex gap-3 items-center">
                                            <span className="font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">{idx + 1}</span>
                                            <input className="input-handwritten flex-1" value={l.title} onChange={e => updateLesson(idx, 'title', e.target.value)} placeholder="Lesson Title" />
                                            <button onClick={() => {
                                                const nl = [...formData.lessons]; nl.splice(idx, 1); setFormData({ ...formData, lessons: nl });
                                            }} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
                                        </div>

                                        <div className="flex gap-2">
                                            <input className="input-handwritten flex-1 font-mono text-xs text-gray-500" value={l.contentUrl} onChange={e => updateLesson(idx, 'contentUrl', e.target.value)} placeholder="Paste PDF URL or Upload ->" />
                                            <label className="cursor-pointer bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 hover:bg-blue-100">
                                                {uploading ? '...' : <><Upload size={14} /> Upload PDF</>}
                                                <input type="file" className="hidden" onChange={(e) => e.target.files && handleFileUpload(idx, e.target.files[0])} accept="application/pdf" />
                                            </label>
                                        </div>

                                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                                            <button onClick={() => setEditingLessonQuiz(idx)} className="text-xs bg-teal-50 text-teal-700 px-3 py-1.5 rounded font-bold border border-teal-200 flex items-center gap-1 hover:bg-teal-100 transition-colors">
                                                <HelpCircle size={14} /> {l.quiz?.length || 0} Quiz Questions
                                            </button>
                                            
                                            {/* AI QUIZ BUTTON */}
                                            <button 
                                                onClick={() => handleAiGenerateQuiz(idx)} 
                                                disabled={isGeneratingQuiz}
                                                className="text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded font-bold border border-purple-200 flex items-center gap-1 hover:bg-purple-100 transition-colors disabled:opacity-50"
                                            >
                                                {isGeneratingQuiz ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14} />} 
                                                {isGeneratingQuiz ? 'Generating...' : 'Auto-Generate Quiz'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => setFormData({ ...formData, lessons: [...(formData.lessons || []), { id: Date.now(), title: '', type: 'pdf', contentUrl: '', quiz: [] }] })} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl font-bold text-gray-400 hover:border-teal-500 hover:text-teal-600 transition-all flex justify-center items-center gap-2">
                                    <Plus size={20}/> Add New Lesson
                                </button>
                            </div>
                        ) : (
                            <QuizEditor questions={formData.quiz} onUpdate={(q) => setFormData({ ...formData, quiz: q })} />
                        )}
                    </div>
                </div>

                <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClose} className="px-6 py-2 font-bold text-gray-500 hover:bg-gray-200 rounded-lg">Cancel</button>
                    <button onClick={() => onSave(formData)} disabled={uploading} className="px-6 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 flex items-center gap-2"><Save size={18} /> Save Module</button>
                </div>
            </div>

            {/* NESTED MODAL FOR LESSON QUIZ */}
            {editingLessonQuiz !== null && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-10">
                    <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl h-full flex flex-col animate-in slide-in-from-bottom-10">
                        <div className="p-4 border-b flex justify-between bg-blue-50 rounded-t-xl">
                            <h3 className="font-bold text-blue-900 flex items-center gap-2"><HelpCircle size={20}/> Quiz for: {formData.lessons[editingLessonQuiz].title}</h3>
                            <button onClick={() => setEditingLessonQuiz(null)}><X className="text-blue-400 hover:text-blue-700"/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                            <QuizEditor
                                questions={formData.lessons[editingLessonQuiz].quiz || []}
                                onUpdate={(q) => {
                                    const newLessons = [...formData.lessons];
                                    newLessons[editingLessonQuiz].quiz = q;
                                    setFormData({ ...formData, lessons: newLessons });
                                }}
                            />
                        </div>
                        <div className="p-4 border-t text-right bg-white rounded-b-xl">
                            <button onClick={() => setEditingLessonQuiz(null)} className="btn-primary px-8 py-2 rounded-lg font-bold shadow-lg">Done</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// 2. GENERIC QUIZ EDITOR
function QuizEditor({ questions, onUpdate }: { questions: any[], onUpdate: (q: any[]) => void }) {
    return (
        <div className="space-y-4">
            {questions?.map((q:any, idx:number) => (
                <div key={idx} className="bg-white p-4 rounded shadow-sm border relative">
                    <div className="absolute top-2 right-2 text-gray-300 font-bold opacity-30">#{idx+1}</div>
                    <div className="mb-2">
                        <label className="text-xs font-bold text-gray-400">Question</label>
                        <textarea className="input-handwritten w-full" value={q.q} onChange={e => {
                            const nq = [...questions]; nq[idx].q = e.target.value; onUpdate(nq);
                        }} placeholder="Enter question..." />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        {q.options.map((opt:string, oIdx:number) => (
                            <div key={oIdx} className="flex gap-2">
                                <input type="radio" checked={q.answer === oIdx} onChange={() => {
                                    const nq = [...questions]; nq[idx].answer = oIdx; onUpdate(nq);
                                }} className="mt-2" />
                                <input className="input-handwritten text-sm py-1" value={opt} onChange={e => {
                                    const nq = [...questions]; nq[idx].options[oIdx] = e.target.value; onUpdate(nq);
                                }} placeholder={`Option ${oIdx+1}`} />
                            </div>
                        ))}
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400">Explanation</label>
                        <textarea className="input-handwritten w-full text-sm bg-yellow-50 border-yellow-200" rows={2} value={q.explanation} onChange={e => {
                            const nq = [...questions]; nq[idx].explanation = e.target.value; onUpdate(nq);
                        }} placeholder="Explain the correct answer..." />
                    </div>
                    <button onClick={() => {
                        const nq = [...questions]; nq.splice(idx, 1); onUpdate(nq);
                    }} className="text-red-500 text-xs font-bold mt-2">Remove Question</button>
                </div>
            ))}
            <button onClick={() => onUpdate([...(questions||[]), {q:'', options:['','','',''], answer:0, explanation:''}])} className="w-full py-2 border-2 border-dashed border-gray-300 rounded font-bold text-gray-500 hover:border-teal-500">+ Add Question</button>
        </div>
    );
}

// 3. TEST EDITOR
function TestEditor({ test, onClose, onSave }: any) {
   const [formData, setFormData] = useState(test);

   return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto py-10">
         <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl flex flex-col max-h-full">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
               <h2 className="font-bold text-2xl">Edit Test</h2>
               <button onClick={onClose}><X className="text-gray-400 hover:text-red-500" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
               <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2"><label className="font-bold text-sm">Title</label><input className="input-handwritten" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
                  <div><label className="font-bold text-sm">Time</label><input className="input-handwritten" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} /></div>
               </div>
               
               <div className="border-t pt-4">
                   <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><HelpCircle size={20}/> Questions ({formData.questions?.length || 0})</h3>
                   <QuizEditor questions={formData.questions} onUpdate={(q) => setFormData({...formData, questions: q})} />
               </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
               <button onClick={onClose} className="px-6 py-2 font-bold text-gray-500 hover:bg-gray-200 rounded-lg">Cancel</button>
               <button onClick={() => onSave(formData)} className="px-6 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 flex items-center gap-2"><Save size={18}/> Save Test</button>
            </div>
         </div>
      </div>
   );
}