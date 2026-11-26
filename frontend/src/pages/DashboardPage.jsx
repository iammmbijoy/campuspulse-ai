import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  PlusCircle,
  RefreshCw,
  ClipboardList,
  Filter,
} from 'lucide-react';
import { fetchTickets } from '../api/ticketApi';
import ReportIncidentModal from '../components/ReportIncidentModal';
import TicketCard from '../components/TicketCard';

const DashboardPage = ({ user }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await fetchTickets();
      setTickets(data);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // Add newly created ticket (or update merged parent ticket) at top of feed
  const handleTicketCreated = (createdTicket) => {
    setTickets((prev) => {
      const exists = prev.some((t) => t.id === createdTicket.id);
      if (exists) {
        return prev.map((t) => (t.id === createdTicket.id ? createdTicket : t));
      }
      return [createdTicket, ...prev];
    });
  };

  const filteredTickets =
    statusFilter === 'all'
      ? tickets
      : tickets.filter((t) => t.status === statusFilter);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Top Action Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">
            Welcome back, {user.username}!
          </h2>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Multilingual AI Incident Triage & Autonomous Routing</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadTickets}
            title="Refresh Feed"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Incident</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <ClipboardList className="w-4 h-4 text-indigo-400" />
          <span>Live Incident Feed ({filteredTickets.length})</span>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          {['all', 'assigned', 'in_progress', 'resolved'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition cursor-pointer ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket Feed List */}
      {loading ? (
        <div className="text-center py-12 text-sm text-slate-400">
          Loading campus incident tickets...
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-10 text-center">
          <p className="text-sm text-slate-400">
            No incident tickets found in this view. Click{' '}
            <strong className="text-indigo-400">Report Incident</strong> to test AI triage!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}

      {/* Report Incident Modal */}
      <ReportIncidentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTicketCreated={handleTicketCreated}
      />
    </div>
  );
};

export default DashboardPage;