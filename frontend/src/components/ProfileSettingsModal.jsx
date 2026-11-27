import React, { useState } from 'react';
import {
  X,
  Send,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  Power,
  ExternalLink,
  Users,
} from 'lucide-react';
import axiosClient from '../api/axiosClient';

const TELEGRAM_GROUP_INVITE_LINK = 'https://t.me/+k5Bc_ez-THY2YTg9';

const ProfileSettingsModal = ({ user, onClose, onUserUpdated }) => {
  const [department, setDepartment] = useState(user?.department || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isOnDuty, setIsOnDuty] = useState(Boolean(user?.is_on_duty));

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [togglingDuty, setTogglingDuty] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setFeedback(null);
    try {
      const res = await axiosClient.patch('/accounts/me/', {
        department: department.trim() || null,
        phone: phone.trim() || null,
      });
      if (onUserUpdated) onUserUpdated(res.data);
      setFeedback({
        type: 'success',
        text: 'Profile information updated successfully!',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to update profile.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleToggleDuty = async () => {
    setTogglingDuty(true);
    setFeedback(null);
    try {
      const res = await axiosClient.post('/accounts/toggle-duty/');
      setIsOnDuty(res.data.is_on_duty);
      if (onUserUpdated) {
        onUserUpdated({ ...user, is_on_duty: res.data.is_on_duty });
      }
      setFeedback({
        type: 'success',
        text: res.data.message,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.error || 'Could not update duty status.',
      });
    } finally {
      setTogglingDuty(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSavingPass(true);
    setFeedback(null);
    try {
      const res = await axiosClient.post('/accounts/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setOldPassword('');
      setNewPassword('');
      setFeedback({
        type: 'success',
        text: res.data.message || 'Password updated successfully!',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.error || 'Failed to change password.',
      });
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">
              Account & Profile Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Feedback Banner */}
          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* Technician-Only Telegram Operations Hub & Duty Controls */}
          {user?.role === 'technician' && (
            <>
              <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/30 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 shrink-0">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Technician Telegram Dispatch Hub
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Join the official CampusPulse Operations group to receive
                      instant real-time dispatch alerts, AI checklists, and SLA
                      escalation notices directly on your phone.
                    </p>
                  </div>
                </div>

                <a
                  href={TELEGRAM_GROUP_INVITE_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <Users className="w-4 h-4" />
                  <span>Join Technician Telegram Group</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Technician Duty Availability
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isOnDuty
                      ? 'On Duty — Eligible for AI auto-routing'
                      : 'Off Duty — Paused from new assignments'}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={togglingDuty}
                  onClick={handleToggleDuty}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    isOnDuty
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{isOnDuty ? 'On Duty' : 'Off Duty'}</span>
                </button>
              </div>
            </>
          )}

          {/* Profile Info Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g., CSE / IT Maintenance"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g., 017XXXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition cursor-pointer disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Details'}
            </button>
          </form>

          {/* Change Password Form */}
          <form
            onSubmit={handleChangePassword}
            className="space-y-4 pt-5 border-t border-slate-800"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <Lock className="w-3.5 h-3.5" />
              <span>Change Password</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  New Password (min 6 chars)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingPass}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition cursor-pointer disabled:opacity-50"
            >
              {savingPass ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsModal;