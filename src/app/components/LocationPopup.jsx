'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Bricolage_Grotesque } from 'next/font/google';

const display = Bricolage_Grotesque({ subsets: ['latin'], display: 'swap' });

/* =====================================================================
   CONSTANTS — do not change without updating the cart page
   ===================================================================== */
const BRANCH_LAT = 33.6041699;
const BRANCH_LNG = 73.0760369;
const MAX_FALLBACK_RADIUS_KM = 40;
const ALLOWED_ZONES = ['rawalpindi', 'islamabad', 'rawat', 'mandra'];

/* Shared rule with cart/page.js — coordinates exist AND location confirmed
   in this browser session. */
const isLocationResolved = () => {
  try {
    const lat = parseFloat(localStorage.getItem('user_detected_lat'));
    const lng = parseFloat(localStorage.getItem('user_detected_lng'));
    const resolved =
      sessionStorage.getItem('location_resolved') === '1' ||
      !!sessionStorage.getItem('user_detected_address');
    return Number.isFinite(lat) && Number.isFinite(lng) && resolved;
  } catch {
    return false;
  }
};

function isAllowedZone(text) {
  const lower = (text || '').toLowerCase();
  return ALLOWED_ZONES.some((zone) => lower.includes(zone));
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function detectInAppBrowser() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || '';
  return /FBAN|FBAV|Instagram|Line\/|MicroMessenger|WhatsApp|TikTok/i.test(ua);
}

function detectPlatform() {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'other';
}

