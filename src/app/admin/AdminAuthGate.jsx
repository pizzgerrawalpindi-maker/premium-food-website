'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

// This component gate-keeps everything passed as children.
// Nobody can register a new account here — only a pre-created
// Supabase Auth user (made once, from the Supabase dashboard) can
// ever sign in. After the password, a Google Authenticator (TOTP)
// code is required before the real dashboard is rendered.
export default function AdminAuthGate({ children }) {
  const [phase, setPhase] = useState('loading'); // loading | login | enroll | challenge | ready
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [factorId, setFactorId] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [busy, setBusy] = useState(false);

  // Refs mirror the state above so the auth-state logic (which can be
  // triggered from two places at once — the login handler and Supabase's
  // own onAuthStateChange event) always reads the LATEST values instead
  // of a stale closure, and never overlaps itself.
  const phaseRef = useRef('loading');
  const factorIdRef = useRef(null);
  const runningRef = useRef(false);

  function setPhaseSafe(p) {
    phaseRef.current = p;
    setPhase(p);
  }
  function setFactorIdSafe(id) {
    factorIdRef.current = id;
    setFactorId(id);
  }

  const refreshAuthState = useCallback(async () => {
    if (runningRef.current) return; // another run is already in flight — skip
    runningRef.current = true;
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setPhaseSafe('login');
        return;
      }

      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aalData?.currentLevel === 'aal2') {
        setPhaseSafe('ready');
        return;
      }

      // Password is correct (aal1) but the authenticator-app step isn't done yet.
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const verifiedTotp = factorsData?.totp?.find((f) => f.status === 'verified');

      if (verifiedTotp) {
        setFactorIdSafe(verifiedTotp.id);
        setPhaseSafe('challenge');
        return;
      }

      // Already showing a fresh QR code from this same session — don't
      // touch it again just because this function got called a second time.
      if (phaseRef.current === 'enroll' && factorIdRef.current) {
        return;
      }

      // Clean up any half-finished enrollment attempt (e.g. a previous
      // page load that generated a QR code but was never scanned) so the
      // same friendly name can be reused without a conflict error.
      const staleUnverified = (factorsData?.all || []).filter(
        (f) => f.factor_type === 'totp' && f.status === 'unverified'
      );
      for (const stale of staleUnverified) {
        await supabase.auth.mfa.unenroll({ factorId: stale.id });
      }

      // No authenticator enrolled yet on this account — first-time setup.
      const { data: enrollData, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Admin Authenticator',
      });

      if (error) {
        setErrorMsg(error.message);
        setPhaseSafe('login');
        return;
      }

      setFactorIdSafe(enrollData.id);
      setQrCode(enrollData.totp.qr_code);
      setSecret(enrollData.totp.secret);
      setPhaseSafe('enroll');
    } finally {
      runningRef.current = false;
    }
  }, []);

  useEffect(() => {
    refreshAuthState();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      refreshAuthState();
    });
    return () => listener?.subscription?.unsubscribe();
  }, [refreshAuthState]);

  async function handleLogin(e) {
    e.preventDefault();
    setErrorMsg('');
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setErrorMsg('Wrong credentials');
      return;
    }
    setPassword('');
    await refreshAuthState();
  }

  async function handleVerifyCode(e) {
    e.preventDefault();
    setErrorMsg('');
    setBusy(true);
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    setBusy(false);
    if (error) {
      setErrorMsg('Invalid or expired code. Please try again.');
      setCode('');
      return;
    }
    setCode('');
    await refreshAuthState();
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setEmail('');
    setPassword('');
    setCode('');
    setQrCode(null);
    setSecret(null);
    setFactorIdSafe(null);
    setPhaseSafe('login');
  }

  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 text-sm uppercase tracking-widest">Loading...</p>
      </div>
    );
  }

  if (phase === 'ready') {
    return (
      <>
        <button
          onClick={handleSignOut}
          className="fixed top-4 right-4 z-50 px-4 py-2 rounded-xl bg-gray-800 hover:bg-red-600/80 text-gray-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-gray-700/60 shadow-lg"
        >
          Sign Out
        </button>
        {children}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800/60 border border-gray-700/60 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-xl font-black uppercase text-orange-500 tracking-wider mb-1 text-center">
          Restaurant Admin
        </h1>

        {phase === 'login' && (
          <>
            <p className="text-xs text-gray-400 text-center mb-6">For authorized admins only</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                required
                placeholder="Admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              />
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              />
              {errorMsg && <p className="text-red-500 text-xs font-semibold">{errorMsg}</p>}
              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold uppercase text-sm tracking-wider transition-all cursor-pointer"
              >
                {busy ? 'Checking...' : 'Sign In'}
              </button>
            </form>
          </>
        )}

        {phase === 'enroll' && (
          <>
            <p className="text-xs text-gray-400 text-center mb-6">
              Scan To Register Yourself As An Admin (For First Time Only)
            </p>
            {qrCode && (
              <div className="bg-white p-3 rounded-xl w-fit mx-auto mb-4">
                <img src={qrCode} alt="Scan with Google Authenticator" className="w-44 h-44" />
              </div>
            )}
            {secret && (
              <p className="text-[10px] text-gray-500 text-center mb-6 break-all">
                Or try this key: <span className="text-gray-300 font-mono">{secret}</span>
              </p>
            )}
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 text-center tracking-[0.5em] text-lg focus:outline-none focus:border-orange-500"
              />
              {errorMsg && <p className="text-red-500 text-xs font-semibold">{errorMsg}</p>}
              <button
                type="submit"
                disabled={busy || code.length !== 6}
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold uppercase text-sm tracking-wider transition-all cursor-pointer"
              >
                {busy ? 'Verifying...' : 'Verify & Finish Setup'}
              </button>
            </form>
          </>
        )}

        {phase === 'challenge' && (
          <>
            <p className="text-xs text-gray-400 text-center mb-6">
              Enter the 6-digit code from your authenticator app to continue.
            </p>
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 text-center tracking-[0.5em] text-lg focus:outline-none focus:border-orange-500"
                autoFocus
              />
              {errorMsg && <p className="text-red-500 text-xs font-semibold">{errorMsg}</p>}
              <button
                type="submit"
                disabled={busy || code.length !== 6}
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold uppercase text-sm tracking-wider transition-all cursor-pointer"
              >
                {busy ? 'Verifying...' : 'Verify'}
              </button>
            </form>
            <button
              onClick={handleSignOut}
              className="w-full mt-4 text-[11px] text-gray-500 hover:text-gray-300 uppercase tracking-wider cursor-pointer"
            >
              Different account? Sign out
            </button>
          </>
        )}
      </div>
    </div>
  );
}