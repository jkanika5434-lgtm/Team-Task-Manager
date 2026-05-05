import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', memberIds: [] });

  const fetchAll = useCallback(async () => {
    try {
      const [projRes, usersRes] = await Promise.all([
        api.get('/projects'),
        api.get('/projects/users'),
      ]);
      setProjects(projRes.data || []);
      setUsers(usersRes.data || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error('Project name required!'); return; }
    try {
      const res = await api.post('/projects', form);
      setProjects([res.data, ...projects]);
      setShowModal(false);
      setForm({ name: '', description: '', memberIds: [] });
      toast.success('Project created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const toggleMember = (id) => {
    setForm(f => ({
      ...f,
      memberIds: f.memberIds.includes(id)
        ? f.memberIds.filter(m => m !== id)
        : [...f.memberIds, id]
    }));
  };

  const colors = ['#2563eb','#7c3aed','#16a34a','#d97706','#dc2626','#0891b2'];

  if (loading) return <div style={{padding:40,textAlign:'center',color:'#94a3b8'}}>Loading...</div>;

  return (
    <div style={{padding:28, fontFamily:"'Segoe UI', sans-serif"}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <div>
          <h1 style={{fontSize:24, fontWeight:700, color:'#0f172a'}}>Projects</h1>
          <p style={{color:'#94a3b8', fontSize:14, marginTop:4}}>{projects.length} projects total</p>
        </div>
        {user.role === 'admin' && (
          <button onClick={() => setShowModal(true)} style={styles.addBtn}>+ New Project</button>
        )}
      </div>

      {projects.length === 0 ? (
        <div style={{textAlign:'center', padding:60, color:'#94a3b8'}}>
          <div style={{fontSize:48, marginBottom:12}}>📁</div>
          <p>No projects yet!</p>
          {user.role === 'admin' && <button onClick={() => setShowModal(true)} style={{...styles.addBtn, marginTop:12}}>Create First Project</button>}
        </div>
      ) : (
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16}}>
          {projects.map((p, i) => (
            <div key={p._id} style={styles.card}>
              <div style={{...styles.cardTop, background: colors[i % colors.length] + '15'}}>
                <div style={{...styles.projectIcon, background: colors[i % colors.length]}}>📁</div>
                <div>
                  <div style={{fontWeight:700, fontSize:15, color:'#0f172a'}}>{p.name}</div>
                  <div style={{fontSize:12, color:'#94a3b8'}}>{p.members?.length || 0} members</div>
                </div>
              </div>
              <p style={{fontSize:13, color:'#475569', margin:'12px 0'}}>{p.description || 'No description'}</p>
              <div style={{display:'flex', alignItems:'center', gap:-6}}>
                {p.members?.slice(0,4).map((m, idx) => (
                  <div key={m._id} style={{
                    width:28, height:28, borderRadius:'50%',
                    background: colors[idx % colors.length],
                    color:'#fff', fontSize:11, fontWeight:600,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    marginLeft: idx ? -8 : 0, border:'2px solid #fff',
                  }}>
                    {m.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}
                  </div>
                ))}
                {p.members?.length > 4 && <span style={{fontSize:12, color:'#94a3b8', marginLeft:8}}>+{p.members.length - 4} more</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
              <h3 style={{fontSize:18, fontWeight:700}}>Create New Project</h3>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Project Name *</label>
              <input style={styles.input} placeholder="E.g. Website Redesign"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea style={{...styles.input, height:80, resize:'vertical'}}
                placeholder="What is this project about?"
                value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Add Members</label>
              <div style={{display:'flex', flexDirection:'column', gap:8, maxHeight:180, overflowY:'auto'}}>
                {users.filter(u => u._id !== user._id).map(u => (
                  <div key={u._id} onClick={() => toggleMember(u._id)}
                    style={{
                      display:'flex', alignItems:'center', gap:10, padding:'8px 12px',
                      borderRadius:8, cursor:'pointer', border:'1px solid',
                      borderColor: form.memberIds.includes(u._id) ? '#2563eb' : '#e2e8f0',
                      background: form.memberIds.includes(u._id) ? '#eff6ff' : '#fff',
                    }}>
                    <div style={{width:30, height:30, borderRadius:'50%', background:'#2563eb', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600}}>
                      {u.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}
                    </div>
                    <div>
                      <div style={{fontSize:13, fontWeight:500}}>{u.name}</div>
                      <div style={{fontSize:11, color:'#94a3b8'}}>{u.role}</div>
                    </div>
                    {form.memberIds.includes(u._id) && <span style={{marginLeft:'auto', color:'#2563eb'}}>✓</span>}
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:'flex', gap:8, justifyContent:'flex-end', marginTop:8}}>
              <button onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={handleCreate} style={styles.addBtn}>Create Project</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  addBtn: { background:'#2563eb', color:'#fff', border:'none', borderRadius:9, padding:'9px 18px', fontSize:14, fontWeight:600, cursor:'pointer' },
  card: { background:'#fff', border:'1px solid #e2e8f0', borderRadius:14, padding:18, transition:'box-shadow .2s' },
  cardTop: { display:'flex', alignItems:'center', gap:12, padding:'12px', borderRadius:10, marginBottom:4 },
  projectIcon: { width:38, height:38, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 },
  overlay: { position:'fixed', inset:0, background:'rgba(15,23,42,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999 },
  modal: { background:'#fff', borderRadius:16, padding:28, width:460, maxWidth:'95vw', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,.2)' },
  closeBtn: { background:'none', border:'none', cursor:'pointer', fontSize:20, color:'#94a3b8' },
  formGroup: { marginBottom:14 },
  label: { display:'block', fontSize:13, fontWeight:500, color:'#475569', marginBottom:6 },
  input: { width:'100%', padding:'9px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:13.5, outline:'none', boxSizing:'border-box', fontFamily:"'Segoe UI', sans-serif" },
  cancelBtn: { background:'none', border:'1px solid #e2e8f0', borderRadius:9, padding:'9px 18px', fontSize:14, cursor:'pointer', color:'#475569' },
};

export default Projects;
