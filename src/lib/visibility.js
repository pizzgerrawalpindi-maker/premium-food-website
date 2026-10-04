// src/lib/visibility.js
// Pure helper functions. NO 'use client', NO server-only imports. Used by server pages and admin.

const PKT_OFFSET_MS = 5 * 60 * 60 * 1000; // Asia/Karachi = UTC+5, no DST
const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Shift the timestamp so that the UTC getters return Pakistan wall-clock values.
const toPkt = (date) => new Date(date.getTime() + PKT_OFFSET_MS);

export const parseHHMM = (v, fallback = null) => {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(v || ''));
  if (!m) return fallback;
  return Math.min(23, parseInt(m[1], 10)) * 60 + Math.min(59, parseInt(m[2], 10));
};

export const minutesOfDayPkt = (date) => {
  const p = toPkt(date);
  return p.getUTCHours() * 60 + p.getUTCMinutes();
};

export const dayOfWeekPkt = (date) => toPkt(date).getUTCDay(); // 0 = Sunday

// First moment strictly AFTER `from` when the Pakistan clock shows `minuteOfDay`.
export const nextOccurrenceAfter = (from, minuteOfDay) => {
  const p = toPkt(from);
  const pktMidnightFake = Date.UTC(p.getUTCFullYear(), p.getUTCMonth(), p.getUTCDate());
  let candidate = pktMidnightFake + minuteOfDay * 60000 - PKT_OFFSET_MS;
  if (candidate <= from.getTime()) candidate += DAY_MS;
  return new Date(candidate);
};

export const parseDays = (s) => {
  const t = String(s || '').trim();
  if (!t) return null; // null = every day
  const set = new Set(
    t.split(',').map((x) => parseInt(x, 10)).filter((n) => Number.isInteger(n) && n >= 0 && n <= 6)
  );
  return set.size === 0 || set.size === 7 ? null : set;
};

/* ---------- 1) manual hide (is_hidden + hide_mode) ---------- */
export const isManuallyHidden = (row, settings, now = new Date()) => {
  if (!row || !row.is_hidden) return false;
  const mode = row.hide_mode || 'manual';
  if (mode === 'until_time') {
    if (!row.hidden_until) return true;
    return now.getTime() < new Date(row.hidden_until).getTime();
  }
  if (mode === 'until_open') {
    const openMin = parseHHMM(settings?.opening_time, null);
    if (openMin == null || !row.hidden_at) return true; // cannot calculate -> stay hidden (safe)
    return now.getTime() < nextOccurrenceAfter(new Date(row.hidden_at), openMin).getTime();
  }
  return true; // 'manual'
};

/* ---------- 2) repeating daily schedule ---------- */
export const resolveWindow = (row, settings) => {
  const startMin = row?.schedule_start === 'CLOSE'
    ? parseHHMM(settings?.closing_time, null)
    : parseHHMM(row?.schedule_start, null);
  const endMin = row?.schedule_end === 'OPEN'
    ? parseHHMM(settings?.opening_time, null)
    : parseHHMM(row?.schedule_end, null);
  if (startMin == null || endMin == null) return null;
  return { startMin, endMin };
};

// true / false, or null when the schedule is broken (then it never hides anything).
export const isInsideScheduleWindow = (row, settings, now = new Date()) => {
  const w = resolveWindow(row, settings);
  if (!w) return null;
  const days = parseDays(row.schedule_days);
  const nowMin = minutesOfDayPkt(now);
  const today = dayOfWeekPkt(now);
  const yesterday = (today + 6) % 7;
  const dayOk = (d) => !days || days.has(d);
  const { startMin, endMin } = w;
  if (startMin === endMin) return dayOk(today); // whole day
  if (startMin < endMin) return dayOk(today) && nowMin >= startMin && nowMin < endMin;
  // overnight window (e.g. 22:00 -> 15:00): belongs to the day it STARTS on
  return (dayOk(today) && nowMin >= startMin) || (dayOk(yesterday) && nowMin < endMin);
};

export const isScheduleBlocking = (row, settings, now = new Date()) => {
  if (!row?.schedule_enabled) return false;
  const inside = isInsideScheduleWindow(row, settings, now);
  if (inside === null) return false;
  return row.schedule_type === 'show_only' ? !inside : inside;
};

