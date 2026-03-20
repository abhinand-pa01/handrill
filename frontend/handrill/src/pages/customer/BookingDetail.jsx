import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { MapPin, Clock, CreditCard, Star, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import TopBar from '../../components/TopBar';
import StatusBadge from '../../components/ui/StatusBadge';
import Timeline from '../../components/ui/Timeline';
import WorkerAssignedCard from '../../components/WorkerAssignedCard';
import StarRating from '../../components/ui/StarRating';
import Modal from '../../components/ui/Modal';
import ServiceIcon from '../../components/ui/ServiceIcon';

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookings, services, cancelBooking, submitReview, getWorkerById, getReviewForBooking } = useApp();

  const [reviewModal, setReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [cancelModal, setCancelModal] = useState(false);

  const booking = bookings.find(b => String(b.id) === String(id));
  if (!booking) return (
    <div className="min-h-screen bg-bg">
      <TopBar title="Booking" showBack />
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-secondary font-body">Booking not found.</p>
      </div>
    </div>
  );

  const service = services.find(s => String(s.id) === String(booking.serviceId));
  const worker = booking.workerId ? getWorkerById(booking.workerId) : null;
  const existingReview = getReviewForBooking(booking.id);
  const canCancel = ['PENDING', 'ASSIGNED'].includes(booking.status);
  const canReview = booking.status === 'COMPLETED' && !booking.reviewed;

  function handleCancelConfirm() {
    cancelBooking(booking.id);
    setCancelModal(false);
  }

  function handleSubmitReview() {
    submitReview(booking.id, user.id, booking.workerId, rating, comment);
    setReviewModal(false);
  }

  return (
    <div className="min-h-screen bg-bg">
      <TopBar title="Booking Details" showBack />

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Service header card */}
        <div className="card p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: (service?.color || '#2563EB') + '20' }}>
              <ServiceIcon name={service?.icon || 'Settings'} size={22} style={{ color: service?.color || '#2563EB' }} />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display font-bold text-primary text-lg">{service?.name}</h2>
                  <p className="text-xs text-muted font-body">#{booking.id.toUpperCase()}</p>
                </div>
                <StatusBadge status={booking.status} pulse />
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-bg rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock size={13} className="text-muted" />
                <span className="text-xs text-muted font-body uppercase tracking-wide">Scheduled</span>
              </div>
              <p className="text-sm font-semibold text-primary font-body">
                {booking.scheduledAt ? format(new Date(booking.scheduledAt), 'MMM d, h:mm a') : 'TBD'}
              </p>
            </div>
            <div className="bg-bg rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <CreditCard size={13} className="text-muted" />
                <span className="text-xs text-muted font-body uppercase tracking-wide">Amount</span>
              </div>
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
              <p className="text-xs text-amber-700 font-body"><span className="font-semibold">Notes: </span>{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Worker card */}
        {worker && ['ASSIGNED', 'INPROGRESS', 'COMPLETED'].includes(booking.status) && (
          <div>
            <h3 className="section-title mb-2">Assigned Worker</h3>
            <WorkerAssignedCard worker={worker} booking={booking} />
          </div>
        )}

        {/* Timeline */}
        <div className="card p-4">
          <h3 className="section-title mb-4">Progress</h3>
          <Timeline booking={booking} />
        </div>

        {/* Review (if completed) */}
        {existingReview && (
          <div className="card p-4">
            <h3 className="section-title mb-3">Your Review</h3>
            <StarRating rating={existingReview.rating} size={18} />
            {existingReview.comment && (
              <p className="text-sm text-secondary font-body mt-2 italic">"{existingReview.comment}"</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 pb-4">
          {canReview && (
            <button onClick={() => setReviewModal(true)} className="btn-primary w-full flex items-center justify-center gap-2">
              <Star size={16} />
              Rate this Service
            </button>
          )}
          {canCancel && (
            <button onClick={() => setCancelModal(true)} className="btn-danger w-full">
              Cancel Booking
            </button>
          )}
          <button onClick={() => navigate('/customer/bookings')} className="btn-secondary w-full">
            Back to Bookings
          </button>
        </div>
      </div>

      {/* Review Modal */}
      <Modal isOpen={reviewModal} onClose={() => setReviewModal(false)} title="Rate Your Experience">
        <div className="p-5 space-y-4">
          <p className="text-sm text-secondary font-body">How was your experience with {worker?.name || 'the worker'}?</p>
          <div className="flex justify-center">
            <StarRating rating={rating} interactive onChange={setRating} size={36} />
          </div>
          <div>
            <label className="label">Comments (optional)</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Share details about your experience..."
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
          </div>
          <button onClick={handleSubmitReview} className="btn-primary w-full">Submit Review</button>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal isOpen={cancelModal} onClose={() => setCancelModal(false)} title="Cancel Booking">
        <div className="p-5 space-y-4">
          <p className="text-sm text-secondary font-body">Are you sure you want to cancel this booking? This action cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => setCancelModal(false)} className="btn-secondary flex-1">Keep Booking</button>
            <button onClick={handleCancelConfirm} className="btn-danger flex-1">Yes, Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
