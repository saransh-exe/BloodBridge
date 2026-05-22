import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const PHRASES = [
  "When seconds matter, we deliver.",
  "Smart matching. Real donors.",
  "India's fastest blood network.",
  "Because every second counts.",
];

const TICKER_ITEMS = [
  { city: 'Mumbai', blood: 'O+ needed', level: 'URGENT' },
  { city: 'Delhi', blood: 'AB- needed', level: 'CRITICAL' },
  { city: 'Bangalore', blood: 'B+ needed', level: 'NORMAL' },
  { city: 'Chennai', blood: 'A- needed', level: 'URGENT' },
  { city: 'Hyderabad', blood: 'O- needed', level: 'CRITICAL' },
  { city: 'Pune', blood: 'AB+ needed', level: 'NORMAL' },
  { city: 'Kolkata', blood: 'B- needed', level: 'URGENT' },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [counts, setCounts] = useState({ lives: 0, hospitals: 0, donors: 0 });
  const [typeText, setTypeText] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const particles = Array.from({ length: 120 }, (_, i) => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 1.8 + 0.3,
      o: Math.random() * 0.5 + 0.1,
      pulse: Math.random() * Math.PI * 2,
      type: i % 12 === 0 ? 'drop' : 'dot',
    }));

    const drops = Array.from({ length: 10 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vy: Math.random() * 1.5 + 0.5,
      r: Math.random() * 5 + 3,
      o: Math.random() * 0.15 + 0.06,
      tail: [],
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

      [[W * 0.15, H * 0.25, W * 0.45, '193,18,31', isDark ? 0.09 : 0.04],
       [W * 0.85, H * 0.75, W * 0.35, '100,0,10', isDark ? 0.06 : 0.03],
       [mx, my, 200, '193,18,31', isDark ? 0.07 : 0.03]].forEach(([x, y, r, c, a]) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(${c},${a})`);
        g.addColorStop(1, `rgba(${c},0)`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      });

      const pulse = Math.sin(t * 0.03) * 0.5 + 0.5;
      ctx.lineWidth = 0.8;
      for (let r = 80; r < Math.max(W, H); r += 120) {
        ctx.strokeStyle = `rgba(193,18,31,${(isDark ? 0.03 : 0.02) + pulse * 0.02 * (1 - r / Math.max(W, H))})`;
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, r + Math.sin(t * 0.02 + r * 0.01) * 8, 0, Math.PI * 2);
        ctx.stroke();
      }

      particles.forEach(p => {
        p.pulse += 0.015;
        const glow = Math.sin(p.pulse) * 0.5 + 0.5;
        const dx = mouseRef.current.x - p.x, dy = mouseRef.current.y - p.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 150 && d > 0) { p.vx += dx / d * 0.015; p.vy += dy / d * 0.015; }
        p.vx *= 0.98; p.vy *= 0.98;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        const opacity = isDark ? p.o : p.o * 0.5;
        if (p.type === 'drop') {
          drawDrop(p.x, p.y, p.r, opacity * (0.4 + glow * 0.6));
        } else {
          const pr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
          pr.addColorStop(0, `rgba(193,18,31,${opacity * (0.4 + glow * 0.6)})`);
          pr.addColorStop(1, 'rgba(193,18,31,0)');
          ctx.fillStyle = pr; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = `rgba(193,18,31,${opacity * (0.5 + glow * 0.5)})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        }
      });

      particles.forEach((p, i) => {
        particles.slice(i + 1, i + 8).forEach(q => {
          const d = Math.sqrt((p.x - q.x) ** 2 + (p.y - q.y) ** 2);
          if (d < 90) {
            ctx.strokeStyle = `rgba(193,18,31,${(isDark ? 0.12 : 0.06) * (1 - d / 90)})`;
            ctx.lineWidth = 0.4;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        });
      });

      drops.forEach(d => {
        d.tail.unshift({ x: d.x, y: d.y });
        if (d.tail.length > 18) d.tail.pop();
        d.y += d.vy;
        if (d.y > H + 20) { d.y = -20; d.x = Math.random() * W; d.tail = []; }
        const dropOpacity = isDark ? d.o : d.o * 0.4;
        d.tail.forEach((pt, i) => {
          const a = (1 - i / d.tail.length) * dropOpacity * 0.5;
          ctx.globalAlpha = a; ctx.fillStyle = '#C1121F';
          ctx.beginPath(); ctx.arc(pt.x, pt.y, d.r * (1 - i / d.tail.length), 0, Math.PI * 2); ctx.fill();
        });
        ctx.globalAlpha = 1;
        drawDrop(d.x, d.y, d.r, dropOpacity);
      });

      const cols = Math.ceil(W / 80) + 1, rows = Math.ceil(H / 70) + 1;
      for (let xi = 0; xi < cols; xi++) {
        for (let yi = 0; yi < rows; yi++) {
          const hx = xi * 80 + (yi % 2) * 40, hy = yi * 70;
          const dist = Math.sqrt((hx - mouseRef.current.x) ** 2 + (hy - mouseRef.current.y) ** 2);
          const a = Math.max(0, (isDark ? 0.06 : 0.04) - dist * 0.00013);
          if (a > 0.003) {
            ctx.strokeStyle = `rgba(193,18,31,${a})`; ctx.lineWidth = 0.4;
            ctx.beginPath();
            for (let k = 0; k < 6; k++) {
              const ang = k * Math.PI / 3;
              ctx.lineTo(hx + 22 * Math.cos(ang), hy + 22 * Math.sin(ang));
            }
            ctx.closePath(); ctx.stroke();
          }
        }
      }

      t++; animId = requestAnimationFrame(draw);
    };
    draw();

    const onMouse = e => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
    };
  }, [isDark]);

  useEffect(() => {
    let pi = 0, ci = 0, deleting = false;
    const tick = () => {
      if (!deleting) {
        setTypeText(PHRASES[pi].slice(0, ++ci));
        if (ci === PHRASES[pi].length) { deleting = true; setTimeout(tick, 2000); return; }
      } else {
        setTypeText(PHRASES[pi].slice(0, --ci));
        if (ci === 0) { deleting = false; pi = (pi + 1) % PHRASES.length; }
      }
      setTimeout(tick, deleting ? 40 : 75);
    };
    const t = setTimeout(tick, 1000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const targets = { lives: 4247, hospitals: 128, donors: 9834 };
    let step = 0;
    const t = setInterval(() => {
      step++;
      const e = 1 - Math.pow(1 - step / 80, 3);
      setCounts({
        lives: Math.floor(targets.lives * e),
        hospitals: Math.floor(targets.hospitals * e),
        donors: Math.floor(targets.donors * e),
      });
      if (step >= 80) clearInterval(t);
    }, 25);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="overflow-x-hidden" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif" }}>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* Scanlines */}
      <div className="fixed inset-0 pointer-events-none z-10"
        style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,var(--scanline) 3px,var(--scanline) 4px)', opacity: 0.4 }} />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-10 py-5"
        style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(30px)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-3"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 900, letterSpacing: '-0.5px' }}>
          <div className="relative w-9 h-9 rounded-full flex items-center justify-center text-base"
            style={{ background: '#C1121F', boxShadow: '0 0 20px rgba(193,18,31,0.6)' }}>
            🩸
            <div className="absolute inset-0 rounded-full animate-ping"
              style={{ border: '1px solid rgba(193,18,31,0.5)', animationDuration: '2s' }} />
          </div>
          BloodBridge
        </div>
        <div className="flex gap-3 items-center">
          <ThemeToggle />
          <button onClick={() => navigate('/login')}
            className="px-5 py-2 rounded-full text-sm transition-all"
            style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)', background: 'none' }}
            onMouseEnter={e => { e.target.style.borderColor = 'rgba(193,18,31,0.5)'; e.target.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.color = 'var(--text-secondary)'; }}>
            Login
          </button>
          <button onClick={() => navigate('/register')}
            className="px-6 py-2 rounded-full text-sm font-medium text-white relative overflow-hidden transition-all"
            style={{ background: '#C1121F', boxShadow: '0 0 20px rgba(193,18,31,0.4)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 40px rgba(193,18,31,0.8), 0 0 80px rgba(193,18,31,0.3)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(193,18,31,0.4)'}>
            Join Now
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center relative z-20 px-8 pt-24 pb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs mb-8 animate-fadeInUp"
          style={{ border: '1px solid rgba(193,18,31,0.2)', background: 'rgba(193,18,31,0.05)', color: 'var(--text-secondary)', letterSpacing: '1px' }}>
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"
            style={{ boxShadow: '0 0 8px #C1121F' }} />
          LIVE · REAL-TIME DONATION NETWORK · INDIA
        </div>

        <h1 className="text-center font-black leading-none mb-6 animate-fadeInUp"
          style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(56px,9vw,110px)', letterSpacing: '-4px', animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
          Every Drop
          <span className="block relative"
            style={{ color: '#C1121F', textShadow: '0 0 80px rgba(193,18,31,0.6), 0 0 160px rgba(193,18,31,0.2)', fontStyle: 'italic' }}>
            Saves a Life
          </span>
        </h1>

        <div className="text-center mb-10 h-8 animate-fadeInUp"
          style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: 300, letterSpacing: '0.5px' }}>
            {typeText}
            <span className="inline-block w-0.5 h-4 ml-0.5 bg-red-600 animate-pulse" />
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14 animate-fadeInUp"
          style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
          <button onClick={() => navigate('/register')}
            className="px-10 py-4 rounded-full font-semibold text-white relative overflow-hidden transition-all group"
            style={{ background: '#C1121F', boxShadow: '0 0 30px rgba(193,18,31,0.5)', fontSize: '15px' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 60px rgba(193,18,31,0.9), 0 0 120px rgba(193,18,31,0.3)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(193,18,31,0.5)'; e.currentTarget.style.transform = 'none'; }}>
            🩸 Become a Donor
          </button>
          <button onClick={() => navigate('/register')}
            className="px-10 py-4 rounded-full font-semibold transition-all"
            style={{ border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: '15px' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(193,18,31,0.4)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.transform = 'none'; }}>
            🏥 Register Hospital
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl animate-fadeInUp"
          style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}>
          {[
            { val: `${counts.lives.toLocaleString()}+`, label: 'LIVES SAVED' },
            { val: `${counts.hospitals}+`, label: 'HOSPITALS' },
            { val: `${counts.donors.toLocaleString()}+`, label: 'DONORS' },
            { val: '24/7', label: 'AVAILABLE' },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl p-4 text-center relative overflow-hidden transition-all group"
              style={{ border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}
              onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(193,18,31,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.border = '1px solid var(--border-color)'; e.currentTarget.style.transform = 'none'; }}>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
                style={{ transitionDuration: '0.4s' }} />
              <div className="font-black text-3xl mb-1"
                style={{ fontFamily: "'Playfair Display', serif", color: '#C1121F', textShadow: '0 0 20px rgba(193,18,31,0.4)' }}>
                {s.val}
              </div>
              <div className="text-xs tracking-widest"
                style={{ color: 'var(--text-muted)', letterSpacing: '1.5px' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Live Ticker */}
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-4 px-8 py-3 overflow-hidden"
          style={{ borderTop: '1px solid var(--border-color)', background: 'var(--nav-bg)', backdropFilter: 'blur(20px)' }}>
          <span className="text-xs font-bold tracking-widest shrink-0 flex items-center gap-2"
            style={{ color: '#C1121F', letterSpacing: '2px' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            LIVE
          </span>
          <div className="flex-1 overflow-hidden">
            <div className="flex gap-10 whitespace-nowrap"
              style={{ animation: 'tickerScroll 25s linear infinite' }}>
              {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                <span key={i} className="text-xs shrink-0"
                  style={{ color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                  {item.city} · <span style={{ color: 'rgba(193,18,31,0.7)' }}>{item.blood}</span> · {item.level}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-28 px-8 relative z-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <div className="text-xs tracking-widest mb-4"
              style={{ color: 'rgba(193,18,31,0.7)', letterSpacing: '4px' }}>THE PROCESS</div>
            <h2 className="font-black text-5xl"
              style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '-2px' }}>
              How <span style={{ color: '#C1121F', textShadow: '0 0 40px rgba(193,18,31,0.5)', fontStyle: 'italic' }}>It Works</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '📝', num: '01', title: 'Register', desc: 'Sign up as a donor or hospital in under 2 minutes. Set your blood group, city, and availability.' },
              { icon: '🩸', num: '02', title: 'Request', desc: 'Hospitals post urgent blood requests. Our engine matches by blood type, city, and proximity instantly.' },
              { icon: '❤️', num: '03', title: 'Connect', desc: 'Matched donors get real-time alerts and respond. Every connection is a life saved.' },
            ].map((item, i) => (
              <div key={i} className="rounded-3xl p-8 relative overflow-hidden transition-all group"
                style={{ border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}
                onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(193,18,31,0.2)'; e.currentTarget.style.background = isDark ? 'rgba(193,18,31,0.03)' : 'rgba(193,18,31,0.02)'; e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 30px 80px rgba(193,18,31,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.border = '1px solid var(--border-color)'; e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div className="absolute top-6 right-6 font-black text-6xl"
                  style={{ fontFamily: "'Playfair Display', serif", color: isDark ? 'rgba(193,18,31,0.06)' : 'rgba(193,18,31,0.08)', letterSpacing: '-2px' }}>
                  {item.num}
                </div>
                <div className="text-4xl mb-6">{item.icon}</div>
                <div className="text-xs tracking-widest mb-3"
                  style={{ color: 'rgba(193,18,31,0.7)', letterSpacing: '3px' }}>{item.num}</div>
                <h3 className="font-black text-2xl mb-3"
                  style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-red-800 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
                  style={{ transitionDuration: '0.5s' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blood Groups */}
      <section className="py-20 px-8 relative z-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs tracking-widest mb-4"
              style={{ color: 'rgba(193,18,31,0.7)', letterSpacing: '4px' }}>COMPATIBILITY</div>
            <h2 className="font-black text-4xl"
              style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '-2px' }}>
              Blood <span style={{ color: '#C1121F', fontStyle: 'italic' }}>Groups</span> We Match
            </h2>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((bg, i) => (
              <div key={i} className="rounded-2xl p-4 text-center transition-all cursor-default"
                style={{ border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#C1121F'; e.currentTarget.style.border = '1px solid #C1121F'; e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(193,18,31,0.5)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.border = '1px solid var(--border-color)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.color = 'var(--text-primary)'; }}>
                <div className="font-black text-lg"
                  style={{ fontFamily: "'Playfair Display', serif" }}>{bg}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-8 relative z-20 mb-16">
        <div className="max-w-3xl mx-auto text-center rounded-3xl p-16 relative overflow-hidden"
          style={{ border: '1px solid rgba(193,18,31,0.2)', background: isDark ? 'rgba(193,18,31,0.04)' : 'rgba(193,18,31,0.06)' }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 50% 50%, rgba(193,18,31,0.1), transparent 70%)' }} />
          <div className="text-xs tracking-widest mb-6 relative z-10"
            style={{ color: 'rgba(193,18,31,0.7)', letterSpacing: '4px' }}>JOIN THE MISSION</div>
          <h2 className="font-black text-5xl mb-4 relative z-10"
            style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '-2px', color: 'var(--text-primary)' }}>
            Ready to Save<br />
            <span style={{ color: '#C1121F', fontStyle: 'italic' }}>a Life?</span>
          </h2>
          <p className="text-sm mb-10 relative z-10"
            style={{ color: 'var(--text-secondary)' }}>
            Join thousands of donors making a difference every single day.
          </p>
          <button onClick={() => navigate('/register')}
            className="px-14 py-4 rounded-full font-semibold text-white text-lg relative z-10 transition-all"
            style={{ background: '#C1121F', boxShadow: '0 0 40px rgba(193,18,31,0.5)' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 60px rgba(193,18,31,0.9), 0 0 120px rgba(193,18,31,0.3)'; e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(193,18,31,0.5)'; e.currentTarget.style.transform = 'none'; }}>
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
     <footer className="py-10 px-8 text-center relative z-20"
  style={{ borderTop: '1px solid var(--border-color)' }}>
  <div className="max-w-5xl mx-auto">
    <div className="flex flex-col items-center gap-4">

      {/* Logo */}
      <div className="flex items-center gap-2"
        style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '18px', color: 'var(--text-primary)' }}>
        <span style={{ color: '#C1121F' }}>🩸</span> BloodBridge
      </div>

      {/* Tagline */}
      <p style={{ color: 'var(--text-muted)', fontSize: '12px', letterSpacing: '2px' }}>
        CONNECTING DONORS WITH HOSPITALS · INDIA
      </p>

      {/* Divider */}
      <div style={{ width: '40px', height: '1px', background: 'rgba(193,18,31,0.4)' }} />

      {/* Developer credit */}
      <div className="flex flex-col items-center gap-2">
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          Designed & Developed by
        </p>
        <div className="flex items-center gap-3">
          <span className="font-black text-lg"
            style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Saransh Rathore
          </span>
          <span style={{ color: 'var(--border-color)' }}>·</span>
          <a href="https://instagram.com/saranshrathore28"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-medium"
            style={{ background: 'rgba(193,18,31,0.08)', border: '1px solid rgba(193,18,31,0.2)', color: '#C1121F', textDecoration: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(193,18,31,0.15)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(193,18,31,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(193,18,31,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}>
            📸 @saranshhunbhai
          </a>
        </div>
      </div>

      <p style={{ color: 'var(--text-muted)', fontSize: '11px', letterSpacing: '1px' }}>
        © 2024 BloodBridge · All rights reserved
      </p>
    </div>
  </div>
</footer>

      <style>{`
        @keyframes tickerScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeInUp { animation: fadeUp 0.7s ease both; }
      `}</style>
    </div>
  );
};

export default LandingPage;