function formatTitleCase(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

/* =====================================================================
   ICONS
   ===================================================================== */
const IconPin = ({ className = 'w-8 h-8' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
  </svg>
);
const IconSpinner = ({ className = 'w-8 h-8' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
    <path d="M12 2a10 10 0 0 1 9.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);
const IconBlocked = ({ className = 'w-8 h-8' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <line x1="4" y1="4" x2="20" y2="20" />
  </svg>
);
const IconGps = ({ className = 'w-8 h-8' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    <path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" opacity="0.5" />
  </svg>
);
const IconCheck = ({ className = 'w-8 h-8' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconWarning = ({ className = 'w-8 h-8' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const IconSearch = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);
const IconClose = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <path d="M6 18 18 6M6 6l12 12" />
  </svg>
);

/* =====================================================================
   COMPONENT
   ===================================================================== */
export default function LocationPopup({ forceOpen = false, onLocated } = {}) {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState('detecting');
  const [errorMsg, setErrorMsg] = useState('');
  const [manualQuery, setManualQuery] = useState('');
  const [manualResults, setManualResults] = useState([]);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState('');
  const [detectedAddress, setDetectedAddress] = useState('');
  const [copied, setCopied] = useState(false);

  const mountedRef = useRef(true);
  const isDetectingRef = useRef(false);
  const autoRanRef = useRef(false);
  const successTimerRef = useRef(null);
  const copyTimerRef = useRef(null);
  const searchAbortRef = useRef(null);
  const debounceRef = useRef(null);
  const primaryBtnRef = useRef(null);
  const lastRetryRef = useRef(0);

  /* B4: keeps the latest `open` value available inside applyLocation
     without adding it to the useCallback dependency list. */
  const openRef = useRef(false);

  const inAppBrowser = useRef(false);
  const platform = useRef('other');

  /* ---------------- mount ---------------- */
  useEffect(() => {
    mountedRef.current = true;
    inAppBrowser.current = detectInAppBrowser();
    platform.current = detectPlatform();
    setReady(true);
    return () => {
      mountedRef.current = false;
      clearTimeout(successTimerRef.current);
      clearTimeout(copyTimerRef.current);
      clearTimeout(debounceRef.current);
      if (searchAbortRef.current) searchAbortRef.current.abort();
    };
  }, []);

  /* Keep openRef in sync with `open` */
  useEffect(() => {
    openRef.current = open;
  }, [open]);

  /* ---------------- permissions ---------------- */
  const queryPermissionState = useCallback(async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
        const status = await navigator.permissions.query({ name: 'geolocation' });
        return status.state;
      }
    } catch {
      /* older Safari: treat as prompt */
    }
    return 'prompt';
  }, []);

  /* ---------------- reverse geocode ---------------- */
  const reverseGeocode = useCallback(async (lat, lng) => {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 8000);
    try {
      const url =
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}` +
        `&zoom=18&addressdetails=1&accept-language=en`;
      const res = await fetch(url, { signal: ac.signal, headers: { Accept: 'application/json' } });
      clearTimeout(timer);
      if (!res.ok) throw new Error('reverse failed');
      const data = await res.json();
      const a = data.address || {};
      const parts = [
        a.house_number,
        a.road,
        a.suburb || a.neighbourhood,
        a.city_district,
        a.city || a.town || a.village,
        a.state_district,
      ].filter(Boolean);
      const address = parts.join(', ');
      const city = a.city || a.town || a.village || a.state_district || '';
      return { address, city };
    } catch {
      clearTimeout(timer);
      return { address: '', city: '' };
    }
  }, []);

  /* ---------------- apply location ---------------- */
  const applyLocation = useCallback(
    (lat, lng, addressLine, cityGuess, allowed, source = 'auto') => {
      if (typeof window === 'undefined') return;

      /* B3: never store an empty address, or the "resolved" flag breaks. */
      const safeAddress =
        addressLine && String(addressLine).trim()
          ? String(addressLine)
          : 'detected location (address lookup failed)';
      const fullAddress = safeAddress.toLowerCase();

      localStorage.setItem('user_detected_lat', String(lat));
      localStorage.setItem('user_detected_lng', String(lng));
      localStorage.setItem('user_detected_address', fullAddress);
      localStorage.setItem('out_of_delivery_area', allowed ? 'false' : 'true');
      localStorage.setItem('location_source', source);
      sessionStorage.setItem('user_detected_address', fullAddress);
      sessionStorage.setItem('user_detected_city', cityGuess || '');
      sessionStorage.setItem('location_resolved', '1');

      if (source === 'manual') {
        sessionStorage.setItem('location_manual_session', '1');
      }

      window.dispatchEvent(new Event('locationDetected'));

      /* B4: if the modal is NOT open (silent detection), act fast and only
         pop up if we need to warn about out-of-area. */
      if (!openRef.current) {
        if (onLocated) onLocated();

        if (!allowed && sessionStorage.getItem('out_area_notice_shown') !== '1') {
          sessionStorage.setItem('out_area_notice_shown', '1');
          setDetectedAddress(formatTitleCase(safeAddress));
          setStage('out_of_area');
          setOpen(true);
        }
        return;
      }

      /* Modal is open → keep the existing success → 1.4s → close flow. */
      setDetectedAddress(formatTitleCase(safeAddress));
      setStage('success');

      clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => {
        if (!mountedRef.current) return;

        const needsNotice =
          !allowed && sessionStorage.getItem('out_area_notice_shown') !== '1';

        if (needsNotice) {
          sessionStorage.setItem('out_area_notice_shown', '1');
          if (onLocated) onLocated();
          setStage('out_of_area');
        } else {
          if (onLocated) onLocated();
          setOpen(false);
        }
      }, 1400);
    },
    [onLocated]
  );

  /* ---------------- geolocation with retry ---------------- */
  const getPositionWithRetry = useCallback(() => {
    return new Promise((resolve, reject) => {
      const fail = (err, afterRetry) =>
        reject({ code: err.code, message: err.message, afterRetry });

      const first = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };
      const second = { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 };

      navigator.geolocation.getCurrentPosition(
        resolve,
        (err) => {
          if (err.code === 3) {
            navigator.geolocation.getCurrentPosition(
              resolve,
              (err2) => fail(err2, true),
              second
            );
          } else {
            fail(err, false);
          }
        },
        first
      );
    });
  }, []);

  /* ---------------- error router ---------------- */
  const handleDetectionError = useCallback(
    async (err) => {
      if (!mountedRef.current) return;
      setOpen(true);

      if (err?.custom) {
        setStage('error');
        setErrorMsg(err.custom);
        return;
      }

      const code = err?.code;

      if (code === 1) {
        const state = await queryPermissionState();
        /* B8: guard after await */
        if (!mountedRef.current) return;
        setStage(state === 'denied' ? 'blocked' : 'dismissed');
        return;
      }
      if (code === 2) {
        setStage('gps_off');
        return;
      }
      if (code === 3) {
        setStage('error');
        setErrorMsg(
          err.afterRetry
            ? 'Location is taking too long. Try again or enter your address manually.'
            : 'Location detection timed out. Please try again.'
        );
        return;
      }

      setStage('error');
      setErrorMsg('Location detection failed. Please try again.');
    },
    [queryPermissionState]
  );

  /* ---------------- main detection ---------------- */
  const runDetection = useCallback(
    async ({ silent = false } = {}) => {
      if (isDetectingRef.current) return;
      isDetectingRef.current = true;

      if (!silent) {
        setOpen(true);
        setStage('detecting');
        setErrorMsg('');
      }

      try {
        if (typeof window === 'undefined' || !window.isSecureContext) {
          throw { custom: 'This site needs a secure connection (HTTPS) to use your location.' };
        }
        if (!navigator.geolocation) {
          throw { custom: 'Your browser does not support location detection.' };
        }

        const position = await getPositionWithRetry();
        if (!mountedRef.current) return;

        const { latitude, longitude } = position.coords;
        const { address, city } = await reverseGeocode(latitude, longitude);
        if (!mountedRef.current) return;

        const textMatch = isAllowedZone(address) || isAllowedZone(city);
        const distanceMatch =
          haversineKm(BRANCH_LAT, BRANCH_LNG, latitude, longitude) <= MAX_FALLBACK_RADIUS_KM;
        const allowed = textMatch || distanceMatch;

        applyLocation(latitude, longitude, address, city, allowed, 'auto');
      } catch (err) {
        if (!mountedRef.current) return;
        await handleDetectionError(err);
      } finally {
        isDetectingRef.current = false;
      }
    },
    [getPositionWithRetry, reverseGeocode, handleDetectionError, applyLocation]
  );

  /* ---------------- manual search (debounced) ----------------
     B8: performManualSearch is defined above the effect that uses it. */
  const performManualSearch = useCallback(async (q) => {
    if (searchAbortRef.current) searchAbortRef.current.abort();
    const ac = new AbortController();
    searchAbortRef.current = ac;

    setManualLoading(true);
    setManualError('');

    try {
      const url =
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&countrycodes=pk` +
        `&addressdetails=1&accept-language=en` +
        `&viewbox=72.8,33.85,73.3,33.4&bounded=0&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, { signal: ac.signal, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('search failed');
      const data = await res.json();
      if (!mountedRef.current) return;
      const list = Array.isArray(data) ? data : [];
      setManualResults(list);
      if (list.length === 0) setManualError('No results. Try a nearby landmark.');
    } catch (err) {
      if (err?.name === 'AbortError') return;
      if (!mountedRef.current) return;
      setManualResults([]);
      setManualError('Search failed. Please try again.');
    } finally {
      if (mountedRef.current) setManualLoading(false);
    }
  }, []);

  useEffect(() => {
    if (stage !== 'manual') return;
    const q = manualQuery.trim();

    if (q.length < 3) {
      setManualResults([]);
      setManualError('');
      setManualLoading(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performManualSearch(q);
    }, 450);

    return () => clearTimeout(debounceRef.current);
  }, [manualQuery, stage, performManualSearch]);

  /* ---------------- auto-run once per mount ---------------- */
  useEffect(() => {
    if (!ready || autoRanRef.current) return;
    autoRanRef.current = true;

    (async () => {
      try {
        if (!forceOpen) {
          /* B5: on /cart the cart page has its own forced instance. */
          if (
            typeof window !== 'undefined' &&
            window.location.pathname.startsWith('/cart')
          ) {
            return;
          }

          /* B3/B7: use shared resolved rule. */
          if (isLocationResolved()) return;
          if (sessionStorage.getItem('location_skipped') === '1') return;
          if (sessionStorage.getItem('location_manual_session') === '1') return;
        } else {
          /* B7: forced mode - nothing to do if already resolved. */
          if (isLocationResolved()) return;
        }

        const state = await queryPermissionState();
        if (!mountedRef.current) return;

        if (state === 'granted') {
          runDetection({ silent: true });
        } else if (state === 'prompt') {
          setOpen(true);
          setStage('detecting');
          runDetection();
        } else {
          setOpen(true);
          setStage('blocked');
        }
      } catch {
        /* never crash the page */
      }
    })();
  }, [ready, forceOpen, queryPermissionState, runDetection]);

  /* ---------------- settings-return detection ---------------- */
  useEffect(() => {
    if (!open) return;
    if (stage !== 'blocked' && stage !== 'gps_off') return;

    let permStatus = null;
    let permCleanup = null;

    const tryRetry = async () => {
      const now = Date.now();
      if (now - lastRetryRef.current < 1200) return;
      lastRetryRef.current = now;

      const state = await queryPermissionState();
      if (!mountedRef.current) return;
      if (state === 'granted' || stage === 'gps_off') {
        runDetection();
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') tryRetry();
    };
    const onFocus = () => tryRetry();

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);

    (async () => {
      try {
        if (navigator.permissions?.query) {
          permStatus = await navigator.permissions.query({ name: 'geolocation' });
          const onChange = () => {
            if (permStatus.state === 'granted') runDetection();
          };
          permStatus.addEventListener?.('change', onChange);
          permCleanup = () => permStatus.removeEventListener?.('change', onChange);
        }
      } catch {
        /* ignore */
      }
    })();

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
      if (permCleanup) permCleanup();
    };
  }, [open, stage, queryPermissionState, runDetection]);

  /* ---------------- body scroll lock ---------------- */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  /* ---------------- focus primary button on stage change ---------------- */
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      primaryBtnRef.current?.focus?.();
    }, 80);
    return () => clearTimeout(t);
  }, [open, stage]);

  /* ---------------- skip ---------------- */
  const handleSkip = useCallback(() => {
    if (forceOpen) return;
    try {
      sessionStorage.setItem('location_skipped', '1');
    } catch {
      /* ignore */
    }
    setOpen(false);
  }, [forceOpen]);

  /* ---------------- ESC (soft mode only) ---------------- */
  useEffect(() => {
    if (!open || forceOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') handleSkip();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, forceOpen, handleSkip]);

  const handlePickManual = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return;

    const textMatch = isAllowedZone(result.display_name);
    const distanceMatch = haversineKm(BRANCH_LAT, BRANCH_LNG, lat, lon) <= MAX_FALLBACK_RADIUS_KM;
    applyLocation(lat, lon, result.display_name, result.display_name, textMatch || distanceMatch, 'manual');
  };

  /* ---------------- copy link ---------------- */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => mountedRef.current && setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  /* ---------------- derived UI strings ---------------- */
  const isInApp = inAppBrowser.current;
  const platformLabel = platform.current;

  if (!ready || !open) return null;

  /* =====================================================================
     RENDER
     ===================================================================== */
  const stepBlocked = {
    android: [
      'Tap the lock / settings icon next to the web address.',
      'Tap "Permissions" → "Location" → "Allow".',
      'Come back here — we will detect it automatically.',
    ],
    ios: [
      'Tap "aA" in the address bar → "Website Settings".',
      'Set "Location" to "Allow".',
      'Still off? Settings → Privacy & Security → Location Services → Safari Websites → While Using.',
    ],
    other: [
      'Click the lock icon next to the web address.',
      'Open "Site settings" → "Location" → "Allow".',
      'Come back here — we will detect it automatically.',
    ],
  }[platformLabel] || [];

  const stepGpsOff = {
    android: [
      'Swipe down from the top of your screen.',
      'Tap the "Location" / GPS icon to turn it on.',
      'Return to this page — we will detect it automatically.',
    ],
    ios: [
      'Open Settings → Privacy & Security.',
      'Tap "Location Services" → turn it ON.',
      'Return to this page — we will detect it automatically.',
    ],
    other: [
      'Open your device settings and turn Location ON.',
      'Return to this page — we will detect it automatically.',
    ],
  }[platformLabel] || [];

  const stageIcon = {
    detecting: <IconSpinner className="w-8 h-8 lp-spin" />,
    dismissed: <IconPin className="w-8 h-8" />,
    blocked: <IconBlocked className="w-8 h-8" />,
    gps_off: <IconGps className="w-8 h-8" />,
    error: <IconWarning className="w-8 h-8" />,
    manual: <IconSearch className="w-8 h-8" />,
    success: <IconCheck className="w-8 h-8" />,
    out_of_area: <IconWarning className="w-8 h-8" />,
  }[stage];

  const stageTone = {
    detecting: 'from-orange-500 to-amber-500',
    dismissed: 'from-orange-500 to-amber-500',
    blocked: 'from-rose-500 to-red-500',
    gps_off: 'from-amber-500 to-orange-500',
    error: 'from-rose-500 to-red-500',
    manual: 'from-orange-500 to-amber-500',
    success: 'from-emerald-500 to-green-500',
    out_of_area: 'from-amber-500 to-orange-500',
  }[stage];

  const stageTitle = {
    detecting: 'Waiting for your permission…',
    dismissed: 'We need your location',
    blocked: 'Location is blocked',
    gps_off: 'Turn on device location',
    error: 'Something went wrong',
    manual: 'Enter your address',
    success: 'Location set!',
    out_of_area: 'Outside delivery area',
  }[stage];

  const stageHint = {
    detecting: 'When your phone asks, tap Allow and choose Precise.',
    dismissed: 'To deliver to your door we need to know where you are.',
    blocked: 'Follow these steps to allow location access.',
    gps_off: "Your phone's location is turned off.",
    error: errorMsg,
    manual: 'Search a nearby landmark, or use your current location.',
    success: 'We found you — happy ordering!',
    out_of_area: 'We currently only deliver around Tipu Road, Rawalpindi.',
  }[stage];

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes lp-fadeIn { from { opacity: 0 } to { opacity: 1 } }
            @keyframes lp-sheetUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
            @keyframes lp-popIn { from { opacity: 0; transform: scale(0.94) } to { opacity: 1; transform: scale(1) } }
            @keyframes lp-ringPulse { 0% { transform: scale(0.85); opacity: 0.55 } 100% { transform: scale(1.9); opacity: 0 } }
            @keyframes lp-ringPulseFast { 0% { transform: scale(0.85); opacity: 0.7 } 100% { transform: scale(2.1); opacity: 0 } }
            @keyframes lp-spin { to { transform: rotate(360deg) } }
            .lp-backdrop { animation: lp-fadeIn .2s ease-out }
            .lp-sheet { animation: lp-sheetUp .3s cubic-bezier(.2,.8,.2,1) }
            @media (min-width: 640px) {
              .lp-sheet { animation: lp-popIn .26s cubic-bezier(.2,.8,.2,1) }
            }
            .lp-ring { animation: lp-ringPulse 2.2s ease-out infinite }
            .lp-ring-fast { animation: lp-ringPulseFast 1.05s ease-out infinite }
            .lp-spin { animation: lp-spin .9s linear infinite }
            .lp-modal-scope *:focus-visible { outline: 2px solid #f97316; outline-offset: 2px }
            @media (prefers-reduced-motion: reduce) {
              .lp-backdrop, .lp-sheet, .lp-ring, .lp-ring-fast, .lp-spin {
                animation: none !important;
                transition: none !important;
              }
            }
          `,
        }}
      />

      <div
        className="lp-modal-scope fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lp-title"
      >
        <div className="lp-backdrop absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={forceOpen ? undefined : handleSkip} />

        <div
          className="lp-sheet relative w-full sm:max-w-md bg-[#fff8e7] dark:bg-[#18110e] text-[#1a1210] dark:text-white border-2 border-[#1a1210] dark:border-orange-500 rounded-t-3xl sm:rounded-3xl shadow-[6px_6px_0_#1a1210] dark:shadow-[6px_6px_0_#f97316] overflow-hidden"
          style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        >
          {/* Grab handle on mobile */}
          <div className="sm:hidden pt-3 flex justify-center">
            <span className="w-10 h-1.5 rounded-full bg-[#1a1210]/30 dark:bg-orange-500/40" />
          </div>

          {/* Close button — soft mode only */}
          {!forceOpen && (
            <button
              type="button"
              onClick={handleSkip}
              aria-label="Close"
              className="absolute top-3 right-3 w-9 h-9 rounded-full grid place-items-center bg-[#1a1210]/5 dark:bg-orange-500/10 text-[#1a1210] dark:text-orange-300 hover:bg-[#1a1210]/10 dark:hover:bg-orange-500/20 transition"
            >
              <IconClose />
            </button>
          )}

          <div className="px-5 sm:px-7 pt-4 pb-5 sm:pt-6 space-y-4">
            {/* In-app browser warning */}
            {isInApp && (
              <div className="rounded-2xl border-2 border-[#1a1210] dark:border-orange-500/60 bg-[#FFC21A] text-[#1a1210] p-3 flex items-start gap-2">
                <IconWarning className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="flex-1 text-[11px] font-semibold leading-snug">
                  Open this link in Chrome / Safari for the location popup to work.
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="shrink-0 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#1a1210] text-[#FFC21A] hover:opacity-90 transition"
                >
                  {copied ? 'Copied!' : 'Copy link'}
                </button>
              </div>
            )}

            {/* Illustration */}
            <div className="flex justify-center pt-1">
              <div className="relative w-24 h-24">
                <span className={`absolute inset-0 rounded-full bg-gradient-to-br ${stageTone} opacity-25 ${stage === 'detecting' ? 'lp-ring-fast' : 'lp-ring'}`} />
                <span className={`absolute inset-0 rounded-full bg-gradient-to-br ${stageTone} opacity-25 ${stage === 'detecting' ? 'lp-ring-fast' : 'lp-ring'}`} style={{ animationDelay: '0.5s' }} />
                <span className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${stageTone} text-white grid place-items-center border-2 border-[#1a1210] dark:border-orange-500 shadow-[3px_3px_0_#1a1210] dark:shadow-[3px_3px_0_#f97316]`}>
                  {stageIcon}
                </span>
              </div>
            </div>

            {/* Title + hint */}
            <div className="text-center space-y-1.5">
              <h3 id="lp-title" className={`${display.className} text-xl sm:text-2xl font-extrabold tracking-tight`}>
                {stageTitle}
              </h3>
              <p className="text-[12.5px] font-medium text-[#1a1210]/70 dark:text-orange-100/70 leading-relaxed" aria-live="polite">
                {stageHint}
              </p>
            </div>

            {/* Stage content */}
            {stage === 'detecting' && (
              <div className="pt-1 text-center">
                <p className="text-[11px] font-semibold text-[#1a1210]/55 dark:text-orange-200/55">
                  Waiting for GPS fix…
                </p>
              </div>
            )}

            {stage === 'dismissed' && (
              <div className="space-y-2 pt-1">
                <button
                  ref={primaryBtnRef}
                  type="button"
                  onClick={() => runDetection()}
                  className="w-full h-12 rounded-2xl bg-orange-600 text-white font-extrabold uppercase tracking-wide text-sm border-2 border-[#1a1210] shadow-[3px_3px_0_#1a1210] hover:bg-orange-700 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition"
                >
                  Allow location
                </button>
                <button
                  type="button"
                  onClick={() => setStage('manual')}
                  className="w-full h-12 rounded-2xl bg-transparent text-[#1a1210] dark:text-orange-100 font-bold uppercase tracking-wide text-[12px] border-2 border-[#1a1210] dark:border-orange-500/60 hover:bg-[#1a1210]/5 dark:hover:bg-orange-500/10 transition"
                >
                  Enter address manually
                </button>
                <p className="pt-1 text-center text-[10px] font-semibold text-[#1a1210]/50 dark:text-orange-200/50 leading-snug">
                  We only use your location to calculate delivery. We never share it.
                </p>
              </div>
            )}

            {/* B1: only 'blocked' shows the blocked-steps block */}
            {stage === 'blocked' && (
              <div className="space-y-2 pt-1">
                <ol className="space-y-2">
                  {stepBlocked.map((text, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[12px] font-medium text-[#1a1210]/85 dark:text-orange-100/85">
                      <span className="shrink-0 w-6 h-6 rounded-full grid place-items-center bg-[#FFC21A] text-[#1a1210] text-[11px] font-black border-2 border-[#1a1210]">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{text}</span>
                    </li>
                  ))}
                </ol>
                <div className="pt-2 space-y-2">
                  <button
                    ref={primaryBtnRef}
                    type="button"
                    onClick={() => runDetection()}
                    className="w-full h-12 rounded-2xl bg-orange-600 text-white font-extrabold uppercase tracking-wide text-sm border-2 border-[#1a1210] shadow-[3px_3px_0_#1a1210] hover:bg-orange-700 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition"
                  >
                    I turned it on — Try again
                  </button>
                  <button
                    type="button"
                    onClick={() => setStage('manual')}
                    className="w-full h-12 rounded-2xl bg-transparent text-[#1a1210] dark:text-orange-100 font-bold uppercase tracking-wide text-[12px] border-2 border-[#1a1210] dark:border-orange-500/60 hover:bg-[#1a1210]/5 dark:hover:bg-orange-500/10 transition"
                  >
                    Enter address manually
                  </button>
                </div>
              </div>
            )}

            {stage === 'gps_off' && (
              <div className="space-y-2 pt-1">
                <ol className="space-y-2">
                  {stepGpsOff.map((text, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[12px] font-medium text-[#1a1210]/85 dark:text-orange-100/85">
                      <span className="shrink-0 w-6 h-6 rounded-full grid place-items-center bg-[#FFC21A] text-[#1a1210] text-[11px] font-black border-2 border-[#1a1210]">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{text}</span>
                    </li>
                  ))}
                </ol>
                <div className="pt-2 space-y-2">
                  <button
                    ref={primaryBtnRef}
                    type="button"
                    onClick={() => runDetection()}
                    className="w-full h-12 rounded-2xl bg-orange-600 text-white font-extrabold uppercase tracking-wide text-sm border-2 border-[#1a1210] shadow-[3px_3px_0_#1a1210] hover:bg-orange-700 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition"
                  >
                    I turned it on — Try again
                  </button>
                  <button
                    type="button"
                    onClick={() => setStage('manual')}
                    className="w-full h-12 rounded-2xl bg-transparent text-[#1a1210] dark:text-orange-100 font-bold uppercase tracking-wide text-[12px] border-2 border-[#1a1210] dark:border-orange-500/60 hover:bg-[#1a1210]/5 dark:hover:bg-orange-500/10 transition"
                  >
                    Enter address manually
                  </button>
                </div>
              </div>
            )}

            {stage === 'error' && (
              <div className="space-y-2 pt-1">
                <div className="rounded-2xl border-2 border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300 p-3 text-[12px] font-semibold leading-snug">
                  {errorMsg || 'Something unexpected happened.'}
                </div>
                <button
                  ref={primaryBtnRef}
                  type="button"
                  onClick={() => runDetection()}
                  className="w-full h-12 rounded-2xl bg-orange-600 text-white font-extrabold uppercase tracking-wide text-sm border-2 border-[#1a1210] shadow-[3px_3px_0_#1a1210] hover:bg-orange-700 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition"
                >
                  Try again
                </button>
                <button
                  type="button"
                  onClick={() => setStage('manual')}
                  className="w-full h-12 rounded-2xl bg-transparent text-[#1a1210] dark:text-orange-100 font-bold uppercase tracking-wide text-[12px] border-2 border-[#1a1210] dark:border-orange-500/60 hover:bg-[#1a1210]/5 dark:hover:bg-orange-500/10 transition"
                >
                  Enter address manually
                </button>
              </div>
            )}

            {stage === 'manual' && (
              <div className="space-y-2 pt-1">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1a1210]/50 dark:text-orange-200/50">
                    <IconSearch />
                  </span>
                  <input
                    type="text"
                    value={manualQuery}
                    onChange={(e) => setManualQuery(e.target.value)}
                    placeholder="e.g. Tipu Road, Rawalpindi"
                    autoFocus
                    className="w-full h-12 pl-10 pr-3 rounded-2xl bg-white dark:bg-[#120D0A] border-2 border-[#1a1210] dark:border-orange-500/40 text-[#1a1210] dark:text-white text-sm font-medium outline-none focus:border-orange-500"
                  />
                </div>

                {manualLoading && (
                  <div className="flex items-center justify-center gap-2 py-3 text-[11px] font-semibold text-[#1a1210]/60 dark:text-orange-200/60">
                    <IconSpinner className="w-4 h-4 lp-spin" />
                    Searching…
                  </div>
                )}

                {!manualLoading && manualError && (
                  <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 px-1">{manualError}</p>
                )}

                {!manualLoading && manualResults.length > 0 && (
                  <div className="max-h-56 overflow-y-auto -mx-1 px-1 space-y-1.5">
                    {manualResults.map((r, idx) => {
                      const parts = String(r.display_name || '').split(',');
                      const head = parts[0];
                      const tail = parts.slice(1).join(',').trim();
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handlePickManual(r)}
                          className="w-full flex items-start gap-2.5 text-left p-3 rounded-2xl bg-white dark:bg-[#120D0A] border-2 border-[#1a1210]/15 dark:border-orange-500/25 hover:border-[#1a1210] dark:hover:border-orange-500 transition"
                        >
                          <span className="shrink-0 w-7 h-7 rounded-lg grid place-items-center bg-orange-500/10 text-orange-600 dark:text-orange-300 mt-0.5">
                            <IconPin className="w-3.5 h-3.5" />
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-[12.5px] font-bold text-[#1a1210] dark:text-white leading-snug">
                              {head}
                            </span>
                            {tail && (
                              <span className="block text-[10.5px] font-medium text-[#1a1210]/55 dark:text-orange-200/55 mt-0.5 leading-snug">
                                {tail}
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="pt-1 space-y-2">
                  <button
                    type="button"
                    onClick={() => runDetection()}
                    className="w-full h-11 rounded-2xl bg-transparent text-[#1a1210] dark:text-orange-100 font-bold uppercase tracking-wide text-[11.5px] border-2 border-[#1a1210] dark:border-orange-500/60 hover:bg-[#1a1210]/5 dark:hover:bg-orange-500/10 transition"
                  >
                    Use my current location instead
                  </button>
                </div>
              </div>
            )}

            {stage === 'success' && (
              <div className="pt-1">
                <div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 p-3 text-center">
                  <p className="text-[12px] font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                    Delivering to
                  </p>
                  <p className="mt-1 text-[12.5px] font-bold text-[#1a1210] dark:text-white line-clamp-2">
                    {detectedAddress}
                  </p>
                </div>
              </div>
            )}

            {stage === 'out_of_area' && (
              <div className="space-y-2 pt-1">
                <div className="rounded-2xl border-2 border-amber-500/50 bg-amber-500/10 p-3 text-[12px] font-semibold text-[#1a1210] dark:text-orange-100 leading-snug">
                  Your location is outside our delivery zone. You can still browse the menu, or change your location to try again.
                </div>
                {!forceOpen ? (
                  <>
                    <button
                      ref={primaryBtnRef}
                      type="button"
                      onClick={() => setOpen(false)}
                      className="w-full h-12 rounded-2xl bg-orange-600 text-white font-extrabold uppercase tracking-wide text-sm border-2 border-[#1a1210] shadow-[3px_3px_0_#1a1210] hover:bg-orange-700 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition"
                    >
                      Continue browsing
                    </button>
                    <button
                      type="button"
                      onClick={() => setStage('manual')}
                      className="w-full h-12 rounded-2xl bg-transparent text-[#1a1210] dark:text-orange-100 font-bold uppercase tracking-wide text-[12px] border-2 border-[#1a1210] dark:border-orange-500/60 hover:bg-[#1a1210]/5 dark:hover:bg-orange-500/10 transition"
                    >
                      Change location
                    </button>
                  </>
                ) : (
                  <>
                    {/* B6: forced mode must let the customer leave the cart page */}
                    <button
                      ref={primaryBtnRef}
                      type="button"
                      onClick={() => setStage('manual')}
                      className="w-full h-12 rounded-2xl bg-orange-600 text-white font-extrabold uppercase tracking-wide text-sm border-2 border-[#1a1210] shadow-[3px_3px_0_#1a1210] hover:bg-orange-700 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition"
                    >
                      Change location
                    </button>
                    <a
                      href="/contact"
                      className="w-full h-12 rounded-2xl bg-transparent text-[#1a1210] dark:text-orange-100 font-bold uppercase tracking-wide text-[12px] border-2 border-[#1a1210] dark:border-orange-500/60 hover:bg-[#1a1210]/5 dark:hover:bg-orange-500/10 transition grid place-items-center"
                    >
                      Contact support
                    </a>
                    <a
                      href="/menu"
                      className="w-full h-12 rounded-2xl bg-transparent text-[#1a1210] dark:text-orange-100 font-bold uppercase tracking-wide text-[12px] border-2 border-[#1a1210] dark:border-orange-500/60 hover:bg-[#1a1210]/5 dark:hover:bg-orange-500/10 transition grid place-items-center"
                    >
                      Back to menu
                    </a>
                  </>
                )}
              </div>
            )}

            {/* Skip link — soft mode only, hidden on out_of_area & success */}
            {!forceOpen && stage !== 'out_of_area' && stage !== 'success' && (
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-[11px] font-bold uppercase tracking-widest text-[#1a1210]/55 dark:text-orange-200/55 hover:text-[#1a1210] dark:hover:text-orange-100 underline underline-offset-4 transition"
                >
                  Skip for now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}