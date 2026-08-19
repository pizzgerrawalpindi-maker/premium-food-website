'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import LocationPopup from '@/app/components/LocationPopup'; // ⚠️ adjust this path if LocationPopup lives elsewhere in your project

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  
  // Form States
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

  // 📍 Location Gate — checkout is blocked until we have a real lat/lng on file.
  const [hasLocation, setHasLocation] = useState(() => {
    if (typeof window === 'undefined') return false;
    const lat = parseFloat(localStorage.getItem('user_detected_lat'));
    const lng = parseFloat(localStorage.getItem('user_detected_lng'));
    return Number.isFinite(lat) && Number.isFinite(lng);
  });

  const checkStoredLocation = () => {
    const lat = parseFloat(localStorage.getItem('user_detected_lat'));
    const lng = parseFloat(localStorage.getItem('user_detected_lng'));
    setHasLocation(Number.isFinite(lat) && Number.isFinite(lng));
  };

  useEffect(() => {
    window.addEventListener('locationDetected', checkStoredLocation);
    window.addEventListener('storage', checkStoredLocation);
    return () => {
      window.removeEventListener('locationDetected', checkStoredLocation);
      window.removeEventListener('storage', checkStoredLocation);
    };
  }, []);

  // Offer Modal State
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);

  // ⚡ Force Scroll to Top on Mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Load Cart Data on Mount & handle Free Item (4.webp) logic
  useEffect(() => {
    let savedCart = JSON.parse(localStorage.getItem('food_cart') || '[]');
    
    const normalItemsSubtotal = savedCart
      .filter(item => item.id !== 'free-promo-item-4')
      .reduce((acc, item) => acc + (item.price * item.quantity), 0);

    if (normalItemsSubtotal >= 2000) {
      const freeItemIndex = savedCart.findIndex(item => item.id === 'free-promo-item-4');
      if (freeItemIndex === -1) {
        savedCart.push({
          id: 'free-promo-item-4',
          title: 'Exclusive Free Offer Item',
          size: 'Standard',
          price: 0,
          quantity: 1,
          image: '/images/4.webp',
          isFree: true
        });
      } else {
        savedCart[freeItemIndex].quantity = 1;
      }
    } else {
      savedCart = savedCart.filter(item => item.id !== 'free-promo-item-4');
    }

    setCartItems(savedCart);
    localStorage.setItem('food_cart', JSON.stringify(savedCart));
  }, []);

  const updateCart = (updatedItems) => {
    const normalSubtotal = updatedItems
      .filter(item => item.id !== 'free-promo-item-4')
      .reduce((acc, item) => acc + (item.price * item.quantity), 0);

    let finalItems = [...updatedItems];

    if (normalSubtotal >= 2000) {
      const exists = finalItems.some(item => item.id === 'free-promo-item-4');
      if (!exists) {
        finalItems.push({
          id: 'free-promo-item-4',
          title: 'Exclusive Free Offer Item',
          size: 'Standard',
          price: 0,
          quantity: 1,
          image: '/images/4.webp',
          isFree: true
        });
      }
    } else {
      finalItems = finalItems.filter(item => item.id !== 'free-promo-item-4');
    }

    setCartItems(finalItems);
    localStorage.setItem('food_cart', JSON.stringify(finalItems));
    window.dispatchEvent(new Event('cartUpdated'));
    window.dispatchEvent(new Event('storage'));
  };

  const increaseQty = (id) => {
    const updated = cartItems.map(item => item.id === id && !item.isFree ? { ...item, quantity: item.quantity + 1 } : item);
    updateCart(updated);
  };

  const decreaseQty = (id) => {
    const updated = cartItems.map(item => item.id === id && !item.isFree && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item);
    updateCart(updated);
  };

  const removeItem = (id) => {
    const updated = cartItems.filter(item => item.id !== id);
    updateCart(updated);
  };

  // 📍 Pizzger Exact Branch Location (Sir Syed Chowk, Tipu Road, Rawalpindi)
  const BRANCH_LAT = 33.6041699; 
  const BRANCH_LNG = 73.0760369;

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
  };

  // 🚀 Updated Distance-Based Delivery Charges Calculation
  const getDynamicDeliveryCharges = (dist) => {
    if (!Number.isFinite(dist)) return 40;

    const km = Math.ceil(dist); 

    // 1. First 3 km at 40/km
    if (km <= 3) return km * 40;

    // 2. From 4th to 7th km (decreasing by 5 down to 20 for 7th km)
    if (km <= 7) {
        let charges = 120;
        let rate = 35;
        for (let i = 4; i <= km; i++) {
            charges += rate;
            rate -= 5;
        }
        return charges;
    }

    // 3. 8th km onwards at constant 20/km (Cost for first 7km is 230)
    return 230 + ((km - 7) * 20);
  };

  // Calculations & Distance
  const userLat = typeof window !== 'undefined' ? parseFloat(localStorage.getItem('user_detected_lat')) : 0;
  const userLng = typeof window !== 'undefined' ? parseFloat(localStorage.getItem('user_detected_lng')) : 0;
  const calculatedDistance = calculateDistance(BRANCH_LAT, BRANCH_LNG, userLat, userLng);

  const normalCartItems = cartItems.filter(item => item.id !== 'free-promo-item-4');
  const subtotal = normalCartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryCharges = cartItems.length > 0 ? getDynamicDeliveryCharges(calculatedDistance) : 0;
  
  // 13% GST
  const gstAmount = Math.round(subtotal * 0.13);
  const total = subtotal > 0 ? subtotal + gstAmount + deliveryCharges : 0;

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  const triggerConfetti = () => {
    const pieces = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      bg: ['#f97316', '#ef4444', '#eab308', '#22c55e', '#3b82f6', '#ec4899'][Math.floor(Math.random() * 6)],
      animDuration: (Math.random() * 2 + 2) + 's',
      delay: (Math.random() * 0.5) + 's'
    }));
    setConfettiPieces(pieces);
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();

    const detectedLat = parseFloat(localStorage.getItem('user_detected_lat'));
    const detectedLng = parseFloat(localStorage.getItem('user_detected_lng'));
    if (!Number.isFinite(detectedLat) || !Number.isFinite(detectedLng)) {
      alert("We cannot proceed with your order because your location is not set. Please allow location access or manually set your location to continue.");
      setHasLocation(false);
      return;
    }

    let newErrors = {};

    const isOutOfArea = localStorage.getItem('out_of_delivery_area') === 'true';
    if (isOutOfArea) {
      alert("Sorry, you are away from our delivery areas.");
      return;
    }

    if (normalCartItems.length === 0) {
      alert("Your cart is empty! Please add items from the menu first.");
      return;
    }

    if (subtotal < 600) {
      alert("Minimum order amount must be at least Rs. 600 to proceed.");
      return;
    }

    if (!city) {
      alert("Please select a city.");
      return;
    }

    try {
      const { data: settingData } = await supabase.from('settings').select('*').single();

      if (settingData) {
        if (settingData.is_open === false) {
          alert("We Are Closed by management right now! Please order during working hours.");
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
              alert(`We Are Closed right now! Our operating hours are ${settingData.opening_time} to ${settingData.closing_time}.`);
              return;
            }
          } else if (deliveryType === 'Scheduled') {
            if (!scheduledDateTime) {
              alert("Please select a valid scheduled delivery time.");
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
              alert(`Please select an order time within our operating hours range (${settingData.opening_time} to ${settingData.closing_time}).`);
              return;
            }
          }
        }
      }
    } catch (err) {
      console.error('Timing validation fallback check:', err);
    }

    if (!name.trim()) newErrors.name = true;
    if (!phone || phone.length !== 10) newErrors.phone = true;
    if (!address.trim()) newErrors.address = true;
    if (deliveryType === 'Scheduled' && !scheduledDateTime) newErrors.schedule = true;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrorElement = document.getElementById(Object.keys(newErrors)[0]);
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      try {
        const { error } = await supabase.from('orders').insert([
          {
            customer_name: name,
            phone: `+92${phone}`,
            city: city,
            address: address,
            apartment: apartment,
            detected_address: localStorage.getItem('user_detected_address') || 'Not fetched via GPS',
            latitude: parseFloat(localStorage.getItem('user_detected_lat')) || null,
            longitude: parseFloat(localStorage.getItem('user_detected_lng')) || null,
            delivery_distance: Number.isFinite(calculatedDistance) ? parseFloat(calculatedDistance.toFixed(1)) : null,
            special_instructions: specialInstructions,
            payment_method: paymentMethod,
            delivery_type: deliveryType,
            scheduled_time: deliveryType === 'Scheduled' ? scheduledDateTime : 'ASAP',
            subtotal: subtotal,
    tax_amount: gstAmount,
    delivery_charges: deliveryCharges,
    items: cartItems,
    total_amount: total,
    status: 'Pending'
          }
        ]);

        if (error) {
          alert('Failed to place order: ' + error.message);
          return;
        }

        const finalOrderObject = {
          customer_name: name,
          phone: `+92${phone}`,
          city: city,
          address: address,
          apartment: apartment,
          detected_address: localStorage.getItem('user_detected_address') || 'Not fetched via GPS',
          latitude: parseFloat(localStorage.getItem('user_detected_lat')) || null,
          longitude: parseFloat(localStorage.getItem('user_detected_lng')) || null,
          delivery_distance: Number.isFinite(calculatedDistance) ? parseFloat(calculatedDistance.toFixed(1)) : null,
          special_instructions: specialInstructions,
          payment_method: paymentMethod,
          delivery_type: deliveryType,
          scheduled_time: deliveryType === 'Scheduled' ? scheduledDateTime : 'ASAP',
         subtotal: subtotal,
    tax_amount: gstAmount,
    delivery_charges: deliveryCharges,
    items: cartItems,
    total_amount: total,
    created_at: new Date().toISOString()
        };
        localStorage.setItem('last_confirmed_order', JSON.stringify(finalOrderObject));
        
        if (subtotal > 1999) {
          triggerConfetti();
          setShowOfferModal(true);
          setTimeout(() => {
            setShowOfferModal(false);
            localStorage.removeItem('food_cart');
            window.location.href = '/receipt';
          }, 4000);
        } else {
          localStorage.removeItem('food_cart');
          window.location.href = '/receipt';
        }

      } catch (err) {
        console.error('Order submission error:', err);
        alert('Something went wrong. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#120D0A] text-gray-900 dark:text-gray-100 antialiased pb-44 lg:pb-32 relative z-0 transition-colors duration-500">

      <LocationPopup forceOpen={!hasLocation} onLocated={checkStoredLocation} />

      {showOfferModal && (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
          {confettiPieces.map(p => (
            <div
              key={p.id}
              className="absolute top-[-20px] w-3 h-3 rounded-full animate-fall"
              style={{
                left: p.left,
                backgroundColor: p.bg,
                animationDuration: p.animDuration,
                animationDelay: p.delay,
                animationIterationCount: 'infinite'
              }}
            />
          ))}
        </div>
      )}

      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#18110e] border-2 border-orange-500 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl relative space-y-4">
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white font-black text-sm uppercase shadow-lg border-2 border-white animate-bounce">
              Free!
            </div>
            <h3 className="text-2xl font-black uppercase text-orange-400 tracking-wide">Congratulations! 🎉</h3>
            <p className="text-sm font-bold text-white leading-relaxed">
              Congratulations! You've unlocked a special free offer item for your order exceeding Rs. 1999. This exclusive item has been automatically added to your cart and will be included in your delivery at no extra cost. Enjoy your meal and thank you for choosing us!
            </p>
            <div className="w-32 h-32 mx-auto bg-gray-900 rounded-2xl p-2 border border-orange-500/30 flex items-center justify-center">
              <img src="/images/4.webp" alt="Free Offer Item" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-orange-600/15 dark:bg-orange-600/25 rounded-full blur-[140px]"></div>
      </div>

      <div className="bg-white/80 dark:bg-[#120D0A]/85 backdrop-blur-xl border-b border-gray-100 dark:border-orange-500/20 shadow-xs relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Review Cart</h1>
            <p className="text-xs text-gray-500 dark:text-orange-200/70 font-medium">Verify your items and delivery preferences</p>
          </div>
          <Link href="/menu" className="bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/60 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border border-orange-500/20">
            ← Back To Menu
          </Link>
        </div>
      </div>

      {!hasLocation && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10">
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-xs font-bold rounded-2xl p-3.5 text-center">
            📍 Please set your location to proceed with the order.
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start lg:items-stretch relative z-10">
        
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-[#1c1410]/70 dark:backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-orange-500/20">
            <h2 className="text-lg font-black uppercase tracking-tight text-gray-800 dark:text-white mb-4">Selected Items</h2>
            
            {cartItems.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-16 h-16 bg-orange-50 dark:bg-orange-950/60 text-orange-500 rounded-full flex items-center justify-center mx-auto border border-orange-500/20">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                </div>
                <h3 className="text-base font-bold text-gray-800 dark:text-white">Your cart is empty</h3>
                <Link href="/menu" className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all">
                  Go To Menu
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-orange-500/15">
                {cartItems.map((item) => (
                  <div key={item.id} className={`py-4 flex items-center justify-between gap-4 ${item.isFree ? 'bg-orange-500/10 p-3 rounded-2xl border border-orange-500/30 my-2' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-[#18110e] rounded-2xl p-1 flex-shrink-0 flex items-center justify-center border border-gray-100 dark:border-orange-500/20 relative">
                        {item.isFree && (
                          <span className="absolute -top-2 -left-2 bg-red-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full z-10 shadow">Free</span>
                        )}
                        <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-gray-900 dark:text-white uppercase line-clamp-1">{item.title}</h4>
                        <span className="text-[11px] font-bold text-gray-400 dark:text-orange-200/60 uppercase tracking-widest">Size: {item.size}</span>
                        <div className="text-orange-600 dark:text-orange-400 font-black text-xs mt-0.5">
                          {item.isFree ? <span className="text-emerald-500 font-black">FREE (Rs. 0)</span> : `Rs. ${item.price * item.quantity}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {!item.isFree ? (
                        <>
                          <div className="flex items-center bg-gray-50 dark:bg-[#18110e] rounded-xl p-1 border border-gray-200 dark:border-orange-500/20">
                            <button onClick={() => decreaseQty(item.id)} className="w-7 h-7 bg-white dark:bg-[#120D0A] rounded-lg font-bold text-gray-700 dark:text-orange-200 shadow-xs flex items-center justify-center text-sm cursor-pointer">-</button>
                            <span className="w-7 text-center font-black text-xs text-gray-900 dark:text-white">{item.quantity}</span>
                            <button onClick={() => increaseQty(item.id)} className="w-7 h-7 bg-white dark:bg-[#120D0A] rounded-lg font-bold text-gray-700 dark:text-orange-200 shadow-xs flex items-center justify-center text-sm cursor-pointer">+</button>
                          </div>
                          <button onClick={() => removeItem(item.id)} className="text-gray-400 dark:text-orange-200/60 hover:text-red-500 p-1.5 transition-colors cursor-pointer">
                            <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-bold text-orange-400 px-3 py-1 bg-orange-500/20 rounded-xl">Auto Included</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-[#1c1410]/70 dark:backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-orange-500/20">
            <h2 className="text-lg font-black uppercase tracking-tight text-gray-800 dark:text-white mb-5">Delivery Information</h2>
            
            <form onSubmit={handleConfirmOrder} className="space-y-4">
              <div id="name">
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-orange-200/70 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Enter full name"
                  className={`w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-[#120D0A] text-gray-900 dark:text-white border-2 font-medium text-xs sm:text-sm outline-none transition-all ${errors.name ? 'border-red-500 bg-red-50/30' : 'border-gray-200 dark:border-orange-500/30 focus:border-orange-500'}`}
                />
              </div>

              <div id="phone">
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-orange-200/70 mb-1.5">Phone Number (10 Digits)</label>
                <div className={`flex items-center rounded-2xl bg-gray-50 dark:bg-[#120D0A] border-2 overflow-hidden transition-all ${errors.phone ? 'border-red-500 bg-red-50/30' : 'border-gray-200 dark:border-orange-500/30 focus-within:border-orange-500'}`}>
                  <span className="bg-gray-200 dark:bg-[#18110e] text-gray-700 dark:text-orange-200 font-bold px-3 py-3.5 text-xs sm:text-sm border-r border-gray-300 dark:border-orange-500/30">+92</span>
                  <input 
                    type="text" 
                    maxLength={10}
                    value={phone} 
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 10) setPhone(val);
                    }}
                    placeholder="3001234567"
                    className="w-full p-3.5 bg-transparent text-gray-900 dark:text-white font-medium text-xs sm:text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-orange-200/70 mb-1.5">City</label>
                <select 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-[#120D0A] text-gray-900 dark:text-white border-2 border-gray-200 dark:border-orange-500/30 font-medium text-xs sm:text-sm outline-none focus:border-orange-500 cursor-pointer"
                >
                  <option value="" disabled>Select City</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                </select>
              </div>

              <div id="address">
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-orange-200/70 mb-1.5">Delivery Address</label>
                <textarea 
                  rows="2"
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House #, Street #, Sector / Area"
                  className={`w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-[#120D0A] text-gray-900 dark:text-white border-2 font-medium text-xs sm:text-sm outline-none resize-none transition-all ${errors.address ? 'border-red-500 bg-red-50/30' : 'border-gray-200 dark:border-orange-500/30 focus:border-orange-500'}`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-orange-200/70 mb-1.5">Apartment / Suite / Unit (Optional)</label>
                <input 
                  type="text" 
                  value={apartment} 
                  onChange={(e) => setApartment(e.target.value)} 
                  placeholder="Apartment, suite, unit, building, floor, etc."
                  className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-[#120D0A] text-gray-900 dark:text-white border-2 border-gray-200 dark:border-orange-500/30 font-medium text-xs sm:text-sm outline-none focus:border-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-orange-200/70 mb-1.5">Special Instructions (Suggested)</label>
                <textarea 
                  rows="2"
                  value={specialInstructions} 
                  onChange={(e) => setSpecialInstructions(e.target.value)} 
                  placeholder="Add any special instructions or delivery notes here..."
                  className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-[#120D0A] text-gray-900 dark:text-white border-2 border-gray-200 dark:border-orange-500/30 font-medium text-xs sm:text-sm outline-none focus:border-orange-500 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-orange-200/70 mb-1.5">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setPaymentMethod('COD')} className={`p-3 rounded-2xl font-bold uppercase tracking-wider text-xs border-2 transition-all cursor-pointer ${paymentMethod === 'COD' ? 'bg-orange-600 text-white border-orange-600 shadow-sm' : 'bg-gray-50 dark:bg-[#120D0A] text-gray-700 dark:text-orange-200 border-gray-200 dark:border-orange-500/30'}`}>
                    Cash On Delivery
                  </button>
                  <button type="button" disabled className="p-3 rounded-2xl font-bold uppercase tracking-wider text-xs border-2 border-gray-200 dark:border-orange-500/20 bg-gray-100 dark:bg-[#18110e] text-gray-400 dark:text-gray-600 filter blur-[0.4px] cursor-not-allowed">
                    Bank Transfer
                  </button>
                </div>
              </div>

              <div id="schedule">
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-orange-200/70 mb-1.5">Delivery Time</label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button type="button" onClick={() => { setDeliveryType('ASAP'); setScheduledDateTime(''); }} className={`p-3 rounded-2xl font-bold uppercase tracking-wider text-xs border-2 transition-all cursor-pointer ${deliveryType === 'ASAP' ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-gray-50 dark:bg-[#120D0A] text-gray-700 dark:text-orange-200 border-gray-200 dark:border-orange-500/30'}`}>
                    ASAP (30-45m)
                  </button>
                  <button type="button" onClick={() => setDeliveryType('Scheduled')} className={`p-3 rounded-2xl font-bold uppercase tracking-wider text-xs border-2 transition-all cursor-pointer ${deliveryType === 'Scheduled' ? 'bg-orange-600 text-white border-orange-600 shadow-sm' : 'bg-gray-50 dark:bg-[#120D0A] text-gray-700 dark:text-orange-200 border-gray-200 dark:border-orange-500/30'}`}>
                    Scheduled
                  </button>
                </div>

                {deliveryType === 'Scheduled' && (
                  <input 
                    type="datetime-local" 
                    min={getMinDateTime()}
                    value={scheduledDateTime}
                    onChange={(e) => setScheduledDateTime(e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-[#120D0A] border-2 border-orange-500 font-bold text-xs outline-none text-gray-800 dark:text-white"
                  />
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/95 dark:bg-[#120D0A]/95 backdrop-blur-md border-t border-gray-200 dark:border-orange-500/20 shadow-2xl lg:bg-transparent lg:p-0 lg:border-none lg:shadow-none lg:sticky lg:top-28">
            <div className="bg-[#18110e] dark:bg-[#1c1410]/95 text-white rounded-3xl p-4 sm:p-6 shadow-2xl ring-1 ring-orange-500/30 space-y-3 backdrop-blur-xl max-w-7xl mx-auto">
              
              <div className="flex items-center justify-between border-b border-orange-500/20 pb-2.5">
                <h3 className="text-lg font-black uppercase tracking-tight text-white hidden lg:block">Checkout Summary</h3>
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="lg:hidden flex items-center justify-between w-full text-[11px] font-black uppercase tracking-wider text-orange-200 active:scale-95 transition-transform cursor-pointer"
                >
                  <span>Order Summary ({cartItems.length} items)</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-orange-500 font-black">Rs. {total}</span>
                    <svg className={`w-4 h-4 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </button>
              </div>
              
              <div className={`space-y-2 text-xs sm:text-sm font-medium border-b border-orange-500/20 pb-3 text-orange-100/75 overflow-hidden transition-all duration-300 lg:!max-h-45 lg:!opacity-100 ${showDetails ? 'max-h-45 opacity-100 pt-1' : 'max-h-0 opacity-0 !border-b-0 !pb-0 lg:!border-b lg:!pb-3'}`}>
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
                  <span>Delivery Charges {Number.isFinite(calculatedDistance) && <span className="text-[10px] text-orange-400">({calculatedDistance.toFixed(1)} km)</span>}</span>
                  <span className="font-bold text-white">Rs. {deliveryCharges}</span>
                </div>
              </div>

              <div className="hidden lg:flex justify-between items-center">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-orange-200/60 block">Total Amount</span>
                  <span className="text-2xl font-black text-orange-500">Rs. {total}</span>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleConfirmOrder}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black py-3 sm:py-3.5 rounded-2xl uppercase tracking-widest text-xs sm:text-sm shadow-lg shadow-orange-600/30 active:scale-95 transition-all cursor-pointer"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        .animate-fall {
          animation-name: fall;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
      `}} />

    </div>
  );
}