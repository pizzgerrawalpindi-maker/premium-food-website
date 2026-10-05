'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

/* ============================================================
   ICONS
   ============================================================ */
const Icon = ({ path, className = 'w-4 h-4', stroke = 2 }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);
const ICONS = {
  save: 'M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z M17 21v-8H7v8 M7 3v5h8',
  plus: 'M12 5v14M5 12h14',
  trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 15a3 3 0 100-6 3 3 0 000 6z',
  eyeOff: 'M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24 M1 1l22 22',
  chevronUp: 'M18 15l-6-6-6 6',
  chevronDown: 'M6 9l6 6 6-6',
  refresh: 'M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15',
};

/* ============================================================
   MINI UI
   ============================================================ */
function Btn({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const variants = {
    primary: 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-lg shadow-orange-950/40 border-orange-400/20',
    ghost: 'bg-slate-800/60 hover:bg-slate-700/70 text-slate-200 border-slate-700/70',
    danger: 'bg-rose-600/15 hover:bg-rose-600 text-rose-400 hover:text-white border-rose-500/20',
  };
  const sizes = { sm: 'px-3 py-1.5 text-[11px]', md: 'px-4 py-2.5 text-xs', lg: 'px-5 py-3 text-sm' };
  return (
    <button {...props} className={`inline-flex items-center justify-center gap-1.5 font-black uppercase tracking-wider rounded-xl border transition-all duration-200 cursor-pointer active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
}

function IconBtn({ icon, onClick, title, tone = 'neutral', size = 'sm' }) {
  const tones = {
    neutral: 'text-slate-400 hover:text-white hover:bg-slate-700/60',
    warn: 'text-amber-400 hover:bg-amber-500/15',
    danger: 'text-rose-400 hover:bg-rose-500/15',
  };
  const sizes = { sm: 'w-7 h-7', md: 'w-8 h-8' };
  return (
    <button type="button" onClick={onClick} title={title} className={`${sizes[size]} rounded-lg flex items-center justify-center transition-all cursor-pointer ${tones[tone]}`}>
      <Icon path={icon} className="w-4 h-4" />
    </button>
  );
}

function Input({ label, hint, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</label>}
      <input {...props} className={`w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-sm font-medium outline-none transition-all placeholder:text-slate-600 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 ${props.className || ''}`} />
      {hint && <p className="text-[10px] text-slate-500">{hint}</p>}
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</label>}
      <textarea {...props} className={`w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-sm font-medium outline-none transition-all placeholder:text-slate-600 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 resize-none ${props.className || ''}`} />
    </div>
  );
}

function Panel({ children, className = '' }) {
  return <div className={`bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-5 sm:p-6 ${className}`}>{children}</div>;
}

/* ============================================================
   DEFAULTS
   ============================================================ */
const DEFAULT_PRIVACY = {
  key: 'privacy',
  title: 'Privacy Policy',
  title_highlight: '',
  badge_text: 'Secure & Trusted',
  subtitle: 'We value your privacy like our secret sauces. Your trust is our main ingredient.',
  story_title: '',
  story_paragraphs: [],
  points: [
    { num: '01', title: 'Information Collection', desc: 'We collect basic customer information such as name, phone number, address, and order details only for processing and delivering orders.', hidden: false },
    { num: '02', title: 'Data Sharing', desc: 'All personal information is kept strictly confidential and is only shared with delivery partners or payment processors when necessary to complete an order.', hidden: false },
    { num: '03', title: 'Payment Details', desc: 'We do not store or have access to your payment details; all payments are securely handled by trusted third-party payment gateways.', hidden: false },
    { num: '04', title: 'Communications & Opt-Out', desc: 'Contact information may be used for order updates, service notifications, and promotional messages. Users can opt out of promotional messages at any time.', hidden: false },
    { num: '05', title: 'Cookies & Tracking', desc: 'We use cookies to improve user experience, analyze website performance, and personalize content. Users can disable cookies through their browser settings.', hidden: false },
    { num: '06', title: 'Service Improvement', desc: 'Collected data may be used for improving services, website performance, and customer experience, but it will never be used to personally identify users.', hidden: false },
    { num: '07', title: 'Third-Party Links', desc: 'Our website may contain links to third-party services. We are not responsible for their privacy policies or content.', hidden: false },
    { num: '08', title: 'Security Measures', desc: 'We apply reasonable security measures to protect user data, but no online system can guarantee 100% security.', hidden: false },
    { num: '09', title: 'Data Retention', desc: 'Personal data is retained only for as long as necessary for operational or legal purposes and is securely deleted afterward.', hidden: false },
    { num: '10', title: 'Policy Updates', desc: 'By using this website, users agree to this Privacy Policy. We may update it from time to time without prior notice.', hidden: false },
  ],
};

const DEFAULT_TERMS = {
  key: 'terms',
  title: 'Terms of Service',
  title_highlight: '',
  badge_text: 'The fine print before the first bite',
  subtitle: 'Please read these terms carefully before placing an order on our platform.',
  story_title: '',
  story_paragraphs: [],
  points: [
    { num: '01', title: 'Service Availability', desc: 'The service is available only within selected delivery areas and operating hours. Availability may be affected by weather, traffic, or operational conditions.', hidden: false },
    { num: '02', title: 'Order Confirmation', desc: 'Orders are confirmed only after successful payment or verification. Orders may be cancelled if items are unavailable or due to technical issues.', hidden: false },
    { num: '03', title: 'Minimum Order Value', desc: 'A minimum order value of Rs. 600 is required for delivery. Orders below this amount will not be processed.', hidden: false },
    { num: '04', title: 'Pricing & Taxes', desc: 'All prices are subject to applicable taxes (including GST) and may change without prior notice.', hidden: false },
    { num: '05', title: 'Delivery Estimates', desc: 'Delivery times are estimated and may vary due to factors such as traffic, order volume, or weather conditions.', hidden: false },
    { num: '06', title: 'Refunds & Returns', desc: 'Food items are non-returnable. Refunds are only issued for incorrect, damaged, or incomplete orders after proper verification.', hidden: false },
    { num: '07', title: 'Intellectual Property', desc: 'All website content, including images, text, graphics, and design, is the property of the business and cannot be copied or reused without permission.', hidden: false },
    { num: '08', title: 'Accuracy of Information', desc: 'Customers must provide accurate delivery and contact details. Failed deliveries due to incorrect information are not the responsibility of the business.', hidden: false },
    { num: '09', title: 'Promotional Offers', desc: 'Discounts, coupons, and promotional offers are subject to specific terms and validity and cannot be combined unless explicitly stated.', hidden: false },
    { num: '10', title: 'Policy Updates', desc: 'The business reserves the right to update or modify these Terms & Conditions at any time. Users are responsible for reviewing updates.', hidden: false },
  ],
};

const DEFAULT_ABOUT = {
  key: 'about',
  title: 'About',
  title_highlight: 'PizzGer',
  badge_text: 'The Ultimate Vibe',
  subtitle: "Serving Rawalpindi's favorite daily dose of delicious fast food, fusion parathas, and legendary burgers right from Main Tipu Road.",
  story_title: 'Our Story & Legacy',
  story_paragraphs: [
    'Nestled on Main Tipu Road, Rawalpindi, PizzGer started with a bold mission: to revolutionize the fast-casual dining experience by blending exceptional taste with unmatched quality. What began as a passionate food hub has evolved into a local landmark trusted by food enthusiasts across the twin cities.',
    'From our iconic Pizzger Special Burgers and innovative Pizza Parathas to mouthwatering loaded fries and crispy wings, every recipe is crafted to perfection. We believe that great food brings people together, and our kitchen works tirelessly every single day to maintain that standard of excellence.',
  ],
  points: [
    { num: '01', title: 'Premium Ingredients', desc: 'We source top-grade cheese, fresh chicken, and crisp vegetables daily to ensure supreme taste in every bite.', hidden: false },
    { num: '02', title: 'Innovative Fusion', desc: 'Pioneering unique culinary creations like our signature Pizza Parathas and stacked Tower Burgers.', hidden: false },
    { num: '03', title: "Rawalpindi's Pride", desc: 'Centrally located on Tipu Road, delivering hot, fresh, and delightful meals right to your doorstep with lightning speed.', hidden: false },
  ],
};

const DEFAULTS = {
  privacy: DEFAULT_PRIVACY,
  terms: DEFAULT_TERMS,
  about: DEFAULT_ABOUT,
};

const TABS = [
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'terms', label: 'Terms of Service' },
  { id: 'about', label: 'About Us' },
];

const renumber = (points) =>
  points.map((p, i) => ({ ...p, num: String(i + 1).padStart(2, '0') }));

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function PageEditor() {
  const [tab, setTab] = useState('privacy');
  const [pages, setPages] = useState({ privacy: null, terms: null, about: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg, id: Date.now() });
    setTimeout(() => setToast(null), 2600);
  };

  /* ---------- load ---------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await supabase.from('site_pages').select('*');
        if (cancelled) return;
        const rows = data || [];
        const next = {};
        ['privacy', 'terms', 'about'].forEach((k) => {
          const row = rows.find((r) => r.key === k);
          const def = DEFAULTS[k];
          next[k] = row
            ? {
                ...def,
                ...row,
                points: Array.isArray(row.points) ? row.points : def.points,
                story_paragraphs: Array.isArray(row.story_paragraphs) ? row.story_paragraphs : [],
              }
            : { ...def, points: def.points.map((p) => ({ ...p })), story_paragraphs: [...(def.story_paragraphs || [])] };
        });
        setPages(next);
      } catch (err) {
        console.error('Failed to load pages:', err);
        showToast('error', 'Could not load page content');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const current = pages[tab];
  const defaults = DEFAULTS[tab];
  const isAbout = tab === 'about';

  const setCurrent = useCallback((updater) => {
    setPages((prev) => {
      const updated = typeof updater === 'function' ? updater(prev[tab]) : updater;
      return { ...prev, [tab]: updated };
    });
  }, [tab]);

  /* ---------- generic field updater ---------- */
  const updateField = (field, value) => setCurrent((prev) => ({ ...prev, [field]: value }));

  /* ---------- points ---------- */
  const updatePoint = (index, patch) =>
    setCurrent((prev) => {
      const next = [...(prev.points || [])];
      next[index] = { ...next[index], ...patch };
      return { ...prev, points: next };
    });

  const toggleHidden = (index) =>
    setCurrent((prev) => {
      const next = [...(prev.points || [])];
      next[index] = { ...next[index], hidden: !next[index].hidden };
      return { ...prev, points: next };
    });

  const movePoint = (index, dir) =>
    setCurrent((prev) => {
      const next = [...(prev.points || [])];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, points: renumber(next) };
    });

  const addPoint = () =>
    setCurrent((prev) => {
      const next = [...(prev.points || []), { num: '', title: isAbout ? 'New Pillar' : 'New Point', desc: '', hidden: false }];
      return { ...prev, points: renumber(next) };
    });

  const deletePoint = (index) =>
    setCurrent((prev) => {
      const next = [...(prev.points || [])].filter((_, i) => i !== index);
      return { ...prev, points: renumber(next) };
    });

  /* ---------- story paragraphs (About only) ---------- */
  const updateParagraph = (index, value) =>
    setCurrent((prev) => {
      const next = [...(prev.story_paragraphs || [])];
      next[index] = value;
      return { ...prev, story_paragraphs: next };
    });

  const addParagraph = () =>
    setCurrent((prev) => ({
      ...prev,
      story_paragraphs: [...(prev.story_paragraphs || []), ''],
    }));

  const deleteParagraph = (index) =>
    setCurrent((prev) => ({
      ...prev,
      story_paragraphs: (prev.story_paragraphs || []).filter((_, i) => i !== index),
    }));

  const moveParagraph = (index, dir) =>
    setCurrent((prev) => {
      const next = [...(prev.story_paragraphs || [])];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, story_paragraphs: next };
    });

  /* ---------- reset + save ---------- */
  const resetToDefaults = () =>
    setCurrent({
      ...defaults,
      points: (defaults.points || []).map((p) => ({ ...p })),
      story_paragraphs: [...(defaults.story_paragraphs || [])],
    });

  const handleSave = useCallback(async () => {
    if (!current) return;
    setSaving(true);
    try {
      const payload = {
        key: current.key,
        title: current.title || '',
        title_highlight: current.title_highlight || null,
        badge_text: current.badge_text || '',
        subtitle: current.subtitle || '',
        story_title: current.story_title || null,
        story_paragraphs: isAbout ? (current.story_paragraphs || []).filter((p) => typeof p === 'string') : [],
        intro_text: current.intro_text || '',
        points: renumber((current.points || []).map((p) => ({
          num: p.num,
          title: p.title || '',
          desc: p.desc || '',
          hidden: p.hidden === true,
        }))),
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from('site_pages').upsert(payload, { onConflict: 'key' });
      if (error) throw error;
      setCurrent((prev) => ({ ...prev, points: payload.points, story_paragraphs: payload.story_paragraphs }));
      showToast('success', `${TABS.find((t) => t.id === tab)?.label} saved`);
    } catch (err) {
      console.error(err);
      showToast('error', err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [current, tab, isAbout, setCurrent]);

  if (loading || !current) {
    return (
      <Panel>
        <p className="text-sm text-slate-400">Loading…</p>
      </Panel>
    );
  }

  const visibleCount = (current.points || []).filter((p) => !p.hidden).length;
  const totalCount = (current.points || []).length;

  return (
    <div className="space-y-6">

      {toast && (
        <div className={`fixed top-5 right-5 z-[300] px-4 py-3 rounded-2xl shadow-2xl border text-sm font-bold ${
          toast.type === 'success'
            ? 'bg-emerald-500/90 text-white border-emerald-400/40'
            : 'bg-rose-500/90 text-white border-rose-400/40'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Tabs */}
      <Panel className="!p-3">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                tab === t.id
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70 border border-transparent'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Panel>

      {/* Meta fields */}
      <Panel>
        <div className="space-y-4">
          <div className={`grid grid-cols-1 ${isAbout ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
            <Input
              label="Title"
              value={current.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder={isAbout ? 'About' : 'Privacy Policy'}
            />
            {isAbout && (
              <Input
                label="Highlight part (orange italic)"
                value={current.title_highlight || ''}
                onChange={(e) => updateField('title_highlight', e.target.value)}
                placeholder="PizzGer"
              />
            )}
            <Input
              label="Badge text"
              value={current.badge_text || ''}
              onChange={(e) => updateField('badge_text', e.target.value)}
              placeholder="Secure & Trusted"
            />
          </div>
          <Input
            label="Subtitle"
            value={current.subtitle || ''}
            onChange={(e) => updateField('subtitle', e.target.value)}
            placeholder="Short intro line under the heading"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-slate-500">
              {visibleCount} of {totalCount} {isAbout ? 'pillars' : 'points'} visible to customers.
            </p>
            <div className="flex items-center gap-2">
              <Btn variant="ghost" size="sm" onClick={resetToDefaults} type="button">
                <Icon path={ICONS.refresh} className="w-3.5 h-3.5" />
                Reset to defaults
              </Btn>
              <Btn variant="primary" size="sm" onClick={handleSave} disabled={saving} type="button">
                <Icon path={ICONS.save} className="w-3.5 h-3.5" />
                {saving ? 'Saving…' : 'Save'}
              </Btn>
            </div>
          </div>
        </div>
      </Panel>

      {/* Story section — About only */}
      {isAbout && (
        <Panel>
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
            <div>
              <h2 className="text-base font-black text-white">Story Section</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Heading and paragraphs shown on the About page. Empty title hides the heading.
              </p>
            </div>
            <Btn variant="primary" size="sm" onClick={addParagraph} type="button">
              <Icon path={ICONS.plus} className="w-3.5 h-3.5" />
              Add paragraph
            </Btn>
          </div>

          <Input
            label="Story heading"
            value={current.story_title || ''}
            onChange={(e) => updateField('story_title', e.target.value)}
            placeholder="Our Story & Legacy"
            className="mb-4"
          />

          {(current.story_paragraphs || []).length === 0 ? (
            <div className="text-center py-8 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40">
              <p className="text-xs text-slate-500">No paragraphs yet. Click "Add paragraph" to create one.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(current.story_paragraphs || []).map((p, i) => (
                <div key={i} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-lg bg-orange-500/15 border border-orange-500/25 text-orange-300 text-[10px] font-black uppercase tracking-widest">
                      Paragraph {i + 1}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <IconBtn icon={ICONS.chevronUp} onClick={() => moveParagraph(i, -1)} title="Move up" size="sm" />
                      <IconBtn icon={ICONS.chevronDown} onClick={() => moveParagraph(i, 1)} title="Move down" size="sm" />
                      <IconBtn icon={ICONS.trash} onClick={() => deleteParagraph(i)} title="Delete" tone="danger" size="sm" />
                    </div>
                  </div>
                  <Textarea
                    rows={3}
                    value={p || ''}
                    onChange={(e) => updateParagraph(i, e.target.value)}
                    placeholder="Write a paragraph of the story..."
                  />
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      {/* Points / Pillars list */}
      <Panel>
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
          <div>
            <h2 className="text-base font-black text-white">
              {isAbout ? 'Core Pillars' : 'Points / Policies'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isAbout
                ? 'Numbered cards shown in the grid below the story. Add, edit, hide, reorder or delete them here.'
                : 'Add, edit, hide, reorder or delete points. Number is renumbered automatically.'}
            </p>
          </div>
          <Btn variant="primary" size="sm" onClick={addPoint} type="button">
            <Icon path={ICONS.plus} className="w-3.5 h-3.5" />
            {isAbout ? 'Add pillar' : 'Add point'}
          </Btn>
        </div>

        {(current.points || []).length === 0 ? (
          <div className="text-center py-10 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40">
            <p className="text-sm font-bold text-slate-300 uppercase tracking-wider">Nothing here yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Click &quot;Add {isAbout ? 'pillar' : 'point'}&quot; to create the first one.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {(current.points || []).map((p, i) => (
              <div
                key={i}
                className={`rounded-2xl border p-3 sm:p-4 transition-all ${
                  p.hidden
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-2 py-0.5 rounded-lg bg-orange-500/15 border border-orange-500/25 text-orange-300 text-[10px] font-black uppercase tracking-widest shrink-0">
                      #{p.num || String(i + 1).padStart(2, '0')}
                    </span>
                    {p.hidden && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-800 text-slate-400 border border-slate-700">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <IconBtn icon={ICONS.chevronUp} onClick={() => movePoint(i, -1)} title="Move up" size="sm" />
                    <IconBtn icon={ICONS.chevronDown} onClick={() => movePoint(i, 1)} title="Move down" size="sm" />
                    <IconBtn icon={p.hidden ? ICONS.eye : ICONS.eyeOff} onClick={() => toggleHidden(i)} title={p.hidden ? 'Show' : 'Hide'} tone={p.hidden ? 'warn' : 'neutral'} size="sm" />
                    <IconBtn icon={ICONS.trash} onClick={() => deletePoint(i)} title="Delete" tone="danger" size="sm" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Input
                    label={isAbout ? 'Pillar title' : 'Title'}
                    value={p.title || ''}
                    onChange={(e) => updatePoint(i, { title: e.target.value })}
                    placeholder={isAbout ? 'e.g. Premium Ingredients' : 'e.g. Information Collection'}
                  />
                  <Textarea
                    label="Description"
                    rows={2}
                    value={p.desc || ''}
                    onChange={(e) => updatePoint(i, { desc: e.target.value })}
                    placeholder="Short description..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <Btn variant="primary" size="lg" onClick={handleSave} disabled={saving} type="button">
            <Icon path={ICONS.save} className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save changes'}
          </Btn>
        </div>
      </Panel>

      <p className="text-[11px] text-slate-500 leading-relaxed">
        Note: changes here go live on{' '}
        <span className="text-orange-400 font-mono">/privacy</span>,{' '}
        <span className="text-orange-400 font-mono">/terms</span> and{' '}
        <span className="text-orange-400 font-mono">/about</span> as soon as you press Save. Hidden
        {isAbout ? ' pillars' : ' points'} stay in the admin but are not shown to customers.
      </p>
    </div>
  );
}