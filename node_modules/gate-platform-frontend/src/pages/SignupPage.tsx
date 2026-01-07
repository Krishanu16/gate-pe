import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from '@tanstack/react-router';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';
import { Mail, Lock, User, ArrowRight, Loader2, AtSign, Home } from 'lucide-react';

export function SignupPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const username = (formData.get('username') as string).trim().toLowerCase();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const q = query(collection(db, "users"), where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        throw new Error("Username already taken. Please choose another.");
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, "users", user.uid), {
        name: name,
        username: username,
        email: email,
        role: 'student',
        isPaid: false,
        enrolledAt: new Date().toISOString(),
        completedLessons: [],
        bookmarks: [],
        testResults: []
      });

      toast.success("Account created! Welcome to the platform.");
      navigate({ to: '/onboarding' });

    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error("Email already exists. Try logging in.");
      } else if (error.message.includes("Username")) {
        toast.error(error.message);
      } else {
        toast.error("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ecfdf5] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-teal-200 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-200 rounded-full blur-3xl opacity-30 translate-x-1/2 translate-y-1/2"></div>

      {/* NEW: Back to Home Link (Absolute Position) */}
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-teal-700 font-bold hover:underline z-20">
         <Home size={20} /> Back to Home
      </Link>

      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border-4 border-white relative z-10">
        <div className="text-center mb-8">
          <h1 className="font-handwritten text-4xl font-bold text-gray-800 mb-2">Join the Squad! 🚀</h1>
          <p className="text-gray-500">Create your free account to start learning.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                name="name" 
                type="text" 
                required 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[#0f766e] focus:bg-white transition-all outline-none font-bold text-gray-700"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Username</label>
            <div className="relative">
              <AtSign className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                name="username" 
                type="text" 
                required 
                pattern="^[a-zA-Z0-9_]+$"
                title="Letters, numbers and underscores only"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[#0f766e] focus:bg-white transition-all outline-none font-bold text-gray-700"
                placeholder="johndoe123"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                name="email" 
                type="email" 
                required 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[#0f766e] focus:bg-white transition-all outline-none font-bold text-gray-700"
                placeholder="student@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                name="password" 
                type="password" 
                required 
                minLength={6}
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
            {loading ? <Loader2 className="animate-spin" /> : <>Create Account <ArrowRight size={20} /></>}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 font-bold">
            Already have an account?{' '}
            <Link to="/login" className="text-[#0f766e] hover:underline">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}