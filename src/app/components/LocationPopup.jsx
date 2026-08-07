'use client';
import { useState, useEffect } from 'react';

// 📍 Pizzger Exact Branch Location (Sir Syed Chowk, Tipu Road, Rawalpindi)
// ⚠️ Keep these in sync with the BRANCH_LAT / BRANCH_LNG used in your cart page.
const BRANCH_LAT = 33.6041699;
const BRANCH_LNG = 73.0760369;

// Used ONLY as a safety net when reverse-geocoding text fails to match a known
// zone name — never as the sole/primary rule. Tune this to comfortably cover
// Rawalpindi + Islamabad + Rawat + Mandra from your branch.
const MAX_FALLBACK_RADIUS_KM = 40;

const ALLOWED_ZONES = ['rawalpindi', 'islamabad', 'rawat', 'mandra'];

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

// Best-effort detection of in-app browsers (WhatsApp / Instagram / Facebook /
// Messenger / TikTok / WeChat / Line) — these commonly block or restrict
// navigator.geolocation on Android, which silently breaks detection for anyone
// who opens a shared link instead of using Chrome/Safari directly.
function detectInAppBrowser() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || '';
  return /FBAN|FBAV|Instagram|Line\/|MicroMessenger|WhatsApp|TikTok/i.test(ua);
}

/**
 * LocationPopup
 *
 * Two usage modes:
 *  - Default (forceOpen=false): shows once per browser session if we don't
 *    already have an address on file — same "soft" first-visit prompt as before.
 *  - forceOpen=true: always shown until a valid location is resolved. Used on
 *    the cart page as a hard gate so checkout can never proceed without real
 *    coordinates, no matter where else this component is (or isn't) mounted.
 */
