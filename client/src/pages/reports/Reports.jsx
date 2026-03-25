import { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Users, Target, DollarSign, BarChart3 } from 'lucide-react';

const COLORS = ['#4361ee', '#7c3aed', '#db2777', '#ea580c', '#16a34a'];
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm shadow-xl">
        <p className="text-slate-400 mb-1">{label}</p>
        {payload.map((p, i) => <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>)}
      </div>
    );
  }
  return null;
};

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats().then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = data?.monthlyLeads?.map(m => ({ month: monthNames[m._id - 1], leads: m.count })) || [];
  const statusData = data?.leadsByStatus?.map(s => ({ name: s._id, value: s.count })) || [];
  const sourceData = data?.leadsBySource?.map(s => ({ name: s._id, count: s.count })) || [];
  const stats = data?.stats || {};

  const conversionRate = stats.totalLeads ? ((stats.dealsClosedMonth / stats.totalLeads) * 100).toFixed(1) : 0;

  return (
    <div className="animate-slide-up space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">Business performance overview</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-700">
          <BarChart3 size={14} />
          Last 6 months
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: stats.totalLeads || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', sub: 'All time' },
          { label: 'Conversion Rate', value: `${conversionRate}%`, icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/10', sub: 'Lead to customer' },
          { label: 'Active Customers', value: stats.activeCustomers || 0, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10', sub: 'Current' },
          { label: 'Total Revenue', value: `$${(stats.monthlyRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-rose-400', bg: 'bg-rose-500/10', sub: 'All time' },
        ].map(({ label, value, icon: Icon, color, bg, sub }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white font-display">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              <p className="text-xs text-slate-600 mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-5">Monthly Lead Volume</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4361ee" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4361ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="leads" stroke="#4361ee" strokeWidth={2} fill="url(#g1)" name="Leads" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-white mb-5">Leads by Source</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={sourceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Leads">
                {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-5">Lead Status Distribution</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2.5 flex-1">
              {statusData.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-slate-400">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300 font-medium">{s.value}</span>
                    <div className="w-16 bg-slate-800 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{
                        width: `${stats.totalLeads ? (s.value / stats.totalLeads * 100) : 0}%`,
                        background: COLORS[i % COLORS.length]
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-white mb-5">Performance Summary</h3>
          <div className="space-y-4">
            {[
              { label: 'Lead-to-Customer Rate', value: conversionRate, unit: '%', color: '#4361ee' },
              { label: 'Active Pipeline', value: stats.pendingFollowUps || 0, unit: ' tasks', color: '#7c3aed' },
              { label: 'Deals Closed', value: stats.dealsClosedMonth || 0, unit: ' this period', color: '#16a34a' },
              { label: 'Avg Revenue/Customer', value: stats.activeCustomers ? Math.round((stats.monthlyRevenue || 0) / stats.activeCustomers).toLocaleString() : 0, unit: ' $', color: '#ea580c' },
            ].map(({ label, value, unit, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className="text-sm font-semibold" style={{ color }}>{value}{unit}</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full">
                  <div className="h-1.5 rounded-full transition-all" style={{
                    width: `${Math.min(Number(value), 100)}%`,
                    background: color
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
