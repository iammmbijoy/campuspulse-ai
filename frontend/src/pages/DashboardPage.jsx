import React from 'react';
import { Sparkles, Wrench, ShieldCheck, PlusCircle, ClipboardList } from 'lucide-react';

const DashboardPage = ({ user }) => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">
            Welcome back, {user.username}!
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Logged in as <span className="text-indigo-400 font-semibold uppercase">{user.role}</span>
            {user.department ? ` • Department: ${user.department}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-3.5 py-2 rounded-xl">
          <Sparkles className="w-4 h-4" />
          <span>Multilingual AI Triage Active</span>
        </div>
      </div>

      {/* Role-Specific Workspace Preview */}
      {user.role === 'student' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
            <PlusCircle className="w-5 h-5" />
            <h3>Student / Reporter Portal</h3>
          </div>
          <p className="text-sm text-slate-400">
            Report campus facility issues in Bengali, English, or Banglish. Our AI engine will automatically classify urgency, extract building/lab info, and route a technician.
          </p>
        </div>
      )}

      {user.role === 'technician' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-amber-400 font-semibold mb-2">
            <Wrench className="w-5 h-5" />
            <h3>Technician Field Workspace</h3>
          </div>
          <p className="text-sm text-slate-400">
            Specialization: <span className="text-white font-medium">{user.specialization || 'General'}</span> • Active Assigned Tickets: <span className="text-white font-medium">{user.active_tickets_count}</span>
          </p>
        </div>
      )}

      {user.role === 'admin' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-rose-400 font-semibold mb-2">
            <ShieldCheck className="w-5 h-5" />
            <h3>Admin Command Center</h3>
          </div>
          <p className="text-sm text-slate-400">
            Monitor campus-wide incident SLAs, AI triage decisions, duplicate clusters, and technician workload distribution in real time.
          </p>
        </div>
      )}

      {/* Placeholder for Day 10 Incident Feed & Report Modal */}
      <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-8 text-center">
        <ClipboardList className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-sm text-slate-400">
          Day 9 Authentication & Role Routing Complete! Next (Day 10): Live Incident Reporting Form & Ticket Feed.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;