const statusConfig = {
  // Lead statuses
  New: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  Contacted: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  'Follow-up': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  Converted: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  Lost: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  // Task statuses
  Pending: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
  'In Progress': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  Completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  Cancelled: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  // Payment statuses
  Paid: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  Overdue: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  Partial: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  // Priority
  High: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  Medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  Low: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' };
  return (
    <span className={`badge ${config.bg} ${config.text} border ${config.border}`}>
      {status}
    </span>
  );
}
