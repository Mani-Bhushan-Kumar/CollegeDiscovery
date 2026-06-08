import { useState, useEffect, useRef, useCallback } from 'react';
import './auth.css';

// ─── Types ────────────────────────────────────────────────
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  msg: string;
}

interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  colorClass: string;
}

// ─── Utilities ───────────────────────────────────────────
function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: '', colorClass: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const map: Record<number, PasswordStrength> = {
    1: { score: 1, label: 'Weak', colorClass: 'strength-weak' },
    2: { score: 2, label: 'Fair', colorClass: 'strength-fair' },
    3: { score: 3, label: 'Good', colorClass: 'strength-good' },
    4: { score: 4, label: 'Strong', colorClass: 'strength-strong' },
  };
  return map[score] ?? { score: 0, label: '', colorClass: '' };
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string) {
  return /^[6-9]\d{9}$/.test(phone);
}

// ─── SVG Icons ───────────────────────────────────────────
const IconMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconPhone = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.07 3.4 2 2 0 0 1 3 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z"/>
  </svg>
);
const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/>
  </svg>
);
const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconLockSmall = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconAlertTriangle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconGoogle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);
const IconLinkedIn = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
  </svg>
);

// ─── College Discovery Illustration ──────────────────────
const HeroIllustration = () => (
  <svg viewBox="0 0 480 320" xmlns="http://www.w3.org/2000/svg" className="hero-svg-wrapper">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1E3A5F" stopOpacity="0.8"/>
        <stop offset="100%" stopColor="#2563EB" stopOpacity="0.3"/>
      </linearGradient>
      <linearGradient id="buildingGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3B82F6"/>
        <stop offset="100%" stopColor="#1E40AF"/>
      </linearGradient>
      <linearGradient id="buildingGrad2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#06B6D4"/>
        <stop offset="100%" stopColor="#0E7490"/>
      </linearGradient>
      <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,0.15)"/>
        <stop offset="100%" stopColor="rgba(255,255,255,0.05)"/>
      </linearGradient>
    </defs>

    {/* Background sky */}
    <rect width="480" height="320" fill="url(#sky)" rx="16"/>

    {/* Stars */}
    {[30,60,100,150,200,280,350,400,450,90,170,310].map((x, i) => (
      <circle key={i} cx={x} cy={15 + (i % 5) * 12} r="1.5" fill="white" opacity={0.4 + (i % 3) * 0.2}/>
    ))}

    {/* Main Building (center) */}
    <rect x="160" y="80" width="160" height="200" fill="url(#buildingGrad)" rx="4" opacity="0.9"/>
    {/* Columns */}
    {[175, 200, 225, 250, 275, 300].map((x, i) => (
      <rect key={i} x={x} y="130" width="10" height="150" fill="rgba(255,255,255,0.1)" rx="2"/>
    ))}
    {/* Roof */}
    <polygon points="130,80 240,30 350,80" fill="#1E40AF" opacity="0.9"/>
    <polygon points="145,80 240,38 335,80" fill="#2563EB" opacity="0.7"/>
    {/* Pediment circle */}
    <circle cx="240" cy="62" r="18" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
    <text x="240" y="67" textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">🎓</text>
    {/* Entablature */}
    <rect x="155" y="125" width="170" height="12" fill="rgba(255,255,255,0.2)" rx="2"/>
    {/* Windows */}
    {[175, 215, 255, 295].map((x, i) => (
      <rect key={i} x={x} y="145" width="22" height="30" fill="rgba(255,255,255,0.25)" rx="3" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
    ))}
    {[175, 215, 255, 295].map((x, i) => (
      <rect key={i} x={x} y="190" width="22" height="30" fill="rgba(255,255,255,0.2)" rx="3" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
    ))}
    {/* Main door */}
    <rect x="216" y="240" width="48" height="40" fill="rgba(255,255,255,0.3)" rx="4 4 0 0"/>
    <rect x="220" y="244" width="18" height="36" fill="rgba(0,0,0,0.15)" rx="2"/>
    <rect x="242" y="244" width="18" height="36" fill="rgba(0,0,0,0.1)" rx="2"/>

    {/* Left building */}
    <rect x="40" y="140" width="100" height="140" fill="url(#buildingGrad2)" rx="3" opacity="0.8"/>
    <rect x="40" y="135" width="100" height="10" fill="rgba(255,255,255,0.2)" rx="2"/>
    {[50, 75, 100].map((x, i) => (
      <rect key={i} x={x} y="155" width="16" height="22" fill="rgba(255,255,255,0.25)" rx="2"/>
    ))}
    {[50, 75, 100].map((x, i) => (
      <rect key={i} x={x} y="190" width="16" height="22" fill="rgba(255,255,255,0.2)" rx="2"/>
    ))}
    <rect x="64" y="240" width="32" height="40" fill="rgba(255,255,255,0.25)" rx="2 2 0 0"/>

    {/* Right building */}
    <rect x="340" y="150" width="100" height="130" fill="#1E3A5F" rx="3" opacity="0.85" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
    <rect x="340" y="145" width="100" height="10" fill="rgba(255,255,255,0.15)" rx="2"/>
    {[350, 375, 400].map((x, i) => (
      <rect key={i} x={x} y="165" width="16" height="22" fill="rgba(6,182,212,0.4)" rx="2"/>
    ))}
    {[350, 375, 400].map((x, i) => (
      <rect key={i} x={x} y="200" width="16" height="22" fill="rgba(6,182,212,0.3)" rx="2"/>
    ))}
    <rect x="364" y="245" width="32" height="35" fill="rgba(255,255,255,0.2)" rx="2 2 0 0"/>

    {/* Ground */}
    <rect x="0" y="278" width="480" height="42" fill="rgba(15,23,42,0.6)" rx="0 0 16 16"/>
    <rect x="0" y="274" width="480" height="8" fill="rgba(37,99,235,0.4)"/>

    {/* Floating Info Cards */}
    {/* Card 1 - Top left */}
    <g transform="translate(12, 55)">
      <rect width="120" height="52" fill="url(#cardGrad)" rx="10" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
      <circle cx="18" cy="18" r="10" fill="rgba(37,99,235,0.6)"/>
      <text x="18" y="22" textAnchor="middle" fontSize="10">🏛️</text>
      <text x="34" y="14" fontSize="8.5" fill="white" fontWeight="600">IIT Bombay</text>
      <text x="34" y="26" fontSize="7" fill="rgba(255,255,255,0.6)">CSE • ₹2.2L/yr</text>
      <text x="12" y="44" fontSize="7" fill="#22C55E">⭐ 4.8 • Excellent</text>
    </g>

    {/* Card 2 - Right side */}
    <g transform="translate(340, 55)">
      <rect width="128" height="52" fill="url(#cardGrad)" rx="10" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
      <circle cx="18" cy="18" r="10" fill="rgba(6,182,212,0.6)"/>
      <text x="18" y="22" textAnchor="middle" fontSize="10">🎯</text>
      <text x="34" y="14" fontSize="8.5" fill="white" fontWeight="600">Rank Predictor</text>
      <text x="34" y="26" fontSize="7" fill="rgba(255,255,255,0.6)">JEE Rank 450</text>
      <text x="12" y="44" fontSize="7" fill="#06B6D4">12 Colleges Eligible</text>
    </g>

    {/* Card 3 - Bottom center floating */}
    <g transform="translate(148, 234)">
      <rect width="184" height="42" fill="rgba(34,197,94,0.15)" rx="10" stroke="rgba(34,197,94,0.3)" strokeWidth="1"/>
      <text x="12" y="16" fontSize="8" fill="rgba(255,255,255,0.7)" fontWeight="600">PLACEMENT ALERT</text>
      <text x="12" y="30" fontSize="9" fill="white" fontWeight="700">IIT Delhi → Google ₹48 LPA 🎉</text>
    </g>

    {/* Students (stick figures walking) */}
    <g transform="translate(200, 258)" opacity="0.7">
      <circle cx="0" cy="0" r="6" fill="#60A5FA"/>
      <line x1="0" y1="6" x2="0" y2="18" stroke="#60A5FA" strokeWidth="2"/>
      <line x1="-7" y1="12" x2="7" y2="10" stroke="#60A5FA" strokeWidth="2"/>
      <line x1="0" y1="18" x2="-5" y2="26" stroke="#60A5FA" strokeWidth="2"/>
      <line x1="0" y1="18" x2="5" y2="26" stroke="#60A5FA" strokeWidth="2"/>
    </g>
    <g transform="translate(225, 255)" opacity="0.65">
      <circle cx="0" cy="0" r="6" fill="#34D399"/>
      <line x1="0" y1="6" x2="0" y2="18" stroke="#34D399" strokeWidth="2"/>
      <line x1="-7" y1="11" x2="7" y2="12" stroke="#34D399" strokeWidth="2"/>
      <line x1="0" y1="18" x2="-5" y2="26" stroke="#34D399" strokeWidth="2"/>
      <line x1="0" y1="18" x2="5" y2="26" stroke="#34D399" strokeWidth="2"/>
    </g>
    <g transform="translate(255, 258)" opacity="0.6">
      <circle cx="0" cy="0" r="6" fill="#A78BFA"/>
      <line x1="0" y1="6" x2="0" y2="18" stroke="#A78BFA" strokeWidth="2"/>
      <line x1="-7" y1="12" x2="7" y2="10" stroke="#A78BFA" strokeWidth="2"/>
      <line x1="0" y1="18" x2="-5" y2="26" stroke="#A78BFA" strokeWidth="2"/>
      <line x1="0" y1="18" x2="5" y2="26" stroke="#A78BFA" strokeWidth="2"/>
    </g>

    {/* Decorative floating dots */}
    {[{x:320,y:100,c:'#06B6D4'},{x:130,y:100,c:'#3B82F6'},{x:430,y:130,c:'#22C55E'}].map((dot,i)=>(
      <circle key={i} cx={dot.x} cy={dot.y} r="5" fill={dot.c} opacity="0.6"/>
    ))}
  </svg>
);

