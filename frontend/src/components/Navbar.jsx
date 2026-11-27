import React, { useState, useEffect } from 'react';
import { ShieldAlert, LogOut, UserCheck, Settings } from 'lucide-react';
import ProfileSettingsModal from './ProfileSettingsModal';

const Navbar = ({ user, onLogout }) => {
  const [currentUser, setCurrentUser] = useState(user);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'technician':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <>
      <nav className="bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">
                CampusPulse AI
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-400">
                Operations Engine
              </span>
            </div>
          </div>

          {/* User Info, Settings & Logout */}
          {currentUser && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                title="Account & Telegram Settings"
                className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/50 px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-slate-200">
                  {currentUser.username}
                </span>
                <span
                  className={`text-xs uppercase font-semibold px-2 py-0.5 rounded-md border ${getRoleBadgeStyle(
                    currentUser.role
                  )}`}
                >
                  {currentUser.role}
                </span>
                <Settings className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-rose-600/80 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {showSettings && currentUser && (
        <ProfileSettingsModal
          user={currentUser}
          onClose={() => setShowSettings(false)}
          onUserUpdated={(updated) => setCurrentUser(updated)}
        />
      )}
    </>
  );
};

export default Navbar;