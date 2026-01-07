import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from '@tanstack/react-router';
import { db, storage } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from 'sonner';
import { 
  Users, DollarSign, Activity, Search, Unlock, Smartphone, Trash2, 
  Shield, Plus, Eye, Save, X, ListChecks, Clock, CheckCircle, HelpCircle
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
      padding: 8px 12px;
      width: 100%;
    }
    .input-handwritten:focus {
      border-color: #0f766e;
      outline: none;
      box-shadow: 0 0 0 2px rgba(15, 118, 110, 0.1);
    }
  `}</style>
);

export function AdminPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('students');

  // --- DATA STATE ---
  const [students, setStudents] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [testSeries, setTestSeries] = useState<any[]>([]);
  
  // --- UI STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  
  // Editors
  const [editingModule, setEditingModule] = useState<any>(null);
  const [editingTest, setEditingTest] = useState<any>(null); // NEW: Test Editor State

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        setStudents(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const modulesSnap = await getDocs(collection(db, "modules"));
        // Sort modules by order
        const mods = modulesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setModules(mods.sort((a:any, b:any) => (a.order || 0) - (b.order || 0)));

        const testsSnap = await getDocs(collection(db, "testSeries"));
        setTestSeries(testsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    fetchData();
  }, [user]);

  // --- STUDENT ACTIONS ---
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newStudent = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      college: formData.get('college'),
      isPaid: formData.get('isPaid') === 'on',
      enrolledAt: new Date().toISOString(),
      role: 'student',
      completedLessons: [],
    };

    try {
      await addDoc(collection(db, "users"), newStudent);
      setStudents(prev => [...prev, { ...newStudent, id: 'temp-' + Date.now() }]);
      toast.success("Student added!");
      setIsAddUserModalOpen(false);
    } catch (e) { toast.error("Failed to add."); }
  };

  const togglePremium = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "users", id), { isPaid: !current });
    setStudents(prev => prev.map(s => s.id === id ? { ...s, isPaid: !current } : s));
    toast.success("Updated premium status.");
  };

  const deleteStudent = async (id: string) => {
    if(!confirm("Delete user?")) return;
    await deleteDoc(doc(db, "users", id));
    setStudents(prev => prev.filter(s => s.id !== id));
    toast.success("User deleted.");
  };

  // --- MODULE ACTIONS ---
  const handleSaveModule = async (module: any) => {
    try {
      if (module.id.startsWith('new-')) {
        const { id, ...data } = module;
        await addDoc(collection(db, "modules"), data);
      } else {
        await updateDoc(doc(db, "modules", module.id), module);
      }
      toast.success("Module saved!");
      setEditingModule(null);
      // Reload modules to get IDs
      const snap = await getDocs(collection(db, "modules"));
      setModules(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a:any, b:any) => (a.order||0)-(b.order||0)));
    } catch (e) { toast.error("Save failed."); }
  };

  const deleteModule = async (id: string) => {
    if(!confirm("Delete module?")) return;
    await deleteDoc(doc(db, "modules", id));
    setModules(prev => prev.filter(m => m.id !== id));
  };

  // --- TEST SERIES ACTIONS (NEW) ---
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
      // Reload
      const snap = await getDocs(collection(db, "testSeries"));
      setTestSeries(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { toast.error("Save failed."); }
  };

  const deleteTest = async (id: string) => {
    if(!confirm("Delete test series?")) return;
    await deleteDoc(doc(db, "testSeries", id));
    setTestSeries(prev => prev.filter(t => t.id !== id));
  };


  // --- HELPERS ---
  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = useMemo(() => {
    const total = students.length;
    const premium = students.filter(s => s.isPaid).length;
    return { total, premium, revenue: premium * 1499 };
  }, [students]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-[#ecfdf5] handwritten-body flex flex-col font-sans">
      <Styles />

      {/* HEADER */}
      <header className="bg-white border-b-4 border-[#0f766e] p-6 sticky top-0 z-30">
         <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
               <div className="bg-teal-100 p-2 rounded-lg border-2 border-teal-600"><Shield size={24} className="text-teal-700"/></div>
               <h1 className="handwritten-title text-3xl font-bold text-gray-800">Admin Panel</h1>
            </div>
            <div className="flex gap-4">
               {['students', 'content', 'tests'].map(tab => (
                 <div key={tab} onClick={() => setActiveTab(tab)} className={`nav-tab capitalize ${activeTab === tab ? 'active' : 'text-gray-500'}`}>
                   {tab === 'content' ? 'Modules' : tab === 'tests' ? 'Tests' : 'Students'}
                 </div>
               ))}
            </div>
         </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        
        {/* STUDENTS TAB */}
        {activeTab === 'students' && (
          <div className="space-y-6 animate-in fade-in">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="admin-card p-6 flex items-center gap-4 bg-white">
                   <div className="bg-blue-100 p-4 rounded-full text-blue-600"><Users size={24}/></div>
                   <div><div className="text-3xl font-bold">{stats.total}</div><div className="text-gray-500">Total</div></div>
                </div>
                <div className="admin-card p-6 flex items-center gap-4 bg-white">
                   <div className="bg-green-100 p-4 rounded-full text-green-600"><DollarSign size={24}/></div>
                   <div><div className="text-3xl font-bold">₹{stats.revenue.toLocaleString()}</div><div className="text-gray-500">Revenue</div></div>
                </div>
                <div className="admin-card p-6 flex items-center gap-4 bg-white">
                   <div className="bg-purple-100 p-4 rounded-full text-purple-600"><Activity size={24}/></div>
                   <div><div className="text-3xl font-bold">{stats.premium}</div><div className="text-gray-500">Premium</div></div>
                </div>
             </div>

             <div className="flex justify-between gap-4">
                <div className="relative w-full max-w-md">
                   <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
                   <input type="text" placeholder="Search students..." className="input-handwritten pl-10 bg-white" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <button onClick={() => setIsAddUserModalOpen(true)} className="bg-[#0f766e] text-white px-6 py-2 rounded-lg font-bold shadow-[4px_4px_0px_#065f46] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#065f46] transition-all flex items-center gap-2">
                  <Plus size={20} /> Add Student
                </button>
             </div>

             <div className="admin-card bg-white overflow-hidden">
                <table className="w-full text-left border-collapse">
                   <thead className="bg-teal-50 border-b-2 border-teal-100 text-teal-800">
                      <tr><th className="p-4">Name</th><th className="p-4">Status</th><th className="p-4 text-center">Actions</th></tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {filteredStudents.map(s => (
                         <tr key={s.id} className="hover:bg-gray-50">
                            <td className="p-4">
                               <div className="font-bold">{s.name}</div>
                               <div className="text-sm text-gray-500">{s.email}</div>
                            </td>
                            <td className="p-4">
                               {s.isPaid ? <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold border border-green-200">Premium</span> : <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-bold border border-yellow-200">Free</span>}
                            </td>
                            <td className="p-4 flex justify-center gap-2">
                               <button onClick={() => setSelectedStudent(s)} className="btn-action p-2 bg-gray-100 rounded text-gray-600"><Eye size={16}/></button>
                               <button onClick={() => togglePremium(s.id, s.isPaid)} className={`btn-action p-2 rounded text-white ${s.isPaid ? 'bg-orange-500' : 'bg-green-500'}`}>{s.isPaid ? <DollarSign size={16}/> : <Unlock size={16}/>}</button>
                               <button onClick={() => deleteStudent(s.id)} className="btn-action p-2 bg-red-100 text-red-600 rounded"><Trash2 size={16}/></button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {/* MODULES TAB */}
        {activeTab === 'content' && (
           <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center">
                 <h2 className="handwritten-title text-3xl font-bold text-gray-800">Modules Manager</h2>
                 <button onClick={() => setEditingModule({ id: 'new-' + Date.now(), title: '', icon: '📚', lessons: [] })} className="bg-[#0f766e] text-white px-4 py-2 rounded-lg font-bold flex gap-2 items-center"><Plus size={18} /> New Module</button>
              </div>
              <div className="grid gap-4">
                 {modules.map((m) => (
                    <div key={m.id} className="admin-card bg-white p-4 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="text-3xl bg-teal-50 p-2 rounded">{m.icon}</div>
                          <div><h3 className="font-bold text-xl">{m.title}</h3><p className="text-sm text-gray-500">{m.lessons?.length || 0} Lessons</p></div>
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => setEditingModule(m)} className="btn-action px-4 py-2 border-2 border-[#0f766e] text-[#0f766e] rounded-lg font-bold">Edit</button>
                          <button onClick={() => deleteModule(m.id)} className="btn-action p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={20}/></button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* TEST SERIES TAB (UPDATED) */}
        {activeTab === 'tests' && (
           <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center">
                 <h2 className="handwritten-title text-3xl font-bold text-gray-800">Test Series Manager</h2>
                 <button 
                   onClick={() => setEditingTest({ id: 'new-' + Date.now(), title: '', price: 'Free', time: '180 mins', questions: [] })}
                   className="bg-[#0f766e] text-white px-4 py-2 rounded-lg font-bold flex gap-2 items-center"
                 >
                    <Plus size={18} /> New Test
                 </button>
              </div>

              {testSeries.length === 0 ? (
                 <div className="p-10 text-center border-2 border-dashed border-gray-300 rounded-xl bg-white">
                    <ListChecks size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="font-bold text-gray-500">No mock tests created yet.</p>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testSeries.map(test => (
                       <div key={test.id} className="admin-card bg-white p-6 relative group">
                          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => setEditingTest(test)} className="p-1.5 bg-gray-100 rounded hover:bg-teal-50 hover:text-teal-600"><Eye size={16}/></button>
                             <button onClick={() => deleteTest(test.id)} className="p-1.5 bg-red-50 text-red-500 rounded hover:bg-red-100"><Trash2 size={16}/></button>
                          </div>
                          <h3 className="font-bold text-xl text-gray-800 mb-2">{test.title}</h3>
                          <div className="flex flex-wrap gap-2 mb-4">
                             <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold border border-blue-100">{test.questions?.length || 0} Qs</span>
                             <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded font-bold border border-purple-100">{test.time}</span>
                             <span className={`text-xs px-2 py-1 rounded font-bold border ${test.price === 'Free' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>{test.price}</span>
                          </div>
                          <button onClick={() => setEditingTest(test)} className="w-full py-2 border-2 border-[#0f766e] text-[#0f766e] rounded-lg font-bold hover:bg-teal-50 text-sm">Manage Questions</button>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        )}
      </main>

      {/* MODALS */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
           <div className="bg-white p-8 rounded-xl w-full max-w-md shadow-2xl border-4 border-[#0f766e]">
              <h2 className="handwritten-title text-3xl font-bold mb-6">Add Student</h2>
              <form onSubmit={handleAddStudent} className="space-y-4">
                 <input name="name" required className="input-handwritten" placeholder="Full Name" />
                 <input name="email" type="email" required className="input-handwritten" placeholder="Email" />
                 <input name="college" className="input-handwritten" placeholder="College" />
                 <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <input name="isPaid" type="checkbox" className="w-5 h-5 text-teal-600" />
                    <label className="font-bold text-gray-700">Premium?</label>
                 </div>
                 <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setIsAddUserModalOpen(false)} className="flex-1 py-2 font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button type="submit" className="flex-1 py-2 bg-[#0f766e] text-white font-bold rounded-lg">Add</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
           <div className="bg-white p-8 rounded-xl w-full max-w-lg shadow-2xl relative">
              <button onClick={() => setSelectedStudent(null)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X /></button>
              <div className="flex items-center gap-4 mb-6 border-b pb-4">
                 <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 text-2xl font-bold">{selectedStudent.name?.charAt(0)}</div>
                 <div><h2 className="text-2xl font-bold">{selectedStudent.name}</h2><p className="text-gray-500">{selectedStudent.email}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div><label className="text-xs font-bold text-gray-400">PHONE</label><p className="font-bold">{selectedStudent.phone || 'N/A'}</p></div>
                 <div><label className="text-xs font-bold text-gray-400">COLLEGE</label><p className="font-bold">{selectedStudent.college || 'N/A'}</p></div>
                 <div><label className="text-xs font-bold text-gray-400">DEVICE ID</label><code className="text-xs bg-gray-100 p-1 rounded block truncate">{selectedStudent.primaryDeviceID || 'None'}</code></div>
              </div>
           </div>
        </div>
      )}

      {editingModule && (
        <ModuleEditor module={editingModule} onClose={() => setEditingModule(null)} onSave={handleSaveModule} />
      )}

      {editingTest && (
        <TestEditor test={editingTest} onClose={() => setEditingTest(null)} onSave={handleSaveTest} />
      )}

    </div>
  );
}

