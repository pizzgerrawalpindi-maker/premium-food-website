'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Bricolage_Grotesque } from 'next/font/google';
import LocationPopup from '@/app/components/LocationPopup'; // ⚠️ adjust path if needed

const display = Bricolage_Grotesque({ subsets: ['latin'], display: 'swap' });

/* Shared rule with LocationPopup.jsx — coordinates exist AND the location was
   confirmed in this browser session. */
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

export default function CartPage() {
  /* --------------------------- state --------------------------- */
  const [cartItems, setCartItems] = useState([]);
  const [mounted, setMounted] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [deliveryType, setDeliveryType] = useState('ASAP');
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [errors, setErrors] = useState({});
  const [showDetails, setShowDetails] = useState(false);

  const [hasLocation, setHasLocation] = useState(false);
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);
  const noticeTimerRef = useRef(null);

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);

  /* --------------------------- helpers --------------------------- */
  const showNotice = useCallback((text, type = 'error') => {
    setNotice({ type, text });
    clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => setNotice(null), 5000);
  }, []);

  const refreshLocation = useCallback(() => {
    try {
      const lat = parseFloat(localStorage.getItem('user_detected_lat'));
      const lng = parseFloat(localStorage.getItem('user_detected_lng'));
      setUserLat(Number.isFinite(lat) ? lat : null);
      setUserLng(Number.isFinite(lng) ? lng : null);
      setHasLocation(isLocationResolved());
    } catch {
      setUserLat(null);
      setUserLng(null);
      setHasLocation(false);
    }
  }, []);

  /* --------------------------- initial load --------------------------- */
  useEffect(() => {
    let savedCart = [];
    try {
      savedCart = JSON.parse(localStorage.getItem('food_cart') || '[]');
      if (!Array.isArray(savedCart)) savedCart = [];
    } catch {
      savedCart = [];
    }

    const normalItemsSubtotal = savedCart
      .filter((item) => item.id !== 'free-promo-item-4')
      .reduce((acc, item) => acc + item.price * item.quantity, 0);

    if (normalItemsSubtotal >= 2000) {
      const freeItemIndex = savedCart.findIndex((item) => item.id === 'free-promo-item-4');
      if (freeItemIndex === -1) {
        savedCart.push({
          id: 'free-promo-item-4',
          title: 'Exclusive Free Offer Item',
          size: 'Standard',
          price: 0,
          quantity: 1,
          image: '/images/4.webp',
          isFree: true,
        });
      } else {
        savedCart[freeItemIndex].quantity = 1;
      }
    } else {
      savedCart = savedCart.filter((item) => item.id !== 'free-promo-item-4');
    }

    setCartItems(savedCart);
    try {
      localStorage.setItem('food_cart', JSON.stringify(savedCart));
    } catch {}

    refreshLocation();
    setMounted(true);
    try {
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch {
      window.scrollTo(0, 0);
    }

    const onLoc = () => refreshLocation();
    window.addEventListener('locationDetected', onLoc);
    window.addEventListener('storage', onLoc);

    return () => {
      window.removeEventListener('locationDetected', onLoc);
      window.removeEventListener('storage', onLoc);
      clearTimeout(noticeTimerRef.current);
    };
  }, [refreshLocation]);

  /* --------------------------- cart mutations --------------------------- */
  const updateCart = (updatedItems) => {
    const normalSubtotal = updatedItems
      .filter((item) => item.id !== 'free-promo-item-4')
      .reduce((acc, item) => acc + item.price * item.quantity, 0);

    let finalItems = [...updatedItems];

    if (normalSubtotal >= 2000) {
      const exists = finalItems.some((item) => item.id === 'free-promo-item-4');
      if (!exists) {
        finalItems.push({
          id: 'free-promo-item-4',
          title: 'Exclusive Free Offer Item',
          size: 'Standard',
          price: 0,
          quantity: 1,
          image: '/images/4.webp',
          isFree: true,
        });
      }
    } else {
      finalItems = finalItems.filter((item) => item.id !== 'free-promo-item-4');
    }

    setCartItems(finalItems);
    try {
      localStorage.setItem('food_cart', JSON.stringify(finalItems));
    } catch {}
    window.dispatchEvent(new Event('cartUpdated'));
    window.dispatchEvent(new Event('storage'));
  };

  const increaseQty = (id) => {
    const updated = cartItems.map((item) =>
      item.id === id && !item.isFree ? { ...item, quantity: item.quantity + 1 } : item
    );
    updateCart(updated);
  };

  const decreaseQty = (id) => {
    const updated = cartItems.map((item) =>
      item.id === id && !item.isFree && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
    updateCart(updated);
  };

  const removeItem = (id) => {
    const updated = cartItems.filter((item) => item.id !== id);
    updateCart(updated);
  };

  /* --------------------------- branch & distance --------------------------- */
  const BRANCH_LAT = 33.6041699;
  const BRANCH_LNG = 73.0760369;

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getDynamicDeliveryCharges = (dist) => {
    if (!Number.isFinite(dist)) return 40;
    const km = Math.ceil(dist);
    if (km <= 3) return km * 40;
    if (km <= 7) {
      let charges = 120;
      let rate = 35;
      for (let i = 4; i <= km; i++) {
        charges += rate;
        rate -= 5;
      }
      return charges;
    }
    return 230 + (km - 7) * 20;
  };

  const calculatedDistance =
    Number.isFinite(userLat) && Number.isFinite(userLng)
      ? calculateDistance(BRANCH_LAT, BRANCH_LNG, userLat, userLng)
      : NaN;

  const normalCartItems = cartItems.filter((item) => item.id !== 'free-promo-item-4');
  const subtotal = normalCartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const deliveryCharges =
    hasLocation && Number.isFinite(calculatedDistance) && cartItems.length > 0
      ? getDynamicDeliveryCharges(calculatedDistance)
      : 0;

  const gstAmount = Math.round(subtotal * 0.13);
  const total = subtotal > 0 ? subtotal + gstAmount + deliveryCharges : 0;

  const getMinDateTime = () => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const isValidPhone = /^3\d{9}$/.test(phone);

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.startsWith('92')) val = val.slice(2);
    if (val.startsWith('0')) val = val.slice(1);
    val = val.slice(0, 10);
    setPhone(val);
  };

  const triggerConfetti = () => {
    const pieces = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      bg: ['#f97316', '#ef4444', '#eab308', '#22c55e', '#3b82f6', '#ec4899'][Math.floor(Math.random() * 6)],
      animDuration: Math.random() * 2 + 2 + 's',
      delay: Math.random() * 0.5 + 's',
    }));
    setConfettiPieces(pieces);
  };

  /* --------------------------- order confirm --------------------------- */
  const handleConfirmOrder = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting) return;

    const detectedLat = parseFloat(localStorage.getItem('user_detected_lat'));
    const detectedLng = parseFloat(localStorage.getItem('user_detected_lng'));
    if (!Number.isFinite(detectedLat) || !Number.isFinite(detectedLng)) {
      showNotice(
        'We cannot proceed with your order because your location is not set. Please allow location access or manually set your location to continue.'
      );
      setHasLocation(false);
      return;
    }

    const isOutOfArea = localStorage.getItem('out_of_delivery_area') === 'true';
    if (isOutOfArea) {
      showNotice('Sorry, you are away from our delivery areas.');
      return;
    }

    if (normalCartItems.length === 0) {
      showNotice('Your cart is empty! Please add items from the menu first.');
      return;
    }
    if (subtotal < 600) {
      showNotice('Minimum order amount must be at least Rs. 600 to proceed.');
      return;
    }

    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Enter your full name';
    if (!phone || !isValidPhone) newErrors.phone = 'Enter a valid 10-digit mobile number starting with 3';
    if (!city) newErrors.city = 'Select your city';
    if (!address.trim()) newErrors.address = 'Enter your delivery address';
    if (deliveryType === 'Scheduled') {
      if (!scheduledDateTime) {
        newErrors.schedule = 'Pick a delivery date and time';
      } else {
        const sel = new Date(scheduledDateTime);
        if (Number.isFinite(sel.getTime()) && sel.getTime() < Date.now() + 60 * 60 * 1000) {
          newErrors.schedule = 'Please choose a time at least 1 hour from now.';
        }
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrorElement = document.getElementById(Object.keys(newErrors)[0]);
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      const { data: settingData } = await supabase.from('settings').select('*').single();

      if (settingData) {
        if (settingData.is_open === false) {
          showNotice('We Are Closed by management right now! Please order during working hours.');
          return;
        }

        if (settingData.opening_time && settingData.closing_time) {
          const [openH, openM] = settingData.opening_time.split(':').map(Number);
          const [closeH, closeM] = settingData.closing_time.split(':').map(Number);
          const openMins = openH * 60 + openM;
          const closeMins = closeH * 60 + closeM;

          if (deliveryType === 'ASAP') {
            const now = new Date();
            const currentMins = now.getHours() * 60 + now.getMinutes();
            let isOpen = false;
            if (openMins < closeMins) {
              isOpen = currentMins >= openMins && currentMins < closeMins;
            } else {
              isOpen = currentMins >= openMins || currentMins < closeMins;
            }
            if (!isOpen) {
              showNotice(
                `We Are Closed right now! Our operating hours are ${settingData.opening_time} to ${settingData.closing_time}.`
              );
              return;
            }
          } else if (deliveryType === 'Scheduled') {
            if (!scheduledDateTime) {
              showNotice('Please select a valid scheduled delivery time.');
              return;
            }
            const selectedDate = new Date(scheduledDateTime);
            const selectedMins = selectedDate.getHours() * 60 + selectedDate.getMinutes();
            let isWithin = false;
            if (openMins < closeMins) {
              isWithin = selectedMins >= openMins && selectedMins < closeMins;
            } else {
              isWithin = selectedMins >= openMins || selectedMins < closeMins;
            }
            if (!isWithin) {
              showNotice(
                `Please select an order time within our operating hours range (${settingData.opening_time} to ${settingData.closing_time}).`
              );
              return;
            }
          }
        }
      }
    } catch (err) {
      console.error('Timing validation fallback check:', err);
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('orders').insert([
        {
          customer_name: name,
          phone: `+92${phone}`,
          city: city,
          address: address,
          apartment: apartment,
          detected_address:
            localStorage.getItem('user_detected_address') || 'Not fetched via GPS',
          latitude: parseFloat(localStorage.getItem('user_detected_lat')) || null,
          longitude: parseFloat(localStorage.getItem('user_detected_lng')) || null,
          delivery_distance: Number.isFinite(calculatedDistance)
            ? parseFloat(calculatedDistance.toFixed(1))
            : null,
          special_instructions: specialInstructions,
          payment_method: paymentMethod,
          delivery_type: deliveryType,
          scheduled_time: deliveryType === 'Scheduled' ? scheduledDateTime : 'ASAP',
          subtotal: subtotal,
          tax_amount: gstAmount,
          delivery_charges: deliveryCharges,
          items: cartItems,
          total_amount: total,
          status: 'Pending',
        },
      ]);

      if (error) {
        showNotice('Failed to place order: ' + error.message);
        setIsSubmitting(false);
        return;
      }

      const finalOrderObject = {
        customer_name: name,
        phone: `+92${phone}`,
        city: city,
        address: address,
        apartment: apartment,
        detected_address:
          localStorage.getItem('user_detected_address') || 'Not fetched via GPS',
        latitude: parseFloat(localStorage.getItem('user_detected_lat')) || null,
        longitude: parseFloat(localStorage.getItem('user_detected_lng')) || null,
        delivery_distance: Number.isFinite(calculatedDistance)
          ? parseFloat(calculatedDistance.toFixed(1))
          : null,
        special_instructions: specialInstructions,
        payment_method: paymentMethod,
        delivery_type: deliveryType,
        scheduled_time: deliveryType === 'Scheduled' ? scheduledDateTime : 'ASAP',
        subtotal: subtotal,
        tax_amount: gstAmount,
        delivery_charges: deliveryCharges,
        items: cartItems,
        total_amount: total,
        created_at: new Date().toISOString(),
      };
      try {
        localStorage.setItem('last_confirmed_order', JSON.stringify(finalOrderObject));
      } catch {}

      try {
        localStorage.removeItem('food_cart');
      } catch {}

      if (subtotal > 1999) {
        triggerConfetti();
        setShowOfferModal(true);
        setTimeout(() => {
          setShowOfferModal(false);
          window.location.href = '/receipt';
        }, 4000);
      } else {
        window.location.href = '/receipt';
      }
    } catch (err) {
      console.error('Order submission error:', err);
      showNotice('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  /* --------------------------- shared UI tokens --------------------------- */
  const cardCls =
    'bg-[#fff8e7] dark:bg-[#1c1410] rounded-3xl p-5 sm:p-6 border-2 border-[#1a1210] dark:border-orange-500 shadow-[4px_4px_0_#1a1210] dark:shadow-[4px_4px_0_#f97316]';

  const inputBase =
    'w-full p-3.5 rounded-2xl bg-white dark:bg-[#120D0A] text-[#1a1210] dark:text-white border-2 font-medium text-xs sm:text-sm outline-none transition-all';
  const inputOk =
    'border-[#1a1210]/25 dark:border-orange-500/40 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15';
  const inputErr =
    'border-red-500 bg-red-500/5 focus:border-red-500 focus:ring-4 focus:ring-red-500/15';

  const labelCls =
    'block text-[11px] font-black uppercase tracking-widest text-[#1a1210]/60 dark:text-orange-200/70 mb-1.5';

  const btnPrimary =
    'w-full h-12 rounded-2xl bg-orange-600 text-white font-extrabold uppercase tracking-wide text-sm border-2 border-[#1a1210] shadow-[3px_3px_0_#1a1210] hover:bg-orange-700 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-orange-600';

  const btnSecondary =
    'w-full h-12 rounded-2xl bg-transparent text-[#1a1210] dark:text-orange-100 font-bold uppercase tracking-wide text-[12px] border-2 border-[#1a1210] dark:border-orange-500/60 hover:bg-[#1a1210]/5 dark:hover:bg-orange-500/10 transition';

  /* --------------------------- render --------------------------- */
  return (
    <div className="min-h-screen bg-[#fff8e7] dark:bg-[#120D0A] text-[#1a1210] dark:text-gray-100 antialiased pb-44 lg:pb-32 relative z-0 transition-colors duration-500">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes fall {
              0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
            }
            .animate-fall {
              animation-name: fall;
              animation-timing-function: linear;
              animation-fill-mode: forwards;
            }
            @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
            .animate-fade-in { animation: fadeIn .25s ease-out; }
            @keyframes cartPop { from { opacity: 0; transform: scale(.96) } to { opacity: 1; transform: scale(1) } }
            .animate-cart-pop { animation: cartPop .22s cubic-bezier(.2,.8,.2,1); }
            @media (prefers-reduced-motion: reduce) {
              .animate-fall, .animate-fade-in, .animate-cart-pop { animation: none !important; }
            }
          `,
        }}
      />

      <LocationPopup forceOpen onLocated={refreshLocation} />

      {/* ============= NOTICE BANNER (replaces alert) ============= */}
      {notice && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-md pointer-events-auto animate-cart-pop">
          <div
            role="alert"
            className={`flex items-start gap-3 rounded-2xl px-4 py-3 border-2 border-[#1a1210] shadow-[3px_3px_0_#1a1210] ${
              notice.type === 'error' ? 'bg-red-500 text-white' : 'bg-[#FFC21A] text-[#1a1210]'
            }`}
          >
            <span className="text-lg leading-none mt-0.5">
              {notice.type === 'error' ? '⚠️' : 'ℹ️'}
            </span>
            <p className="flex-1 text-[12.5px] font-black leading-snug tracking-tight">
              {notice.text}
            </p>
            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Dismiss"
              className={`shrink-0 w-6 h-6 rounded-full grid place-items-center transition ${
                notice.type === 'error' ? 'bg-white/25 hover:bg-white/40' : 'bg-[#1a1210]/10 hover:bg-[#1a1210]/20'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ============= CONFETTI ============= */}
      {showOfferModal && (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
          {confettiPieces.map((p) => (
            <div
              key={p.id}
              className="absolute top-[-20px] w-3 h-3 rounded-full animate-fall"
              style={{
                left: p.left,
                backgroundColor: p.bg,
                animationDuration: p.animDuration,
                animationDelay: p.delay,
                animationIterationCount: 'infinite',
              }}
            />
          ))}
        </div>
      )}

      {/* ============= OFFER MODAL ============= */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#fff8e7] dark:bg-[#18110e] border-2 border-[#1a1210] dark:border-orange-500 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-[8px_8px_0_#1a1210] dark:shadow-[8px_8px_0_#f97316] relative space-y-4">
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white font-black text-sm uppercase shadow-[3px_3px_0_#1a1210] border-2 border-[#1a1210] animate-bounce">
              Free!
            </div>
            <h3 className={`${display.className} text-3xl font-extrabold uppercase tracking-tight text-orange-600 dark:text-orange-400`}>
              Congratulations! 🎉
            </h3>
            <p className="text-sm font-bold text-[#1a1210]/80 dark:text-orange-100/80 leading-relaxed">
              You&apos;ve unlocked a special free offer item for your order exceeding Rs. 1999. This
              exclusive item has been automatically added to your cart and will be included in your
              delivery at no extra cost. Enjoy your meal and thank you for choosing us!
            </p>
            <div className="w-32 h-32 mx-auto bg-white dark:bg-[#120D0A] rounded-2xl p-2 border-2 border-[#1a1210] dark:border-orange-500/60 shadow-[3px_3px_0_#1a1210] dark:shadow-[3px_3px_0_#f97316] flex items-center justify-center">
              <img src="/images/4.webp" alt="Free Offer Item" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-orange-600/15 dark:bg-orange-600/25 rounded-full blur-[140px]"></div>
      </div>

      {/* ============= PAGE HEADER ============= */}
      <div className="bg-[#fff8e7]/85 dark:bg-[#120D0A]/85 backdrop-blur-xl border-b-2 border-[#1a1210] dark:border-orange-500/40 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className={`${display.className} text-2xl sm:text-4xl font-extrabold tracking-tight text-[#1a1210] dark:text-white uppercase leading-none`}>
              Review Cart
            </h1>
            <p className="text-[11px] sm:text-xs text-[#1a1210]/60 dark:text-orange-200/70 font-bold uppercase tracking-widest mt-2">
              Verify your items &amp; delivery preferences
            </p>
          </div>
          <Link
            href="/menu"
            className="shrink-0 inline-flex items-center gap-1.5 bg-[#FFC21A] text-[#1a1210] px-4 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest border-2 border-[#1a1210] shadow-[3px_3px_0_#1a1210] hover:bg-amber-400 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition"
          >
            ← Back To Menu
          </Link>
        </div>
      </div>

      {/* ============= LOCATION WARNING ============= */}
      {mounted && !hasLocation && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10">
          <div className="bg-red-500/10 border-2 border-red-500/60 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-wider rounded-2xl p-3.5 text-center">
            📍 Please set your location to proceed with the order.
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start lg:items-stretch relative z-10">

        {/* ================= LEFT: ITEMS + FORM ================= */}
        <div className="lg:col-span-7 space-y-6">

          {/* ---------- Selected Items ---------- */}
          <div className={cardCls}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`${display.className} text-xl font-extrabold uppercase tracking-tight text-[#1a1210] dark:text-white`}>
                Selected Items
              </h2>
              {mounted && cartItems.length > 0 && (
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-[#FFC21A] text-[#1a1210] border-2 border-[#1a1210]">
                  {cartItems.length} item{cartItems.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {!mounted ? (
              <div className="py-6 space-y-4" aria-hidden="true">
                <div className="flex items-center gap-4 animate-pulse">
                  <div className="w-16 h-16 rounded-2xl bg-[#1a1210]/5 dark:bg-orange-500/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/2 rounded-full bg-[#1a1210]/5 dark:bg-orange-500/10" />
                    <div className="h-3 w-1/3 rounded-full bg-[#1a1210]/5 dark:bg-orange-500/10" />
                  </div>
                </div>
                <div className="flex items-center gap-4 animate-pulse">
                  <div className="w-16 h-16 rounded-2xl bg-[#1a1210]/5 dark:bg-orange-500/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 rounded-full bg-[#1a1210]/5 dark:bg-orange-500/10" />
                    <div className="h-3 w-1/4 rounded-full bg-[#1a1210]/5 dark:bg-orange-500/10" />
                  </div>
                </div>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-[#FFC21A] text-[#1a1210] rounded-2xl flex items-center justify-center mx-auto border-2 border-[#1a1210] shadow-[3px_3px_0_#1a1210]">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                  </svg>
                </div>
                <h3 className={`${display.className} text-lg font-extrabold text-[#1a1210] dark:text-white uppercase`}>
                  Your cart is empty
                </h3>
                <Link
                  href="/menu"
                  className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-extrabold px-6 py-3 rounded-2xl text-xs uppercase tracking-widest border-2 border-[#1a1210] shadow-[3px_3px_0_#1a1210] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition"
                >
                  Go To Menu
                </Link>
              </div>
            ) : (
              <div className="divide-y-2 divide-dashed divide-[#1a1210]/10 dark:divide-orange-500/15">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className={`py-4 flex items-center justify-between gap-4 ${
                      item.isFree
                        ? 'bg-[#FFC21A]/20 p-3 rounded-2xl border-2 border-[#1a1210] my-2'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-16 h-16 bg-white dark:bg-[#120D0A] rounded-2xl p-1.5 flex-shrink-0 flex items-center justify-center border-2 border-[#1a1210] dark:border-orange-500/40">
                        {item.isFree && (
                          <span className="absolute -top-2 -left-2 bg-red-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full z-10 shadow border border-[#1a1210]">
                            Free
                          </span>
                        )}
                        <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm text-[#1a1210] dark:text-white uppercase line-clamp-1">
                          {item.title}
                        </h4>
                        <span className="text-[10px] font-black text-[#1a1210]/50 dark:text-orange-200/60 uppercase tracking-widest">
                          Size: {item.size}
                        </span>
                        <div className="text-orange-600 dark:text-orange-400 font-black text-sm mt-0.5">
                          {item.isFree ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-black">
                              FREE (Rs. 0)
                            </span>
                          ) : (
                            `Rs. ${item.price * item.quantity}`
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!item.isFree ? (
                        <>
                          <div className="flex items-center bg-white dark:bg-[#120D0A] rounded-xl p-1 border-2 border-[#1a1210] dark:border-orange-500/40">
                            <button
                              onClick={() => decreaseQty(item.id)}
                              className="w-7 h-7 rounded-lg font-black text-[#1a1210] dark:text-orange-200 hover:bg-[#FFC21A] hover:text-[#1a1210] flex items-center justify-center text-sm cursor-pointer transition"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="w-7 text-center font-black text-xs text-[#1a1210] dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => increaseQty(item.id)}
                              className="w-7 h-7 rounded-lg font-black text-[#1a1210] dark:text-orange-200 hover:bg-[#FFC21A] hover:text-[#1a1210] flex items-center justify-center text-sm cursor-pointer transition"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-[#1a1210]/40 dark:text-orange-200/50 hover:text-red-500 p-1.5 transition-colors cursor-pointer"
                            aria-label="Remove item"
                          >
                            <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              ></path>
                            </svg>
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#1a1210] px-3 py-1.5 bg-[#FFC21A] rounded-xl border-2 border-[#1a1210]">
                          Auto Included
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ---------- Delivery Information ---------- */}
          <div className={cardCls}>
            <h2 className={`${display.className} text-xl font-extrabold uppercase tracking-tight text-[#1a1210] dark:text-white mb-5`}>
              Delivery Information
            </h2>

            <form onSubmit={handleConfirmOrder} className="space-y-4">
              <div id="name">
                <label className={labelCls}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  className={`${inputBase} ${errors.name ? inputErr : inputOk}`}
                />
                {errors.name && (
                  <p className="mt-1.5 text-[11px] font-black text-red-500 uppercase tracking-wider">
                    {errors.name}
                  </p>
                )}
              </div>

              <div id="phone">
                <label className={labelCls}>Phone Number (10 Digits)</label>
                <div
                  className={`flex items-center rounded-2xl overflow-hidden transition-all border-2 ${
                    errors.phone
                      ? 'border-red-500 bg-red-500/5'
                      : 'border-[#1a1210]/25 dark:border-orange-500/40 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/15'
                  }`}
                >
                  <span className="bg-[#FFC21A] text-[#1a1210] font-black px-3 py-3.5 text-xs sm:text-sm border-r-2 border-[#1a1210]/30">
                    +92
                  </span>
                  <input
                    type="text"
                    maxLength={10}
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="3001234567"
                    className="w-full p-3.5 bg-white dark:bg-[#120D0A] text-[#1a1210] dark:text-white font-medium text-xs sm:text-sm outline-none"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1.5 text-[11px] font-black text-red-500 uppercase tracking-wider">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div id="city">
                <label className={labelCls}>City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`${inputBase} cursor-pointer ${errors.city ? inputErr : inputOk}`}
                >
                  <option value="" disabled>
                    Select City
                  </option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                </select>
                {errors.city && (
                  <p className="mt-1.5 text-[11px] font-black text-red-500 uppercase tracking-wider">
                    {errors.city}
                  </p>
                )}
              </div>

              <div id="address">
                <label className={labelCls}>Delivery Address</label>
                <textarea
                  rows="2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House #, Street #, Sector / Area"
                  className={`${inputBase} resize-none ${errors.address ? inputErr : inputOk}`}
                />
                {errors.address && (
                  <p className="mt-1.5 text-[11px] font-black text-red-500 uppercase tracking-wider">
                    {errors.address}
                  </p>
                )}
              </div>

              <div>
                <label className={labelCls}>Apartment / Suite / Unit (Optional)</label>
                <input
                  type="text"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  placeholder="Apartment, suite, unit, building, floor, etc."
                  className={`${inputBase} ${inputOk}`}
                />
              </div>

              <div>
                <label className={labelCls}>Special Instructions (Suggested)</label>
                <textarea
                  rows="2"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Add any special instructions or delivery notes here..."
                  className={`${inputBase} resize-none ${inputOk}`}
                />
              </div>

              {/* Payment */}
              <div>
                <label className={labelCls}>Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-3 rounded-2xl font-black uppercase tracking-wider text-[11px] border-2 transition-all cursor-pointer ${
                      paymentMethod === 'COD'
                        ? 'bg-orange-600 text-white border-[#1a1210] shadow-[3px_3px_0_#1a1210]'
                        : 'bg-white dark:bg-[#120D0A] text-[#1a1210] dark:text-orange-200 border-[#1a1210]/25 dark:border-orange-500/40 hover:border-orange-500'
                    }`}
                  >
                    Cash On Delivery
                  </button>
                  <button
                    type="button"
                    disabled
                    className="p-3 rounded-2xl font-black uppercase tracking-wider text-[11px] border-2 border-[#1a1210]/15 dark:border-orange-500/20 bg-[#1a1210]/5 dark:bg-[#18110e] text-[#1a1210]/35 dark:text-orange-200/40 cursor-not-allowed"
                  >
                    Bank Transfer
                  </button>
                </div>
              </div>

              {/* Delivery Time */}
              <div id="schedule">
                <label className={labelCls}>Delivery Time</label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryType('ASAP');
                      setScheduledDateTime('');
                    }}
                    className={`p-3 rounded-2xl font-black uppercase tracking-wider text-[11px] border-2 transition-all cursor-pointer ${
                      deliveryType === 'ASAP'
                        ? 'bg-emerald-600 text-white border-[#1a1210] shadow-[3px_3px_0_#1a1210]'
                        : 'bg-white dark:bg-[#120D0A] text-[#1a1210] dark:text-orange-200 border-[#1a1210]/25 dark:border-orange-500/40 hover:border-orange-500'
                    }`}
                  >
                    ASAP (30-45m)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType('Scheduled')}
                    className={`p-3 rounded-2xl font-black uppercase tracking-wider text-[11px] border-2 transition-all cursor-pointer ${
                      deliveryType === 'Scheduled'
                        ? 'bg-orange-600 text-white border-[#1a1210] shadow-[3px_3px_0_#1a1210]'
                        : 'bg-white dark:bg-[#120D0A] text-[#1a1210] dark:text-orange-200 border-[#1a1210]/25 dark:border-orange-500/40 hover:border-orange-500'
                    }`}
                  >
                    Scheduled
                  </button>
                </div>

                {deliveryType === 'Scheduled' && (
                  <>
                    <input
                      type="datetime-local"
                      min={getMinDateTime()}
                      value={scheduledDateTime}
                      onChange={(e) => setScheduledDateTime(e.target.value)}
                      className={`${inputBase} font-bold ${
                        errors.schedule ? inputErr : 'border-orange-500 focus:border-orange-500'
                      }`}
                    />
                    {errors.schedule && (
                      <p className="mt-1.5 text-[11px] font-black text-red-500 uppercase tracking-wider">
                        {errors.schedule}
                      </p>
                    )}
                  </>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* ================= RIGHT: SUMMARY ================= */}
        <div className="lg:col-span-5">
          <div className="fixed bottom-0 left-0 right-0 z-40 p-3 lg:bg-transparent lg:p-0 lg:border-none lg:shadow-none lg:sticky lg:top-28">
            <div className="bg-[#18110e] dark:bg-[#1c1410] text-white rounded-3xl p-4 sm:p-6 border-2 border-[#1a1210] dark:border-orange-500 shadow-[4px_4px_0_#1a1210] dark:shadow-[4px_4px_0_#f97316] space-y-3 max-w-7xl mx-auto">

              <div className="flex items-center justify-between border-b-2 border-dashed border-orange-500/30 pb-2.5">
                <h3 className={`${display.className} text-lg font-extrabold uppercase tracking-tight text-white hidden lg:block`}>
                  Checkout Summary
                </h3>
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="lg:hidden flex items-center justify-between w-full text-[11px] font-black uppercase tracking-wider text-orange-200 active:scale-95 transition-transform cursor-pointer"
                >
                  <span>Order Summary ({cartItems.length} items)</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#FFC21A] font-black">Rs. {total}</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </button>
              </div>

              <div
                className={`space-y-2 text-xs sm:text-sm font-medium border-b-2 border-dashed border-orange-500/30 pb-3 text-orange-100/75 overflow-hidden transition-all duration-300 lg:!max-h-45 lg:!opacity-100 ${
                  showDetails
                    ? 'max-h-45 opacity-100 pt-1'
                    : 'max-h-0 opacity-0 !border-b-0 !pb-0 lg:!border-b lg:!pb-3'
                }`}
              >
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-white">Rs. {subtotal}</span>
                </div>
                {subtotal > 1999 && (
                  <div className="flex justify-between text-emerald-400 text-xs font-bold">
                    <span>Exclusive Offer Item</span>
                    <span>FREE</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (13%)</span>
                  <span className="font-bold text-white">Rs. {gstAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    Delivery Charges{' '}
                    {!hasLocation ? (
                      <span className="text-[10px] text-[#FFC21A]/80">Set location to calculate</span>
                    ) : Number.isFinite(calculatedDistance) ? (
                      <span className="text-[10px] text-[#FFC21A]">
                        ({calculatedDistance.toFixed(1)} km)
                      </span>
                    ) : null}
                  </span>
                  <span className="font-bold text-white">Rs. {deliveryCharges}</span>
                </div>
              </div>

              <div className="hidden lg:flex justify-between items-center">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-orange-200/60 block">
                    Total Amount
                  </span>
                  <span className={`${display.className} text-3xl font-extrabold text-[#FFC21A]`}>
                    Rs. {total}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmOrder}
                disabled={isSubmitting || normalCartItems.length === 0}
                className={btnPrimary + ' !bg-orange-600 hover:!bg-orange-500'}
              >
                {isSubmitting ? 'Placing order...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}