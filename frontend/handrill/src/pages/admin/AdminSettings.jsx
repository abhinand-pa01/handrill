import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Shield, Bell, Database, Globe, ChevronRight, Info, Lock, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/ui/Avatar';
import TopBar from '../../components/TopBar';
import ChangePasswordModal from '../../components/ChangePasswordModal';

const MENU = [
  { icon: Bell,     label: 'Notifications',     desc: 'Configure system alerts' },
  { icon: Shield,   label: 'Security',           desc: 'Access control, API keys' },
  { icon: Database, label: 'Data Management',    desc: 'Export, backup settings' },
  { icon: Globe,    label: 'Platform Settings',  desc: 'Regions, currency, timezone' },
  { icon: Info,     label: 'About Handrill',     desc: 'Version, licenses, support' },
];

export default function AdminSettings() {
  const navigate = useNavigate();
  const { user, logout, changePassword, isDemo } = useAuth();
  const [pwdModal, setPwdModal] = useState(false);
  const [saveMsg, setSaveMsg]   = useState('');

  async function handleLogout() { await logout(); navigate('/login', { replace: true }); }

  async function handleChangePassword(data) {
    await changePassword(data);
    setSaveMsg('Password updated successfully');
    setTimeout(() => setSaveMsg(''), 3000);
  }

  return (
    <div className="min-h-screen bg-bg">
      <TopBar title="Settings" />
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">

        {saveMsg && (
          <div className="px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2">
            <Check size={14} className="text-emerald-500" />
            <p className="text-sm text-emerald-700 font-body">{saveMsg}</p>
          </div>
        )}

        {/* Admin profile card */}
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <Avatar name={user?.name} size="xl" />
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-bold text-xl text-primary">{user?.name}</h2>
              <p className="text-sm text-secondary font-body">{user?.email}</p>
              {user?.phone && <p className="text-sm text-secondary font-body">{user.phone}</p>}
              <div className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 bg-purple-50 rounded-full">
                <Shield size={11} className="text-purple-600" />
                <span className="text-xs text-purple-700 font-medium font-body">Administrator</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security section */}
        <div className="card divide-y divide-border">
          <div className="px-4 py-2.5">
            <p className="text-xs text-muted font-body uppercase tracking-wide font-medium">Security</p>
          </div>
          <button
            onClick={() => setPwdModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-bg transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Lock size={17} className="text-brand-blue" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-primary font-body">Change Password</p>
              <p className="text-xs text-muted font-body">Update your admin password</p>
            </div>
            <ChevronRight size={16} className="text-muted" />
          </button>
        </div>

        {/* General settings */}
        <div className="card divide-y divide-border">
          <div className="px-4 py-2.5">
            <p className="text-xs text-muted font-body uppercase tracking-wide font-medium">General</p>
          </div>
          {MENU.map(item => {
            const Icon = item.icon;
            return (
              <button key={item.label} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-bg transition-colors text-left">
                <div className="w-9 h-9 rounded-xl bg-bg flex items-center justify-center flex-shrink-0">
                  <Icon size={17} className="text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary font-body">{item.label}</p>
                  <p className="text-xs text-muted font-body">{item.desc}</p>
                </div>
                <ChevronRight size={16} className="text-muted" />
              </button>
            );
          })}
        </div>

        {/* App info */}
        <div className="card p-4 space-y-2">
          <h3 className="section-title mb-2">App Info</h3>
          {[
            { label: 'App Version', value: '2.0.0' },
            { label: 'Platform',    value: 'Handrill Kerala' },
            { label: 'Stack',       value: 'React 19 · Spring Boot 3.3.5' },
            { label: 'Environment', value: isDemo ? 'Demo Mode' : 'Production' },
          ].map(item => (
            <div key={item.label} className="flex justify-between py-1">
              <span className="text-sm text-secondary font-body">{item.label}</span>
              <span className="text-sm font-semibold text-primary font-body">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-4 bg-red-50 rounded-2xl border border-red-100 hover:bg-red-100 transition-colors">
          <LogOut size={18} className="text-red-500" />
          <span className="text-sm font-semibold text-red-600 font-body">Sign Out</span>
        </button>
      </div>

      <ChangePasswordModal isOpen={pwdModal} onClose={() => setPwdModal(false)} onSave={handleChangePassword} isDemo={isDemo} />
    </div>
  );
}
