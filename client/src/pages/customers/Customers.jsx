import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { customersAPI, usersAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { Plus, Search, Edit2, Trash2, Eye, Phone, Mail, Building, DollarSign } from 'lucide-react';

const PAYMENT_STATUSES = ['Paid', 'Pending', 'Overdue', 'Partial'];
const emptyForm = { name: '', company: '', email: '', phone: '', address: '', services: '', paymentStatus: 'Pending', accountManager: '', notes: '', revenue: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const r = await customersAPI.getAll({ search, paymentStatus: paymentFilter });
      setCustomers(r.data.customers);
      setTotal(r.data.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, paymentFilter]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);
  useEffect(() => { usersAPI.getAll().then(r => setUsers(r.data)).catch(() => {}); }, []);

  const openCreate = () => { setEditCustomer(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (c) => {
    setEditCustomer(c);
    setForm({
      name: c.name || '', company: c.company || '', email: c.email || '',
      phone: c.phone || '', address: c.address || '',
      services: (c.services || []).join(', '),
      paymentStatus: c.paymentStatus || 'Pending',
      accountManager: c.accountManager?._id || '', notes: c.notes || '',
      revenue: c.revenue || ''
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, services: form.services ? form.services.split(',').map(s => s.trim()).filter(Boolean) : [] };
      if (editCustomer) await customersAPI.update(editCustomer._id, payload);
      else await customersAPI.create(payload);
      setModalOpen(false);
      fetchCustomers();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    await customersAPI.delete(deleteId);
    setDeleteId(null);
    fetchCustomers();
  };

  return (
    <div className="animate-slide-up space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="text-slate-400 text-sm mt-1">{total} active customers</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Add Customer</button>
      </div>

      <div className="card p-4 flex gap-3 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input pl-9" placeholder="Search customers..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select w-44" value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
          <option value="">All Payment Status</option>
          {PAYMENT_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Revenue</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Account Manager</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(6)].map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-slate-800 rounded w-full" /></td>)}
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-16 text-center text-slate-600">No customers yet. Convert leads or add customers manually.</td></tr>
              ) : customers.map(c => (
                <tr key={c._id} className="table-row-hover">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 font-semibold text-xs font-mono">
                        {c.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <Link to={`/customers/${c._id}`} className="text-sm font-medium text-slate-200 hover:text-primary-400 transition-colors">{c.name}</Link>
                        {c.company && <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Building size={10} />{c.company}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <div className="space-y-0.5">
                      {c.email && <p className="text-xs text-slate-400 flex items-center gap-1.5"><Mail size={11} />{c.email}</p>}
                      {c.phone && <p className="text-xs text-slate-400 flex items-center gap-1.5"><Phone size={11} />{c.phone}</p>}
                    </div>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={c.paymentStatus} /></td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-sm text-slate-300 flex items-center gap-1"><DollarSign size={13} />{(c.revenue || 0).toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell"><span className="text-sm text-slate-400">{c.accountManager?.name || '—'}</span></td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/customers/${c._id}`} className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors"><Eye size={14} /></Link>
                      <button onClick={() => openEdit(c)} className="p-1.5 text-slate-500 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => setDeleteId(c._id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editCustomer ? 'Edit Customer' : 'Add Customer'} size="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="label">Name *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><label className="label">Company</label><input className="input" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} /></div>
          <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
          <div className="sm:col-span-2"><label className="label">Address</label><input className="input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
          <div className="sm:col-span-2"><label className="label">Services (comma-separated)</label><input className="input" placeholder="Web Design, SEO, Consulting" value={form.services} onChange={e => setForm(f => ({ ...f, services: e.target.value }))} /></div>
          <div><label className="label">Payment Status</label>
            <select className="select" value={form.paymentStatus} onChange={e => setForm(f => ({ ...f, paymentStatus: e.target.value }))}>
              {PAYMENT_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label className="label">Revenue ($)</label><input className="input" type="number" value={form.revenue} onChange={e => setForm(f => ({ ...f, revenue: e.target.value }))} /></div>
          <div><label className="label">Account Manager</label>
            <select className="select" value={form.accountManager} onChange={e => setForm(f => ({ ...f, accountManager: e.target.value }))}>
              <option value="">Unassigned</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
          <div><label className="label">Notes</label><textarea className="input h-16 resize-none" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
        </div>
        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-800">
          <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.name} className="btn-primary flex-1 justify-center">
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : editCustomer ? 'Save Changes' : 'Add Customer'}
          </button>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Customer" size="sm">
        <p className="text-slate-400 mb-6">Are you sure? This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={handleDelete} className="btn-danger flex-1 justify-center">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
