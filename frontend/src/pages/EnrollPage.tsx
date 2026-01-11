import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Bot, 
  CreditCard,
  Lock,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Ensure this path is correct for your project
import { db } from '../lib/firebase'; 
import { doc, updateDoc, arrayUnion, collection, query, where, getDocs, orderBy } from 'firebase/firestore';

// Interface for Type Safety
interface Course {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  originalPrice: number;
  features: string[];
  priority?: number;
}

// Helper to load Razorpay
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export function EnrollPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [loadingCourses, setLoadingCourses] = useState(true);
  
  const [processingPayment, setProcessingPayment] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState({ type: '', text: '' });

  // --- 1. FETCH COURSES FROM FIREBASE ---
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Fetch courses and sort by 'priority'
        const q = query(collection(db, "courses"), orderBy("priority", "asc"));
        const querySnapshot = await getDocs(q);
        
        const fetchedCourses: Course[] = [];
        querySnapshot.forEach((doc) => {
          fetchedCourses.push({ id: doc.id, ...doc.data() } as Course);
        });

        setCourses(fetchedCourses);
        if (fetchedCourses.length > 0) {
          setSelectedCourseId(fetchedCourses[0].id); // Select first course by default
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        // Fallback or alert if needed
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  // Derived State
  const selectedCourse = courses.find(c => c.id === selectedCourseId) || courses[0];
  const finalPrice = selectedCourse ? Math.max(0, selectedCourse.price - discount) : 0;

  // --- 2. COUPON LOGIC ---
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setProcessingPayment(true);
    setCouponMessage({ type: '', text: '' });

    try {
      const q = query(collection(db, "coupons"), where("code", "==", couponCode.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setCouponMessage({ type: 'error', text: 'Invalid Coupon Code' });
        setDiscount(0);
      } else {
        const couponData = querySnapshot.docs[0].data();
        if (couponData.isActive) {
          setDiscount(couponData.discountAmount);
          setCouponMessage({ type: 'success', text: `Success! ₹${couponData.discountAmount} Saved.` });
        } else {
          setCouponMessage({ type: 'error', text: 'This coupon has expired.' });
        }
      }
    } catch (error) {
      console.error("Coupon Error:", error);
      setCouponMessage({ type: 'error', text: 'Could not verify coupon.' });
    }
    setProcessingPayment(false);
  };

  // --- 3. PAYMENT LOGIC (UPDATED) ---
  const handlePayment = async () => {
    // 🔴 Redirect to SIGNUP if not logged in
    if (!user) {
      navigate({ to: '/signup', search: { redirect: '/enroll' } });
      return;
    }

    if (!selectedCourse) return;

    setProcessingPayment(true);

    const res = await loadRazorpayScript();
    if (!res) {
      alert('Network Error: Could not load Razorpay.');
      setProcessingPayment(false);
      return;
    }

    try {
      // Step A: Create Order (Backend)
      const response = await fetch('/api/razorpay', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalPrice * 100 }) // Amount in Paise
      });
      
      const orderData = await response.json();

      if (!response.ok) throw new Error("Server Error");

      // Step B: Open Popup
      const options = {
        // 🔴 FIX: Using Environment Variable //RAZORPAYKEY
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "", 
        amount: orderData.amount.toString(),
        currency: "INR",
        name: "Petro Elite",
        description: selectedCourse.title,
        order_id: orderData.id,
        handler: async function (response: any) {
          // Step C: Payment Success -> GRANT ACCESS
          try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
              enrolledCourses: arrayUnion(selectedCourse.id),
              isPremium: true,
              lastPaymentId: response.razorpay_payment_id,
              lastPaymentDate: new Date().toISOString()
            });
            alert("Welcome to the Elite Club! Access Granted.");
            navigate({ to: '/dashboard' });
          } catch (dbError) {
            console.error("Database Update Failed", dbError);
            alert("Payment received but access update failed. Contact support immediately.");
          }
        },
        prefill: {
          name: user.displayName || "",
          email: user.email || "",
          contact: user.phoneNumber || "", // This will be pre-filled if user logged in via phone
        },
        theme: { color: "#0f766e" },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error(error);
      alert("Something went wrong with the transaction. Please try again.");
    }
    setProcessingPayment(false);
  };

  // --- 4. LOADING STATE UI ---
  if (loadingCourses) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="animate-spin text-teal-600" size={40} />
        <p className="text-slate-500 font-medium">Loading available courses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* Header */}
      <div className="bg-teal-900 text-white py-12 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <h1 className="text-3xl md:text-5xl font-bold mb-4 relative z-10 font-handwritten">
          Join the Elite. Crack the Gate.
        </h1>
        <p className="text-teal-200 text-lg max-w-2xl mx-auto relative z-10">
          Choose the plan that fits your timeline.
        </p>
      </div>

      <main className="max-w-6xl mx-auto px-6 -mt-8 grid md:grid-cols-3 gap-8 relative z-20">
        
        {/* LEFT COLUMN: Course Selector & Features */}
        <div className="md:col-span-2 space-y-8">
          
          {/* 1. Dynamic Tabs */}
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-2">
            {courses.length === 0 ? (
                <div className="p-4 text-gray-500 italic w-full text-center">No courses currently available. Check back soon!</div>
            ) : (
                courses.map((course) => (
                <button
                    key={course.id}
                    onClick={() => { setSelectedCourseId(course.id); setDiscount(0); setCouponMessage({type:'', text:''}); }}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                    selectedCourseId === course.id
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    {course.title}
                </button>
                ))
            )}
          </div>

          {/* 2. Feature List */}
          {selectedCourse && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Zap className="text-yellow-500" fill="currentColor" /> {selectedCourse.title}
              </h2>
              <p className="text-slate-500 mb-6 text-sm">{selectedCourse.subtitle}</p>

              <div className="grid sm:grid-cols-1 gap-4">
                {selectedCourse.features?.map((feat, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="text-teal-600 shrink-0 mt-1" size={20} />
                    <span className="text-slate-700 font-medium">{feat}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-teal-600 shrink-0 mt-1" size={20} />
                  <span className="text-slate-700 font-medium">AI Doubt Solver (Petrobot) - Unlimited Access</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. Petrobot Promo */}
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-8 rounded-2xl border border-indigo-500 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 opacity-20 blur-3xl rounded-full"></div>
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
              <Bot className="text-indigo-400" size={28} /> 
              PETROBOT - THE FIRST COMPLETE PETROLEUM AI ENGINE
            </h3>
            <p className="text-indigo-200 text-sm mb-6 leading-relaxed">
              Stuck on a reservoir calculation at 2 AM? Petrobot is trained on thousands of GATE questions to give you instant solutions.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Pricing */}
        {selectedCourse && (
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-xl border-t-8 border-teal-600 sticky top-24">
              
              <div className="text-center mb-6">
                <span className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  {selectedCourse.subtitle}
                </span>
                <div className="mt-4 flex justify-center items-end gap-2">
                  <span className="text-gray-400 text-lg line-through decoration-red-500 decoration-2">₹{selectedCourse.originalPrice}</span>
                  <span className="text-4xl font-extrabold text-slate-900">₹{finalPrice}</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">One-time payment. Valid until Exam.</p>
              </div>

              {/* Coupon */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter Coupon Code" 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 uppercase"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button 
                    onClick={applyCoupon}
                    disabled={processingPayment}
                    className="bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-900 transition"
                  >
                    APPLY
                  </button>
                </div>
                {couponMessage.text && (
                  <p className={`text-xs mt-2 font-bold ${couponMessage.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                    {couponMessage.text}
                  </p>
                )}
              </div>

              {/* Pay Button */}
              <button 
                onClick={handlePayment}
                disabled={processingPayment}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 group"
              >
                {processingPayment ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    Enroll Now <CreditCard size={20} className="group-hover:translate-x-1 transition" />
                  </>
                )}
              </button>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <ShieldCheck size={16} className="text-green-600" />
                  <span>SSL Encrypted Secure Payment</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <Lock size={16} className="text-slate-400" />
                  <span>30-Day Money Back Guarantee</span>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}