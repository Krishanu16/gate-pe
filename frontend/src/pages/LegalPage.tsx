import React from 'react';
import { Link } from '@tanstack/react-router';
import { Shield, FileText, RefreshCw, Mail, ArrowLeft } from 'lucide-react';

const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Architects+Daughter&family=Caveat:wght@400;700&display=swap');
    .handwritten-title { font-family: 'Caveat', cursive, sans-serif; }
    .legal-content h3 { font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #0f766e; }
    .legal-content p { margin-bottom: 1rem; color: #374151; line-height: 1.7; }
    .legal-content ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 1rem; color: #374151; }
    .legal-section { scroll-margin-top: 120px; } /* Smooth scroll offset */
  `}</style>
);

export function LegalPage() {
  return (
    <div className="min-h-screen bg-[#ecfdf5] font-sans selection:bg-teal-200">
      <Styles />
      
      {/* Header */}
      <header className="bg-white border-b-4 border-[#0f766e] px-6 py-4 sticky top-0 z-50 shadow-sm">
         <div className="max-w-4xl mx-auto flex justify-between items-center">
            <h1 className="handwritten-title text-3xl font-bold text-gray-800 tracking-wide">
               PETRO ELITE
            </h1>
            <Link to="/" className="flex items-center gap-2 text-[#0f766e] font-bold hover:text-teal-800 transition-colors">
               <ArrowLeft size={20} /> Back Home
            </Link>
         </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-6">
         
         <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border-2 border-[#0f766e] legal-content">
            <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 font-handwritten">
                   Legal Center
                </h1>
                <p className="text-gray-500">Last Updated: January 2026</p>
            </div>

            {/* Quick Links for smoother navigation */}
            <div className="flex flex-wrap gap-4 justify-center mb-10 text-sm">
                {['Contact', 'Terms', 'Refunds', 'Privacy'].map((item) => (
                    <a key={item} href={`#${item.toLowerCase()}`} className="px-4 py-2 bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition">
                        {item}
                    </a>
                ))}
            </div>
            
            <hr className="my-8 border-gray-100" />

            {/* SECTION 1: CONTACT US (MANDATORY FOR RAZORPAY) */}
            <section id="contact" className="legal-section mb-12">
               <div className="flex items-center gap-3 mb-4 border-b pb-2 border-teal-100">
                  <Mail className="text-[#0f766e]" size={28} />
                  <h2 className="text-2xl font-bold text-gray-800">Contact Us</h2>
               </div>
               <p>We are here to help. For queries, support, or complaints, please reach out to us:</p>
               <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-sm md:text-base">
                  <div className="grid md:grid-cols-2 gap-6">
                      <div>
                          <p className="font-semibold text-gray-900">Operating Address:</p>
                          <p>Dowarah Chuk, Behia Chetia Gaon<br/>Dibrugarh, Assam, 786004<br/>India</p>
                      </div>
                      <div>
                          <p className="font-semibold text-gray-900">Digital Support:</p>
                          <p>Email: <a href="mailto:support@petroelite.in" className="text-teal-700 font-bold hover:underline">support@petroelite.in</a></p>
                          <p>Phone: +91 87619 08359</p>
                      </div>
                  </div>
               </div>
            </section>

            {/* SECTION 2: TERMS AND CONDITIONS */}
            <section id="terms" className="legal-section mb-12">
               <div className="flex items-center gap-3 mb-4 border-b pb-2 border-teal-100">
                  <FileText className="text-[#0f766e]" size={28} />
                  <h2 className="text-2xl font-bold text-gray-800">Terms & Conditions</h2>
               </div>
               <p>Welcome to <strong>Petro Elite</strong>. By accessing this website and purchasing our courses (including GATE Petroleum 2026), you agree to the following terms:</p>
               
               <h3>1. Course Access & License</h3>
               <p>Upon purchase, Petro Elite grants you a non-exclusive, non-transferable, personal license to access the course materials. Sharing your login credentials, screen recording, or distributing our content is strictly prohibited and will result in <strong>immediate account termination without refund</strong>.</p>

               <h3>2. Intellectual Property</h3>
               <p>All content (videos, PDFs, mock tests, notes) is the exclusive intellectual property of Petro Elite. You may not reproduce, redistribute, or sell any material without prior written consent.</p>

               <h3>3. Account Security</h3>
               <p>You are responsible for maintaining the confidentiality of your account. Our system detects suspicious activity (e.g., simultaneous logins from different cities) which may trigger an automated block.</p>
            </section>

            {/* SECTION 3: REFUND POLICY */}
            <section id="refunds" className="legal-section mb-12">
               <div className="flex items-center gap-3 mb-4 border-b pb-2 border-teal-100">
                  <RefreshCw className="text-[#0f766e]" size={28} />
                  <h2 className="text-2xl font-bold text-gray-800">Refund Policy</h2>
               </div>
               
               <p>We strive to provide the highest quality education for Petroleum Engineering aspirants. Please read our refund rules carefully:</p>

               <h3>1. Eligibility</h3>
               <p>You are eligible for a full refund only if <strong>BOTH</strong> conditions are met:</p>
               <ul className="list-disc pl-5 space-y-2">
                  <li>You request the refund within <strong>5 days</strong> of the purchase date.</li>
                  <li>You have consumed (viewed/downloaded) less than <strong>20%</strong> of the total course content.</li>
               </ul>

               <h3>2. How to Request</h3>
               <p>Send an email to <a href="mailto:support@petroelite.in" className="text-teal-700 font-bold">support@petroelite.in</a> with the subject line <em>"Refund Request - [Your Name]"</em>. Please include your Transaction ID.</p>

               <h3>3. Processing Time</h3>
               <p>Approved refunds are processed within 5-7 business days and credited back to the original payment method.</p>
            </section>

            {/* SECTION 4: PRIVACY POLICY */}
            <section id="privacy" className="legal-section mb-12">
               <div className="flex items-center gap-3 mb-4 border-b pb-2 border-teal-100">
                  <Shield className="text-[#0f766e]" size={28} />
                  <h2 className="text-2xl font-bold text-gray-800">Privacy Policy</h2>
               </div>
               
               <p>At Petro Elite, we value your trust. This policy outlines how we handle your data.</p>

               <h3>1. Data Collection</h3>
               <p>We collect your name, email, phone number, and academic details to provide the learning experience. We <strong>do not</strong> store your credit card or banking password details; these are processed securely by our payment partner (Razorpay).</p>

               <h3>2. Usage of Data</h3>
               <p>Your data is used to:</p>
               <ul>
                   <li>Grant access to course modules.</li>
                   <li>Send important exam updates and study schedules.</li>
                   <li>Prevent fraud and unauthorized access.</li>
               </ul>

               <h3>3. Third-Party Sharing</h3>
               <p>We do not sell your personal data. We only share necessary data with trusted partners (e.g., Razorpay for payments, Firebase for authentication) strictly for operational purposes.</p>
            </section>

         </div>
      </main>
      
      <footer className="bg-teal-900 text-teal-100 py-8 text-center border-t-4 border-teal-600">
         <p className="font-medium">&copy; 2026 PETRO ELITE. All rights reserved.</p>
         <p className="text-sm text-teal-400 mt-2">Built for Petroleum Engineers, by Petroleum Engineers.</p>
      </footer>
    </div>
  );
}