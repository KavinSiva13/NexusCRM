import { useState, useEffect, useCallback } from 'react';
import { tasksAPI, usersAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { Plus, Check, Trash2, Edit2, Calendar, User, AlertCircle, Clock } from 'lucide-react';
import { format, isToday, isPast } from 'date-fns';

const STATUSES = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const emptyForm = { title: '', description: '', dueDate: '', assignedTo: '', status: 'Pending', priority: 'Medium' };

const priorityIcon = { High: '🔴', Medium: '🟡', Low: '🟢' };

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [todayOnly, setTodayOnly] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const r = await tasksAPI.getAll({ status: statusFilter, today: todayOnly });
      setTasks(r.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [statusFilter, todayOnly]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => { usersAPI.getAll().then(r => setUsers(r.data)).catch(() => {}); }, []);

  const openCreate = () => { setEditTask(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (t) => {
    setEditTask(t);
    setForm({
      title: t.title || '', description: t.description || '',
      dueDate: t.dueDate ? t.dueDate.slice(0, 10) : '',
      assignedTo: t.assignedTo?._id || '', status: t.status || 'Pending', priority: t.priority || 'Medium'
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editTask) await tasksAPI.update(editTask._id, form);
      else await tasksAPI.create(form);
      setModalOpen(false);
      fetchTasks();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const markComplete = async (task) => {
    await tasksAPI.update(task._id, { status: 'Completed' });
    fetchTasks();
  };

  const handleDelete = async () => {
    await tasksAPI.delete(deleteId);
    setDeleteId(null);
    fetchTasks();
  };

  const grouped = {
    today: tasks.filter(t => t.dueDate && isToday(new Date(t.dueDate))),
    upcoming: tasks.filter(t => t.dueDate && !isToday(new Date(t.dueDate)) && !isPast(new Date(t.dueDate))),
    overdue: tasks.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate)) && t.status !== 'Completed'),
    noDate: tasks.filter(t => !t.dueDate),
  };

  const TaskRow = ({ task }) => (
    <div className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
      task.status === 'Completed' ? 'border-slate-800 opacity-50' : 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/30'
    }`}>
      <button
        onClick={() => task.status !== 'Completed' && markComplete(task)}
        className={`w-5 h-5 mt-0.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          task.status === 'Completed' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 hover:border-emerald-500'
        }`}
      >
        {task.status === 'Completed' && <Check size={11} className="text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-medium text-sm ${task.status === 'Completed' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
            {task.title}
          </span>
          <span className="text-xs">{priorityIcon[task.priority]}</span>
          <StatusBadge status={task.status} />
        </div>
        {task.description && <p className="text-xs text-slate-500 mt-1 truncate">{task.description}</p>}
        <div className="flex items-center gap-4 mt-2 flex-wrap">
          {task.assignedTo && (
            <span className="text-xs text-slate-500 flex items-center gap-1"><User size={11} />{task.assignedTo.name}</span>
          )}
          {task.dueDate && (
            <span className={`text-xs flex items-center gap-1 ${
              isPast(new Date(task.dueDate)) && task.status !== 'Completed' ? 'text-red-400' : 'text-slate-500'
            }`}>
              <Calendar size={11} />
              {format(new Date(task.dueDate), 'MMM d, yyyy')}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button onClick={() => openEdit(task)} className="p-1.5 text-slate-500 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors">
          <Edit2 size={13} />
        </button>
        <button onClick={() => setDeleteId(task._id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );

  const Section = ({ title, tasks, icon: Icon, color }) => tasks.length > 0 ? (
    <div>
      <div className={`flex items-center gap-2 mb-3`}>
        <Icon size={15} className={color} />
        <h3 className="font-semibold text-sm text-slate-300">{title}</h3>
        <span className="text-xs bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">{tasks.length}</span>
      </div>
      <div className="space-y-2">{tasks.map(t => <TaskRow key={t._id} task={t} />)}</div>
    </div>
  ) : null;

  return (
    <div className="animate-slide-up space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="text-slate-400 text-sm mt-1">{tasks.filter(t => t.status !== 'Completed').length} pending tasks</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Add Task</button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex gap-2">
          {['', 'Pending', 'In Progress', 'Completed'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}>
              {s || 'All'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setTodayOnly(!todayOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            todayOnly ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock size={12} /> Today Only
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-900 rounded-xl border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="card p-16 text-center">
          <Check size={32} className="text-slate-700 mx-auto mb-3" />
          <p className="text-slate-600">No tasks found. Stay on top of your work!</p>
        </div>
      ) : (
        <div className="space-y-6">
          <Section title="Overdue" tasks={grouped.overdue} icon={AlertCircle} color="text-red-400" />
          <Section title="Today" tasks={grouped.today} icon={Clock} color="text-amber-400" />
          <Section title="Upcoming" tasks={grouped.upcoming} icon={Calendar} color="text-blue-400" />
          <Section title="No Due Date" tasks={grouped.noDate} icon={Check} color="text-slate-400" />
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTask ? 'Edit Task' : 'New Task'}>
        <div className="space-y-4">
          <div><label className="label">Title *</label><input className="input" placeholder="Task title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
          <div><label className="label">Description</label><textarea className="input h-16 resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Due Date</label><input className="input" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} /></div>
            <div><label className="label">Priority</label>
              <select className="select" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Status</label>
              <select className="select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label className="label">Assign To</label>
              <select className="select" value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}>
                <option value="">Unassigned</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-800">
          <button onClick={() => setModalOpen(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.title} className="btn-primary flex-1 justify-center">
            {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : editTask ? 'Save' : 'Create Task'}
          </button>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Task" size="sm">
        <p className="text-slate-400 mb-6">Delete this task? This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={handleDelete} className="btn-danger flex-1 justify-center">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
