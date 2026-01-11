import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithPhoneNumber,
  RecaptchaVerifier,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Logo } from '@/components/Logo';
import { 
  Mail, Lock, ArrowRight, Loader2, 
  CheckCircle, ShieldCheck, Smartphone, MessageSquare, LogIn
} from 'lucide-react';
import { toast } from 'sonner';

// --- STYLES ---
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Caveat:wght@400;700&display=swap');
    .handwritten-title { font-family: 'Caveat', cursive; }
    .handwritten-body { font-family: 'Architects Daughter', cursive; }
  `}</style>
);

export function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

  // Phone Auth State
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // Email Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- RECAPTCHA CLEANUP & SETUP ---
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container-login', {
      'size': 'invisible', // Invisible is usually fine for Login, switch to 'normal' if debugging needed
      'callback': () => console.log("Captcha Verified")
    });
  };

  // --- UPDATE LAST LOGIN ---
  const updateLoginStats = async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        lastLoginDate: new Date().toLocaleDateString(),
        lastLoginTime: new Date().toISOString()
      });
    } catch (e) {
      console.error("Stats update failed", e); // Non-critical error
    }
  };

  // --- 1. EMAIL LOGIN ---
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill in all fields"); return; }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        toast.error("Please verify your email first.");
        setLoading(false);
        return;
      }

      await updateLoginStats(userCredential.user.uid);
      toast.success("Welcome back!");
      navigate({ to: '/dashboard' });
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/invalid-credential') toast.error("Invalid email or password.");
      else if (error.code === 'auth/user-not-found') toast.error("No account found. Sign up first.");
      else toast.error("Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. PHONE LOGIN ---
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) { toast.error("Enter valid 10-digit number."); return; }
    
    const formattedPhone = `+91${cleanPhone}`;
    setLoading(true);

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setOtpSent(true);
      toast.success(`OTP Sent to ${formattedPhone}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      
      // Check if user exists in DB (optional security step)
      const userSnap = await getDoc(doc(db, "users", result.user.uid));
      if (!userSnap.exists()) {
        toast.warning("Account not found. Creating new profile...");
        // You could redirect to a "Complete Profile" page here if needed
      }

      await updateLoginStats(result.user.uid);
      toast.success("Welcome back!");
      navigate({ to: '/dashboard' });
    } catch (error) {
      toast.error("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. GOOGLE LOGIN ---
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await updateLoginStats(result.user.uid);
      toast.success("Signed in with Google");
      navigate({ to: '/dashboard' });
    } catch (error) {
      toast.error("Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- 4. FORGOT PASSWORD ---
  const handleForgotPassword = async () => {
    if (!email) { toast.error("Enter your email address first."); return; }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset link sent to email!");
    } catch (error) {
      toast.error("Could not send reset link. Check email.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex font-sans">
      <Styles />
      
      {/* Recaptcha Container */}
      <div id="recaptcha-container-login"></div>

      {/* LEFT SIDE: BRANDING */}
      <div className="hidden lg:flex w-1/2 bg-[#0f766e] relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10"><Logo variant="white" /></div>
        <div className="relative z-10 space-y-8">
          <h1 className="text-5xl font-black leading-tight">Welcome <br/><span className="text-teal-200 handwritten-title">Back.</span></h1>
          <div className="space-y-4 text-lg text-teal-100">
            <div className="flex items-center gap-3"><ShieldCheck className="text-teal-300" /> <span>Continue your preparation</span></div>
            <div className="flex items-center gap-3"><CheckCircle className="text-teal-300" /> <span>Review your test analytics</span></div>
          </div>
        </div>
        <div className="relative z-10 text-sm text-teal-200 font-bold">© 2026 Petro Elite. Secure Education Platform.</div>
      </div>

      {/* RIGHT SIDE: FORM */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-800 mb-2">Member Login</h2>
            <p className="text-gray-500">Access your dashboard and content.</p>
          </div>

          {/* Toggle Method */}
          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button onClick={() => setAuthMethod('email')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${authMethod === 'email' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}><Mail size={16}/> Email</button>
            <button onClick={() => setAuthMethod('phone')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${authMethod === 'phone' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}><Smartphone size={16}/> Phone</button>
          </div>

          {/* FORM */}
          <form onSubmit={authMethod === 'email' ? handleEmailLogin : (otpSent ? (e) => e.preventDefault() : handleSendOtp)} className="space-y-4">
            
            {/* EMAIL LOGIN */}
            {authMethod === 'email' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                  <div className="relative"><Mail className="absolute left-3 top-3 text-gray-400" size={18} /><input required type="email" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none font-bold text-gray-700 text-sm" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                </div>
                <div>
                  <div className="flex justify-between mb-1"><label className="block text-xs font-bold text-gray-500 uppercase">Password</label><button type="button" onClick={handleForgotPassword} className="text-xs text-teal-600 font-bold hover:underline">Forgot?</button></div>
                  <div className="relative"><Lock className="absolute left-3 top-3 text-gray-400" size={18} /><input required type="password" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none font-bold text-gray-700 text-sm" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#0f766e] text-white font-bold py-3 rounded-xl hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg mt-4">{loading ? <Loader2 className="animate-spin" /> : <>Login <LogIn size={20}/></>}</button>
              </>
            )}

            {/* PHONE LOGIN */}
            {authMethod === 'phone' && (
              <>
                {!otpSent ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile Number</label>
                    <div className="flex relative">
                      <div className="bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl px-3 flex items-center text-gray-500 font-bold text-sm select-none">+91</div>
                      <input required type="tel" className="w-full pr-4 py-3 bg-gray-50 border border-gray-200 rounded-r-xl focus:border-teal-500 focus:outline-none font-bold text-gray-700 text-sm" placeholder="98765 43210" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} />
                    </div>
                    <button onClick={handleSendOtp} disabled={loading} className="w-full bg-[#0f766e] text-white font-bold py-3 rounded-xl hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg mt-4">{loading ? <Loader2 className="animate-spin" /> : <>Send OTP <MessageSquare size={20}/></>}</button>
                  </div>
                ) : (
                  <div className="animate-in fade-in">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Enter OTP sent to +91 {phone}</label>
                    <div className="relative"><Lock className="absolute left-3 top-3 text-gray-400" size={18} /><input required type="text" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none font-bold text-gray-700 text-sm tracking-widest" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} /></div>
                    <button onClick={handleVerifyOtp} disabled={loading} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg mt-4">{loading ? <Loader2 className="animate-spin" /> : <>Verify & Login <CheckCircle size={20}/></>}</button>
                    <button onClick={() => setOtpSent(false)} className="w-full text-gray-400 text-xs font-bold mt-2 hover:text-gray-600">Change Number</button>
                  </div>
                )}
              </>
            )}
          </form>

          {/* Google Divider */}
          <div className="flex items-center gap-4 my-6"><div className="h-px bg-gray-200 flex-1"></div><span className="text-xs text-gray-400 font-bold uppercase">Or</span><div className="h-px bg-gray-200 flex-1"></div></div>
          <button onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all">
             <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> Login with Google
          </button>

          <div className="mt-8 text-center text-sm font-medium text-gray-500">Don't have an account?{' '}<Link to="/signup" className="text-[#0f766e] font-bold hover:underline">Create one here</Link></div>
        </div>
      </div>
    </div>
  );
}