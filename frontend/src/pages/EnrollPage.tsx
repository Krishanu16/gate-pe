import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate, Link, useNavigate } from '@tanstack/react-router';
import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { toast } from 'sonner';
import { Loader2, CheckCircle, ShieldCheck, LogIn } from 'lucide-react';

// --- 1. RAZORPAY TYPE DECLARATION ---
declare global {
  interface Window {
    Razorpay: any;
  }
}

export const EnrollPage = () => {
    // --- 2. HOOKS & STATE ---
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');

    // --- 3. LOADING CHECK (Keep this, but removed the !user redirect) ---
    if (authLoading) {
        return <div className="min-h-screen bg-[#ecfdf5] flex items-center justify-center"><Loader2 className="animate-spin text-teal-700" /></div>;
    }

    // --- 4. HANDLE PAYMENT SUCCESS (FIREBASE UPDATE) ---
    const handlePaymentSuccess = async (response: any) => {
        if (!user) return; // Safety check

        try {
            // Update User to Premium in Firestore
            await updateDoc(doc(db, "users", user.uid), {
                isPaid: true,
                role: 'premium_student',
                transactions: arrayUnion({
                    id: response.razorpay_payment_id,
                    date: new Date().toISOString(),
                    amount: 499, // Current price
                    status: 'success'
                })
            });
            
            toast.success("Welcome to the Batch of 2026! 🎉");
            navigate({ to: '/dashboard' });
            
        } catch (error) {
            console.error(error);
            toast.error("Payment successful but account activation failed. Please contact support.");
        } finally {
            setProcessing(false);
        }
    };

    // --- 5. TRIGGER RAZORPAY ---
    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();

        // [FIX]: Redirect to Login if user tries to pay without being logged in
        if (!user) {
            toast.error("Please login to complete your enrollment.");
            navigate({ to: '/login' });
            return;
        }

        setProcessing(true);

        // Load Razorpay Script dynamically
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        
        script.onload = () => {
            const options = {
                key: "YOUR_RAZORPAY_KEY_ID", // ⚠️ REPLACE WITH ACTUAL KEY
                amount: 49900, // 499.00 INR
                currency: "INR",
                name: "Petro Elite",
                description: "Premium Course Access 2026",
                image: "https://cdn-icons-png.flaticon.com/512/2083/2083256.png",
                handler: function (response: any) {
                    handlePaymentSuccess(response);
                },
                prefill: {
                    name: user.displayName || "",
                    email: user.email || "",
                    contact: "" 
                },
                theme: {
                    color: "#0f766e"
                },
                modal: {
                    ondismiss: function() {
                        setProcessing(false);
                        toast.info("Payment cancelled");
                    }
                }
            };
            
            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response: any){
                toast.error(response.error.description);
                setProcessing(false);
            });
            rzp1.open();
        };

        script.onerror = () => {
            toast.error("Razorpay SDK failed to load. Check internet connection.");
            setProcessing(false);
        };

        document.body.appendChild(script);
    };

    return (
        <div className="w-full h-full overflow-auto bg-[#ecfdf5]">
            {/* Navigation Header */}
            <header className="nav-header p-4">
                <nav className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="handwritten-title text-3xl md:text-4xl font-bold text-gray-800">
                        Petro Elite
                    </h1>
                    <Link to="/" className="handwritten-body text-lg text-teal-700 hover:text-teal-900">
                        ← Back to Home
                    </Link>
                </nav>
            </header>

            {/* Main Content */}
            <main className="grid-background py-12 px-6 relative overflow-hidden min-h-screen">
                <div className="floating-element absolute top-10 left-10 text-6xl opacity-20 select-none">🛢️</div>
                <div className="floating-element absolute bottom-20 right-20 text-6xl opacity-20 select-none">📚</div>

                <div className="max-w-4xl mx-auto">
                    {/* Page Header */}
                    <div className="text-center mb-12">
                        <div className="inline-block bg-teal-100 text-teal-800 px-4 py-1 rounded-full text-sm font-bold mb-4 border border-teal-200">
                            Final Step
                        </div>
                        <h1 className="handwritten-title text-5xl md:text-6xl font-bold text-gray-800 mb-4">
                            Secure Your Seat
                        </h1>
                        <p className="handwritten-body text-xl text-gray-600">
                            Complete your enrollment to unlock instant access.
                        </p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex items-center justify-center mb-12">
                        <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">✓</div>
                        <div className="h-1 bg-teal-600 w-20 mx-2"></div>
                        <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">2</div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        
                        {/* LEFT: Order Summary */}
                        <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-teal-100 h-fit">
                            <h3 className="handwritten-title text-2xl font-bold text-gray-800 mb-6">Order Summary</h3>
                            
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-teal-50 p-2 rounded"><CheckCircle className="text-teal-600" size={20} /></div>
                                    <span className="font-bold text-gray-700">Complete GATE Syllabus</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-teal-50 p-2 rounded"><CheckCircle className="text-teal-600" size={20} /></div>
                                    <span className="font-bold text-gray-700">65+ Mock Tests</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-teal-50 p-2 rounded"><CheckCircle className="text-teal-600" size={20} /></div>
                                    <span className="font-bold text-gray-700">Handwritten Notes PDF</span>
                                </div>
                            </div>

                            <div className="border-t border-dashed border-gray-300 my-6 pt-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-500">Original Price</span>
                                    <span className="text-gray-400 line-through">₹5,000</span>
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-teal-600 font-bold">Discount</span>
                                    <span className="text-teal-600 font-bold">-90%</span>
                                </div>
                                <div className="flex justify-between items-center text-2xl font-black text-gray-800">
                                    <span>Total</span>
                                    <span>₹499</span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Payment Form */}
                        <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-teal-100">
                            <h3 className="handwritten-title text-2xl font-bold text-gray-800 mb-6">Select Payment</h3>
                            
                            <form onSubmit={handlePayment}>
                                <div className="space-y-4 mb-8">
                                    {['upi', 'card', 'netbanking'].map((method) => (
                                        <div 
                                            key={method}
                                            className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center gap-4
                                                ${selectedPaymentMethod === method ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-200'}
                                            `}
                                            onClick={() => setSelectedPaymentMethod(method)}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPaymentMethod === method ? 'border-teal-600' : 'border-gray-300'}`}>
                                                {selectedPaymentMethod === method && <div className="w-2.5 h-2.5 bg-teal-600 rounded-full" />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800 uppercase">{method}</div>
                                                <div className="text-xs text-gray-500">
                                                    {method === 'upi' ? 'GPay, PhonePe, Paytm' : method === 'card' ? 'Credit & Debit Cards' : 'All Major Banks'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* [FIX]: DYNAMIC BUTTON STATE */}
                                <button 
                                    type="submit" 
                                    disabled={processing}
                                    className={`w-full font-bold text-xl py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed
                                        ${!user ? 'bg-gray-800 hover:bg-gray-900 text-white' : 'bg-[#0f766e] hover:bg-[#0d9488] text-white'}
                                    `}
                                >
                                    {processing ? (
                                        <>Processing <Loader2 className="animate-spin" /></>
                                    ) : !user ? (
                                        <><LogIn size={20} /> Login to Enroll</>
                                    ) : (
                                        <>Pay ₹499 Now <ShieldCheck className="group-hover:scale-110 transition-transform" /></>
                                    )}
                                </button>
                                
                                <div className="mt-4 text-center">
                                    <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                                        <ShieldCheck size={12}/> Secured by Razorpay • 256-bit Encryption
                                    </p>
                                </div>
                            </form>
                        </div>

                    </div>
                    
                    <div className="mt-12 text-center text-sm text-gray-500">
                        <Link to="/dashboard" className="underline hover:text-teal-700">Skip to Dashboard (Free Plan)</Link>
                    </div>
                </div>
            </main>
        </div>
    );
};