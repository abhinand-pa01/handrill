import { Phone, MapPin, Clock, BadgeCheck, Star, Navigation } from 'lucide-react';
import Avatar from './ui/Avatar';
import { format } from 'date-fns';

export default function WorkerAssignedCard({ worker, booking, compact = false }) {
  if (!worker) return null;
  const { profile } = worker;

  if (compact) {
    return (
      <div className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">
        <Avatar name={worker.name} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary font-body truncate">{worker.name}</p>
          <p className="text-xs text-secondary font-body">
            Arriving {booking?.scheduledAt ? format(new Date(booking.scheduledAt), 'h:mm a, MMM d') : 'soon'}
          </p>
        </div>
        <a
          href={`tel:${profile.phone || worker.phone}`}
          className="w-9 h-9 rounded-full bg-brand-blue flex items-center justify-center flex-shrink-0"
        >
          <Phone size={15} className="text-white" />
        </a>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3 mb-4">
        <Avatar name={worker.name} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-display font-semibold text-primary">{worker.name}</h3>
            {profile.idProof && (
              <BadgeCheck size={16} className="text-brand-blue flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <Star size={13} className="text-amber-400" fill="#FBBF24" />
            <span className="text-sm font-semibold text-primary font-body">{profile.averageRating}</span>
            <span className="text-xs text-muted font-body">({profile.totalJobsCompleted} jobs)</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <MapPin size={12} className="text-muted" />
            <span className="text-xs text-secondary font-body">{profile.location}</span>
            <span className="text-xs text-muted font-body mx-1">·</span>
            <span className="text-xs text-secondary font-body">{profile.experience} yrs exp</span>
          </div>
        </div>
        <a
          href={`tel:${worker.phone}`}
          className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center flex-shrink-0 hover:bg-blue-700 transition-colors"
        >
          <Phone size={16} className="text-white" />
        </a>
      </div>

      {booking?.scheduledAt && (
        <div className="bg-blue-50 rounded-xl p-3 flex items-center gap-3 border border-blue-100">
          <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center flex-shrink-0">
            <Clock size={15} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-secondary font-body uppercase tracking-wide font-medium">Expected Arrival</p>
            <p className="text-sm font-semibold text-primary font-body">
              {format(new Date(booking.scheduledAt), 'h:mm a, EEEE MMM d')}
            </p>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <div className="flex items-center gap-1 px-2.5 py-1 bg-bg rounded-lg">
          <Navigation size={11} className="text-secondary" />
          <span className="text-xs text-secondary font-body">{profile.languages?.split(',')[0]?.trim()}</span>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 bg-bg rounded-lg">
          <span className="text-xs text-secondary font-body">ID: {profile.idProof ? 'Verified' : 'Unverified'}</span>
        </div>
      </div>
    </div>
  );
}
