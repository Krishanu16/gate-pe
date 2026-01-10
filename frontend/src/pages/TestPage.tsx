import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { toast } from 'sonner';
import { 
  Clock, ChevronRight, Menu, X, Flag, Check, XCircle, 
  ArrowLeft, HelpCircle, Calculator, Maximize, ZoomIn, ZoomOut
} from 'lucide-react';
import { Logo } from '../components/Logo';

// --- STYLES ---
const Styles = () => (
  <style>{`
    /* TCS iON Palette Shapes */
    .gate-palette-btn {
      width: 40px;
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      background-repeat: no-repeat;
      background-position: center;
      border: 1px solid #ccc;
      background-color: #f3f4f6;
      color: black;
      border-radius: 4px; /* Default for Not Visited */
    }
    
    /* 1. Answered (Green Polygon) */
    .gate-palette-btn.answered { 
        background-color: #22c55e; 
        color: white; 
        clip-path: polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%);
        border: none;
        border-radius: 0;
        padding-bottom: 5px;
    } 

    /* 2. Not Answered (Red Polygon) */
    .gate-palette-btn.not-answered { 
        background-color: #ef4444; 
        color: white; 
        clip-path: polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%);
        border: none;
        border-radius: 0;
        padding-bottom: 5px;
    }

    /* 3. Marked for Review (Purple Circle) */
    .gate-palette-btn.review { 
        background-color: #a855f7; 
        color: white; 
        border-radius: 50%; 
        border: none;
    } 

    /* 4. Answered & Marked (Purple Circle with Green Tick) */
    .gate-palette-btn.ans-review { 
        background-color: #6366f1; 
        color: white; 
        border-radius: 50%;
        border: none;
        position: relative;
    }
    .gate-palette-btn.ans-review::after {
        content: '✔';
        position: absolute;
        bottom: 0px;
        right: 0px;
        font-size: 10px;
        background: #22c55e;
        color: white;
        border-radius: 50%;
        width: 14px;
        height: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* Solutions Mode Colors */
    .gate-palette-btn.sol-correct { background: #22c55e; color: white; border-color: #15803d; }
    .gate-palette-btn.sol-wrong { background: #ef4444; color: white; border-color: #b91c1c; }
    .gate-palette-btn.sol-skipped { background: #e5e7eb; color: #6b7280; border-color: #d1d5db; }
    
    .gate-option { transition: all 0.2s; }
    .gate-option:hover:not(.disabled) { background-color: #f0fdfa; }
    .gate-option.selected { background-color: #e0f2fe; border-color: #3b82f6; }
    .gate-option.correct-ans { background-color: #dcfce7; border-color: #22c55e; color: #14532d; }
    .gate-option.wrong-ans { background-color: #fee2e2; border-color: #ef4444; color: #7f1d1d; }
  `}</style>
);

