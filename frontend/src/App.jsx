import React from 'react';
import { ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              CampusPulse AI
            </h1>
            <p className="text-sm text-slate-400">
              Smart Campus Incident Management & Operations Engine
            </p>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 my-6 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>React + Vite + Tailwind CSS Ready</span>
          </div>
          <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Connected to Django AI Triage Engine (http://127.0.0.1:8000)</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 text-center">
          Day 8 Setup Complete — Ready for Login & Incident Dashboard Modules
        </p>
      </div>
    </div>
  );
}

export default App;