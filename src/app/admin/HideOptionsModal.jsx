'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  parseHHMM, nextOccurrenceAfter, fmtDateTimePkt, fmtTime12,
  describeSchedule, describeDateRange, hasSchedule,
} from '@/lib/visibility';

/* ============================================================
   ICONS (local mini copy)
   ============================================================ */
const Icon = ({ path, className = 'w-4 h-4', stroke = 2 }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);
const ICONS = {
  clock: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2',
  x: 'M18 6L6 18M6 6l12 12',
  check: 'M20 6L9 17l-5-5',
  alert: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z',
  refresh: 'M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15',
  eyeOff: 'M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24 M1 1l22 22',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
};

/* ============================================================
   MINI UI PRIMITIVES (self-contained, matching admin theme)
   ============================================================ */
function ModalBtn({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const variants = {
    primary: 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-lg shadow-orange-950/40 border-orange-400/20',
    ghost: 'bg-slate-800/60 hover:bg-slate-700/70 text-slate-200 border-slate-700/70',
    success: 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-lg shadow-emerald-950/40 border-emerald-400/20',
    danger: 'bg-rose-600/15 hover:bg-rose-600 text-rose-400 hover:text-white border-rose-500/20',
    subtle: 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border-slate-800',
  };
  const sizes = { sm: 'px-3 py-1.5 text-[11px]', md: 'px-4 py-2.5 text-xs', lg: 'px-5 py-3 text-sm' };
  return (
    <button {...props} className={`inline-flex items-center justify-center gap-1.5 font-black uppercase tracking-wider rounded-xl border transition-all duration-200 cursor-pointer active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
}

function ModalInput({ label, hint, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</label>}
      <input {...props} className={`w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-sm font-medium outline-none transition-all placeholder:text-slate-600 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 ${className}`} />
      {hint && <p className="text-[10px] text-slate-500">{hint}</p>}
    </div>
  );
}

function Chip({ active, onClick, children, tone = 'orange' }) {
  const tones = {
    orange: active ? 'bg-orange-500/20 border-orange-500/50 text-orange-200' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700',
    slate: active ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

function OptionCard({ selected, onSelect, icon, title, help, children, disabled, disabledHint }) {
  return (
    <div className={`rounded-2xl border transition-all ${disabled ? 'opacity-50' : ''} ${selected ? 'border-orange-500/60 bg-orange-500/5' : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'}`}>
      <button
        type="button"
        onClick={() => !disabled && onSelect()}
        disabled={disabled}
        className={`w-full text-left p-3.5 flex items-start gap-3 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${selected ? 'bg-orange-500/20 border-orange-500/40 text-orange-300' : 'bg-slate-800/60 border-slate-700 text-slate-400'}`}>
          <Icon path={icon} className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-black ${selected ? 'text-white' : 'text-slate-200'}`}>{title}</p>
          {help && <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{help}</p>}
          {disabled && disabledHint && (
            <p className="text-[10px] text-amber-400/80 mt-1 font-bold">{disabledHint}</p>
          )}
        </div>
        <div className={`mt-1 w-4 h-4 rounded-full border-2 shrink-0 ${selected ? 'border-orange-500 bg-orange-500' : 'border-slate-700'}`}>
          {selected && <div className="w-full h-full rounded-full bg-white scale-50" />}
        </div>
      </button>
      {selected && !disabled && (
        <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-800/60 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   REASON CHIPS
   ============================================================ */
const REASONS = [
  { id: 'out_of_stock', label: 'Out of stock' },
  { id: 'ingredient_finished', label: 'Ingredient finished' },
  { id: 'closed_today', label: 'Closed for the day' },
  { id: 'other', label: 'Other' },
];

/* ============================================================
   HELPERS
   ============================================================ */
const DAYS = [
  { id: 0, label: 'Sun' }, { id: 1, label: 'Mon' }, { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' }, { id: 4, label: 'Thu' }, { id: 5, label: 'Fri' },
  { id: 6, label: 'Sat' },
];

// Convert a device-local datetime-local value ("2026-01-15T20:30") to ISO.
const localToIso = (v) => (v ? new Date(v).toISOString() : null);
// Convert an ISO string to a value the <input type="datetime-local"> can render.
const isoToLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
};

/* ============================================================
   MODAL
   ============================================================ */
export default function HideOptionsModal({
  open, kind, row, itemCount = 0, settings, initialMode = 'hide',
  onClose, onApply, onClearSchedule,
}) {
  const [mode, setMode] = useState('A');
  const [reason, setReason] = useState(null);
  // Option C
  const [customUntil, setCustomUntil] = useState('');
  // Option D
  const [schedType, setSchedType] = useState('hide');
  const [schedFrom, setSchedFrom] = useState('custom'); // 'CLOSE' | 'custom'
  const [schedFromTime, setSchedFromTime] = useState('22:00');
  const [schedTo, setSchedTo] = useState('OPEN');
  const [schedToTime, setSchedToTime] = useState('15:00');
  const [schedDays, setSchedDays] = useState(new Set([0, 1, 2, 3, 4, 5, 6]));
  // Option E
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeUntil, setRangeUntil] = useState('');

  const now = useMemo(() => new Date(), [open]);
  const openMin = parseHHMM(settings?.opening_time, null);
  const closeMin = parseHHMM(settings?.closing_time, null);

  /* ---------- reset / preselect every time the modal opens ---------- */
  useEffect(() => {
    if (!open) return;
    setReason(row?.hide_reason || null);

    // Preselect mode
    if (initialMode === 'schedule') {
      if (row?.schedule_enabled) {
        setMode('D');
      } else if (row?.available_from || row?.available_until) {
        setMode('E');
      } else {
        setMode('D');
      }
    } else {
      setMode('A');
    }

    // Preload schedule fields from row if present
    if (row?.schedule_enabled) {
      setSchedType(row.schedule_type || 'hide');
      if (row.schedule_start === 'CLOSE') { setSchedFrom('CLOSE'); }
      else if (row.schedule_start) { setSchedFrom('custom'); setSchedFromTime(row.schedule_start); }
      if (row.schedule_end === 'OPEN') { setSchedTo('OPEN'); }
      else if (row.schedule_end) { setSchedTo('custom'); setSchedToTime(row.schedule_end); }
      const days = (row.schedule_days || '').split(',').map((x) => parseInt(x, 10)).filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);
      setSchedDays(days.length > 0 && days.length < 7 ? new Set(days) : new Set([0, 1, 2, 3, 4, 5, 6]));
    } else {
      setSchedType('hide');
      setSchedFrom('custom'); setSchedFromTime('22:00');
      setSchedTo(openMin != null ? 'OPEN' : 'custom'); setSchedToTime('15:00');
      setSchedDays(new Set([0, 1, 2, 3, 4, 5, 6]));
    }

    // Preload date range
    setRangeFrom(isoToLocalInput(row?.available_from));
    setRangeUntil(isoToLocalInput(row?.available_until));

    // Reset custom until
    setCustomUntil('');
  }, [open, row, initialMode, openMin]);

  /* ---------- lock body scroll while open ---------- */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  /* ---------- Escape closes ---------- */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !row) return null;

  const isCategory = kind === 'category';
  const name = isCategory ? row.name : (row.title || 'item');
  const existingSched = hasSchedule(row);

  /* ---------- previews ---------- */
  const nextOpenAt = openMin != null ? nextOccurrenceAfter(now, openMin) : null;

  const schedulePreviewRow = {
    schedule_enabled: true,
    schedule_type: schedType,
    schedule_start: schedFrom === 'CLOSE' ? 'CLOSE' : schedFromTime,
    schedule_end: schedTo === 'OPEN' ? 'OPEN' : schedToTime,
    schedule_days: schedDays.size === 7 || schedDays.size === 0 ? '' : [...schedDays].sort().join(','),
  };

  const rangePreviewRow = {
    available_from: localToIso(rangeFrom),
    available_until: localToIso(rangeUntil),
  };

  /* ---------- validity ---------- */
  const customUntilIso = localToIso(customUntil);
  const customUntilValid = customUntilIso && new Date(customUntilIso).getTime() > Date.now();
  const rangeFromIso = localToIso(rangeFrom);
  const rangeUntilIso = localToIso(rangeUntil);
  const rangeValid =
    (rangeFromIso || rangeUntilIso) &&
    (!rangeFromIso || !rangeUntilIso || new Date(rangeUntilIso).getTime() > new Date(rangeFromIso).getTime());

  const scheduleValid = (() => {
    const startVal = schedFrom === 'CLOSE' ? closeMin : parseHHMM(schedFromTime, null);
    const endVal = schedTo === 'OPEN' ? openMin : parseHHMM(schedToTime, null);
    return startVal != null && endVal != null && schedDays.size > 0;
  })();

  const valid =
    (mode === 'A' || mode === 'B') ||
    (mode === 'C' && customUntilValid) ||
    (mode === 'D' && scheduleValid) ||
    (mode === 'E' && rangeValid);

  const primaryLabel =
    mode === 'D' ? 'Save schedule' :
    mode === 'E' ? 'Save dates' :
    'Hide now';

  /* ---------- apply ---------- */
  const handleApply = () => {
    if (!valid) return;
    const nowIso = new Date().toISOString();
    const reasonPayload = reason || null;

    if (mode === 'A') {
      onApply({ is_hidden: true, hide_mode: 'manual', hidden_at: nowIso, hidden_until: null, hide_reason: reasonPayload });
    } else if (mode === 'B') {
      onApply({ is_hidden: true, hide_mode: 'until_open', hidden_at: nowIso, hidden_until: null, hide_reason: reasonPayload });
    } else if (mode === 'C') {
      onApply({ is_hidden: true, hide_mode: 'until_time', hidden_at: nowIso, hidden_until: customUntilIso, hide_reason: reasonPayload });
    } else if (mode === 'D') {
      onApply({
        schedule_enabled: true,
        schedule_type: schedType,
        schedule_start: schedFrom === 'CLOSE' ? 'CLOSE' : schedFromTime,
        schedule_end: schedTo === 'OPEN' ? 'OPEN' : schedToTime,
        schedule_days: schedDays.size === 7 || schedDays.size === 0 ? '' : [...schedDays].sort().join(','),
      });
    } else if (mode === 'E') {
      onApply({ available_from: rangeFromIso, available_until: rangeUntilIso });
    }
  };

  /* ---------- quick chips for option C ---------- */
  const quickChips = [
    { label: '1 hour', ms: 60 * 60 * 1000 },
    { label: '2 hours', ms: 2 * 60 * 60 * 1000 },
    { label: '4 hours', ms: 4 * 60 * 60 * 1000 },
    { label: '8 hours', ms: 8 * 60 * 60 * 1000 },
    { label: '24 hours', ms: 24 * 60 * 60 * 1000 },
  ];

  /* ---------- weekday toggling ---------- */
  const toggleDay = (d) => {
    setSchedDays((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d); else next.add(d);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-[260] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="hide-modal-title">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg max-h-[92vh] sm:max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl shadow-black/60 overflow-hidden">

        {/* Header */}
        <div className="shrink-0 p-5 border-b border-slate-800/80">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                <Icon path={ICONS.eyeOff} className="w-5 h-5" />
              </div>
              <div>
                <h2 id="hide-modal-title" className="text-base sm:text-lg font-black text-white tracking-tight">
                  Hide &ldquo;{name}&rdquo;
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">How long should this stay hidden?</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer shrink-0"
              aria-label="Close"
            >
              <Icon path={ICONS.x} className="w-4 h-4" />
            </button>
          </div>
          {isCategory && itemCount > 0 && (
            <div className="mt-3 text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 leading-relaxed">
              All <b>{itemCount}</b> item{itemCount === 1 ? '' : 's'} inside this section will be hidden too.
            </div>
          )}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">

          {/* Option A */}
          <OptionCard
            selected={mode === 'A'}
            onSelect={() => setMode('A')}
            icon={ICONS.eyeOff}
            title="Until I unhide it"
            help="For out-of-stock items. Stays hidden until you unhide it yourself."
          />

          {/* Option B */}
          <OptionCard
            selected={mode === 'B'}
            onSelect={() => setMode('B')}
            icon={ICONS.clock}
            title="Until the shop opens next"
            help={
              openMin == null
                ? 'Set the shop opening time in Settings first.'
                : `Comes back automatically on ${fmtDateTimePkt(nextOpenAt)}`
            }
            disabled={openMin == null}
            disabledHint={openMin == null ? 'Set the shop opening time in Settings first.' : undefined}
          />

          {/* Option C */}
          <OptionCard
            selected={mode === 'C'}
            onSelect={() => setMode('C')}
            icon={ICONS.clock}
            title="For a set time"
            help="Hide for a few hours or until a specific moment."
          >
            <div className="flex flex-wrap gap-1.5">
              {quickChips.map((c) => (
                <Chip
                  key={c.label}
                  onClick={() => {
                    const iso = new Date(Date.now() + c.ms);
                    setCustomUntil(isoToLocalInput(iso.toISOString()));
                  }}
                >
                  {c.label}
                </Chip>
              ))}
            </div>
            <ModalInput
              label="Custom date and time"
              type="datetime-local"
              value={customUntil}
              min={isoToLocalInput(new Date().toISOString())}
              onChange={(e) => setCustomUntil(e.target.value)}
            />
            {customUntil && customUntilValid && (
              <p className="text-[11px] text-emerald-400 font-bold">
                Comes back at {fmtDateTimePkt(new Date(customUntilIso))}
              </p>
            )}
            {customUntil && !customUntilValid && (
              <p className="text-[11px] text-rose-400 font-bold">Please pick a time in the future.</p>
            )}
          </OptionCard>

          {/* Option D */}
          <OptionCard
            selected={mode === 'D'}
            onSelect={() => setMode('D')}
            icon={ICONS.refresh}
            title="Every day on a schedule"
            help="Repeating rule. Saves a schedule, doesn't hide anything right now."
          >
            {/* segmented control */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setSchedType('hide')}
                className={`py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${schedType === 'hide' ? 'bg-orange-500/20 text-orange-200 border border-orange-500/40' : 'text-slate-400 hover:text-white'}`}
              >
                Hide during this time
              </button>
              <button
                type="button"
                onClick={() => setSchedType('show_only')}
                className={`py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${schedType === 'show_only' ? 'bg-orange-500/20 text-orange-200 border border-orange-500/40' : 'text-slate-400 hover:text-white'}`}
              >
                Show only during this
              </button>
            </div>

            {/* FROM */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">From</label>
              <select
                value={schedFrom}
                onChange={(e) => setSchedFrom(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-sm font-bold outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 cursor-pointer transition-all"
              >
                {closeMin != null && <option value="CLOSE">Shop closing time ({fmtTime12(settings?.closing_time)})</option>}
                <option value="custom">Custom time</option>
              </select>
              {schedFrom === 'custom' && (
                <input
                  type="time"
                  value={schedFromTime}
                  onChange={(e) => setSchedFromTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-sm font-medium outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20"
                />
              )}
            </div>

            {/* TO */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">To</label>
              <select
                value={schedTo}
                onChange={(e) => setSchedTo(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-sm font-bold outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 cursor-pointer transition-all"
              >
                {openMin != null && <option value="OPEN">Shop opening time ({fmtTime12(settings?.opening_time)})</option>}
                <option value="custom">Custom time</option>
              </select>
              {schedTo === 'custom' && (
                <input
                  type="time"
                  value={schedToTime}
                  onChange={(e) => setSchedToTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-sm font-medium outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20"
                />
              )}
            </div>

            {/* Weekdays */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Days</label>
              <div className="flex flex-wrap gap-1.5">
                {DAYS.map((d) => (
                  <Chip
                    key={d.id}
                    active={schedDays.has(d.id)}
                    onClick={() => toggleDay(d.id)}
                    tone="slate"
                  >
                    {d.label}
                  </Chip>
                ))}
              </div>
              <p className="text-[10px] text-slate-500">
                {schedDays.size === 7 || schedDays.size === 0 ? 'Every day' : `Only on ${[...schedDays].sort().map((x) => DAYS[x].label).join(', ')}`}
              </p>
            </div>

            {/* Live preview */}
            {scheduleValid && (
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Preview</p>
                <p className="text-[11px] text-orange-200 leading-snug">{describeSchedule(schedulePreviewRow, settings)}</p>
              </div>
            )}
            {!scheduleValid && (
              <p className="text-[11px] text-rose-400 font-bold">Pick a start and end time, and at least one day.</p>
            )}
          </OptionCard>

          {/* Option E */}
          <OptionCard
            selected={mode === 'E'}
            onSelect={() => setMode('E')}
            icon={ICONS.calendar}
            title="Only between two dates"
            help="For Eid deals, Ramadan menu, birthday offers."
          >
            <ModalInput
              label="Show from"
              type="datetime-local"
              value={rangeFrom}
              onChange={(e) => setRangeFrom(e.target.value)}
            />
            <ModalInput
              label="Show until"
              type="datetime-local"
              value={rangeUntil}
              min={rangeFrom || undefined}
              onChange={(e) => setRangeUntil(e.target.value)}
            />
            {rangeValid && (
              <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Preview</p>
                <p className="text-[11px] text-orange-200 leading-snug">{describeDateRange(rangePreviewRow)}</p>
              </div>
            )}
            {!rangeValid && (rangeFrom || rangeUntil) && (
              <p className="text-[11px] text-rose-400 font-bold">The end date must be after the start date.</p>
            )}
            {!rangeFrom && !rangeUntil && (
              <p className="text-[11px] text-slate-500">Pick at least one date.</p>
            )}
          </OptionCard>

          {/* Reason chips (A / B / C only) */}
          {(mode === 'A' || mode === 'B' || mode === 'C') && (
            <div className="pt-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Reason (optional)</p>
              <div className="flex flex-wrap gap-1.5">
                {REASONS.map((r) => (
                  <Chip
                    key={r.id}
                    active={reason === r.id}
                    onClick={() => setReason(reason === r.id ? null : r.id)}
                  >
                    {r.label}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* Existing schedule info */}
          {existingSched && (
            <div className="bg-amber-500/8 border border-amber-500/25 rounded-2xl p-3 space-y-1">
              <div className="flex items-start gap-2">
                <Icon path={ICONS.alert} className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div className="flex-1 space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Current rules</p>
                  {row.schedule_enabled && (
                    <p className="text-[11px] text-amber-200/90 leading-snug">{describeSchedule(row, settings)}</p>
                  )}
                  {(row.available_from || row.available_until) && (
                    <p className="text-[11px] text-amber-200/90 leading-snug">{describeDateRange(row)}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onClearSchedule}
                className="text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-300 transition-colors cursor-pointer mt-1"
              >
                Remove schedule
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 p-4 sm:p-5 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-end gap-2">
          <ModalBtn variant="ghost" size="md" onClick={onClose}>Cancel</ModalBtn>
          <ModalBtn variant="primary" size="md" onClick={handleApply} disabled={!valid}>
            <Icon path={ICONS.check} className="w-3.5 h-3.5" />
            {primaryLabel}
          </ModalBtn>
        </div>

      </div>
    </div>
  );
}