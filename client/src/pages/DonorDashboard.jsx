import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import Map from '../components/Map';

const DonorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [requests, setRequests] = useState([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');
  const [loading, setLoading] = useState(true);
  const [acceptedIds, setAcceptedIds] = useState([]);
  const [toast, setToast] = useState('');
  const { isDark } = useTheme();

  const handleLogout = () => { logout(); navigate('/'); };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchRequests = async () => {
    try {
      const res = await API.get('/requests/donor');
      setRequests(res.data.requests);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAccept = async (id) => {
    try {
      await API.put(`/requests/accept/${id}`);
      setAcceptedIds([...acceptedIds, id]);
      showToast('✅ Request accepted! The hospital will contact you soon.');
      fetchRequests();
    } catch (err) {
      showToast('⚠️ ' + (err.response?.data?.message || 'Something went wrong'));
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;
    const isMobile = window.innerWidth < 768;
    const particles = Array.from({ length: isMobile ? 30 : 120 }, (_, i) => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.3, o: Math.random() * 0.3 + 0.05,
      pulse: Math.random() * Math.PI * 2,
    }));
    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const g = ctx.createRadialGradient(W * 0.15, H * 0.2, 0, W * 0.15, H * 0.2, W * 0.4);
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

  const urgencyColor = (level) => {
    if (level === 'Critical') return { color: '#ff4444', bg: 'rgba(255,68,68,0.1)', border: 'rgba(255,68,68,0.3)' };
    if (level === 'Urgent') return { color: '#ffaa00', bg: 'rgba(255,170,0,0.1)', border: 'rgba(255,170,0,0.3)' };
    return { color: '#44ff88', bg: 'rgba(68,255,136,0.1)', border: 'rgba(68,255,136,0.3)' };
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} mins ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr ago`;
    return `${Math.floor(hrs / 24)} days ago`;
  };

  const cardStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
    backdropFilter: 'blur(20px)',
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
      <div className="fixed inset-0 pointer-events-none z-10"
        style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.03) 3px,rgba(0,0,0,0.03) 4px)', opacity: 0.3 }} />

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl text-sm font-medium"
          style={{ background: 'rgba(3,3,3,0.95)', border: '1px solid rgba(193,18,31,0.3)', backdropFilter: 'blur(20px)', boxShadow: '0 0 30px rgba(193,18,31,0.2)' }}>
          {toast}
        </div>
      )}

      {/* Sidebar */}
      <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 z-40 flex-col"
        style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border-color)', backdropFilter: 'blur(30px)' }}>

        <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-base"
              style={{ background: '#C1121F', boxShadow: '0 0 20px rgba(193,18,31,0.5)' }}>🩸</div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '16px', letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>BloodBridge</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', letterSpacing: '1px' }}>DONOR PORTAL</div>
            </div>
          </div>
        </div>

        <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3 mb-4">
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
          <div className="flex items-center justify-between">
            <div className="px-3 py-1.5 rounded-xl text-sm font-bold"
              style={{ background: 'rgba(193,18,31,0.15)', border: '1px solid rgba(193,18,31,0.3)', color: '#C1121F' }}>
              {user?.bloodGroup}
            </div>
            <button onClick={() => setIsAvailable(!isAvailable)}
              className="flex items-center gap-2 text-xs transition-all"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: isAvailable ? '#44ff88' : 'rgba(255,255,255,0.3)' }}>
              <div className="w-8 h-4 rounded-full relative transition-all"
                style={{ background: isAvailable ? 'rgba(68,255,136,0.3)' : 'rgba(255,255,255,0.1)', border: isAvailable ? '1px solid rgba(68,255,136,0.5)' : '1px solid rgba(255,255,255,0.1)' }}>
                <div className="absolute top-0.5 w-3 h-3 rounded-full transition-all"
                  style={{ background: isAvailable ? '#44ff88' : 'rgba(255,255,255,0.3)', left: isAvailable ? '17px' : '2px' }} />
              </div>
              {isAvailable ? 'Available' : 'Unavailable'}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'requests', icon: '🩸', label: 'Blood Requests' },
            { id: 'history', icon: '📋', label: 'My Donations' },
            { id: 'profile', icon: '👤', label: 'Profile' },
            { id: 'notifications', icon: '🔔', label: 'Notifications' },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all text-left"
              style={activeTab === item.id ? {
                background: 'rgba(193,18,31,0.12)', color: '#fff',
                border: '1px solid rgba(193,18,31,0.2)'
              } : { background: 'none', color: 'var(--text-secondary)', border: '1px solid transparent' }}>
              <span>{item.icon}</span>
              {item.label}
              {activeTab === item.id && <div className="ml-auto w-1 h-4 rounded-full" style={{ background: '#C1121F' }} />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <button onClick={handleLogout}
            className="w-full py-3 rounded-xl text-sm transition-all"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(193,18,31,0.1)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-0 md:ml-64 relative z-20 p-4 md:p-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-xs tracking-widest mb-2" style={{ color: 'rgba(193,18,31,0.6)', letterSpacing: '3px' }}>DONOR DASHBOARD</div>
            <h1 className="font-black text-4xl" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '-1px' }}>
              Welcome, <span style={{ color: '#C1121F', fontStyle: 'italic' }}>{user?.name?.split(' ')[0]}</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: 'rgba(68,255,136,0.08)', border: '1px solid rgba(68,255,136,0.2)' }}>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs" style={{ color: '#44ff88', letterSpacing: '1px' }}>ONLINE</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: '🩸', val: acceptedIds.length.toString(), label: 'Accepted Today', color: '#C1121F' },
            { icon: '📋', val: requests.length.toString(), label: 'Requests Nearby', color: '#44aaff' },
            { icon: '📍', val: user?.city || 'N/A', label: 'Your City', color: '#44ff88' },
            { icon: '🩸', val: user?.bloodGroup || 'N/A', label: 'Blood Group', color: '#ffaa00' },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl p-5 transition-all" style={cardStyle}
              onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${s.color}40`; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.border = '1px solid var(--border-color)'; e.currentTarget.style.transform = 'none'; }}>
              <div className="text-2xl mb-3">{s.icon}</div>
              <div className="font-black text-2xl mb-1" style={{ fontFamily: "'Playfair Display', serif", color: s.color }}>{s.val}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Map Section */}
        {requests.length > 0 && (
          <div className="mb-8 rounded-2xl overflow-hidden relative"
            style={{ border: '1px solid var(--border-color)' }}>

            {/* Map Header */}
            <div className="px-5 py-4 flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
              <div>
                <div className="text-xs tracking-widest mb-1"
                  style={{ color: 'rgba(193,18,31,0.6)', letterSpacing: '3px' }}>LIVE MAP</div>
                <h3 className="font-black text-lg"
                  style={{ fontFamily: "'Playfair Display', serif" }}>
                  Requests Near <span style={{ color: '#C1121F' }}>{user?.city}</span>
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#C1121F' }} />
                  Hospital
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: '#4488ff' }} />
                  Your Location
                </div>
              </div>
            </div>

            <Map
              isDark={isDark}
              height="300px"
              donorLocation={cityCoords[user?.city?.toLowerCase()] || null}
              hospitals={requests
                .filter(r => r.coordinates?.lat)
                .map(r => ({
                  name: r.hospitalName,
                  city: r.city,
                  bloodGroup: r.bloodGroup,
                  urgency: r.urgency,
                  coords: [r.coordinates.lat, r.coordinates.lng]
                }))}
            />
          </div>
        )}

        {/* Requests */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs tracking-widest mb-1" style={{ color: 'rgba(193,18,31,0.6)', letterSpacing: '3px' }}>MATCHED FOR YOU</div>
            <h2 className="font-black text-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>
              Blood Requests in {user?.city}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--text-secondary)' }}
            onClick={fetchRequests}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            Refresh
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 animate-pulse">🩸</div>
            <p style={{ color: 'var(--text-secondary)', letterSpacing: '2px', fontSize: '12px' }}>LOADING REQUESTS...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 rounded-2xl" style={cardStyle}>
            <div className="text-5xl mb-4">🩸</div>
            <p className="font-semibold mb-2">No active requests right now</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              We'll notify you when a matching request appears in {user?.city}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => {
              const uc = urgencyColor(req.urgency);
              const accepted = acceptedIds.includes(req._id);
              return (
                <div key={req._id} className="rounded-2xl p-6 transition-all"
                  style={{ ...cardStyle, border: req.urgency === 'Critical' ? '1px solid rgba(255,68,68,0.15)' : '1px solid var(--border-color)' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.borderColor = 'rgba(193,18,31,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = req.urgency === 'Critical' ? 'rgba(255,68,68,0.15)' : 'var(--border-color)'; }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black"
                        style={{ background: 'rgba(193,18,31,0.15)', border: '1px solid rgba(193,18,31,0.3)', color: '#C1121F', fontFamily: "'Playfair Display', serif", fontSize: '18px' }}>
                        {req.bloodGroup}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>{req.hospitalName}</div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>📍 {req.city}</span>
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>🕐 {timeAgo(req.createdAt)}</span>
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>💉 {req.units} units</span>
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>👥 {req.acceptedDonors?.length || 0} donors</span>
                        </div>
                        {req.notes && <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>📝 {req.notes}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                        style={{ background: uc.bg, border: `1px solid ${uc.border}`, color: uc.color, letterSpacing: '0.5px' }}>
                        {req.urgency}
                      </div>
                      <button onClick={() => handleAccept(req._id)} disabled={accepted}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                        style={accepted ? {
                          background: 'rgba(68,255,136,0.15)', border: '1px solid rgba(68,255,136,0.3)',
                          color: '#44ff88', cursor: 'default'
                        } : {
                          background: '#C1121F', boxShadow: '0 0 15px rgba(193,18,31,0.3)', cursor: 'pointer'
                        }}
                        onMouseEnter={e => !accepted && (e.currentTarget.style.boxShadow = '0 0 30px rgba(193,18,31,0.6)')}
                        onMouseLeave={e => !accepted && (e.currentTarget.style.boxShadow = '0 0 15px rgba(193,18,31,0.3)')}>
                        {accepted ? '✅ Accepted' : 'Accept 🩸'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
   {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden"
        style={{ background: 'var(--sidebar-bg)', borderTop: '1px solid var(--border-color)', backdropFilter: 'blur(20px)' }}>
        {[
          { id: 'requests', icon: '🩸', label: 'Requests' },
          { id: 'history', icon: '📋', label: 'History' },
          { id: 'profile', icon: '👤', label: 'Profile' },
        ].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)}
            className="flex-1 flex flex-col items-center py-3 text-xs transition-all"
            style={activeTab === item.id ? { color: '#C1121F' } : { color: 'var(--text-secondary)' }}>
            <span className="text-xl mb-1">{item.icon}</span>
            {item.label}
          </button>
        ))}
        <button onClick={handleLogout}
          className="flex-1 flex flex-col items-center py-3 text-xs"
          style={{ color: 'var(--text-secondary)' }}>
          <span className="text-xl mb-1">🚪</span>
          Logout
        </button>
      </div>

    </div>
  );
};

export default DonorDashboard;