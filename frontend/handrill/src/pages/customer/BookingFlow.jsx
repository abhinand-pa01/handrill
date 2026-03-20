import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, ChevronLeft, ChevronRight, Clock, MapPin, Calendar, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getAssignmentPreview } from '../../data/assignmentEngine';
import ServiceIcon from '../../components/ui/ServiceIcon';
import Avatar from '../../components/ui/Avatar';
import TopBar from '../../components/TopBar';
import { TIME_SLOTS, KERALA_CITIES } from '../../data/mockData';

const STEPS = ['Service', 'Details', 'Schedule', 'Confirm'];

export default function BookingFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { services, workers, createBooking } = useApp();

  const [step, setStep] = useState(location.state?.serviceId ? 1 : 0);
  const [selectedService, setSelectedService] = useState(
    location.state?.serviceId ? services.find(s => String(s.id) === String(location.state.serviceId)) : null
  );
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState('Thrissur');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const preview = selectedService ? getAssignmentPreview(selectedService, workers) : null;

  function getTomorrow() {
    const t = new Date(); t.setDate(t.getDate() + 1); return t.toISOString().split('T')[0];
  }
  function getMaxDate() {
    const t = new Date(); t.setDate(t.getDate() + 30); return t.toISOString().split('T')[0];
  }

  function canProceed() {
    if (step === 0) return !!selectedService;
    if (step === 1) return address.trim().length > 5;
    if (step === 2) return date && timeSlot;
    return true;
  }

  function handleConfirm() {
    setSubmitting(true);
    const scheduledAt = new Date(`${date}T${timeSlot.includes('AM') || timeSlot.includes('PM')
      ? (timeSlot.includes('12:') ? '12' : timeSlot.split(':')[0].padStart(2, '0')) + ':00'
      : '10:00'}`);
    const booking = createBooking({
      serviceId: selectedService.id,
      serviceAddress: `${address}, ${city}, Kerala`,
      notes,
      scheduledAt,
    }, user);
    setTimeout(() => {
      setSubmitting(false);
      navigate(`/customer/bookings/${booking.id}`, { replace: true });
    }, 800);
  }

  return (
    <div className="min-h-screen bg-bg">
      <TopBar title="Book a Service" showBack />

      {/* Step indicator */}
      <div className="bg-white border-b border-border sticky top-14 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-brand-blue text-white' : 'bg-slate-100 text-muted'
                  }`}>
                    {i < step ? <Check size={13} /> : i + 1}
                  </div>
                  <span className={`text-[10px] mt-0.5 font-body font-medium ${i === step ? 'text-brand-blue' : 'text-muted'}`}>{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < step ? 'bg-emerald-400' : 'bg-slate-100'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {/* Step 0: Service selection */}
        {step === 0 && (
          <div className="space-y-3">
            <h2 className="section-title mb-4">Choose a Service</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {services.filter(s => s.active).map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedService(s)}
                  className={`card p-4 text-left transition-all active:scale-95 ${
                    String(selectedService?.id) === String(s.id) ? 'ring-2 ring-brand-blue shadow-md' : 'hover:shadow-md'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: s.color + '20' }}>
                    <ServiceIcon name={s.icon} size={20} style={{ color: s.color }} />
                  </div>
                  <p className="font-display font-semibold text-primary text-sm">{s.name}</p>
                  <p className="font-display font-bold text-brand-blue text-sm mt-1">₹{s.price}</p>
                  {String(selectedService?.id) === String(s.id) && (
                    <div className="mt-2 flex items-center gap-1">
                      <Check size={12} className="text-brand-blue" />
                      <span className="text-xs text-brand-blue font-body font-medium">Selected</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Details */}
        {step === 1 && selectedService && (
          <div className="space-y-4">
            <div className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: selectedService.color + '20' }}>
                <ServiceIcon name={selectedService.icon} size={18} style={{ color: selectedService.color }} />
              </div>
              <div>
                <p className="font-display font-semibold text-primary">{selectedService.name}</p>
                <p className="text-xs text-muted font-body">{selectedService.durationMinutes} min · ₹{selectedService.price}</p>
              </div>
            </div>

            <div>
              <label className="label">Service Address <span className="text-red-400">*</span></label>
              <textarea
                className="input-field resize-none"
                rows={2}
                placeholder="Enter your full address"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>

            <div>
              <label className="label">City</label>
              <select className="input-field" value={city} onChange={e => setCity(e.target.value)}>
                {KERALA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Notes for Worker (optional)</label>
              <textarea
                className="input-field resize-none"
                rows={2}
                placeholder="Any specific instructions or issues to mention..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {preview && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-brand-blue font-body uppercase tracking-wide mb-2">
                  Auto-Assignment Preview
                </p>
                {preview.worker ? (
                  <div className="flex items-center gap-3">
                    <Avatar name={preview.worker.name} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-primary font-body">{preview.worker.name}</p>
                      <p className="text-xs text-secondary font-body">
                        Rating {preview.worker.profile.averageRating} · {preview.availableCount} worker{preview.availableCount !== 1 ? 's' : ''} available
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-secondary font-body">No workers available right now. Your booking will be queued.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Schedule */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="section-title">Pick Date & Time</h2>
            <div>
              <label className="label">Date <span className="text-red-400">*</span></label>
              <input
                type="date"
                className="input-field"
                min={getTomorrow()}
                max={getMaxDate()}
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Time Slot <span className="text-red-400">*</span></label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {TIME_SLOTS.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setTimeSlot(slot)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium font-body border transition-all ${
                      timeSlot === slot
                        ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                        : 'bg-white text-secondary border-border hover:border-brand-blue hover:text-brand-blue'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && selectedService && (
          <div className="space-y-4">
            <h2 className="section-title">Confirm Booking</h2>
            <div className="card divide-y divide-border">
              <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: selectedService.color + '20' }}>
                  <ServiceIcon name={selectedService.icon} size={18} style={{ color: selectedService.color }} />
                </div>
                <div>
                  <p className="font-display font-semibold text-primary">{selectedService.name}</p>
                  <p className="text-xs text-muted font-body">{selectedService.durationMinutes} min service</p>
                </div>
              </div>
              <div className="p-4 flex items-start gap-3">
                <MapPin size={16} className="text-muted mt-0.5 flex-shrink-0" />
                <p className="text-sm text-secondary font-body">{address}, {city}, Kerala</p>
              </div>
              <div className="p-4 flex items-center gap-3">
                <Calendar size={16} className="text-muted flex-shrink-0" />
                <p className="text-sm text-secondary font-body">{date ? new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }) : ''} at {timeSlot}</p>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard size={16} className="text-muted" />
                  <p className="text-sm text-secondary font-body">Total Amount</p>
                </div>
                <p className="font-display font-bold text-brand-blue text-lg">₹{selectedService.price}</p>
              </div>
            </div>

            {preview?.worker && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <p className="text-xs text-emerald-700 font-semibold font-body mb-1">Worker will be auto-assigned</p>
                <p className="text-xs text-emerald-600 font-body">Best available worker will be assigned upon confirmation.</p>
              </div>
            )}
            <div className="bg-brand-dark/6 border border-border rounded-xl px-4 py-2.5">
              <p className="text-xs text-center text-secondary font-body">
                <span className="font-semibold text-brand-blue">Demo only</span> — no real payment is processed
              </p>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex items-center gap-1">
              <ChevronLeft size={16} />Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="btn-primary flex-1 flex items-center justify-center gap-1"
            >
              Next<ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="btn-teal flex-1 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : <Check size={16} />}
              {submitting ? 'Confirming...' : 'Confirm & Pay'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
