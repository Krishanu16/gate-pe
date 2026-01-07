import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { toast } from 'sonner';
import { 
  Clock, ChevronRight, Menu, X, Flag, Check, XCircle, 
  ArrowLeft, HelpCircle, AlertTriangle
} from 'lucide-react';

// --- STYLES ---
const Styles = () => (
  <style>{`
    .gate-palette-btn {
      width: 35px;
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      font-weight: bold;
      font-size: 14px;
      border: 1px solid #ccc;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    /* Live Test Colors */
    .gate-palette-btn.answered { background: #22c55e; color: white; border-color: #16a34a; clip-path: circle(50%); } 
    .gate-palette-btn.not-answered { background: #ef4444; color: white; border-color: #dc2626; clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%); }
    .gate-palette-btn.review { background: #a855f7; color: white; border-color: #9333ea; border-radius: 50%; } 
    .gate-palette-btn.ans-review { background: #6366f1; color: white; border-color: #4f46e5; position: relative; } 

    /* Solutions Mode Colors */
    .gate-palette-btn.sol-correct { background: #22c55e; color: white; border-color: #15803d; }
    .gate-palette-btn.sol-wrong { background: #ef4444; color: white; border-color: #b91c1c; }
    .gate-palette-btn.sol-skipped { background: #e5e7eb; color: #6b7280; border-color: #d1d5db; }
    
    .gate-option { transition: all 0.2s; }
    .gate-option:hover:not(.disabled) { background-color: #f0fdfa; }
    
    /* Selection States */
    .gate-option.selected { background-color: #e0f2fe; border-color: #3b82f6; }
    
    /* Solution States */
    .gate-option.correct-ans { background-color: #dcfce7; border-color: #22c55e; color: #14532d; }
    .gate-option.wrong-ans { background-color: #fee2e2; border-color: #ef4444; color: #7f1d1d; }
  `}</style>
);

