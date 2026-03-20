import { useState } from 'react';
import { Eye, EyeOff, Lock, CheckCircle, XCircle } from 'lucide-react';
import Modal from './ui/Modal';

function PasswordStrength({ password }) {
  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'One uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'One number', pass: /[0-9]/.test(password) },
    { label: 'One special character', pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < score ? colors[score - 1] : 'bg-slate-100'}`} />
        ))}
      </div>
      {score > 0 && (
        <p className={`text-xs font-body font-medium ${score <= 1 ? 'text-red-500' : score <= 2 ? 'text-orange-500' : score <= 3 ? 'text-yellow-600' : 'text-emerald-600'}`}>
          {labels[score - 1]}
        </p>
      )}
      <div className="space-y-1">
        {checks.map(c => (
          <div key={c.label} className="flex items-center gap-1.5">
            {c.pass
              ? <CheckCircle size={11} className="text-emerald-500 flex-shrink-0" />
              : <XCircle size={11} className="text-slate-300 flex-shrink-0" />}
            <span className={`text-xs font-body ${c.pass ? 'text-emerald-600' : 'text-muted'}`}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChangePasswordModal({ isOpen, onClose, onSave, isDemo = false }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  function toggle(field) { setShow(p => ({ ...p, [field]: !p[field] })); }
  function set(field) { return e => { setForm(p => ({ ...p, [field]: e.target.value })); setError(''); }; }

  async function handleSave() {
    if (!form.current) { setError('Enter your current password'); return; }
    if (form.next.length < 6) { setError('New password must be at least 6 characters'); return; }
    if (form.next !== form.confirm) { setError('New passwords do not match'); return; }

    setSaving(true); setError('');
    try {
      await onSave({ currentPassword: form.current, newPassword: form.next });
      setSuccess(true);
      setTimeout(() => { setSuccess(false); setForm({ current: '', next: '', confirm: '' }); onClose(); }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to change password. Check your current password.');
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    setForm({ current: '', next: '', confirm: '' });
    setError('');
    setSuccess(false);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Change Password">
      <div className="p-5 space-y-4">
        {isDemo && (
          <div className="px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-sm text-amber-700 font-body">
              Demo mode — password changes are local only and reset on refresh.
            </p>
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle size={28} className="text-emerald-500" />
            </div>
            <p className="font-display font-semibold text-primary">Password updated!</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-600 font-body">{error}</p>
              </div>
            )}

            <div>
              <label className="label">Current Password</label>
              <div className="relative">
                <input
                  type={show.current ? 'text' : 'password'}
                  className="input-field pr-11"
                  placeholder="Your current password"
                  value={form.current}
                  onChange={set('current')}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => toggle('current')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                  {show.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <input
                  type={show.next ? 'text' : 'password'}
                  className="input-field pr-11"
                  placeholder="Min. 6 characters"
                  value={form.next}
                  onChange={set('next')}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => toggle('next')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                  {show.next ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrength password={form.next} />
            </div>

            <div>
              <label className="label">Confirm New Password</label>
              <div className="relative">
                <input
                  type={show.confirm ? 'text' : 'password'}
                  className={`input-field pr-11 ${form.confirm && form.next !== form.confirm ? 'ring-2 ring-red-300 border-transparent' : ''}`}
                  placeholder="Repeat new password"
                  value={form.confirm}
                  onChange={set('confirm')}
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => toggle('confirm')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                  {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.confirm && form.next === form.confirm && (
                <p className="text-xs text-emerald-600 font-body mt-1 flex items-center gap-1">
                  <CheckCircle size={11} /> Passwords match
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={handleClose} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.current || !form.next || !form.confirm} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : <Lock size={14} />}
                {saving ? 'Saving...' : 'Update Password'}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
