import React, { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { storage } from '../lib/firebase'; // Ensure you created this file in Phase 2
import { ref, getDownloadURL } from 'firebase/storage';
import { Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';

// 1. Worker Setup (Critical for performance)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface SecureCanvasProps {
  fileName: string;
  userEmail: string;
  userId: string;
}

export const SecureCanvas = ({ fileName, userEmail, userId }: SecureCanvasProps) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Security: Dynamic Watermark Text
  const watermarkText = `${userEmail} • ${userId.slice(0, 6)} • IP LOGGED`;

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        setLoading(true);
        const fileRef = ref(storage, fileName);
        const url = await getDownloadURL(fileRef);
        setFileUrl(url);
      } catch (err) {
        console.error(err);
        setError("Secure Content Load Failed. Contact Support.");
      } finally {
        setLoading(false);
      }
    };
    if (fileName) fetchUrl();
  }, [fileName]);

  // 3. Security: Prevent Right Click
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    alert("Security Alert: Content is protected.");
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 text-blue-600">
      <Loader2 className="h-10 w-10 animate-spin mb-4" />
      <p className="font-mono text-sm">DECRYPTING SECURE STREAM...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-96 text-red-500">
      <AlertTriangle className="h-12 w-12 mb-4" />
      <p>{error}</p>
    </div>
  );

  return (
    <div 
      className="relative w-full bg-slate-900 min-h-screen flex flex-col items-center select-none"
      onContextMenu={handleContextMenu}
    >
      {/* --- STICKY SECURITY HEADER --- */}
      <div className="sticky top-0 z-50 w-full bg-slate-800 text-white text-xs py-2 px-4 flex justify-between items-center shadow-md border-b border-slate-700">
         <div className="flex items-center gap-2 text-green-400">
            <ShieldCheck className="h-4 w-4" />
            <span className="font-mono tracking-wider">SECURE CONNECTION: ENCRYPTED</span>
         </div>
         <div className="font-mono text-slate-400">SESSION ID: {userId.slice(0,8)}</div>
      </div>

      {/* --- WATERMARK OVERLAY (Fixed position, repeats) --- */}
      <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden flex flex-wrap content-center justify-center opacity-15">
          {Array.from({ length: 12 }).map((_, i) => (
             <div key={i} className="w-96 h-64 flex items-center justify-center transform -rotate-45 text-slate-100 text-lg font-black whitespace-nowrap">
                {watermarkText}
             </div>
          ))}
      </div>

      {/* --- PDF DOCUMENT (Rendered as Canvas) --- */}
      <div className="w-full max-w-4xl py-8 relative z-10">
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<div className="text-white text-center mt-10">Loading Pages...</div>}
        >
          {Array.from(new Array(numPages), (el, index) => (
            <div key={`page_${index + 1}`} className="mb-8 relative shadow-2xl mx-4">
               {/* INVISIBLE INTERCEPTOR LAYER (Blocks Drag & Drop / Save As) */}
               <div className="absolute inset-0 z-50 bg-transparent w-full h-full" />
               
               <Page 
                 pageNumber={index + 1} 
                 renderTextLayer={false} 
                 renderAnnotationLayer={false}
                 className="border-2 border-slate-700 rounded-sm"
                 width={window.innerWidth > 800 ? 800 : window.innerWidth - 40} // Responsive Width
               />
               
               {/* Page Number */}
               <div className="absolute bottom-2 right-2 text-[10px] text-slate-400 font-mono bg-slate-900/50 px-2 rounded">
                 {index + 1} / {numPages}
               </div>
            </div>
          ))}
        </Document>
      </div>
    </div>
  );
};