import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const PHRASES = ['Save a life today.', 'Every drop matters.', 'Be someone\'s hero.', 'Donate. Connect. Live.'];

const Login = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { login } = useAuth();
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState('');
  const [typeText, setTypeText] = useState('');

  const handleSubmit = async () => {
  setLoading(true); setError('');
  try {
    const res = await axios.post('https://bloodbridge-api-4nyf.onrender.com/api/auth/login', form);
    login(res.data.user, res.data.token);
    setSuccess(true);
    setTimeout(() => {
      navigate(res.data.user.role === 'donor' ? '/donor-dashboard' : '/hospital-dashboard');
    }, 1500);
  } catch (err) {
    setError(err.response?.data?.message || 'Invalid email or password');
  }
  setLoading(false);
};

  // Typewriter
  useEffect(() => {
    let pi = 0, ci = 0, del = false;
    const tick = () => {
      if (!del) {
        setTypeText(PHRASES[pi].slice(0, ++ci));
        if (ci === PHRASES[pi].length) { del = true; setTimeout(tick, 2000); return; }
      } else {
        setTypeText(PHRASES[pi].slice(0, --ci));
        if (ci === 0) { del = false; pi = (pi + 1) % PHRASES.length; }
      }
      setTimeout(tick, del ? 40 : 80);
    };
    const t = setTimeout(tick, 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const particles = Array.from({ length: 70 }, (_, i) => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.3, o: Math.random() * 0.4 + 0.08,
      pulse: Math.random() * Math.PI * 2, type: i % 10 === 0 ? 'drop' : 'dot',
    }));

    const drops = Array.from({ length: 6 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vy: Math.random() * 1.2 + 0.4, r: Math.random() * 4 + 2,
      o: Math.random() * 0.12 + 0.05, tail: [],
    }));

    const drawDrop = (x, y, r, o) => {
      ctx.save(); ctx.globalAlpha = o; ctx.fillStyle = '#C1121F';
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

      [[W * 0.2, H * 0.3, W * 0.4, '193,18,31', 0.08],
       [W * 0.8, H * 0.7, W * 0.3, '100,0,10', 0.05],
       [mx, my, 160, '193,18,31', 0.07]].forEach(([x, y, r, c, a]) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${c},${a})`); g.addColorStop(1, `rgba(${c},0)`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      });

      const pulse = Math.sin(t * 0.025) * 0.5 + 0.5;
      for (let r = 60; r < Math.max(W, H); r += 100) {
        ctx.strokeStyle = `rgba(193,18,31,${(0.02 + pulse * 0.018) * (1 - r / Math.max(W, H))})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.arc(W / 2, H / 2, r + Math.sin(t * 0.02 + r * 0.01) * 5, 0, Math.PI * 2); ctx.stroke();
      }

      particles.forEach(p => {
        p.pulse += 0.02;
        const glow = Math.sin(p.pulse) * 0.5 + 0.5;
        const dx = mx - p.x, dy = my - p.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 100 && d > 0) { p.vx += dx / d * 0.01; p.vy += dy / d * 0.01; }
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

      drops.forEach(d => {
        d.tail.unshift({ x: d.x, y: d.y });
        if (d.tail.length > 14) d.tail.pop();
        d.y += d.vy;
        if (d.y > H + 20) { d.y = -20; d.x = Math.random() * W; d.tail = []; }
        d.tail.forEach((pt, i) => {
          ctx.globalAlpha = (1 - i / d.tail.length) * d.o * 0.5;
          ctx.fillStyle = '#C1121F';
          ctx.beginPath(); ctx.arc(pt.x, pt.y, d.r * (1 - i / d.tail.length), 0, Math.PI * 2); ctx.fill();
        });
        ctx.globalAlpha = 1;
        drawDrop(d.x, d.y, d.r, d.o);
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

  const inputStyle = (name) => ({
    width: '100%',
    background: focused === name ? 'rgba(193,18,31,0.06)' : 'rgba(255,255,255,0.03)',
    border: focused === name ? '1px solid rgba(193,18,31,0.5)' : '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px', padding: '15px 18px', color: '#fff',
    fontSize: '14px', outline: 'none', fontFamily: 'inherit',
    transition: 'all 0.3s', letterSpacing: '0.3px',
    boxShadow: focused === name ? '0 0 20px rgba(193,18,31,0.1)' : 'none',
  });

  return (
    <div className="min-h-screen bg-[#030303] text-white relative overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
      <div className="fixed inset-0 pointer-events-none z-10" style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.03) 3px,rgba(0,0,0,0.03) 4px)', opacity: 0.4 }} />

      <button onClick={() => navigate('/')} className="fixed top-6 left-8 z-50 text-sm transition-all"
        style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}
        onMouseEnter={e => e.target.style.color = '#fff'}
        onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.3)'}>
        ← Back
      </button>

      <div className="fixed top-6 right-8 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-20 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">

          {/* Left side quote */}
          <div className="text-center mb-10">
            <div className="relative w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center text-2xl"
              style={{ background: '#C1121F', boxShadow: '0 0 40px rgba(193,18,31,0.7), 0 0 80px rgba(193,18,31,0.2)' }}>
              🩸
              <div className="absolute inset-0 rounded-full animate-ping" style={{ border: '1px solid rgba(193,18,31,0.4)', animationDuration: '2s' }} />
            </div>
            <div className="text-xs tracking-widest mb-3" style={{ color: 'rgba(193,18,31,0.6)', letterSpacing: '4px' }}>WELCOME BACK</div>
            <h1 className="font-black mb-3" style={{ fontFamily: "'Playfair Display', serif", fontSize: '48px', letterSpacing: '-2px' }}>
              Login to <span style={{ color: '#C1121F', fontStyle: 'italic', textShadow: '0 0 40px rgba(193,18,31,0.5)' }}>BloodBridge</span>
            </h1>
            <div className="h-6">
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px', fontWeight: 300, letterSpacing: '0.5px' }}>
                {typeText}
                <span className="inline-block w-0.5 h-4 ml-0.5 bg-red-600 animate-pulse" />
              </span>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-3xl p-8 relative overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(30px)' }}>

            <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
              style={{ background: 'radial-gradient(circle at top right, rgba(193,18,31,0.08), transparent 70%)' }} />
            <div className="absolute bottom-0 left-0 w-24 h-24 pointer-events-none"
              style={{ background: 'radial-gradient(circle at bottom left, rgba(193,18,31,0.05), transparent 70%)' }} />

            {error && (
              <div className="mb-5 p-4 rounded-2xl text-sm text-center"
                style={{ background: 'rgba(193,18,31,0.08)', border: '1px solid rgba(193,18,31,0.25)', color: '#ff8080' }}>
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div className="mb-5 p-4 rounded-2xl text-sm text-center"
                style={{ background: 'rgba(0,200,100,0.08)', border: '1px solid rgba(0,200,100,0.25)', color: '#80ffb0' }}>
                ✅ Welcome back! Redirecting...
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginBottom: '6px', display: 'block', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  Email Address
                </label>
                <input type="email" placeholder="your@email.com"
                  style={inputStyle('email')}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused('')} />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginBottom: '6px', display: 'block', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  Password
                </label>
                <input type="password" placeholder="••••••••"
                  style={inputStyle('password')}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
              </div>

              <button onClick={handleSubmit} disabled={loading || success}
                className="w-full py-4 rounded-2xl font-semibold text-white relative overflow-hidden transition-all"
                style={{ background: '#C1121F', boxShadow: '0 0 30px rgba(193,18,31,0.4)', fontSize: '15px', letterSpacing: '0.5px' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 50px rgba(193,18,31,0.8), 0 0 100px rgba(193,18,31,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(193,18,31,0.4)'; e.currentTarget.style.transform = 'none'; }}>
                <div className="absolute inset-0 opacity-30" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)' }} />
                <span className="relative z-10">
                  {loading ? '⏳ Logging in...' : success ? '✅ Welcome Back!' : '🩸 Login'}
                </span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-5">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '1px' }}>OR</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>

            {/* Blood group quick facts */}
            <div className="grid grid-cols-4 gap-2">
              {['O-', 'A+', 'B+', 'AB+'].map(bg => (
                <div key={bg} className="rounded-xl py-2 text-center transition-all"
                  style={{ background: 'rgba(193,18,31,0.06)', border: '1px solid rgba(193,18,31,0.1)', fontSize: '11px', fontWeight: 700, color: 'rgba(193,18,31,0.7)', cursor: 'default' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(193,18,31,0.15)'; e.currentTarget.style.color = '#C1121F'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(193,18,31,0.06)'; e.currentTarget.style.color = 'rgba(193,18,31,0.7)'; }}>
                  {bg}
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-sm mt-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
            New to BloodBridge?{' '}
            <span onClick={() => navigate('/register')} className="cursor-pointer"
              style={{ color: '#C1121F' }}
              onMouseEnter={e => e.target.style.textDecoration = 'underline'}
              onMouseLeave={e => e.target.style.textDecoration = 'none'}>
              Create account
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;