'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bricolage_Grotesque } from 'next/font/google';
import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa';
import { SiSnapchat } from 'react-icons/si';
import { menuHref, rememberMenuTarget } from '@/lib/menuSlug';

const display = Bricolage_Grotesque({ subsets: ['latin'], display: 'swap' });

/* ---------- config ---------- */
const DEALS_SLUG = 'exclusive-deals';

const DEFAULT_OFFER = {
  is_active: true,
  badge: 'Limited-time offer',
  title: 'Jumbo deal.',
  highlight: 'Order now!',
  description: 'Order any favourite meal worth Rs. 1999 and get our crispy hot wings free.',
  img: '4',
  link: null,
  button_text: 'Claim this offer',
  price: null,
  old_price: null,
  ends_at: null,
};

/* ---------- helpers ---------- */
const getImagePath = (v) => {
  if (!v) return '/images/placeholder.webp';
  const s = String(v);
  return s.startsWith('/') || s.startsWith('http') ? s : `/images/${s}.webp`;
};
const getVideoPath = (v) => {
  if (!v) return '';
  const s = String(v);
  return s.startsWith('/') || s.startsWith('http') ? s : `/videos/${s}.webm`;
};
const fmt = (n) => `Rs. ${Number(n).toLocaleString('en-PK')}`;

const onMenuLinkClick = (href) => () => {
  const m = /^\/menu#(.+)$/.exec(href || '');
  if (m) rememberMenuTarget(decodeURIComponent(m[1]));
};

const Pic = ({ src, alt, priority = false, sizes = '(max-width: 768px) 90vw, 33vw', className = '', fit = 'object-fill' }) => {
  const path = getImagePath(src);
  return (
    <Image src={path} alt={alt} fill sizes={sizes} priority={priority} unoptimized={path.startsWith('http')}
      className={`${fit} ${className}`} />
  );
};

