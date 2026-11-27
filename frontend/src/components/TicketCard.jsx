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
  Star,
  MessageSquareCheck,
  AlertTriangle,
  BrainCircuit,
} from 'lucide-react';

const TicketCard = ({ ticket, user, onOpenTechUpdate, onOpenFeedback }) => {
  const [showChecklist, setShowChecklist] = useState(false);
  const [showAiLog, setShowAiLog] = useState(false);

  const isOverdue =
    ticket.status !== 'resolved' &&
    ticket.status !== 'closed' &&
    ticket.sla_deadline &&
    new Date(ticket.sla_deadline) < new Date();

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

  const latestUpdate =
    ticket.updates && ticket.updates.length > 0
      ? ticket.updates[ticket.updates.length - 1]
      : null;

  const canTechUpdate =
    (user?.role === 'technician' || user?.role === 'admin') &&
    ticket.status !== 'resolved' &&
    ticket.status !== 'closed';

  const canGiveFeedback =
    user?.role === 'student' &&
    ticket.status === 'resolved' &&
    !ticket.feedback;

  return (
    <div
      className={`bg-slate-900 border rounded-2xl p-5 transition space-y-4 ${
        isOverdue
          ? 'border-rose-500/50 shadow-lg shadow-rose-950/20'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
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

            {isOverdue && (
              <span className="text-xs uppercase font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                SLA Breached • Escalated
              </span>
            )}

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

        {/* Right Side: Status Pill + Role Action Button */}
        <div className="flex sm:flex-col items-end gap-2 shrink-0">
          <span
            className={`text-xs uppercase font-semibold px-3 py-1 rounded-full ${
              statusStyles[ticket.status] || statusStyles.reported
            }`}
          >
            {ticket.status.replace('_', ' ')}
          </span>

          {canTechUpdate && (
            <button
              onClick={() => onOpenTechUpdate(ticket)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 transition cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Update Status</span>
            </button>
          )}

          {canGiveFeedback && (
            <button
              onClick={() => onOpenFeedback(ticket)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition cursor-pointer"
            >
              <Star className="w-3.5 h-3.5" />
              <span>Rate Fix</span>
            </button>
          )}
        </div>
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
          <Clock
            className={`w-4 h-4 shrink-0 ${
              isOverdue ? 'text-rose-400' : 'text-slate-400'
            }`}
          />
          <span
            className={`truncate ${
              isOverdue ? 'text-rose-300 font-medium' : ''
            }`}
          >
            SLA: {formatDate(ticket.sla_deadline)}
          </span>
        </div>
      </div>

      {/* Latest Activity / Resolution Note & Proof Photo */}
      {latestUpdate && (
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-start gap-2">
            <MessageSquareCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400">Latest log: </span>
              <span>{latestUpdate.note}</span>
            </div>
          </div>

          {latestUpdate.proof_image && (
            <a
              href={latestUpdate.proof_image}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:underline shrink-0 font-medium"
            >
              View Proof Photo →
            </a>
          )}
        </div>
      )}

      {/* Submitted Student Rating Display */}
      {ticket.feedback && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>
              Student Rating: <strong>{ticket.feedback.rating}/5</strong>
              {ticket.feedback.comment ? ` — "${ticket.feedback.comment}"` : ''}
            </span>
          </div>
        </div>
      )}

      {/* Expandable AI Checklist & Transparent AI Decision Log */}
      <div className="pt-1 flex flex-wrap items-center gap-4">
        {ticket.ai_checklist && ticket.ai_checklist.length > 0 && (
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
        )}

        {ticket.ai_log && (
          <button
            type="button"
            onClick={() => setShowAiLog(!showAiLog)}
            className="flex items-center gap-1.5 text-xs font-medium text-sky-400 hover:text-sky-300 transition cursor-pointer"
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Transparent AI Decision Log</span>
            {showAiLog ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      {/* AI Checklist Drawer */}
      {showChecklist && ticket.ai_checklist && (
        <ul className="space-y-2 bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
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

      {/* Transparent AI Decision Log Drawer */}
      {showAiLog && ticket.ai_log && (
        <div className="bg-sky-950/25 border border-sky-500/30 rounded-xl p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-sky-300 font-semibold">
            <span>AI Triage & Routing Audit Trail</span>
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-[11px]">
              Detected Language: {ticket.ai_log.detected_language}
            </span>
          </div>
          <p className="text-slate-300">
            <strong className="text-slate-400">Classification Reasoning:</strong>{' '}
            {ticket.ai_log.reasoning}
          </p>
          {ticket.ai_log.assigned_technician_reason && (
            <p className="text-slate-300">
              <strong className="text-slate-400">Routing Decision:</strong>{' '}
              {ticket.ai_log.assigned_technician_reason}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TicketCard;