import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import TopBar from '../../components/TopBar';
import StarRating from '../../components/ui/StarRating';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subMonths } from 'date-fns';

export default function WorkerStats() {
  const { user } = useAuth();
  const { workers, reviews, getBookingsByWorker } = useApp();

  const worker = workers.find(w => String(w.id) === String(user?.id));
  const profile = worker?.profile;
  const myJobs = getBookingsByWorker(user?.id);
  const myReviews = reviews.filter(r => String(r.workerId) === String(user?.id));

  // Build monthly chart data (last 6 months)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), 5 - i);
    const month = d.getMonth();
    const year = d.getFullYear();
    const count = myJobs.filter(j => {
      const jd = new Date(j.completedAt || j.createdAt);
      return jd.getMonth() === month && jd.getFullYear() === year && j.status === 'COMPLETED';
    }).length;
    return { month: format(d, 'MMM'), jobs: count };
  });

  // Rating distribution
  const ratingDist = [5,4,3,2,1].map(r => ({
    stars: r,
    count: myReviews.filter(rev => rev.rating === r).length,
    pct: myReviews.length > 0 ? Math.round((myReviews.filter(rev => rev.rating === r).length / myReviews.length) * 100) : 0,
  }));

  // Rating trend
  const ratingTrend = myReviews.slice(-6).map((r, i) => ({
    i: i + 1,
    rating: r.rating,
  }));

  return (
    <div className="min-h-screen bg-bg">
      <TopBar title="My Stats" />
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-5">
        {/* Score card */}
        <div className="gradient-header rounded-2xl p-5 text-white">
          <p className="text-blue-200 text-xs font-body uppercase tracking-wide mb-1">Performance Score</p>
          <div className="flex items-end gap-3">
            <p className="font-display font-black text-5xl">{profile?.performanceScore || 0}</p>
            <p className="text-blue-200 text-lg font-body mb-2">/ 100</p>
          </div>
          <div className="h-2 bg-white/20 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{width:`${profile?.performanceScore||0}%`}} />
          </div>
          <div className="flex justify-between mt-4 text-xs text-blue-200 font-body">
            <span>{profile?.totalJobsCompleted || 0} total jobs</span>
            <span>Rating: {profile?.averageRating || 0}/5</span>
          </div>
        </div>

        {/* Monthly jobs chart */}
        <div className="card p-4">
          <h3 className="section-title mb-4">Monthly Jobs Completed</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{fontSize:11,fontFamily:'DM Sans',fill:'#94A3B8'}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize:11,fontFamily:'DM Sans',fill:'#94A3B8'}} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{fontFamily:'DM Sans',fontSize:12,borderRadius:12,border:'1px solid #E2E8F0',boxShadow:'0 4px 16px rgba(0,0,0,0.08)'}} />
              <Bar dataKey="jobs" fill="#2563EB" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Rating trend */}
        {ratingTrend.length > 1 && (
          <div className="card p-4">
            <h3 className="section-title mb-4">Rating Trend</h3>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={ratingTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="i" hide />
                <YAxis domain={[1,5]} tick={{fontSize:11,fontFamily:'DM Sans',fill:'#94A3B8'}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{fontFamily:'DM Sans',fontSize:12,borderRadius:12,border:'1px solid #E2E8F0'}} />
                <Line type="monotone" dataKey="rating" stroke="#F59E0B" strokeWidth={2.5} dot={{r:4,fill:'#F59E0B'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Rating breakdown */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Ratings Breakdown</h3>
            <div className="flex items-center gap-1.5">
              <StarRating rating={profile?.averageRating||0} size={14} />
              <span className="font-display font-bold text-primary">{profile?.averageRating||0}</span>
              <span className="text-xs text-muted font-body">({myReviews.length})</span>
            </div>
          </div>
          <div className="space-y-2">
            {ratingDist.map(r => (
              <div key={r.stars} className="flex items-center gap-3">
                <span className="text-xs font-body text-secondary w-8">{r.stars} star</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{width:`${r.pct}%`}} />
                </div>
                <span className="text-xs font-body text-muted w-6 text-right">{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent reviews */}
        {myReviews.length > 0 && (
          <div className="card p-4">
            <h3 className="section-title mb-3">Recent Reviews</h3>
            <div className="space-y-3">
              {myReviews.slice(-3).reverse().map(r => (
                <div key={r.id} className="border-b border-border last:border-0 pb-3 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StarRating rating={r.rating} size={13} />
                    <span className="text-xs text-muted font-body">{r.createdAt ? format(new Date(r.createdAt),'MMM d') : ''}</span>
                  </div>
                  {r.comment && <p className="text-sm text-secondary font-body italic">"{r.comment}"</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
