import React, { useMemo } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  Star,
  BarChart3,
  Users,
  Activity,
  AlertTriangle,
  Flame,
  Timer,
} from 'lucide-react';

const AdminAnalyticsPanel = ({ tickets }) => {
  const analytics = useMemo(() => {
    const now = new Date();
    const total = tickets.length;
    const resolvedList = tickets.filter(
      (t) => t.status === 'resolved' || t.status === 'closed'
    );
    const resolved = resolvedList.length;
    const active = total - resolved;
    const criticalCount = tickets.filter(
      (t) =>
        t.urgency === 'critical' &&
        t.status !== 'resolved' &&
        t.status !== 'closed'
    ).length;

    // Average Resolution Time Calculation
    const resolvedWithTime = resolvedList.filter(
      (t) => t.created_at && t.resolved_at
    );
    let avgResolutionText = 'N/A';
    if (resolvedWithTime.length > 0) {
      const totalMins = resolvedWithTime.reduce((sum, t) => {
        const diff =
          (new Date(t.resolved_at) - new Date(t.created_at)) / (1000 * 60);
        return sum + Math.max(1, diff);
      }, 0);
      const avgMins = Math.round(totalMins / resolvedWithTime.length);
      avgResolutionText =
        avgMins >= 60
          ? `${(avgMins / 60).toFixed(1)} hrs`
          : `${avgMins} mins`;
    }

    // Detect SLA Breached & Escalated tickets
    const breachedTickets = tickets
      .filter((t) => {
        if (t.status === 'resolved' || t.status === 'closed') return false;
        if (!t.sla_deadline) return false;
        return new Date(t.sla_deadline) < now;
      })
      .map((t) => {
        const diffMs = now - new Date(t.sla_deadline);
        const overdueHours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));
        return { ...t, overdueHours };
      });

    // Average student rating
    const ratedTickets = tickets.filter((t) => t.feedback && t.feedback.rating);
    const avgRating =
      ratedTickets.length > 0
        ? (
            ratedTickets.reduce((sum, t) => sum + t.feedback.rating, 0) /
            ratedTickets.length
          ).toFixed(1)
        : 'N/A';

    // Campus Building & Room Heatmap Aggregation
    const locationMap = {};
    tickets.forEach((t) => {
      const building = t.building || 'Campus General';
      const room = t.room_or_lab ? ` • ${t.room_or_lab}` : '';
      const key = `${building}${room}`;
      if (!locationMap[key]) {
        locationMap[key] = {
          location: key,
          building,
          total: 0,
          open: 0,
          critical: 0,
        };
      }
      locationMap[key].total += 1 + (t.duplicate_count || 0);
      if (t.status !== 'resolved' && t.status !== 'closed') {
        locationMap[key].open += 1;
      }
      if (t.urgency === 'critical' || t.urgency === 'high') {
        locationMap[key].critical += 1;
      }
    });
    const heatmapZones = Object.values(locationMap).sort(
      (a, b) => b.total - a.total
    );
    const maxZoneCount =
      heatmapZones.length > 0 ? Math.max(...heatmapZones.map((z) => z.total)) : 1;

    // Category distribution
    const categoryMap = {};
    tickets.forEach((t) => {
      const cat = t.category || 'general';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

    // Technician workload & SLA breach stats
    const techMap = {};
    tickets.forEach((t) => {
      const techName = t.assigned_to_name || 'Unassigned';
      if (!techMap[techName]) {
        techMap[techName] = {
          name: techName,
          active: 0,
          resolved: 0,
          breached: 0,
          total: 0,
        };
      }
      techMap[techName].total += 1;
      if (t.status === 'resolved' || t.status === 'closed') {
        techMap[techName].resolved += 1;
      } else {
        techMap[techName].active += 1;
        if (t.sla_deadline && new Date(t.sla_deadline) < now) {
          techMap[techName].breached += 1;
        }
      }
    });
    const technicians = Object.values(techMap).sort((a, b) => b.total - a.total);

    return {
      total,
      active,
      resolved,
      criticalCount,
      avgResolutionText,
      breachedTickets,
      avgRating,
      ratedCount: ratedTickets.length,
      heatmapZones,
      maxZoneCount,
      categories,
      technicians,
    };
  }, [tickets]);

  const getHeatmapStyle = (count, max) => {
    const ratio = count / max;
    if (ratio >= 0.75) {
      return 'bg-rose-500/20 border-rose-500/50 text-rose-200';
    }
    if (ratio >= 0.4) {
      return 'bg-amber-500/20 border-amber-500/40 text-amber-200';
    }
    return 'bg-indigo-500/15 border-indigo-500/30 text-indigo-200';
  };

  return (
    <div className="space-y-5">
      {/* Command Center Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-rose-400 uppercase tracking-wider">
          <Activity className="w-4 h-4" />
          <span>Admin Operations Command Center</span>
        </div>
        <span className="text-xs text-slate-500">
          Real-time campus telemetry, heatmap & SLA monitor
        </span>
      </div>

      {/* SLA Breach & Escalation Report Panel */}
      {analytics.breachedTickets.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
              <span>
                SLA Escalation Report ({analytics.breachedTickets.length}{' '}
                Overdue{' '}
                {analytics.breachedTickets.length === 1 ? 'Ticket' : 'Tickets'})
              </span>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
              Immediate Admin Attention Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {analytics.breachedTickets.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-xl bg-slate-950/80 border border-rose-500/30 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">
                    #{t.id} • {t.title}
                  </p>
                  <p className="text-slate-400 mt-0.5 truncate">
                    Assigned Tech:{' '}
                    <strong className="text-rose-300">
                      {t.assigned_to_name || 'Unassigned'}
                    </strong>{' '}
                    - {t.building || 'Campus'}
                  </p>
                </div>

                <span className="shrink-0 px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold">
                  {t.overdueHours}h Overdue
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
            {analytics.breachedTickets.length} breached •{' '}
            {analytics.criticalCount} critical
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
            <span>Avg Resolution Time</span>
            <Timer className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-sky-400 mt-2">
            {analytics.avgResolutionText}
          </p>
          <p className="text-xs text-slate-500 mt-1">Mean turnaround speed</p>
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

      {/* Campus Issue Heatmap (By Building & Room/Floor) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Flame className="w-4 h-4 text-rose-400" />
            <span>Campus Issue Density Heatmap (Building & Room/Floor)</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" /> High
              Hotspot
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />{' '}
              Moderate
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500/60" /> Low
            </span>
          </div>
        </div>

        {analytics.heatmapZones.length === 0 ? (
          <p className="text-xs text-slate-500">No location telemetry yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {analytics.heatmapZones.map((zone) => (
              <div
                key={zone.location}
                className={`p-3.5 rounded-xl border transition ${getHeatmapStyle(
                  zone.total,
                  analytics.maxZoneCount
                )}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-xs truncate">{zone.location}</p>
                  <span className="px-2 py-0.5 rounded-md bg-slate-950/60 text-xs font-extrabold shrink-0">
                    {zone.total} {zone.total === 1 ? 'Issue' : 'Issues'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-[11px] opacity-85">
                  <span>Open: {zone.open}</span>
                  <span>•</span>
                  <span>High/Critical: {zone.critical}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom 2-Column Breakdown: Category & Technician Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            <span>Incidents by AI Category</span>
          </div>

          {analytics.categories.length === 0 ? (
            <p className="text-xs text-slate-500">
              No incident categories recorded yet.
            </p>
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

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Technician Workload & SLA Compliance</span>
          </div>

          {analytics.technicians.length === 0 ? (
            <p className="text-xs text-slate-500">
              No technician assignments yet.
            </p>
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

                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {tech.breached > 0 && (
                      <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold">
                        {tech.breached} Overdue
                      </span>
                    )}
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