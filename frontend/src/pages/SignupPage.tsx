import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  updateProfile,
  sendEmailVerification,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { doc, setDoc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Logo } from '@/components/Logo';
import { 
  Mail, Lock, User, ArrowRight, Loader2, 
  CheckCircle, ShieldCheck, Phone, GraduationCap, 
  AtSign, Smartphone, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

// --- 1. FIX TYPESCRIPT ERROR GLOBALLY ---
declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Caveat:wght@400;700&display=swap');
    .handwritten-title { font-family: 'Caveat', cursive; }
    .handwritten-body { font-family: 'Architects Daughter', cursive; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
  `}</style>
);

export function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  
  // Verification State
  const [verificationSent, setVerificationSent] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '', 
    university: '',
    password: ''
  });

  // --- RECAPTCHA CLEANUP & SETUP ---
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const setupRecaptcha = () => {
    // Clear if exists
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }

    // Initialize
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'normal', // Visible for reliability
      'callback': () => {
        console.log("Recaptcha verified");
      },
      'expired-callback': () => {
        toast.error("Recaptcha expired. Please try again.");
      }
    });
  };

  // --- INITIALIZE USER DOC ---
  const initializeUserDoc = async (user: any, extraData: any) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: extraData.name || user.displayName || "Anonymous",
        username: extraData.username || user.email?.split('@')[0] || "user"+Date.now(),
        email: user.email || extraData.email || "",
        phone: user.phoneNumber || extraData.phone || "",
        university: extraData.university || "Not Specified",
        role: "student",
        isPaid: false,
        enrolledCourses: [],
        createdAt: new Date().toISOString(),
        primaryDeviceID: null, 
        secondaryDeviceID: null,
        completedLessons: [],
        testResults: [],
        masteryBadges: []
      });
    }
  };

  // --- EMAIL SIGNUP ---
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.username || !formData.email || !formData.university || !formData.password || !formData.phone) {
      toast.error("Please fill in ALL fields");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      // Check Username
      const q = query(collection(db, "users"), where("username", "==", formData.username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) throw new Error("Username already taken");

      // Create User
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await sendEmailVerification(user);
      await updateProfile(user, { displayName: formData.name });
      
      // Auto-add +91 to saved data
      const finalData = { ...formData, phone: `+91${formData.phone}` };
      await initializeUserDoc(user, finalData);

      setVerificationSent(true);
      toast.success("Verification email sent!");

    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') toast.error("Email already registered.");
      else toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- PHONE SIGNUP ---
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate 10 digit number
    const cleanPhone = formData.phone.replace(/\D/g, ''); // Remove non-digits
    if (cleanPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    const formattedPhone = `+91${cleanPhone}`;
    
    setLoading(true);
    try {
      if (!window.recaptchaVerifier) setupRecaptcha();
      
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      
      setConfirmationResult(result);
      setOtpSent(true);
      toast.success(`OTP Sent to ${formattedPhone}`);
    } catch (error: any) {
      console.error("OTP Error:", error);
      toast.error(error.message);
      // Reset captcha on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      
      const finalData = {
        ...formData,
        username: formData.username || "user_" + user.uid.substring(0, 6),
        phone: user.phoneNumber // Firebase sets this automatically to +91...
      };

      await initializeUserDoc(user, finalData);
      toast.success("Phone Verified! Welcome.");
      navigate({ to: '/dashboard' });
    } catch (error) {
      toast.error("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // --- GOOGLE SIGNUP ---
  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await initializeUserDoc(result.user, { 
        university: "Not Specified", 
        phone: result.user.phoneNumber,
        username: result.user.email?.split('@')[0] 
      });
      navigate({ to: '/dashboard' });
    } catch (error) {
      toast.error("Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex font-sans">
      <Styles />
      
      {/* LEFT SIDE: BRANDING */}
      <div className="hidden lg:flex w-1/2 bg-[#0f766e] relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10"><Logo variant="white" /></div>
        <div className="relative z-10 space-y-8">
          <h1 className="text-5xl font-black leading-tight">Join the Elite <br/><span className="text-teal-200 handwritten-title">Circle.</span></h1>
          <div className="space-y-4 text-lg text-teal-100">
            <div className="flex items-center gap-3"><ShieldCheck className="text-teal-300" /> <span>Verified Student Community</span></div>
            <div className="flex items-center gap-3"><CheckCircle className="text-teal-300" /> <span>Access to Petrobot AI</span></div>
            <div className="flex items-center gap-3"><CheckCircle className="text-teal-300" /> <span>GATE-Level Test Series</span></div>
          </div>
        </div>
        <div className="relative z-10 text-sm text-teal-200 font-bold">© 2026 Petro Elite. Secure Education Platform.</div>
      </div>

      {/* RIGHT SIDE: FORM */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 bg-gray-50 relative">
        
        {/* Verification Modal */}
        {verificationSent && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600"><Mail size={40} /></div>
            <h2 className="text-3xl font-black text-gray-800 mb-4">Verify Your Email</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-md">We've sent a verification link to <strong>{formData.email}</strong>.<br/>Please verify to unlock your account.</p>
            <div className="space-y-4">
              <button onClick={() => window.open('https://gmail.com', '_blank')} className="bg-[#0f766e] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-teal-700 w-full">Open Gmail</button>
              <button onClick={() => navigate({ to: '/login' })} className="text-gray-500 font-bold hover:text-teal-600 block">I've Verified, Let me Login</button>
            </div>
          </div>
        )}

        <div className="w-full max-w-lg bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <div className="text-center mb-6"><h2 className="text-3xl font-black text-gray-800 mb-2">Create Account</h2><p className="text-gray-500">Fill in your details to get started.</p></div>

          {/* Toggle Method */}
          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button onClick={() => setAuthMethod('email')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${authMethod === 'email' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}><Mail size={16}/> Email</button>
            <button onClick={() => setAuthMethod('phone')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${authMethod === 'phone' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}><Smartphone size={16}/> Phone</button>
          </div>

          <form onSubmit={authMethod === 'email' ? handleEmailSignup : (otpSent ? (e) => e.preventDefault() : handleSendOtp)} className="space-y-4">
            
            {/* Common Fields */}
            {!otpSent && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                  <div className="relative"><User className="absolute left-3 top-3 text-gray-400" size={18} /><input required type="text" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none font-bold text-gray-700 text-sm" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Username</label>
                  <div className="relative"><AtSign className="absolute left-3 top-3 text-gray-400" size={18} /><input required type="text" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none font-bold text-gray-700 text-sm" placeholder="john_d26" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s/g,'')})} /></div>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">University / College</label>
                  <div className="relative"><GraduationCap className="absolute left-3 top-3 text-gray-400" size={18} /><input required type="text" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none font-bold text-gray-700 text-sm" placeholder="e.g. IIT Bombay / UPES" value={formData.university} onChange={(e) => setFormData({...formData, university: e.target.value})} /></div>
                </div>
              </div>
            )}

            {/* EMAIL METHOD */}
            {authMethod === 'email' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                    <div className="relative"><Mail className="absolute left-3 top-3 text-gray-400" size={18} /><input required type="email" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none font-bold text-gray-700 text-sm" placeholder="john@example.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
                  </div>
                  
                  {/* PHONE WITH +91 PREFIX (EMAIL FLOW) */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label>
                    <div className="flex relative">
                      <div className="bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl px-3 flex items-center text-gray-500 font-bold text-sm select-none">+91</div>
                      <input required type="tel" className="w-full pr-4 py-3 bg-gray-50 border border-gray-200 rounded-r-xl focus:border-teal-500 focus:outline-none font-bold text-gray-700 text-sm" placeholder="98765 43210" maxLength={10} value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} />
                    </div>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                    <div className="relative"><Lock className="absolute left-3 top-3 text-gray-400" size={18} /><input required type="password" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none font-bold text-gray-700 text-sm" placeholder="••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} /></div>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#0f766e] text-white font-bold py-3 rounded-xl hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg mt-4">{loading ? <Loader2 className="animate-spin" /> : <>Verify Email & Sign Up <ArrowRight size={20}/></>}</button>
              </>
            )}

            {/* PHONE METHOD */}
            {authMethod === 'phone' && (
              <>
                {!otpSent ? (
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile Number</label>
                    <div className="flex relative mb-4">
                      <div className="bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl px-3 flex items-center text-gray-500 font-bold text-sm select-none">+91</div>
                      <input required type="tel" className="w-full pr-4 py-3 bg-gray-50 border border-gray-200 rounded-r-xl focus:border-teal-500 focus:outline-none font-bold text-gray-700 text-sm" placeholder="98765 43210" maxLength={10} value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '')})} />
                    </div>
                    
                    {/* VISIBLE RECAPTCHA */}
                    <div id="recaptcha-container" className="mb-4 flex justify-center"></div>

                    <button onClick={handleSendOtp} disabled={loading} className="w-full bg-[#0f766e] text-white font-bold py-3 rounded-xl hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg">{loading ? <Loader2 className="animate-spin" /> : <>Send OTP <MessageSquare size={20}/></>}</button>
                  </div>
                ) : (
                  <div className="col-span-2 animate-in fade-in">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Enter OTP sent to +91 {formData.phone}</label>
                    <div className="relative"><Lock className="absolute left-3 top-3 text-gray-400" size={18} /><input required type="text" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none font-bold text-gray-700 text-sm tracking-widest" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} /></div>
                    <button onClick={handleVerifyOtp} disabled={loading} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg mt-4">{loading ? <Loader2 className="animate-spin" /> : <>Verify & Create Account <CheckCircle size={20}/></>}</button>
                    <button onClick={() => setOtpSent(false)} className="w-full text-gray-400 text-xs font-bold mt-2 hover:text-gray-600">Change Number</button>
                  </div>
                )}
              </>
            )}
          </form>

          {/* Google Divider */}
          <div className="flex items-center gap-4 my-6"><div className="h-px bg-gray-200 flex-1"></div><span className="text-xs text-gray-400 font-bold uppercase">Or</span><div className="h-px bg-gray-200 flex-1"></div></div>
          <button onClick={handleGoogleSignup} disabled={loading} className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all">
             <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> Google Signup
          </button>
          
          <div className="mt-8 text-center text-sm font-medium text-gray-500">Already have an account?{' '}<Link to="/login" className="text-[#0f766e] font-bold hover:underline">Log in here</Link></div>
        </div>
      </div>
    </div>
  );
}