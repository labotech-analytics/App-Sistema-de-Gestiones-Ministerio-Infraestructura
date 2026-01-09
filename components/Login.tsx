
import React from 'react';

interface LoginProps {
  onLogin: (email: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-slate-200">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"/><path d="M13 13h4"/><path d="M13 17h4"/><path d="M7 13h2"/><path d="M7 17h2"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">InfraGestion BQ</h1>
          <p className="text-slate-500 mt-2">Gestión de Infraestructura Pública</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => onLogin('admin@gmail.com')}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 py-3 px-4 rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-slate-700 font-medium"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Acceder con Google
          </button>
          
          <div className="text-xs text-center text-slate-400 mt-6">
            Solo personal autorizado (@gmail.com whitelist).
            <br />Operando bajo Google Cloud Platform.
          </div>
        </div>
      </div>
    </div>
  );
};
