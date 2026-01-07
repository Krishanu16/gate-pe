import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface SecureViewerProps {
  fileName: string;
  userEmail: string;
  userId: string;
}

export const SecureViewer = ({ fileName, userEmail, userId }: SecureViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);

  // FIX: Added type definition for the callback
  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const watermarkText = `${userEmail} • ${userId.slice(0, 6)}`;

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-y-auto flex flex-col items-center" onContextMenu={(e) => e.preventDefault()}>
      <div className="sticky top-0 z-50 w-full bg-slate-800 text-white text-[10px] py-1 px-4 flex justify-between">
         <div className="flex items-center gap-2"><ShieldCheck className="h-3 w-3" /> SECURE</div>
         <div>ID: {userId.slice(0,8)}</div>
      </div>

      <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden flex flex-wrap content-center justify-center opacity-10">
          {Array.from({ length: 15 }).map((_, i) => (
             <div key={i} className="w-80 h-60 flex items-center justify-center -rotate-45 text-slate-100 text-sm font-black">
                {watermarkText}
             </div>
          ))}
      </div>

      <div className="w-full max-w-3xl py-8 relative z-10 px-4">
        <Document
          file={fileName}
          onLoadSuccess={onDocumentLoadSuccess} // FIX: Now uses the typed function
          loading={<div className="text-emerald-500 flex justify-center"><Loader2 className="animate-spin" /></div>}
          error={<div className="text-red-400 text-center"><AlertTriangle className="inline" /> File not found</div>}
        >
          {Array.from(new Array(numPages), (el, index) => (
            <div key={`page_${index + 1}`} className="mb-6 relative shadow-2xl">
               <div className="absolute inset-0 z-50 bg-transparent w-full h-full" />
               <Page pageNumber={index + 1} renderTextLayer={false} renderAnnotationLayer={false} className="border border-slate-700" width={window.innerWidth > 768 ? 750 : window.innerWidth - 40} />
            </div>
          ))}
        </Document>
      </div>
    </div>
  );
};