'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { withStableSlugs, menuHref } from '@/lib/menuSlug';

// Admin card for the "Limited-time offer" on the home page.
// Props: categories (array from the admin page), ImageUploadField (the Cloudinary uploader already in your admin file)

const EMPTY = {
  is_active: true, badge: 'Limited-time offer', title: '', highlight: '', description: '',
  price: '', old_price: '', img: '', link: '', button_text: 'Claim this offer', ends_at: '',
};

const getImagePath = (v) => {
  if (!v || !String(v).trim()) return '/images/placeholder.webp';
  const s = String(v).trim();
  return s.startsWith('/') || s.startsWith('http') ? s : `/images/${s}.webp`;
};

// Dates are always entered and shown in Pakistan time, whatever device the admin uses
const toInput = (iso) => {
  if (!iso) return '';
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Karachi', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(new Date(iso)).replace(' ', 'T');
};
const toIso = (v) => (v ? new Date(`${v}:00+05:00`).toISOString() : null);

const field = 'w-full p-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm outline-none focus:border-orange-500';
const label = 'block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1';

export default function OfferManager({ categories = [], ImageUploadField }) {
  const [form, setForm] = useState(EMPTY);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'ok' | 'error', text }

  // ✅ Final, stable slugs — same source as home tiles and menu sections.
  const stableCategories = withStableSlugs(categories || []);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('home_offer').select('*').eq('id', 1).maybeSingle();
      if (error) {
        setStatus({ type: 'error', text: 'Offer table not found yet. Run the Supabase setup SQL first, then reload.' });
      } else if (data) {
        setForm({
          ...EMPTY,
          is_active: data.is_active ?? true,
          badge: data.badge ?? '', title: data.title ?? '', highlight: data.highlight ?? '',
          description: data.description ?? '', price: data.price ?? '', old_price: data.old_price ?? '',
          img: data.img ?? '', link: data.link ?? '', button_text: data.button_text ?? '',
          ends_at: toInput(data.ends_at),
        });
      }
      setReady(true);
    })();
  }, []);

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setStatus(null); };
  const setVal = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setStatus(null); };

  const linkOptions = stableCategories.map((c) => menuHref(c.slug));
  const linkChoice = !form.link ? '' : linkOptions.includes(form.link) ? form.link : '__custom';

  const handleSave = async () => {
    if (!form.title.trim()) return setStatus({ type: 'error', text: 'Title is required.' });
    const price = form.price === '' ? null : Number(form.price);
    const oldPrice = form.old_price === '' ? null : Number(form.old_price);
    if ((price !== null && Number.isNaN(price)) || (oldPrice !== null && Number.isNaN(oldPrice))) {
      return setStatus({ type: 'error', text: 'Prices must be numbers.' });
    }
    const endsAt = toIso(form.ends_at);
    if (form.ends_at && Number.isNaN(new Date(endsAt).getTime())) {
      return setStatus({ type: 'error', text: 'End date is not valid.' });
    }

    setSaving(true);
    const { error } = await supabase.from('home_offer').upsert({
      id: 1,
      is_active: form.is_active,
      badge: form.badge.trim() || null,
      title: form.title.trim(),
      highlight: form.highlight.trim() || null,
      description: form.description.trim() || null,
      price,
      old_price: oldPrice,
      img: String(form.img).trim() || null,
      link: form.link.trim() || null,
      button_text: form.button_text.trim() || 'Claim this offer',
      ends_at: endsAt,
    }, { onConflict: 'id' });
    setSaving(false);

    setStatus(error
      ? { type: 'error', text: `Could not save: ${error.message}` }
      : { type: 'ok', text: 'Saved. The website shows it right away.' });
  };

  return (
    <div className="bg-gray-800/60 p-6 rounded-3xl border border-orange-500/40 space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3 border-b border-gray-700 pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-orange-400 uppercase">Limited-Time Offer</h2>
          <p className="text-xs text-gray-400">The yellow ticket on the home page. Has its own Save button below.</p>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <span className="text-xs font-bold uppercase text-gray-300">{form.is_active ? 'Showing on website' : 'Hidden'}</span>
          <input type="checkbox" checked={form.is_active} onChange={(e) => setVal('is_active', e.target.checked)} className="sr-only peer" />
          <span className="relative w-14 h-7 bg-gray-700 rounded-full peer-checked:bg-emerald-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-1 after:w-6 after:h-6 after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-6" />
        </label>
      </div>

      {!ready ? (
        <p className="text-xs text-gray-500 uppercase font-bold">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div><label className={label}>Small tag</label><input className={field} value={form.badge} onChange={set('badge')} placeholder="Limited-time offer" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={label}>Title</label><input className={field} value={form.title} onChange={set('title')} placeholder="Jumbo deal." /></div>
              <div><label className={label}>Second line (orange)</label><input className={field} value={form.highlight} onChange={set('highlight')} placeholder="Order now!" /></div>
            </div>
            <div><label className={label}>Description</label><textarea rows="3" className={`${field} resize-none`} value={form.description} onChange={set('description')} placeholder="What does the customer get?" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={label}>Price (Rs.) optional</label><input type="number" min="0" className={field} value={form.price} onChange={set('price')} /></div>
              <div><label className={label}>Old price (Rs.) optional</label><input type="number" min="0" className={field} value={form.old_price} onChange={set('old_price')} /></div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="h-36 bg-gray-950 rounded-xl overflow-hidden border border-gray-800">
              <img src={getImagePath(form.img)} alt="Offer preview" className="w-full h-full object-cover" />
            </div>
            <div>
              <label className={label}>Image number or link</label>
              <input className={field} value={form.img} onChange={set('img')} placeholder="4" />
            </div>
            {ImageUploadField && (
              <ImageUploadField currentValue={form.img} onUploaded={(url) => setVal('img', url)} label="Or upload new image" />
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><label className={label}>Button text</label><input className={field} value={form.button_text} onChange={set('button_text')} /></div>
              <div>
                <label className={label}>Button opens</label>
                <select
                  className={`${field} cursor-pointer`}
                  value={linkChoice}
                  onChange={(e) => e.target.value !== '__custom' && setVal('link', e.target.value)}
                >
                  <option value="">Deals section (default)</option>
                  {stableCategories.map((c) => (
                    <option key={c.id} value={menuHref(c.slug)}>{c.name}</option>
                  ))}
                  <option value="__custom">Custom link…</option>
                </select>
              </div>
            </div>
            {linkChoice === '__custom' && (
              <input className={field} value={form.link} onChange={set('link')} placeholder="/menu or /menu#shawarmas" />
            )}
            <div>
              <label className={label}>Ends at (Pakistan time) optional</label>
              <div className="flex gap-2">
                <input type="datetime-local" className={field} value={form.ends_at} onChange={set('ends_at')} />
                {form.ends_at && (
                  <button type="button" onClick={() => setVal('ends_at', '')} className="px-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-xs font-bold uppercase cursor-pointer">Clear</button>
                )}
              </div>
              <p className="mt-1 text-[11px] text-gray-500">With an end time the site shows a countdown and hides the offer by itself when time is up.</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button type="button" onClick={handleSave} disabled={saving || !ready}
          className="px-8 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg shadow-orange-600/30 cursor-pointer">
          {saving ? 'Saving...' : '💾 Save Offer'}
        </button>
        {status && (
          <p role="status" className={`text-xs font-bold ${status.type === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>{status.text}</p>
        )}
      </div>
    </div>
  );
}