// --- SUB-COMPONENTS ---

function ModuleEditor({ module, onClose, onSave }: any) {
   const [formData, setFormData] = useState(module);
   const [uploading, setUploading] = useState(false);

   const updateLesson = (idx: number, field: string, val: string) => {
      const newLessons = [...formData.lessons];
      newLessons[idx] = { ...newLessons[idx], [field]: val };
      setFormData({ ...formData, lessons: newLessons });
   };

   // CLOUDINARY UPLOAD LOGIC
   const handleFileUpload = async (idx: number, file: File) => {
      if (!file) return;
      setUploading(true);
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "gate_petroleum_preset"); // REPLACE WITH YOUR PRESET
      // data.append("cloud_name", "YOUR_CLOUD_NAME"); // Optional if set in URL

      try {
         // Replace 'YOUR_CLOUD_NAME' with your actual cloud name
         const res = await fetch(`https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/auto/upload`, { method: "POST", body: data });
         const json = await res.json();
         if(json.secure_url) {
             updateLesson(idx, 'contentUrl', json.secure_url);
             toast.success("Uploaded!");
         } else throw new Error("Upload failed");
      } catch (e) { toast.error("Upload failed"); } 
      finally { setUploading(false); }
   };

   return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto py-10">
         <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl flex flex-col max-h-full">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
               <h2 className="font-bold text-2xl">{module.id.startsWith('new') ? 'Create Module' : 'Edit Module'}</h2>
               <button onClick={onClose}><X className="text-gray-400 hover:text-red-500" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
               <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2"><label className="font-bold text-sm">Title</label><input className="input-handwritten" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
                  <div><label className="font-bold text-sm">Icon</label><input className="input-handwritten text-center" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} /></div>
               </div>
               <div className="border-t pt-4">
                  <h3 className="font-bold text-lg mb-4">Lessons</h3>
                  <div className="space-y-4">
                     {formData.lessons?.map((l:any, idx:number) => (
                        <div key={idx} className="border p-4 rounded bg-gray-50 flex gap-3 items-start">
                           <span className="mt-2 text-gray-400">{idx+1}.</span>
                           <div className="flex-1 space-y-2">
                              <div className="flex gap-2">
                                 <input className="input-handwritten flex-1" value={l.title} onChange={e => updateLesson(idx, 'title', e.target.value)} placeholder="Lesson Title"/>
                                 <select className="input-handwritten w-32" value={l.type} onChange={e => updateLesson(idx, 'type', e.target.value)}><option value="note">Note</option><option value="video">Video</option></select>
                              </div>
                              <div className="flex gap-2">
                                 <input className="input-handwritten text-sm font-mono flex-1" value={l.contentUrl} onChange={e => updateLesson(idx, 'contentUrl', e.target.value)} placeholder="URL" />
                                 <label className={`cursor-pointer bg-gray-200 px-3 py-2 rounded flex gap-2 items-center text-sm font-bold ${uploading ? 'opacity-50' : ''}`}>
                                    <span>📤</span> <input type="file" className="hidden" onChange={e => e.target.files && handleFileUpload(idx, e.target.files[0])} />
                                 </label>
                              </div>
                           </div>
                           <button onClick={() => setFormData({...formData, lessons: formData.lessons.filter((_:any, i:number) => i!==idx)})} className="text-red-400 hover:text-red-600"><Trash2/></button>
                        </div>
                     ))}
                     <button onClick={() => setFormData({...formData, lessons: [...(formData.lessons||[]), {id: Date.now(), title:'', type:'note', contentUrl:''}]})} className="w-full py-3 border-2 border-dashed border-gray-300 rounded font-bold text-gray-500 hover:border-teal-500 hover:text-teal-600">+ Add Lesson</button>
                  </div>
               </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
               <button onClick={onClose} className="px-6 py-2 font-bold text-gray-500 hover:bg-gray-200 rounded-lg">Cancel</button>
               <button onClick={() => onSave(formData)} disabled={uploading} className="px-6 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 flex items-center gap-2"><Save size={18}/> Save</button>
            </div>
         </div>
      </div>
   );
}

