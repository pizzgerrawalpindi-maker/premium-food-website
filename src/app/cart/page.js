'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  
  // Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Islamabad');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [deliveryType, setDeliveryType] = useState('ASAP');
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [errors, setErrors] = useState({});
  const [showDetails, setShowDetails] = useState(false); // Mobile expand/collapse

  // Load Cart Data on Mount
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('food_cart') || '[]');
    setCartItems(savedCart);
  }, []);

  // Sync Storage & Header Badges
  const updateCart = (updatedItems) => {
    setCartItems(updatedItems);
    localStorage.setItem('food_cart', JSON.stringify(updatedItems));
    window.dispatchEvent(new Event('cartUpdated'));
    window.dispatchEvent(new Event('storage'));
  };

  const increaseQty = (id) => {
    const updated = cartItems.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item);
    updateCart(updated);
  };

  const decreaseQty = (id) => {
    const updated = cartItems.map(item => item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item);
    updateCart(updated);
  };

  const removeItem = (id) => {
    const updated = cartItems.filter(item => item.id !== id);
    updateCart(updated);
  };

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryCharges = cartItems.length > 0 ? 150 : 0;
  const total = subtotal > 0 ? subtotal + deliveryCharges : 0;

  // Min Time (1 Hour Ahead)
  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  // Order Submission & Auto-Scroll Validation
  const handleConfirmOrder = (e) => {
    e.preventDefault();
    let newErrors = {};

    if (cartItems.length === 0) {
      alert("Your cart is empty! Please add items from the menu first.");
      return;
    }

    // Minimum Order Amount Validation (Rs. 600)
    if (subtotal < 600) {
      alert("Minimum order amount must be at least Rs. 600 to proceed.");
      return;
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
      alert("Order Confirmed Successfully! 🎉");
      localStorage.removeItem('food_cart');
      updateCart([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 antialiased pb-32">
      
      {/* Top Banner Header */}
      <div className="bg-white border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 uppercase">Review Cart</h1>
            <p className="text-xs text-gray-500 font-medium">Verify your items and delivery preferences</p>
          </div>
          <Link href="/menu" className="bg-orange-50 text-orange-600 hover:bg-orange-100 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
            ← Back To Menu
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Items & Form (Takes 7 Cols on Desktop) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Cart Items List */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-black uppercase tracking-tight text-gray-800 mb-4">Selected Items</h2>
            
            {cartItems.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                </div>
                <h3 className="text-base font-bold text-gray-800">Your cart is empty</h3>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">Explore our menu options and add delicious items to proceed.</p>
                <Link href="/menu" className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all">
                  Go To Menu
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl p-1 flex-shrink-0 flex items-center justify-center border border-gray-100">
                        <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-gray-900 uppercase line-clamp-1">{item.title}</h4>
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Size: {item.size}</span>
                        <div className="text-orange-600 font-black text-xs mt-0.5">Rs. {item.price * item.quantity}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200">
                        <button onClick={() => decreaseQty(item.id)} className="w-7 h-7 bg-white rounded-lg font-bold text-gray-700 shadow-xs flex items-center justify-center text-sm">-</button>
                        <span className="w-7 text-center font-black text-xs">{item.quantity}</span>
                        <button onClick={() => increaseQty(item.id)} className="w-7 h-7 bg-white rounded-lg font-bold text-gray-700 shadow-xs flex items-center justify-center text-sm">+</button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 p-1.5 transition-colors">
                        <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delivery Details Form */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-black uppercase tracking-tight text-gray-800 mb-5">Delivery Information</h2>
            
            <form onSubmit={handleConfirmOrder} className="space-y-4">
              
              <div id="name">
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Enter full name"
                  className={`w-full p-3.5 rounded-2xl bg-gray-50 border-2 font-medium text-xs sm:text-sm outline-none transition-all ${errors.name ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-orange-500'}`}
                />
              </div>

              <div id="phone">
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1.5">Phone Number (10 Digits)</label>
                <div className={`flex items-center rounded-2xl bg-gray-50 border-2 overflow-hidden transition-all ${errors.phone ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus-within:border-orange-500'}`}>
                  <span className="bg-gray-200 text-gray-700 font-bold px-3 py-3.5 text-xs sm:text-sm border-r border-gray-300">+92</span>
                  <input 
                    type="text" 
                    maxLength={10}
                    value={phone} 
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 10) setPhone(val);
                    }}
                    placeholder="3001234567"
                    className="w-full p-3.5 bg-transparent font-medium text-xs sm:text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1.5">City</label>
                <select 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-gray-50 border-2 border-gray-200 font-medium text-xs sm:text-sm outline-none focus:border-orange-500"
                >
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                </select>
              </div>

              <div id="address">
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1.5">Delivery Address</label>
                <textarea 
                  rows="2"
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House #, Street #, Sector / Area"
                  className={`w-full p-3.5 rounded-2xl bg-gray-50 border-2 font-medium text-xs sm:text-sm outline-none resize-none transition-all ${errors.address ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-orange-500'}`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1.5">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setPaymentMethod('COD')} className={`p-3 rounded-2xl font-bold uppercase tracking-wider text-xs border-2 transition-all ${paymentMethod === 'COD' ? 'bg-orange-600 text-white border-orange-600 shadow-sm' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                    Cash On Delivery
                  </button>
                  <button type="button" disabled className="p-3 rounded-2xl font-bold uppercase tracking-wider text-xs border-2 border-gray-200 bg-gray-100 text-gray-400 filter blur-[0.4px] cursor-not-allowed">
                    Bank Transfer
                  </button>
                </div>
              </div>

              <div id="schedule">
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-500 mb-1.5">Delivery Time</label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button type="button" onClick={() => { setDeliveryType('ASAP'); setScheduledDateTime(''); }} className={`p-3 rounded-2xl font-bold uppercase tracking-wider text-xs border-2 transition-all ${deliveryType === 'ASAP' ? 'bg-green-600 text-white border-green-600 shadow-sm' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                    ASAP (30-45m)
                  </button>
                  <button type="button" onClick={() => setDeliveryType('Scheduled')} className={`p-3 rounded-2xl font-bold uppercase tracking-wider text-xs border-2 transition-all ${deliveryType === 'Scheduled' ? 'bg-orange-600 text-white border-orange-600 shadow-sm' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                    Scheduled
                  </button>
                </div>

                {deliveryType === 'Scheduled' && (
                  <input 
                    type="datetime-local" 
                    min={getMinDateTime()}
                    value={scheduledDateTime}
                    onChange={(e) => setScheduledDateTime(e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-gray-50 border-2 border-orange-500 font-bold text-xs outline-none text-gray-800"
                  />
                )}
              </div>

            </form>
          </div>

        </div>

        {/* Right Side / Mobile Bottom: Correctly Sticky Calculator (Takes 5 Cols on Desktop) */}
        <div className="lg:col-span-5 lg:self-stretch">
          {/* Desktop par sticky right side, Mobile par bottom fixed clean bar with expand/collapse */}
          <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg lg:bg-transparent lg:p-0 lg:border-none lg:shadow-none lg:sticky lg:top-24">
            
            <div className="bg-[#0f172a] text-white rounded-3xl p-5 sm:p-6 shadow-2xl ring-1 ring-white/10 space-y-4">
              
              {/* Header row: title on desktop, expand/collapse toggle on mobile */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-lg font-black uppercase tracking-tight text-white hidden lg:block">Checkout Summary</h3>

                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="lg:hidden flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-gray-300 active:scale-95 transition-transform"
                >
                  Order Details
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </div>
              
              {/* Details: always visible on desktop, toggle-controlled on mobile */}
              <div
                className={`space-y-2 text-xs sm:text-sm font-medium border-b border-white/10 pb-4 text-gray-300 overflow-hidden transition-all duration-300 lg:!max-h-40 lg:!opacity-100 ${
                  showDetails ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 !border-b-0 !pb-0 lg:!border-b lg:!pb-4'
                }`}
              >
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-white">Rs. {subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="font-bold text-white">Rs. {deliveryCharges}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] lg:text-xs font-black uppercase tracking-wider text-gray-400 block">Total Amount</span>
                  <span className="text-xl sm:text-2xl font-black text-orange-500">Rs. {total}</span>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleConfirmOrder}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black py-3.5 rounded-2xl uppercase tracking-widest text-xs sm:text-sm shadow-lg shadow-orange-600/30 active:scale-95 transition-all cursor-pointer"
              >
                Confirm Order
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}