const SOCIALS = [
  { name: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61583111042280#', Icon: FaFacebookF, color: 'text-[#1877F2]' },
  { name: 'Instagram', href: 'https://www.instagram.com/pizzgerrwp/', Icon: FaInstagram, color: 'text-[#E4405F]' },
  { name: 'Snapchat', href: 'https://www.snapchat.com/@pizzgerrwp', Icon: SiSnapchat, color: 'text-[#FFFC00]',
    style: { filter: 'drop-shadow(1px 0 0 #000) drop-shadow(-1px 0 0 #000) drop-shadow(0 1px 0 #000) drop-shadow(0 -1px 0 #000)' } },
  { name: 'TikTok', href: 'https://www.tiktok.com/@pizzger.rwp', Icon: FaTiktok, color: 'text-black' },
];

/* ---------- hero slider ---------- */
function HeroSlider({ slides }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const touchX = useRef(null);
  const n = slides.length;
  const go = useCallback((k) => setI(((k % n) + n) % n), [n]);

  useEffect(() => { setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches); }, []);
  useEffect(() => {
    if (n <= 1 || paused || reduced) return;
    const id = setInterval(() => !document.hidden && setI((p) => (p + 1) % n), 5000);
    return () => clearInterval(id);
  }, [n, paused, reduced]);

  if (n === 0) return null;
  return (
    <div
      role="region" aria-roledescription="carousel" aria-label="Featured offers"
      className="nb relative aspect-[2.1/1] md:aspect-[2.7/1] rounded-3xl overflow-hidden bg-neutral-900"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; setPaused(true); }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - (touchX.current ?? 0);
        if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
        touchX.current = null; setPaused(false);
      }}
    >
      {slides.map((item, idx) => (
        <Link key={idx} href={item.link || '/menu'} onClick={onMenuLinkClick(item.link || '/menu')}
          aria-hidden={idx !== i} tabIndex={idx === i ? 0 : -1}
          aria-label={`Offer ${idx + 1} of ${n}`}
          className={`absolute inset-0 transition-opacity duration-700 ${idx === i ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'}`}>
          <Pic src={item.img} alt={`Offer ${idx + 1}`} priority={idx === 0} sizes="(max-width: 1360px) 100vw, 1360px" fit="object-fill" />
        </Link>
      ))}
      {n > 1 && (
        <div className="absolute bottom-2 sm:bottom-3 inset-x-0 z-20 flex justify-center gap-1">
          {slides.map((_, idx) => (
            <button key={idx} type="button" onClick={() => go(idx)} aria-label={`Go to offer ${idx + 1}`} aria-current={idx === i}
              className="h-6 px-1 grid place-items-center">
              <span className={`block h-2 rounded-full border border-black/60 transition-all duration-300 ${idx === i ? 'w-7 bg-[#FFC21A]' : 'w-2 bg-white/80'}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- limited-time offer ---------- */
function Countdown({ endsAt, now }) {
  const left = Math.max(0, endsAt - now);
  const parts = [
    ['days', Math.floor(left / 86400000)],
    ['hrs', Math.floor(left / 3600000) % 24],
    ['min', Math.floor(left / 60000) % 60],
    ['sec', Math.floor(left / 1000) % 60],
  ];
  return (
    <div className="flex items-center gap-2" role="timer" aria-label="Time left on this offer">
      {parts.map(([label, v]) => (
        <div key={label} className="min-w-14 rounded-xl bg-[#1a1210] text-[#FFC21A] text-center py-1.5 px-2">
          <div className="text-2xl font-extrabold tabular-nums leading-none">{String(v).padStart(2, '0')}</div>
          <div className="text-xs mt-0.5 opacity-80">{label}</div>
        </div>
      ))}
    </div>
  );
}

function OfferTicket({ offer, dealsSlug }) {
  const end = offer.ends_at ? new Date(offer.ends_at).getTime() : NaN;
  const hasEnd = !Number.isNaN(end);
  const [now, setNow] = useState(null);

  useEffect(() => {
    if (!hasEnd) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [hasEnd]);

  if (offer.is_active === false || (hasEnd && now !== null && now >= end)) return null;
  const href = offer.link || `/menu#${dealsSlug}`;
  const handleClick = onMenuLinkClick(href);

  return (
    <section className="max-w-340 mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-24" aria-labelledby="offer-title">
      <div className="nb rounded-3xl overflow-hidden bg-[#FFC21A] text-[#1a1210] grid md:grid-cols-[1.15fr_auto_1fr]">
        
        {/* Yellow Box Content */}
        <div className="order-3 md:order-1 p-6 sm:p-10 flex flex-col items-start gap-4">
          {offer.badge && (
            <span className="inline-block -rotate-2 rounded-lg bg-[#1a1210] text-[#FFC21A] text-sm font-bold px-3 py-1">{offer.badge}</span>
          )}
          <h2 id="offer-title" className={`${display.className} text-4xl sm:text-6xl font-extrabold leading-[0.95] tracking-tight`}>
            {offer.title}
            {offer.highlight && <span className="block text-orange-700">{offer.highlight}</span>}
          </h2>
          {offer.description && <p className="text-base sm:text-lg font-medium max-w-md whitespace-pre-line">{offer.description}</p>}
          {offer.price != null && offer.price !== '' && (
            <p className="flex items-baseline gap-3">
              <span className={`${display.className} text-4xl sm:text-5xl font-extrabold`}>{fmt(offer.price)}</span>
              {offer.old_price ? <span className="text-lg font-semibold line-through opacity-60">{fmt(offer.old_price)}</span> : null}
            </p>
          )}
          {hasEnd && now !== null && <Countdown endsAt={end} now={now} />}
          <Link href={href} onClick={handleClick}
            className="nb nb-press mt-1 inline-grid h-12 px-8 place-items-center rounded-2xl bg-[#1a1210] text-white font-extrabold">
            {offer.button_text || 'Claim this offer'}
          </Link>
        </div>

        {/* 🎟️ Yellow zigzag divider with slightly rounded tips */}
        <div aria-hidden="true" className="order-2 md:order-2 ticket-wave" />

        {/* Image Content */}
        <Link href={href} onClick={handleClick}
          aria-label={offer.title || 'Limited-time offer'}
          className="order-1 md:order-3 relative z-0 block min-h-56 md:min-h-full bg-orange-600">
          <Pic src={offer.img} alt={offer.title || 'Limited-time offer'} sizes="(max-width: 768px) 100vw, 40vw" fit="object-fill" />
        </Link>
      </div>
    </section>
  );
}

/* ---------- video tile ---------- */
function VideoTile({ src }) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const obs = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.4 });
    obs.observe(v);
    return () => obs.disconnect();
  }, []);
  const toggle = () => { const v = ref.current; if (v) v.paused ? v.play().catch(() => {}) : v.pause(); };
  return (
    <button type="button" onClick={toggle} aria-label="Play or pause video"
      className="nb snap-center shrink-0 w-44 sm:w-56 md:w-64 aspect-9/16 rounded-3xl overflow-hidden bg-[#1c1410]">
      <video ref={ref} src={getVideoPath(src)} loop muted playsInline preload="none" className="w-full h-full object-cover" />
    </button>
  );
}

