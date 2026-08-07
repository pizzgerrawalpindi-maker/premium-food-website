'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

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
  const [showDetails, setShowDetails] = useState(false); // Mobile expand/collapse

  // Offer Modal State
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);

  // ⚡ Force Scroll to Top on Mount (Fixes opening at footer issue)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Load Cart Data on Mount & handle Free Item (4.webp) logic
  useEffect(() => {
    let savedCart = JSON.parse(localStorage.getItem('food_cart') || '[]');
    
    // Calculate subtotal excluding any existing free item to check threshold
    const normalItemsSubtotal = savedCart
      .filter(item => item.id !== 'free-promo-item-4')
      .reduce((acc, item) => acc + (item.price * item.quantity), 0);

    if (normalItemsSubtotal >= 2000) {
      // Check if free item already exists
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
        savedCart[freeItemIndex].quantity = 1; // ensure qty is 1
      }
    } else {
      // Remove free item if subtotal drops below 2000
      savedCart = savedCart.filter(item => item.id !== 'free-promo-item-4');
    }

    setCartItems(savedCart);
    localStorage.setItem('food_cart', JSON.stringify(savedCart));
  }, []);

  // Sync Storage & Header Badges with Free Item Rule
  const updateCart = (updatedItems) => {
    // Recalculate normal subtotal
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

  // Calculations (Free item price is 0)
  const normalCartItems = cartItems.filter(item => item.id !== 'free-promo-item-4');
  const subtotal = normalCartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryCharges = cartItems.length > 0 ? 150 : 0;
  const total = subtotal > 0 ? subtotal + deliveryCharges : 0;

  // Min Time (1 Hour Ahead)
  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  // Trigger Confetti effect
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

  // Order Submission & Restaurant Timing Validation (03:00 PM to 02:00 AM)
  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    let newErrors = {};

    if (normalCartItems.length === 0) {
      alert("Your cart is empty! Please add items from the menu first.");
      return;
    }

    // Minimum Order Amount Validation (Rs. 600)
    if (subtotal < 600) {
      alert("Minimum order amount must be at least Rs. 600 to proceed.");
      return;
    }

    if (!city) {
      alert("Please select a city.");
      return;
    }

    // ⚡ Restaurant Operating Hours Validation (03:00 PM to 02:00 AM)
    if (deliveryType === 'ASAP') {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const isCurrentlyOpen = currentMinutes >= 900 || currentMinutes < 120; // 900 mins = 3 PM, 120 mins = 2 AM
      
      if (!isCurrentlyOpen) {
        alert("We Are Closed right now! Our operating hours are 03:00 PM to 02:00 AM. Please choose a scheduled time within our working hours.");
        return;
      }
    } else if (deliveryType === 'Scheduled') {
      if (!scheduledDateTime) {
        alert("Please select a valid scheduled delivery time.");
        return;
      }

      const selectedDate = new Date(scheduledDateTime);
      const selectedMinutes = selectedDate.getHours() * 60 + selectedDate.getMinutes();
      const isScheduledWithinHours = selectedMinutes >= 900 || selectedMinutes < 120;

      if (!isScheduledWithinHours) {
        alert("Please select an order time within our operating hours range (03:00 PM to 02:00 AM).");
        return;
      }
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
            special_instructions: specialInstructions,
            payment_method: paymentMethod,
            delivery_type: deliveryType,
            scheduled_time: deliveryType === 'Scheduled' ? scheduledDateTime : 'ASAP',
            items: cartItems,
            total_amount: total,
            status: 'Pending'
          }
        ]);

        if (error) {
          alert('Failed to place order: ' + error.message);
          return;
        }

        // Save confirmed order data locally so receipt page can read it
        const finalOrderObject = {
          customer_name: name,
          phone: `+92${phone}`,
          city: city,
          address: address,
          apartment: apartment,
          special_instructions: specialInstructions,
          payment_method: paymentMethod,
          delivery_type: deliveryType,
          scheduled_time: deliveryType === 'Scheduled' ? scheduledDateTime : 'ASAP',
          items: cartItems,
          total_amount: total,
          created_at: new Date().toISOString()
        };
        localStorage.setItem('last_confirmed_order', JSON.stringify(finalOrderObject));

        // Check if subtotal is above 1999 to show special celebration popup
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
      
      {/* Confetti Animation Container */}
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

      {/* Celebration Modal for Subtotal > 1999 */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#18110e] border-2 border-orange-500 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl relative space-y-4">
            
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white font-black text-sm uppercase shadow-lg border-2 border-white animate-bounce">
              Free!
            </div>

            <h3 className="text-2xl font-black uppercase text-orange-400 tracking-wide">Congratulations! 🎉</h3>
            <p className="text-sm font-bold text-white leading-relaxed">
              Mubarak ho, aapne hamari exclusive offer avail kr li ha!
            </p>

            <div className="w-32 h-32 mx-auto bg-gray-900 rounded-2xl p-2 border border-orange-500/30 flex items-center justify-center">
              <img src="/images/4.webp" alt="Free Offer Item" className="w-full h-full object-contain" />
            </div>

            <p className="text-xs text-orange-200/70 font-medium">
              Your free item has been successfully included with your order. Redirecting in 5 seconds...
            </p>
          </div>
        </div>
      )}

      {/* Background Central High-Intensity Orange Light Reflection (Isolated in overflow-hidden container) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-orange-600/15 dark:bg-orange-600/25 rounded-full blur-[140px]"></div>
      </div>

      {/* Top Banner Header */}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start lg:items-stretch relative z-10">
        
        {/* Left Side: Items & Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Cart Items List */}
          <div className="bg-white dark:bg-[#1c1410]/70 dark:backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-[0_20px_50px_-10px_rgba(234,88,12,0.15)] border border-gray-100 dark:border-orange-500/20">
            <h2 className="text-lg font-black uppercase tracking-tight text-gray-800 dark:text-white mb-4">Selected Items</h2>
            
            {cartItems.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-16 h-16 bg-orange-50 dark:bg-orange-950/60 text-orange-500 rounded-full flex items-center justify-center mx-auto border border-orange-500/20">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                </div>
                <h3 className="text-base font-bold text-gray-800 dark:text-white">Your cart is empty</h3>
                <p className="text-xs text-gray-400 dark:text-orange-200/60 max-w-xs mx-auto">Explore our menu options and add delicious items to proceed.</p>
                <Link href="/menu" className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-orange-600/30">
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

          {/* Delivery Details Form */}
          <div className="bg-white dark:bg-[#1c1410]/70 dark:backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-sm dark:shadow-[0_20px_50px_-10px_rgba(234,88,12,0.15)] border border-gray-100 dark:border-orange-500/20">
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

        {/* Right Side / Sticky Laptop Calculator & Mobile Fixed Bottom Bar */}
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
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </button>
              </div>
              
              <div
                className={`space-y-2 text-xs sm:text-sm font-medium border-b border-orange-500/20 pb-3 text-orange-100/75 overflow-hidden transition-all duration-300 lg:!max-h-40 lg:!opacity-100 ${
                  showDetails ? 'max-h-40 opacity-100 pt-1' : 'max-h-0 opacity-0 !border-b-0 !pb-0 lg:!border-b lg:!pb-3'
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
                  <span>Delivery Charges</span>
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