function TestEditor({ test, onClose, onSave }: any) {
   const [formData, setFormData] = useState(test);

   const addQuestion = () => {
      setFormData({
         ...formData,
         questions: [...(formData.questions || []), { q: '', options: ['','','',''], answer: 0 }]
      });
   };

   const updateQuestion = (idx: number, field: string, val: any) => {
      const newQs = [...formData.questions];
      newQs[idx] = { ...newQs[idx], [field]: val };
      setFormData({ ...formData, questions: newQs });
   };

   const updateOption = (qIdx: number, oIdx: number, val: string) => {
      const newQs = [...formData.questions];
      newQs[qIdx].options[oIdx] = val;
      setFormData({ ...formData, questions: newQs });
   };

   return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto py-10">
         <div className="bg-white rounded-xl w-full max-w-4xl shadow-2xl flex flex-col max-h-full">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
               <h2 className="font-bold text-2xl">{test.id.startsWith('new') ? 'Create Test Series' : 'Edit Test'}</h2>
               <button onClick={onClose}><X className="text-gray-400 hover:text-red-500" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-2"><label className="font-bold text-sm">Test Title</label><input className="input-handwritten" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. GATE Full Length Mock 1" /></div>
                  <div>
                      <label className="font-bold text-sm">Price</label>
                      <select className="input-handwritten" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}>
                          <option value="Free">Free</option>
                          <option value="₹99">₹99</option>
                          <option value="₹149">₹149</option>
                      </select>
                  </div>
                  <div><label className="font-bold text-sm">Duration</label><input className="input-handwritten" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} placeholder="e.g. 180 mins" /></div>
               </div>

               <div className="border-t pt-4">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><HelpCircle size={20}/> Questions ({formData.questions?.length || 0})</h3>
                  <div className="space-y-6">
                     {formData.questions?.map((q:any, idx:number) => (
                        <div key={idx} className="border-2 border-gray-100 p-4 rounded-xl bg-gray-50 relative">
                           <div className="absolute top-2 right-2 text-gray-300 font-bold text-4xl opacity-20">#{idx+1}</div>
                           <div className="mb-4">
                              <label className="text-xs font-bold text-gray-500 uppercase">Question Text</label>
                              <textarea className="input-handwritten w-full" rows={2} value={q.q} onChange={e => updateQuestion(idx, 'q', e.target.value)} />
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {q.options.map((opt:string, oIdx:number) => (
                                 <div key={oIdx} className="flex gap-2 items-center">
                                    <input 
                                       type="radio" 
                                       name={`ans-${idx}`} 
                                       checked={q.answer === oIdx} 
                                       onChange={() => updateQuestion(idx, 'answer', oIdx)}
                                       className="w-4 h-4 text-teal-600"
                                    />
                                    <input 
                                       className={`input-handwritten flex-1 ${q.answer === oIdx ? 'border-green-500 bg-green-50' : ''}`}
                                       value={opt} 
                                       onChange={e => updateOption(idx, oIdx, e.target.value)}
                                       placeholder={`Option ${String.fromCharCode(65+oIdx)}`}
                                    />
                                 </div>
                              ))}
                           </div>
                           <button onClick={() => setFormData({...formData, questions: formData.questions.filter((_:any, i:number) => i!==idx)})} className="mt-4 text-xs text-red-500 font-bold hover:underline flex items-center gap-1"><Trash2 size={12}/> Remove Question</button>
                        </div>
                     ))}
                     <button onClick={addQuestion} className="w-full py-3 border-2 border-dashed border-gray-300 rounded font-bold text-gray-500 hover:border-teal-500 hover:text-teal-600">+ Add Question</button>
                  </div>
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