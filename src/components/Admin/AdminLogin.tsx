import React, { useState } from 'react';
import { Lock, ShieldAlert, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AdminSession } from '../../types';

interface AdminLoginProps {
  session: AdminSession;
  onLoginSuccess: (session: AdminSession) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ session, onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Password Reset state
  const [resetOpen, setResetOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess({
          isAuthenticated: true,
          username: data.username,
          token: data.token
        });
      } else {
        setErrorMsg(data.message || 'Invalid password.');
      }
    } catch (err) {
      setErrorMsg('Error connecting to backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      setResetError('Please enter a new password.');
      return;
    }
    setResetError('');
    setResetSuccess('');

    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResetSuccess('Password reset successfully! You can now log in with your new password.');
        setPassword(newPassword);
        setTimeout(() => setResetOpen(false), 2000);
      } else {
        setResetError(data.message || 'Current password incorrect.');
      }
    } catch (err) {
      setResetError('Error connecting to server.');
    }
  };

  return (
    <div className="py-20 px-4 max-w-md mx-auto text-left animate-fadeIn">
      <div className="bg-[#0F2747] text-[#FAF7F1] p-8 rounded-3xl border border-[#C95A1A]/30 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#C95A1A] text-[#FAF7F1] flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <span className="text-[10px] tracking-[0.25em] text-[#D8C3A5] uppercase font-bold block">
            Protected Atelier Portal
          </span>
          <h2 className="font-serif-luxury text-2xl font-bold text-[#FAF7F1]">
            Wengi's Touch Admin Login
          </h2>
          <p className="text-xs text-[#D8C3A5] font-light">
            Enter credentials to access product management, orders, and messages.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-900/60 border border-red-500/50 text-red-200 text-xs rounded-xl flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold uppercase text-[#D8C3A5] tracking-wider block">
                Admin Password
              </label>
              <button
                type="button"
                onClick={() => setResetOpen(true)}
                className="text-[10px] text-[#C95A1A] hover:underline"
              >
                Reset Password?
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your admin password"
              className="w-full bg-[#142E52] border border-[#C95A1A]/30 rounded-xl px-3.5 py-2.5 text-xs text-[#FAF7F1] focus:outline-none focus:border-[#C95A1A]"
            />
            <span className="text-[10px] text-[#D8C3A5]/60 mt-1 block">
              Contact admin if you don't know the password
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-[#C95A1A] hover:bg-[#A94712] text-[#FAF7F1] text-xs font-semibold uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Access Admin Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>

      {/* Reset Password Modal */}
      {resetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0F2747] border border-[#C95A1A]/40 text-[#FAF7F1] p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-[#C95A1A]" />
                <h3 className="font-serif-luxury font-bold text-lg">Reset Password</h3>
              </div>
              <button onClick={() => setResetOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            {resetSuccess && (
              <div className="p-3 bg-emerald-900/60 border border-emerald-500 text-emerald-200 text-xs rounded-xl flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{resetSuccess}</span>
              </div>
            )}

            {resetError && (
              <div className="p-3 bg-red-900/60 border border-red-500 text-red-200 text-xs rounded-xl">
                {resetError}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-[#D8C3A5]">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#142E52] border border-[#C95A1A]/30 rounded-xl px-3 py-2 text-xs text-[#FAF7F1]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-[#D8C3A5]">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password..."
                  className="w-full bg-[#142E52] border border-[#C95A1A]/30 rounded-xl px-3 py-2 text-xs text-[#FAF7F1]"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetOpen(false)}
                  className="w-1/2 py-2 rounded-xl bg-[#142E52] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-[#C95A1A] text-xs font-semibold"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
