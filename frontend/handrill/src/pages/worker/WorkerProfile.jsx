import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Globe, BadgeCheck, LogOut, Lock, Edit2, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Avatar from '../../components/ui/Avatar';
import Toggle from '../../components/ui/Toggle';
import TopBar from '../../components/TopBar';
import ServiceIcon from '../../components/ui/ServiceIcon';
import StarRating from '../../components/ui/StarRating';
import ChangePasswordModal from '../../components/ChangePasswordModal';

export default function WorkerProfile() {
  const navigate = useNavigate();
  const { user, logout, changePassword, isDemo } = useAuth();
  const { workers, services, toggleWorkerAvailability } = useApp();

  const [pwdModal, setPwdModal] = useState(false);
  const [saveMsg, setSaveMsg]   = useState('');

  const worker    = workers.find(w => String(w.id) === String(user?.id));
  const profile   = worker?.profile;
  const myServices = services.filter(s => profile?.specializations?.includes(s.id));

  async function handleLogout() { await logout(); navigate('/login', { replace: true }); }

  const infoItems = [
    { icon: Phone,   value: user?.phone },
    { icon: Mail,    value: user?.email },
    { icon: Clock,   value: profile?.workStartTime && profile?.workEndTime ? `${profile.workStartTime} – ${profile.workEndTime}` : null },
    { icon: Globe,   value: profile?.languages },
    { icon: MapPin,  value: profile?.location },
  ].filter(i => i.value);

  return (
    <div className="min-h-screen bg-bg">
      <TopBar title="My Profile" />
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">

        {saveMsg && (
          <div className="px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2">
            <Check size={14} className="text-emerald-500" />
            <p className="text-sm text-emerald-700 font-body">{saveMsg}</p>
          </div>
        )}

        {/* Header card */}
        <div className="gradient-header rounded-2xl p-5 text-white">
          <div className="flex items-center gap-4">
            <Avatar name={user?.name} size="2xl" className="ring-2 ring-white/30" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="font-display font-bold text-xl">{user?.name}</h2>
                {profile?.idProof && <BadgeCheck size={18} className="text-blue-200 flex-shrink-0" />}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <StarRating rating={profile?.averageRating || 0} size={13} />
                <span className="text-sm text-white font-semibold ml-1">{profile?.averageRating}</span>
                <span className="text-blue-200 text-xs font-body">({profile?.totalJobsCompleted} jobs)</span>
              </div>
              {profile?.experience && (
                <span className="inline-flex mt-1 px-2 py-0.5 bg-white/20 rounded-full text-xs text-white font-body">
                  {profile.experience} yrs experience
                </span>
              )}
            </div>
          </div>

          {profile?.bio && (
            <p className="text-blue-100 text-sm font-body mt-4 leading-relaxed">{profile.bio}</p>
          )}

          <div className="mt-4 flex items-center justify-between bg-white/15 rounded-xl p-3">
            <div>
              <p className="text-white text-sm font-semibold font-body">{profile?.online ? 'Online' : 'Offline'}</p>
              <p className="text-blue-200 text-xs font-body">{profile?.online ? 'Accepting new jobs' : 'Not accepting jobs'}</p>
            </div>
            <Toggle checked={profile?.online || false} onChange={() => toggleWorkerAvailability(user.id)} />
          </div>
        </div>

        {/* Contact */}
        <div className="card p-4 space-y-1">
          <h3 className="section-title mb-3">Contact Details</h3>
          {infoItems.map(({ icon: Icon, value }) => (
            <div key={value} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
              <Icon size={15} className="text-muted flex-shrink-0" />
              <span className="text-sm text-primary font-body">{value}</span>
            </div>
          ))}
          <div className="flex items-center gap-3 py-2">
            <BadgeCheck size={15} className={profile?.idProof ? 'text-brand-blue' : 'text-slate-300'} />
            <span className={`text-sm font-body ${profile?.idProof ? 'text-brand-blue font-medium' : 'text-muted'}`}>
              ID Proof: {profile?.idProof ? 'Verified' : 'Not verified'}
            </span>
          </div>
        </div>

        {/* Specializations */}
        {myServices.length > 0 && (
          <div className="card p-4">
            <h3 className="section-title mb-3">Specializations</h3>
            <div className="space-y-2">
              {myServices.map(svc => (
                <div key={svc.id} className="flex items-center gap-3 py-1">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: svc.color + '20' }}>
                    <ServiceIcon name={svc.icon} size={16} style={{ color: svc.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary font-body">{svc.name}</p>
                    <p className="text-xs text-muted font-body">{svc.category}</p>
                  </div>
                  <StarRating rating={svc.rating} size={12} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance stats */}
        <div className="card p-4">
          <h3 className="section-title mb-3">Performance</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Experience', value: `${profile?.experience || 0} years` },
              { label: 'Jobs Completed', value: profile?.totalJobsCompleted || 0 },
              { label: 'Performance Score', value: `${profile?.performanceScore || 0}%` },
              { label: 'Average Rating', value: `${profile?.averageRating || 0} / 5` },
            ].map(item => (
              <div key={item.label} className="bg-bg rounded-xl p-3">
                <p className="text-xs text-muted font-body">{item.label}</p>
                <p className="font-display font-bold text-primary mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Settings menu */}
        <div className="card divide-y divide-border">
          <button onClick={() => setPwdModal(true)} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-bg transition-colors text-left">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Lock size={15} className="text-brand-blue" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-primary font-body">Change Password</p>
              <p className="text-xs text-muted font-body">Update your login password</p>
            </div>
            <span className="text-xs text-brand-blue font-body font-medium">Update</span>
          </button>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-4 bg-red-50 rounded-2xl border border-red-100 hover:bg-red-100 transition-colors">
          <LogOut size={18} className="text-red-500" />
          <span className="text-sm font-semibold text-red-600 font-body">Sign Out</span>
        </button>
      </div>

      <ChangePasswordModal isOpen={pwdModal} onClose={() => setPwdModal(false)} onSave={changePassword} isDemo={isDemo} />
    </div>
  );
}
