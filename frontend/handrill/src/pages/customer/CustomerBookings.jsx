import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/ui/StatusBadge';
import ServiceIcon from '../../components/ui/ServiceIcon';
import TopBar from '../../components/TopBar';

const FILTERS = ['All', 'Active', 'Completed', 'Cancelled'];

export default function CustomerBookings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { services, getBookingsByCustomer } = useApp();
  const [filter, setFilter] = useState('All');

  const myBookings = (getBookingsByCustomer(user?.id) || [])
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filtered = myBookings.filter(b => {
    if (filter === 'All') return true;
    if (filter === 'Active') return ['PENDING', 'ASSIGNED', 'INPROGRESS'].includes(b.status);
    if (filter === 'Completed') return b.status === 'COMPLETED';
    if (filter === 'Cancelled') return b.status === 'CANCELLED';
    return true;
  });

  const activeCount = myBookings.filter(b => ['PENDING', 'ASSIGNED', 'INPROGRESS'].includes(b.status)).length;

  return (
    <div className="min-h-screen bg-bg">
      <TopBar title="My Bookings" />

      <div className="bg-white border-b border-border sticky top-14 z-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex gap-1 py-2 overflow-x-auto no-scrollbar">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium font-body transition-all ${
                  filter === f ? 'bg-brand-blue text-white' : 'text-secondary hover:bg-bg'
                }`}>
                {f}
                {f === 'Active' && activeCount > 0 && (
                  <span className="ml-1.5 bg-white/30 text-white text-xs px-1 rounded-full">
                    {activeCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="card p-10 text-center mt-4">
            <CalendarDays size={36} className="text-slate-200 mx-auto mb-3" />
            <p className="font-display font-semibold text-primary mb-1">No bookings yet</p>
            <p className="text-sm text-secondary font-body mb-4">Book your first home service today</p>
            <button onClick={() => navigate('/customer/book')} className="btn-primary px-6">Book a Service</button>
          </div>
        ) : filtered.map(booking => {
          const svc = services.find(s => String(s.id) === String(booking.serviceId));
          return (
            <button key={booking.id}
              onClick={() => navigate(`/customer/bookings/${booking.id}`)}
              className="card w-full p-4 text-left hover:shadow-md transition-all active:scale-[0.99]">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: (svc?.color || '#2563EB') + '20' }}>
                  <ServiceIcon name={svc?.icon || 'Settings'} size={20} style={{ color: svc?.color || '#2563EB' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display font-semibold text-primary text-sm">{svc?.name || 'Service'}</p>
                      <p className="text-xs text-muted font-body mt-0.5">#{String(booking.id).toUpperCase()}</p>
                    </div>
                    <StatusBadge status={booking.status} size="xs" />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <p className="text-xs text-secondary font-body">
                        {booking.scheduledAt ? format(new Date(booking.scheduledAt), 'EEE, MMM d · h:mm a') : 'Not scheduled'}
                      </p>
                      <p className="font-display font-bold text-brand-blue text-sm mt-1">₹{booking.amount}</p>
                    </div>
                    <ChevronRight size={16} className="text-muted flex-shrink-0" />
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
