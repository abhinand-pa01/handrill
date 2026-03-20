import { useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, Star, Briefcase, TrendingUp, Clock, IndianRupee } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Toggle from '../../components/ui/Toggle';
import Avatar from '../../components/ui/Avatar';
import StatusBadge from '../../components/ui/StatusBadge';
import ServiceIcon from '../../components/ui/ServiceIcon';

export default function WorkerHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { workers, services, toggleWorkerAvailability, getBookingsByWorker } = useApp();

  const worker = workers.find(w => String(w.id) === String(user?.id));
  const profile = worker?.profile;
  const myJobs   = getBookingsByWorker(user?.id);
  const activeJobs    = myJobs.filter(b => ['ASSIGNED','INPROGRESS'].includes(b.status));
  const completedJobs = myJobs.filter(b => b.status === 'COMPLETED');
  const earnings      = completedJobs.reduce((s, b) => s + (b.amount || 0), 0);

  const perfItems = [
    { label: 'Rating',    pct: ((profile?.averageRating||0)/5)*100,                         color: 'bg-amber-400',   display: `${profile?.averageRating||0} / 5` },
    { label: 'Jobs Done', pct: Math.min(((profile?.totalJobsCompleted||0)/200)*100, 100),    color: 'bg-brand-blue',  display: profile?.totalJobsCompleted||0 },
    { label: 'Score',     pct: profile?.performanceScore||0,                                  color: 'bg-emerald-500', display: `${profile?.performanceScore||0}%` },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <div className="gradient-header px-4 pt-12 pb-8 text-white">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Avatar name={user?.name} size="lg" className="ring-2 ring-white/30" />
              <div>
                <p className="text-blue-200 text-xs font-body">Welcome back,</p>
                <h1 className="font-display font-bold text-xl">{user?.name?.split(' ')[0]}</h1>
                <p className="text-blue-200 text-xs font-body mt-0.5">{profile?.location}</p>
              </div>
            </div>
            <button className="relative w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
              <Bell size={18} className="text-white" />
              {activeJobs.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full" />
              )}
            </button>
          </div>

          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display font-semibold text-white">{profile?.online ? 'You are Online' : 'You are Offline'}</p>
                <p className="text-blue-200 text-xs font-body mt-0.5">{profile?.online ? 'Accepting new job requests' : 'Not accepting requests'}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-body font-medium ${profile?.online ? 'text-emerald-300' : 'text-blue-300'}`}>
                  {profile?.online ? 'ON' : 'OFF'}
                </span>
                <Toggle checked={profile?.online||false} onChange={() => toggleWorkerAvailability(user.id)} size="lg" />
              </div>
            </div>
            {profile?.online && (
              <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-4 text-xs text-blue-200 font-body">
                <span>{profile.workStartTime} – {profile.workEndTime}</span>
                <span>{activeJobs.length} active job{activeJobs.length!==1?'s':''}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-5">
        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Briefcase,    label: 'Active',   value: activeJobs.length,              color: 'text-brand-blue',   bg: 'bg-blue-50' },
            { icon: Star,         label: 'Rating',   value: profile?.averageRating||0,       color: 'text-amber-600',    bg: 'bg-amber-50' },
            { icon: TrendingUp,   label: 'Done',     value: profile?.totalJobsCompleted||0,  color: 'text-emerald-600',  bg: 'bg-emerald-50' },
            { icon: IndianRupee,  label: 'Earned',   value: `${(earnings/1000).toFixed(1)}k`,color: 'text-purple-600',   bg: 'bg-purple-50' },
          ].map(stat => { const Icon = stat.icon; return (
            <div key={stat.label} className="card p-3 text-center">
              <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center mx-auto mb-1.5`}>
                <Icon size={14} className={stat.color} />
              </div>
              <p className={`font-display font-bold text-base ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-muted font-body mt-0.5">{stat.label}</p>
            </div>
          );})}
        </div>

        {/* Performance bars */}
        <div className="card p-4">
          <h3 className="section-title mb-4">Performance</h3>
          <div className="space-y-4">
            {perfItems.map(item => (
              <div key={item.label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-body font-medium text-secondary">{item.label}</span>
                  <span className="text-sm font-display font-bold text-primary">{item.display}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active jobs */}
        {activeJobs.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-title">Active Jobs</h3>
              <button onClick={() => navigate('/worker/jobs')} className="text-xs text-brand-blue font-medium font-body">See all</button>
            </div>
            <div className="space-y-2">
              {activeJobs.map(job => {
                const svc = services.find(s => String(s.id) === String(job.serviceId));
                return (
                  <button key={job.id} onClick={() => navigate(`/worker/jobs/${job.id}`)}
                    className="card w-full p-4 text-left hover:shadow-md transition-all active:scale-[0.99]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: (svc?.color||'#2563EB')+'20' }}>
                        <ServiceIcon name={svc?.icon||'Settings'} size={18} style={{ color: svc?.color||'#2563EB' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-semibold text-primary text-sm">{svc?.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={11} className="text-muted" />
                          <p className="text-xs text-secondary font-body">
                            {job.scheduledAt ? new Date(job.scheduledAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={job.status} size="xs" pulse />
                        <ChevronRight size={14} className="text-muted" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="card p-8 text-center">
            <Briefcase size={32} className="text-slate-200 mx-auto mb-3" />
            <p className="font-display font-semibold text-primary mb-1">No active jobs</p>
            <p className="text-sm text-secondary font-body">
              {profile?.online ? 'Waiting for new assignments...' : 'Go online to start receiving jobs'}
            </p>
            {!profile?.online && (
              <button onClick={() => toggleWorkerAvailability(user.id)}
                className="btn-teal mt-4 px-6">Go Online</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
