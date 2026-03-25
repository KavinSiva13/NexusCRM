import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { customersAPI, activitiesAPI } from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';
import { ArrowLeft, Edit2, Trash2, Phone, Mail, Building, MapPin, DollarSign, User, Activity } from 'lucide-react';
import { format } from 'date-fns';
import Modal from '../../components/common/Modal';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      customersAPI.getOne(id),
      activitiesAPI.getAll({ entity: 'Customer', entityId: id })
    ]).then(([cr, ar]) => {
      setCustomer(cr.data);
      setActivities(ar.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    await customersAPI.delete(id);
    navigate('/customers');
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!customer) return <div className="text-center text-slate-500 py-20">Customer not found</div>;

  return (
    <div className="animate-slide-up space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <Link to="/customers" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
          <ArrowLeft size={16} /> Back to Customers
        </Link>
        <div className="flex gap-2">
          <button onClick={() => setDeleteOpen(true)} className="btn-danger"><Trash2 size={14} /> Delete</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 font-bold text-xl font-display flex-shrink-0">
                {customer.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold font-display text-white">{customer.name}</h1>
                {customer.company && <p className="text-slate-400 flex items-center gap-1.5 mt-1"><Building size={14} />{customer.company}</p>}
                <div className="mt-3">
                  <StatusBadge status={customer.paymentStatus} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t border-slate-800">
              {[
                { icon: Mail, label: 'Email', value: customer.email },
                { icon: Phone, label: 'Phone', value: customer.phone },
                { icon: MapPin, label: 'Address', value: customer.address },
                { icon: User, label: 'Account Manager', value: customer.accountManager?.name },
                { icon: DollarSign, label: 'Revenue', value: customer.revenue ? `$${customer.revenue.toLocaleString()}` : null },
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

          {customer.services?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-white mb-3">Services</h3>
              <div className="flex flex-wrap gap-2">
                {customer.services.map(s => (
                  <span key={s} className="badge bg-primary-500/10 text-primary-400 border border-primary-500/20">{s}</span>
                ))}
              </div>
            </div>
          )}

          {customer.notes && (
            <div className="card p-5">
              <h3 className="font-semibold text-white mb-3">Notes</h3>
              <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{customer.notes}</p>
            </div>
          )}
        </div>

        <div className="card p-5 h-fit">
          <div className="flex items-center gap-2 mb-5">
            <Activity size={16} className="text-emerald-400" />
            <h3 className="font-semibold text-white">Activity</h3>
          </div>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-slate-600 text-sm text-center py-8">No activity yet</p>
            ) : activities.map((a, i) => (
              <div key={a._id} className="flex gap-3 relative">
                {i < activities.length - 1 && <div className="absolute left-3.5 top-7 bottom-0 w-px bg-slate-800" />}
                <div className="w-7 h-7 bg-emerald-500/10 rounded-full flex items-center justify-center flex-shrink-0 border border-emerald-500/20 z-10">
                  <Activity size={12} className="text-emerald-400" />
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm text-slate-300">{a.action}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{a.user?.name} · {format(new Date(a.createdAt), 'MMM d, h:mm a')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Customer" size="sm">
        <p className="text-slate-400 mb-6">Delete <strong className="text-white">{customer.name}</strong>? This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteOpen(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={handleDelete} className="btn-danger flex-1 justify-center">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
