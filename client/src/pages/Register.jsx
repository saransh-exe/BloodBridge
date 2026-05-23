import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // eslint-disable-line no-unused-vars
  const { isDark } = useTheme();
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [role, setRole] = useState('donor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false); // eslint-disable-line no-unused-vars
  const [form, setForm] = useState({
    name: '', email: '', password: '', city: '',
    phone: '', bloodGroup: 'A+', age: '', licenseNumber: ''
  });
  const [focused, setFocused] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
  setLoading(true); setError('');
  try {
    await axios.post('https://bloodbridge-api-4nyf.onrender.com/api/otp/send', {
      email: form.email,
      name: form.name
    });
    navigate('/verify-otp', {
      state: { formData: form, role }
    });
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to send OTP');
  }
  setLoading(false);
};
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const particles = Array.from({ length: 80 }, (_, i) => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.3,
      o: Math.random() * 0.4 + 0.08,
      pulse: Math.random() * Math.PI * 2,
      type: i % 10 === 0 ? 'drop' : 'dot',
    }));

    const drawDrop = (x, y, r, o) => {
      ctx.save(); ctx.globalAlpha = o;
      ctx.fillStyle = '#C1121F';
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.quadraticCurveTo(x + r * 0.6, y - r * 2.2, x, y - r * 3);
      ctx.quadraticCurveTo(x - r * 0.6, y - r * 2.2, x, y - r);
      ctx.fill(); ctx.restore();
    };

    let t = 0, animId;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const { x: mx, y: my } = mouseRef.current;

      [[W * 0.1, H * 0.2, W * 0.4, '193,18,31', 0.08],
       [W * 0.9, H * 0.8, W * 0.35, '100,0,10', 0.06],
       [mx, my, 180, '193,18,31', 0.07]].forEach(([x, y, r, c, a]) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(1, `rgba(${c},0)`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      });

      const pulse = Math.sin(t * 0.03) * 0.5 + 0.5;
      ctx.lineWidth = 0.5;
      for (let r = 60; r < Math.max(W, H); r += 100) {
        ctx.strokeStyle = `rgba(193,18,31,${(0.025 + pulse * 0.02) * (1 - r / Math.max(W, H))})`;
        ctx.beginPath(); ctx.arc(W / 2, H / 2, r + Math.sin(t * 0.02 + r * 0.01) * 6, 0, Math.PI * 2); ctx.stroke();
      }

      particles.forEach(p => {
        p.pulse += 0.02;
        const glow = Math.sin(p.pulse) * 0.5 + 0.5;
        const dx = mx - p.x, dy = my - p.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120 && d > 0) { p.vx += dx / d * 0.012; p.vy += dy / d * 0.012; }
        p.vx *= 0.98; p.vy *= 0.98;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        if (p.type === 'drop') {
          drawDrop(p.x, p.y, p.r, p.o * (0.4 + glow * 0.6));
        } else {
          const pr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
          pr.addColorStop(0, `rgba(193,18,31,${p.o * (0.4 + glow * 0.6)})`);
          pr.addColorStop(1, 'rgba(193,18,31,0)');
          ctx.fillStyle = pr; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = `rgba(255,80,80,${p.o * (0.5 + glow * 0.5)})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        }
      });

      particles.forEach((p, i) => {
        particles.slice(i + 1, i + 6).forEach(q => {
          const d = Math.sqrt((p.x - q.x) ** 2 + (p.y - q.y) ** 2);
          if (d < 80) {
            ctx.strokeStyle = `rgba(193,18,31,${0.1 * (1 - d / 80)})`;
            ctx.lineWidth = 0.4;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        });
      });

      const cols = Math.ceil(W / 80) + 1, rows = Math.ceil(H / 70) + 1;
      for (let xi = 0; xi < cols; xi++) for (let yi = 0; yi < rows; yi++) {
        const hx = xi * 80 + (yi % 2) * 40, hy = yi * 70;
        const dist = Math.sqrt((hx - mx) ** 2 + (hy - my) ** 2);
        const a = Math.max(0, 0.05 - dist * 0.00012);
        if (a > 0.003) {
          ctx.strokeStyle = `rgba(193,18,31,${a})`; ctx.lineWidth = 0.4;
          ctx.beginPath();
          for (let k = 0; k < 6; k++) { const ang = k * Math.PI / 3; ctx.lineTo(hx + 22 * Math.cos(ang), hy + 22 * Math.sin(ang)); }
          ctx.closePath(); ctx.stroke();
        }
      }

      t++; animId = requestAnimationFrame(draw);
    };
    draw();

    const onMouse = e => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onResize = () => { W = window.innerWidth; H = window.innerHeight; canvas.width = W; canvas.height = H; };
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('mousemove', onMouse); window.removeEventListener('resize', onResize); };
  }, []);

  const inputClass = (name) => ({
    width: '100%',
    background: focused === name
      ? (isDark ? 'rgba(193,18,31,0.06)' : 'rgba(193,18,31,0.04)')
      : 'var(--bg-secondary)',
    border: focused === name ? '1px solid rgba(193,18,31,0.5)' : '1px solid var(--border-color)',
    borderRadius: '14px', padding: '13px 18px', color: 'var(--text-primary)',
    fontSize: '14px', outline: 'none', fontFamily: 'inherit',
    transition: 'all 0.3s', letterSpacing: '0.3px',
    boxShadow: focused === name ? '0 0 20px rgba(193,18,31,0.1)' : 'none',
  });

  const labelStyle = {
    fontSize: '10px', color: 'var(--text-secondary)',
    marginBottom: '6px', display: 'block', letterSpacing: '2px', textTransform: 'uppercase'
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif" }}>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
      <div className="fixed inset-0 pointer-events-none z-10" style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.03) 3px,rgba(0,0,0,0.03) 4px)', opacity: 0.4 }} />

      {/* Back button */}
      <button onClick={() => navigate('/')} className="fixed top-6 left-8 z-50 flex items-center gap-2 text-sm transition-all"
        style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
        ← Back
      </button>

      {/* Theme Toggle */}
      <div className="fixed top-6 right-8 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-20 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center text-2xl"
              style={{ background: '#C1121F', boxShadow: '0 0 40px rgba(193,18,31,0.7), 0 0 80px rgba(193,18,31,0.2)' }}>
              🩸
              <div className="absolute inset-0 rounded-full animate-ping" style={{ border: '1px solid rgba(193,18,31,0.4)', animationDuration: '2s' }} />
            </div>
            <div className="text-xs tracking-widest mb-3" style={{ color: 'rgba(193,18,31,0.6)', letterSpacing: '4px' }}>CREATE ACCOUNT</div>
            <h1 className="font-black text-5xl mb-2" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '-2px' }}>
              Join <span style={{ color: '#C1121F', fontStyle: 'italic', textShadow: '0 0 40px rgba(193,18,31,0.5)' }}>BloodBridge</span>
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
              Every registration saves a life
            </p>
          </div>

          {/* Role Toggle */}
          <div className="flex p-1.5 rounded-2xl mb-6 relative overflow-hidden"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            {['donor', 'hospital'].map(r => (
              <button key={r} onClick={() => setRole(r)}
                className="flex-1 py-3.5 rounded-xl font-medium text-sm transition-all relative overflow-hidden capitalize"
                style={role === r ? {
                  background: '#C1121F', color: '#fff',
                  boxShadow: '0 0 25px rgba(193,18,31,0.5)',
                  letterSpacing: '0.5px'
                } : { color: 'var(--text-secondary)', letterSpacing: '0.5px' }}>
                {r === 'donor' ? '🧑‍💼 Donor' : '🏥 Hospital'}
              </button>
            ))}
          </div>

          {/* Form Card */}
          <div className="rounded-3xl p-8 relative overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', backdropFilter: 'blur(30px)' }}>

            {/* Corner accent */}
            <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
              style={{ background: 'radial-gradient(circle at top right, rgba(193,18,31,0.08), transparent 70%)' }} />

            {error && (
              <div className="mb-5 p-4 rounded-2xl text-sm text-center animate-fadeInUp"
                style={{ background: 'rgba(193,18,31,0.08)', border: '1px solid rgba(193,18,31,0.25)', color: '#ff8080', letterSpacing: '0.3px' }}>
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div className="mb-5 p-4 rounded-2xl text-sm text-center"
                style={{ background: 'rgba(0,200,100,0.08)', border: '1px solid rgba(0,200,100,0.25)', color: '#80ffb0' }}>
                ✅ Account created! Redirecting...
              </div>
            )}

            <div className="space-y-4">
              {[
                { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Your full name' },
                { label: 'Email Address', name: 'email', type: 'email', placeholder: 'your@email.com' },
                { label: 'Password', name: 'password', type: 'password', placeholder: '••••••••' },
                { label: 'City', name: 'city', type: 'text', placeholder: 'Mumbai, Delhi, Bangalore...' },
                { label: 'Phone Number', name: 'phone', type: 'tel', placeholder: '+91 99999 99999' },
              ].map(f => (
                <div key={f.name}>
                  <label style={labelStyle}>{f.label}</label>
                  <input type={f.type} name={f.name} placeholder={f.placeholder}
                    style={inputClass(f.name)} onChange={handleChange}
                    onFocus={() => setFocused(f.name)}
                    onBlur={() => setFocused('')} />
                </div>
              ))}

              {role === 'donor' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>Blood Group</label>
                    <select name="bloodGroup" onChange={handleChange}
                      style={{ ...inputClass('bloodGroup'), cursor: 'pointer' }}
                      onFocus={() => setFocused('bloodGroup')}
                      onBlur={() => setFocused('')}>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg} style={{ background: 'var(--bg-card)' }}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Age</label>
                    <input type="number" name="age" placeholder="25" min="18" max="65"
                      style={inputClass('age')} onChange={handleChange}
                      onFocus={() => setFocused('age')} onBlur={() => setFocused('')} />
                  </div>
                </div>
              )}

              {role === 'hospital' && (
                <div>
                  <label style={labelStyle}>License Number</label>
                  <input type="text" name="licenseNumber" placeholder="Hospital license number"
                    style={inputClass('licenseNumber')} onChange={handleChange}
                    onFocus={() => setFocused('licenseNumber')} onBlur={() => setFocused('')} />
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading || success}
                className="w-full py-4 rounded-2xl font-semibold text-white relative overflow-hidden transition-all mt-2"
                style={{
                  background: '#C1121F',
                  boxShadow: '0 0 30px rgba(193,18,31,0.4)',
                  opacity: loading ? 0.8 : 1,
                  letterSpacing: '0.5px', fontSize: '15px'
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 50px rgba(193,18,31,0.8), 0 0 100px rgba(193,18,31,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(193,18,31,0.4)'; e.currentTarget.style.transform = 'none'; }}>
                <div className="absolute inset-0 opacity-30" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)' }} />
                <span className="relative z-10">
                  {loading ? '⏳ Creating Account...' : success ? '✅ Done!' : '🩸 Create Account'}
                </span>
              </button>
            </div>
          </div>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <span onClick={() => navigate('/login')} className="cursor-pointer transition-colors"
              style={{ color: '#C1121F' }}
              onMouseEnter={e => e.target.style.textDecoration = 'underline'}
              onMouseLeave={e => e.target.style.textDecoration = 'none'}>
              Login here
            </span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeInUp { animation: fadeInUp 0.4s ease both; }
      `}</style>
    </div>
  );
};

export default Register;