export function TestPage() {
  const { testId } = useParams({ from: '/test/$testId' });
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- STATE ---
  const [test, setTest] = useState<any>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({}); 
  const [status, setStatus] = useState<Record<number, string>>({}); 
  const [timeLeft, setTimeLeft] = useState(0); 
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  
  // New State for Review Mode
  const [reviewMode, setReviewMode] = useState(false);

  // --- FETCH TEST ---
  useEffect(() => {
    const fetchTest = async () => {
      try {
        // Try fetching from Firebase first
        const docRef = doc(db, "testSeries", testId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
           const data = docSnap.data();
           setTest({ id: docSnap.id, ...data });
           setTimeLeft((data.time ? parseInt(data.time) : 180) * 60);
        } else {
           // Fallback Mock Data (For testing without DB)
           setTest({
             id: 'test-demo',
             title: 'GATE 2026 Demo Test',
             duration: 180,
             questions: Array.from({ length: 10 }).map((_, i) => ({
               id: i,
               text: `Sample Question ${i + 1}: Which of the following is a primary property of reservoir rock?`,
               options: ['Porosity', 'Color', 'Taste', 'Smell'],
               correct: 0,
               marks: 1,
               explanation: "Porosity is the measure of void spaces in a material."
             }))
           });
           setTimeLeft(180 * 60);
        }
      } catch (error) {
        console.error("Error fetching test:", error);
        toast.error("Failed to load test.");
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId]);

  // --- TIMER ---
  useEffect(() => {
    if (!test || isSubmitted || reviewMode) return; // Stop timer in review
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true); // Auto submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [test, isSubmitted, reviewMode]);

  // --- ACTIONS ---
  const handleOptionSelect = (optionIdx: number) => {
    if (reviewMode) return; // Disable interaction in review
    setAnswers(prev => ({ ...prev, [currentQIndex]: optionIdx }));
  };

  const handleSaveNext = () => {
    if (!reviewMode) {
      const newStatus = { ...status };
      if (answers[currentQIndex] !== undefined) {
        newStatus[currentQIndex] = 'answered';
      } else if (!newStatus[currentQIndex]) {
        newStatus[currentQIndex] = 'not-answered';
      }
      setStatus(newStatus);
    }
    if (currentQIndex < test.questions.length - 1) setCurrentQIndex(prev => prev + 1);
  };

  const handleMarkReview = () => {
    if (reviewMode) return;
    const newStatus = { ...status };
    newStatus[currentQIndex] = answers[currentQIndex] !== undefined ? 'ans-review' : 'review';
    setStatus(newStatus);
    if (currentQIndex < test.questions.length - 1) setCurrentQIndex(prev => prev + 1);
  };

  const clearResponse = () => {
    if (reviewMode) return;
    const newAns = { ...answers };
    delete newAns[currentQIndex];
    setAnswers(newAns);
    const newStatus = { ...status };
    newStatus[currentQIndex] = 'not-answered';
    setStatus(newStatus);
  };

  const handleSubmit = async (auto = false) => {
    if (!auto && !confirm("Are you sure you want to submit the test?")) return;
    
    setIsSubmitted(true);
    
    // Calculate Score
    let score = 0;
    test.questions.forEach((q: any, idx: number) => {
       if (answers[idx] === q.correct) score += (q.marks || 1);
       else if (answers[idx] !== undefined) score -= ((q.marks || 1) / 3);
    });

    // Save to Firebase
    if (user) {
       try {
         await updateDoc(doc(db, "users", user.uid), {
            testResults: arrayUnion({
               testId: test.id,
               title: test.title,
               score: score.toFixed(2),
               totalQ: test.questions.length,
               date: new Date().toISOString()
            })
         });
         toast.success("Test Submitted Successfully!");
       } catch (e) { console.error(e); }
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Test...</div>;

  // --- RESULT SUMMARY SCREEN ---
  if (isSubmitted && !reviewMode) {
     const totalQ = test.questions.length;
     const attempted = Object.keys(answers).length;
     const correct = test.questions.filter((q:any, i:number) => answers[i] === q.correct).length;
     const score = test.questions.reduce((acc:number, q:any, i:number) => 
        answers[i] === q.correct ? acc + (q.marks||1) : (answers[i] !== undefined ? acc - ((q.marks||1)/3) : acc)
     , 0);

     return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
           <div className="bg-white p-8 rounded-xl shadow-xl max-w-2xl w-full text-center border-t-4 border-[#0f766e]">
              <div className="text-6xl mb-4">📊</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Test Summary</h1>
              <p className="text-gray-500 mb-8">{test.title}</p>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                 <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{attempted} / {totalQ}</div>
                    <div className="text-xs text-blue-800 uppercase font-bold">Attempted</div>
                 </div>
                 <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{correct}</div>
                    <div className="text-xs text-green-800 uppercase font-bold">Correct</div>
                 </div>
                 <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{score.toFixed(2)}</div>
                    <div className="text-xs text-purple-800 uppercase font-bold">Total Score</div>
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <button 
                    onClick={() => { setReviewMode(true); setCurrentQIndex(0); setIsSubmitted(false); }} 
                    className="bg-white border-2 border-[#0f766e] text-[#0f766e] px-8 py-3 rounded-lg font-bold hover:bg-teal-50"
                 >
                    Review Solutions
                 </button>
                 <button 
                    onClick={() => navigate({ to: '/dashboard' })} 
                    className="bg-[#0f766e] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#0d9488]"
                 >
                    Back to Dashboard
                 </button>
              </div>
           </div>
        </div>
     );
  }

  // --- MAIN INTERFACE (Test & Review Mode) ---
  return (
    <div className="h-screen flex flex-col bg-gray-50 font-sans overflow-hidden select-none">
      <Styles />
      
      {/* 1. Header */}
      <header className={`h-16 border-b flex items-center justify-between px-4 shrink-0 shadow-sm z-20 ${reviewMode ? 'bg-teal-50 border-teal-200' : 'bg-white'}`}>
         <div className="flex items-center gap-3">
            {reviewMode && <button onClick={() => navigate({ to: '/dashboard' })} className="p-2 hover:bg-teal-100 rounded-full"><ArrowLeft size={20}/></button>}
            <div className="font-bold text-lg text-gray-800 truncate">
               {test.title} {reviewMode && <span className="text-teal-600 text-sm ml-2 bg-teal-100 px-2 py-1 rounded">SOLUTIONS MODE</span>}
            </div>
         </div>
         <div className="flex items-center gap-4">
            {!reviewMode && (
               <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded text-gray-700 font-mono font-bold">
                  <Clock size={18} className={timeLeft < 300 ? 'text-red-500 animate-pulse' : ''} />
                  {formatTime(timeLeft)}
               </div>
            )}
            <button 
               onClick={() => setIsPaletteOpen(!isPaletteOpen)}
               className="lg:hidden p-2 hover:bg-gray-100 rounded"
            >
               <Menu />
            </button>
         </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
         
         {/* Left: Question Area */}
         <main className="flex-1 flex flex-col h-full overflow-hidden relative">
            
            {/* Question Info Bar */}
            <div className="h-12 bg-white border-b flex items-center justify-between px-6 shrink-0">
               <div className="font-bold text-[#0f766e]">Question {currentQIndex + 1}</div>
               <div className="flex gap-4">
                  <div className="text-sm font-bold flex items-center gap-2">
                     <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">+{test.questions[currentQIndex].marks || 1}</span>
                     <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs">-{ ((test.questions[currentQIndex].marks || 1) / 3).toFixed(2) }</span>
                  </div>
                  {reviewMode && (
                     <div className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 ${
                        answers[currentQIndex] === test.questions[currentQIndex].correct 
                        ? 'bg-green-100 text-green-700' 
                        : (answers[currentQIndex] !== undefined ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600')
                     }`}>
                        {answers[currentQIndex] === test.questions[currentQIndex].correct 
                           ? <><Check size={12}/> Correct</> 
                           : (answers[currentQIndex] !== undefined ? <><XCircle size={12}/> Incorrect</> : 'Skipped')}
                     </div>
                  )}
               </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10">
               <div className="max-w-4xl mx-auto">
                  <p className="text-lg md:text-xl text-gray-800 font-serif leading-relaxed mb-8">
                     {test.questions[currentQIndex].text}
                  </p>

                  <div className="space-y-3">
                     {test.questions[currentQIndex].options.map((opt: string, idx: number) => {
                        const isSelected = answers[currentQIndex] === idx;
                        const isCorrect = test.questions[currentQIndex].correct === idx;
                        
                        let optionClass = 'border-gray-200';
                        if (reviewMode) {
                           if (isCorrect) optionClass = 'correct-ans'; // Always show correct answer
                           else if (isSelected) optionClass = 'wrong-ans'; // Highlight wrong selection
                           else optionClass = 'opacity-60'; // Dim others
                        } else {
                           if (isSelected) optionClass = 'selected';
                        }

                        return (
                           <div 
                              key={idx}
                              onClick={() => handleOptionSelect(idx)}
                              className={`gate-option p-4 border-2 rounded-lg cursor-pointer flex items-start gap-3 ${optionClass} ${reviewMode ? 'cursor-default' : ''}`}
                           >
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5
                                 ${isSelected ? 'border-blue-500' : 'border-gray-400'}
                                 ${reviewMode && isCorrect ? 'border-green-600 bg-green-600 text-white' : ''}
                                 ${reviewMode && isSelected && !isCorrect ? 'border-red-500 bg-red-500 text-white' : ''}
                              `}>
                                 {reviewMode && isCorrect ? <Check size={14} /> : (reviewMode && isSelected ? <X size={14}/> : (isSelected && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />))}
                              </div>
                              <span className="text-gray-700 font-medium">{opt}</span>
                           </div>
                        );
                     })}
                  </div>

                  {/* Explanation Box (Only in Review Mode) */}
                  {reviewMode && (
                     <div className="mt-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg animate-in fade-in slide-in-from-bottom-4">
                        <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2"><HelpCircle size={18}/> Explanation:</h4>
                        <p className="text-blue-900 leading-relaxed">
                           {test.questions[currentQIndex].explanation || "No explanation provided for this question."}
                        </p>
                     </div>
                  )}
               </div>
            </div>

            {/* Bottom Controls */}
            <div className="h-16 bg-white border-t flex items-center justify-between px-4 md:px-8 shrink-0">
               <div className="flex gap-2">
                  {!reviewMode && (
                     <>
                        <button onClick={handleMarkReview} className="flex items-center gap-2 px-4 py-2 border-2 border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 font-bold text-sm">
                           <Flag size={16}/> <span className="hidden md:inline">Mark for Review</span>
                        </button>
                        <button onClick={clearResponse} className="px-4 py-2 text-gray-500 hover:text-red-500 font-bold text-sm">Clear</button>
                     </>
                  )}
               </div>
               
               <div className="flex gap-2">
                  <button 
                     onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                     disabled={currentQIndex === 0}
                     className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg font-bold disabled:opacity-50"
                  >
                     Previous
                  </button>
                  <button 
                     onClick={handleSaveNext}
                     className="bg-[#0f766e] hover:bg-[#0d9488] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
                  >
                     {currentQIndex === test.questions.length - 1 ? (reviewMode ? 'Finish Review' : 'Submit') : 'Next'} <ChevronRight size={18} />
                  </button>
               </div>
            </div>
         </main>

         {/* Right: Question Palette */}
         <aside className={`
            fixed inset-y-0 right-0 w-80 bg-white border-l shadow-2xl transform transition-transform duration-300 z-30
            lg:relative lg:translate-x-0 lg:shadow-none
            ${isPaletteOpen ? 'translate-x-0' : 'translate-x-full'}
         `}>
            <div className="h-full flex flex-col">
               <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                  <h3 className="font-bold text-gray-700">Question Palette</h3>
                  <button onClick={() => setIsPaletteOpen(false)} className="lg:hidden"><X/></button>
               </div>

               {/* Legend Updates based on Mode */}
               <div className="p-4 grid grid-cols-2 gap-2 text-xs bg-gray-50 border-b">
                  {reviewMode ? (
                     <>
                        <div className="flex items-center gap-2"><span className="w-4 h-4 bg-green-500 rounded border"></span> Correct</div>
                        <div className="flex items-center gap-2"><span className="w-4 h-4 bg-red-500 rounded border"></span> Wrong</div>
                        <div className="flex items-center gap-2"><span className="w-4 h-4 bg-gray-200 rounded border"></span> Skipped</div>
                     </>
                  ) : (
                     <>
                        <div className="flex items-center gap-2"><span className="w-4 h-4 bg-green-500 rounded-sm clip-circle"></span> Answered</div>
                        <div className="flex items-center gap-2"><span className="w-4 h-4 bg-red-500 rounded-sm"></span> Not Ans</div>
                        <div className="flex items-center gap-2"><span className="w-4 h-4 bg-purple-500 rounded-full"></span> Review</div>
                     </>
                  )}
               </div>

               <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid grid-cols-5 gap-3">
                     {test.questions.map((q: any, idx: number) => {
                        let btnClass = '';
                        
                        if (reviewMode) {
                           if (answers[idx] === q.correct) btnClass = 'sol-correct';
                           else if (answers[idx] !== undefined) btnClass = 'sol-wrong';
                           else btnClass = 'sol-skipped';
                        } else {
                           const qStatus = status[idx];
                           if (qStatus === 'answered') btnClass = 'answered';
                           else if (qStatus === 'review') btnClass = 'review';
                           else if (qStatus === 'ans-review') btnClass = 'ans-review';
                           else if (qStatus === 'not-answered') btnClass = 'not-answered';
                        }

                        return (
                           <button 
                              key={idx}
                              onClick={() => { setCurrentQIndex(idx); setIsPaletteOpen(false); }}
                              className={`gate-palette-btn ${btnClass} ${currentQIndex === idx ? 'ring-2 ring-black' : ''}`}
                           >
                              {idx + 1}
                           </button>
                        );
                     })}
                  </div>
               </div>

               <div className="p-4 border-t bg-gray-50">
                  <button 
                     onClick={() => reviewMode ? navigate({ to: '/dashboard' }) : handleSubmit(false)}
                     className="w-full bg-teal-100 text-teal-800 border-2 border-teal-600 py-3 rounded-lg font-bold hover:bg-teal-200 transition-colors"
                  >
                     {reviewMode ? 'Exit Review' : 'Submit Test'}
                  </button>
               </div>
            </div>
         </aside>
      </div>
    </div>
  );
}