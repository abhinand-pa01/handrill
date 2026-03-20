import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronRight, MapPin, Sparkles, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import ServiceIcon from '../../components/ui/ServiceIcon';
import Avatar from '../../components/ui/Avatar';
import StatusBadge from '../../components/ui/StatusBadge';
import WorkerAssignedCard from '../../components/WorkerAssignedCard';
import Modal from '../../components/ui/Modal';
import StarRating from '../../components/ui/StarRating';
import { format } from 'date-fns';

const CATEGORIES = ['All', 'Repair', 'Cleaning', 'Appliance', 'Renovation'];

export default function CustomerHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { services, getWorkerById, getBookingsByCustomer } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [serviceDetail, setServiceDetail] = useState(null);

  const myBookings = getBookingsByCustomer(user?.id);
  const activeBooking = myBookings.find(b => ['PENDING','ASSIGNED','INPROGRESS'].includes(b.status));
  const activeWorker  = activeBooking?.workerId ? getWorkerById(activeBooking.workerId) : null;

  const filtered = services.filter(s => {
    const q = search.toLowerCase();
    return s.active &&
      (category === 'All' || s.category === category) &&
      (s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
  });

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero */}
      <div className="gradient-header px-4 pt-12 pb-8 text-white">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-200 text-xs font-body">{greeting()},</p>
              <h1 className="font-display font-bold text-2xl">{user?.name?.split(' ')[0] || 'there'}</h1>
              {user?.address && (
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin size={11} className="text-blue-300" />
                  <p className="text-blue-200 text-xs font-body truncate max-w-[180px]">
                    {user.address.split(',').slice(-2).join(',').trim()}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className="relative w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                <Bell size={18} className="text-white" />
                {activeBooking && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full" />
                )}
              </button>
              <Avatar name={user?.name} size="md" className="ring-2 ring-white/30 cursor-pointer" onClick={() => navigate('/customer/profile')} />
            </div>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white rounded-xl pl-10 pr-10 py-3 text-sm font-body text-primary placeholder-muted focus:outline-none shadow-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-5">
        {/* Active booking banner */}
        {activeBooking && (
          <div className="card p-4 cursor-pointer hover:shadow-md transition-shadow border-l-4 border-brand-blue"
            onClick={() => navigate(`/customer/bookings/${activeBooking.id}`)}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-secondary font-body uppercase tracking-wide font-medium">Active Booking</p>
                <p className="font-display font-semibold text-primary mt-0.5">
                  {services.find(s => String(s.id) === String(activeBooking.serviceId))?.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={activeBooking.status} pulse />
                <ChevronRight size={16} className="text-muted" />
              </div>
            </div>
            {activeWorker && ['ASSIGNED','INPROGRESS'].includes(activeBooking.status) && (
              <WorkerAssignedCard worker={activeWorker} booking={activeBooking} compact />
            )}
            {activeBooking.status === 'PENDING' && (
              <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2 border border-amber-100">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                <p className="text-xs text-amber-700 font-body">Looking for an available worker...</p>
              </div>
            )}
          </div>
        )}

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium font-body transition-all ${
                category === cat ? 'bg-brand-blue text-white shadow-sm' : 'bg-white text-secondary border border-border hover:border-brand-blue hover:text-brand-blue'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Services grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title">
              {search ? `Results for "${search}"` : `${category === 'All' ? 'All' : category} Services`}
            </h2>
            <span className="text-xs text-muted font-body">{filtered.length} available</span>
          </div>

          {filtered.length === 0 ? (
            <div className="card p-10 text-center">
              <Sparkles size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="font-display font-semibold text-primary">No services found</p>
              <p className="text-sm text-secondary font-body mt-1">Try a different search or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map(service => (
                <button key={service.id}
                  onClick={() => setServiceDetail(service)}
                  className="card p-4 text-left hover:shadow-md transition-all active:scale-95 group">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: service.color + '20' }}>
                    <ServiceIcon name={service.icon} size={22} style={{ color: service.color }} />
                  </div>
                  <p className="font-display font-semibold text-primary text-sm leading-tight">{service.name}</p>
                  <p className="font-body text-xs text-muted mt-0.5">{service.durationMinutes} min</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-display font-bold text-brand-blue text-sm">&#x20B9;{service.price}</p>
                    <div className="flex items-center gap-0.5">
                      <span className="text-amber-400 text-xs">&#9733;</span>
                      <span className="text-xs text-muted font-body">{service.rating}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recent completed */}
        {myBookings.filter(b => b.status === 'COMPLETED').length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title">Recent Services</h2>
              <button onClick={() => navigate('/customer/bookings')} className="text-xs text-brand-blue font-medium font-body">See all</button>
            </div>
            <div className="space-y-2">
              {myBookings.filter(b => b.status === 'COMPLETED').slice(0, 2).map(booking => {
                const svc = services.find(s => String(s.id) === String(booking.serviceId));
                return (
                  <button key={booking.id} onClick={() => navigate(`/customer/bookings/${booking.id}`)}
                    className="card w-full p-4 flex items-center gap-3 hover:shadow-md transition-shadow text-left">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: (svc?.color || '#2563EB') + '20' }}>
                      <ServiceIcon name={svc?.icon || 'Settings'} size={18} style={{ color: svc?.color || '#2563EB' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-medium text-primary text-sm">{svc?.name}</p>
                      <p className="font-body text-xs text-muted">
                        {booking.completedAt ? format(new Date(booking.completedAt), 'd MMM yyyy') : ''}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} size="xs" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Service detail modal */}
      <Modal isOpen={!!serviceDetail} onClose={() => setServiceDetail(null)} title={serviceDetail?.name}>
        {serviceDetail && (
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: serviceDetail.color + '20' }}>
                <ServiceIcon name={serviceDetail.icon} size={28} style={{ color: serviceDetail.color }} />
              </div>
              <div>
                <p className="font-display font-bold text-2xl text-brand-blue">&#x20B9;{serviceDetail.price}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-secondary font-body">
                  <span>{serviceDetail.durationMinutes} min</span>
                  <span>·</span>
                  <span>{serviceDetail.category}</span>
                  <span>·</span>
                  <div className="flex items-center gap-0.5">
                    <StarRating rating={serviceDetail.rating} size={11} />
                    <span className="ml-0.5">{serviceDetail.rating}</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-secondary font-body leading-relaxed">{serviceDetail.description}</p>
            {serviceDetail.features?.length > 0 && (
              <div>
                <p className="text-xs text-muted font-body uppercase tracking-wide font-medium mb-2">Includes</p>
                <div className="flex flex-wrap gap-2">
                  {serviceDetail.features.map(f => (
                    <span key={f} className="px-3 py-1 bg-bg rounded-full text-xs font-body text-secondary border border-border">{f}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button onClick={() => setServiceDetail(null)} className="btn-secondary flex-1">Close</button>
              <button
                onClick={() => { setServiceDetail(null); navigate('/customer/book', { state: { serviceId: serviceDetail.id } }); }}
                className="btn-primary flex-1">
                Book Now
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
