import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password min 6 characters'); return; }
    setLoading(true);
    try {
      await api.post('/auth/signup', form);
      toast.success('Account created! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>✓</div>
          <span style={styles.logoText}>Team<span style={{color:'#2563eb'}}>Tasks</span></span>
        </div>

        <h2 style={styles.title}>Create account</h2>
        <p style={styles.sub}>Join your team workspace</p>

        <form onSubmit={handleSubmit}>
          <div style={styles.group}>
            <label style={styles.label}>Full name</label>
            <input style={{...styles.input, backgroundColor:'#f9fafb', color:'#0f172a'}} placeholder="Alex Johnson"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Email</label>
            <input style={{...styles.input, backgroundColor:'#f9fafb', color:'#0f172a'}} type="email" placeholder="alex@company.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Password (min 6 chars)</label>
            <input style={{...styles.input, backgroundColor:'#f9fafb', color:'#0f172a'}} type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>

          {/* Role selection */}
          <div style={styles.group}>
            <label style={styles.label}>Select your role</label>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
              {['admin','member'].map(r => (
                <div key={r} onClick={() => setForm({...form, role: r})}
                  style={{...styles.roleOption, ...(form.role===r ? styles.roleSelected : {})}}>
                  <div style={{fontWeight:600, fontSize:13, textTransform:'capitalize'}}>{r}</div>
                  <div style={{fontSize:11, color:'#94a3b8', marginTop:2}}>
                    {r==='admin' ? 'Manage projects & tasks' : 'View & update tasks'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button style={{...styles.btn, opacity: loading ? 0.7 : 1}} type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>

        <p style={styles.toggle}>
          Already have an account?{' '}
          <Link to="/login" style={{color:'#2563eb', fontWeight:500}}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)',
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    background: '#fff', borderRadius: 18, padding: '40px',
    width: 400, boxShadow: '0 8px 40px rgba(0,0,0,0.10)', border: '1px solid #e2e8f0',
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 },
  logoIcon: {
    width: 38, height: 38, background: '#2563eb', borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: 18,
  },
  logoText: { fontSize: 20, fontWeight: 700, color: '#0f172a' },
  title: { fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 4 },
  sub: { color: '#94a3b8', fontSize: 14, marginBottom: 28 },
  group: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#475569', marginBottom: 6 },
  input: {
    width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
    borderRadius: 9, fontSize: 14, outline: 'none', boxSizing: 'border-box',
    fontFamily: "'Segoe UI', sans-serif", color: '#0f172a',
  },
  roleOption: {
    border: '1.5px solid #e2e8f0', borderRadius: 9, padding: '10px 14px',
    cursor: 'pointer', transition: 'all .15s',
  },
  roleSelected: { borderColor: '#2563eb', background: '#eff6ff' },
  btn: {
    width: '100%', padding: 12, background: '#2563eb', color: '#fff',
    border: 'none', borderRadius: 9, fontSize: 15, fontWeight: 600,
    cursor: 'pointer', marginTop: 8, fontFamily: "'Segoe UI', sans-serif",
  },
  toggle: { textAlign: 'center', marginTop: 20, fontSize: 13, color: '#94a3b8' },
};

export default Signup;