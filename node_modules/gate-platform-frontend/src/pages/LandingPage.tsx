import React from 'react';
import { useNavigate } from '@tanstack/react-router';
// Removed unused useAuth import to keep code clean since validation happens on EnrollPage
// import { useAuth } from '../hooks/useAuth'; 

export default function LandingPage() {
  const navigate = useNavigate();

  const handleEnrollClick = () => {
    // UPDATED: Navigate to /signup so new users create an account first
    navigate({ to: '/signup' });
  };

  const petroleumModules = [
    { id: 1, icon: '🛢️', title: 'Introduction to Petroleum', pages: 45, questions: 50, topics: ['History of Petroleum Industry', 'Basic Concepts & Terminology', 'Career Opportunities'] },
    { id: 2, icon: '🌍', title: 'Geology & Geophysics', pages: 52, questions: 75, topics: ['Sedimentary Rocks', 'Structural Geology', 'Seismic Interpretation'] },
    { id: 3, icon: '🔬', title: 'Reservoir Engineering', pages: 68, questions: 120, topics: ['Fluid Properties', 'Material Balance', 'Reserve Estimation'] },
    { id: 4, icon: '⚙️', title: 'Drilling Engineering', pages: 72, questions: 130, topics: ['Drilling Rigs & Equipment', 'Drilling Fluids', 'Well Control'] },
    { id: 5, icon: '🏭', title: 'Production Engineering', pages: 58, questions: 95, topics: ['Well Completion', 'Artificial Lift Systems', 'Surface Facilities'] },
    { id: 6, icon: '📊', title: 'Petrophysics', pages: 48, questions: 80, topics: ['Well Logging', 'Core Analysis', 'Log Interpretation'] },
    { id: 7, icon: '🌊', title: 'Enhanced Oil Recovery', pages: 42, questions: 70, topics: ['Waterflooding', 'Gas Injection', 'Chemical EOR'] },
    { id: 8, icon: '🔥', title: 'Petroleum Refining', pages: 38, questions: 60, topics: ['Crude Oil Refining', 'Distillation Processes', 'Product Quality'] },
    { id: 9, icon: '💰', title: 'Petroleum Economics', pages: 35, questions: 55, topics: ['Project Evaluation', 'Risk Analysis', 'Cost Estimation'] },
    { id: 10, icon: '🔐', title: 'Safety & HSE', pages: 30, questions: 50, topics: ['Safety Management', 'Environmental Protection', 'Emergency Response'] },
    { id: 11, icon: '🌐', title: 'Offshore Operations', pages: 44, questions: 75, topics: ['Platform Types', 'Subsea Systems', 'Marine Operations'] },
    { id: 12, icon: '🎯', title: 'Project Management', pages: 32, questions: 65, topics: ['Planning & Scheduling', 'Team Leadership', 'Quality Control'] },
  ];

  const generalModules = [
    { title: 'Engineering Mathematics', desc: 'Calculus, linear algebra, differential equations, and numerical methods' },
    { title: 'Fluid Mechanics', desc: 'Flow dynamics, pressure systems, and comprehensive fluid properties' },
    { title: 'Thermodynamics', desc: 'Energy systems, heat transfer principles, and thermodynamic cycles' },
    { title: 'General Aptitude', desc: 'Verbal ability, numerical reasoning, and logical thinking skills' },
  ];

  return (
    <div className="w-full h-full overflow-auto grid-background text-gray-800">
      
      {/* 1. HERO SECTION */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="floating-element absolute top-10 left-10 text-7xl opacity-30 select-none">🛢️</div>
          <div className="floating-element absolute top-20 right-20 text-7xl opacity-30 select-none" style={{ animationDelay: '1s' }}>⚙️</div>
          <div className="floating-element absolute bottom-10 left-1/4 text-7xl opacity-30 select-none" style={{ animationDelay: '2s' }}>📊</div>

          {/* INCREASED TEXT SIZE OF BADGE */}
          <div className="badge mb-8 text-xl px-6 py-2 shadow-sm">Complete Course 2026</div>

          <h2 className="handwritten-title text-6xl md:text-8xl font-bold text-gray-800 mb-8 leading-tight">
            Master <span className="hero-highlight">Petroleum Engineering</span><br />
            From Fundamentals to Advanced
          </h2>

          <p className="handwritten-body text-3xl text-gray-700 mb-10 max-w-4xl mx-auto leading-relaxed">
            Complete 2026 course notes covering drilling, production, reservoir engineering, and more. Access online anytime! 🚀
          </p>

          <div className="mb-10">
            <div className="price-tag rounded-lg mb-6 text-3xl px-8 py-3">₹1499 Only</div>
            <p className="handwritten-body text-xl text-gray-600">
              One-time payment • Lifetime access • View online 24/7
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button onClick={handleEnrollClick} className="btn-primary handwritten-body text-2xl rounded-xl px-10 py-4 shadow-lg hover:scale-105 transition-transform">
              Enroll Now & Get Access
            </button>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="bg-white py-20 px-6 border-y-4 border-[#0f766e]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            <div>
              <div className="handwritten-title text-6xl md:text-7xl font-bold mb-3 text-[#0d9488]">500+</div>
              <div className="handwritten-body text-2xl text-gray-600">Pages of Notes</div>
            </div>
            <div>
              <div className="handwritten-title text-6xl md:text-7xl font-bold mb-3 text-[#0d9488]">12</div>
              <div className="handwritten-body text-2xl text-gray-600">Course Modules</div>
            </div>
            <div>
              <div className="handwritten-title text-6xl md:text-7xl font-bold mb-3 text-[#0d9488]">1000+</div>
              <div className="handwritten-body text-2xl text-gray-600">Practice Questions</div>
            </div>
            <div>
              <div className="handwritten-title text-6xl md:text-7xl font-bold mb-3 text-[#0d9488]">24/7</div>
              <div className="handwritten-body text-2xl text-gray-600">Online Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="handwritten-title text-6xl md:text-7xl font-bold text-gray-800 mb-6">How It Works</h2>
            <div className="section-divider"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: '1️⃣', title: 'Enroll & Pay', desc: 'Simple one-time payment of ₹1499. Secure checkout with instant confirmation.' },
              { icon: '2️⃣', title: 'Access Your Dashboard', desc: 'Login to your personal student dashboard. All course materials organized and ready.' },
              { icon: '3️⃣', title: 'Study Online Anytime', desc: 'View all notes directly in your browser. Study at your own pace, 24/7 access forever!' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border-2 border-[#0f766e] p-10 rounded-3xl text-center shadow-[6px_6px_0px_#0f766e] hover:shadow-[10px_10px_0px_#0f766e] hover:-translate-y-2 hover:bg-[#f0fdfa] transition-all duration-300 cursor-default">
                <div className="text-6xl mb-8 transform hover:scale-110 transition-transform duration-300 inline-block">{item.icon}</div>
                <h3 className="handwritten-title text-3xl font-bold mb-5 text-[#0f766e]">{item.title}</h3>
                <p className="handwritten-body text-xl text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE OUR PLATFORM */}
      <section className="bg-white py-24 px-6 border-y-4 border-[#0f766e]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="handwritten-title text-6xl md:text-7xl font-bold text-gray-800 mb-6">Why Choose Our Platform?</h2>
            <div className="section-divider"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Comprehensive Content', desc: 'Complete study materials covering all GATE Petroleum Engineering topics with detailed explanations.' },
              { title: 'Secure Platform', desc: 'Advanced anti-piracy measures and content protection to safeguard your investment.' },
              { title: 'Track Progress', desc: 'Monitor your learning journey with our intuitive progress tracking system and stay motivated.' },
              { title: 'Expert Guidance', desc: 'Content curated and reviewed by experienced petroleum engineering professionals and GATE toppers.' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border-2 border-[#0f766e] p-8 rounded-2xl shadow-[4px_4px_0px_#0f766e] hover:shadow-[8px_8px_0px_#0f766e] hover:-translate-y-1 transition-all duration-300">
                <h3 className="handwritten-title text-2xl font-bold mb-4 text-[#0d9488] border-b-2 border-dashed border-gray-200 pb-2">{item.title}</h3>
                <p className="handwritten-body text-lg text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. COURSE MODULES & GENERAL MODULES */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="handwritten-title text-6xl md:text-7xl font-bold text-gray-800 mb-6">Course Modules</h2>
            <p className="handwritten-body text-2xl text-gray-600 max-w-4xl mx-auto">Explore our comprehensive curriculum designed to cover every aspect of GATE Petroleum Engineering 📚</p>
          </div>
          
          {/* Main Petroleum Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
            {petroleumModules.map((module) => (
              <div key={module.id} className="bg-white border-2 border-[#0f766e] p-8 rounded-xl shadow-[5px_5px_0px_#0f766e] hover:-translate-y-2 hover:shadow-[8px_8px_0px_#0f766e] transition-all duration-300">
                <div className="flex items-center gap-4 mb-6 border-b-2 border-dashed border-gray-200 pb-4">
                  <span className="text-5xl">{module.icon}</span>
                  <div>
                    <div className="handwritten-body text-sm font-bold text-gray-500 uppercase tracking-wide">Module {module.id}</div>
                    <h3 className="handwritten-title text-3xl font-bold leading-tight text-gray-800">{module.title}</h3>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {module.topics.map((topic, i) => (
                    <li key={i} className="flex items-center gap-3 handwritten-body text-gray-700 text-lg">
                      <span className="text-gray-400">🔒</span> {topic}
                    </li>
                  ))}
                </ul>
                <div className="handwritten-body text-base font-bold text-[#0d9488] bg-teal-50 inline-block px-4 py-2 rounded-full border border-teal-100">
                  {module.pages} pages • {module.questions} questions
                </div>
              </div>
            ))}
          </div>

          {/* General Engineering Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {generalModules.map((item, idx) => (
              <div key={idx} className="bg-white border-2 border-[#0f766e] p-8 rounded-xl text-center shadow-[4px_4px_0px_#0f766e] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#0f766e] transition-all duration-300 flex flex-col justify-between h-full">
                <div>
                  <h3 className="handwritten-title text-2xl font-bold mb-4 text-[#0f766e]">{item.title}</h3>
                  <p className="handwritten-body text-lg text-gray-600 mb-6 leading-relaxed">{item.desc}</p>
                </div>
                {/* Wired up View Module button */}
                <button onClick={handleEnrollClick} className="btn-secondary text-[#0f766e] font-bold text-lg hover:bg-teal-50 w-full py-2 rounded-lg border-2 border-[#0f766e]">View Module →</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. WHAT YOU'LL LEARN */}
      <section className="bg-white py-24 px-6 border-y-4 border-[#0f766e]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="handwritten-title text-6xl md:text-7xl font-bold text-gray-800 mb-6">What You'll Learn</h2>
            <div className="section-divider"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Box 1 */}
            <div className="bg-white border-2 border-[#0f766e] p-10 rounded-2xl shadow-[6px_6px_0px_#065f46]">
              <h3 className="handwritten-title text-4xl font-bold mb-8 text-[#0d9488] border-b-4 border-yellow-200 inline-block">Core Petroleum Subjects</h3>
              <ul className="space-y-6 handwritten-body text-xl text-gray-700">
                <li className="flex gap-4 items-start"><span className="text-green-500 text-2xl">✓</span> <span><strong>Drilling Engineering</strong> - Fundamentals, techniques, and advanced concepts</span></li>
                <li className="flex gap-4 items-start"><span className="text-green-500 text-2xl">✓</span> <span><strong>Production Engineering</strong> - Well completion and production optimization</span></li>
                <li className="flex gap-4 items-start"><span className="text-green-500 text-2xl">✓</span> <span><strong>Reservoir Engineering</strong> - Fluid properties and reservoir characterization</span></li>
                <li className="flex gap-4 items-start"><span className="text-green-500 text-2xl">✓</span> <span><strong>Formation Evaluation</strong> - Well logging and interpretation techniques</span></li>
                <li className="flex gap-4 items-start"><span className="text-green-500 text-2xl">✓</span> <span><strong>Natural Gas Engineering</strong> - Processing and transportation</span></li>
              </ul>
            </div>
            {/* Box 2 */}
            <div className="bg-white border-2 border-[#0f766e] p-10 rounded-2xl shadow-[6px_6px_0px_#065f46]">
              <h3 className="handwritten-title text-4xl font-bold mb-8 text-orange-500 border-b-4 border-yellow-200 inline-block">Supporting Subjects</h3>
              <ul className="space-y-6 handwritten-body text-xl text-gray-700">
                <li className="flex gap-4 items-start"><span className="text-orange-500 text-2xl">✓</span> <span><strong>Engineering Mathematics</strong> - Calculus, linear algebra, and differential equations</span></li>
                <li className="flex gap-4 items-start"><span className="text-orange-500 text-2xl">✓</span> <span><strong>Fluid Mechanics</strong> - Flow dynamics and pressure systems</span></li>
                <li className="flex gap-4 items-start"><span className="text-orange-500 text-2xl">✓</span> <span><strong>Thermodynamics</strong> - Energy systems and heat transfer</span></li>
                <li className="flex gap-4 items-start"><span className="text-orange-500 text-2xl">✓</span> <span><strong>General Aptitude</strong> - Verbal and numerical reasoning</span></li>
                <li className="flex gap-4 items-start"><span className="text-orange-500 text-2xl">✓</span> <span><strong>Engineering Mechanics</strong> - Statics and dynamics fundamentals</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PLATFORM FEATURES */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="handwritten-title text-6xl md:text-7xl font-bold text-gray-800 mb-6">Platform Features</h2>
            <div className="section-divider"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {[
               { title: 'Secure Access', desc: 'Internet Identity authentication ensures your account is protected with cutting-edge blockchain security' },
               { title: 'Progress Tracking', desc: 'Keep track of completed modules, time spent, and areas that need more focus with detailed analytics' },
               { title: 'Interactive Content', desc: 'Engage with diagrams, illustrations, and visual aids that make complex concepts easy to understand' },
               { title: '24/7 Access', desc: 'Study at your own pace, anytime, anywhere. All materials are available round the clock' },
               { title: 'Regular Updates', desc: 'Content is continuously updated to reflect the latest GATE syllabus and exam patterns' },
               { title: 'Structured Learning', desc: 'Follow a carefully designed curriculum that builds knowledge progressively from basics to advanced' }
             ].map((feat, i) => (
               <div key={i} className="bg-white border-2 border-[#0f766e] p-8 rounded-2xl shadow-md hover:shadow-[8px_8px_0px_#0f766e] hover:-translate-y-2 hover:bg-[#ecfdf5] transition-all duration-300 group cursor-default">
                 <h3 className="handwritten-title text-3xl font-bold mb-4 text-[#0d9488] group-hover:text-[#0f766e] transition-colors">{feat.title}</h3>
                 <p className="handwritten-body text-xl text-gray-600 leading-relaxed">{feat.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* 8. PRICING */}
      <section className="bg-[#0f766e] py-24 px-6 text-white pattern-bg">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="handwritten-title text-6xl md:text-7xl font-bold mb-10 text-white">Simple, Transparent Pricing</h2>
          <div className="bg-white text-gray-800 rounded-3xl p-10 shadow-[10px_10px_0px_#000]">
            <h3 className="handwritten-title text-5xl font-bold mb-4 text-[#0f766e]">Complete Access</h3>
            <div className="flex justify-center items-end gap-3 mb-8">
               <span className="text-6xl font-bold text-[#0d9488] font-sans">₹1499</span>
               <span className="text-2xl text-gray-400 mb-3 font-bold line-through">₹4999</span>
               <span className="text-xl text-gray-500 mb-3">one-time</span>
            </div>
            <ul className="text-left max-w-lg mx-auto space-y-4 mb-10 handwritten-body text-xl">
              <li className="flex gap-3">✅ <strong>Lifetime access</strong> to all materials</li>
              <li className="flex gap-3">✅ Complete study materials for <strong>all subjects</strong></li>
              <li className="flex gap-3">✅ <strong>Progress tracking</strong> and analytics</li>
              <li className="flex gap-3">✅ <strong>24/7 access</strong> from any device</li>
              <li className="flex gap-3">✅ Regular <strong>content updates</strong></li>
              <li className="flex gap-3">✅ Secure, <strong>anti-piracy protected</strong> content</li>
            </ul>
            <button onClick={handleEnrollClick} className="btn-primary w-full md:w-auto text-2xl py-4 px-12 rounded-xl shadow-lg hover:scale-105 transition-transform">Get Started Now →</button>
          </div>
        </div>
      </section>

      {/* 9. FAQ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="handwritten-title text-6xl md:text-7xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
            <div className="section-divider"></div>
          </div>
          <div className="space-y-8">
            {[
              { q: 'How long do I have access to the materials?', a: 'You get lifetime access to all materials with a one-time payment. Study at your own pace without any time restrictions.' },
              { q: 'Can I access the content on multiple devices?', a: 'Yes, you can access your account from any device. However, for security reasons, only one active session is allowed at a time.' },
              { q: 'Is the content updated regularly?', a: 'Yes, we continuously update our content to reflect the latest GATE syllabus, exam patterns, and industry developments.' },
              { q: 'What makes this platform secure?', a: 'We use Internet Identity for authentication and implement multiple anti-piracy measures including watermarking, content protection, and secure delivery.' }
            ].map((faq, i) => (
              <div key={i} className="bg-white border-2 border-[#0f766e] p-8 rounded-xl hover:shadow-md transition-shadow">
                <h3 className="handwritten-title text-2xl font-bold mb-3 text-[#0d9488]">{faq.q}</h3>
                <p className="handwritten-body text-xl text-gray-700 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FINAL CTA */}
      <section className="bg-white py-28 px-6 border-t-4 border-[#0f766e]">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="handwritten-title text-6xl md:text-7xl font-bold text-gray-800 mb-8">Ready to Ace GATE 2026?</h2>
          <p className="handwritten-body text-3xl text-gray-700 mb-10">Get instant access to all 12 modules • 500+ pages of notes • 1000+ practice questions</p>
          
          <div className="price-tag rounded-lg mb-10 inline-block transform rotate-2 text-3xl px-10 py-4 shadow-lg">
            Only ₹1499
          </div>
          <p className="handwritten-body text-xl text-gray-600 mb-10">One-time payment • Lifetime online access • No hidden charges</p>
          
          <button onClick={handleEnrollClick} className="btn-primary handwritten-body text-3xl rounded-xl px-16 py-6 shadow-[8px_8px_0px_#065f46] hover:scale-105 transition-transform">
            Enroll Now & Start Learning
          </button>
          
          <div className="mt-10 flex flex-wrap justify-center gap-8 handwritten-body text-lg text-gray-500 font-bold">
            <span>✓ Secure payment</span>
            <span>✓ Instant access</span>
            <span>✓ 100% online viewing</span>
          </div>
        </div>
      </section>

    </div>
  );
}