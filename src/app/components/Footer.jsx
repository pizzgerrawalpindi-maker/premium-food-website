'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp,
  FaPhoneAlt, FaEnvelope, FaRegClock,
  FaArrowUp,
  FaMoneyBillWave, FaCreditCard, FaMobileAlt,
} from 'react-icons/fa';
import { SiSnapchat } from 'react-icons/si';
import { supabase } from '@/lib/supabase';

/* ============================================================
   CONFIG
   ============================================================ */
const CONTACT = {
  phone: '0512743930',
  phoneDisplay: '051 274 3930',
  whatsapp: '923711343930',
  email: 'pizzgerrawalpindi@gmail.com',
  addressLine: 'Main Tipu Road, Rawalpindi',
  mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1661.5230292616598!2d73.0765117!3d33.604109400000006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38df95002642ad41%3A0x133f9e75ab400240!2sPizzGer!5e0!3m2!1sen!2s!4v1784721376048!5m2!1sen!2s',
};

const DEFAULT_HOURS = { opening_time: '15:00', closing_time: '02:00' };

const SOCIALS = [
  { name: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61583111042280#', Icon: FaFacebookF, tone: 'hover:bg-[#1877F2] hover:border-[#1877F2] hover:text-white' },
  { name: 'Instagram', href: 'https://www.instagram.com/pizzgerrwp/', Icon: FaInstagram, tone: 'hover:bg-[#E4405F] hover:border-[#E4405F] hover:text-white' },
  { name: 'Snapchat', href: 'https://www.snapchat.com/@pizzgerrwp', Icon: SiSnapchat, tone: 'hover:bg-[#FFFC00] hover:border-[#FFFC00] hover:text-black' },
  { name: 'TikTok', href: 'https://www.tiktok.com/@pizzger.rwp', Icon: FaTiktok, tone: 'hover:bg-black hover:border-black hover:text-white' },
];

const EXPLORE_LINKS = [
  { label: 'Full Menu', href: '/menu' },
  { label: 'Exclusive Deals', href: '/menu#exclusive-deals' },
  { label: 'About Us', href: '/about' },
];

const SUPPORT_LINKS = [
  { label: 'Track Order', href: '/cart' },
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
];

const PAYMENTS = [
  { label: 'Cash', Icon: FaMoneyBillWave },
  { label: 'Card', Icon: FaCreditCard },
  { label: 'COD', Icon: FaMobileAlt },
];

/* ============================================================
   TIME HELPERS
   ============================================================ */
const toMinutes = (hhmm) => {
  if (!hhmm) return null;
  const [h, m] = String(hhmm).split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const getKarachiMinutes = (d = new Date()) => {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Karachi',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(d);
    const h = Number(parts.find((p) => p.type === 'hour')?.value || 0);
    const m = Number(parts.find((p) => p.type === 'minute')?.value || 0);
    return h * 60 + m;
  } catch {
    return d.getHours() * 60 + d.getMinutes();
  }
};

const isWithinHours = (openingTime, closingTime, nowMinutes) => {
  const open = toMinutes(openingTime);
  const close = toMinutes(closingTime);
  if (open == null || close == null) return null;
  if (open < close) return nowMinutes >= open && nowMinutes < close;
  return nowMinutes >= open || nowMinutes < close;
};

const fmtTime = (hhmm) => {
  if (!hhmm) return '';
  const [h, m] = String(hhmm).split(':').map(Number);
  if (Number.isNaN(h)) return hhmm;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m || 0).padStart(2, '0')} ${suffix}`;
};

/* ============================================================
   Settings cache (5-min TTL)
   ============================================================ */
let __settingsCache = null;
let __settingsCacheAt = 0;
const CACHE_TTL = 5 * 60 * 1000;

async function fetchHoursCached() {
  if (__settingsCache && Date.now() - __settingsCacheAt < CACHE_TTL) {
    return __settingsCache;
  }
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('opening_time, closing_time')
      .single();
    if (error || !data) return null;
    __settingsCache = {
      opening_time: data.opening_time || DEFAULT_HOURS.opening_time,
      closing_time: data.closing_time || DEFAULT_HOURS.closing_time,
    };
    __settingsCacheAt = Date.now();
    return __settingsCache;
  } catch {
    return null;
  }
}

/* ============================================================
   Contact cards
   ============================================================ */
const buildContactCards = (hourLabel) => [
  { key: 'call', href: `tel:${CONTACT.phone}`, external: false, Icon: FaPhoneAlt, label: 'Call', value: CONTACT.phoneDisplay, tone: 'orange' },
  { key: 'whatsapp', href: `https://wa.me/${CONTACT.whatsapp}`, external: true, Icon: FaWhatsapp, label: 'WhatsApp', value: 'Chat now', tone: 'emerald' },
  { key: 'email', href: `mailto:${CONTACT.email}`, external: false, Icon: FaEnvelope, label: 'Email', value: 'Send message', tone: 'orange' },
  { key: 'hours', href: null, external: false, Icon: FaRegClock, label: 'Daily', value: hourLabel, tone: 'slate' },
];

/* ============================================================
   FOOTER
   ============================================================ */
