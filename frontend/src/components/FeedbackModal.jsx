import React, { useState } from 'react';
import { Star, X, Send, AlertCircle } from 'lucide-react';
import { submitTicketFeedback } from '../api/ticketApi';

const FeedbackModal = ({ ticket, isOpen, onClose, onFeedbackSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await submitTicketFeedback(ticket.id, { rating, comment });
      setComment('');
      onFeedbackSubmitted();
      onClose();
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Could not submit feedback.';
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
          <div>
            <h3 className="text-base font-bold text-white">
              Rate Resolution Quality
            </h3>
            <p className="text-xs text-slate-400">
              Ticket #{ticket.id} • Resolved by {ticket.assigned_to_name || 'Technician'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Star Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Satisfaction Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-xl border transition cursor-pointer ${
                    rating >= star
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                      : 'bg-slate-950 border-slate-800 text-slate-600'
                  }`}
                >
                  <Star className="w-5 h-5 fill-current" />
                </button>
              ))}
              <span className="ml-2 text-xs text-slate-400 font-medium">
                {rating} / 5 Stars
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Comment (Optional)
            </label>
            <textarea
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Was the issue fixed properly? Share your feedback..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
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
              className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 flex items-center gap-2 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Submitting...' : 'Submit Feedback'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;