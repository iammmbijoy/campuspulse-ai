import React, { useState } from 'react';
import { Wrench, CheckCircle2, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { updateTicketStatus } from '../api/ticketApi';

const TechUpdateModal = ({ ticket, isOpen, onClose, onStatusUpdated }) => {
  const [status, setStatus] = useState(
    ticket?.status === 'assigned' ? 'in_progress' : 'resolved'
  );
  const [note, setNote] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateTicketStatus(ticket.id, {
        status,
        note,
        proofImage,
      });
      setNote('');
      setProofImage(null);
      onStatusUpdated();
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Failed to update ticket status.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Update Ticket #{ticket.id}
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-[240px]">
                {ticket.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              New Work Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="in_progress">In Progress (Started Inspection/Repair)</option>
              <option value="resolved">Resolved (Work Completed)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Technician Work Note *
            </label>
            <textarea
              rows="3"
              required
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Replaced faulty power adapter and tested connection."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Proof-of-Work Photo {status === 'resolved' ? '(Recommended)' : '(Optional)'}
            </label>
            <label className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-dashed border-slate-700 hover:border-amber-500/60 text-xs text-slate-400 cursor-pointer transition">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span className="truncate">
                {proofImage ? proofImage.name : 'Upload repair completion photo'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProofImage(e.target.files[0] || null)}
                className="hidden"
              />
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 flex items-center gap-2 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Saving Update...' : 'Save Update'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TechUpdateModal;