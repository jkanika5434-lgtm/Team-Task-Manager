import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}>✓</div>
          <span style={styles.logoText}>Team<span style={{color:'#2563eb'}}>Tasks</span></span>
        </div>

        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.sub}>Sign in to your workspace</p>

        <form onSubmit={handleSubmit}>
          <div style={styles.group}>
            <label style={styles.label}>Email address</label>
            <input
              style={{...styles.input, backgroundColor:'#f9fafb', color:'#0f172a'}}
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Password</label>
            <input
              style={{...styles.input, backgroundColor:'#f9fafb', color:'#0f172a'}}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button style={{...styles.btn, opacity: loading ? 0.7 : 1}} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={styles.toggle}>
          Don't have an account?{' '}
          <Link to="/signup" style={{color:'#2563eb', fontWeight:500}}>Create one</Link>
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
    width: 380, boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
    border: '1px solid #e2e8f0',
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
  btn: {
    width: '100%', padding: 12, background: '#2563eb', color: '#fff',
    border: 'none', borderRadius: 9, fontSize: 15, fontWeight: 600,
    cursor: 'pointer', marginTop: 8, fontFamily: "'Segoe UI', sans-serif",
  },
  toggle: { textAlign: 'center', marginTop: 20, fontSize: 13, color: '#94a3b8' },
};

export default Login;
