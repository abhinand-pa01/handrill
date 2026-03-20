import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Phone, MapPin, Clock, CreditCard, Play, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import TopBar from '../../components/TopBar';
import StatusBadge from '../../components/ui/StatusBadge';
import Timeline from '../../components/ui/Timeline';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import ServiceIcon from '../../components/ui/ServiceIcon';

export default function WorkerJobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookings, services, customers, updateBookingStatus } = useApp();
  const [confirmModal, setConfirmModal] = useState(null); // 'start' | 'complete'

  const booking = bookings.find(b => String(b.id) === String(id));
  if (!booking) return (
    <div className="min-h-screen bg-bg"><TopBar title="Job" showBack />
      <div className="max-w-2xl mx-auto px-4 py-12 text-center"><p className="text-secondary font-body">Job not found.</p></div>
    </div>
  );

  const svc = services.find(s => String(s.id) === String(booking.serviceId));
  const customer = customers.find(c => String(c.id) === String(booking.customerId));
  const canStart = booking.status === 'ASSIGNED';
  const canComplete = booking.status === 'INPROGRESS';

  function handleAction(action) {
    if (action === 'start') { updateBookingStatus(booking.id, 'INPROGRESS', user.id); }
    if (action === 'complete') { updateBookingStatus(booking.id, 'COMPLETED', user.id); }
    setConfirmModal(null);
    if (action === 'complete') navigate('/worker/jobs');
  }

  return (
    <div className="min-h-screen bg-bg">
      <TopBar title="Job Details" showBack />
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Service header */}
        <div className="card p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{backgroundColor:(svc?.color||'#2563EB')+'20'}}>
              <ServiceIcon name={svc?.icon||'Settings'} size={22} style={{color:svc?.color||'#2563EB'}} />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display font-bold text-primary text-lg">{svc?.name}</h2>
                  <p className="text-xs text-muted font-body">#{booking.id.toUpperCase()}</p>
                </div>
                <StatusBadge status={booking.status} pulse />
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-bg rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1"><Clock size={13} className="text-muted" /><span className="text-xs text-muted font-body uppercase tracking-wide">Scheduled</span></div>
              <p className="text-sm font-semibold text-primary font-body">{booking.scheduledAt ? format(new Date(booking.scheduledAt),'MMM d, h:mm a') : 'TBD'}</p>
            </div>
            <div className="bg-bg rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1"><CreditCard size={13} className="text-muted" /><span className="text-xs text-muted font-body uppercase tracking-wide">Amount</span></div>
              <p className="text-sm font-semibold text-primary font-body">₹{booking.amount}</p>
            </div>
          </div>
          {booking.serviceAddress && (
            <div className="mt-3 flex items-start gap-2 bg-bg rounded-xl p-3">
              <MapPin size={14} className="text-muted mt-0.5 flex-shrink-0" />
              <p className="text-xs text-secondary font-body leading-relaxed">{booking.serviceAddress}</p>
            </div>
          )}
          {booking.notes && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-xs text-amber-700 font-body"><span className="font-semibold">Customer note: </span>{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Customer card */}
        {customer && (
          <div className="card p-4">
            <h3 className="section-title mb-3">Customer</h3>
            <div className="flex items-center gap-3">
              <Avatar name={customer.name} size="md" />
              <div className="flex-1">
                <p className="font-body font-semibold text-primary">{customer.name}</p>
                <p className="text-xs text-secondary font-body mt-0.5">{customer.phone}</p>
              </div>
              <a href={`tel:${customer.phone}`} className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center hover:bg-blue-700 transition-colors">
                <Phone size={16} className="text-white" />
              </a>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="card p-4">
          <h3 className="section-title mb-4">Progress</h3>
          <Timeline booking={booking} />
        </div>

        {/* Actions */}
        <div className="space-y-2 pb-4">
          {canStart && (
            <button onClick={() => setConfirmModal('start')} className="btn-teal w-full flex items-center justify-center gap-2">
              <Play size={16} />Start Job
            </button>
          )}
          {canComplete && (
            <button onClick={() => setConfirmModal('complete')} className="btn-primary w-full flex items-center justify-center gap-2">
              <CheckCircle size={16} />Mark as Completed
            </button>
          )}
          <button onClick={() => navigate('/worker/jobs')} className="btn-secondary w-full">Back to Jobs</button>
        </div>
      </div>

      <Modal isOpen={!!confirmModal} onClose={() => setConfirmModal(null)} title={confirmModal === 'start' ? 'Start Job?' : 'Complete Job?'}>
        <div className="p-5 space-y-4">
          <p className="text-sm text-secondary font-body">
            {confirmModal === 'start'
              ? 'Confirm that you have arrived at the location and are starting the job.'
              : 'Confirm that the job has been fully completed to the customer\'s satisfaction.'}
          </p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmModal(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={() => handleAction(confirmModal)} className={`flex-1 ${confirmModal === 'complete' ? 'btn-primary' : 'btn-teal'}`}>
              {confirmModal === 'start' ? 'Start Job' : 'Complete Job'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
