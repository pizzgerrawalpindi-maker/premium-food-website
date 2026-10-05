'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { requestNotificationPermission, listenForForegroundMessages } from '@/lib/firebase';
import AdminAuthGate from './AdminAuthGate';
import OfferManager from './OfferManager';
import HideOptionsModal from './HideOptionsModal';
import HiddenItemsTab from './HiddenItemsTab';
import PageEditor from './PageEditor';
import { slugify, makeUniqueSlug } from '@/lib/menuSlug';
import { getVisibilityInfo, hasSchedule } from '@/lib/visibility';

/* ============================================================
   ICONS
   ============================================================ */
const Icon = ({ path, className = 'w-4 h-4', stroke = 2 }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);
const icons = {
  menu: 'M4 6h16M4 12h16M4 18h16',
  home: 'M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10',
  settings: 'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z',
  orders: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  save: 'M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z M17 21v-8H7v8 M7 3v5h8',
  refresh: 'M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15',
  bell: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0',
  trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 15a3 3 0 100-6 3 3 0 000 6z',
  eyeOff: 'M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24 M1 1l22 22',
  plus: 'M12 5v14M5 12h14',
  check: 'M20 6L9 17l-5-5',
  x: 'M18 6L6 18M6 6l12 12',
  upload: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M17 8l-5-5-5 5 M12 3v12',
  image: 'M3 3h18v18H3z M8.5 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z M21 15l-5-5L5 21',
  video: 'M23 7l-7 5 7 5V7z M1 5h15v14H1z',
  map: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 13a3 3 0 100-6 3 3 0 000 6z',
  whatsapp: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z',
  search: 'M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z',
  clock: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2',
  store: 'M3 9l1-5h16l1 5M3 9v10a2 2 0 002 2h14a2 2 0 002-2V9M3 9h18 M9 22V12h6v10',
  megaphone: 'M3 11l18-5v12L3 14v-3z M11.6 16.8a3 3 0 11-5.8-1.6',
  info: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 16v-4 M12 8h.01',
  alert: 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01',
  chevronDown: 'M6 9l6 6 6-6',
  sparkles: 'M12 3l1.9 5.7L19.6 10l-5.7 1.9L12 17.6l-1.9-5.7L4.4 10l5.7-1.9L12 3z',
  pages: 'M4 4h11l5 5v11a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z M15 4v5h5',
};

/* ============================================================
   PATHS
   ============================================================ */
const getImagePath = (imgVal) => {
  if (!imgVal || imgVal.trim() === '') return '/images/placeholder.webp';
  if (imgVal.startsWith('/') || imgVal.startsWith('http')) return imgVal;
  return `/images/${imgVal}.webp`;
};
const getVideoPath = (vidVal) => {
  if (!vidVal || vidVal.trim() === '') return undefined;
  if (vidVal.startsWith('/') || vidVal.startsWith('http')) return vidVal;
  return `/videos/${vidVal}.webm`;
};

/* ============================================================
   LINK SELECT VALUE
   ============================================================ */
const getLinkSelectValue = (link, categories = []) => {
  const v = (link || '').trim();
  if (!v) return '';
  if (v === '/menu') return '/menu';
  if (categories.some((c) => `/menu#${c.slug || ''}` === v)) return v;
  return '__custom';
};

/* ============================================================
   CLOUDINARY
   ============================================================ */
async function uploadImageToCloudinary(file) {
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Image upload failed');
  return (await res.json()).secure_url;
}
async function uploadVideoToCloudinary(file) {
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Video upload failed');
  return (await res.json()).secure_url;
}

/* ============================================================
   UI PRIMITIVES
   ============================================================ */
function Toast({ toasts, onDismiss }) {
  return (
    <div className="fixed top-5 right-5 z-[300] flex flex-col gap-3 max-w-sm w-[calc(100%-2.5rem)] sm:w-96">
      {toasts.map((t) => {
        const palette = {
          success: 'from-emerald-500/90 to-emerald-600/90 border-emerald-400/30 shadow-emerald-950/50',
          error: 'from-rose-500/90 to-rose-600/90 border-rose-400/30 shadow-rose-950/50',
          info: 'from-sky-500/90 to-sky-600/90 border-sky-400/30 shadow-sky-950/50',
        }[t.type] || 'from-slate-700/90 to-slate-800/90 border-slate-500/30';
        const iconPath = t.type === 'success' ? icons.check : t.type === 'error' ? icons.alert : icons.info;
        return (
          <div key={t.id} className={`bg-gradient-to-br ${palette} backdrop-blur-xl text-white px-4 py-3.5 rounded-2xl shadow-2xl border flex items-start gap-3 animate-[slideIn_0.3s_ease-out]`}>
            <div className="mt-0.5 shrink-0"><Icon path={iconPath} className="w-5 h-5" /></div>
            <div className="flex-1 text-sm font-medium leading-snug">
              <p className="font-bold">{t.title}</p>
              {t.message && <p className="text-white/85 text-xs mt-0.5">{t.message}</p>}
            </div>
            <button onClick={() => onDismiss(t.id)} className="opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
              <Icon path={icons.x} className="w-4 h-4" />
            </button>
          </div>
        );
      })}
      <style jsx>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
}

function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel, danger = true }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-slate-900 border border-slate-700/80 rounded-3xl p-6 max-w-sm w-full shadow-2xl shadow-black/60 animate-[pop_0.25s_ease-out]">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${danger ? 'bg-rose-500/15 text-rose-400' : 'bg-orange-500/15 text-orange-400'}`}>
          <Icon path={danger ? icons.alert : icons.info} className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-black text-white mb-1.5">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-all cursor-pointer">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-xl text-white font-bold text-sm transition-all cursor-pointer ${danger ? 'bg-rose-600 hover:bg-rose-500' : 'bg-orange-600 hover:bg-orange-500'}`}>{confirmLabel}</button>
        </div>
      </div>
      <style jsx>{`
        @keyframes pop { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}

function Panel({ children, className = '', padded = true }) {
  return <div className={`bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl ${padded ? 'p-5 sm:p-6' : ''} ${className}`}>{children}</div>;
}

function SectionHeader({ icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-5">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
            <Icon path={icon} className="w-5 h-5" />
          </div>
        )}
        <div>
          <h2 className="text-base sm:text-lg font-black text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

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

function IconBtn({ icon, onClick, title, tone = 'neutral', size = 'md' }) {
  const tones = {
    neutral: 'text-slate-400 hover:text-white hover:bg-slate-700/60',
    warn: 'text-amber-400 hover:bg-amber-500/15',
    danger: 'text-rose-400 hover:bg-rose-500/15',
    sky: 'text-sky-400 hover:bg-sky-500/15',
  };
  const sizes = { sm: 'w-7 h-7', md: 'w-8 h-8' };
  return (
    <button type="button" onClick={onClick} title={title} className={`${sizes[size]} rounded-lg flex items-center justify-center transition-all cursor-pointer ${tones[tone]}`}>
      <Icon path={icon} className="w-4 h-4" />
    </button>
  );
}

function Input({ label, accent = false, hint, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className={`block text-[10px] font-black uppercase tracking-widest ${accent ? 'text-orange-400' : 'text-slate-500'}`}>{label}</label>}
      <input {...props} className={`w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-sm font-medium outline-none transition-all placeholder:text-slate-600 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 ${props.className || ''}`} />
      {hint && <p className="text-[10px] text-slate-500">{hint}</p>}
    </div>
  );
}

function Textarea({ label, accent = false, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className={`block text-[10px] font-black uppercase tracking-widest ${accent ? 'text-orange-400' : 'text-slate-500'}`}>{label}</label>}
      <textarea {...props} className={`w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-sm font-medium outline-none transition-all placeholder:text-slate-600 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 resize-none ${props.className || ''}`} />
    </div>
  );
}

function Toggle({ checked, onChange, tone = 'emerald' }) {
  const tones = { emerald: 'peer-checked:bg-emerald-500', orange: 'peer-checked:bg-orange-500' };
  return (
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className={`w-12 bg-slate-800 rounded-full peer transition-all after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-[22px] ${tones[tone]} shadow-inner`} style={{ height: '26px' }} />
    </label>
  );
}

