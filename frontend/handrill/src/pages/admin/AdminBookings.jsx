import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '../../context/AppContext';
import TopBar from '../../components/TopBar';
import StatusBadge from '../../components/ui/StatusBadge';
import ServiceIcon from '../../components/ui/ServiceIcon';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';

const STATUSES = ['All','PENDING','ASSIGNED','INPROGRESS','COMPLETED','CANCELLED'];

export default function AdminBookings() {
  const { bookings, services, workers, customers, overrideAssignment, cancelBooking } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [assignModal, setAssignModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState('');

  const filtered = bookings
    .filter(b => {
      const svc = services.find(s => String(s.id) === String(b.serviceId));
      const customer = customers.find(c => String(c.id) === String(b.customerId));
      const matchSearch = !search ||
        svc?.name.toLowerCase().includes(search.toLowerCase()) ||
        customer?.name.toLowerCase().includes(search.toLowerCase()) ||
        b.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || b.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  function handleAssign() {
    if (selectedBooking && selectedWorker) {
      overrideAssignment(selectedBooking.id, selectedWorker);
      setAssignModal(false);
      setSelectedBooking(null);
    }
  }

  const eligibleWorkers = selectedBooking
    ? workers.filter(w => w.profile.specializations.includes(selectedBooking.serviceId))
    : workers;

  return (
    <div className="min-h-screen bg-bg">
      <TopBar title="All Bookings" />

      {/* Search + filter */}
      <div className="bg-white border-b border-border sticky top-14 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 space-y-2">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input type="text" placeholder="Search bookings, customers..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10 text-sm" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"><X size={14} /></button>}
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium font-body transition-all ${statusFilter===s ? 'bg-brand-blue text-white' : 'bg-bg text-secondary hover:bg-slate-100'}`}>
                {s === 'All' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        <p className="text-xs text-muted font-body">{filtered.length} booking{filtered.length !== 1 ? 's' : ''} found</p>
        {filtered.map(booking => {
          const svc = services.find(s => String(s.id) === String(booking.serviceId));
          const customer = customers.find(c => String(c.id) === String(booking.customerId));
          const worker = workers.find(w => String(w.id) === String(booking.workerId));
          return (
            <div key={booking.id} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{backgroundColor:(svc?.color||'#2563EB')+'20'}}>
                  <ServiceIcon name={svc?.icon||'Settings'} size={18} style={{color:svc?.color||'#2563EB'}} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display font-semibold text-primary text-sm">{svc?.name}</p>
                      <p className="text-xs text-muted font-body">#{booking.id.toUpperCase()}</p>
                    </div>
                    <StatusBadge status={booking.status} size="xs" />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar name={customer?.name} size="xs" />
                    <p className="text-xs text-secondary font-body">{customer?.name}</p>
                    <span className="text-muted text-xs">·</span>
                    <p className="font-display font-bold text-brand-blue text-xs">₹{booking.amount}</p>
                  </div>
                  {worker && (
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar name={worker.name} size="xs" />
                      <p className="text-xs text-secondary font-body">{worker.name}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted font-body mt-1">
                    {booking.scheduledAt ? format(new Date(booking.scheduledAt),'EEE, MMM d · h:mm a') : 'Not scheduled'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                {['PENDING','ASSIGNED'].includes(booking.status) && (
                  <button onClick={() => { setSelectedBooking(booking); setSelectedWorker(booking.workerId||''); setAssignModal(true); }}
                    className="flex-1 px-3 py-2 bg-brand-blue text-white rounded-lg text-xs font-semibold font-body hover:bg-blue-700 transition-colors">
                    {booking.workerId ? 'Reassign' : 'Assign Worker'}
                  </button>
                )}
                {!['COMPLETED','CANCELLED'].includes(booking.status) && (
                  <button onClick={() => cancelBooking(booking.id)}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-semibold font-body hover:bg-red-100 transition-colors border border-red-100">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={assignModal} onClose={() => setAssignModal(false)} title="Assign Worker">
        <div className="p-5 space-y-4">
          <p className="text-sm text-secondary font-body">Select a worker for booking #{selectedBooking?.id?.toUpperCase()}</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {eligibleWorkers.map(w => (
              <button key={w.id} onClick={() => setSelectedWorker(w.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${selectedWorker===w.id ? 'border-brand-blue bg-blue-50' : 'border-border hover:border-slate-300'}`}>
                <Avatar name={w.name} size="sm" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-primary font-body">{w.name}</p>
                  <p className="text-xs text-secondary font-body">{w.profile.activeJobCount} active · {w.profile.averageRating} rating · {w.profile.online ? 'Online' : 'Offline'}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${selectedWorker===w.id ? 'bg-brand-blue border-brand-blue' : 'border-slate-300'}`} />
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setAssignModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleAssign} disabled={!selectedWorker} className="btn-primary flex-1">Assign</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
