import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { leadsAPI, activitiesAPI, usersAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { ArrowLeft, Edit2, Trash2, Phone, Mail, Building, Calendar, User, Activity, Clock } from 'lucide-react';
import { format } from 'date-fns';

const SOURCES = ['Website', 'Ads', 'Referral', 'Social Media', 'Other'];
const STATUSES = ['New', 'Contacted', 'Follow-up', 'Converted', 'Lost'];

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      leadsAPI.getOne(id),
      activitiesAPI.getAll({ entity: 'Lead', entityId: id }),
      usersAPI.getAll()
    ]).then(([lr, ar, ur]) => {
      setLead(lr.data);
      setActivities(ar.data);
      setUsers(ur.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const openEdit = () => {
    setForm({
      name: lead.name || '', phone: lead.phone || '', email: lead.email || '',
      company: lead.company || '', source: lead.source || 'Website',
      status: lead.status || 'New', notes: lead.notes || '',
      followUpDate: lead.followUpDate ? lead.followUpDate.slice(0, 10) : '',
      assignedTo: lead.assignedTo?._id || ''
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await leadsAPI.update(id, form);
      setLead(r.data);
      setEditOpen(false);
      const ar = await activitiesAPI.getAll({ entity: 'Lead', entityId: id });
      setActivities(ar.data);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    await leadsAPI.delete(id);
    navigate('/leads');
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!lead) return <div className="text-center text-slate-500 py-20">Lead not found</div>;

  return (
    <div className="animate-slide-up space-y-5 max-w-5xl">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <Link to="/leads" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
          <ArrowLeft size={16} /> Back to Leads
        </Link>
        <div className="flex gap-2">
          <button onClick={openEdit} className="btn-secondary"><Edit2 size={14} /> Edit</button>
          <button onClick={() => setDeleteOpen(true)} className="btn-danger"><Trash2 size={14} /> Delete</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Lead Info */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center text-primary-400 font-bold text-xl font-display flex-shrink-0">
                {lead.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold font-display text-white">{lead.name}</h1>
                {lead.company && <p className="text-slate-400 flex items-center gap-1.5 mt-1"><Building size={14} />{lead.company}</p>}
                <div className="flex items-center gap-2 mt-3">
                  <StatusBadge status={lead.status} />
                  <span className="badge bg-slate-800 text-slate-400 border border-slate-700">{lead.source}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t border-slate-800">
              {[
                { icon: Mail, label: 'Email', value: lead.email },
                { icon: Phone, label: 'Phone', value: lead.phone },
                { icon: User, label: 'Assigned To', value: lead.assignedTo?.name },
                { icon: Calendar, label: 'Follow-up Date', value: lead.followUpDate ? format(new Date(lead.followUpDate), 'MMM d, yyyy') : null },
                { icon: Clock, label: 'Created', value: format(new Date(lead.createdAt), 'MMM d, yyyy') },
              ].map(({ icon: Icon, label, value }) => value ? (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="text-sm text-slate-200 font-medium mt-0.5">{value}</p>
                  </div>
                </div>
              ) : null)}
            </div>
          </div>

          {lead.notes && (
            <div className="card p-5">
              <h3 className="font-semibold text-white mb-3">Notes</h3>
              <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{lead.notes}</p>
            </div>
          )}
        </div>

        {/* Activity Timeline */}
        <div className="card p-5 h-fit">
          <div className="flex items-center gap-2 mb-5">
            <Activity size={16} className="text-primary-400" />
            <h3 className="font-semibold text-white">Activity Timeline</h3>
          </div>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-slate-600 text-sm text-center py-8">No activity yet</p>
            ) : activities.map((a, i) => (
              <div key={a._id} className="flex gap-3 relative">
                {i < activities.length - 1 && (
                  <div className="absolute left-3.5 top-7 bottom-0 w-px bg-slate-800" />
                )}
                <div className="w-7 h-7 bg-primary-500/10 rounded-full flex items-center justify-center flex-shrink-0 border border-primary-500/20 z-10">
                  <Activity size={12} className="text-primary-400" />
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm text-slate-300">{a.action}</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {a.user?.name} · {format(new Date(a.createdAt), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Lead" size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="label">Name *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><label className="label">Company</label><input className="input" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} /></div>
          <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
          <div><label className="label">Source</label>
            <select className="select" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
              {SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label className="label">Status</label>
            <select className="select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label className="label">Follow-up Date</label><input className="input" type="date" value={form.followUpDate} onChange={e => setForm(f => ({ ...f, followUpDate: e.target.value }))} /></div>
          <div><label className="label">Assign To</label>
            <select className="select" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}>
              <option value="">Unassigned</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2"><label className="label">Notes</label><textarea className="input h-20 resize-none" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
        </div>
        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-800">
          <button onClick={() => setEditOpen(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 justify-center">
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save Changes'}
          </button>
        </div>
      </Modal>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Lead" size="sm">
        <p className="text-slate-400 mb-6">Are you sure you want to delete <strong className="text-white">{lead.name}</strong>? This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteOpen(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={handleDelete} className="btn-danger flex-1 justify-center">Delete Lead</button>
        </div>
      </Modal>
    </div>
  );
}