export function TestPage() {
  const { testId } = useParams({ from: '/test/$testId' });
  const navigate = useNavigate();
  const { user } = useAuth();
  const screenRef = useRef<HTMLDivElement>(null);

  // --- STATE ---
  const [test, setTest] = useState<any>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({}); 
  const [status, setStatus] = useState<Record<number, string>>({}); 
  const [timeLeft, setTimeLeft] = useState(0); 
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showCalculator, setShowCalculator] = useState(false);

  // --- FETCH TEST ---
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const docRef = doc(db, "testSeries", testId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
           const data = docSnap.data();
           setTest({ id: docSnap.id, ...data });
           setTimeLeft((data.time ? parseInt(data.time) : 180) * 60);
        } else {
           // Fallback Mock
           setTest({
             id: 'test-demo',
             title: 'GATE 2026 Demo Test',
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
    if (!test || isSubmitted || reviewMode) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [test, isSubmitted, reviewMode]);

  // --- ACTIONS ---
  const handleOptionSelect = (optionIdx: number) => {
    if (reviewMode) return;
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
    
    let score = 0;
    test.questions.forEach((q: any, idx: number) => {
       if (answers[idx] === q.correct) score += (q.marks || 1);
       else if (answers[idx] !== undefined) score -= ((q.marks || 1) / 3);
    });

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

  const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
          screenRef.current?.requestFullscreen();
      } else {
          document.exitFullscreen();
      }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-teal-600">Loading Exam Interface...</div>;

  // --- RESULT SUMMARY ---
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
                 <button onClick={() => { setReviewMode(true); setCurrentQIndex(0); setIsSubmitted(false); }} className="bg-white border-2 border-[#0f766e] text-[#0f766e] px-8 py-3 rounded-lg font-bold hover:bg-teal-50">Review Solutions</button>
                 <button onClick={() => navigate({ to: '/dashboard' })} className="bg-[#0f766e] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#0d9488]">Back to Dashboard</button>
              </div>
           </div>
        </div>
      );
  }

  // --- MAIN TEST INTERFACE ---
  return (
    <div ref={screenRef} className="h-screen flex flex-col bg-gray-50 font-sans overflow-hidden select-none">
      <Styles />
      
      {/* HEADER */}
      <header className={`h-14 border-b flex items-center justify-between px-4 shrink-0 shadow-sm z-20 ${reviewMode ? 'bg-teal-50 border-teal-200' : 'bg-blue-600 text-white border-blue-700'}`}>
         <div className="flex items-center gap-3">
            {reviewMode && <button onClick={() => navigate({ to: '/dashboard' })} className="p-1 hover:bg-teal-200 rounded-full text-teal-800"><ArrowLeft size={20}/></button>}
            <Logo className={reviewMode ? "" : "text-white"} />
            <div className={`font-bold text-sm md:text-lg truncate ${reviewMode ? 'text-gray-800' : 'text-white'}`}>
               {test.title}
            </div>
         </div>
         <div className="flex items-center gap-4">
            {!reviewMode && (
               <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded text-white font-mono font-bold">
                  <Clock size={18} />
                  {formatTime(timeLeft)}
               </div>
            )}
            <button onClick={toggleFullscreen} className={`p-2 rounded hover:bg-white/10 ${reviewMode ? 'text-gray-600' : 'text-white'}`} title="Fullscreen">
                <Maximize size={20} />
            </button>
            <button onClick={() => setIsPaletteOpen(!isPaletteOpen)} className={`lg:hidden p-2 rounded hover:bg-white/10 ${reviewMode ? 'text-gray-600' : 'text-white'}`}>
               <Menu size={20}/>
            </button>
         </div>
      </header>

      {/* TOOLBAR (Calculator, Zoom) */}
      <div className="bg-gray-200 p-2 flex justify-between items-center px-4 border-b border-gray-300">
          <div className="flex gap-2">
              <button onClick={() => setShowCalculator(!showCalculator)} className="flex items-center gap-1 bg-white border border-gray-400 px-3 py-1 rounded text-xs font-bold hover:bg-gray-100">
                  <Calculator size={14}/> Calculator
              </button>
              <div className="flex items-center gap-1 bg-white border border-gray-400 px-2 py-1 rounded">
                  <button onClick={() => setZoomLevel(z => Math.min(z + 0.1, 1.5))} className="p-1 hover:bg-gray-100"><ZoomIn size={14}/></button>
                  <span className="text-xs font-bold w-8 text-center">{Math.round(zoomLevel * 100)}%</span>
                  <button onClick={() => setZoomLevel(z => Math.max(z - 0.1, 0.8))} className="p-1 hover:bg-gray-100"><ZoomOut size={14}/></button>
              </div>
          </div>
          <div className="text-xs font-bold text-gray-600">Question {currentQIndex + 1} of {test.questions.length}</div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
         
         {/* CALCULATOR POPUP */}
         {showCalculator && (
             <div className="absolute top-10 left-10 w-64 bg-gray-800 p-4 rounded-xl shadow-2xl z-50 border border-gray-600">
                 <div className="flex justify-between text-white mb-2">
                     <span className="font-bold text-xs">Scientific Calc</span>
                     <button onClick={() => setShowCalculator(false)}><X size={14}/></button>
                 </div>
                 <div className="bg-white h-10 mb-2 rounded text-right p-2 font-mono">0</div>
                 <div className="grid grid-cols-4 gap-2">
                     {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'].map(k => (
                         <button key={k} className="bg-gray-600 text-white rounded p-2 text-sm hover:bg-gray-500">{k}</button>
                     ))}
                 </div>
             </div>
         )}

         {/* LEFT: QUESTION AREA */}
         <main className="flex-1 flex flex-col h-full overflow-hidden bg-white" style={{ zoom: zoomLevel }}>
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
               <div className="max-w-5xl mx-auto">
                  <div className="border-b pb-4 mb-4 flex justify-between items-start">
                      <div className="text-lg font-medium text-gray-900 leading-relaxed whitespace-pre-wrap">{test.questions[currentQIndex].text}</div>
                      <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded ml-4 shrink-0">Marks: {test.questions[currentQIndex].marks || 1}</div>
                  </div>

                  <div className="space-y-3">
                     {test.questions[currentQIndex].options.map((opt: string, idx: number) => {
                        const isSelected = answers[currentQIndex] === idx;
                        const isCorrect = test.questions[currentQIndex].correct === idx;
                        let optionClass = 'hover:bg-blue-50 border-gray-300';
                        
                        if (reviewMode) {
                           if (isCorrect) optionClass = 'bg-green-100 border-green-500 text-green-900';
                           else if (isSelected) optionClass = 'bg-red-100 border-red-500 text-red-900';
                        } else if (isSelected) {
                           optionClass = 'bg-blue-100 border-blue-500 font-bold';
                        }

                        return (
                           <div key={idx} onClick={() => handleOptionSelect(idx)} className={`p-3 border rounded cursor-pointer flex items-center gap-3 transition-colors ${optionClass}`}>
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center bg-white ${isSelected ? 'border-blue-600' : 'border-gray-400'}`}>
                                  {isSelected && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                              </div>
                              <span className="text-sm md:text-base">{opt}</span>
                           </div>
                        );
                     })}
                  </div>

                  {reviewMode && (
                      <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-sm text-yellow-900">
                          <strong>Explanation:</strong> {test.questions[currentQIndex].explanation || "No explanation available."}
                      </div>
                  )}
               </div>
            </div>

            {/* BOTTOM BAR */}
            <div className="h-14 border-t flex items-center justify-between px-6 bg-gray-50 shrink-0">
                <div className="flex gap-2">
                    {!reviewMode && (
                        <>
                            <button onClick={handleMarkReview} className="px-4 py-1.5 border border-purple-400 text-purple-700 rounded hover:bg-purple-50 text-sm font-bold">Mark for Review</button>
                            <button onClick={clearResponse} className="px-4 py-1.5 border border-gray-300 text-gray-600 rounded hover:bg-gray-100 text-sm font-bold">Clear Response</button>
                        </>
                    )}
                </div>
                <button onClick={handleSaveNext} className="bg-[#0f766e] text-white px-6 py-2 rounded font-bold hover:bg-[#0d9488] flex items-center gap-2">
                    {currentQIndex === test.questions.length - 1 ? (reviewMode ? 'Back to Dashboard' : 'Save & Submit') : 'Save & Next'}
                </button>
            </div>
         </main>

         {/* RIGHT: PALETTE */}
         <aside className={`fixed inset-y-0 right-0 w-72 bg-blue-50 border-l shadow-xl transform transition-transform duration-300 z-30 lg:relative lg:translate-x-0 ${isPaletteOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="h-full flex flex-col">
               <div className="p-2 bg-blue-100 border-b flex justify-between items-center">
                   <div className="flex items-center gap-2">
                       <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center font-bold text-blue-800">{user?.displayName?.charAt(0)}</div>
                       <div className="text-xs font-bold text-blue-900 truncate w-32">{user?.displayName}</div>
                   </div>
                   <button onClick={() => setIsPaletteOpen(false)} className="lg:hidden"><X size={18}/></button>
               </div>

               <div className="p-3 grid grid-cols-2 gap-2 text-[10px] font-bold text-gray-600 border-b bg-white">
                   {reviewMode ? (
                       <>
                           <div className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-sm"></span> Correct</div>
                           <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-sm"></span> Wrong</div>
                       </>
                   ) : (
                       <>
                           <div className="flex items-center gap-1"><div className="gate-palette-btn answered scale-50"></div> Answered</div>
                           <div className="flex items-center gap-1"><div className="gate-palette-btn not-answered scale-50"></div> Not Ans</div>
                           <div className="flex items-center gap-1"><div className="gate-palette-btn review scale-50"></div> Review</div>
                           <div className="flex items-center gap-1"><div className="gate-palette-btn ans-review scale-50"></div> Ans+Rev</div>
                       </>
                   )}
               </div>

               <div className="flex-1 overflow-y-auto p-3">
                   <div className="grid grid-cols-4 gap-2">
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
                               <button key={idx} onClick={() => { setCurrentQIndex(idx); setIsPaletteOpen(false); }} className={`gate-palette-btn ${btnClass} ${currentQIndex === idx ? 'ring-2 ring-black' : ''}`}>
                                   {idx + 1}
                               </button>
                           );
                       })}
                   </div>
               </div>

               <div className="p-4 bg-white border-t">
                   <button onClick={() => reviewMode ? navigate({ to: '/dashboard' }) : handleSubmit(false)} className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 text-sm">
                       {reviewMode ? 'Exit' : 'Submit Test'}
                   </button>
               </div>
            </div>
         </aside>
      </div>
    </div>
  );
}