export default function LocationPopup({ forceOpen = false, onLocated } = {}) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('initial'); // 'initial' | 'error' | 'manual'
  const [errorMsg, setErrorMsg] = useState('');
  const [manualQuery, setManualQuery] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [manualResults, setManualResults] = useState([]);
  const inAppBrowser = detectInAppBrowser();

  useEffect(() => {
    if (forceOpen) {
      setShowModal(true);
      return;
    }
    const sessionAddress = sessionStorage.getItem('user_detected_address');
    if (!sessionAddress) {
      setShowModal(true);
    }
  }, [forceOpen]);

  const applyLocation = (lat, lng, addressLine, cityGuess, allowed, source = 'auto') => {
    const fullDetectedAddress = (addressLine || '').toLowerCase();

    localStorage.setItem('user_detected_lat', lat);
    localStorage.setItem('user_detected_lng', lng);
    localStorage.setItem('user_detected_address', fullDetectedAddress);
    localStorage.setItem('out_of_delivery_area', allowed ? 'false' : 'true');
    localStorage.setItem('location_source', source);
    sessionStorage.setItem('user_detected_address', fullDetectedAddress);
    sessionStorage.setItem('user_detected_city', cityGuess || '');

    // Lets any other mounted component (e.g. the cart page) know a location
    // just became available, without needing a page reload.
    window.dispatchEvent(new Event('locationDetected'));

    if (!allowed) {
      alert('Sorry, you are away from our delivery areas. For More Concerns, Contact support.');
    }

    setShowModal(false);
    setStage('initial');
    if (onLocated) onLocated();
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const road = data.address?.road || data.address?.suburb || '';
      const area = data.address?.neighbourhood || data.address?.city_district || data.address?.town || '';
      const detectedCity = data.address?.city || data.address?.state_district || data.address?.county || '';
      const fullAddress = [road, area, detectedCity].filter(Boolean).join(', ');
      return { address: fullAddress, city: detectedCity };
    } catch (err) {
      console.error('Reverse geocode failed:', err);
      // Empty strings, not a guess — the caller falls back to a distance check
      // instead of ever assuming the user is inside the delivery zone.
      return { address: '', city: '' };
    }
  };

  const handleEnableLocation = () => {
    setLoading(true);
    setErrorMsg('');

    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setErrorMsg('This site requires a secure context (HTTPS) to access location services.');
      setStage('error');
      setLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setErrorMsg('Your browser does not support location detection.');
      setStage('error');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const { address, city } = await reverseGeocode(latitude, longitude);

        const textMatch = isAllowedZone(address) || isAllowedZone(city);
        const distanceMatch = haversineKm(BRANCH_LAT, BRANCH_LNG, latitude, longitude) <= MAX_FALLBACK_RADIUS_KM;
        const allowed = textMatch || distanceMatch;

        applyLocation(latitude, longitude, address || 'Detected location (address lookup failed)', city, allowed, 'auto');
        setLoading(false);
      },
      (error) => {
        console.error('Location Error Code:', error.code, 'Message:', error.message);
        setLoading(false);
        let msg = 'Location detection failed.';
        if (error.code === 1) msg = 'Please allow location access in your browser settings.';
        else if (error.code === 2) msg = 'No location available.';
        else if (error.code === 3) msg = 'Too much time taking to detect location. Please try again.';
        setErrorMsg(msg);
        setStage('error');
      },
      { timeout: 20000, maximumAge: 0, enableHighAccuracy: true }
    );
  };

  const handleManualSearch = async () => {
    if (!manualQuery.trim()) return;
    setManualLoading(true);
    setManualResults([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=pk&q=${encodeURIComponent(manualQuery)}`
      );
      const data = await res.json();
      setManualResults(data || []);
      if (!data || data.length === 0) {
        alert('No results found. Please try a different address.');
      }
    } catch (err) {
      console.error('Manual geocode search failed:', err);
      alert('Address search failed. Please try again.');
    } finally {
      setManualLoading(false);
    }
  };

  const handlePickManualResult = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    const textMatch = isAllowedZone(result.display_name);
    const distanceMatch = haversineKm(BRANCH_LAT, BRANCH_LNG, lat, lon) <= MAX_FALLBACK_RADIUS_KM;
    applyLocation(lat, lon, result.display_name, result.display_name, textMatch || distanceMatch, 'manual');
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#18110e] border-2 border-orange-500 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl space-y-4">
        <div className="w-14 h-14 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mx-auto text-2xl border border-orange-500/30">
          📍
        </div>
        <h3 className="text-xl font-black uppercase text-white tracking-wide">Enable Your Location</h3>

        {inAppBrowser && (
          <p className="text-[11px] text-yellow-300 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-2 font-medium leading-relaxed">
            It seems you are using an in-app browser (WhatsApp, Instagram, etc.) which may block location detection. For best results, open this site in your device's default browser (Chrome, Safari, etc.).
          </p>
        )}

        <p className="text-xs text-orange-200/70 font-medium leading-relaxed">
          Allow us to detect your current location to deliver your favorite PizzGer meals blazing fast near Tipu Road, Rawalpindi.
        </p>

        {stage === 'initial' && (
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleEnableLocation}
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-3.5 rounded-2xl uppercase tracking-wider text-xs shadow-lg shadow-orange-600/30 transition-all cursor-pointer"
            >
              {loading ? 'Detecting...' : 'Enable Location'}
            </button>
            <button
              type="button"
              onClick={() => setStage('manual')}
              className="w-full text-orange-300 text-[11px] font-bold uppercase tracking-wider underline cursor-pointer"
            >
              Set location manually
            </button>
          </div>
        )}

        {stage === 'error' && (
          <div className="space-y-2 pt-1">
            <p className="text-xs text-red-400 font-bold">{errorMsg}</p>
            <button
              type="button"
              onClick={handleEnableLocation}
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-3 rounded-2xl uppercase tracking-wider text-xs shadow-lg transition-all cursor-pointer"
            >
              {loading ? 'Detecting...' : 'Try Again'}
            </button>
            <button
              type="button"
              onClick={() => setStage('manual')}
              className="w-full bg-transparent border-2 border-orange-500/40 text-orange-300 font-bold py-3 rounded-2xl uppercase tracking-wider text-xs cursor-pointer"
            >
              Set location manually
            </button>
          </div>
        )}

        {stage === 'manual' && (
          <div className="space-y-2 pt-1 text-left">
            <label className="block text-[10px] font-black uppercase tracking-wider text-orange-200/70">
              Enter your address or nearby landmark
            </label>
            <input
              type="text"
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              placeholder="e.g. Tipu Road, Rawalpindi"
              className="w-full p-3 rounded-xl bg-[#120D0A] border-2 border-orange-500/30 text-white text-xs outline-none focus:border-orange-500"
            />
            <button
              type="button"
              onClick={handleManualSearch}
              disabled={manualLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-2.5 rounded-xl uppercase tracking-wider text-[11px] cursor-pointer"
            >
              {manualLoading ? 'Searching...' : 'Search'}
            </button>

            {manualResults.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
                {manualResults.map((r, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePickManualResult(r)}
                    className="w-full text-left p-2 rounded-lg bg-[#120D0A] border border-orange-500/20 text-[10px] text-orange-100 hover:border-orange-500 cursor-pointer"
                  >
                    {r.display_name}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setStage('initial')}
              className="w-full text-orange-300 text-[10px] font-bold uppercase tracking-wider underline pt-1 cursor-pointer"
            >
              Back to auto-detect
            </button>
          </div>
        )}
      </div>
    </div>
  );
}