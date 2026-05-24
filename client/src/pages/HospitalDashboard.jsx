import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import Map from '../components/Map';
import API from '../utils/api';

const HospitalDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const canvasRef = useRef(null);
  const [activeTab, setActiveTab] = useState('requests');
  const [showForm, setShowForm] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true); // eslint-disable-line no-unused-vars
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchRequests = async () => {
    try {
      const res = await API.get('/requests/hospital');
      setRequests(res.data.requests);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handlePostRequest = async () => {
  try {
    await API.post('/requests/create', newRequest);
    setShowForm(false);
    showToast('✅ Blood request posted! Matching donors are being notified.');
    fetchRequests();
  } catch (err) {
    showToast('⚠️ ' + (err.response?.data?.message || 'Something went wrong'));
  }
};
// eslint-disable-next-line no-unused-vars
  const handleStatusUpdate = async (id, status) => {
    try {
      await API.put(`/requests/status/${id}`, { status });
      showToast(`✅ Request marked as ${status}`);
      fetchRequests();
    } catch (err) {
      showToast('⚠️ Failed to update status');
    }
  };

  const [newRequest, setNewRequest] = useState({ bloodGroup: 'A+', units: 1, urgency: 'Normal', notes: '' });

  const handleLogout = () => { logout(); navigate('/'); };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.3, o: Math.random() * 0.25 + 0.05,
      pulse: Math.random() * Math.PI * 2,
    }));
    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const g = ctx.createRadialGradient(W * 0.85, H * 0.15, 0, W * 0.85, H * 0.15, W * 0.4);
      g.addColorStop(0, 'rgba(193,18,31,0.07)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      particles.forEach(p => {
        p.pulse += 0.02; p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        const glow = Math.sin(p.pulse) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(193,18,31,${p.o * (0.4 + glow * 0.6)})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { W = window.innerWidth; H = window.innerHeight; canvas.width = W; canvas.height = H; };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize); };
  }, []);

  useEffect(() => { fetchRequests(); }, []);

  const cardStyle = {
    background: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    borderRadius: '20px',
    backdropFilter: 'blur(20px)',
  };

  const inputStyle = {
    width: '100%',
    background: 'var(--input-bg)',
    border: '1px solid var(--input-border)',
    borderRadius: '12px',
    padding: '12px 16px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
  };

  const urgencyColor = (level) => {
    if (level === 'Critical') return { color: '#ff4444', bg: 'rgba(255,68,68,0.1)', border: 'rgba(255,68,68,0.3)' };
    if (level === 'Urgent') return { color: '#ffaa00', bg: 'rgba(255,170,0,0.1)', border: 'rgba(255,170,0,0.3)' };
    return { color: '#44ff88', bg: 'rgba(68,255,136,0.1)', border: 'rgba(68,255,136,0.3)' };
  };

  const cityCoords = {
    'mumbai': [19.0760, 72.8777],
    'delhi': [28.6139, 77.2090],
    'bangalore': [12.9716, 77.5946],
    'bengaluru': [12.9716, 77.5946],
    'chennai': [13.0827, 80.2707],
    'hyderabad': [17.3850, 78.4867],
    'pune': [18.5204, 73.8567],
    'kolkata': [22.5726, 88.3639],
    'ahmedabad': [23.0225, 72.5714],
    'jaipur': [26.9124, 75.7873],
    'vellore': [12.9165, 79.1325],
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif" }}>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {toast && (
        <div className="fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl text-sm font-medium"
          style={{ background: 'var(--card-bg)', border: '1px solid rgba(193,18,31,0.3)', backdropFilter: 'blur(20px)', boxShadow: '0 0 30px rgba(193,18,31,0.2)', color: 'var(--text-primary)' }}>
          {toast}
        </div>
      )}

      <div className="fixed inset-0 pointer-events-none z-10"
        style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.03) 3px,rgba(0,0,0,0.03) 4px)', opacity: 0.3 }} />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-64 z-40 flex flex-col"
        style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)', backdropFilter: 'blur(30px)' }}>

        <div className="p-6 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-base"
              style={{ background: '#C1121F', boxShadow: '0 0 20px rgba(193,18,31,0.5)' }}>🏥</div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '16px', letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>BloodBridge</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1px' }}>HOSPITAL PORTAL</div>
            </div>
          </div>
        </div>

        <div className="p-6 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ background: 'rgba(193,18,31,0.12)', color: isDark ? '#fff' : '#C1121F', border: '1px solid rgba(193,18,31,0.2)', fontWeight: 600 }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>📍 {user?.city}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'requests', icon: '🩸', label: 'Blood Requests' },
            { id: 'donors', icon: '👥', label: 'Matched Donors' },
            { id: 'history', icon: '📋', label: 'Request History' },
            { id: 'profile', icon: '🏥', label: 'Hospital Profile' },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all text-left"
              style={activeTab === item.id ? {
                background: 'rgba(193,18,31,0.12)', color: 'var(--text-primary)',
                border: '1px solid rgba(193,18,31,0.2)'
              } : { background: 'none', color: 'var(--text-muted)', border: '1px solid transparent' }}>
              <span>{item.icon}</span>
              {item.label}
              {activeTab === item.id && <div className="ml-auto w-1 h-4 rounded-full" style={{ background: '#C1121F' }} />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
          <button onClick={handleLogout}
            className="w-full py-3 rounded-xl text-sm transition-all"
            style={{ background: 'var(--btn-ghost-bg)', border: '1px solid var(--btn-ghost-border)', color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(193,18,31,0.1)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--btn-ghost-bg)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="ml-64 relative z-20 p-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs tracking-widest mb-2" style={{ color: 'rgba(193,18,31,0.6)', letterSpacing: '3px' }}>HOSPITAL DASHBOARD</div>
            <h1 className="font-black text-4xl" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '-1px', color: 'var(--text-primary)' }}>
              <span style={{ color: '#C1121F', fontStyle: 'italic' }}>{user?.name}</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 rounded-2xl font-semibold text-white text-sm transition-all"
              style={{ background: '#C1121F', boxShadow: '0 0 20px rgba(193,18,31,0.4)' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 40px rgba(193,18,31,0.7)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(193,18,31,0.4)'}>
              + Post Blood Request
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
  { icon: '🩸', val: requests.filter(r => r.status === 'Open').length.toString(), label: 'Active Requests', color: '#C1121F' },
  { icon: '👥', val: requests.reduce((acc, r) => acc + (r.acceptedDonors?.length || 0), 0).toString(), label: 'Matched Donors', color: '#44aaff' },
  { icon: '✅', val: requests.filter(r => r.status === 'Fulfilled').length.toString(), label: 'Fulfilled', color: '#44ff88' },
  { icon: '⏳', val: requests.filter(r => r.status === 'Open').length.toString(), label: 'Pending', color: '#ffaa00' },
].map((s, i) => (
            <div key={i} className="rounded-2xl p-5 transition-all" style={cardStyle}
              onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${s.color}40`; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.border = '1px solid var(--card-border)'; e.currentTarget.style.transform = 'none'; }}>
              <div className="text-2xl mb-3">{s.icon}</div>
              <div className="font-black text-2xl mb-1" style={{ fontFamily: "'Playfair Display', serif", color: s.color }}>{s.val}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Post Request Form */}
        {showForm && (
          <div className="rounded-2xl p-6 mb-6" style={{ ...cardStyle, padding: '24px', border: '1px solid rgba(193,18,31,0.2)' }}>
            <h3 className="font-black text-xl mb-5" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>
              Post Blood <span style={{ color: '#C1121F', fontStyle: 'italic' }}>Request</span>
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs mb-2 block" style={{ color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>Blood Group</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }}
                  onChange={e => setNewRequest({ ...newRequest, bloodGroup: e.target.value })}>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg} style={{ background: 'var(--input-bg)', color: 'var(--text-primary)' }}>{bg}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs mb-2 block" style={{ color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>Units Needed</label>
                <input type="number" min="1" max="10" defaultValue="1" style={inputStyle}
                  onChange={e => setNewRequest({ ...newRequest, units: e.target.value })} />
              </div>
              <div>
                <label className="text-xs mb-2 block" style={{ color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>Urgency</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }}
                  onChange={e => setNewRequest({ ...newRequest, urgency: e.target.value })}>
                  {['Normal', 'Urgent', 'Critical'].map(u => (
                    <option key={u} value={u} style={{ background: 'var(--input-bg)', color: 'var(--text-primary)' }}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs mb-2 block" style={{ color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>Additional Notes</label>
              <input type="text" placeholder="Patient condition, special requirements..." style={inputStyle}
                onChange={e => setNewRequest({ ...newRequest, notes: e.target.value })} />
            </div>
            <div className="flex gap-3">
              <button onClick={handlePostRequest} className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: '#C1121F', boxShadow: '0 0 20px rgba(193,18,31,0.3)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(193,18,31,0.6)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(193,18,31,0.3)'}>
                🩸 Post Request
              </button>
              <button onClick={() => setShowForm(false)}
                className="px-6 py-3 rounded-xl text-sm transition-all"
                style={{ background: 'var(--btn-ghost-bg)', border: '1px solid var(--btn-ghost-border)', color: 'var(--text-muted)' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Map */}
        {requests.length > 0 && (
          <div className="mb-8 rounded-2xl overflow-hidden"
            style={{ border: '1px solid var(--border-color)' }}>
            <div className="px-5 py-4"
              style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
              <div className="text-xs tracking-widest mb-1"
                style={{ color: 'rgba(193,18,31,0.6)', letterSpacing: '3px' }}>YOUR LOCATION</div>
              <h3 className="font-black text-lg"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                Hospital Map · <span style={{ color: '#C1121F' }}>{user?.city}</span>
              </h3>
            </div>
            <Map
              isDark={isDark}
              height="280px"
              donorLocation={cityCoords[user?.city?.toLowerCase()] || null}
              hospitals={[]}
            />
          </div>
        )}

        {/* Requests List */}
        <div className="mb-6">
          <div className="text-xs tracking-widest mb-1" style={{ color: 'rgba(193,18,31,0.6)', letterSpacing: '3px' }}>ACTIVE REQUESTS</div>
          <h2 className="font-black text-2xl mb-4" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Blood Requests</h2>
          <div className="space-y-4">
            {requests.map(req => {
              const uc = urgencyColor(req.urgency);
              return (
                <div key={req._id} className="rounded-2xl p-6 transition-all" style={cardStyle}
                  onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(193,18,31,0.2)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.border = '1px solid var(--card-border)'; e.currentTarget.style.transform = 'none'; }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm"
                        style={{ background: 'rgba(193,18,31,0.15)', border: '1px solid rgba(193,18,31,0.3)', color: '#C1121F', fontFamily: "'Playfair Display', serif" }}>
                        {req.bloodGroup}
                      </div>
                      <div>
                        <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{req.units} units of {req.bloodGroup}</div>
                        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <span>👥 {req.acceptedDonors?.length || 0} donors matched</span>
                          <span>🕐 {new Date(req.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                        style={{ background: uc.bg, border: `1px solid ${uc.border}`, color: uc.color }}>
                        {req.urgency}
                      </div>
                      <div className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                        style={req.status === 'Fulfilled'
                          ? { background: 'rgba(68,255,136,0.1)', border: '1px solid rgba(68,255,136,0.3)', color: '#44ff88' }
                          : { background: 'rgba(68,170,255,0.1)', border: '1px solid rgba(68,170,255,0.3)', color: '#44aaff' }}>
                        {req.status}
                      </div>
                      <button className="px-4 py-2 rounded-xl text-xs transition-all"
                        style={{ background: 'var(--btn-ghost-bg)', border: '1px solid var(--btn-ghost-border)', color: 'var(--text-muted)' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(193,18,31,0.3)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--btn-ghost-border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}>
                        View Donors
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;