/* ---------- 3) date range ---------- */
export const isOutsideDateRange = (row, now = new Date()) => {
  const t = now.getTime();
  if (row?.available_from && t < new Date(row.available_from).getTime()) return true;
  if (row?.available_until && t > new Date(row.available_until).getTime()) return true;
  return false;
};

/* ---------- final rule ---------- */
export const isVisibleNow = (row, settings, now = new Date()) =>
  !isManuallyHidden(row, settings, now) &&
  !isScheduleBlocking(row, settings, now) &&
  !isOutsideDateRange(row, now);

export const hasSchedule = (row) =>
  !!(row?.schedule_enabled || row?.available_from || row?.available_until);

/* ---------- text helpers (admin UI) ---------- */
export const fmtMinutes12 = (min) => {
  if (min == null) return '';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};
export const fmtTime12 = (hhmm) => fmtMinutes12(parseHHMM(hhmm, null));
export const fmtDateTimePkt = (date) =>
  new Intl.DateTimeFormat('en-PK', {
    timeZone: 'Asia/Karachi', weekday: 'short', day: 'numeric', month: 'short',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(date);

export const describeManualHide = (row, settings) => {
  if (!row?.is_hidden) return '';
  const mode = row.hide_mode || 'manual';
  if (mode === 'until_time' && row.hidden_until) {
    return `Hidden until ${fmtDateTimePkt(new Date(row.hidden_until))}`;
  }
  if (mode === 'until_open') {
    const openMin = parseHHMM(settings?.opening_time, null);
    if (openMin != null && row.hidden_at) {
      return `Hidden until the shop opens (${fmtDateTimePkt(nextOccurrenceAfter(new Date(row.hidden_at), openMin))})`;
    }
    return 'Hidden until the shop opens';
  }
  return 'Hidden until you unhide it';
};

export const describeSchedule = (row, settings) => {
  if (!row?.schedule_enabled) return '';
  const start = row.schedule_start === 'CLOSE'
    ? `shop closing (${fmtTime12(settings?.closing_time)})`
    : fmtTime12(row.schedule_start);
  const end = row.schedule_end === 'OPEN'
    ? `shop opening (${fmtTime12(settings?.opening_time)})`
    : fmtTime12(row.schedule_end);
  const days = parseDays(row.schedule_days);
  const dayText = days ? [...days].sort().map((d) => DAY_NAMES[d]).join(', ') : 'every day';
  return row.schedule_type === 'show_only'
    ? `Shown only from ${start} to ${end} (${dayText})`
    : `Hidden from ${start} to ${end} (${dayText})`;
};

export const describeDateRange = (row) => {
  if (!row?.available_from && !row?.available_until) return '';
  const a = row.available_from ? fmtDateTimePkt(new Date(row.available_from)) : 'now';
  const b = row.available_until ? fmtDateTimePkt(new Date(row.available_until)) : 'no end date';
  return `Shown only between ${a} and ${b}`;
};

// One object the admin UI can use for pills / lists.
export const getVisibilityInfo = (row, settings, now = new Date()) => {
  const manualHidden = isManuallyHidden(row, settings, now);
  const scheduleBlocking = isScheduleBlocking(row, settings, now);
  const dateBlocking = isOutsideDateRange(row, now);
  const scheduled = hasSchedule(row);
  const hiddenNow = manualHidden || scheduleBlocking || dateBlocking;
  const lines = [];
  if (manualHidden) lines.push(describeManualHide(row, settings));
  if (row?.schedule_enabled) lines.push(describeSchedule(row, settings));
  if (row?.available_from || row?.available_until) lines.push(describeDateRange(row));
  let short = '';
  if (manualHidden) short = row.hide_mode === 'until_open' ? 'Hidden till shop opens' : row.hide_mode === 'until_time' ? 'Hidden for now' : 'Hidden';
  else if (scheduleBlocking) short = 'Hidden by schedule';
  else if (dateBlocking) short = 'Outside dates';
  else if (scheduled) short = 'Scheduled';
  return { hiddenNow, manualHidden, scheduleBlocking, dateBlocking, hasSchedule: scheduled, lines, short };
};