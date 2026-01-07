import React from 'react';
import { Link } from '@tanstack/react-router';
import { Shield, FileText, RefreshCw, Mail } from 'lucide-react';

const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Caveat:wght@400;700&display=swap');
    .handwritten-title { font-family: 'Caveat', cursive, sans-serif; }
    .legal-content h3 { font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #0f766e; }
    .legal-content p { margin-bottom: 1rem; color: #4b5563; line-height: 1.6; }
    .legal-content ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 1rem; color: #4b5563; }
  `}</style>
);

export function LegalPage() {
  return (
    <div className="min-h-screen bg-[#ecfdf5] font-sans">
      <Styles />
      
      {/* Header */}
      <header className="bg-white border-b-4 border-[#0f766e] p-6 sticky top-0 z-10">
         <div className="max-w-4xl mx-auto flex justify-between items-center">
            <h1 className="handwritten-title text-3xl font-bold text-gray-800">
               GATE Petroleum 2026
            </h1>
            <Link to="/" className="text-[#0f766e] font-bold hover:underline">
               ← Back Home
            </Link>
         </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-6">
         
         <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border-2 border-[#0f766e] legal-content">
            <h1 className="text-4xl font-bold text-gray-900 mb-8 font-handwritten text-center">
               Terms, Policies & Support
            </h1>
            
            <hr className="my-8 border-gray-200" />

            {/* SECTION 1: CONTACT US (MANDATORY FOR RAZORPAY) */}
            <section id="contact" className="mb-12">
               <div className="flex items-center gap-3 mb-4">
                  <Mail className="text-[#0f766e]" size={28} />
                  <h2 className="text-2xl font-bold text-gray-800">Contact Us</h2>
               </div>
               <p>For any queries, support, or complaints, please contact us at:</p>
               <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p><strong>Operating Address:</strong><br/> [YOUR FULL ADDRESS HERE] <br/> [CITY, STATE, ZIP CODE]</p>
                  <p><strong>Email:</strong> <a href="mailto:support@gatepetroleum.com" className="text-blue-600 hover:underline">support@gatepetroleum.com</a></p>
                  <p><strong>Phone:</strong> +91 [YOUR PHONE NUMBER]</p>
               </div>
            </section>

            <hr className="my-8 border-gray-200" />

            {/* SECTION 2: TERMS AND CONDITIONS */}
            <section id="terms" className="mb-12">
               <div className="flex items-center gap-3 mb-4">
                  <FileText className="text-[#0f766e]" size={28} />
                  <h2 className="text-2xl font-bold text-gray-800">Terms & Conditions</h2>
               </div>
               <p>Welcome to GATE Petroleum 2026. By accessing this website and purchasing our courses, you agree to the following terms:</p>
               
               <h3>1. Course Access</h3>
               <p>Upon purchase, you grant a non-exclusive, non-transferable license to access the course materials. Sharing your login credentials or course content is strictly prohibited and will result in immediate account termination.</p>

               <h3>2. Intellectual Property</h3>
               <p>All content (videos, PDFs, notes) is the intellectual property of GATE Petroleum 2026. You may not reproduce, redistribute, or sell any material without prior written consent.</p>

               <h3>3. Usage Policy</h3>
               <p>We log IP addresses and device IDs. Accounts showing suspicious activity (e.g., logins from multiple distant locations or excessive downloads) may be blocked automatically.</p>
            </section>

            <hr className="my-8 border-gray-200" />

            {/* SECTION 3: REFUND POLICY (CRITICAL) */}
            <section id="refund" className="mb-12">
               <div className="flex items-center gap-3 mb-4">
                  <RefreshCw className="text-[#0f766e]" size={28} />
                  <h2 className="text-2xl font-bold text-gray-800">Refund & Cancellation Policy</h2>
               </div>
               
               <p>We strive to provide the highest quality education. However, we understand that circumstances may change.</p>

               <h3>1. Refund Eligibility</h3>
               <p>You are eligible for a full refund if:</p>
               <ul>
                  <li>You request the refund within <strong>5 days</strong> of purchase.</li>
                  <li>You have accessed less than <strong>20%</strong> of the course content.</li>
               </ul>

               <h3>2. Process</h3>
               <p>To request a refund, email us at support@gatepetroleum.com with your Transaction ID. Refunds are processed within 5-7 business days back to the original payment method.</p>

               <h3>3. Cancellations</h3>
               <p>Once a refund is processed, your access to the course will be revoked immediately.</p>
            </section>

            <hr className="my-8 border-gray-200" />

            {/* SECTION 4: PRIVACY POLICY */}
            <section id="privacy" className="mb-12">
               <div className="flex items-center gap-3 mb-4">
                  <Shield className="text-[#0f766e]" size={28} />
                  <h2 className="text-2xl font-bold text-gray-800">Privacy Policy</h2>
               </div>
               
               <p>We value your privacy and are committed to protecting your personal data.</p>

               <h3>1. Information We Collect</h3>
               <p>We collect your name, email, phone number, and payment information (processed securely via Razorpay) to provide our services.</p>

               <h3>2. How We Use Your Data</h3>
               <p>Your data is used solely for course delivery, communication, and support. We do not sell your data to third parties.</p>

               <h3>3. Cookies</h3>
               <p>We use cookies to maintain your login session and analyze site traffic.</p>
            </section>

         </div>
      </main>
      
      <footer className="bg-teal-900 text-teal-100 py-8 text-center">
         <p>&copy; 2026 GATE Petroleum. All rights reserved.</p>
      </footer>
    </div>
  );
}