function StatChip({ label, value, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-800/60 border-slate-700/70 text-slate-200',
    orange: 'bg-orange-500/10 border-orange-500/25 text-orange-300',
    emerald: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300',
    rose: 'bg-rose-500/10 border-rose-500/25 text-rose-300',
  };
  return (
    <div className={`px-3.5 py-2 rounded-xl border ${tones[tone]} flex flex-col min-w-[90px]`}>
      <span className="text-[9px] font-black uppercase tracking-widest opacity-70">{label}</span>
      <span className="text-lg font-black leading-tight">{value}</span>
    </div>
  );
}

function EmptyState({ icon = icons.info, title, hint }) {
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
   LINK PICKER (dropdown + custom input) — reusable
   ============================================================ */
function LinkPicker({ label = 'Link to menu section', value, categories = [], onChange, placeholder = '/menu or /menu#burgers' }) {
  const selectVal = getLinkSelectValue(value, categories);
  return (
    <div className="space-y-2">
      <div className="space-y-1.5">
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</label>
        <select
          value={selectVal}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '__custom') return;
            onChange(v);
          }}
          className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-sm font-bold outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 cursor-pointer transition-all"
        >
          <option value="">-- choose --</option>
          <option value="/menu">Full menu</option>
          {categories.map((c) => (
            <option key={c.id} value={`/menu#${c.slug || ''}`}>{c.name}</option>
          ))}
          <option value="__custom">Custom link…</option>
        </select>
      </div>
      <Input
        label="Link"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

/* ============================================================
   UPLOAD FIELDS
   ============================================================ */
