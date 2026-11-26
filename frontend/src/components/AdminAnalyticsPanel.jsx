import React, { useMemo } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  Star,
  BarChart3,
  Users,
  Activity,
} from 'lucide-react';

const AdminAnalyticsPanel = ({ tickets }) => {
  const analytics = useMemo(() => {
    const total = tickets.length;
    const resolved = tickets.filter(
      (t) => t.status === 'resolved' || t.status === 'closed'
    ).length;
    const active = total - resolved;
    const criticalCount = tickets.filter(
      (t) => t.urgency === 'critical' && t.status !== 'resolved'
    ).length;

    // Average student rating
    const ratedTickets = tickets.filter((t) => t.feedback && t.feedback.rating);
    const avgRating =
      ratedTickets.length > 0
        ? (
            ratedTickets.reduce((sum, t) => sum + t.feedback.rating, 0) /
            ratedTickets.length
          ).toFixed(1)
        : 'N/A';

    // Category distribution
    const categoryMap = {};
    tickets.forEach((t) => {
      const cat = t.category || 'general';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

    // Technician workload & resolved stats
    const techMap = {};
    tickets.forEach((t) => {
      const techName = t.assigned_to_name || 'Unassigned';
      if (!techMap[techName]) {
        techMap[techName] = { name: techName, active: 0, resolved: 0, total: 0 };
      }
      techMap[techName].total += 1;
      if (t.status === 'resolved' || t.status === 'closed') {
        techMap[techName].resolved += 1;
      } else {
        techMap[techName].active += 1;
      }
    });
    const technicians = Object.values(techMap).sort((a, b) => b.total - a.total);

    return {
      total,
      active,
      resolved,
      criticalCount,
      avgRating,
      ratedCount: ratedTickets.length,
      categories,
      technicians,
    };
  }, [tickets]);

  return (
    <div className="space-y-5">
      {/* Command Center Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-rose-400 uppercase tracking-wider">
          <Activity className="w-4 h-4" />
          <span>Admin Operations Command Center</span>
        </div>
        <span className="text-xs text-slate-500">
          Real-time campus telemetry
        </span>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Incidents</span>
            <BarChart3 className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{analytics.total}</p>
          <p className="text-xs text-slate-500 mt-1">All logged campus tickets</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active / Open</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-2">
            {analytics.active}
          </p>
          <p className="text-xs text-rose-400 mt-1">
            {analytics.criticalCount} critical pending
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Resolved Tickets</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">
            {analytics.resolved}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {analytics.total > 0
              ? `${Math.round((analytics.resolved / analytics.total) * 100)}% resolution rate`
              : 'No data yet'}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Student Satisfaction</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            {analytics.avgRating}
            {analytics.avgRating !== 'N/A' && (
              <span className="text-sm font-normal text-slate-400"> / 5.0</span>
            )}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Based on {analytics.ratedCount} student reviews
          </p>
        </div>
      </div>

      {/* Bottom 2-Column Breakdown: Category & Technician Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Incident Category Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            <span>Incidents by AI Category</span>
          </div>

          {analytics.categories.length === 0 ? (
            <p className="text-xs text-slate-500">No incident categories recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {analytics.categories.map(([cat, count]) => {
                const percent = Math.round((count / analytics.total) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="uppercase font-medium text-slate-300">
                        {cat.replace('_', ' ')}
                      </span>
                      <span className="text-slate-400">
                        {count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Technician Workload Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Technician Workload & Resolution</span>
          </div>

          {analytics.technicians.length === 0 ? (
            <p className="text-xs text-slate-500">No technician assignments yet.</p>
          ) : (
            <div className="space-y-2.5">
              {analytics.technicians.map((tech) => (
                <div
                  key={tech.name}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-200">{tech.name}</p>
                    <p className="text-slate-500 mt-0.5">
                      Total Assigned: {tech.total}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
                      {tech.active} Active
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                      {tech.resolved} Done
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPanel;