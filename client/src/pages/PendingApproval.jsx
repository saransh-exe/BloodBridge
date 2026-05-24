import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const PendingApproval = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.3, o: Math.random() * 0.3 + 0.05,
      pulse: Math.random() * Math.PI * 2,
    }));
    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.5);
      g.addColorStop(0, `rgba(193,18,31,${isDark ? 0.07 : 0.03})`);
      g.addColorStop(1, 'rgba(193,18,31,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      particles.forEach(p => {
        p.pulse += 0.02; p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        const glow = Math.sin(p.pulse) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(193,18,31,${p.o * (0.4 + glow * 0.6) * (isDark ? 1 : 0.5)})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, [isDark]);

  return (
    <div className="min-h-screen flex items-center justify-center relative"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif" }}>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />

      <div className="relative z-10 text-center max-w-md px-8">
        {/* Icon */}
        <div className="w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center text-4xl relative"
          style={{ background: 'rgba(193,18,31,0.1)', border: '2px solid rgba(193,18,31,0.3)', boxShadow: '0 0 40px rgba(193,18,31,0.2)' }}>
          ⏳
          <div className="absolute inset-0 rounded-full animate-ping"
            style={{ border: '1px solid rgba(193,18,31,0.3)', animationDuration: '2s' }} />
        </div>

        {/* Label */}
        <div className="text-xs tracking-widest mb-4"
          style={{ color: 'rgba(193,18,31,0.7)', letterSpacing: '4px' }}>
          REGISTRATION RECEIVED
        </div>

        {/* Title */}
        <h1 className="font-black text-4xl mb-4"
          style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '-1px' }}>
          Under <span style={{ color: '#C1121F', fontStyle: 'italic' }}>Review</span>
        </h1>

        {/* Message */}
        <p className="text-base mb-4 leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}>
          Thank you for registering your hospital on BloodBridge!
        </p>

        {/* Info Card */}
        <div className="rounded-2xl p-6 mb-8 text-left"
          style={{ background: 'var(--bg-card)', border: '1px solid rgba(193,18,31,0.2)' }}>
          <div className="space-y-3">
            {[
              { icon: '📋', text: 'Your registration is being reviewed by our team' },
              { icon: '⏰', text: 'Approval takes up to 24 hours' },
              { icon: '📧', text: 'You will receive an email once approved' },
              { icon: '🏥', text: 'You can login after approval to post blood requests' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-lg">{item.icon}</span>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button onClick={() => navigate('/')}
            className="w-full py-3 rounded-2xl font-semibold text-white transition-all"
            style={{ background: '#C1121F', boxShadow: '0 0 20px rgba(193,18,31,0.4)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 40px rgba(193,18,31,0.7)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(193,18,31,0.4)'}>
            🏠 Back to Home
          </button>
          <button onClick={() => navigate('/login')}
            className="w-full py-3 rounded-2xl font-semibold transition-all"
            style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)', background: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(193,18,31,0.4)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
            🔐 Login (after approval)
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;