// ─── Toast Component ─────────────────────────────────────
function ToastContainer({ toasts, onRemove }: { toasts: Toast[], onRemove: (id: string) => void }) {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'info' && 'ℹ'}
            {toast.type === 'warning' && '⚠'}
          </div>
          <div className="toast-body">
            <div className="toast-title">{toast.title}</div>
            <div className="toast-msg">{toast.msg}</div>
          </div>
          <button className="toast-close" onClick={() => onRemove(toast.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ─── OTP Verification Modal ───────────────────────────────
function OTPModal({ email, onClose, onVerified }: { email: string; onClose: () => void; onVerified: () => void }) {
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newValues = [...otpValues];
    newValues[index] = value.slice(-1);
    setOtpValues(newValues);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otp = otpValues.join('');
    if (otp.length < 6) return;
    setVerifying(true);
    await new Promise(r => setTimeout(r, 1500));
    setVerifying(false);
    onVerified();
  };

  const handleResend = () => {
    setOtpValues(['', '', '', '', '', '']);
    setTimer(30);
    setCanResend(false);
    inputRefs.current[0]?.focus();
  };

  const otpFilled = otpValues.filter(Boolean).length === 6;

  return (
    <div className="auth-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="auth-modal">
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        <div className="otp-icon">📱</div>
        <div className="otp-title">Verify Your Email</div>
        <p className="otp-subtitle">
          We've sent a 6-digit verification code to{' '}
          <span className="otp-email-highlight">{email || 'your email'}</span>.
          It expires in 10 minutes.
        </p>

        <div className="otp-inputs">
          {otpValues.map((val, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={val}
              className={`otp-input ${val ? 'otp-filled' : ''}`}
              onChange={e => handleOtpChange(i, e.target.value)}
              onKeyDown={e => handleOtpKeyDown(i, e)}
              onFocus={e => e.target.select()}
              aria-label={`OTP digit ${i + 1}`}
            />
          ))}
        </div>

        <div className="otp-resend">
          {canResend ? (
            <>Didn't receive code? <button onClick={handleResend}>Resend OTP</button></>
          ) : (
            <>Resend in <span className="otp-timer">{timer}s</span></>
          )}
        </div>

        <button
          className="auth-btn-primary"
          onClick={handleVerify}
          disabled={!otpFilled || verifying}
        >
          {verifying ? <><div className="btn-spinner" /> Verifying...</> : 'Verify & Continue'}
        </button>
      </div>
    </div>
  );
}

// ─── Success Modal ────────────────────────────────────────
function SuccessModal({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal" style={{ textAlign: 'center' }}>
        <div className="success-checkmark-wrapper">
          <div className="success-circle">
            <span className="success-tick">✓</span>
          </div>
        </div>
        <div className="otp-title" style={{ marginBottom: '0.5rem' }}>
          {message === 'login' ? 'Welcome Back! 👋' : 'Account Created! 🎉'}
        </div>
        <p className="otp-subtitle" style={{ marginBottom: '2rem' }}>
          {message === 'login'
            ? 'You have successfully signed in. Redirecting you to your dashboard...'
            : 'Your account has been created. Start discovering your perfect college today!'}
        </p>
        <button className="auth-btn-primary" onClick={onClose}>
          {message === 'login' ? 'Go to Dashboard' : 'Explore Colleges'}
        </button>
      </div>
    </div>
  );
}

// ─── Password Requirements Indicator ─────────────────────
function PasswordReqs({ password }: { password: string }) {
  const reqs = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="password-requirements">
      {reqs.map((req, i) => (
        <div key={i} className={`req-item ${req.met ? 'met' : ''}`}>
          <div className="req-dot">
            {req.met && <span className="req-checkmark">✓</span>}
          </div>
          <span>{req.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Password Strength Bar ────────────────────────────────
function StrengthMeter({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  if (!password) return null;

  return (
    <div className="password-strength">
      <div className="strength-bars">
        {[1, 2, 3, 4].map(level => (
          <div
            key={level}
            className={`strength-bar ${level <= strength.score ? `${strength.colorClass} filled` : ''}`}
            style={{
              background: level <= strength.score
                ? level === 1 ? '#EF4444' : level === 2 ? '#F59E0B' : level === 3 ? '#22C55E' : '#10B981'
                : '#E2E8F0'
            }}
          />
        ))}
      </div>
      {strength.label && (
        <span className={`strength-label ${strength.colorClass}`}>
          Password strength: {strength.label}
        </span>
      )}
    </div>
  );
}

// ─── Input Field ──────────────────────────────────────────
interface FieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
  error?: string;
  valid?: boolean;
  autoComplete?: string;
  showToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  disabled?: boolean;
}

function AuthField({
  id, label, type = 'text', value, onChange, icon, error, valid,
  autoComplete, showToggle, showPassword, onTogglePassword, disabled
}: FieldProps) {
  return (
    <div className="auth-field">
      <div className="auth-input-wrapper">
        <input
          id={id}
          type={showToggle ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className={`auth-input ${error ? 'is-error' : valid ? 'is-valid' : ''} ${showToggle ? 'auth-input-with-suffix' : ''}`}
          placeholder={label}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-label={label}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={!!error}
        />
        <label className="auth-label" htmlFor={id}>{label}</label>
        <div className="auth-input-icon">{icon}</div>
        {showToggle && (
          <button
            type="button"
            className="auth-input-suffix"
            onClick={onTogglePassword}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <IconEyeOff /> : <IconEye />}
          </button>
        )}
        {valid && !showToggle && (
          <div className="auth-input-suffix" style={{ color: '#22C55E', pointerEvents: 'none' }}>
            <IconCheck />
          </div>
        )}
      </div>
      {error && (
        <div className="auth-field-error" id={`${id}-error`} role="alert">
          <IconX /> {error}
        </div>
      )}
      {valid && !error && (
        <div className="auth-field-valid">
          <IconCheck /> Looks good!
        </div>
      )}
    </div>
  );
}

// ─── Login Form ───────────────────────────────────────────
function LoginForm({ onSuccess, addToast }: {
  onSuccess: () => void;
  addToast: (t: Omit<Toast, 'id'>) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = 'Email address is required';
    else if (!validateEmail(email)) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false);
    addToast({ type: 'success', title: 'Signed In!', msg: 'Welcome back to EduSelect.' });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="auth-form-heading">Welcome back 👋</div>
      <div className="auth-form-sub">Sign in to continue discovering your perfect college.</div>

      {showAlert && (
        <div className="security-alert">
          <div className="security-alert-icon"><IconAlertTriangle /></div>
          <div>
            <div className="security-alert-title">Suspicious Login Detected</div>
            <div className="security-alert-body">
              We noticed a login attempt from a new location (Mumbai, IN). 
              <button type="button" style={{background:'none',border:'none',color:'#2563EB',cursor:'pointer',fontSize:'0.8rem',fontWeight:600,padding:0,marginLeft:4}} onClick={() => setShowAlert(false)}>
                This was me ✓
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthField
        id="login-email"
        label="Email Address"
        type="email"
        value={email}
        onChange={v => { setEmail(v); if (errors.email) setErrors(p => ({ ...p, email: '' })); }}
        icon={<IconMail />}
        error={errors.email}
        valid={!!email && validateEmail(email) && !errors.email}
        autoComplete="email"
      />

      <AuthField
        id="login-password"
        label="Password"
        value={password}
        onChange={v => { setPassword(v); if (errors.password) setErrors(p => ({ ...p, password: '' })); }}
        icon={<IconLock />}
        error={errors.password}
        showToggle
        showPassword={showPw}
        onTogglePassword={() => setShowPw(p => !p)}
        autoComplete="current-password"
      />

      <div className="auth-checkbox-row">
        <label className="auth-checkbox-label">
          <input
            type="checkbox"
            className="auth-checkbox"
            checked={rememberMe}
            onChange={e => setRememberMe(e.target.checked)}
          />
          Remember me for 30 days
        </label>
        <button type="button" className="auth-forgot">Forgot password?</button>
      </div>

      {/* CAPTCHA */}
      <div className="captcha-placeholder">
        <div className="captcha-checkbox-area">
          <input
            type="checkbox"
            className="auth-checkbox"
            checked={captchaChecked}
            onChange={e => setCaptchaChecked(e.target.checked)}
            style={{ marginBottom: 0 }}
          />
          <span>I'm not a robot</span>
        </div>
        <div className="captcha-logo">
          <span className="captcha-logo-icon">🔒</span>
          <span className="captcha-logo-label">reCAPTCHA</span>
        </div>
      </div>

      <button type="submit" className="auth-btn-primary" disabled={loading}>
        {loading ? (
          <><div className="btn-spinner" /> Signing in...</>
        ) : (
          <>Sign In to EduSelect <span style={{ fontSize: '1.1rem' }}>→</span></>
        )}
      </button>

      <div className="auth-divider">
        <div className="auth-divider-line" />
        <span className="auth-divider-text">or continue with</span>
        <div className="auth-divider-line" />
      </div>

      <div className="auth-social-row">
        <button
          type="button"
          className="auth-social-btn"
          onClick={() => addToast({ type: 'info', title: 'Google SSO', msg: 'Redirecting to Google login...' })}
        >
          <span className="social-icon-google"><IconGoogle /></span> Google
        </button>
        <button
          type="button"
          className="auth-social-btn"
          onClick={() => addToast({ type: 'info', title: 'LinkedIn SSO', msg: 'Redirecting to LinkedIn login...' })}
        >
          <span className="social-icon-linkedin"><IconLinkedIn /></span> LinkedIn
        </button>
      </div>

      <div className="security-badges">
        <div className="security-badge">
          <span className="security-badge-icon"><IconShield /></span> Secure Login
        </div>
        <div className="security-badge">
          <span className="security-badge-icon"><IconLockSmall /></span> SSL Encrypted
        </div>
        <div className="security-badge">
          <span className="security-badge-icon" style={{ color: '#2563EB', fontSize: '13px' }}>🔏</span> Privacy Protected
        </div>
      </div>
    </form>
  );
}

// ─── Signup Form (Multi-step) ─────────────────────────────
// function SignupForm({ onSuccess, onShowOTP, addToast }: {
//   onSuccess: () => void;
//   onShowOTP: () => void;
//   addToast: (t: Omit<Toast, 'id'>) => void;
// }) 
function SignupForm({ onShowOTP, addToast }: {
  onShowOTP: () => void;
  addToast: (t: Omit<Toast, 'id'>) => void;
}){
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showReqs, setShowReqs] = useState(false);

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) e.fullName = 'Full name must be at least 2 characters';
    if (!email) e.email = 'Email address is required';
    else if (!validateEmail(email)) e.email = 'Enter a valid email address';
    if (!phone) e.phone = 'Mobile number is required';
    else if (!validatePhone(phone)) e.phone = 'Enter a valid 10-digit Indian mobile number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    const strength = getPasswordStrength(password);
    if (!password) e.password = 'Password is required';
    else if (strength.score < 2) e.password = 'Password is too weak. Add uppercase, numbers, or symbols.';
    if (!confirmPw) e.confirmPw = 'Please confirm your password';
    else if (password !== confirmPw) e.confirmPw = 'Passwords do not match';
    if (!acceptTerms) e.terms = 'You must accept the Terms of Service to continue';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      addToast({ type: 'info', title: 'Step 1 Complete', msg: 'Now set a strong password to secure your account.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    onShowOTP();
  };

  const steps = [
    { label: 'Personal Info', num: 1 },
    { label: 'Security', num: 2 },
    { label: 'Verify', num: 3 },
  ];

  return (
    <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit} noValidate>
      <div className="auth-form-heading">Create account ✨</div>
      <div className="auth-form-sub">Join 500,000+ students on EduSelect for free.</div>

      {/* Multi-step progress indicator */}
      <div className="signup-steps" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3}>
        {/* {steps.map((s, i) => ( */}
        {steps.map((s) => (
          <div key={s.num} className={`step-item ${step > s.num ? 'completed' : step === s.num ? 'active' : ''}`}>
            <div className="step-circle">
              {step > s.num ? '✓' : s.num}
            </div>
            <span className="step-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Step 1: Personal Info */}
      {step === 1 && (
        <>
          <AuthField
            id="signup-name"
            label="Full Name"
            value={fullName}
            onChange={v => { setFullName(v); if (errors.fullName) setErrors(p => ({ ...p, fullName: '' })); }}
            icon={<IconUser />}
            error={errors.fullName}
            valid={fullName.trim().length >= 2 && !errors.fullName}
            autoComplete="name"
          />

          <AuthField
            id="signup-email"
            label="Email Address"
            type="email"
            value={email}
            onChange={v => { setEmail(v); if (errors.email) setErrors(p => ({ ...p, email: '' })); }}
            icon={<IconMail />}
            error={errors.email}
            valid={!!email && validateEmail(email) && !errors.email}
            autoComplete="email"
          />

          {/* Phone with country code */}
          <div className="auth-field">
            <div className="phone-group">
              <select className="phone-code-select" aria-label="Country code">
                <option value="+91">🇮🇳 +91</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
              </select>
              <div className="auth-input-wrapper">
                <input
                  id="signup-phone"
                  type="tel"
                  value={phone}
                  onChange={e => { setPhone(e.target.value.replace(/\D/, '')); if (errors.phone) setErrors(p => ({ ...p, phone: '' })); }}
                  className={`auth-input ${errors.phone ? 'is-error' : phone && validatePhone(phone) ? 'is-valid' : ''}`}
                  placeholder="Mobile Number"
                  autoComplete="tel"
                  maxLength={10}
                  aria-label="Mobile Number"
                />
                <label className="auth-label" htmlFor="signup-phone">Mobile Number</label>
                <div className="auth-input-icon"><IconPhone /></div>
              </div>
            </div>
            {errors.phone && (
              <div className="auth-field-error" role="alert"><IconX /> {errors.phone}</div>
            )}
            {phone && validatePhone(phone) && !errors.phone && (
              <div className="auth-field-valid"><IconCheck /> Looks good!</div>
            )}
          </div>

          <button type="submit" className="auth-btn-primary">
            Continue to Security Setup →
          </button>
        </>
      )}

      {/* Step 2: Password & Security */}
      {step === 2 && (
        <>
          <div className="auth-field">
            <div className="auth-input-wrapper">
              <input
                id="signup-password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setShowReqs(true);
                  if (errors.password) setErrors(p => ({ ...p, password: '' }));
                }}
                className={`auth-input auth-input-with-suffix ${errors.password ? 'is-error' : ''}`}
                placeholder="Password"
                autoComplete="new-password"
                aria-label="Password"
              />
              <label className="auth-label" htmlFor="signup-password">Create Password</label>
              <div className="auth-input-icon"><IconLock /></div>
              <button type="button" className="auth-input-suffix" onClick={() => setShowPw(p => !p)}>
                {showPw ? <IconEyeOff /> : <IconEye />}
              </button>
            </div>
            {errors.password && <div className="auth-field-error" role="alert"><IconX /> {errors.password}</div>}
            {password && <StrengthMeter password={password} />}
            {showReqs && password && <PasswordReqs password={password} />}
          </div>

          <AuthField
            id="signup-confirm-pw"
            label="Confirm Password"
            value={confirmPw}
            onChange={v => { setConfirmPw(v); if (errors.confirmPw) setErrors(p => ({ ...p, confirmPw: '' })); }}
            icon={<IconLock />}
            error={errors.confirmPw}
            valid={!!confirmPw && confirmPw === password && !errors.confirmPw}
            showToggle
            showPassword={showConfirmPw}
            onTogglePassword={() => setShowConfirmPw(p => !p)}
            autoComplete="new-password"
          />

          {/* CAPTCHA */}
          <div className="captcha-placeholder">
            <div className="captcha-checkbox-area">
              <input
                type="checkbox"
                className="auth-checkbox"
                checked={captchaChecked}
                onChange={e => setCaptchaChecked(e.target.checked)}
                style={{ marginBottom: 0 }}
              />
              <span>I'm not a robot</span>
            </div>
            <div className="captcha-logo">
              <span className="captcha-logo-icon">🔒</span>
              <span className="captcha-logo-label">reCAPTCHA</span>
            </div>
          </div>

          {/* Terms */}
          <div className="terms-checkbox-row">
            <input
              type="checkbox"
              className="auth-checkbox"
              id="accept-terms"
              checked={acceptTerms}
              onChange={e => { setAcceptTerms(e.target.checked); if (errors.terms) setErrors(p => ({ ...p, terms: '' })); }}
              style={{ marginTop: '2px', flexShrink: 0 }}
              aria-required="true"
            />
            <label className="terms-text" htmlFor="accept-terms">
              I agree to EduSelect's{' '}
              <a href="#" className="terms-link">Terms of Service</a>,{' '}
              <a href="#" className="terms-link">Privacy Policy</a>, and{' '}
              <a href="#" className="terms-link">Cookie Policy</a>
            </label>
          </div>
          {errors.terms && <div className="auth-field-error" style={{ marginTop: '-0.75rem', marginBottom: '1rem' }} role="alert"><IconX /> {errors.terms}</div>}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => { setStep(1); setErrors({}); }}
              style={{
                flex: '0 0 auto',
                padding: '0.9rem 1.25rem',
                background: 'transparent',
                border: '1.5px solid #E2E8F0',
                borderRadius: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                color: '#64748B',
                transition: 'all 0.2s',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              ← Back
            </button>
            <button type="submit" className="auth-btn-primary" disabled={loading} style={{ flex: 1 }}>
              {loading ? (
                <><div className="btn-spinner" /> Creating Account...</>
              ) : (
                <>Create Account 🎓</>
              )}
            </button>
          </div>

          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">or sign up with</span>
            <div className="auth-divider-line" />
          </div>

          <div className="auth-social-row">
            <button type="button" className="auth-social-btn"
              onClick={() => addToast({ type: 'info', title: 'Google SSO', msg: 'Redirecting to Google...' })}>
              <span className="social-icon-google"><IconGoogle /></span> Google
            </button>
            <button type="button" className="auth-social-btn"
              onClick={() => addToast({ type: 'info', title: 'LinkedIn SSO', msg: 'Redirecting to LinkedIn...' })}>
              <span className="social-icon-linkedin"><IconLinkedIn /></span> LinkedIn
            </button>
          </div>
        </>
      )}

      <div className="security-badges">
        <div className="security-badge">
          <span className="security-badge-icon"><IconShield /></span> Secure
        </div>
        <div className="security-badge">
          <span className="security-badge-icon"><IconLockSmall /></span> SSL Encrypted
        </div>
        <div className="security-badge">
          <span className="security-badge-icon" style={{ color: '#2563EB', fontSize: '13px' }}>🔏</span> Private
        </div>
      </div>
    </form>
  );
}

// ─── Main Auth Page ───────────────────────────────────────
interface AuthPageProps {
  onAuthSuccess?: () => void;
}

function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showOTP, setShowOTP] = useState(false);
  const [showSuccess, setShowSuccess] = useState<'login' | 'signup' | null>(null);
  // const [otpEmail, setOtpEmail] = useState('');
  const [otpEmail] = useState('');
  const addToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = generateId();
    setToasts(prev => [...prev, { ...t, id }]);
    setTimeout(() => setToasts(prev => prev.filter(toast => toast.id !== id)), 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleLoginSuccess = () => {
    setShowSuccess('login');
  };

  const handleSignupOTP = () => {
    setShowOTP(true);
    addToast({ type: 'info', title: 'OTP Sent!', msg: 'Check your email for the 6-digit verification code.' });
  };

  const handleOTPVerified = () => {
    setShowOTP(false);
    setShowSuccess('signup');
    addToast({ type: 'success', title: 'Email Verified!', msg: 'Your account is ready to use.' });
  };

  const handleSuccessClose = () => {
    setShowSuccess(null);
    onAuthSuccess?.();
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="auth-page" role="main">
        {/* ─── LEFT HERO PANEL ─── */}
        <div className="auth-hero" aria-hidden="true">
          <div className="hero-badge">
            <div className="hero-badge-dot" />
            #1 College Discovery Platform in India
          </div>

          <div className="hero-illustration">
            <HeroIllustration />
          </div>

          <h1 className="auth-hero-title">
            Discover Your<br />
            <span className="gradient-text">Perfect College</span>
          </h1>
          <p className="auth-hero-subtitle">
            Compare rankings, placements, fees, and student reviews across 10,000+ colleges. Make the right choice for your future.
          </p>

          <div className="hero-stats" role="list">
            <div className="hero-stat-card" role="listitem">
              <div className="hero-stat-icon">🏛️</div>
              <div className="hero-stat-number">10,000+</div>
              <div className="hero-stat-label">Colleges Listed</div>
            </div>
            <div className="hero-stat-card" role="listitem">
              <div className="hero-stat-icon">⭐</div>
              <div className="hero-stat-number">500K+</div>
              <div className="hero-stat-label">Student Reviews</div>
            </div>
            <div className="hero-stat-card" role="listitem">
              <div className="hero-stat-icon">📊</div>
              <div className="hero-stat-number">95%</div>
              <div className="hero-stat-label">Placement Coverage</div>
            </div>
          </div>
        </div>

        {/* ─── RIGHT AUTH PANEL ─── */}
        <div className="auth-panel">
          <div className="auth-card">
            {/* Mobile brand (visible only on small screens) */}
            <div className="mobile-brand">
              <div className="auth-brand-icon">E</div>
              <span className="auth-brand-name">EduSelect</span>
            </div>

            {/* Desktop brand */}
            <div className="auth-brand">
              <div className="auth-brand-icon">E</div>
              <span className="auth-brand-name">EduSelect</span>
            </div>

            {/* Tab Switcher */}
            <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
              <button
                role="tab"
                aria-selected={activeTab === 'login'}
                className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => { setActiveTab('login'); setShowOTP(false); }}
              >
                Sign In
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'signup'}
                className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
                onClick={() => { setActiveTab('signup'); setShowOTP(false); }}
              >
                Create Account
              </button>
            </div>

            {/* Forms */}
            {activeTab === 'login' ? (
              <LoginForm onSuccess={handleLoginSuccess} addToast={addToast} />
            ) : (
              // <SignupForm onSuccess={handleSignupOTP} onShowOTP={handleSignupOTP} addToast={addToast} />
              <SignupForm
  onShowOTP={handleSignupOTP}
  addToast={addToast}
/>
            )}

            {/* Switch link */}
            <div className="auth-switch">
              {activeTab === 'login' ? (
                <>Don't have an account?
                  <button onClick={() => setActiveTab('signup')}>Create one free</button>
                </>
              ) : (
                <>Already have an account?
                  <button onClick={() => setActiveTab('login')}>Sign in</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOTP && (
        <OTPModal
          email={otpEmail || 'your registered email'}
          onClose={() => setShowOTP(false)}
          onVerified={handleOTPVerified}
        />
      )}

      {/* Success Modal */}
      {showSuccess && (
        <SuccessModal message={showSuccess} onClose={handleSuccessClose} />
      )}
    </>
  );
}

export default AuthPage;
