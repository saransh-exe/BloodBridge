import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const canvasRef = useRef(null);

  const { formData, role } = location.state || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => { // eslint-disable-line react-hooks/exhaustive-deps
    if (!formData) { navigate('/register'); return; }
    const timer = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { setCanResend(true); clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;
    const particles = Array.from({ length: 50 }, () => ({
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
    const onResize = () => { W = window.innerWidth; H = window.innerHeight; canvas.width = W; canvas.height = H; };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', onResize); };
  }, [isDark]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pasted)) {
      const newOtp = [...otp];
      pasted.split('').forEach((char, i) => { if (i < 6) newOtp[i] = char; });
      setOtp(newOtp);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) { setError('Please enter all 6 digits'); return; }
    setLoading(true); setError('');
    try {
      await axios.post('https://bloodbridge-api-4nyf.onrender.com/api/otp/verify', {
        email: formData.email,
        otp: otpString
      });

      // Now register the user
      const res = await axios.post('https://bloodbridge-api-4nyf.onrender.com/api/auth/register', {
        ...formData, role
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setSuccess(true);
      setTimeout(() => {
        navigate(role === 'donor' ? '/donor-dashboard' : '/hospital-dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      await axios.post('http://localhost:5000/api/otp/send', {
        email: formData.email,
        name: formData.name
      });
      setCanResend(false);
      setResendTimer(30);
      setOtp(['', '', '', '', '', '']);
      setError('');
      inputRefs.current[0]?.focus();
      const timer = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) { setCanResend(true); clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif" }}>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
      <div className="fixed inset-0 pointer-events-none z-10"
        style={{ background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.02) 3px,rgba(0,0,0,0.02) 4px)', opacity: 0.4 }} />

      <button onClick={() => navigate('/register')}
        className="fixed top-6 left-8 z-50 text-sm transition-all"
        style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
        onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}>
        ← Back
      </button>

      <div className="fixed top-6 right-8 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-20 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center text-2xl"
              style={{ background: '#C1121F', boxShadow: '0 0 40px rgba(193,18,31,0.7), 0 0 80px rgba(193,18,31,0.2)' }}>
              📧
              <div className="absolute inset-0 rounded-full animate-ping"
                style={{ border: '1px solid rgba(193,18,31,0.4)', animationDuration: '2s' }} />
            </div>
            <div className="text-xs tracking-widest mb-3"
              style={{ color: 'rgba(193,18,31,0.6)', letterSpacing: '4px' }}>VERIFY EMAIL</div>
            <h1 className="font-black text-4xl mb-2"
              style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '-1px' }}>
              Check Your <span style={{ color: '#C1121F', fontStyle: 'italic' }}>Email</span>
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              We sent a 6-digit code to
            </p>
            <p className="text-sm font-semibold mt-1" style={{ color: '#C1121F' }}>
              {formData?.email}
            </p>
          </div>

          {/* OTP Card */}
          <div className="rounded-3xl p-8 relative overflow-hidden"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', backdropFilter: 'blur(30px)' }}>

            <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
              style={{ background: 'radial-gradient(circle at top right, rgba(193,18,31,0.06), transparent 70%)' }} />

            {error && (
              <div className="mb-5 p-4 rounded-2xl text-sm text-center"
                style={{ background: 'rgba(193,18,31,0.08)', border: '1px solid rgba(193,18,31,0.25)', color: '#ff8080' }}>
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div className="mb-5 p-4 rounded-2xl text-sm text-center"
                style={{ background: 'rgba(0,200,100,0.08)', border: '1px solid rgba(0,200,100,0.25)', color: '#80ffb0' }}>
                ✅ Verified! Creating your account...
              </div>
            )}

            {/* OTP Inputs */}
            <div className="mb-2">
              <label className="text-xs mb-4 block text-center"
                style={{ color: 'var(--text-secondary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                Enter 6-digit code
              </label>
              <div className="flex gap-3 justify-center" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text" maxLength={1} value={digit}
                    onChange={e => handleChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    className="text-center font-black text-2xl transition-all"
                    style={{
                      width: '48px', height: '56px',
                      background: digit ? 'rgba(193,18,31,0.1)' : 'var(--input-bg)',
                      border: digit ? '2px solid rgba(193,18,31,0.5)' : '1px solid var(--input-border)',
                      borderRadius: '14px', color: 'var(--text-primary)',
                      outline: 'none', fontFamily: 'monospace',
                      boxShadow: digit ? '0 0 15px rgba(193,18,31,0.15)' : 'none',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(193,18,31,0.6)'}
                    onBlur={e => e.target.style.borderColor = digit ? 'rgba(193,18,31,0.5)' : 'var(--input-border)'}
                  />
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="text-center mb-6 mt-4">
              {canResend ? (
                <button onClick={handleResend}
                  className="text-sm font-medium transition-all"
                  style={{ color: '#C1121F', background: 'none', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.target.style.textDecoration = 'none'}>
                  🔄 Resend OTP
                </button>
              ) : (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Resend code in <span style={{ color: '#C1121F', fontWeight: 600 }}>{resendTimer}s</span>
                </p>
              )}
            </div>

            {/* Verify Button */}
            <button onClick={handleVerify} disabled={loading || success}
              className="w-full py-4 rounded-2xl font-semibold text-white relative overflow-hidden transition-all"
              style={{
                background: '#C1121F',
                boxShadow: '0 0 30px rgba(193,18,31,0.4)',
                opacity: loading ? 0.8 : 1,
                fontSize: '15px', letterSpacing: '0.5px'
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 50px rgba(193,18,31,0.8)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(193,18,31,0.4)'; e.currentTarget.style.transform = 'none'; }}>
              <div className="absolute inset-0 opacity-30"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)' }} />
              <span className="relative z-10">
                {loading ? '⏳ Verifying...' : success ? '✅ Verified!' : '🔐 Verify OTP'}
              </span>
            </button>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
            Didn't receive the email? Check your spam folder
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;