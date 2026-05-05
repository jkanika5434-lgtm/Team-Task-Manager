import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total:0, completed:0, inProgress:0, overdue:0 });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, tasksRes] = await Promise.all([
        api.get('/tasks/stats'),
        api.get('/tasks?limit=6'),
      ]);
      setStats(statsRes.data);
      setTasks(tasksRes.data.tasks || []);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const statCards = [
    { label: 'Total Tasks', value: stats.total, color: '#2563eb', bg: '#eff6ff', icon: '📋' },
    { label: 'Completed', value: stats.completed, color: '#16a34a', bg: '#f0fdf4', icon: '✅' },
    { label: 'In Progress', value: stats.inProgress, color: '#d97706', bg: '#fffbeb', icon: '⏳' },
    { label: 'Overdue', value: stats.overdue, color: '#dc2626', bg: '#fef2f2', icon: '🚨' },
  ];

  const statusPill = (status, deadline) => {
    const isOverdue = deadline && status !== 'completed' && new Date() > new Date(deadline);
    if (isOverdue) return <span style={{...pill, background:'#fef2f2', color:'#dc2626'}}>Overdue</span>;
    const map = {
      pending: { bg:'#fffbeb', color:'#92400e', label:'Pending' },
      'in-progress': { bg:'#eff6ff', color:'#1e40af', label:'In Progress' },
      completed: { bg:'#f0fdf4', color:'#166534', label:'Done' },
    };
    const s = map[status] || map.pending;
    return <span style={{...pill, background:s.bg, color:s.color}}>{s.label}</span>;
  };

  const pill = {
    padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600,
  };

  if (loading) return <div style={{padding:40, textAlign:'center', color:'#94a3b8'}}>Loading...</div>;

  return (
    <div style={{padding: 28, fontFamily:"'Segoe UI', sans-serif"}}>
      {/* Welcome */}
      <div style={{marginBottom: 24}}>
        <h1 style={{fontSize: 24, fontWeight: 700, color:'#0f172a'}}>
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p style={{color:'#94a3b8', fontSize:14, marginTop:4}}>
          Here's what's happening with your tasks today.
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:28}}>
        {statCards.map(s => (
          <div key={s.label} style={{
            background:'#fff', border:'1px solid #e2e8f0', borderRadius:14,
            padding:'18px 20px', position:'relative', overflow:'hidden',
          }}>
            <div style={{
              position:'absolute', top:0, left:0, right:0, height:3, background:s.color, borderRadius:'14px 14px 0 0',
            }}/>
            <div style={{fontSize:28, marginBottom:6}}>{s.icon}</div>
            <div style={{fontSize:12, color:'#94a3b8', fontWeight:500, marginBottom:6}}>{s.label}</div>
            <div style={{fontSize:32, fontWeight:700, color:s.color, lineHeight:1}}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Tasks Table */}
      <div style={{background:'#fff', border:'1px solid #e2e8f0', borderRadius:14, overflow:'hidden'}}>
        <div style={{padding:'16px 20px', borderBottom:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h3 style={{fontSize:15, fontWeight:700, color:'#0f172a'}}>Recent Tasks</h3>
        </div>
        {tasks.length === 0 ? (
          <div style={{padding:40, textAlign:'center', color:'#94a3b8'}}>
            No tasks yet. Ask your admin to assign tasks!
          </div>
        ) : (
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#fafafa'}}>
                {['Task','Assigned To','Status','Deadline'].map(h => (
                  <th key={h} style={{padding:'10px 20px', textAlign:'left', fontSize:11, fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.04em', borderBottom:'1px solid #e2e8f0'}}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task._id} style={{borderBottom:'1px solid #f1f5f9'}}>
                  <td style={{padding:'13px 20px'}}>
                    <div style={{fontWeight:600, fontSize:13.5, color:'#0f172a'}}>{task.title}</div>
                    <div style={{fontSize:11.5, color:'#94a3b8'}}>{task.project?.name}</div>
                  </td>
                  <td style={{padding:'13px 20px', fontSize:13, color:'#475569'}}>
                    {task.assignedTo?.name || '—'}
                  </td>
                  <td style={{padding:'13px 20px'}}>
                    {statusPill(task.status, task.deadline)}
                  </td>
                  <td style={{padding:'13px 20px', fontSize:12.5, color:'#475569'}}>
                    {task.deadline ? new Date(task.deadline).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
