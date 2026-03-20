import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Check, X, Phone, MapPin, Mail, LogOut, ChevronRight, ShieldCheck, HelpCircle, Bell, Lock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Avatar from '../../components/ui/Avatar';
import TopBar from '../../components/TopBar';
import ChangePasswordModal from '../../components/ChangePasswordModal';
import Modal from '../../components/ui/Modal';
import { KERALA_CITIES } from '../../data/mockData';

export default function CustomerProfile() {
  const navigate = useNavigate();
  const { user, logout, updateUser, changePassword, deactivateAccount, isDemo } = useAuth();
  const { getBookingsByCustomer } = useApp();

  const [editing,   setEditing]   = useState(false);
  const [form,      setForm]      = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [pwdModal,  setPwdModal]  = useState(false);
  const [deactModal,setDeactModal]= useState(false);
  const [saveMsg,   setSaveMsg]   = useState('');

  const myBookings  = getBookingsByCustomer(user?.id);
  const completed   = myBookings.filter(b => b.status === 'COMPLETED');
  const active      = myBookings.filter(b => ['PENDING','ASSIGNED','INPROGRESS'].includes(b.status));
  const spent       = completed.reduce((s, b) => s + (b.amount || 0), 0);

  function set(field) { return e => setForm(p => ({ ...p, [field]: e.target.value })); }

  function handleSave() {
    updateUser({ name: form.name, phone: form.phone, address: form.address });
    setEditing(false);
    setSaveMsg('Profile updated');
    setTimeout(() => setSaveMsg(''), 2500);
  }
  function handleCancel() {
    setForm({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
    setEditing(false);
  }

  async function handleLogout() { await logout(); navigate('/login', { replace: true }); }

  async function handleDeactivate() {
    await deactivateAccount();
    navigate('/login', { replace: true });
  }

  const MENU = [
    { icon: Lock,        label: 'Change Password',   desc: 'Update your login password',   action: () => setPwdModal(true) },
    { icon: Bell,        label: 'Notifications',     desc: 'Manage alerts',                 action: null },
    { icon: ShieldCheck, label: 'Privacy & Security',desc: 'Account security settings',     action: null },
    { icon: HelpCircle,  label: 'Help & Support',    desc: 'FAQs and contact us',           action: null },
    { icon: AlertTriangle,label: 'Deactivate Account',desc: 'Permanently deactivate your account', action: () => setDeactModal(true), danger: true },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <TopBar title="My Profile" rightSlot={
        !editing
          ? <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-brand-blue text-sm font-medium font-body">
              <Edit2 size={14} />Edit
            </button>
          : <div className="flex gap-2">
              <button onClick={handleCancel} className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                <X size={15} className="text-red-500" />
              </button>
              <button onClick={handleSave} className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                <Check size={15} className="text-emerald-600" />
              </button>
            </div>
      } />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {saveMsg && (
          <div className="px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2">
            <Check size={14} className="text-emerald-500" />
            <p className="text-sm text-emerald-700 font-body">{saveMsg}</p>
          </div>
        )}

        {/* Profile header */}
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <Avatar name={user?.name} size="2xl" />
            <div className="flex-1 min-w-0">
              {editing
                ? <input className="input-field text-lg font-semibold font-display mb-1" value={form.name} onChange={set('name')} />
                : <h2 className="font-display font-bold text-xl text-primary">{user?.name}</h2>
              }
              <div className="flex items-center gap-1 mt-0.5">
                <Mail size={13} className="text-muted" />
                <p className="text-sm text-secondary font-body truncate">{user?.email}</p>
              </div>
              <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-blue-50 rounded-full text-xs text-brand-blue font-medium font-body">
                Customer
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Total',  value: myBookings.length, color: 'text-primary' },
            { label: 'Done',   value: completed.length,  color: 'text-emerald-600' },
            { label: 'Active', value: active.length,     color: 'text-brand-blue' },
            { label: 'Spent',  value: `\u20B9${spent}`,  color: 'text-amber-600' },
          ].map(s => (
            <div key={s.label} className="card p-3 text-center">
              <p className={`font-display font-bold text-base ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted font-body mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Contact details */}
        <div className="card p-4 space-y-3">
          <h3 className="section-title">Contact Details</h3>
          <div>
            <label className="label">Phone Number</label>
            {editing
              ? <input type="tel" className="input-field" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
              : <div className="flex items-center gap-2 py-2">
                  <Phone size={15} className="text-muted" />
                  <span className="text-sm text-primary font-body">{user?.phone || 'Not set'}</span>
                </div>
            }
          </div>
          <div>
            <label className="label">Service Address</label>
            {editing
              ? <>
                  <textarea className="input-field resize-none mb-2" rows={2} value={form.address} onChange={set('address')} placeholder="Street address" />
                </>
              : <div className="flex items-start gap-2 py-2">
                  <MapPin size={15} className="text-muted mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-primary font-body leading-relaxed">{user?.address || 'Not set'}</span>
                </div>
            }
          </div>
        </div>

        {/* Menu */}
        <div className="card divide-y divide-border">
          {MENU.map(item => {
            const Icon = item.icon;
            return (
              <button key={item.label} onClick={item.action || undefined}
                className={`w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left ${item.action ? 'hover:bg-bg cursor-pointer' : 'cursor-default opacity-60'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.danger ? 'bg-red-50' : item.label === 'Change Password' ? 'bg-blue-50' : 'bg-bg'}`}>
                  <Icon size={16} className={item.danger ? 'text-red-500' : item.label === 'Change Password' ? 'text-brand-blue' : 'text-secondary'} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium font-body ${item.danger ? 'text-red-600' : 'text-primary'}`}>{item.label}</p>
                  <p className="text-xs text-muted font-body">{item.desc}</p>
                </div>
                {item.action && <ChevronRight size={16} className="text-muted" />}
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-4 bg-red-50 rounded-2xl border border-red-100 hover:bg-red-100 transition-colors">
          <LogOut size={18} className="text-red-500" />
          <span className="text-sm font-semibold text-red-600 font-body">Sign Out</span>
        </button>
      </div>

      <ChangePasswordModal isOpen={pwdModal} onClose={() => setPwdModal(false)} onSave={changePassword} isDemo={isDemo} />

      {/* Deactivate confirmation */}
      <Modal isOpen={deactModal} onClose={() => setDeactModal(false)} title="Deactivate Account">
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
            <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 font-body leading-relaxed">
              This will deactivate your account. You will be logged out and cannot log back in.
            </p>
          </div>
          <p className="text-sm text-secondary font-body">
            {isDemo
              ? 'Since this is a demo, your account data will be cleared from this browser.'
              : 'Your booking history will be retained for service records. Contact support to reactivate.'}
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeactModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleDeactivate} className="btn-danger flex-1">Deactivate</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
