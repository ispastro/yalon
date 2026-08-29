import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

// ─── Rate limiting ────────────────────────────────────────────────────────────
// Track failed attempts in sessionStorage so a page refresh doesn't reset it,
// but closing the tab does. After MAX_ATTEMPTS failures the form locks for
// LOCKOUT_SECONDS and shows a countdown.
const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;
const STORAGE_KEY = 'yalon_login_attempts';

function getAttemptData() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { count: 0, lockedUntil: null };
  } catch {
    return { count: 0, lockedUntil: null };
  }
}

function saveAttemptData(data) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function clearAttemptData() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Lockout state
  const [lockedOut, setLockedOut] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef(null);

  // ── Check lockout on mount and restore countdown if still active ──────────
  useEffect(() => {
    const data = getAttemptData();
    if (data.lockedUntil && Date.now() < data.lockedUntil) {
      activateLockout(Math.ceil((data.lockedUntil - Date.now()) / 1000));
    }
    return () => clearInterval(countdownRef.current);
  }, []);

  function activateLockout(seconds) {
    setLockedOut(true);
    setCountdown(seconds);
    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((s) => {
        if (s <= 1) {
          clearInterval(countdownRef.current);
          setLockedOut(false);
          // Reset attempts after lockout expires
          clearAttemptData();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Check lockout before attempting
    const attemptData = getAttemptData();
    if (attemptData.lockedUntil && Date.now() < attemptData.lockedUntil) {
      const remaining = Math.ceil((attemptData.lockedUntil - Date.now()) / 1000);
      activateLockout(remaining);
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      // Success — clear attempt counter
      clearAttemptData();
    } catch {
      const updated = {
        count: (attemptData.count || 0) + 1,
        lockedUntil: attemptData.lockedUntil,
      };

      if (updated.count >= MAX_ATTEMPTS) {
        updated.lockedUntil = Date.now() + LOCKOUT_SECONDS * 1000;
        saveAttemptData(updated);
        activateLockout(LOCKOUT_SECONDS);
        setError('');
      } else {
        saveAttemptData(updated);
        const remaining = MAX_ATTEMPTS - updated.count;
        setError(
          remaining === 1
            ? 'Incorrect email or password. 1 attempt remaining before lockout.'
            : `Incorrect email or password. ${remaining} attempts remaining.`
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <svg className="crown-watermark" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M5 20 L20 30 L30 12 L40 26 L50 8 L60 26 L70 12 L80 30 L95 20 L85 45 L15 45 Z" fill="#c9a15a" />
      </svg>

      <div className="login-card">
        <div className="login-brand">YALON</div>
        <div className="login-subtitle">Staff Dashboard</div>
        <div className="login-divider" />

        {lockedOut ? (
          <div
            role="alert"
            style={{
              textAlign: 'center',
              padding: '24px 0',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
            <div style={{ fontSize: 12, color: 'var(--maroon)', fontWeight: 500, marginBottom: 8 }}>
              Too many failed attempts
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginBottom: 20 }}>
              Try again in
            </div>
            <div
              style={{
                fontSize: 36,
                fontWeight: 600,
                color: 'var(--forest)',
                letterSpacing: 2,
                marginBottom: 8,
              }}
            >
              {String(Math.floor(countdown / 60)).padStart(2, '0')}:
              {String(countdown % 60).padStart(2, '0')}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
              This device has been temporarily locked.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="login-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                autoFocus
                required
                placeholder="you@example.com"
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  style={{ paddingRight: 42 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: 'var(--ink-muted)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? (
                    /* Eye-off icon */
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    /* Eye icon */
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="inline-error" role="alert">{error}</div>
            )}

            <button
              className="btn btn-primary login-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
