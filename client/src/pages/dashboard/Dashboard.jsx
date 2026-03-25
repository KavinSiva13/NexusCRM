import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Users, UserCheck, CheckSquare, TrendingUp, DollarSign,
  ArrowUpRight, Activity, Clock, Target
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { format } from 'date-fns';

const COLORS = ['#4361ee', '#7b2d8b', '#e94560', '#f5a623', '#00b4d8'];

const statusColors = {
  New: '#4361ee', Contacted: '#f5a623', 'Follow-up': '#00b4d8',
  Converted: '#22c55e', Lost: '#ef4444'
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm shadow-xl">
        <p className="text-slate-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats().then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const chartData = data?.monthlyLeads?.map(m => ({
    month: monthNames[m._id - 1],
    leads: m.count
  })) || [];

  const statusData = data?.leadsByStatus?.map(s => ({
    name: s._id, value: s.count, color: statusColors[s._id] || '#888'
  })) || [];

  const sourceData = data?.leadsBySource?.map(s => ({
    name: s._id, count: s.count
  })) || [];

  const stats = data?.stats || {};

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="animate-slide-up space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Welcome back, {user?.name?.split(' ')[0]} 👋</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-700">
          <Clock size={14} />
          {format(new Date(), 'EEEE, MMM d, yyyy')}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Leads', value: stats.totalLeads || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: '+12%' },
          { label: 'Active Customers', value: stats.activeCustomers || 0, icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: '+8%' },
          { label: 'Pending Follow-ups', value: stats.pendingFollowUps || 0, icon: CheckSquare, color: 'text-amber-400', bg: 'bg-amber-500/10', trend: '-3%' },
          { label: 'Deals Closed', value: stats.dealsClosedMonth || 0, icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/10', trend: '+24%' },
          { label: 'Monthly Revenue', value: `$${(stats.monthlyRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-rose-400', bg: 'bg-rose-500/10', trend: '+18%' },
        ].map(({ label, value, icon: Icon, color, bg, trend }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon size={18} className={color} />
              </div>
              <span className={`text-xs font-medium flex items-center gap-1 ${trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                <TrendingUp size={12} />
                {trend}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white font-display">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Leads Chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white">Lead Trends</h3>
            <span className="text-xs text-slate-500">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4361ee" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4361ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="leads" stroke="#4361ee" strokeWidth={2} fill="url(#leadGrad)" name="Leads" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Lead by Status */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-5">Lead by Status</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                paddingAngle={3} dataKey="value">
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {statusData.map(s => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-slate-400">{s.name}</span>
                </div>
                <span className="text-slate-300 font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Lead Sources */}
        <div className="card p-5">
          <h3 className="font-semibold text-white mb-5">Lead Sources</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={sourceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#4361ee" radius={[0, 6, 6, 0]} name="Leads" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent Activity</h3>
            <Activity size={16} className="text-slate-500" />
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {data?.recentActivities?.length ? data.recentActivities.map(a => (
              <div key={a._id} className="flex items-start gap-3">
                <div className="w-7 h-7 bg-primary-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Activity size={12} className="text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300">
                    <span className="font-medium">{a.user?.name || 'System'}</span>{' '}
                    <span className="text-slate-500">{a.action}</span>{' '}
                    <span className="font-medium">{a.entityName}</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {format(new Date(a.createdAt), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-slate-600 text-sm text-center py-8">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Add New Lead', desc: 'Capture a new prospect', to: '/leads', color: 'from-blue-600/20 to-blue-800/5' },
          { label: 'View Tasks', desc: "Today's follow-ups", to: '/tasks', color: 'from-amber-600/20 to-amber-800/5' },
          { label: 'View Reports', desc: 'Analytics & insights', to: '/reports', color: 'from-purple-600/20 to-purple-800/5' },
        ].map(({ label, desc, to, color }) => (
          <Link key={to} to={to} className={`card p-5 bg-gradient-to-br ${color} hover:border-slate-600 transition-colors group`}>
            <p className="font-semibold text-white group-hover:text-primary-400 transition-colors">{label}</p>
            <p className="text-sm text-slate-500 mt-1">{desc}</p>
            <ArrowUpRight size={16} className="text-slate-600 group-hover:text-primary-400 mt-3 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
