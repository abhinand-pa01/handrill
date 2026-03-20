import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import TopBar from '../../components/TopBar';
import StatusBadge from '../../components/ui/StatusBadge';
import ServiceIcon from '../../components/ui/ServiceIcon';
import Avatar from '../../components/ui/Avatar';

const FILTERS = ['All', 'Active', 'Completed'];

export default function WorkerJobs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { services, customers, getBookingsByWorker } = useApp();
  const [filter, setFilter] = useState('All');

  const myJobs = (getBookingsByWorker(user?.id) || [])
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filtered = myJobs.filter(b => {
    if (filter === 'All') return true;
    if (filter === 'Active') return ['ASSIGNED', 'INPROGRESS'].includes(b.status);
    if (filter === 'Completed') return b.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="min-h-screen bg-bg">
      <TopBar title="My Jobs" />
      <div className="bg-white border-b border-border sticky top-14 z-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex gap-1 py-2">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium font-body transition-all ${filter === f ? 'bg-brand-blue text-white' : 'text-secondary hover:bg-bg'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="card p-10 text-center mt-4">
            <Briefcase size={36} className="text-slate-200 mx-auto mb-3" />
            <p className="font-display font-semibold text-primary">No jobs here</p>
            <p className="text-sm text-secondary font-body mt-1">Jobs assigned to you will appear here</p>
          </div>
        ) : filtered.map(job => {
          const svc = services.find(s => String(s.id) === String(job.serviceId));
          const customer = customers.find(c => String(c.id) === String(job.customerId));
          return (
            <button key={job.id} onClick={() => navigate(`/worker/jobs/${job.id}`)}
              className="card w-full p-4 text-left hover:shadow-md transition-all active:scale-[0.99]">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: (svc?.color || '#2563EB') + '20' }}>
                  <ServiceIcon name={svc?.icon || 'Settings'} size={20} style={{ color: svc?.color || '#2563EB' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display font-semibold text-primary text-sm">{svc?.name || 'Service'}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Avatar name={customer?.name} size="xs" />
                        <p className="text-xs text-secondary font-body">{customer?.name || 'Customer'}</p>
                      </div>
                    </div>
                    <StatusBadge status={job.status} size="xs" />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted font-body">
                      {job.scheduledAt ? format(new Date(job.scheduledAt), 'EEE, MMM d · h:mm a') : 'Not scheduled'}
                    </p>
                    <div className="flex items-center gap-1">
                      <p className="font-display font-bold text-brand-blue text-sm">₹{job.amount}</p>
                      <ChevronRight size={14} className="text-muted" />
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
