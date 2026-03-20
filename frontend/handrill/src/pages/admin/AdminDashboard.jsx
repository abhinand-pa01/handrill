import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, TrendingUp, IndianRupee, ChevronRight, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import TopBar from '../../components/TopBar';
import StatusBadge from '../../components/ui/StatusBadge';
import ServiceIcon from '../../components/ui/ServiceIcon';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  format, subDays, subWeeks, subMonths,
  startOfWeek, endOfWeek, eachDayOfInterval,
  eachWeekOfInterval, eachMonthOfInterval,
  startOfMonth, endOfMonth, isWithinInterval,
} from 'date-fns';

const PERIOD_OPTIONS = [
  { key: 'weekly',  label: 'Weekly',  desc: 'Last 7 days by day' },
  { key: 'monthly', label: 'Monthly', desc: 'Last 6 months' },
  { key: 'total',   label: 'All Time', desc: 'Cumulative total' },
];

const PIE_COLORS = ['#2563EB','#F59E0B','#14B8A6','#8B5CF6','#D97706','#EC4899','#EF4444','#10B981'];

function PeriodSelector({ value, onChange }) {
  return (
    <div className="flex bg-bg rounded-xl p-1 gap-0.5">
      {PERIOD_OPTIONS.map(opt => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold font-body transition-all ${
            value === opt.key
              ? 'bg-white text-brand-blue shadow-sm'
              : 'text-secondary hover:text-primary'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, bg, trend, trendLabel }) {
  const isUp = trend > 0;
  return (
    <div className="card p-4">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
        <Icon size={18} className={color} />
      </div>
      <p className={`font-display font-bold text-xl ${color}`}>{value}</p>
      <p className="text-xs text-muted font-body mt-0.5">{label}</p>
      {trendLabel && (
        <div className={`flex items-center gap-0.5 mt-1 text-xs font-body font-medium ${isUp ? 'text-emerald-600' : 'text-red-500'}`}>
          {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trendLabel}
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl shadow-modal px-4 py-3 text-xs font-body">
      <p className="font-semibold text-primary mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-secondary">{p.name}:</span>
          <span className="font-semibold text-primary">
            {p.name === 'Revenue' ? '₹' + Number(p.value).toLocaleString('en-IN') : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookings, workers, customers, services } = useApp();
  const [period, setPeriod] = useState('monthly');

  const now = new Date();

  // --- Build chart data based on selected period ---
  const chartData = useMemo(() => {
    if (period === 'weekly') {
      const days = eachDayOfInterval({ start: subDays(now, 6), end: now });
      return days.map(day => {
        const dayStr = format(day, 'EEE');
        const dayBookings = bookings.filter(b => {
          const bd = new Date(b.createdAt);
          return format(bd, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
        });
        return {
          label: dayStr,
          Bookings: dayBookings.length,
          Completed: dayBookings.filter(b => b.status === 'COMPLETED').length,
          Revenue: dayBookings.filter(b => b.status === 'COMPLETED').reduce((s, b) => s + (b.amount || 0), 0),
        };
      });
    }

    if (period === 'monthly') {
      return Array.from({ length: 6 }, (_, i) => {
        const d = subMonths(now, 5 - i);
        const m = d.getMonth(); const y = d.getFullYear();
        const mb = bookings.filter(b => {
          const bd = new Date(b.createdAt);
          return bd.getMonth() === m && bd.getFullYear() === y;
        });
        return {
          label: format(d, 'MMM'),
          Bookings: mb.length,
          Completed: mb.filter(b => b.status === 'COMPLETED').length,
          Revenue: mb.filter(b => b.status === 'COMPLETED').reduce((s, b) => s + (b.amount || 0), 0),
        };
      });
    }

    // total — by month since earliest booking
    const allSorted = [...bookings].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (allSorted.length === 0) return [];
    const earliest = new Date(allSorted[0].createdAt);
    const months = eachMonthOfInterval({ start: startOfMonth(earliest), end: startOfMonth(now) });
    return months.map(mo => {
      const mb = bookings.filter(b => {
        const bd = new Date(b.createdAt);
        return bd.getMonth() === mo.getMonth() && bd.getFullYear() === mo.getFullYear();
      });
      return {
        label: format(mo, 'MMM yy'),
        Bookings: mb.length,
        Completed: mb.filter(b => b.status === 'COMPLETED').length,
        Revenue: mb.filter(b => b.status === 'COMPLETED').reduce((s, b) => s + (b.amount || 0), 0),
      };
    });
  }, [period, bookings]);

  // --- Summary stats for current period ---
  const periodStats = useMemo(() => {
    let filtered;
    if (period === 'weekly') {
      const cutoff = subDays(now, 6);
      filtered = bookings.filter(b => new Date(b.createdAt) >= cutoff);
    } else if (period === 'monthly') {
      const cutoff = subMonths(now, 1);
      filtered = bookings.filter(b => new Date(b.createdAt) >= cutoff);
    } else {
      filtered = bookings;
    }
    const revenue = filtered.filter(b => b.status === 'COMPLETED').reduce((s, b) => s + (b.amount || 0), 0);
    return {
      bookings: filtered.length,
      completed: filtered.filter(b => b.status === 'COMPLETED').length,
      revenue,
      pending: filtered.filter(b => b.status === 'PENDING').length,
    };
  }, [period, bookings]);

  const totalRevenue = bookings.filter(b => b.status === 'COMPLETED').reduce((s, b) => s + (b.amount || 0), 0);
  const activeWorkers = workers.filter(w => w.profile.online).length;

  const serviceDemand = services.map(s => ({
    name: s.name.length > 10 ? s.name.slice(0, 9) + '…' : s.name,
    value: bookings.filter(b => b.serviceId === s.id).length,
  })).filter(s => s.value > 0).sort((a, b) => b.value - a.value);

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const periodLabel = PERIOD_OPTIONS.find(p => p.key === period)?.desc;

  return (
    <div className="min-h-screen bg-bg">
      <div className="gradient-header px-4 pt-10 pb-6 text-white">
        <div className="max-w-2xl mx-auto">
          <p className="text-blue-200 text-xs font-body mb-1">Admin Panel</p>
          <h1 className="font-display font-bold text-2xl">Dashboard</h1>
          <p className="text-blue-200 text-sm font-body mt-1">Welcome, {user?.name?.split(' ')[0]}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-5">
        {/* Period selector */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title">Overview</h2>
            <span className="text-xs text-muted font-body">{periodLabel}</span>
          </div>
          <PeriodSelector value={period} onChange={setPeriod} />
        </div>

        {/* Period stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Bookings"
            value={periodStats.bookings}
            icon={Briefcase}
            color="text-brand-blue"
            bg="bg-blue-50"
            trend={1}
            trendLabel={`${periodStats.completed} completed`}
          />
          <StatCard
            label="Revenue"
            value={`₹${periodStats.revenue.toLocaleString('en-IN')}`}
            icon={IndianRupee}
            color="text-amber-600"
            bg="bg-amber-50"
            trend={1}
            trendLabel={`${periodStats.completed} paid`}
          />
          <StatCard
            label="Online Workers"
            value={`${activeWorkers}/${workers.length}`}
            icon={TrendingUp}
            color="text-emerald-600"
            bg="bg-emerald-50"
            trend={activeWorkers > workers.length / 2 ? 1 : -1}
            trendLabel={activeWorkers > 0 ? 'Available now' : 'All offline'}
          />
          <StatCard
            label="Customers"
            value={customers.length}
            icon={Users}
            color="text-purple-600"
            bg="bg-purple-50"
          />
        </div>

        {/* Pending alert */}
        {periodStats.pending > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="font-display font-semibold text-amber-800">
                {periodStats.pending} Pending Assignment{periodStats.pending > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-amber-600 font-body mt-0.5">These bookings need a worker</p>
            </div>
            <button onClick={() => navigate('/admin/bookings')} className="text-xs text-amber-700 font-semibold font-body flex items-center gap-1">
              Review <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Bookings trend chart */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="section-title">Bookings Trend</h3>
          </div>
          <p className="text-xs text-muted font-body mb-4">{periodLabel}</p>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={chartData} barGap={3} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fontFamily: 'DM Sans', fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'DM Sans', fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Bookings" fill="#BFDBFE" radius={[4, 4, 0, 0]} barSize={18} />
              <Bar dataKey="Completed" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 justify-center">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-blue-200" /><span className="text-xs text-secondary font-body">Total</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-brand-blue" /><span className="text-xs text-secondary font-body">Completed</span></div>
          </div>
        </div>

        {/* Revenue chart */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="section-title">Revenue</h3>
            <span className="text-sm font-display font-bold text-brand-blue">
              ₹{chartData.reduce((s, d) => s + d.Revenue, 0).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-xs text-muted font-body mb-4">{periodLabel}</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fontFamily: 'DM Sans', fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fontFamily: 'DM Sans', fill: '#94A3B8' }}
                axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone" dataKey="Revenue" name="Revenue"
                stroke="#2563EB" strokeWidth={2.5}
                fill="url(#revenueGrad)"
                dot={{ r: 3, fill: '#2563EB', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* All-time summary strip */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Total Bookings', value: bookings.length, color: 'text-brand-blue' },
            { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'text-amber-600' },
            { label: 'Completion Rate', value: bookings.length > 0 ? `${Math.round((bookings.filter(b => b.status === 'COMPLETED').length / bookings.length) * 100)}%` : '0%', color: 'text-emerald-600' },
          ].map(s => (
            <div key={s.label} className="card p-3 text-center">
              <p className={`font-display font-bold text-base ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted font-body mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Service demand pie */}
        {serviceDemand.length > 0 && (
          <div className="card p-4">
            <h3 className="section-title mb-1">Service Demand</h3>
            <p className="text-xs text-muted font-body mb-4">All-time booking distribution</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={serviceDemand} cx="50%" cy="50%" outerRadius={70}
                  dataKey="value" nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={10}
                >
                  {serviceDemand.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontFamily: 'DM Sans', fontSize: 12, borderRadius: 12, border: '1px solid #E2E8F0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent bookings */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="section-title">Recent Bookings</h3>
            <button onClick={() => navigate('/admin/bookings')} className="text-xs text-brand-blue font-medium font-body">
              See all
            </button>
          </div>
          <div className="space-y-2">
            {recentBookings.map(b => {
              const svc = services.find(s => String(s.id) === String(b.serviceId));
              const customer = customers.find(c => String(c.id) === String(b.customerId));
              return (
                <button
                  key={b.id}
                  onClick={() => navigate('/admin/bookings')}
                  className="card w-full p-3 text-left hover:shadow-md transition-all active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: (svc?.color || '#2563EB') + '20' }}
                    >
                      <ServiceIcon name={svc?.icon || 'Settings'} size={16} style={{ color: svc?.color || '#2563EB' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-body font-semibold text-primary text-sm truncate">{svc?.name}</p>
                        <StatusBadge status={b.status} size="xs" />
                      </div>
                      <p className="text-xs text-muted font-body truncate">
                        {customer?.name} · ₹{b.amount}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
