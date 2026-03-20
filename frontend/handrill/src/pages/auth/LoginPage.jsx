import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DisclaimerModal, { hasAcceptedDisclaimer } from '../../components/DisclaimerModal';

const DEMO_ACCOUNTS = [
  { label: 'Customer', email: 'customer@handrill.com', color: 'bg-blue-50 text-brand-blue border-blue-200' },
  { label: 'Worker',   email: 'worker@handrill.com',   color: 'bg-teal-50 text-brand-teal border-teal-200' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [pendingUser, setPendingUser] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  function handleDemoSelect(email) {
    setForm({ email, password: 'demo123' });
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill all fields'); return; }
    setLoading(true); setError('');
    try {
      const { user } = await login(form.email, form.password);
      // If disclaimer not yet accepted, show it before navigating
      if (!hasAcceptedDisclaimer()) {
        setPendingUser(user);
        setShowDisclaimer(true);
        setLoading(false);
        return;
      }
      redirectUser(user);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function redirectUser(user) {
    const path = user.role === 'CUSTOMER' ? '/customer'
               : user.role === 'WORKER'   ? '/worker'
               : '/admin';
    navigate(path, { replace: true });
  }

  function handleDisclaimerAccept() {
    setShowDisclaimer(false);
    if (pendingUser) redirectUser(pendingUser);
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Disclaimer modal — shown first time */}
      <DisclaimerModal isOpen={showDisclaimer} onAccept={handleDisclaimerAccept} />

      {/* Hero */}
      <div className="gradient-header px-6 pt-16 pb-12 text-white">
        <div className="max-w-2xl mx-auto">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
            <LogIn size={24} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl mb-1">Welcome back</h1>
          <p className="text-blue-100 text-sm font-body">Sign in to your Handrill account</p>
        </div>
      </div>

      <div className="flex-1 px-4 -mt-6">
        <div className="max-w-2xl mx-auto">
          <div className="card p-5">
            {/* Demo quick-select — Customer + Worker only */}
            <div className="mb-5">
              <p className="text-xs text-muted font-body uppercase tracking-wide mb-2 font-medium">
                Quick Demo Login
              </p>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map(acc => (
                  <button key={acc.email} type="button" onClick={() => handleDemoSelect(acc.email)}
                    className={`px-3 py-2 rounded-xl border text-sm font-medium font-body transition-all active:scale-95 ${acc.color}`}>
                    {acc.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted font-body mt-2">
                Admin access requires manual credentials entry.
              </p>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted font-body">or sign in manually</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-600 font-body">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <input type="email" className="input-field" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} autoComplete="email" />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} className="input-field pr-11"
                    placeholder="Enter your password"
                    value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary transition-colors">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : <LogIn size={16} />}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Demo notice — subtle */}
          <div className="mt-3 px-4 py-2.5 bg-brand-dark/8 rounded-xl border border-border">
            <p className="text-xs text-center text-secondary font-body">
              This is a <span className="font-semibold text-brand-blue">demo project</span> for educational purposes.
              No real money or services are involved.
            </p>
          </div>

          <p className="text-center text-sm text-secondary font-body mt-4 pb-8">
            New to Handrill?{' '}
            <Link to="/register" className="text-brand-blue font-medium hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
