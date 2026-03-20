import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

const STORAGE_KEY = 'handrill_disclaimer_accepted';

export function hasAcceptedDisclaimer() {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function markDisclaimerAccepted() {
  localStorage.setItem(STORAGE_KEY, 'true');
}

export default function DisclaimerModal({ isOpen, onAccept }) {
  const [checked, setChecked] = useState(false);

  if (!isOpen) return null;

  function handleAccept() {
    if (!checked) return;
    markDisclaimerAccepted();
    onAccept();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Sheet */}
      <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-modal z-10 animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header strip */}
        <div className="gradient-header px-6 pt-6 pb-6 rounded-t-2xl sm:rounded-t-2xl text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <p className="text-blue-200 text-xs font-body font-medium uppercase tracking-wide">Before you continue</p>
              <h2 className="font-display font-bold text-xl leading-tight">Educational Demo</h2>
            </div>
          </div>
          <p className="text-blue-100 text-sm font-body leading-relaxed">
            Handrill is a demonstration project built for educational and portfolio purposes only.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Points */}
          <div className="space-y-3">
            {[
              { title: 'No real money',       body: 'All payments, amounts, and transactions shown are entirely fictitious. No real money is involved at any point.' },
              { title: 'No real services',    body: 'Bookings, workers, and services are simulated. No actual home services are provided through this platform.' },
              { title: 'No real data',        body: 'All user accounts, worker profiles, reviews, and booking records are demo data created for illustration only.' },
              { title: 'Not a real business', body: 'Handrill does not operate as a business, does not have real customers, and does not represent any actual company.' },
            ].map(item => (
              <div key={item.title} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-blue mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-primary font-body">{item.title}</p>
                  <p className="text-xs text-secondary font-body leading-relaxed mt-0.5">{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer select-none group">
            <div
              onClick={() => setChecked(p => !p)}
              className={`
                w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-all
                ${checked ? 'bg-brand-blue border-brand-blue' : 'border-slate-300 group-hover:border-brand-blue'}
              `}
            >
              {checked && (
                <svg viewBox="0 0 12 10" fill="none" className="w-3 h-2.5">
                  <path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-sm text-primary font-body leading-relaxed" onClick={() => setChecked(p => !p)}>
              I understand this is a demo and educational project. No real money, services, or personal data are involved.
            </span>
          </label>

          {/* CTA */}
          <button
            onClick={handleAccept}
            disabled={!checked}
            className={`w-full py-3.5 rounded-xl font-body font-semibold text-sm transition-all ${
              checked
                ? 'bg-brand-blue text-white hover:bg-blue-700 active:scale-[0.98]'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            I Understand — Continue to Handrill
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 250ms ease-out; }
      `}</style>
    </div>
  );
}
