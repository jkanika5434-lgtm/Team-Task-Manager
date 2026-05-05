import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import toast from 'react-hot-toast';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out!');
    navigate('/login');
  };

  const initials = (name) => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const avatarColors = ['#2563eb','#7c3aed','#16a34a','#d97706'];
  const avatarColor = avatarColors[user?.name?.charCodeAt(0) % avatarColors.length] || '#2563eb';

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: '▦' },
    { to: '/tasks', label: 'My Tasks', icon: '✓' },
    // { to: '/kanban', label: 'Kanban Board', icon: '⊞' },
    ...(user?.role === 'admin' ? [
      { to: '/projects', label: 'Projects', icon: '📁' },
    //   { to: '/team', label: 'Team', icon: '👥' },
    ] : []),
  ];

  return (
    <div style={styles.app}>
      {/* SIDEBAR */}
      <nav style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>✓</div>
          <span style={styles.logoText}>Team<span style={{color:'#2563eb'}}>Tasks</span></span>
        </div>

        <div style={styles.nav}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navActive : {}),
              })}>
              <span style={{fontSize:16}}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* User area */}
        <div style={styles.userArea}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{...styles.avatar, background: avatarColor}}>
              {initials(user?.name)}
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontSize:13, fontWeight:600, color:'#0f172a', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                {user?.name}
              </div>
              <span style={{
                fontSize:10, fontWeight:600, padding:'2px 8px',
                borderRadius:99, background:'#eff6ff', color:'#2563eb',
                textTransform:'capitalize',
              }}>{user?.role}</span>
            </div>
            <button onClick={handleLogout} title="Logout" style={styles.logoutBtn}>⏻</button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

const styles = {
  app: { display: 'flex', height: '100vh', fontFamily: "'Segoe UI', sans-serif" },
  sidebar: {
    width: 340, background: '#fff', borderRight: '1px solid #e2e8f0',
    display: 'flex', flexDirection: 'column', flexShrink: 0,
  },
  logo: {
    padding: '18px 20px', borderBottom: '1px solid #e2e8f0',
    display: 'flex', alignItems: 'center', gap: 10,
  },
  logoIcon: {
    width: 32, height: 32, background: '#2563eb', borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: 16,
  },
  logoText: { fontSize: 16, fontWeight: 700, color: '#0f172a' },
  nav: { padding: '12px 10px', flex: 1 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
    borderRadius: 8, color: '#475569', fontSize: 13.5, fontWeight: 400,
    textDecoration: 'none', marginBottom: 2, transition: 'all .15s',
  },
  navActive: { background: '#eff6ff', color: '#2563eb', fontWeight: 600 },
  userArea: { padding: '14px 16px', borderTop: '1px solid #e2e8f0' },
  avatar: {
    width: 34, height: 34, borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center', color: '#fff',
    fontWeight: 600, fontSize: 13, flexShrink: 0,
  },
  logoutBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 18, color: '#94a3b8', padding: 4,
  },
  main: { flex: 1, background: '#f8fafc', overflowY: 'auto' },
};

export default Layout;
