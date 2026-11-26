import React, { useState } from 'react';
import {
  MapPin,
  Wrench,
  Clock,
  Sparkles,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Layers,
} from 'lucide-react';

const TicketCard = ({ ticket }) => {
  const [showChecklist, setShowChecklist] = useState(false);

  const urgencyStyles = {
    critical: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
    high: 'bg-orange-500/15 text-orange-300 border-orange-500/40',
    medium: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
    low: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  };

  const statusStyles = {
    reported: 'bg-slate-800 text-slate-300',
    assigned: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    in_progress: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
    resolved: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    closed: 'bg-slate-800 text-slate-400',
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition space-y-4">
      {/* Top Row: ID, Title, Badges */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-slate-500">#{ticket.id}</span>
            <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300">
              {ticket.category.replace('_', ' ')}
            </span>
            <span
              className={`text-xs uppercase font-semibold px-2 py-0.5 rounded-md border ${
                urgencyStyles[ticket.urgency] || urgencyStyles.medium
              }`}
            >
              {ticket.urgency}
            </span>
            {ticket.duplicate_count > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <Layers className="w-3 h-3" />
                +{ticket.duplicate_count} Duplicate Reports Merged
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-white mt-2">{ticket.title}</h3>
          <p className="text-sm text-slate-400 mt-1">{ticket.description}</p>
        </div>

        {/* Status Pill */}
        <span
          className={`self-start text-xs uppercase font-semibold px-3 py-1 rounded-full shrink-0 ${
            statusStyles[ticket.status] || statusStyles.reported
          }`}
        >
          {ticket.status.replace('_', ' ')}
        </span>
      </div>

      {/* Metadata Bar: Location, Technician, SLA */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="truncate">
            {ticket.building || 'Campus General'}
            {ticket.room_or_lab ? ` • ${ticket.room_or_lab}` : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="truncate">
            Tech:{' '}
            <strong className="text-slate-200">
              {ticket.assigned_to_name || 'Unassigned'}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="truncate">SLA: {formatDate(ticket.sla_deadline)}</span>
        </div>
      </div>

      {/* Expandable AI Checklist */}
      {ticket.ai_checklist && ticket.ai_checklist.length > 0 && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowChecklist(!showChecklist)}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              AI Technician Checklist ({ticket.ai_checklist.length} steps •{' '}
              {Math.round((ticket.ai_confidence || 0.8) * 100)}% confidence)
            </span>
            {showChecklist ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showChecklist && (
            <ul className="mt-3 space-y-2 bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
              {ticket.ai_checklist.map((step, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-xs text-slate-300"
                >
                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketCard;