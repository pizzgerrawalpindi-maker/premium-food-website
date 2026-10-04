'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

/* ---------- helpers ---------- */
const DEFAULT_HOURS = { open: '15:00', close: '02:00', forcedClosed: false };
const TIMEZONE = 'Asia/Karachi'; // restaurant time, not the visitor's device time

const toMins = (t) => {
  const [h, m] = String(t).split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};
const format12Hour = (t) => {
  if (!t) return '';
  const [h, m] = String(t).split(':').map(Number);
  return `${String(h % 12 === 0 ? 12 : h % 12).padStart(2, '0')}:${String(m || 0).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};
const nowInRestaurantMins = () => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE, hour: 'numeric', minute: 'numeric', hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (type) => Number(parts.find((p) => p.type === type)?.value || 0);
  return get('hour') * 60 + get('minute');
};
const readCartCount = () => {
  try {
    return JSON.parse(localStorage.getItem('food_cart') || '[]').reduce((n, i) => n + (i.quantity || 1), 0);
  } catch { return 0; }
};

const CartIcon = ({ className = 'w-5 h-5' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const inputCls =
  'w-full h-12 px-4 rounded-xl bg-white dark:bg-[#120D0A] border border-neutral-200 dark:border-orange-500/30 text-neutral-900 dark:text-white text-base outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15';

/* ---------- component ---------- */
export default function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hours, setHours] = useState(DEFAULT_HOURS);
  const [minutes, setMinutes] = useState(null); // null until mounted, avoids hydration mismatch

  // Auth form (placeholder logic kept as-is until backend is connected)
  const [authMode, setAuthMode] = useState('signin');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [formError, setFormError] = useState('');

  const headerRef = useRef(null);
  const closeBtnRef = useRef(null);

  /* Opening hours: fetch slowly, tick the clock separately */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data, error } = await supabase.from('settings').select('opening_time, closing_time, is_open').single();
        if (cancelled || error || !data) return; // on failure keep last known / default hours
        setHours({
          open: data.opening_time || DEFAULT_HOURS.open,
          close: data.closing_time || DEFAULT_HOURS.close,
          forcedClosed: data.is_open === false,
        });
      } catch { /* keep defaults */ }
    };
    const onVisible = () => document.visibilityState === 'visible' && load();
    load();
    const id = setInterval(load, 60000);
    document.addEventListener('visibilitychange', onVisible);
    return () => { cancelled = true; clearInterval(id); document.removeEventListener('visibilitychange', onVisible); };
  }, []);

  useEffect(() => {
    const tick = () => setMinutes(nowInRestaurantMins());
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  const isOpenNow = useMemo(() => {
    if (minutes === null) return null;
    if (hours.forcedClosed) return false;
    const o = toMins(hours.open), c = toMins(hours.close);
    return o < c ? minutes >= o && minutes < c : minutes >= o || minutes < c; // handles overnight
  }, [minutes, hours]);

  const timingText = `${format12Hour(hours.open)} – ${format12Hour(hours.close)}`;

  /* Cart count (real quantity) */
  useEffect(() => {
    const update = () => setCartCount(readCartCount());
    update();
    window.addEventListener('storage', update);
    window.addEventListener('cartUpdated', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('cartUpdated', update);
    };
  }, []);

  /* Theme */
  useEffect(() => {
    let dark = false;
    try {
      dark = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    } catch { /* ignore */ }
    document.documentElement.classList.toggle('dark', dark);
    setIsDarkMode(dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDarkMode;
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.theme = next ? 'dark' : 'light'; } catch { /* ignore */ }
    setIsDarkMode(next);
  };

  /* Publish header height so the sticky category bar on the menu page always sits right below it */
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const set = () => {
      const top = parseFloat(getComputedStyle(el).top) || 0;
      document.documentElement.style.setProperty('--site-header', `${Math.round(el.offsetHeight + top + 8)}px`);
    };
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => { ro.disconnect(); document.documentElement.style.removeProperty('--site-header'); };
  }, []);

  /* Drawer: Esc to close, lock page scroll, focus handling */
  useEffect(() => {
    if (!isMenuOpen) return;
    const previous = document.activeElement;
    const onKey = (e) => e.key === 'Escape' && setIsMenuOpen(false);
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previous?.focus?.();
    };
  }, [isMenuOpen]);

  const setField = (key) => (e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setFormError(''); };
  const switchMode = (mode) => { setAuthMode(mode); setFormError(''); };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (authMode === 'signin') {
      alert(`Signing in with Email: ${form.email}`);
    } else {
      if (form.password !== form.confirm) { setFormError('Passwords do not match.'); return; }
      alert(`Signing up Account for: ${form.name}`);
    }
  };

  const closeMenu = () => setIsMenuOpen(false);
  const badge = cartCount > 9 ? '9+' : cartCount;

  const status =
    isOpenNow === null
      ? { dot: 'bg-neutral-400', label: 'Checking hours…', sub: '' }
      : isOpenNow
      ? { dot: 'bg-emerald-500', label: 'Open now', sub: timingText }
      : { dot: 'bg-red-500', label: 'Closed', sub: `Opens at ${format12Hour(hours.open)}` };

  const roundBtn =
    'relative grid place-items-center rounded-full w-11 h-11 sm:w-12 sm:h-12 transition active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes drawer-in { from { transform: translateX(100%); } to { transform: none; } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @media (prefers-reduced-motion: no-preference) {
          .drawer-panel { animation: drawer-in .28s cubic-bezier(.2,.8,.2,1); }
          .drawer-backdrop { animation: fade-in .2s ease-out; }
        }
      ` }} />

      <header ref={headerRef} className="sticky top-2 sm:top-4 z-50 max-w-7xl mx-auto px-3 sm:px-8">
        <div className="rounded-3xl sm:rounded-full bg-white/90 dark:bg-[#120D0A]/90 backdrop-blur-xl border border-orange-500/30 shadow-xl shadow-orange-950/10 dark:shadow-black/40 px-3 sm:px-8 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 min-w-0 rounded-full focus-visible:outline-2 focus-visible:outline-orange-500" aria-label="Pizzger home">
            <Image
              src="/images/logo.webp"
              alt=""
              width={48}
              height={48}
              priority
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white dark:border-[#1c1410] shadow-md ring-2 ring-orange-500/50"
            />
            <span className="flex flex-col min-w-0">
              <span aria-hidden="true" className="text-xl sm:text-2xl font-black tracking-tighter text-neutral-900 dark:text-white leading-none">ᑭIᘔᘔGEᖇ</span>
              <span className="mt-1 text-[10px] sm:text-xs font-semibold italic text-neutral-500 dark:text-orange-200/70 leading-none truncate">Daily dose of delicious</span>
            </span>
          </Link>

          {/* Open / closed status: own row on phones, centered on larger screens */}
          <div
            role="status"
            className="order-3 sm:order-none w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-full bg-neutral-100 dark:bg-[#1a120e] border border-neutral-200/70 dark:border-orange-500/20 px-4 py-1.5"
          >
            <span className="relative flex w-2.5 h-2.5 shrink-0">
              {isOpenNow && <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-60 motion-safe:animate-ping" />}
              <span className={`relative w-2.5 h-2.5 rounded-full ${status.dot}`} />
            </span>
            <span className={`text-sm font-bold ${isOpenNow === false ? 'text-red-600 dark:text-red-400' : 'text-neutral-900 dark:text-orange-50'}`}>{status.label}</span>
            {status.sub && <span className="text-sm text-neutral-500 dark:text-orange-200/70">{status.sub}</span>}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/cart" aria-label={`Cart, ${cartCount} items`} className={`${roundBtn} bg-neutral-100 dark:bg-[#1a120e] text-neutral-800 dark:text-orange-100 border border-neutral-200/70 dark:border-orange-500/20 hover:bg-orange-500 hover:text-white`}>
              <CartIcon />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 grid place-items-center rounded-full bg-orange-600 text-white text-xs font-bold border-2 border-white dark:border-[#120D0A]">
                  {badge}
                </span>
              )}
            </Link>
            <button type="button" onClick={() => setIsMenuOpen(true)} aria-label="Open menu" aria-haspopup="dialog" className={`${roundBtn} bg-neutral-900 dark:bg-orange-600 text-white hover:bg-orange-700`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-60">
          <div className="drawer-backdrop absolute inset-0 bg-neutral-950/60 backdrop-blur-sm" onClick={closeMenu} />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Account and navigation"
            className="drawer-panel absolute inset-y-0 right-0 w-full max-w-md bg-white dark:bg-[#120D0A] dark:border-l dark:border-orange-500/30 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-neutral-100 dark:border-orange-500/20">
              <h2 className="text-lg font-extrabold text-neutral-900 dark:text-white">Account and menu</h2>
              <button ref={closeBtnRef} type="button" onClick={closeMenu} aria-label="Close menu"
                className="w-11 h-11 rounded-full grid place-items-center bg-neutral-100 dark:bg-[#1c1410] text-neutral-700 dark:text-orange-200 hover:bg-rose-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-5" style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}>
              {/* Guest card + auth (placeholder until backend is connected) */}
              <section className="rounded-3xl bg-neutral-50 dark:bg-[#18110E] border border-neutral-200/70 dark:border-orange-500/20 p-4 sm:p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 grid place-items-center">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900 dark:text-white leading-tight">Guest</p>
                    <p className="text-sm text-neutral-500 dark:text-orange-200/60">Sign in to track orders and rewards</p>
                  </div>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-3">
                  {authMode === 'signup' && (
                    <input type="text" autoComplete="name" placeholder="Full name" value={form.name} onChange={setField('name')} required className={inputCls} />
                  )}
                  <input type="email" autoComplete="email" inputMode="email" placeholder="Email address" value={form.email} onChange={setField('email')} required className={inputCls} />
                  <input type="password" autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'} placeholder="Password" value={form.password} onChange={setField('password')} required className={inputCls} />
                  {authMode === 'signup' && (
                    <input type="password" autoComplete="new-password" placeholder="Confirm password" value={form.confirm} onChange={setField('confirm')} required className={inputCls} />
                  )}
                  {formError && <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">{formError}</p>}
                  <button type="submit" className="w-full h-12 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition active:scale-[0.98]">
                    {authMode === 'signin' ? 'Sign in' : 'Create account'}
                  </button>
                </form>

                <p className="text-center text-sm text-neutral-500 dark:text-orange-200/70">
                  {authMode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                  <button type="button" onClick={() => switchMode(authMode === 'signin' ? 'signup' : 'signin')} className="font-bold text-orange-600 dark:text-orange-400 hover:underline">
                    {authMode === 'signin' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </section>

              {/* Navigation */}
              <nav className="space-y-3" aria-label="Main">
                <Link href="/menu" onClick={closeMenu} className="flex items-center justify-between h-14 px-4 rounded-2xl bg-neutral-50 dark:bg-[#18110E] border border-neutral-200/70 dark:border-orange-500/20 text-neutral-900 dark:text-orange-100 font-bold hover:bg-orange-500 hover:text-white transition-colors">
                  Explore menu <span aria-hidden="true">→</span>
                </Link>

                <div className="flex items-center justify-between h-14 px-4 rounded-2xl bg-neutral-50 dark:bg-[#18110E] border border-neutral-200/70 dark:border-orange-500/20 text-neutral-900 dark:text-orange-100 font-bold">
                  <span>{isDarkMode ? 'Dark mode' : 'Light mode'}</span>
                  <button type="button" role="switch" aria-checked={isDarkMode} aria-label="Dark mode" onClick={toggleTheme}
                    className={`relative w-14 h-8 rounded-full transition-colors ${isDarkMode ? 'bg-orange-600' : 'bg-neutral-300'}`}>
                    <span className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow grid place-items-center text-xs transition-transform ${isDarkMode ? 'translate-x-6' : ''}`}>{isDarkMode ? '🌙' : '☀️'}</span>
                  </button>
                </div>

                <button type="button" onClick={() => alert('Signed out successfully!')}
                  className="w-full flex items-center justify-between h-14 px-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 font-bold hover:bg-rose-500 hover:text-white transition-colors">
                  Sign out <span aria-hidden="true">⎋</span>
                </button>
              </nav>
            </div>

            <footer className="px-5 sm:px-7 py-4 border-t border-neutral-100 dark:border-orange-500/20 text-center space-y-2" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm font-semibold text-neutral-600 dark:text-orange-200/70">
                <Link href="/about" onClick={closeMenu} className="hover:text-orange-500">About us</Link>
                <Link href="/terms" onClick={closeMenu} className="hover:text-orange-500">Terms of service</Link>
                <Link href="/privacy" onClick={closeMenu} className="hover:text-orange-500">Privacy policy</Link>
              </div>
              <p className="text-xs text-neutral-400 dark:text-orange-200/40">&copy; 2026 Pizzger, Rawalpindi</p>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}