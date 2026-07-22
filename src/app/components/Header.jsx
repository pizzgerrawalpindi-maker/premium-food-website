'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Modal State Management (Sign In vs Sign Up forms)
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Sync Unique Cart Count from localStorage across components
  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = JSON.parse(localStorage.getItem('food_cart') || '[]');
      setCartCount(savedCart.length);
    };

    updateCartCount();

    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (authMode === 'signin') {
      alert(`Signing in with Email: ${email}`);
    } else {
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      alert(`Signing up Account for: ${name}`);
    }
  };

  return (
    <>
      {/* Ultra Premium Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="max-w-[85rem] mx-auto px-6 sm:px-8 lg:px-10 h-24 flex items-center justify-between">
          
          {/* Left Side: Logo & Brand with Tagline */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-amber-500 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-300"></div>
              <img 
                src="/logo.webp" 
                alt="Logo" 
                className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full object-cover border-2 border-white shadow-md"
              />
            </div>
            <div className="flex flex-col">
              <Link href="/" className="text-2xl sm:text-3xl font-black uppercase tracking-tighter text-gray-900 leading-none font-sans hover:text-orange-600 transition-colors">
                PIZZGER<span className="text-orange-600">.</span>
              </Link>
              <span className="text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                Daily Dose Of Delicious
              </span>
            </div>
          </div>

          {/* Right Side: Interactive Icons */}
          <div className="flex items-center gap-3 sm:gap-6 text-gray-800">
            
            {/* Search Icon */}
            <Link href="/search" className="w-11 h-11 rounded-2xl bg-gray-50 hover:bg-orange-50 hover:text-orange-600 flex items-center justify-center transition-all duration-200" title="Search">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            {/* Cart Icon with Dynamic Badge */}
            <Link href="/cart" className="relative w-11 h-11 rounded-2xl bg-gray-50 hover:bg-orange-50 hover:text-orange-600 flex items-center justify-center transition-all duration-200" title="Cart">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black shadow-lg shadow-orange-600/40 border-2 border-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Hamburger / Slider Modal Trigger Button */}
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="w-11 h-11 rounded-2xl bg-gray-900 text-white hover:bg-orange-600 flex items-center justify-center transition-all duration-200 shadow-md active:scale-95 cursor-pointer"
              title="Menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

          </div>

        </div>
      </header>

      {/* Mobile / Slider Modal Drawer Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop blur */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          ></div>

          {/* Sliding Panel - Perfectly proportioned to never overflow */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm bg-white shadow-2xl p-4 sm:p-5 flex flex-col justify-between transform transition-transform ease-in-out duration-300">
              
              {/* Top Section */}
              <div className="space-y-2.5">
                
                {/* Drawer Header with Close Button */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Account & Menu</span>
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                {/* Profile Section & Auth Form (Ultra Compact & Clean) */}
                <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 text-center space-y-2">
                  
                  {/* Profile Icon */}
                  <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>

                  <div>
                    <h3 className="font-black text-xs text-gray-900 uppercase leading-tight">Guest Account</h3>
                    <p className="text-[9px] text-gray-400 font-medium">Sign in to track orders & rewards</p>
                  </div>

                  {/* Dynamic Form (Sign In / Sign Up) */}
                  <form onSubmit={handleAuthSubmit} className="space-y-1.5">
                    {authMode === 'signup' && (
                      <input 
                        type="text" 
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full p-2 rounded-lg bg-white border border-gray-200 text-[11px] font-medium outline-none focus:border-orange-500"
                      />
                    )}

                    <input 
                      type="email" 
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full p-2 rounded-lg bg-white border border-gray-200 text-[11px] font-medium outline-none focus:border-orange-500"
                    />

                    <input 
                      type="password" 
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full p-2 rounded-lg bg-white border border-gray-200 text-[11px] font-medium outline-none focus:border-orange-500"
                    />

                    {authMode === 'signup' && (
                      <input 
                        type="password" 
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full p-2 rounded-lg bg-white border border-gray-200 text-[11px] font-medium outline-none focus:border-orange-500"
                      />
                    )}

                    <button 
                      type="submit"
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-2 rounded-lg uppercase tracking-wider text-[11px] transition-colors shadow-sm shadow-orange-600/30 cursor-pointer"
                    >
                      {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                    </button>
                  </form>

                  {/* Toggle Sign In / Sign Up text */}
                  <div className="text-[10px]">
                    {authMode === 'signin' ? (
                      <p className="text-gray-500">
                        Don't have an account?{' '}
                        <button 
                          type="button" 
                          onClick={() => setAuthMode('signup')} 
                          className="text-orange-600 font-extrabold uppercase hover:underline cursor-pointer"
                        >
                          Sign Up
                        </button>
                      </p>
                    ) : (
                      <p className="text-gray-500">
                        Already have an account?{' '}
                        <button 
                          type="button" 
                          onClick={() => setAuthMode('signin')} 
                          className="text-orange-600 font-extrabold uppercase hover:underline cursor-pointer"
                        >
                          Sign In
                        </button>
                      </p>
                    )}
                  </div>

                </div>

                {/* Navigation Options */}
                <div className="space-y-1.5">
                  <Link 
                    href="/menu" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between p-2 rounded-xl bg-gray-50 hover:bg-orange-50 hover:text-orange-600 font-extrabold text-[11px] uppercase tracking-wider transition-colors"
                  >
                    <span>Explore Menu</span>
                    <span>→</span>
                  </Link>

                  {/* Dark / Light Mode Switch */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 font-extrabold text-[11px] uppercase tracking-wider text-gray-700">
                    <span>Dark / Light Mode</span>
                    <button 
                      type="button"
                      onClick={() => alert("Theme switch toggled!")}
                      className="w-6 h-6 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors cursor-pointer text-xs"
                      title="Toggle Theme"
                    >
                      ☀️
                    </button>
                  </div>

                  {/* Sign Out Button */}
                  <button 
                    type="button"
                    onClick={() => alert("Signed out successfully!")}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <span>Sign Out</span>
                    <span>⎋</span>
                  </button>
                </div>

              </div>

              {/* End Section: Footer Text Links */}
              <div className="pt-2 mt-2 border-t border-gray-100 space-y-1.5 text-center">
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[9px] font-black tracking-wider uppercase text-gray-500">
                  <Link href="/about" onClick={() => setIsMenuOpen(false)} className="hover:text-orange-600 transition-colors">About Us</Link>
                  <Link href="/terms" onClick={() => setIsMenuOpen(false)} className="hover:text-orange-600 transition-colors">Terms of Service</Link>
                  <Link href="/privacy" onClick={() => setIsMenuOpen(false)} className="hover:text-orange-600 transition-colors">Privacy Policy</Link>
                </div>
                <p className="text-[8px] font-black tracking-widest text-gray-400 uppercase">&copy; 2026 PIZZGER | RAWALPINDI</p>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}