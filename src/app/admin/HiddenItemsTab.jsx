'use client';
import { useState, useMemo } from 'react';
import { getVisibilityInfo, hasSchedule } from '@/lib/visibility';

/* ============================================================
   ICONS (local mini copy)
   ============================================================ */
const Icon = ({ path, className = 'w-4 h-4', stroke = 2 }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);
const ICONS = {
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 15a3 3 0 100-6 3 3 0 000 6z',
  eyeOff: 'M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24 M1 1l22 22',
  clock: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2',
  check: 'M20 6L9 17l-5-5',
  x: 'M18 6L6 18M6 6l12 12',
  search: 'M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z',
  sparkles: 'M12 3l1.9 5.7L19.6 10l-5.7 1.9L12 17.6l-1.9-5.7L4.4 10l5.7-1.9L12 3z',
  refresh: 'M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15',
  info: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 16v-4 M12 8h.01',
};

/* ============================================================
   MINI UI PRIMITIVES
   ============================================================ */
function Btn({ children, variant = 'primary', size = 'md', className = '', ...props }) {
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

function Panel({ children, className = '' }) {
  return <div className={`bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-5 sm:p-6 ${className}`}>{children}</div>;
}

function EmptyState({ icon = ICONS.info, title, hint }) {
  return (
    <div className="text-center py-14 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-500 mb-3">
        <Icon path={icon} className="w-6 h-6" />
      </div>
      <p className="text-sm font-bold text-slate-300 uppercase tracking-wider">{title}</p>
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

/* ============================================================
   REASON LABEL MAP
   ============================================================ */
const REASON_LABEL = {
  out_of_stock: 'Out of stock',
  ingredient_finished: 'Ingredient finished',
  closed_today: 'Closed for the day',
  other: 'Other',
};

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function HiddenItemsTab({
  categories, menuItems, settings, now,
  onUnhide, onEdit, onClearSchedule,
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all | hidden | scheduled | categories | items

  /* ---------- build a unified list ---------- */
  const rows = useMemo(() => {
    const out = [];

    (categories || []).forEach((cat) => {
      const info = getVisibilityInfo(cat, settings, now);
      if (info.hiddenNow || hasSchedule(cat)) {
        out.push({
          kind: 'category',
          id: cat.id,
          name: cat.name,
          info,
          row: cat,
          itemCount: (menuItems || []).filter((i) => i.category_id === cat.id).length,
        });
      }
    });

    (menuItems || []).forEach((it) => {
      const info = getVisibilityInfo(it, settings, now);
      if (info.hiddenNow || hasSchedule(it)) {
        const cat = (categories || []).find((c) => c.id === it.category_id);
        out.push({
          kind: 'item',
          id: it.id,
          name: it.title || 'Untitled',
          info,
          row: it,
          categoryName: cat?.name || '',
        });
      }
    });

    // Sort: hidden-now first, then scheduled-only.
    out.sort((a, b) => {
      if (a.info.hiddenNow !== b.info.hiddenNow) return a.info.hiddenNow ? -1 : 1;
      return 0;
    });

    return out;
  }, [categories, menuItems, settings, now]);

  /* ---------- counts ---------- */
  const hiddenCount = useMemo(() => rows.filter((r) => r.info.hiddenNow).length, [rows]);
  const scheduledCount = useMemo(
    () => rows.filter((r) => !r.info.hiddenNow && r.info.hasSchedule).length,
    [rows]
  );

  /* ---------- filter + search ---------- */
  const visibleRows = useMemo(() => {
    let list = rows;
    if (filter === 'hidden') list = list.filter((r) => r.info.hiddenNow);
    else if (filter === 'scheduled') list = list.filter((r) => !r.info.hiddenNow && r.info.hasSchedule);
    else if (filter === 'categories') list = list.filter((r) => r.kind === 'category');
    else if (filter === 'items') list = list.filter((r) => r.kind === 'item');

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q));
    }
    return list;
  }, [rows, filter, query]);

  return (
    <div className="space-y-6">
      {/* Summary chips */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Hidden now</p>
          <p className="text-2xl font-black text-amber-200 mt-1 leading-none">{hiddenCount}</p>
        </div>
        <div className="bg-sky-500/10 border border-sky-500/25 rounded-2xl p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-sky-400">Scheduled</p>
          <p className="text-2xl font-black text-sky-200 mt-1 leading-none">{scheduledCount}</p>
        </div>
      </div>

      {/* Search + filter */}
      <Panel className="!p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <Icon path={ICONS.search} className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-sm outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-slate-600"
            />
          </div>
          <div className="flex gap-1.5 shrink-0 flex-wrap">
            {[
              { id: 'all', label: 'All' },
              { id: 'hidden', label: 'Hidden now' },
              { id: 'scheduled', label: 'Scheduled' },
              { id: 'categories', label: 'Categories' },
              { id: 'items', label: 'Items' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  filter === f.id
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70 border border-transparent'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      {/* List */}
      {visibleRows.length === 0 ? (
        <EmptyState
          icon={ICONS.eye}
          title={rows.length === 0 ? 'Nothing is hidden' : 'No matching results'}
          hint={rows.length === 0 ? 'Everything is visible to customers.' : 'Try changing the filter or search.'}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {visibleRows.map(({ kind, id, name, info, row, itemCount, categoryName }) => (
            <div
              key={`${kind}-${id}`}
              className="bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-800/80 p-4 sm:p-5 flex flex-col gap-3 transition-all hover:border-slate-700"
            >
              {/* Top row: badge + pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                  kind === 'category'
                    ? 'bg-orange-500/15 border-orange-500/30 text-orange-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300'
                }`}>
                  {kind === 'category' ? 'Section' : 'Item'}
                </span>
                {info.hiddenNow && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/15 text-amber-300 border border-amber-500/25">
                    Hidden now
                  </span>
                )}
                {!info.hiddenNow && info.hasSchedule && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-sky-500/15 text-sky-300 border border-sky-500/25">
                    Scheduled
                  </span>
                )}
                {row.hide_reason && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-800/80 text-slate-300 border border-slate-700">
                    {REASON_LABEL[row.hide_reason] || row.hide_reason}
                  </span>
                )}
              </div>

              {/* Name */}
              <div>
                <p className="text-base font-black text-white tracking-tight">{name}</p>
                {kind === 'item' && categoryName && (
                  <p className="text-[11px] text-slate-500 mt-0.5">in {categoryName}</p>
                )}
                {kind === 'category' && itemCount > 0 && (
                  <p className="text-[11px] text-slate-500 mt-0.5">Includes {itemCount} item{itemCount === 1 ? '' : 's'}</p>
                )}
              </div>

              {/* Info lines */}
              {info.lines.length > 0 && (
                <ul className="space-y-1">
                  {info.lines.map((line, i) => (
                    <li key={i} className="text-[11px] text-slate-400 leading-snug flex items-start gap-1.5">
                      <span className="text-slate-600 mt-0.5">•</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/70 mt-1">
                {info.manualHidden && (
                  <Btn variant="success" size="sm" onClick={() => onUnhide(kind, row)}>
                    <Icon path={ICONS.eye} className="w-3.5 h-3.5" />
                    Unhide now
                  </Btn>
                )}
                <Btn variant="subtle" size="sm" onClick={() => onEdit(kind, row)}>
                  <Icon path={ICONS.clock} className="w-3.5 h-3.5" />
                  Edit / Schedule
                </Btn>
                {hasSchedule(row) && (
                  <Btn variant="danger" size="sm" onClick={() => onClearSchedule(kind, row)}>
                    <Icon path={ICONS.x} className="w-3.5 h-3.5" />
                    Remove schedule
                  </Btn>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}