const Heading = ({ title, sub, href, linkText }) => (
  <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
    <div>
      <h2 className={`${display.className} text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white`}>{title}</h2>
      {sub && <p className="mt-1 text-sm sm:text-base font-medium text-neutral-600 dark:text-orange-200/70">{sub}</p>}
    </div>
    {href && (
      <Link href={href} onClick={onMenuLinkClick(href)}
        className="shrink-0 text-sm font-bold underline underline-offset-4 decoration-2 decoration-orange-500">
        {linkText}
      </Link>
    )}
  </div>
);

/* ---------- page ---------- */
export default function HomeClientWrapper({ initialData }) {
  const sliderData = initialData?.slider || [];
  const promos = (initialData?.promos || []).slice(0, 3);
  const menuImages = initialData?.menuImages || [];
  const videos = initialData?.videos || [];
  const offer = initialData?.offer === undefined ? DEFAULT_OFFER : initialData.offer;
  const dealsSlug = initialData?.dealsSlug || DEALS_SLUG;

  const [when, setWhen] = useState('today');
  useEffect(() => {
    const h = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Karachi', hour: 'numeric', hourCycle: 'h23' }).format(new Date()));
    setWhen(h >= 17 || h < 5 ? 'tonight' : 'today');
  }, []);

  const [showCta, setShowCta] = useState(false);
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowCta(window.scrollY > 360);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMsg('Enter a valid email address, like name@example.com.');
      setOk(false);
      return;
    }
    setMsg("You're on the list! 🎉 Watch your inbox for deals.");
    setOk(true);
    setEmail('');
  };

  const wrap = 'max-w-340 mx-auto px-4 sm:px-6 lg:px-8';
  const bento = promos.length === 3;

  return (
    <div className="min-h-screen bg-(--paper) text-neutral-900 dark:text-neutral-100 selection:bg-orange-500 selection:text-white overflow-x-hidden antialiased pb-24 md:pb-0">
      <style dangerouslySetInnerHTML={{ __html: `
        :root { --ink: #1a1210; --paper: #fff8e7; }
        .dark { --ink: #fb923c; --paper: #120d0a; }
        .nb { border: 2px solid var(--ink); box-shadow: 4px 4px 0 var(--ink); }
        
        /* White outline container specifically */
        .nb-white { border: 2px solid #ffffff; box-shadow: 4px 4px 0 #ffffff; }
        
        .nb-press { transition: transform .12s, box-shadow .12s; }
        .nb-press:hover { transform: translate(-1px,-1px); box-shadow: 5px 5px 0 var(--ink); }
        .nb-press:active { transform: translate(3px,3px); box-shadow: 1px 1px 0 var(--ink); }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* 🎟️ Yellow zigzag divider with slightly rounded tips extending over the image */
        .ticket-wave {
          position: relative;
          z-index: 10;
          background-repeat: repeat-x;
          background-position: center;
          background-size: 24px 12px;
          height: 12px;
          margin-top: -12px; /* Shifts over the image on mobile */
          background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='12' viewBox='0 0 24 12'%3E%3Cpath d='M0,12 L10,2 Q12,0 14,2 L24,12 Z' fill='%23FFC21A'/%3E%3C/svg%3E");
        }
        @media (min-width: 768px) {
          .ticket-wave {
            margin-top: 0;
            margin-right: -12px; /* Shifts right over the image on desktop */
            background-repeat: repeat-y;
            background-size: 12px 24px;
            width: 12px;
            height: 100%;
            background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='24' viewBox='0 0 12 24'%3E%3Cpath d='M0,0 L10,10 Q12,12 10,14 L0,24 Z' fill='%23FFC21A'/%3E%3C/svg%3E");
          }
        }
      ` }} />

      {/* 1. Hero */}
      <section className={`${wrap} pt-6 sm:pt-12`}>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-6 sm:mb-10">
          <div className="max-w-2xl">
            <h1 className={`${display.className} text-5xl sm:text-7xl lg:text-8xl font-extrabold leading-[0.92] tracking-tighter text-neutral-900 dark:text-white`}>
              What are you craving <span className="nb inline-block -rotate-2 bg-[#FFC21A] text-[#1a1210] px-3 rounded-xl">{when}?</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg font-medium text-neutral-700 dark:text-orange-100/80 max-w-lg">
              Pizzas, burgers, shawarmas and more, made fresh and brought to your door.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/menu" className="nb nb-press h-14 px-8 grid place-items-center rounded-2xl bg-orange-600 text-white text-lg font-extrabold">Start your order</Link>
            <Link href={`/menu#${dealsSlug}`} onClick={onMenuLinkClick(`/menu#${dealsSlug}`)}
              className="nb nb-press h-14 px-6 grid place-items-center rounded-2xl bg-white dark:bg-[#1c1410] font-bold">Deals</Link>
          </div>
        </div>
        <HeroSlider slides={sliderData} />
      </section>

      {/* 2. Categories — grid on mobile (all tiles visible, no hidden scroll) */}
      {menuImages.length > 0 && (
        <section className={`${wrap} pt-14 sm:pt-24`}>
          <Heading title="Pick your craving" sub="Tap one and we'll take you straight to it." href="/menu" linkText="Full menu" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-6 justify-items-center">
            {menuImages.map((c, idx) => {
              const href = menuHref(c.category_slug);
              return (
                <Link
                  key={c.id ?? idx}
                  href={href}
                  onClick={() => rememberMenuTarget(c.category_slug)}
                  className="group w-full flex flex-col items-center gap-2 sm:gap-3 text-center"
                >
                  <span className="nb nb-press relative block w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden bg-white dark:bg-[#1c1410]">
                    {c.img ? (
                      <Pic src={c.img} alt="" sizes="(max-width: 640px) 80px, 128px" fit="object-fill" className="transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <span className="absolute inset-0 grid place-items-center bg-orange-100 dark:bg-[#2a1d16]">
                        <span className={`${display.className} text-2xl sm:text-3xl md:text-4xl font-extrabold text-orange-700 dark:text-orange-300`}>
                          {(c.name || '?').trim().charAt(0).toUpperCase()}
                        </span>
                      </span>
                    )}
                  </span>
                  <span className="font-extrabold text-xs sm:text-base md:text-lg leading-tight">{c.name}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Limited-time offer */}
      {offer && <OfferTicket offer={offer} dealsSlug={dealsSlug} />}

      {/* 4. Deals */}
      {promos.length > 0 && (
        <section className={`${wrap} pt-14 sm:pt-24`}>
          <Heading title="Exclusive deals" sub="Handcrafted and delivered fast." href={`/menu#${dealsSlug}`} linkText="See all deals" />
          <div className={`flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:overflow-visible pb-3 md:grid ${bento ? 'md:grid-cols-3 md:grid-rows-2 md:h-120' : promos.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
            {promos.map((p, idx) => {
              const href = p.link || `/menu#${dealsSlug}`;
              return (
                <Link key={idx} href={href} onClick={onMenuLinkClick(href)}
                  className={`nb nb-press group snap-center shrink-0 w-[78%] sm:w-[55%] aspect-4/5 md:w-auto relative rounded-3xl overflow-hidden bg-neutral-200 dark:bg-[#18110e] ${bento ? 'md:aspect-auto' : 'md:aspect-16/9'} ${bento && idx === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                  <Pic src={p.img} alt={`Deal ${idx + 1}`} sizes="(max-width: 768px) 80vw, 50vw" fit="object-fill" className="transition-transform duration-700 group-hover:scale-105" />
                  {p.badge && <span className="absolute top-3 left-3 z-10 -rotate-2 rounded-lg bg-[#FFC21A] text-[#1a1210] text-sm font-extrabold px-3 py-1 border-2 border-[#1a1210]">{p.badge}</span>}
                  <span className="absolute left-3 bottom-3 z-10 rounded-xl bg-white text-[#1a1210] text-sm font-extrabold px-4 py-2 border-2 border-[#1a1210]">Order this deal</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. Videos */}
      {videos.length > 0 && (
        <section className={`${wrap} pt-14 sm:pt-24`}>
          <Heading title="Taste the action" sub="Tap a video to pause or play." />
          <div className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 py-2 pr-2">
            {videos.map((v, idx) => <VideoTile key={idx} src={v.video_url} />)}
          </div>
        </section>
      )}

      {/* 6. Newsletter + social */}
      <section className={`${wrap} pt-14 sm:pt-24 pb-16 sm:pb-24`}>
        <div className="grid md:grid-cols-2 gap-5 sm:gap-8">
          <div className="nb rounded-3xl bg-white dark:bg-[#1c1410] p-6 sm:p-10 flex flex-col gap-5">
            <div>
              <h2 className={`${display.className} text-3xl sm:text-4xl font-extrabold tracking-tight`}>Get delicious alerts</h2>
              <p className="mt-2 font-medium text-neutral-600 dark:text-orange-100/70 max-w-md">Discount codes and secret menu drops, straight to your inbox.</p>
            </div>
            <form onSubmit={handleNewsletterSubmit} noValidate className="flex flex-col sm:flex-row gap-3">
              <label className="grow">
                <span className="sr-only">Email address</span>
                <input type="email" inputMode="email" autoComplete="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setMsg(''); }}
                  placeholder="Your email address"
                  className="w-full h-12 rounded-xl border-2 border-(--ink) bg-transparent px-4 text-base placeholder-neutral-500 focus:outline-none focus:ring-4 focus:ring-orange-500/30" />
              </label>
              <button type="submit" className="nb nb-press h-12 px-7 rounded-xl bg-orange-600 text-white font-extrabold">Subscribe</button>
            </form>
            <p role="status" className={`text-sm font-bold min-h-5 ${ok ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>{msg}</p>
          </div>

          {/* Clean White outline applied directly using .nb-white */}
          <div className="nb-white rounded-3xl bg-[#1a1210] text-white p-6 sm:p-10 flex flex-col gap-6 justify-center">
            <div>
              <h2 className={`${display.className} text-3xl sm:text-4xl font-extrabold tracking-tight`}>Follow the vibe</h2>
              <p className="mt-2 font-medium text-orange-100/80 max-w-md">Daily cravings and food drops, wherever you scroll.</p>
            </div>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              {SOCIALS.map(({ name, href, Icon, color, style }) => (
                <a key={name} href={href} target="_blank" rel="noreferrer noopener" aria-label={`Pizzger on ${name}`}
                  className={`w-14 h-14 sm:w-16 sm:h-16 grid place-items-center rounded-2xl bg-[#FFC21A] border-2 border-white hover:-translate-y-1 transition ${color}`}>
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" style={style} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky order button on phones */}
      <Link href="/menu" aria-hidden={!showCta} tabIndex={showCta ? 0 : -1}
        className={`nb nb-press md:hidden fixed inset-x-4 z-40 h-14 grid place-items-center rounded-2xl bg-orange-600 text-white font-extrabold text-lg transition-all duration-300 ${showCta ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}
        style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        Order now
      </Link>
    </div>
  );
}