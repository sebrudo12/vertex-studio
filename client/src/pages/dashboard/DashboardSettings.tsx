import React, { useState } from 'react';
import { User, Lock, Save, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const DashboardSettings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [username, setUsername] = useState(user?.username || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [discordTag, setDiscordTag] = useState(user?.discord_tag || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', {
        username,
        avatar_url: avatarUrl,
        discord_tag: discordTag,
      });
      updateUser(res.data.user);
      showToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'warning');
      return;
    }
    setChangingPass(true);
    try {
      await api.put('/auth/change-password', { oldPassword, newPassword });
      showToast('Password changed successfully!', 'success');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to change password', 'error');
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-white font-display">Account Settings</h2>
        <p className="text-xs text-gray-400 mt-1">
          Manage your personal information, connected Discord identity, and account credentials.
        </p>
      </div>

      {/* Profile Info Form */}
      <form onSubmit={handleUpdateProfile} className="p-6 rounded-2xl bg-dark-850/80 border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Profile Information</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-dark-900 border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Discord Handle / Tag</label>
            <input
              type="text"
              placeholder="e.g. Developer#0001"
              value={discordTag}
              onChange={(e) => setDiscordTag(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-dark-900 border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-300">Avatar Image URL</label>
          <input
            type="text"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-dark-900 border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--brand-primary)]"
          />
        </div>

        <button
          type="submit"
          disabled={savingProfile}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </form>

      {/* Change Password Form */}
      <form onSubmit={handleChangePassword} className="p-6 rounded-2xl bg-dark-850/80 border border-white/5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Change Password</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Current Password</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-dark-900 border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">New Password</label>
            <input
              type="password"
              required
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-dark-900 border border-white/10 text-xs text-white focus:outline-none focus:border-[var(--brand-primary)]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={changingPass}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/15 flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Update Password</span>
        </button>
      </form>
    </div>
  );
};
