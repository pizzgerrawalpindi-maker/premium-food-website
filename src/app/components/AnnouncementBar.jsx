'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { rememberMenuTarget } from '@/lib/menuSlug';

const REFRESH_MS = 60000; // re-check the admin's message every minute
const SPEED = 40;         // slow, calm scroll (px per second)

/* Fire rememberMenuTarget for /menu#... links so the menu page jumps
   even during soft navigation where window.location.hash isn't updated yet. */
const onMenuLinkClick = (href) => () => {
  const m = /^\/menu#(.+)$/.exec(href || '');
  if (m) rememberMenuTarget(decodeURIComponent(m[1]));
};

// Optional prop: <AnnouncementBar initial={{ text, is_active, link }} /> if layout.js already fetched it on the server
export default function AnnouncementBar({ initial }) {
  const [data, setData] = useState({
    text: (initial?.text || '').trim(),
    active: initial?.is_active ?? false,
    link: (initial?.link || '').trim(),
  });
  const [open, setOpen] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [layout, setLayout] = useState({ copies: 3, duration: 40 });
  const boxRef = useRef(null);
  const itemRef = useRef(null);

  /* Same settings table the admin panel writes to */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data: row, error } = await supabase
          .from('settings')
          .select('announcement_text, is_announcement_active, announcement_link')
          .single();
        if (cancelled || error || !row) return;
        setData({
          text: (row.announcement_text || '').trim(),
          active: row.is_announcement_active ?? false,
          link: (row.announcement_link || '').trim(),
        });
      } catch (err) {
        console.error('Error fetching announcement:', err);
      }
    };
    const onVisible = () => document.visibilityState === 'visible' && load();
    load();
    const id = setInterval(load, REFRESH_MS);
    document.addEventListener('visibilitychange', onVisible);
    return () => { cancelled = true; clearInterval(id); document.removeEventListener('visibilitychange', onVisible); };
  }, []);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const visible = data.active && data.text !== '';

  useEffect(() => {
    if (!visible) { setOpen(false); return; }
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, [visible]);

  // Repeat the message enough times to fill any screen width, at a constant speed
  useEffect(() => {
    if (!visible || reduced) return;
    const measure = () => {
      const itemW = itemRef.current?.offsetWidth || 0;
      const boxW = boxRef.current?.offsetWidth || 0;
      if (!itemW) return;
      const copies = Math.max(1, Math.ceil(boxW / itemW));
      setLayout({ copies, duration: Math.max(16, (itemW * copies) / SPEED) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (boxRef.current) ro.observe(boxRef.current);
    return () => ro.disconnect();
  }, [visible, reduced, data.text]);

  if (!visible) return null;

  const gold = 'bg-linear-to-r from-[#F3E2B8] via-[#D4AF6A] to-[#F3E2B8] bg-clip-text text-transparent';
  const href = (data.link || '').trim();
  const clickable = href !== '';

  const group = (withRef) => (
    <div className="flex shrink-0" aria-hidden="true">
      {Array.from({ length: layout.copies }).map((_, i) => (
        <span key={i} ref={withRef && i === 0 ? itemRef : null} className="flex items-center gap-6 pr-6 whitespace-nowrap">
          <span className={gold}>{data.text}</span>
          <span className="w-1 h-1 rotate-45 bg-[#D4AF6A]" />
        </span>
      ))}
    </div>
  );

  const inner = reduced ? (
    <p className={`px-4 py-1 text-center leading-relaxed ${gold}`}>{data.text}</p>
  ) : (
    <div ref={boxRef} className="ann-mask h-6 sm:h-7 flex items-center overflow-hidden">
      <p className="sr-only">{data.text}</p>
      <div className="ann-track flex w-max" style={{ '--ann-dur': `${layout.duration}s` }}>
        {group(true)}
        {group(false)}
      </div>
    </div>
  );

  const bar = (
    <div className="relative bg-[#0d0907] text-[11px] sm:text-xs font-medium uppercase tracking-[0.2em]">
      {inner}
      {/* thin gold hairline along the bottom edge */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-[#D4AF6A]/70 to-transparent" />
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ann-scroll { to { transform: translateX(-50%); } }
        .ann-track { animation: ann-scroll var(--ann-dur, 40s) linear infinite; }
        .ann-wrap:hover .ann-track { animation-play-state: paused; }
        .ann-mask { -webkit-mask-image: linear-gradient(to right, transparent, #000 28px, #000 calc(100% - 28px), transparent);
                    mask-image: linear-gradient(to right, transparent, #000 28px, #000 calc(100% - 28px), transparent); }
      ` }} />

      <div
        role="region"
        aria-label="Announcement"
        className={`ann-wrap grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          {clickable ? (
            <Link
              href={href}
              onClick={onMenuLinkClick(href)}
              aria-label={`${data.text} — go to menu`}
              className="block cursor-pointer transition-opacity hover:opacity-90"
            >
              {bar}
            </Link>
          ) : bar}
        </div>
      </div>
    </>
  );
}