export default function Footer() {
  const [nowMin, setNowMin] = useState(() => getKarachiMinutes());
  const [hours, setHours] = useState(DEFAULT_HOURS);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNowMin(getKarachiMinutes()), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchHoursCached().then((h) => {
      if (!cancelled && h) setHours(h);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isOpen = useMemo(
    () => isWithinHours(hours.opening_time, hours.closing_time, nowMin) !== false,
    [hours, nowMin]
  );

  const hourLabel = `${fmtTime(hours.opening_time)} – ${fmtTime(hours.closing_time)}`;
  const contactCards = useMemo(() => buildContactCards(hourLabel), [hourLabel]);

  return (
    <>
      <footer className="relative bg-white dark:bg-[#0A0705] text-neutral-800 dark:text-neutral-200 border-t border-neutral-200/80 dark:border-neutral-800/60 overflow-hidden transition-colors duration-300">
        {/* Ambient glow */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[320px] bg-gradient-to-t from-orange-500/10 via-amber-500/5 to-transparent blur-[120px] pointer-events-none" />
        {/* Top accent line */}
        <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 pb-6">
          {/* ── Brand row (compact) ──────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-200/80 dark:border-neutral-800/60">
            <div className="flex items-center gap-3">
              <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="Pizzger home">
                <Image
                  src="/images/logo.webp"
                  alt=""
                  width={48}
                  height={48}
                  priority
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white dark:border-[#1c1410] shadow-md ring-2 ring-orange-500/50 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300"
                />
                <span className="flex flex-col min-w-0">
                  <span aria-hidden="true" className="text-xl sm:text-2xl font-black tracking-tighter text-neutral-900 dark:text-white leading-none">
                    ᑭIᘔᘔGEᖇ
                  </span>
                  <span className="mt-1 text-[10px] sm:text-xs font-semibold italic text-neutral-500 dark:text-orange-200/70 leading-none truncate">
                    Daily dose of delicious
                  </span>
                </span>
              </Link>

              {/* Socials inline on desktop */}
              <div className="hidden md:flex items-center gap-1.5 ml-4 pl-4 border-l border-neutral-200 dark:border-neutral-800">
                {SOCIALS.map(({ name, href, Icon, tone }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Pizzger on ${name}`}
                    className={`w-9 h-9 rounded-xl grid place-items-center border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${tone}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Live status pill (compact) */}
            <div className={`self-start sm:self-auto inline-flex items-center gap-2.5 px-3 py-2 rounded-xl border ${
              isOpen ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'
            }`}>
              <span className="relative flex w-2 h-2">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isOpen ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'
                }`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  isOpen ? 'bg-emerald-500' : 'bg-rose-500'
                }`} />
              </span>
              <span className={`text-[11px] font-black uppercase tracking-widest ${
                isOpen ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
              }`}>
                {isOpen ? 'Open Now' : 'Closed'}
              </span>
              <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
                {hourLabel}
              </span>
            </div>
          </div>

          {/* ── Links + contact (compact grid) ───────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 py-6">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-600 dark:text-orange-400 mb-3">
                Explore
              </h3>
              <ul className="flex flex-col gap-2">
                {EXPLORE_LINKS.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-600 dark:text-orange-400 mb-3">
                Support
              </h3>
              <ul className="flex flex-col gap-2">
                {SUPPORT_LINKS.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-600 dark:text-orange-400 mb-3">
                Get In Touch
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {contactCards.map(({ key, href, external, Icon, label, value, tone }) => {
                  const toneClass = {
                    orange: 'hover:border-orange-500/50 hover:bg-orange-500/5',
                    emerald: 'hover:border-emerald-500/50 hover:bg-emerald-500/5',
                    slate: '',
                  }[tone];
                  const iconTone = {
                    orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 group-hover:bg-orange-500 group-hover:text-white',
                    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white',
                    slate: 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-300',
                  }[tone];

                  const inner = (
                    <>
                      <span className={`w-8 h-8 rounded-lg grid place-items-center transition-all shrink-0 ${iconTone}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <span className="flex flex-col min-w-0">
                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-500">
                          {label}
                        </span>
                        <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                          {value}
                        </span>
                      </span>
                    </>
                  );

                  const base = `group flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 transition-all ${toneClass}`;

                  return href ? (
                    <a
                      key={key}
                      href={href}
                      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className={base}
                    >
                      {inner}
                    </a>
                  ) : (
                    <div key={key} className={base}>{inner}</div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Map (compact, full width) ────────────── */}
          <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 mb-6">
            <div className="h-28 sm:h-36 relative group">
              <iframe
                title="Pizzger Location Map"
                src={CONTACT.mapEmbed}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="grayscale contrast-110 opacity-95 group-hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>

          {/* ── Bottom bar ───────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-200/80 dark:border-neutral-800/60">
            <p className="text-[10px] sm:text-xs font-black tracking-widest text-neutral-500 dark:text-neutral-400 uppercase text-center sm:text-left">
              © {new Date().getFullYear()} Pizzger · {CONTACT.addressLine} · All rights reserved
            </p>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mr-1">
                We accept
              </span>
              {PAYMENTS.map(({ label, Icon }) => (
                <span
                  key={label}
                  title={label}
                  className="w-7 h-7 rounded-lg grid place-items-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
                >
                  <Icon className="w-3 h-3" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Back to top */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
        className={`fixed right-4 sm:right-6 z-40 w-11 h-11 rounded-2xl bg-neutral-900 dark:bg-orange-600 text-white grid place-items-center shadow-2xl shadow-black/40 border border-orange-400/20 transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 ${
          showTop ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
        }`}
        style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <FaArrowUp className="w-4 h-4" />
      </button>
    </>
  );
}