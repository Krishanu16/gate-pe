import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, useNavigate } from '@tanstack/react-router';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Smartphone, GraduationCap, ArrowRight, Loader2 } from 'lucide-react';

export function OnboardingPage() {
  // 1. GET LOADING STATE FROM HOOK
  const { user, loading: authLoading } = useAuth(); 
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // 2. CRITICAL FIX: SHOW LOADING SPINNER WHILE CHECKING AUTH
  // This prevents the page from kicking you out while Firebase is still connecting
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#ecfdf5] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0f766e]" size={48} />
      </div>
    );
  }

  // 3. Only redirect to signup if loading is DONE and user is missing
  if (!user) return <Navigate to="/signup" />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const phone = formData.get('phone') as string;
    const college = formData.get('college') as string;
    const year = formData.get('year') as string;

    try {
      await updateDoc(doc(db, "users", user.uid), {
        phone: phone,
        college: college,
        gradYear: year,
        onboardingComplete: true
      });

      toast.success("Profile Updated!");
      navigate({ to: '/enroll' });
    } catch (error) {
      console.error(error);
      toast.error("Failed to save details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ecfdf5] flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-lg p-8 rounded-3xl shadow-xl border-4 border-teal-100">
        <div className="text-center mb-8">
          <h1 className="font-handwritten text-4xl font-bold text-gray-800 mb-2">One Last Step! 🎓</h1>
          <p className="text-gray-500">Tell us a bit about yourself to personalize your learning.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Phone Number</label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                name="phone" 
                type="tel" 
                required 
                pattern="[0-9]{10}"
                title="10 digit mobile number"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[#0f766e] focus:bg-white transition-all outline-none font-bold text-gray-700"
                placeholder="9876543210"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">College / Institute</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input 
                    name="college" 
                    type="text" 
                    required 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[#0f766e] focus:bg-white transition-all outline-none font-bold text-gray-700"
                    placeholder="IIT, UPES..."
                  />
                </div>
             </div>
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Graduation Year</label>
                <select name="year" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-[#0f766e] outline-none font-bold text-gray-700">
                   <option>2024</option>
                   <option>2025</option>
                   <option>2026</option>
                   <option>2027</option>
                </select>
             </div>
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-[#0f766e] hover:bg-[#0d9488] text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="animate-spin" /> : <>Continue to Enrollment <ArrowRight size={20} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}