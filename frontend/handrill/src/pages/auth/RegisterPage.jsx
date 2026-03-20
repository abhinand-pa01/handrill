import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { KERALA_CITIES } from '../../data/mockData';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: 'Thrissur', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(field) { return e => setForm(p => ({ ...p, [field]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError('Please fill all required fields'); return;
    }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }

    setLoading(true); setError('');
    try {
      const fullAddress = `${form.address}, ${form.city}, Kerala`;
      await register({ name: form.name, email: form.email, phone: form.phone, address: fullAddress, password: form.password });
      navigate('/customer', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="gradient-header px-6 pt-16 pb-12 text-white">
        <div className="max-w-2xl mx-auto">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
            <UserPlus size={24} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-3xl mb-1">Create account</h1>
          <p className="text-blue-100 text-sm font-body">Join thousands of Kerala homeowners</p>
        </div>
      </div>

      <div className="flex-1 px-4 -mt-6 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="card p-5">
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-600 font-body">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name <span className="text-red-400">*</span></label>
                <input type="text" className="input-field" placeholder="Arjun Pillai" value={form.name} onChange={set('name')} />
              </div>

              <div>
                <label className="label">Email Address <span className="text-red-400">*</span></label>
                <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={set('email')} />
              </div>

              <div>
                <label className="label">Phone Number <span className="text-red-400">*</span></label>
                <input type="tel" className="input-field" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} />
              </div>

              <div>
                <label className="label">Street Address</label>
                <input type="text" className="input-field" placeholder="45 MG Road, Near Temple" value={form.address} onChange={set('address')} />
              </div>

              <div>
                <label className="label">City</label>
                <select className="input-field" value={form.city} onChange={set('city')}>
                  {KERALA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Password <span className="text-red-400">*</span></label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input-field pr-11"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={set('password')}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Confirm Password <span className="text-red-400">*</span></label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Repeat password"
                  value={form.confirm}
                  onChange={set('confirm')}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                {loading ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : <UserPlus size={16} />}
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-secondary font-body mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-blue font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
