import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { leadsAPI, usersAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { Plus, Search, Filter, Edit2, Trash2, Eye, ChevronLeft, ChevronRight, Phone, Mail, Building } from 'lucide-react';
import { format } from 'date-fns';

const SOURCES = ['Website', 'Ads', 'Referral', 'Social Media', 'Other'];
const STATUSES = ['New', 'Contacted', 'Follow-up', 'Converted', 'Lost'];

const emptyForm = { name: '', phone: '', email: '', company: '', source: 'Website', status: 'New', notes: '', followUpDate: '', assignedTo: '' };

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '', source: '', assignedTo: '' });
  const [showFilters, setShowFilters] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const r = await leadsAPI.getAll({ ...filters, page, limit: 15 });
      setLeads(r.data.leads);
      setTotal(r.data.total);
      setPages(r.data.pages);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);
  useEffect(() => { usersAPI.getAll().then(r => setUsers(r.data)).catch(() => {}); }, []);

  const openCreate = () => { setEditLead(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (lead) => {
    setEditLead(lead);
    setForm({
      name: lead.name || '', phone: lead.phone || '', email: lead.email || '',
      company: lead.company || '', source: lead.source || 'Website',
      status: lead.status || 'New', notes: lead.notes || '',
      followUpDate: lead.followUpDate ? lead.followUpDate.slice(0, 10) : '',
      assignedTo: lead.assignedTo?._id || ''
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editLead) await leadsAPI.update(editLead._id, form);
      else await leadsAPI.create(form);
      setModalOpen(false);
      fetchLeads();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await leadsAPI.delete(deleteId);
      setDeleteId(null);
      fetchLeads();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="animate-slide-up space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Leads</h1>
          <p className="text-slate-400 text-sm mt-1">{total} total leads</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> Add Lead
        </button>
      </div>

      {/* Search & Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              className="input pl-9"
              placeholder="Search leads by name, email, company..."
              value={filters.search}
              onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }}
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`btn-secondary ${showFilters ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' : ''}`}>
            <Filter size={15} /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800 animate-slide-up">
            <div>
              <label className="label">Status</label>
              <select className="select" value={filters.status}
                onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1); }}>
                <option value="">All Statuses</option>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Source</label>
              <select className="select" value={filters.source}
                onChange={e => { setFilters(f => ({ ...f, source: e.target.value })); setPage(1); }}>
                <option value="">All Sources</option>
                {SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Assigned To</label>
              <select className="select" value={filters.assignedTo}
                onChange={e => { setFilters(f => ({ ...f, assignedTo: e.target.value })); setPage(1); }}>
                <option value="">All Staff</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lead</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Source</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Assigned</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden xl:table-cell">Follow-up</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-slate-800 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-slate-600">
                    No leads found. Add your first lead to get started.
                  </td>
                </tr>
              ) : leads.map(lead => (
                <tr key={lead._id} className="table-row-hover">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center text-primary-400 font-semibold text-xs font-mono flex-shrink-0">
                        {lead.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <Link to={`/leads/${lead._id}`} className="text-sm font-medium text-slate-200 hover:text-primary-400 transition-colors">
                          {lead.name}
                        </Link>
                        {lead.company && <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Building size={10} />{lead.company}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <div className="space-y-0.5">
                      {lead.email && <p className="text-xs text-slate-400 flex items-center gap-1.5"><Mail size={11} />{lead.email}</p>}
                      {lead.phone && <p className="text-xs text-slate-400 flex items-center gap-1.5"><Phone size={11} />{lead.phone}</p>}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-lg">{lead.source}</span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-sm text-slate-400">{lead.assignedTo?.name || '—'}</span>
                  </td>
                  <td className="px-5 py-4 hidden xl:table-cell">
                    <span className="text-xs text-slate-400">
                      {lead.followUpDate ? format(new Date(lead.followUpDate), 'MMM d, yyyy') : '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/leads/${lead._id}`} className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors">
                        <Eye size={14} />
                      </Link>
                      <button onClick={() => openEdit(lead)} className="p-1.5 text-slate-500 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => setDeleteId(lead._id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800">
            <span className="text-xs text-slate-500">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary py-1.5 px-2.5 disabled:opacity-40">
                <ChevronLeft size={14} />
              </button>
              <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="btn-secondary py-1.5 px-2.5 disabled:opacity-40">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editLead ? 'Edit Lead' : 'Add New Lead'} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name *</label>
            <input className="input" placeholder="John Smith" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Company</label>
            <input className="input" placeholder="Acme Inc." value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="john@acme.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" placeholder="+1 555 000 0000" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <label className="label">Lead Source</label>
            <select className="select" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
              {SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Follow-up Date</label>
            <input className="input" type="date" value={form.followUpDate} onChange={e => setForm(f => ({ ...f, followUpDate: e.target.value }))} />
          </div>
          <div>
            <label className="label">Assign To</label>
            <select className="select" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}>
              <option value="">Unassigned</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Notes</label>
            <textarea className="input h-20 resize-none" placeholder="Add any relevant notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-800">
          <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.name} className="btn-primary flex-1 justify-center">
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : editLead ? 'Save Changes' : 'Add Lead'}
          </button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Lead" size="sm">
        <p className="text-slate-400 mb-6">Are you sure you want to delete this lead? This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={handleDelete} className="btn-danger flex-1 justify-center">Delete Lead</button>
        </div>
      </Modal>
    </div>
  );
}