function UploadField({ accept, label, onUploaded, uploader, uploadingText, idleText, idleIcon, validate }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validate(file);
    if (err) { setError(err); return; }
    setError('');
    setUploading(true);
    try {
      const url = await uploader(file);
      onUploaded(url);
    } catch (err) {
      console.error(err);
      setError('Upload failed. Try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</label>}
      <label className={`flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl bg-slate-950/60 border border-dashed border-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-all hover:border-orange-500/60 hover:text-orange-400 hover:bg-orange-500/5 ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
        <Icon path={uploading ? icons.refresh : idleIcon} className={`w-4 h-4 ${uploading ? 'animate-spin' : ''}`} />
        <span>{uploading ? uploadingText : idleText}</span>
        <input type="file" accept={accept} onChange={handleFileChange} disabled={uploading} className="hidden" />
      </label>
      {error && <p className="text-[10px] text-rose-400 font-bold">{error}</p>}
    </div>
  );
}

const ImageUploadField = ({ onUploaded, label = 'Upload Image' }) => (
  <UploadField
    accept="image/*"
    label={label}
    onUploaded={onUploaded}
    uploader={uploadImageToCloudinary}
    uploadingText="Uploading image..."
    idleText="Upload new image"
    idleIcon={icons.image}
    validate={(file) => {
      if (!file.type.startsWith('image/')) return 'Please select an image.';
      if (file.size > 10 * 1024 * 1024) return 'Max size is 10MB.';
      return null;
    }}
  />
);

const VideoUploadField = ({ onUploaded, label = 'Upload Video' }) => (
  <UploadField
    accept="video/*"
    label={label}
    onUploaded={onUploaded}
    uploader={uploadVideoToCloudinary}
    uploadingText="Uploading video..."
    idleText="Upload new video"
    idleIcon={icons.video}
    validate={(file) => {
      if (!file.type.startsWith('video/')) return 'Please select a video.';
      if (file.size > 100 * 1024 * 1024) return 'Max size is 100MB.';
      return null;
    }}
  />
);

/* ============================================================
   MAIN DASHBOARD
   ============================================================ */
function AdminDashboardContent() {
  const [activeTab, setActiveTab] = useState('home');
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [homeSliders, setHomeSliders] = useState([]);
  const [homePromos, setHomePromos] = useState([]);
  const [homeVideos, setHomeVideos] = useState([]);
  const [storeSettings, setStoreSettings] = useState({
    id: null, is_open: true, opening_time: '15:00', closing_time: '02:00',
    announcement_text: '', is_announcement_active: false,
    announcement_link: '',
  });
  const [loading, setLoading] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [confirm, setConfirm] = useState(null);
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');

  /* ---------- Smart hide state ---------- */
  const [hideModal, setHideModal] = useState(null);
  const [nowTick, setNowTick] = useState(null);

  useEffect(() => {
    setNowTick(Date.now());
    const id = setInterval(() => setNowTick(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  const nowDate = useMemo(() => (nowTick ? new Date(nowTick) : new Date()), [nowTick]);
  const visSettings = useMemo(
    () => ({ opening_time: storeSettings.opening_time, closing_time: storeSettings.closing_time }),
    [storeSettings.opening_time, storeSettings.closing_time]
  );

  /* ---------- Toast ---------- */
  const toast = useCallback((type, title, message) => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p, { id, type, title, message }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  /* ---------- Realtime orders ---------- */
  useEffect(() => {
    const channel = supabase
      .channel('live-orders-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        setOrders((prev) => [payload.new, ...prev]);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    listenForForegroundMessages((payload) => console.log('Foreground notification:', payload));
  }, []);

  /* ---------- Slug helper ---------- */
  const buildSlugForCategory = useCallback(
    (cat, allCats) =>
      makeUniqueSlug(
        cat.name,
        allCats.filter((c) => c.id !== cat.id).map((c) => c.slug || '')
      ),
    []
  );

  /* ---------- Initial fetch ---------- */
  const fetchInitialData = useCallback(async () => {
    try {
      const [
        { data: catData }, { data: itemData }, { data: orderData },
        { data: sliderData }, { data: promoData },
        { data: vidData }, { data: settingsData },
      ] = await Promise.all([
        supabase.from('categories').select('*').order('display_order', { ascending: true }),
        supabase.from('menu_items').select('*').order('display_order', { ascending: true }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('home_sliders').select('*').order('display_order', { ascending: true }),
        supabase.from('home_promos').select('*').order('display_order', { ascending: true }),
        supabase.from('home_videos').select('*').order('display_order', { ascending: true }),
        supabase.from('settings').select('*').single(),
      ]);
      setCategories(catData || []);
      setMenuItems(itemData || []);
      setOrders(orderData || []);
      setHomeSliders(sliderData || []);
      setHomePromos(promoData || []);
      setHomeVideos(vidData || []);
      if (settingsData) {
        setStoreSettings({
          id: settingsData.id,
          is_open: settingsData.is_open ?? true,
          opening_time: settingsData.opening_time || '15:00',
          closing_time: settingsData.closing_time || '02:00',
          announcement_text: settingsData.announcement_text || '',
          is_announcement_active: settingsData.is_announcement_active ?? false,
          announcement_link: settingsData.announcement_link || '',
        });
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      toast('error', 'Load failed', 'Could not fetch data from server.');
    }
  }, [toast]);

  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

  /* ============================================================
     SAVE ALL — parallel + real error reporting
     ============================================================ */
  const handleSaveAll = useCallback(async () => {
    if (savingAll) return;
    setSavingAll(true);

    const unlockTimer = setTimeout(() => setSavingAll(false), 1000);
    toast('info', 'Saving changes...', 'Syncing your dashboard.');

    try {
      const tasks = [];

      if (storeSettings.id) {
        tasks.push(supabase.from('settings').update({
          is_open: storeSettings.is_open,
          opening_time: storeSettings.opening_time,
          closing_time: storeSettings.closing_time,
          announcement_text: storeSettings.announcement_text,
          is_announcement_active: storeSettings.is_announcement_active,
          announcement_link: storeSettings.announcement_link || null,
        }).eq('id', storeSettings.id));
      }

      const usedSlugs = new Set();
      categories.forEach((cat) => {
        const slug = makeUniqueSlug(cat.name, [...usedSlugs]);
        usedSlugs.add(slug);
        tasks.push(supabase.from('categories').update({
          name: cat.name,
          slug,
          home_image: cat.home_image || null,
          show_on_home: cat.show_on_home !== false,
        }).eq('id', cat.id));
      });

      menuItems.forEach((item) => tasks.push(supabase.from('menu_items').update({
        title: item.title,
        description: item.description,
        image_num: item.image_num !== '' && item.image_num !== null ? String(item.image_num) : null,
        price: item.pricing_options?.length > 0 ? null : parseFloat(item.price || 0),
        pricing_options: item.pricing_options?.length > 0 ? item.pricing_options : null,
      }).eq('id', item.id)));

      homeSliders.forEach((s) => tasks.push(supabase.from('home_sliders').update({ img: s.img, link: s.link }).eq('id', s.id)));
      homePromos.forEach((p) => tasks.push(supabase.from('home_promos').update({ img: p.img, link: p.link, badge: p.badge }).eq('id', p.id)));
      homeVideos.forEach((v) => tasks.push(supabase.from('home_videos').update({ video_url: v.video_url }).eq('id', v.id)));

      const results = await Promise.allSettled(tasks);
      const failed = results.filter((r) => r.status !== 'fulfilled' || r.value?.error);

      if (failed.length > 0) {
        console.error('[Save All] Failed changes:', failed);
        toast('error', `${failed.length} changes failed to save`, 'Check the console for details.');
      } else {
        toast('success', 'All changes saved', 'Your dashboard is now synced.');
      }
      fetchInitialData();
    } catch (err) {
      console.error(err);
      toast('error', 'Save failed', 'Some changes could not be saved.');
    } finally {
      clearTimeout(unlockTimer);
      setSavingAll(false);
    }
  }, [savingAll, storeSettings, categories, menuItems, homeSliders, homePromos, homeVideos, toast, fetchInitialData]);

  /* ---------- Store settings ---------- */
  const handleSaveStoreSettings = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        is_open: storeSettings.is_open,
        opening_time: storeSettings.opening_time,
        closing_time: storeSettings.closing_time,
        announcement_text: storeSettings.announcement_text,
        is_announcement_active: storeSettings.is_announcement_active,
        announcement_link: storeSettings.announcement_link || null,
      };
      if (storeSettings.id) {
        await supabase.from('settings').update(payload).eq('id', storeSettings.id);
      } else {
        await supabase.from('settings').insert([payload]);
        fetchInitialData();
      }
      toast('success', 'Settings saved');
    } catch (err) {
      console.error(err);
      toast('error', 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Notifications ---------- */
  const handleEnableNotifications = async () => {
    setNotificationLoading(true);
    try {
      const token = await requestNotificationPermission();
      if (!token) {
        toast('info', 'Permission denied', 'Enable notifications in browser settings.');
        return;
      }
      const { error } = await supabase
        .from('admin_tokens')
        .upsert([{ fcm_token: token, updated_at: new Date().toISOString() }], { onConflict: 'fcm_token' });
      if (error) throw error;
      const { data: allTokens } = await supabase.from('admin_tokens').select('id, updated_at').order('updated_at', { ascending: true });
      if (allTokens && allTokens.length > 3) {
        const idsToRemove = allTokens.slice(0, allTokens.length - 3).map((t) => t.id);
        await supabase.from('admin_tokens').delete().in('id', idsToRemove);
      }
      toast('success', 'Notifications enabled', 'You will now receive live order alerts.');
    } catch (err) {
      console.error(err);
      toast('error', 'Setup failed');
    } finally {
      setNotificationLoading(false);
    }
  };

  /* ---------- Menu handlers ---------- */
  const handleItemChange = (id, field, value) =>
    setMenuItems((items) => items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  const handleCategoryChange = (id, field, value) =>
    setCategories((cats) => cats.map((c) => (c.id === id ? { ...c, [field]: value } : c)));

  const handlePricingTypeChange = (id, type) =>
    setMenuItems((items) =>
      items.map((i) => {
        if (i.id !== id) return i;
        return type === 'fix'
          ? { ...i, pricing_type: 'fix', price: 0, pricing_options: null }
          : { ...i, pricing_type: 'size', price: null, pricing_options: [{ size: 'Regular', price: '' }] };
      })
    );

  const handleSizeOptionChange = (itemId, index, field, value) =>
    setMenuItems((items) =>
      items.map((i) => {
        if (i.id !== itemId) return i;
        const opts = [...(i.pricing_options || [])];
        opts[index] = { ...opts[index], [field]: value };
        return { ...i, pricing_options: opts };
      })
    );

  const addSizeOption = (itemId) =>
    setMenuItems((items) =>
      items.map((i) => (i.id === itemId ? { ...i, pricing_options: [...(i.pricing_options || []), { size: '', price: '' }] } : i))
    );

  const removeSizeOption = (itemId, index) =>
    setMenuItems((items) =>
      items.map((i) => (i.id === itemId ? { ...i, pricing_options: i.pricing_options.filter((_, x) => x !== index) } : i))
    );

  const handleSaveItem = async (item) => {
    setLoading(true);
    try {
      await supabase.from('menu_items').update({
        title: item.title,
        description: item.description,
        image_num: item.image_num !== '' && item.image_num !== null ? String(item.image_num) : null,
        price: item.pricing_options?.length > 0 ? null : parseFloat(item.price || 0),
        pricing_options: item.pricing_options?.length > 0 ? item.pricing_options : null,
      }).eq('id', item.id);
      toast('success', 'Item saved', item.title);
    } catch (err) {
      console.error(err);
      toast('error', 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async (cat) => {
    setLoading(true);
    try {
      const newSlug = buildSlugForCategory(cat, categories);
      const payload = {
        name: cat.name,
        slug: newSlug,
        home_image: cat.home_image || null,
        show_on_home: cat.show_on_home !== false,
      };
      const { error } = await supabase.from('categories').update(payload).eq('id', cat.id);
      if (error) throw error;
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, ...payload } : c)));
      toast('success', 'Category saved');
    } catch (err) {
      console.error(err);
      toast('error', 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    setConfirm({
      title: 'Delete item?',
      message: 'This card will be removed permanently. This action cannot be undone.',
      onConfirm: async () => {
        setConfirm(null);
        const { error } = await supabase.from('menu_items').delete().eq('id', id);
        if (error) return toast('error', 'Delete failed');
        setMenuItems((items) => items.filter((i) => i.id !== id));
        toast('success', 'Item deleted');
      },
    });
  };

  const handleDeleteCategory = async (id) => {
    setConfirm({
      title: 'Delete category?',
      message: 'The category will be removed. Make sure it has no items before deleting.',
      onConfirm: async () => {
        setConfirm(null);
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) return toast('error', 'Delete failed');
        setCategories((cats) => cats.filter((c) => c.id !== id));
        toast('success', 'Category deleted');
      },
    });
  };

  const handleInsertItemBetween = async (categoryId, targetOrder) => {
    const newOrder = targetOrder + 5;
    const toShift = menuItems.filter((i) => i.category_id === categoryId && (i.display_order || 0) >= newOrder);
    for (const itm of toShift) {
      await supabase.from('menu_items').update({ display_order: (itm.display_order || 0) + 10 }).eq('id', itm.id);
    }
    const { error } = await supabase.from('menu_items').insert([{
      title: 'New Deal / Item',
      description: 'Enter description here...',
      price: 500,
      image_num: null,
      category_id: categoryId,
      display_order: newOrder,
      pricing_options: null,
    }]);
    if (error) return toast('error', 'Insert failed');
    fetchInitialData();
  };

  const handleInsertCategoryBetween = async (targetOrder) => {
    const newOrder = targetOrder + 5;
    const toShift = categories.filter((c) => (c.display_order || 0) >= newOrder);
    await Promise.all(
      toShift.map((c) =>
        supabase.from('categories').update({ display_order: (c.display_order || 0) + 10 }).eq('id', c.id)
      )
    );
    const { error } = await supabase.from('categories').insert([{
      name: 'New Category',
      slug: 'new-category-' + Date.now(),
      display_order: newOrder,
      show_on_home: true,
      home_image: null,
    }]);
    if (error) return toast('error', 'Insert failed');
    fetchInitialData();
  };

  /* ---------- Toggle hidden (simple tables) ---------- */
  const makeToggle = (table, setState) => async (row) => {
    const newValue = !row.is_hidden;
    await supabase.from(table).update({ is_hidden: newValue }).eq('id', row.id);
    setState((prev) => prev.map((r) => (r.id === row.id ? { ...r, is_hidden: newValue } : r)));
  };
  const handleToggleSliderHidden = makeToggle('home_sliders', setHomeSliders);
  const handleTogglePromoHidden = makeToggle('home_promos', setHomePromos);
  const handleToggleVideoHidden = makeToggle('home_videos', setHomeVideos);

  /* ---------- Smart visibility (categories + items) ---------- */
  const getTable = (kind) => (kind === 'category' ? 'categories' : 'menu_items');
  const setterFor = (kind) => (kind === 'category' ? setCategories : setMenuItems);

  const UNHIDE_PAYLOAD = {
    is_hidden: false, hide_mode: null, hidden_at: null,
    hidden_until: null, hide_reason: null,
  };
  const CLEAR_SCHEDULE_PAYLOAD = {
    schedule_enabled: false, schedule_type: null, schedule_start: null,
    schedule_end: null, schedule_days: null, available_from: null, available_until: null,
  };

  const saveVisibility = async (kind, row, payload, successMsg) => {
    const { error } = await supabase.from(getTable(kind)).update(payload).eq('id', row.id);
    if (error) {
      console.error(error);
      toast('error', 'Could not save', error.message);
      return false;
    }
    setterFor(kind)((prev) => prev.map((r) => (r.id === row.id ? { ...r, ...payload } : r)));
    toast('success', successMsg || 'Saved');
    return true;
  };

  const requestHideToggle = (kind, row) => {
    const info = getVisibilityInfo(row, visSettings, new Date());
    if (info.manualHidden) {
      saveVisibility(kind, row, UNHIDE_PAYLOAD, 'Now visible');
      return;
    }
    setHideModal({ kind, row, mode: 'hide' });
  };
  const requestSchedule = (kind, row) => setHideModal({ kind, row, mode: 'schedule' });

  const handleToggleShowOnHome = async (cat) => {
    const newValue = cat.show_on_home === false;
    const { error } = await supabase.from('categories').update({ show_on_home: newValue }).eq('id', cat.id);
    if (error) return toast('error', 'Toggle failed');
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, show_on_home: newValue } : c)));
  };

  /* ---------- Home handlers ---------- */
  const homeHandlers = {
    sliders: {
      change: (id, f, v) => setHomeSliders((s) => s.map((x) => (x.id === id ? { ...x, [f]: v } : x))),
      save: async (s) => { setLoading(true); await supabase.from('home_sliders').update({ img: s.img, link: s.link }).eq('id', s.id); setLoading(false); toast('success', 'Slider saved'); },
      del: (id) => setConfirm({ title: 'Delete slide?', message: 'Slide will be removed from home page.', onConfirm: async () => { setConfirm(null); await supabase.from('home_sliders').delete().eq('id', id); setHomeSliders((s) => s.filter((x) => x.id !== id)); toast('success', 'Slider deleted'); } }),
      add: async () => {
        const newOrder = homeSliders.length ? homeSliders[homeSliders.length - 1].display_order + 10 : 10;
        const { error } = await supabase.from('home_sliders').insert([{ img: '1', link: '/menu', display_order: newOrder }]);
        if (!error) fetchInitialData();
      },
    },
    promos: {
      change: (id, f, v) => setHomePromos((s) => s.map((x) => (x.id === id ? { ...x, [f]: v } : x))),
      save: async (p) => { setLoading(true); await supabase.from('home_promos').update({ img: p.img, link: p.link, badge: p.badge }).eq('id', p.id); setLoading(false); toast('success', 'Promo saved'); },
      del: (id) => setConfirm({ title: 'Delete promo?', message: 'Promo will be removed from home page.', onConfirm: async () => { setConfirm(null); await supabase.from('home_promos').delete().eq('id', id); setHomePromos((s) => s.filter((x) => x.id !== id)); toast('success', 'Promo deleted'); } }),
      add: async () => {
        const newOrder = homePromos.length ? homePromos[homePromos.length - 1].display_order + 10 : 10;
        const { error } = await supabase.from('home_promos').insert([{ img: '5', link: '/menu', badge: '', display_order: newOrder }]);
        if (!error) fetchInitialData();
      },
    },
    videos: {
      change: (id, f, v) => setHomeVideos((s) => s.map((x) => (x.id === id ? { ...x, [f]: v } : x))),
      save: async (v) => { setLoading(true); await supabase.from('home_videos').update({ video_url: v.video_url }).eq('id', v.id); setLoading(false); toast('success', 'Video saved'); },
      del: (id) => setConfirm({ title: 'Delete video?', message: 'Video will be removed from home page.', onConfirm: async () => { setConfirm(null); await supabase.from('home_videos').delete().eq('id', id); setHomeVideos((s) => s.filter((x) => x.id !== id)); toast('success', 'Video deleted'); } }),
      add: async () => {
        const newOrder = homeVideos.length ? homeVideos[homeVideos.length - 1].display_order + 10 : 10;
        const { error } = await supabase.from('home_videos').insert([{ video_url: 'a', display_order: newOrder }]);
        if (!error) fetchInitialData();
      },
    },
  };

  /* ---------- Orders ---------- */
  const handleToggleOrderStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (!error) setOrders((o) => o.map((x) => (x.id === id ? { ...x, status: newStatus } : x)));
  };

  const handleDeleteOrder = (id) => {
    setConfirm({
      title: 'Delete order?',
      message: 'This order will be permanently removed from the dashboard.',
      onConfirm: async () => {
        setConfirm(null);
        const { error } = await supabase.from('orders').delete().eq('id', id);
        if (!error) { setOrders((o) => o.filter((x) => x.id !== id)); toast('success', 'Order deleted'); }
      },
    });
  };

  const handleShareToRider = (order) => {
    const mapsLink = order.latitude && order.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.city || 'Rawalpindi')}`;
    const itemsText = order.items?.map((i) => `▫️ ${i.title} (${i.size || 'Std'}) x ${i.quantity}`).join('\n') || '';
    const message =
      `🛵 *NEW ORDER FOR DELIVERY*\n\n` +
      `👤 *Customer:* ${order.customer_name}\n` +
      `📞 *Phone:* ${order.phone}\n` +
      `📍 *Address:* ${order.address} (${order.city})${order.apartment ? ` | Apt: ${order.apartment}` : ''}\n` +
      (order.detected_address ? `🛰️ *GPS:* ${order.detected_address}\n` : '') +
      `🗺️ *Maps:* ${mapsLink}\n\n` +
      `🍔 *Items:*\n${itemsText}\n\n` +
      `💰 *Total:* Rs. ${order.total_amount}\n` +
      `💳 *Payment:* ${order.payment_method}\n` +
      `🚚 *Type:* ${order.delivery_type}` +
      (order.special_instructions ? `\n📝 *Notes:* ${order.special_instructions}` : '');
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  /* ---------- Derived ---------- */
  const pendingCount = useMemo(() => orders.filter((o) => o.status !== 'Completed').length, [orders]);
  const orderStats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status !== 'Completed').length;
    const completed = total - pending;
    const revenue = orders.filter((o) => o.status === 'Completed').reduce((s, o) => s + (parseFloat(o.total_amount) || 0), 0);
    return { total, pending, completed, revenue };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let list = orders;
    if (orderFilter === 'pending') list = list.filter((o) => o.status !== 'Completed');
    if (orderFilter === 'completed') list = list.filter((o) => o.status === 'Completed');
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      list = list.filter((o) =>
        o.customer_name?.toLowerCase().includes(q) ||
        o.phone?.toLowerCase().includes(q) ||
        o.id?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, orderFilter, orderSearch]);

  const hiddenNowCount = useMemo(() => {
    let n = 0;
    (categories || []).forEach((c) => { if (getVisibilityInfo(c, visSettings, nowDate).hiddenNow) n++; });
    (menuItems || []).forEach((i) => { if (getVisibilityInfo(i, visSettings, nowDate).hiddenNow) n++; });
    return n;
  }, [categories, menuItems, visSettings, nowDate]);

  const tabs = [
    { id: 'menu', label: 'Menu', icon: icons.menu },
    { id: 'home', label: 'Home Page', icon: icons.home },
    { id: 'settings', label: 'Settings', icon: icons.settings },
    { id: 'orders', label: 'Live Orders', icon: icons.orders, badge: pendingCount },
    { id: 'hidden', label: 'Hidden Items', icon: icons.eyeOff, badge: hiddenNowCount },
    { id: 'pages', label: 'Pages', icon: icons.pages },
  ];

  return (
    <div className="min-h-screen bg-[#08090d] text-white relative">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-amber-500/8 rounded-full blur-[140px]" />
      </div>

      <Toast toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel || 'Delete'}
        onConfirm={confirm?.onConfirm}
        onCancel={() => setConfirm(null)}
        danger={confirm?.danger !== false}
      />

      <HideOptionsModal
        open={!!hideModal}
        kind={hideModal?.kind}
        row={hideModal?.row}
        itemCount={hideModal?.kind === 'category' ? menuItems.filter((i) => i.category_id === hideModal.row.id).length : 0}
        settings={visSettings}
        initialMode={hideModal?.mode || 'hide'}
        onClose={() => setHideModal(null)}
        onApply={async (payload) => {
          const ok = await saveVisibility(hideModal.kind, hideModal.row, payload, payload.is_hidden ? 'Hidden' : 'Schedule saved');
          if (ok) setHideModal(null);
        }}
        onClearSchedule={async () => {
          const ok = await saveVisibility(hideModal.kind, hideModal.row, CLEAR_SCHEDULE_PAYLOAD, 'Schedule removed');
          if (ok) setHideModal(null);
        }}
      />

      <header className="sticky top-0 z-[100] bg-[#08090d]/90 backdrop-blur-2xl border-b border-slate-800/60 shadow-lg shadow-black/30">
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-950/60 border border-orange-400/20">
                <Icon path={icons.sparkles} className="w-5 h-5 text-white" stroke={2.5} />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black tracking-tight leading-none">Restaurant Admin</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Control Center</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${
                storeSettings.is_open
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${storeSettings.is_open ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                {storeSettings.is_open ? 'Open' : 'Closed'}
              </div>
              <Btn variant="ghost" size="sm" onClick={() => window.location.reload()}>
                <Icon path={icons.refresh} className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reload</span>
              </Btn>
              <Btn variant="primary" size="sm" onClick={handleSaveAll} disabled={savingAll}>
                <Icon path={icons.save} className="w-3.5 h-3.5" />
                <span>{savingAll ? 'Saving...' : 'Save All'}</span>
              </Btn>
            </div>
          </div>

          <nav className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === t.id
                    ? 'bg-gradient-to-br from-orange-500/20 to-orange-600/10 text-orange-300 border border-orange-500/30 shadow-lg shadow-orange-950/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon path={t.icon} className="w-4 h-4" />
                <span>{t.label}</span>
                {t.badge > 0 && (
                  <span className="ml-0.5 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="relative max-w-[90rem] mx-auto px-4 sm:px-6 py-6 pb-32">
        {/* ================= TAB: MENU ================= */}
        {activeTab === 'menu' && (
          <div className="space-y-8">
            <Panel padded={false} className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                    <Icon path={icons.sparkles} className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white">Interactive Menu Layout</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Hover on cards to reveal <span className="text-orange-400 font-bold">+</span> buttons — insert items anywhere smoothly.
                    </p>
                  </div>
                </div>
                <StatChip label="Categories" value={categories.length} tone="orange" />
              </div>
            </Panel>

            {categories.map((cat, catIdx) => {
              const categoryItems = menuItems.filter((i) => i.category_id === cat.id);
              const currentCatOrder = cat.display_order || catIdx * 10;
              const previewSlug = makeUniqueSlug(
                cat.name,
                categories.filter((c) => c.id !== cat.id).map((c) => c.slug || '')
              );
              const catInfo = getVisibilityInfo(cat, visSettings, nowDate);
              return (
                <div key={cat.id} className={`space-y-5 transition-opacity ${catInfo.hiddenNow ? 'opacity-50' : ''}`}>
                  <div className="relative flex items-center justify-center my-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800/70" /></div>
                    <button
                      type="button"
                      onClick={() => handleInsertCategoryBetween(currentCatOrder - 5)}
                      className="relative z-10 w-8 h-8 bg-slate-900 hover:bg-orange-500 text-orange-400 hover:text-white rounded-full border border-slate-800 hover:border-orange-400/50 flex items-center justify-center font-black shadow-lg transition-all cursor-pointer hover:scale-110"
                      title="Insert new category here"
                    >
                      <Icon path={icons.plus} className="w-4 h-4" stroke={3} />
                    </button>
                  </div>

                  <Panel className="!p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="px-2.5 py-1 rounded-lg bg-orange-500/15 border border-orange-500/25 text-orange-300 text-[10px] font-black uppercase tracking-widest shrink-0">
                          #{catIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={cat.name}
                          onChange={(e) => handleCategoryChange(cat.id, 'name', e.target.value)}
                          className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-white font-black uppercase text-sm outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 transition-all"
                        />
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Btn variant="primary" size="sm" onClick={() => handleSaveCategory(cat)} disabled={loading}>
                          <Icon path={icons.save} className="w-3.5 h-3.5" />
                          Save
                        </Btn>
                        <Btn variant={catInfo.manualHidden ? 'ghost' : 'subtle'} size="sm" onClick={() => requestHideToggle('category', cat)}>
                          <Icon path={catInfo.manualHidden ? icons.eye : icons.eyeOff} className="w-3.5 h-3.5" />
                          {catInfo.manualHidden ? 'Unhide' : 'Hide'}
                        </Btn>
                        <Btn variant="subtle" size="sm" onClick={() => requestSchedule('category', cat)} title="Schedule">
                          <Icon path={icons.clock} className="w-3.5 h-3.5" />
                        </Btn>
                        <Btn variant="danger" size="sm" onClick={() => handleDeleteCategory(cat.id)}>
                          <Icon path={icons.trash} className="w-3.5 h-3.5" />
                        </Btn>
                      </div>
                    </div>

                    {catInfo.short && (
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          catInfo.hiddenNow
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/25'
                            : 'bg-sky-500/15 text-sky-300 border-sky-500/25'
                        }`}>
                          {catInfo.short}
                        </span>
                        {catInfo.lines[0] && (
                          <span className="text-[10px] text-slate-500">{catInfo.lines[0]}</span>
                        )}
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-slate-800/70 flex flex-col sm:flex-row items-start gap-4">
                      <div className="shrink-0">
                        {cat.home_image ? (
                          <img
                            src={getImagePath(cat.home_image)}
                            alt=""
                            className="w-14 h-14 rounded-full object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 grid place-items-center text-orange-300 font-black text-lg">
                            {(cat.name || '?').trim().charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                        <Input
                          label="Home Image No / URL"
                          value={cat.home_image || ''}
                          onChange={(e) => handleCategoryChange(cat.id, 'home_image', e.target.value)}
                          placeholder="e.g. 8 (optional)"
                        />
                        <ImageUploadField
                          label="Or upload"
                          onUploaded={(url) => handleCategoryChange(cat.id, 'home_image', url)}
                        />
                      </div>

                      <div className="shrink-0 flex flex-col items-start gap-2 sm:items-end">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Show on home page
                          <Toggle
                            tone="orange"
                            checked={cat.show_on_home !== false}
                            onChange={(e) => handleCategoryChange(cat.id, 'show_on_home', e.target.checked)}
                          />
                        </label>
                        <p className="text-[10px] text-slate-500">
                          Link:{' '}
                          <span className="text-orange-400 font-mono">/menu#{previewSlug}</span>
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-[10px] text-slate-500">
                      Leave image empty to show a plain tile. This category appears on the home page automatically in the same order.
                    </p>
                  </Panel>

                  {categoryItems.length === 0 ? (
                    <EmptyState icon={icons.info} title="No items yet" hint={`Add your first card to "${cat.name}" using the button below.`} />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {categoryItems.map((item, index) => {
                        const isSizeWise = item.pricing_options && item.pricing_options.length > 0;
                        const currentOrder = item.display_order || index * 10;
                        const itemInfo = getVisibilityInfo(item, visSettings, nowDate);
                        return (
                          <div key={item.id} className={`relative group/card ${itemInfo.hiddenNow ? 'opacity-50' : ''}`}>
                            <button
                              type="button"
                              onClick={() => handleInsertItemBetween(cat.id, currentOrder - 5)}
                              className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 bg-orange-600 hover:bg-orange-500 text-white rounded-full flex items-center justify-center font-black shadow-lg shadow-orange-950/50 opacity-0 group-hover/card:opacity-100 transition-all cursor-pointer hover:scale-110 border border-orange-400/30"
                              title="Insert before"
                            >
                              <Icon path={icons.plus} className="w-3.5 h-3.5" stroke={3} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInsertItemBetween(cat.id, currentOrder)}
                              className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 bg-orange-600 hover:bg-orange-500 text-white rounded-full flex items-center justify-center font-black shadow-lg shadow-orange-950/50 opacity-0 group-hover/card:opacity-100 transition-all cursor-pointer hover:scale-110 border border-orange-400/30"
                              title="Insert after"
                            >
                              <Icon path={icons.plus} className="w-3.5 h-3.5" stroke={3} />
                            </button>

                            <div className="h-full bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-800/80 p-4 flex flex-col gap-3 transition-all hover:border-orange-500/30 hover:shadow-2xl hover:shadow-orange-950/20">
                              <div className="flex items-center justify-between border-b border-slate-800/70 pb-2.5 gap-2">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 shrink-0">
                                    Card #{index + 1}
                                  </span>
                                  {itemInfo.short && (
                                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border shrink-0 ${
                                      itemInfo.hiddenNow
                                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/25'
                                        : 'bg-sky-500/15 text-sky-300 border-sky-500/25'
                                    }`}>
                                      {itemInfo.short}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <IconBtn icon={itemInfo.manualHidden ? icons.eye : icons.eyeOff} onClick={() => requestHideToggle('item', item)} title={itemInfo.manualHidden ? 'Unhide' : 'Hide'} tone={itemInfo.manualHidden ? 'warn' : 'neutral'} size="sm" />
                                  <IconBtn icon={icons.clock} onClick={() => requestSchedule('item', item)} title="Schedule" tone="sky" size="sm" />
                                  <IconBtn icon={icons.trash} onClick={() => handleDeleteItem(item.id)} title="Delete" tone="danger" size="sm" />
                                </div>
                              </div>

                              <div className="space-y-3 grow">
                                <Input label="Title" value={item.title || ''} onChange={(e) => handleItemChange(item.id, 'title', e.target.value)} placeholder="Item name" />
                                <div className="grid grid-cols-2 gap-2">
                                  <Input label="Image No" type="number" value={item.image_num ?? ''} onChange={(e) => handleItemChange(item.id, 'image_num', e.target.value)} placeholder="e.g. 19" />
                                  <div className="space-y-1.5">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">Pricing</label>
                                    <select
                                      value={isSizeWise ? 'size' : 'fix'}
                                      onChange={(e) => handlePricingTypeChange(item.id, e.target.value)}
                                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-sm font-bold outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 cursor-pointer transition-all"
                                    >
                                      <option value="fix">Fix Price</option>
                                      <option value="size">Size Wise</option>
                                    </select>
                                  </div>
                                </div>

                                <ImageUploadField onUploaded={(url) => handleItemChange(item.id, 'image_num', url)} label="Or upload new image" />

                                <Textarea label="Description" rows={2} value={item.description || ''} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} placeholder="Short description..." />

                                {!isSizeWise ? (
                                  <Input label="Price (Rs.)" accent type="number" value={item.price || ''} onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} placeholder="0" />
                                ) : (
                                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Sizes & Prices</span>
                                      <button type="button" onClick={() => addSizeOption(item.id)} className="px-2 py-1 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-black rounded-lg uppercase cursor-pointer transition-colors">
                                        + Add
                                      </button>
                                    </div>
                                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                                      {item.pricing_options?.map((opt, optIdx) => (
                                        <div key={optIdx} className="flex items-center gap-1.5">
                                          <input type="text" placeholder="Size" value={opt.size} onChange={(e) => handleSizeOptionChange(item.id, optIdx, 'size', e.target.value)} className="flex-1 min-w-0 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-orange-500/60" />
                                          <input type="number" placeholder="Rs." value={opt.price} onChange={(e) => handleSizeOptionChange(item.id, optIdx, 'price', e.target.value)} className="flex-1 min-w-0 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-orange-500/60" />
                                          {item.pricing_options.length > 1 && (
                                            <button type="button" onClick={() => removeSizeOption(item.id, optIdx)} className="w-6 h-6 rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer shrink-0">
                                              <Icon path={icons.x} className="w-3.5 h-3.5" />
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <Btn variant="primary" size="md" className="w-full" onClick={() => handleSaveItem(item)} disabled={loading}>
                                <Icon path={icons.save} className="w-3.5 h-3.5" />
                                {loading ? 'Saving...' : 'Save Changes'}
                              </Btn>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex justify-center pt-1">
                    <Btn variant="ghost" size="md" onClick={() => handleInsertItemBetween(cat.id, categoryItems.length > 0 ? categoryItems[categoryItems.length - 1].display_order || 0 : 0)}>
                      <Icon path={icons.plus} className="w-3.5 h-3.5" />
                      Add Card in {cat.name}
                    </Btn>
                  </div>
                </div>
              );
            })}

            <div className="relative flex items-center justify-center my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800/70" /></div>
              <button
                type="button"
                onClick={() => handleInsertCategoryBetween(categories.length > 0 ? categories[categories.length - 1].display_order || 0 : 0)}
                className="relative z-10 px-5 py-2.5 bg-slate-900 hover:bg-orange-600 text-orange-400 hover:text-white rounded-full border border-slate-800 hover:border-orange-400/40 flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg hover:scale-105"
              >
                <Icon path={icons.plus} className="w-4 h-4" stroke={3} />
                Add New Category
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB: HOME ================= */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            <Panel>
              <SectionHeader
                icon={icons.image}
                title="Home Page Sliders"
                subtitle="Enter image number (e.g. 1, 2, 3) or upload a new image."
                action={<Btn variant="primary" size="sm" onClick={homeHandlers.sliders.add}><Icon path={icons.plus} className="w-3.5 h-3.5" />Add Slide</Btn>}
              />
              {homeSliders.length === 0 ? (
                <EmptyState icon={icons.image} title="No sliders yet" hint="Click Add Slide to get started." />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {homeSliders.map((slider, idx) => (
                    <MediaCard
                      key={slider.id}
                      index={idx + 1}
                      label="Slide"
                      isHidden={slider.is_hidden}
                      onToggleHidden={() => handleToggleSliderHidden(slider)}
                      onDelete={() => homeHandlers.sliders.del(slider.id)}
                      preview={<img src={getImagePath(slider.img)} alt="" className="w-full h-full object-cover" />}
                    >
                      <Input label="Image No" value={slider.img} onChange={(e) => homeHandlers.sliders.change(slider.id, 'img', e.target.value)} placeholder="e.g. 1" />
                      <ImageUploadField onUploaded={(url) => homeHandlers.sliders.change(slider.id, 'img', url)} label="Or upload" />
                      <LinkPicker
                        value={slider.link || ''}
                        categories={categories}
                        onChange={(v) => homeHandlers.sliders.change(slider.id, 'link', v)}
                      />
                      <Btn variant="primary" size="md" className="w-full" onClick={() => homeHandlers.sliders.save(slider)} disabled={loading}>
                        <Icon path={icons.save} className="w-3.5 h-3.5" />
                        Save Slide
                      </Btn>
                    </MediaCard>
                  ))}
                </div>
              )}
            </Panel>

            <Panel>
              <SectionHeader
                icon={icons.sparkles}
                title="Home Page Promos"
                subtitle="Enter image number (e.g. 5, 6, 7). Badge is optional."
                action={<Btn variant="primary" size="sm" onClick={homeHandlers.promos.add}><Icon path={icons.plus} className="w-3.5 h-3.5" />Add Promo</Btn>}
              />
              {homePromos.length === 0 ? (
                <EmptyState icon={icons.sparkles} title="No promos yet" hint="Add a promo card to highlight deals." />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {homePromos.map((promo, idx) => (
                    <MediaCard
                      key={promo.id}
                      index={idx + 1}
                      label="Promo"
                      isHidden={promo.is_hidden}
                      onToggleHidden={() => handleTogglePromoHidden(promo)}
                      onDelete={() => homeHandlers.promos.del(promo.id)}
                      preview={<img src={getImagePath(promo.img)} alt="" className="w-full h-full object-cover" />}
                    >
                      <Input label="Image No" value={promo.img} onChange={(e) => homeHandlers.promos.change(promo.id, 'img', e.target.value)} placeholder="e.g. 5" />
                      <ImageUploadField onUploaded={(url) => homeHandlers.promos.change(promo.id, 'img', url)} label="Or upload" />
                      <LinkPicker
                        value={promo.link || ''}
                        categories={categories}
                        onChange={(v) => homeHandlers.promos.change(promo.id, 'link', v)}
                      />
                      <Input label="Badge (optional)" value={promo.badge || ''} onChange={(e) => homeHandlers.promos.change(promo.id, 'badge', e.target.value)} placeholder="e.g. Most Popular" />
                      <Btn variant="primary" size="md" className="w-full" onClick={() => homeHandlers.promos.save(promo)} disabled={loading}>
                        <Icon path={icons.save} className="w-3.5 h-3.5" />
                        Save Promo
                      </Btn>
                    </MediaCard>
                  ))}
                </div>
              )}
            </Panel>

            <Panel>
              <SectionHeader
                icon={icons.image}
                title="Home Category Tiles"
                subtitle="These tiles are created automatically from your Menu categories, in the same order. Add or change tile images here."
              />
              {categories.length === 0 ? (
                <EmptyState icon={icons.image} title="No categories yet" hint="Add categories in the Menu tab first." />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {categories.map((cat, idx) => (
                    <MediaCard
                      key={cat.id}
                      index={idx + 1}
                      label="Tile"
                      isHidden={cat.show_on_home === false}
                      onToggleHidden={() => handleToggleShowOnHome(cat)}
                      onDelete={() => toast('info', 'Managed from Menu tab', 'Categories are added/removed from the Menu tab.')}
                      preview={
                        cat.home_image ? (
                          <img src={getImagePath(cat.home_image)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full grid place-items-center bg-slate-900 text-orange-300 font-black text-2xl">
                            {(cat.name || '?').trim().charAt(0).toUpperCase()}
                          </div>
                        )
                      }
                    >
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Name (read-only)</p>
                        <p className="text-sm font-black text-white">{cat.name}</p>
                      </div>
                      <Input
                        label="Home Image No / URL"
                        value={cat.home_image || ''}
                        onChange={(e) => handleCategoryChange(cat.id, 'home_image', e.target.value)}
                        placeholder="e.g. 8 (optional)"
                      />
                      <ImageUploadField
                        label="Or upload"
                        onUploaded={(url) => handleCategoryChange(cat.id, 'home_image', url)}
                      />
                      <Btn variant="primary" size="md" className="w-full" onClick={() => handleSaveCategory(cat)} disabled={loading}>
                        <Icon path={icons.save} className="w-3.5 h-3.5" />
                        Save Tile
                      </Btn>
                    </MediaCard>
                  ))}
                </div>
              )}
              <p className="mt-4 text-[11px] text-slate-500">
                Renaming, reordering and adding categories is done from the Menu tab.
              </p>
            </Panel>

            <OfferManager categories={categories} ImageUploadField={ImageUploadField} />

            <Panel>
              <SectionHeader
                icon={icons.video}
                title="Home Page Videos"
                subtitle="Enter video name only (e.g. a, b, c) — .webm is added automatically."
                action={<Btn variant="primary" size="sm" onClick={homeHandlers.videos.add}><Icon path={icons.plus} className="w-3.5 h-3.5" />Add Video</Btn>}
              />
              {homeVideos.length === 0 ? (
                <EmptyState icon={icons.video} title="No videos yet" hint="Add a promotional video." />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {homeVideos.map((vid, idx) => (
                    <MediaCard
                      key={vid.id}
                      index={idx + 1}
                      label="Video"
                      isHidden={vid.is_hidden}
                      onToggleHidden={() => handleToggleVideoHidden(vid)}
                      onDelete={() => homeHandlers.videos.del(vid.id)}
                      preview={
                        getVideoPath(vid.video_url) ? (
                          <video src={getVideoPath(vid.video_url)} className="w-full h-full object-cover" muted />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500 font-black uppercase tracking-widest">No preview</div>
                        )
                      }
                    >
                      <Input label="Video Name" value={vid.video_url} onChange={(e) => homeHandlers.videos.change(vid.id, 'video_url', e.target.value)} placeholder="e.g. a" />
                      <VideoUploadField onUploaded={(url) => homeHandlers.videos.change(vid.id, 'video_url', url)} label="Or upload" />
                      <Btn variant="primary" size="md" className="w-full" onClick={() => homeHandlers.videos.save(vid)} disabled={loading}>
                        <Icon path={icons.save} className="w-3.5 h-3.5" />
                        Save Video
                      </Btn>
                    </MediaCard>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        )}

        {/* ================= TAB: SETTINGS ================= */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <Panel>
              <SectionHeader icon={icons.store} title="Store Status & Operating Hours" subtitle="Control whether your store accepts orders right now." />
              <form onSubmit={handleSaveStoreSettings} className="space-y-5">
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${storeSettings.is_open ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
                      <Icon path={icons.clock} className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm uppercase text-white">Store is {storeSettings.is_open ? 'Open' : 'Closed'}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Toggle off to instantly close ordering on your website.</p>
                    </div>
                  </div>
                  <Toggle checked={storeSettings.is_open} onChange={(e) => setStoreSettings({ ...storeSettings, is_open: e.target.checked })} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Opening Time" type="time" value={storeSettings.opening_time} onChange={(e) => setStoreSettings({ ...storeSettings, opening_time: e.target.value })} />
                  <Input label="Closing Time" type="time" value={storeSettings.closing_time} onChange={(e) => setStoreSettings({ ...storeSettings, closing_time: e.target.value })} />
                </div>

                <Btn variant="primary" size="lg" className="w-full" type="submit" disabled={loading}>
                  <Icon path={icons.save} className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Store Settings'}
                </Btn>
              </form>
            </Panel>

            <Panel>
              <SectionHeader icon={icons.megaphone} title="Website Announcement Bar" subtitle="Show a scrolling message at the top of your website. Optionally link it to a menu section." />
              <div className="space-y-4">
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${storeSettings.is_announcement_active ? 'bg-orange-500/15 text-orange-400' : 'bg-slate-800 text-slate-500'}`}>
                      <Icon path={icons.megaphone} className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm uppercase text-white">Announcement Bar</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Show or hide the top banner bar.</p>
                    </div>
                  </div>
                  <Toggle tone="orange" checked={storeSettings.is_announcement_active} onChange={(e) => setStoreSettings({ ...storeSettings, is_announcement_active: e.target.checked })} />
                </div>

                <Textarea label="Announcement Message" rows={3} value={storeSettings.announcement_text} onChange={(e) => setStoreSettings({ ...storeSettings, announcement_text: e.target.value })} placeholder="🎉 Special Offer! Get 20% OFF on all deals tonight. Use code: SPECIAL20" />

                <LinkPicker
                  label="Link to menu section (optional)"
                  value={storeSettings.announcement_link || ''}
                  categories={categories}
                  onChange={(v) => setStoreSettings({ ...storeSettings, announcement_link: v })}
                  placeholder="/menu or /menu#burgers (leave empty to disable click)"
                />

                <Btn variant="primary" size="lg" className="w-full" onClick={handleSaveStoreSettings} disabled={loading}>
                  <Icon path={icons.save} className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Announcement'}
                </Btn>
              </div>
            </Panel>

            <Panel>
              <SectionHeader icon={icons.bell} title="Push Notifications" subtitle="Get real-time alerts on your phone whenever a new order arrives." />
              <Btn variant="success" size="lg" className="w-full" onClick={handleEnableNotifications} disabled={notificationLoading}>
                <Icon path={icons.bell} className="w-4 h-4" />
                {notificationLoading ? 'Enabling...' : 'Enable Mobile Notifications'}
              </Btn>
            </Panel>
          </div>
        )}

        {/* ================= TAB: ORDERS ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatBox label="Total" value={orderStats.total} tone="slate" />
              <StatBox label="Pending" value={orderStats.pending} tone="orange" />
              <StatBox label="Completed" value={orderStats.completed} tone="emerald" />
              <StatBox label="Revenue" value={`Rs. ${orderStats.revenue.toLocaleString()}`} tone="rose" />
            </div>

            <Panel className="!p-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Icon path={icons.search} className="w-4 h-4" /></div>
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by name, phone or order ID..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-sm outline-none focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-slate-600"
                  />
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {[{ id: 'all', label: 'All' }, { id: 'pending', label: 'Pending' }, { id: 'completed', label: 'Completed' }].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setOrderFilter(f.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        orderFilter === f.id
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

            {filteredOrders.length === 0 ? (
              <EmptyState
                icon={icons.orders}
                title={orders.length === 0 ? 'No orders yet' : 'No matching orders'}
                hint={orders.length === 0 ? 'New customer orders will appear here in real time.' : 'Try changing filters or search.'}
              />
            ) : (
              <div className="space-y-5">
                {filteredOrders.map((order) => (
                  <OrderCard key={order.id} order={order} onToggleStatus={handleToggleOrderStatus} onDelete={handleDeleteOrder} onShare={handleShareToRider} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB: HIDDEN ITEMS ================= */}
        {activeTab === 'hidden' && (
          <HiddenItemsTab
            categories={categories}
            menuItems={menuItems}
            settings={visSettings}
            now={nowDate}
            onUnhide={(kind, row) => saveVisibility(kind, row, UNHIDE_PAYLOAD, 'Now visible')}
            onEdit={(kind, row) => setHideModal({ kind, row, mode: 'schedule' })}
            onClearSchedule={(kind, row) => saveVisibility(kind, row, CLEAR_SCHEDULE_PAYLOAD, 'Schedule removed')}
          />
        )}

        {/* ================= TAB: PAGES ================= */}
        {activeTab === 'pages' && <PageEditor />}
      </main>
    </div>
  );
}

/* ============================================================
   SUB-COMPONENTS
   ============================================================ */
function MediaCard({ index, label, isHidden, onToggleHidden, onDelete, preview, children, hideDelete = false }) {
  return (
    <div className={`bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80 space-y-3 transition-all hover:border-slate-700 ${isHidden ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">{label} #{index}</span>
        <div className="flex items-center gap-0.5">
          <IconBtn icon={isHidden ? icons.eye : icons.eyeOff} onClick={onToggleHidden} title={isHidden ? 'Unhide' : 'Hide'} tone={isHidden ? 'warn' : 'neutral'} size="sm" />
          {!hideDelete && <IconBtn icon={icons.trash} onClick={onDelete} title="Delete" tone="danger" size="sm" />}
        </div>
      </div>
      <div className="h-32 bg-slate-900 rounded-xl overflow-hidden border border-slate-800">{preview}</div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function StatBox({ label, value, tone }) {
  const tones = {
    slate: 'from-slate-800/70 to-slate-900/70 border-slate-700/70 text-slate-100',
    orange: 'from-orange-500/15 to-orange-600/10 border-orange-500/25 text-orange-200',
    emerald: 'from-emerald-500/15 to-emerald-600/10 border-emerald-500/25 text-emerald-200',
    rose: 'from-rose-500/15 to-rose-600/10 border-rose-500/25 text-rose-200',
  };
  return (
    <div className={`bg-gradient-to-br ${tones[tone]} rounded-2xl border p-4`}>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</p>
      <p className="text-xl sm:text-2xl font-black mt-1 leading-tight truncate">{value}</p>
    </div>
  );
}

function OrderCard({ order, onToggleStatus, onDelete, onShare }) {
  const isCompleted = order.status === 'Completed';
  return (
    <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl border border-slate-800/80 overflow-hidden transition-all hover:border-slate-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 sm:p-5 border-b border-slate-800/70 bg-slate-950/40">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-black text-orange-400">#{order.id.slice(0, 6).toUpperCase()}</span>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
            isCompleted
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
              : 'bg-amber-500/15 text-amber-400 border border-amber-500/25 animate-pulse'
          }`}>
            {order.status || 'Pending'}
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-bold">{new Date(order.created_at).toLocaleString()}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 sm:p-5">
        <div className="space-y-2">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-2">Customer</h4>
          <p className="text-sm font-black text-white">{order.customer_name}</p>
          <a href={`https://wa.me/${order.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline font-mono">
            <Icon path={icons.whatsapp} className="w-3.5 h-3.5" />
            {order.phone}
          </a>
          <p className="text-xs text-slate-300 leading-relaxed">
            <span className="text-slate-500 font-bold">Address: </span>
            {order.address} ({order.city}){order.apartment ? ` · Apt: ${order.apartment}` : ''}
          </p>
          {order.detected_address && (
            <div className="text-[11px] text-emerald-300 bg-emerald-500/8 p-2 rounded-lg border border-emerald-500/20">
              <span className="font-black text-emerald-400">GPS: </span>{order.detected_address}
            </div>
          )}
          {order.special_instructions && (
            <div className="text-[11px] text-orange-200 bg-orange-500/8 p-2 rounded-lg border border-orange-500/20">
              <span className="font-black text-orange-400">Notes: </span>{order.special_instructions}
            </div>
          )}
          <p className="text-xs text-slate-400 pt-1"><span className="font-bold text-slate-500">Payment: </span>{order.payment_method}</p>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-400">Location</h4>
          {order.latitude && order.longitude ? (
            <div className="w-full h-40 rounded-xl overflow-hidden border border-slate-800 relative">
              <iframe
                title="Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${order.longitude - 0.005},${order.latitude - 0.005},${order.longitude + 0.005},${order.latitude + 0.005}&layer=mapnik&marker=${order.latitude},${order.longitude}`}
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className="w-full h-40 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col items-center justify-center gap-2 text-slate-500">
              <Icon path={icons.map} className="w-6 h-6" />
              <span className="text-[10px] font-black uppercase tracking-widest">No GPS</span>
            </div>
          )}
          <Btn variant="success" size="md" className="w-full" onClick={() => onShare(order)}>
            <Icon path={icons.whatsapp} className="w-4 h-4" />
            Share to Rider
          </Btn>
        </div>

        <div className="space-y-2">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-2">Items</h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-800/60 pb-1.5">
                <div className="min-w-0">
                  <span className="font-black text-white uppercase block truncate">{item.title}</span>
                  <span className="text-slate-500 block text-[10px]">{item.size} · Qty {item.quantity}</span>
                </div>
                <span className="font-black text-orange-400 shrink-0 ml-2">Rs. {item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="pt-2 mt-1 border-t border-slate-800 space-y-1 text-[11px]">
            {order.subtotal != null && <div className="flex justify-between text-slate-400"><span>Subtotal</span><span className="font-bold">Rs. {order.subtotal}</span></div>}
            {order.tax_amount != null && <div className="flex justify-between text-slate-400"><span>GST/Tax</span><span className="font-bold">Rs. {order.tax_amount}</span></div>}
            {order.delivery_charges != null && (
              <div className="flex justify-between text-slate-400">
                <span>Delivery {order.delivery_distance != null && <span className="text-orange-400/70">({order.delivery_distance} km)</span>}</span>
                <span className="font-bold">Rs. {order.delivery_charges}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-t border-slate-800/70 bg-slate-950/40">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total</span>
          <p className="text-2xl font-black text-orange-400 leading-tight">Rs. {order.total_amount}</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Btn variant={isCompleted ? 'ghost' : 'success'} size="md" className="flex-1 sm:flex-none" onClick={() => onToggleStatus(order.id, order.status)}>
            <Icon path={icons.check} className="w-4 h-4" />
            {isCompleted ? 'Mark Pending' : 'Mark Completed'}
          </Btn>
          <Btn variant="danger" size="md" onClick={() => onDelete(order.id)}>
            <Icon path={icons.trash} className="w-4 h-4" />
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   EXPORT
   ============================================================ */
export default function AdminDashboard() {
  return (
    <AdminAuthGate>
      <AdminDashboardContent />
    </AdminAuthGate>
  );
}