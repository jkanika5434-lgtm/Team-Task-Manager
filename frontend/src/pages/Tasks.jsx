import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium',
    status: 'pending', assignedTo: '', project: '', deadline: ''
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects'),
      ]);
      setTasks(tasksRes.data.tasks || []);
      setProjects(projectsRes.data || []);

      if (user.role === 'admin') {
        const usersRes = await api.get('/projects/users');
        setUsers(usersRes.data || []);
      }
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditTask(null);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setForm({
      title: '', description: '', priority: 'medium',
      status: 'pending', assignedTo: '', project: '', 
      deadline: nextWeek.toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      assignedTo: task.assignedTo?._id || '',
      project: task.project?._id || '',
      deadline: task.deadline ? task.deadline.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title required!'); return; }
    if (user.role === 'admin' && !form.project) { toast.error('Select a project!'); return; }
    try {
      if (editTask) {
        const res = await api.put(`/tasks/${editTask._id}`, form);
        setTasks(tasks.map(t => t._id === editTask._id ? res.data : t));
        toast.success('Task updated!');
      } else {
        const res = await api.post('/tasks', { ...form, projectId: form.project });
        setTasks([res.data, ...tasks]);
        toast.success('Task created!');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
      toast.success('Task deleted!');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const isOverdue = (task) => {
    if (!task.deadline || task.status === 'completed') return false;
    return new Date() > new Date(task.deadline);
  };

  const filtered = tasks.filter(t => {
    if (filter === 'overdue') return isOverdue(t);
    if (filter !== 'all') return t.status === filter;
    if (search) return t.title.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const pill = (status, task) => {
    if (isOverdue(task)) return <span style={{...styles.pill, background:'#fef2f2', color:'#dc2626'}}>Overdue</span>;
    const map = {
      pending: { bg:'#fffbeb', color:'#92400e' },
      'in-progress': { bg:'#eff6ff', color:'#1e40af' },
      completed: { bg:'#f0fdf4', color:'#166534' },
    };
    const s = map[status] || map.pending;
    const label = { pending:'Pending', 'in-progress':'In Progress', completed:'Done' };
    return <span style={{...styles.pill, background:s.bg, color:s.color}}>{label[status]}</span>;
  };

  const priorityTag = (p) => {
    const map = { high:{bg:'#fef2f2',color:'#dc2626'}, medium:{bg:'#fffbeb',color:'#d97706'}, low:{bg:'#f0fdf4',color:'#16a34a'} };
    const s = map[p] || map.medium;
    return <span style={{...styles.pill, background:s.bg, color:s.color, fontSize:11}}>{p.toUpperCase()}</span>;
  };

  if (loading) return <div style={{padding:40,textAlign:'center',color:'#94a3b8'}}>Loading...</div>;

  return (
    <div style={{padding:28, fontFamily:"'Segoe UI', sans-serif"}}>
      {/* Header */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <div>
          <h1 style={{fontSize:24, fontWeight:700, color:'#0f172a'}}>Tasks</h1>
          <p style={{color:'#94a3b8', fontSize:14, marginTop:4}}>{filtered.length} tasks found</p>
        </div>
        {user.role === 'admin' && (
          <button onClick={openCreate} style={styles.addBtn}>+ New Task</button>
        )}
      </div>

      {/* Filters + Search */}
      <div style={{display:'flex', gap:8, marginBottom:20, flexWrap:'wrap', alignItems:'center'}}>
        <input
          placeholder="🔍 Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        {['all','pending','in-progress','completed','overdue'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{...styles.filterBtn, ...(filter===f ? styles.filterActive : {})}}>
            {f === 'in-progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Tasks Table */}
      <div style={styles.tableCard}>
        {filtered.length === 0 ? (
          <div style={{padding:48, textAlign:'center', color:'#94a3b8'}}>
            <div style={{fontSize:48, marginBottom:12}}>📭</div>
            <p>No tasks found!</p>
            {user.role === 'admin' && <button onClick={openCreate} style={{...styles.addBtn, marginTop:12}}>Create First Task</button>}
          </div>
        ) : (
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#fafafa'}}>
                {['Task','Project','Assigned To','Priority','Status','Deadline','Actions'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => (
                <tr key={task._id} style={{borderBottom:'1px solid #f1f5f9'}}>
                  <td style={styles.td}>
                    <div style={{fontWeight:600, color:'#0f172a'}}>{task.title}</div>
                    {task.description && <div style={{fontSize:12, color:'#94a3b8', marginTop:2}}>{task.description.slice(0,50)}{task.description.length>50?'...':''}</div>}
                  </td>
                  <td style={styles.td}>
                    <span style={{fontSize:12, background:'#eff6ff', color:'#2563eb', padding:'2px 8px', borderRadius:4, fontWeight:500}}>
                      {task.project?.name || '—'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{display:'flex', alignItems:'center', gap:6}}>
                      <div style={{
                        width:24, height:24, borderRadius:'50%', background:'#2563eb',
                        color:'#fff', fontSize:10, fontWeight:600,
                        display:'flex', alignItems:'center', justifyContent:'center'
                      }}>
                        {task.assignedTo?.name?.split(' ').map(w=>w[0]).join('').slice(0,2) || '?'}
                      </div>
                      <span style={{fontSize:13}}>{task.assignedTo?.name || '—'}</span>
                    </div>
                  </td>
                  <td style={styles.td}>{priorityTag(task.priority)}</td>
                  <td style={styles.td}>{pill(task.status, task)}</td>
                  <td style={{...styles.td, fontSize:12, color:'#475569'}}>
                    {task.deadline ? new Date(task.deadline).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—'}
                  </td>
                  <td style={styles.td}>
                    <div style={{display:'flex', gap:4}}>
                      <button onClick={() => openEdit(task)} style={styles.iconBtn} title="Edit">✏️</button>
                      {user.role === 'admin' && (
                        <button onClick={() => handleDelete(task._id)} style={{...styles.iconBtn, color:'#dc2626'}} title="Delete">🗑️</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
              <h3 style={{fontSize:18, fontWeight:700, color:'#0f172a'}}>
                {editTask ? 'Edit Task' : 'Create New Task'}
              </h3>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}>✕</button>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Task Title *</label>
              <input style={{...styles.input, backgroundColor:'#f9fafb', color:'#0f172a'}} placeholder="E.g. Design homepage wireframe"
                value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea style={{...styles.input, resize:'vertical', height:80,backgroundColor:'#f9fafb',color:'#0f172a'}}
                placeholder="What needs to be done?"
                value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Priority</label>
                <select style={{...styles.input, backgroundColor:'#f9fafb', color:'#0f172a'}} value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Status</label>
                <select style={{...styles.input, backgroundColor:'#f9fafb', color:'#0f172a'}} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Project *</label>
                <select style={{...styles.input, backgroundColor:'#f9fafb', color:'#0f172a'}} value={form.project} onChange={e => setForm({...form, project: e.target.value})}>
                  <option value="">Select project</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              {user.role === 'admin' && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Assign To</label>
                  <select style={{...styles.input, backgroundColor:'#f9fafb', color:'#0f172a'}} value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})}>
                    <option value="">Select member</option>
                    {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                  </select>
                </div>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Deadline</label>
              <input style={{...styles.input, backgroundColor:'#f9fafb', color:'#0f172a'}} type="date"
                value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} />
            </div>

            <div style={{display:'flex', gap:8, justifyContent:'flex-end', marginTop:8}}>
              <button onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={handleSave} style={styles.addBtn}>
                {editTask ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  addBtn: {
    background:'#2563eb', color:'#fff', border:'none', borderRadius:9,
    padding:'9px 18px', fontSize:14, fontWeight:600, cursor:'pointer',
    fontFamily:"'Segoe UI', sans-serif",
  },
  searchInput: {
    padding:'8px 14px', border:'1px solid #e2e8f0', borderRadius:9,background:'#fff', color:'#0f172a',
    fontSize:13, outline:'none', width:200, fontFamily:"'Segoe UI', sans-serif",
  },
  filterBtn: {
    padding:'6px 14px', borderRadius:99, border:'1px solid #e2e8f0',
    background:'none', cursor:'pointer', fontSize:12, color:'#475569',
    fontFamily:"'Segoe UI', sans-serif",
  },
  filterActive: { background:'#2563eb', color:'#fff', borderColor:'#2563eb' },
  tableCard: { background:'#fff', border:'1px solid #e2e8f0', borderRadius:14, overflow:'hidden' },
  th: { padding:'10px 20px', textAlign:'left', fontSize:11, fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.04em', borderBottom:'1px solid #e2e8f0' },
  td: { padding:'13px 20px', fontSize:13.5, color:'#475569', verticalAlign:'middle' },
  pill: { padding:'3px 10px', borderRadius:99, fontSize:12, fontWeight:600 },
  iconBtn: { background:'none', border:'none', cursor:'pointer', padding:4, fontSize:15, borderRadius:6 },
  overlay: { position:'fixed', inset:0, background:'rgba(15,23,42,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 },
  modal: { background:'#fff', borderRadius:16, padding:28, width:500, maxWidth:'95vw', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,.2)' },
  closeBtn: { background:'none', border:'none', cursor:'pointer', fontSize:20, color:'#94a3b8' },
  formGroup: { marginBottom:14 },
  label: { display:'block', fontSize:13, fontWeight:500, color:'#475569', marginBottom:6 },
  input: { width:'100%', padding:'9px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:13.5, outline:'none', boxSizing:'border-box', fontFamily:"'Segoe UI', sans-serif", color:'#0f172a' },
  cancelBtn: { background:'none', border:'1px solid #e2e8f0', borderRadius:9, padding:'9px 18px', fontSize:14, cursor:'pointer', color:'#475569', fontFamily:"'Segoe UI', sans-serif" },
};

export default Tasks;