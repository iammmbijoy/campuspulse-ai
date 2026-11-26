import React, { useState } from 'react';
import { Sparkles, Send, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { createTicket } from '../api/ticketApi';

const ReportIncidentModal = ({ isOpen, onClose, onTicketCreated }) => {
  const [description, setDescription] = useState('');
  const [building, setBuilding] = useState('');
  const [roomOrLab, setRoomOrLab] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    setError('');

    try {
      const newTicket = await createTicket({
        description,
        building,
        room_or_lab: roomOrLab,
        imageFile,
      });

      // Reset form & notify parent dashboard
      setDescription('');
      setBuilding('');
      setRoomOrLab('');
      setImageFile(null);
      onTicketCreated(newTicket);
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        JSON.stringify(err.response?.data) ||
        'Failed to submit incident report. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Report Campus Incident</h3>
              <p className="text-xs text-slate-400">
                Write in Bengali, English, or Banglish — AI handles triage & routing
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

        {/* Error Message */}
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
              Describe the Problem *
            </label>
            <textarea
              rows="4"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="উদাহরণ: Academic Building 2 এর Lab 304 এ প্রজেক্টর ও রাউটার কাজ করছে না..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Optional Location Hints */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Building (Optional)
              </label>
              <input
                type="text"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder="e.g. Academic Building 2"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Room / Lab (Optional)
              </label>
              <input
                type="text"
                value={roomOrLab}
                onChange={(e) => setRoomOrLab(e.target.value)}
                placeholder="e.g. Lab 304"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Optional Photo Upload */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Attach Photo Evidence (Optional)
            </label>
            <label className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-dashed border-slate-700 hover:border-indigo-500/60 text-xs text-slate-400 cursor-pointer transition">
              <ImageIcon className="w-4 h-4 text-indigo-400" />
              <span className="truncate">
                {imageFile ? imageFile.name : 'Click to upload an image (JPG, PNG)'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0] || null)}
                className="hidden"
              />
            </label>
          </div>

          {/* Actions */}
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
              className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-2 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Analyzing with AI...' : 'Submit Incident'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportIncidentModal;