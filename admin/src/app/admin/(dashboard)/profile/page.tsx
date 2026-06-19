'use client';

import { useEffect, useState } from 'react';
import { HiUserCircle, HiMail, HiShieldCheck, HiClock, HiPencil, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import Spinner from '@/components/Spinner';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nameModal, setNameModal] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { document.title = 'Profile | Tobillion Admin'; load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/profile');
      const data = await res.json();
      setProfile(data);
      setName(data?.name || '');
      setEmail(data?.email || '');
    } catch { /* ignore */ }
    setLoading(false);
  };

  const updateName = async () => {
    if (!name.trim()) return;
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setProfile((p: any) => ({ ...p, name: data.name }));
      setNameModal(false);
      setSuccess('Name updated');
    } catch { setError('Failed to update name'); }
    setSaving(false);
  };

  const updateEmail = async () => {
    if (!email.trim()) return;
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setProfile((p: any) => ({ ...p, email: data.email }));
      setEmailModal(false);
      setSuccess('Email updated');
    } catch { setError('Failed to update email'); }
    setSaving(false);
  };

  const updatePassword = async () => {
    if (!currentPassword || !newPassword) { setError('All password fields are required'); return; }
    if (newPassword.length < 6) { setError('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setPasswordModal(false);
      setSuccess('Password updated');
    } catch { setError('Failed to update password'); }
    setSaving(false);
  };

  const closeAll = () => { setNameModal(false); setEmailModal(false); setPasswordModal(false); setError(''); };

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;
  if (!profile) return <p className="text-sm text-gray-400 text-center py-12">Failed to load profile</p>;

  return (
    <>
      {success && (
        <div className="mb-4 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">{success}</div>
      )}

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-gray-800">Profile</h2>
          </div>
          <div className="card-body">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <HiUserCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-800">{profile.name}</p>
                <p className="text-sm text-gray-400">{profile.email}</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 capitalize">{profile.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-gray-800">Account Details</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <HiUserCircle className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Name</p>
                  <p className="text-sm font-medium text-gray-800">{profile.name}</p>
                </div>
              </div>
              <button onClick={() => { setName(profile.name); setNameModal(true); }} className="text-emerald-700 hover:text-gold-500"><HiPencil className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <HiMail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-800">{profile.email}</p>
                </div>
              </div>
              <button onClick={() => { setEmail(profile.email); setEmailModal(true); }} className="text-emerald-700 hover:text-gold-500"><HiPencil className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <HiShieldCheck className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Role</p>
                  <p className="text-sm font-medium text-gray-800 capitalize">{profile.role}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <HiLockClosed className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Password</p>
                  <p className="text-sm font-medium text-gray-800">••••••••</p>
                </div>
              </div>
              <button onClick={() => { setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setError(''); setPasswordModal(true); }} className="text-emerald-700 hover:text-gold-500"><HiPencil className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* Session Info */}
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-gray-800">Session</h2>
          </div>
          <div className="card-body space-y-3">
            {profile.last_login_at && (
              <div className="flex items-center gap-3 text-sm">
                <HiClock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Last login:</span>
                <span className="text-gray-800">{new Date(profile.last_login_at).toLocaleString('en-KE')}</span>
              </div>
            )}
            {profile.created_at && (
              <div className="flex items-center gap-3 text-sm">
                <HiClock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Account created:</span>
                <span className="text-gray-800">{new Date(profile.created_at).toLocaleString('en-KE')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Name Modal */}
      {nameModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeAll}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-800 mb-4">Change Name</h3>
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field mb-4" placeholder="Full name" autoFocus />
            <div className="flex gap-2">
              <button onClick={updateName} disabled={saving || !name.trim()} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
              <button onClick={closeAll} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {emailModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeAll}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-800 mb-4">Change Email</h3>
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field mb-4" placeholder="Email address" autoFocus />
            <div className="flex gap-2">
              <button onClick={updateEmail} disabled={saving || !email.trim()} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
              <button onClick={closeAll} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {passwordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeAll}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-800 mb-4">Change Password</h3>
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <div className="space-y-3">
              <div>
                <label className="input-label">Current Password</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="input-field" placeholder="Enter current password" autoFocus />
              </div>
              <div>
                <label className="input-label">New Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field pr-10" placeholder="Min 6 characters" />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="input-label">Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-field" placeholder="Re-enter new password" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={updatePassword} disabled={saving || !currentPassword || !newPassword || !confirmPassword} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
              <button onClick={closeAll} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
