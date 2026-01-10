import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from '@tanstack/react-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';
import { Mail, Lock, ArrowRight, Loader2, User, Home } from 'lucide-react';

export function LoginPage() {
  // 1. GET AUTH STATE
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 2. AUTO-REDIRECT IF ALREADY LOGGED IN
  useEffect(() => {
    if (!authLoading && user) {
      if (user.email === "admin@gatepetroleum.com") {
        navigate({ to: '/admin' });
      } else {
        navigate({ to: '/dashboard' });
      }
    }
  }, [user, authLoading, navigate]);

  // 3. SHOW LOADING SPINNER WHILE CHECKING SESSION
  if (authLoading) {
    return <div className="min-h-screen bg-[#ecfdf5] flex items-center justify-center"><Loader2 className="animate-spin text-teal-700" /></div>;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    let identifier = (formData.get('identifier') as string).trim();
    const password = formData.get('password') as string;

    try {
      // Logic to allow login with Username OR Email
      if (!identifier.includes('@')) {
        const q = query(collection(db, "users"), where("username", "==", identifier.toLowerCase()));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          throw new Error("Username not found.");
        }
        identifier = querySnapshot.docs[0].data().email;
      }

      await signInWithEmailAndPassword(auth, identifier, password);
      
      // Navigation is handled by the useEffect above or explicit nav here for speed
      if (identifier === "admin@gatepetroleum.com") {
        navigate({ to: '/admin' });
      } else {
        navigate({ to: '/dashboard' });
      }
      
      toast.success("Welcome back!");
    } catch (error: any) {
      console.error(error);
      if (error.message.includes("Username")) {
        toast.error(error.message);
      } else {
        toast.error("Invalid credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ecfdf5] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-30 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200 rounded-full blur-3xl opacity-30 -translate-x-1/2 translate-y-1/2"></div>

      {/* Back to Home Link */}
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-teal-700 font-bold hover:underline z-20">
         <Home size={20} /> Back to Home
      </Link>

      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border-4 border-white relative z-10">
        <div className="text-center mb-8">
          <h1 className="font-handwritten text-4xl font-bold text-gray-800 mb-2">Welcome Back! 👋</h1>
          <p className="text-gray-500">Continue your journey to GATE 2026.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Email or Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                name="identifier" 
                type="text" 
                required 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[#0f766e] focus:bg-white transition-all outline-none font-bold text-gray-700"
                placeholder="student@example.com or username"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1 ml-1">
               <label className="block text-sm font-bold text-gray-700">Password</label>
               <a href="#" className="text-xs font-bold text-[#0f766e] hover:underline">Forgot?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                name="password" 
                type="password" 
                required 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[#0f766e] focus:bg-white transition-all outline-none font-bold text-gray-700"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#0f766e] hover:bg-[#0d9488] text-white font-bold text-lg py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 mt-6"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Login <ArrowRight size={20} /></>}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 font-bold">
            New here?{' '}
            <Link to="/signup" className="text-[#0f766e] hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}