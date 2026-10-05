'use client';
import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { withStableSlugs, consumeMenuTarget } from '@/lib/menuSlug';

/* ---------- helpers ---------- */
const getImageSrc = (v) => {
  if (!v) return '/images/placeholder.webp';
  const s = String(v);
  return s.startsWith('/') || s.startsWith('http') ? s : `/images/${s}.webp`;
};
const parsePrice = (v) => parseInt(String(v ?? '0').replace(/[^\d]/g, ''), 10) || 0;
const fmt = (n) => `Rs. ${Number(n).toLocaleString('en-PK')}`;
const readCart = () => {
  try { return JSON.parse(localStorage.getItem('food_cart') || '[]'); } catch { return []; }
};
const writeCart = (cart) => {
  try {
    localStorage.setItem('food_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  } catch (e) { console.error('Cart update failed', e); }
};

/* normalize: same rules as server-side slugify */
const norm = (s) =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/* ---------- card ---------- */
const MenuCard = memo(function MenuCard({ title, description, price, pricingOptions, imageNum, priority = false }) {
  const hasSizes = Array.isArray(pricingOptions) && pricingOptions.length > 0;
  const [size, setSize] = useState('');
  const [needSize, setNeedSize] = useState(false);
  const [qty, setQty] = useState(0);

  const finalSize = hasSizes ? size : 'Standard';
  const unitPrice = hasSizes
    ? parsePrice(pricingOptions.find((p) => p.size === size)?.price)
    : parsePrice(price);
  const lowest = hasSizes ? Math.min(...pricingOptions.map((p) => parsePrice(p.price))) : 0;

  useEffect(() => {
    const sync = () =>
      setQty(readCart().find((i) => i.title === title && i.size === finalSize)?.quantity || 0);
    sync();
    window.addEventListener('cartUpdated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('cartUpdated', sync);
      window.removeEventListener('storage', sync);
    };
  }, [title, finalSize]);

  const change = useCallback((delta) => {
    if (hasSizes && !size) { setNeedSize(true); return; }
    setNeedSize(false);
    const cart = readCart();
    const idx = cart.findIndex((i) => i.title === title && i.size === finalSize);
    if (idx > -1) {
      cart[idx].quantity += delta;
      if (cart[idx].quantity <= 0) cart.splice(idx, 1);
    } else if (delta > 0) {
      cart.push({
        id: `${title}-${finalSize}`,
        image: getImageSrc(imageNum),
        title,
        size: finalSize,
        price: unitPrice,
        quantity: 1,
      });
    }
    writeCart(cart);
  }, [hasSizes, size, title, finalSize, imageNum, unitPrice]);

  return (
    <article className="flex gap-3 sm:flex-col sm:gap-0 rounded-2xl bg-white dark:bg-[#17100c] border border-stone-200 dark:border-white/10 p-3 sm:p-4 transition-shadow hover:shadow-lg hover:shadow-orange-900/5">
      <div className="relative order-2 sm:order-1 shrink-0 w-28 h-28 sm:w-full sm:h-44 rounded-xl bg-stone-100 dark:bg-[#0f0a07] overflow-hidden sm:mb-4">
        <Image
          src={getImageSrc(imageNum)}
          alt={title}
          fill
          sizes="(max-width: 640px) 112px, (max-width: 1024px) 30vw, 22vw"
          priority={priority}
          className="object-contain p-2"
        />
        {qty > 0 && (
          <span className="absolute top-1.5 left-1.5 rounded-full bg-orange-600 text-white text-xs font-bold px-2 py-0.5">
            {qty} in cart
          </span>
        )}
      </div>

      <div className="order-1 sm:order-2 flex flex-col grow min-w-0">
        <h3 className="font-bold text-stone-900 dark:text-white text-base leading-snug line-clamp-1">{title}</h3>
        <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400 line-clamp-2 min-h-10">{description}</p>

        {hasSizes && (
          <div role="radiogroup" aria-label={`Size for ${title}`} className="mt-2 flex flex-wrap gap-1.5">
            {pricingOptions.map((opt) => (
              <button
                key={opt.size}
                type="button"
                role="radio"
                aria-checked={size === opt.size}
                onClick={() => { setSize(opt.size); setNeedSize(false); }}
                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-orange-500 ${
                  size === opt.size
                    ? 'border-orange-600 bg-orange-600 text-white'
                    : needSize
                    ? 'border-red-500 text-red-600 dark:text-red-400'
                    : 'border-stone-300 dark:border-white/20 text-stone-700 dark:text-stone-300 hover:border-orange-500'
                }`}
              >
                {opt.size}
              </button>
            ))}
          </div>
        )}
        {needSize && <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400" role="alert">Pick a size first</p>}

        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <span className="font-extrabold text-orange-700 dark:text-orange-400 text-base">
            {hasSizes ? (size ? fmt(unitPrice) : `From ${fmt(lowest)}`) : fmt(unitPrice)}
          </span>

          {qty > 0 ? (
            <div className="flex items-center rounded-xl bg-stone-100 dark:bg-white/10">
              <button type="button" aria-label="Remove one" onClick={() => change(-1)}
                className="w-9 h-9 text-lg font-bold text-stone-800 dark:text-white rounded-xl hover:bg-stone-200 dark:hover:bg-white/10 active:scale-95">−</button>
              <span className="w-6 text-center text-sm font-bold text-stone-900 dark:text-white" aria-live="polite">{qty}</span>
              <button type="button" aria-label="Add one more" onClick={() => change(1)}
                className="w-9 h-9 text-lg font-bold text-stone-800 dark:text-white rounded-xl hover:bg-stone-200 dark:hover:bg-white/10 active:scale-95">+</button>
            </div>
          ) : (
            <button type="button" onClick={() => change(1)}
              className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold px-4 h-9 active:scale-95 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500">
              Add
            </button>
          )}
        </div>
      </div>
    </article>
  );
});

/* ---------- page ---------- */
export default function MenuClientWrapper({ initialCategories, itemsByCategory }) {
  const [query, setQuery] = useState('');
  const [activeSection, setActiveSection] = useState(initialCategories?.[0]?.slug || '');
  const [cart, setCart] = useState({ count: 0, total: 0 });
  const navRef = useRef(null);

  const programmaticScrollRef = useRef(false);
  const scrollEndTimerRef = useRef(null);

  /* ✅ Slug dedup — same algorithm as server via withStableSlugs.
     Kept as a defensive fallback; result is always identical. */
  const dedupedCategories = useMemo(() => {
    return withStableSlugs(initialCategories || []).map((c) => ({ ...c, __slug: c.slug }));
  }, [initialCategories]);

  /* Search filter — empty query keeps ALL categories (even 0-item ones). */
  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dedupedCategories
      .map((cat) => {
        const all = itemsByCategory[cat.id] || [];
        const items = q
          ? all.filter((i) => `${i.title} ${i.description || ''}`.toLowerCase().includes(q))
          : all;
        return { ...cat, slug: cat.__slug, items };
      })
      .filter((c) => (q ? c.items.length > 0 : true));
  }, [dedupedCategories, itemsByCategory, query]);

  /* Always holds the latest sections so the mount-only hash effect can read them. */
  const sectionsRef = useRef(sections);
  useEffect(() => { sectionsRef.current = sections; }, [sections]);

  /* Cart totals */
  useEffect(() => {
    const update = () => {
      const items = readCart();
      setCart({
        count: items.reduce((n, i) => n + (i.quantity || 0), 0),
        total: items.reduce((n, i) => n + (i.quantity || 0) * (i.price || 0), 0),
      });
    };
    update();
    window.addEventListener('storage', update);
    window.addEventListener('cartUpdated', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('cartUpdated', update);
    };
  }, []);

  /* ────────────────────────────────────────────────────────────
     Reliable scroll-to-section (used by nav tabs).
     ──────────────────────────────────────────────────────────── */
  const scrollToSection = useCallback((id, smooth = true) => {
    if (typeof window === 'undefined') return;
    const el = document.getElementById(id);
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    programmaticScrollRef.current = true;
    el.scrollIntoView({
      behavior: smooth && !prefersReduced ? 'smooth' : 'auto',
      block: 'start',
    });

    clearTimeout(scrollEndTimerRef.current);
    scrollEndTimerRef.current = setTimeout(
      () => { programmaticScrollRef.current = false; },
      smooth ? 900 : 150
    );
  }, []);

  /* ────────────────────────────────────────────────────────────
     INITIAL HASH HANDLING — runs ONCE on mount.
     - Reads latest sections through sectionsRef (no deps on sections).
     - Uses window.location.hash, or falls back to sessionStorage target
       stored by the home page (soft navigation sometimes updates URL late).
     - Instant first jump + delayed re-aims (images load → layout shifts).
     - Re-aim timers cancel on first user scroll/touch/key.
     - programmaticScrollRef stays true during re-aims so scroll-spy
       doesn't override activeSection.
     ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    const timers = [];
    const userEvents = ['wheel', 'touchstart', 'keydown', 'mousedown'];

    const clearTimers = () => {
      while (timers.length) clearTimeout(timers.pop());
    };
   const onUserInterrupt = () => {
  clearTimers();
  programmaticScrollRef.current = false;
  clearTimeout(scrollEndTimerRef.current);
};

    const instantScroll = (id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const html = document.documentElement;
      const prev = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';
      try {
        el.scrollIntoView({ block: 'start', behavior: 'auto' });
      } finally {
        setTimeout(() => { html.style.scrollBehavior = prev || ''; }, 50);
      }
    };
    const smoothScroll = (id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ block: 'start', behavior: prefersReduced ? 'auto' : 'smooth' });
    };

    const resolveId = (raw) => {
      if (!raw) return null;
      const id = decodeURIComponent(raw);
      if (typeof document !== 'undefined' && document.getElementById(id)) return id;
      const secs = sectionsRef.current || [];
      let m = secs.find((s) => s.slug === id);
      if (m) return m.slug;
      const target = norm(id);
      if (!target) return null;
      m = secs.find((s) => norm(s.slug) === target);
      if (m) return m.slug;
      m = secs.find((s) => norm(s.name) === target);
      if (m) return m.slug;
      return null;
    };

    const runJump = (smooth) => {
      if (cancelled || typeof window === 'undefined') return;
      const rawFromUrl = window.location.hash.replace(/^#/, '');
      const stored = consumeMenuTarget(); // always drain
      const key = rawFromUrl || stored;
      if (!key) return;
      const resolved = resolveId(key);
      if (!resolved) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            '[menu] Could not resolve target to any section:',
            key,
            '\nAvailable sections:',
            (sectionsRef.current || []).map((s) => ({ slug: s.slug, name: s.name }))
          );
        }
        return;
      }

      setActiveSection(resolved);
      programmaticScrollRef.current = true;

      if (smooth) {
        smoothScroll(resolved);
        clearTimeout(scrollEndTimerRef.current);
        scrollEndTimerRef.current = setTimeout(() => {
          programmaticScrollRef.current = false;
        }, 1000);
      } else {
        instantScroll(resolved);
        clearTimers();
        [150, 450, 900, 1600].forEach((ms) => {
          timers.push(setTimeout(() => { if (!cancelled) instantScroll(resolved); }, ms));
        });
        timers.push(setTimeout(() => {
          if (!cancelled) programmaticScrollRef.current = false;
        }, 2600));
      }
    };

    // First jump: instant, then re-aims.
    runJump(false);

    // Cancel re-aims as soon as the user starts interacting.
    userEvents.forEach((ev) =>
      window.addEventListener(ev, onUserInterrupt, { passive: true, once: true })
    );

    const onHash = () => runJump(true);
    const onPop = () => runJump(true);
    window.addEventListener('hashchange', onHash);
    window.addEventListener('popstate', onPop);

    return () => {
      cancelled = true;
      clearTimers();
      userEvents.forEach((ev) => window.removeEventListener(ev, onUserInterrupt));
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('popstate', onPop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ────────────────────────────────────────────────────────────
     Scroll-spy — skip during programmatic scroll.
     Re-observes whenever `sections` changes.
     ──────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!sections.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (programmaticScrollRef.current) return;
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: 0 }
    );
    sections.forEach(({ slug }) => {
      const el = document.getElementById(slug);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [sections]);

  /* Keep active tab visible in horizontal nav */
  useEffect(() => {
    const tab = document.getElementById(`nav-${activeSection}`);
    const bar = navRef.current;
    if (tab && bar) {
      bar.scrollTo({
        left: tab.offsetLeft - bar.clientWidth / 2 + tab.clientWidth / 2,
        behavior: 'smooth',
      });
    }
  }, [activeSection]);

  const handleNavClick = useCallback((slug) => {
    setActiveSection(slug);
    if (typeof window !== 'undefined') {
      const url = `${window.location.pathname}${window.location.search}#${slug}`;
      history.replaceState(null, '', url);
    }
    scrollToSection(slug);
  }, [scrollToSection]);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0d0907] text-stone-900 dark:text-stone-100 antialiased selection:bg-orange-500 selection:text-white">
      <style dangerouslySetInnerHTML={{ __html: `
        html { scroll-behavior: smooth; }
        @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        /* Offset anchor jumps so sections land below the sticky nav */
        .menu-section { scroll-margin-top: calc(var(--site-header, 96px) + 64px); }
      ` }} />

      <header className="max-w-340 mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-5">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight">What are you craving?</h1>
        <p className="mt-2 max-w-xl text-stone-500 dark:text-stone-400">
          Deals, hand-tossed pizzas, burgers and late-night snacks, made fresh when you order.
        </p>
        <label className="mt-5 block relative max-w-md">
          <span className="sr-only">Search the menu</span>
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pizza, burger, deal…"
            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white dark:bg-[#17100c] border border-stone-200 dark:border-white/10 text-base outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
          />
        </label>
      </header>

      <nav
        aria-label="Menu categories"
        style={{ top: 'var(--site-header, 96px)' }}
        className="sticky z-40 bg-stone-50/90 dark:bg-[#0d0907]/90 backdrop-blur border-b border-stone-200 dark:border-white/10"
      >
        <div ref={navRef} className="relative max-w-340 mx-auto flex gap-2 overflow-x-auto hide-scrollbar px-4 sm:px-6 lg:px-8 py-2.5">
          {sections.map(({ slug, name }) => (
            <button
              key={slug}
              id={`nav-${slug}`}
              type="button"
              aria-current={activeSection === slug ? 'true' : undefined}
              onClick={() => handleNavClick(slug)}
              className={`whitespace-nowrap rounded-full px-4 h-9 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-orange-500 ${
                activeSection === slug
                  ? 'bg-orange-600 text-white'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-white/10'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-340 mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32 space-y-14">
        {sections.length === 0 && (
          <p className="py-20 text-center text-stone-500">
            Nothing matches “{query}”. Try a shorter word, like “pizza”.
          </p>
        )}
        {sections.map((cat, ci) => (
          <section key={cat.id} id={cat.slug} className="menu-section">
            <div className="flex items-baseline gap-3 mb-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{cat.name}</h2>
              <span className="text-sm text-stone-500 dark:text-stone-400">{cat.items.length} items</span>
            </div>
            {cat.items.length === 0 ? (
              <p className="py-8 text-center text-sm text-stone-500 dark:text-stone-400">
                Items coming soon.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                {cat.items.map((item, i) => (
                  <MenuCard
                    key={item.id}
                    imageNum={item.image_num}
                    title={item.title}
                    description={item.description}
                    price={item.price}
                    pricingOptions={item.pricing_options}
                    priority={ci === 0 && i < 4}
                  />
                ))}
              </div>
            )}
          </section>
        ))}
      </main>

      {/* Cart bar */}
      {cart.count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-5 pointer-events-none" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
          <Link
            href="/cart"
            aria-label={`View cart, ${cart.count} items, ${fmt(cart.total)}`}
            className="pointer-events-auto mx-auto flex max-w-lg items-center justify-between rounded-2xl bg-stone-900 dark:bg-orange-600 text-white px-5 h-14 shadow-2xl shadow-black/30 active:scale-[0.98] transition-transform"
          >
            <span className="flex items-center gap-3 font-semibold">
              <span className="grid place-items-center min-w-7 h-7 rounded-full bg-orange-600 dark:bg-white dark:text-orange-700 text-sm font-bold px-2">{cart.count}</span>
              View cart
            </span>
            <span className="font-extrabold">{fmt(cart.total)}</span>
          </Link>
        </div>
      )}
    </div>
  );
}