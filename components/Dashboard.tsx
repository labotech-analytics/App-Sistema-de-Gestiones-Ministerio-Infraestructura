
import React from 'react';

export const Dashboard: React.FC = () => {
  return (
    <div className="w-full h-[calc(100vh-140px)] bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-blue-600 border border-blue-100 shadow-sm flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        Vista Operativa BI - Looker Studio
      </div>
      <iframe 
        width="100%" 
        height="100%" 
        src="https://lookerstudio.google.com/embed/reporting/fake-report-id/page/fake-page" 
        frameBorder="0" 
        style={{ border: 0 }} 
        allowFullScreen
      ></iframe>
      <div className="absolute bottom-4 right-4 text-[10px] text-slate-400 uppercase tracking-widest">
        powered by google cloud bigquery
      </div>
    </div>
  );
};
