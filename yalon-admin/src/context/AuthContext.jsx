import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

// ─── Idle timeout ────────────────────────────────────────────────────────────
// Sign out automatically after IDLE_MS of no user activity.
// We track mousemove, keydown, click, scroll, and touchstart — any of these
// resets the timer. The warning appears WARN_BEFORE_MS before forced sign-out
// so the user has a chance to stay logged in.
const IDLE_MS = 30 * 60 * 1000;        // 30 minutes
const WARN_BEFORE_MS = 2 * 60 * 1000;  // warn 2 min before

const IDLE_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

export function AuthProvider({ children }) {
  // undefined = loading, null = signed out, object = active session
  const [session, setSession] = useState(undefined);
  const [idleWarning, setIdleWarning] = useState(false);

  const idleTimer = useRef(null);
  const warnTimer = useRef(null);

  // ── Auth state ──────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // ── Idle timer ──────────────────────────────────────────────────────────────
  const clearTimers = useCallback(() => {
    clearTimeout(idleTimer.current);
    clearTimeout(warnTimer.current);
  }, []);

  const resetIdleTimer = useCallback(() => {
    clearTimers();
    setIdleWarning(false);

    // Show warning 2 min before auto sign-out
    warnTimer.current = setTimeout(() => {
      setIdleWarning(true);
    }, IDLE_MS - WARN_BEFORE_MS);

    // Force sign-out when idle limit reached
    idleTimer.current = setTimeout(async () => {
      setIdleWarning(false);
      await supabase.auth.signOut();
    }, IDLE_MS);
  }, [clearTimers]);

  useEffect(() => {
    // Only run idle tracking when there is an active session
    if (!session) {
      clearTimers();
      setIdleWarning(false);
      return;
    }

    resetIdleTimer();

    IDLE_EVENTS.forEach((evt) =>
      window.addEventListener(evt, resetIdleTimer, { passive: true })
    );

    return () => {
      clearTimers();
      IDLE_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, resetIdleTimer)
      );
    };
  }, [session, resetIdleTimer, clearTimers]);

  // ── Auth actions ────────────────────────────────────────────────────────────
  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signOut() {
    clearTimers();
    setIdleWarning(false);
    await supabase.auth.signOut();
  }

  // ── Role check ──────────────────────────────────────────────────────────────
  // app_metadata is set server-side only (service_role key) and cannot be
  // modified by the user via supabase.auth.updateUser(). user_metadata CAN be
  // modified by the user, so we never trust it for access control.
  const isStaff = session?.user?.app_metadata?.role === 'staff';

  return (
    <AuthContext.Provider
      value={{ session, isStaff, signIn, signOut, loading: session === undefined, idleWarning, resetIdleTimer }}
    >
      {/* Idle warning banner — shown 2 min before auto sign-out */}
      {idleWarning && (
        <div
          role="alert"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10000,
            background: 'var(--maroon)',
            color: '#fff',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            letterSpacing: '0.4px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <span>Your session will expire in 2 minutes due to inactivity.</span>
          <button
            onClick={resetIdleTimer}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.4)',
              color: '#fff',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              padding: '5px 14px',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Stay signed in
          </button>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
