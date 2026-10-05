// src/components/StoreClosedGate.jsx
'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Bricolage_Grotesque } from 'next/font/google';
import { supabase } from '@/lib/supabase';

const display = Bricolage_Grotesque({ subsets: ['latin'], display: 'swap' });

/* ---------- config ---------- */
const WHATSAPP_NUMBER = '923711343930';
const WHATSAPP_DISPLAY = '+92 371 1343930';
const EMAIL = 'pizzgerrawalpindi@gmail.com';
const ADDRESS = 'Main Tipu Road, Rawalpindi, Pakistan';

/* ---------- Pakistan time helpers ---------- */
const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;
const parseHHMM = (v, fallback = null) => {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(v || ''));
  if (!m) return fallback;
  return Math.min(23, parseInt(m[1], 10)) * 60 + Math.min(59, parseInt(m[2], 10));
};
const minutesOfDayPkt = (date) => {
  const p = new Date(date.getTime() + PKT_OFFSET_MS);
  return p.getUTCHours() * 60 + p.getUTCMinutes();
};
const isOpenNow = (settings, now = new Date()) => {
  if (!settings) return true;
  if (settings.is_open === false) return false;
  const openMin = parseHHMM(settings.opening_time, null);
  const closeMin = parseHHMM(settings.closing_time, null);
  if (openMin == null || closeMin == null) return true;
  const nowMin = minutesOfDayPkt(now);
  if (openMin === closeMin) return true;
  if (openMin < closeMin) return nowMin >= openMin && nowMin < closeMin;
  return nowMin >= openMin || nowMin < closeMin;
};
const fmtTime12 = (hhmm) => {
  const m = parseHHMM(hhmm, null);
  if (m == null) return hhmm || '';
  const h = Math.floor(m / 60);
  const min = m % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(min).padStart(2, '0')} ${period}`;
};

export default function StoreClosedGate() {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState(null);
  const [closed, setClosed] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from('settings')
          .select('is_open, opening_time, closing_time')
          .maybeSingle();
        if (cancelled) return;
        setSettings(data || null);
      } catch (err) {
        console.error('Store gate fetch failed:', err);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const ch = supabase
      .channel('customer-store-status')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings' }, (payload) => {
        if (!payload?.new) return;
        setSettings((prev) => ({ ...(prev || {}), ...payload.new }));
      })
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, []);

  useEffect(() => {
    if (!ready || !settings) return;
    const tick = () => setNow(new Date());
    const id = setInterval(tick, 30000);
    const onVis = () => { if (document.visibilityState === 'visible') tick(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [ready, settings]);

  useEffect(() => {
    if (!ready || !settings) return;
    setClosed(!isOpenNow(settings, now));
  }, [ready, settings, now]);

  useEffect(() => {
    if (!closed) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [closed]);

  if (!ready || !closed) return null;

  const hoursText =
    settings.opening_time && settings.closing_time
      ? `${fmtTime12(settings.opening_time)} – ${fmtTime12(settings.closing_time)}`
      : 'Please contact us for timings';

  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi Pizzger! I tried to open the site but it says you're closed. Can you help?"
  )}`;
  const mailLink = `mailto:${EMAIL}?subject=${encodeURIComponent('Pizzger — Closed enquiry')}`;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scg-title"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="absolute inset-0 bg-[#1a1210]/92 backdrop-blur-md" />

      <div className="relative w-full max-w-sm bg-[#fff8e7] dark:bg-[#1a1210] text-[#1a1210] dark:text-white border-2 border-[#1a1210] dark:border-orange-500 rounded-3xl shadow-[8px_8px_0_#1a1210] dark:shadow-[8px_8px_0_#f97316] overflow-hidden my-auto">
        <div className="p-5 sm:p-6 space-y-3">

          {/* Logo + name + tagline */}
          <div className="flex flex-col items-center text-center gap-2">
            <div className="w-14 h-14 rounded-full border-2 border-[#1a1210] dark:border-orange-500 overflow-hidden bg-white relative shadow-[2px_2px_0_#1a1210] dark:shadow-[2px_2px_0_#f97316]">
              <Image
                src="/images/logo.webp"
                alt="Pizzger"
                fill
                sizes="56px"
                className="object-cover"
                priority
              />
            </div>
            <div>
              <h1 className={`${display.className} text-2xl font-extrabold tracking-tight leading-none`}>
                Pizzger
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1210]/60 dark:text-orange-200/70 mt-1">
                Daily dose of delicious
              </p>
            </div>
          </div>

          {/* Notice */}
          <div className="text-center space-y-1">
            <h2 id="scg-title" className={`${display.className} text-xl font-extrabold leading-tight`}>
              We are closed right now
            </h2>
            <p className="text-[12.5px] font-medium text-[#1a1210]/70 dark:text-orange-100/75 leading-snug">
              We&apos;re taking a short break. Come back soon.
            </p>
          </div>

          {/* Hours */}
          <div className="rounded-2xl border-2 border-[#1a1210] dark:border-orange-500/60 bg-white dark:bg-[#120d0a] px-4 py-3 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#1a1210]/55 dark:text-orange-200/55 mb-0.5">
              Opening hours
            </p>
            <p className={`${display.className} text-base font-extrabold leading-tight`}>{hoursText}</p>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-[#1a1210]/45 dark:text-orange-200/45 mt-0.5">
              Pakistan Standard Time
            </p>
          </div>

          {/* Contact buttons */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 h-10 rounded-2xl bg-[#25D366] text-white font-black uppercase tracking-wide text-[11px] border-2 border-[#1a1210] shadow-[3px_3px_0_#1a1210] hover:brightness-110 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </a>
            <a
              href={mailLink}
              className="flex items-center justify-center gap-1.5 h-10 rounded-2xl bg-[#1a1210] text-white font-black uppercase tracking-wide text-[11px] border-2 border-[#1a1210] shadow-[3px_3px_0_#1a1210] hover:brightness-110 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16v16H4z"/>
                <path d="m4 6 8 6 8-6"/>
              </svg>
              Email
            </a>
          </div>

          {/* Contact line */}
          <div className="flex items-center justify-center gap-2 text-[10px] font-semibold text-[#1a1210]/55 dark:text-orange-200/55 text-center">
            <a href={waLink} className="hover:text-orange-600 dark:hover:text-orange-300 transition">
              {WHATSAPP_DISPLAY}
            </a>
            <span className="opacity-40">•</span>
            <a href={mailLink} className="hover:text-orange-600 dark:hover:text-orange-300 transition break-all">
              {EMAIL}
            </a>
          </div>

          {/* Address */}
          <div className="text-center pt-2 border-t-2 border-dashed border-[#1a1210]/20 dark:border-orange-500/20">
            <p className="text-[12.5px] font-bold">{ADDRESS}</p>
          </div>
        </div>
      </div>
    </div>
  );
}