'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isOpenNow, setIsOpenNow] = useState(true);
  const [timingText, setTimingText] = useState('03:00 PM - 02:00 AM');
  
  // Modal State Management (Sign In vs Sign Up forms)
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Helper to convert '15:00' to '03:00 PM'
  const format12Hour = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const adjustedHour = h % 12 === 0 ? 12 : h % 12;
    const formattedHour = String(adjustedHour).padStart(2, '0');
    const formattedMinute = String(m).padStart(2, '0');
    return `${formattedHour}:${formattedMinute} ${period}`;
  };

  // Dynamic Restaurant Timing & Status Check from Supabase Database
  useEffect(() => {
    const checkRestaurantStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .single();

        if (data) {
          // Format times nicely with AM/PM
          if (data.opening_time && data.closing_time) {
            const formattedOpen = format12Hour(data.opening_time);
            const formattedClose = format12Hour(data.closing_time);
            setTimingText(`${formattedOpen} - ${formattedClose}`);
          }

          // If admin manually forced store closed
          if (data.is_open === false) {
            setIsOpenNow(false);
            return;
          }

          // If manual override is not forced closed, check time range dynamically
          if (data.opening_time && data.closing_time) {
            const [openH, openM] = data.opening_time.split(':').map(Number);
            const [closeH, closeM] = data.closing_time.split(':').map(Number);
            
            const openMins = openH * 60 + openM;
            const closeMins = closeH * 60 + closeM;

            const now = new Date();
            const currentMins = now.getHours() * 60 + now.getMinutes();

            let isOpen = false;
            if (openMins < closeMins) {
              isOpen = currentMins >= openMins && currentMins < closeMins;
            } else {
              // Handles overnight schedule e.g., 03:00 PM (900m) to 02:00 AM (120m)
              isOpen = currentMins >= openMins || currentMins < closeMins;
            }
            setIsOpenNow(isOpen);
            return;
          }
        }
      } catch (err) {
        // Fallback default logic if settings table is empty or missing
        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();
        setIsOpenNow(currentMins >= 900 || currentMins < 120);
      }
    };

    checkRestaurantStatus();
    const interval = setInterval(checkRestaurantStatus, 15000); // Check every 15 seconds
    return () => clearInterval(interval);
  }, []);

  // Sync Unique Cart Count & Theme State
  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = JSON.parse(localStorage.getItem('food_cart') || '[]');
      setCartCount(savedCart.length);
    };

    updateCartCount();

    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);

    if (
      localStorage.theme === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDarkMode(true);
    }
  };

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
      {/* Modern Cylindrical Floating Header */}
      <header className="sticky top-3 sm:top-5 z-50 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-white/90 dark:bg-[#120D0A]/90 backdrop-blur-2xl rounded-3xl sm:rounded-full border-2 border-orange-500/40 shadow-2xl shadow-orange-950/15 dark:shadow-orange-950/40 transition-all duration-300 overflow-hidden relative">
          
          {/* Ambient Orange Glow Effect Behind Header */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-30 bg-linear-to-r from-orange-500/20 via-amber-500/20 to-orange-500/20 blur-[50px] pointer-events-none -z-10" />

          <div className="px-4 sm:px-10 py-3 sm:py-2 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            
            <div className="flex items-center justify-between w-full sm:w-auto">
              {/* Logo & Brand Section with Circular Container */}
              <Link href="/" className="group flex items-center gap-3">
                <div className="relative">
                  <div className="absolute -inset-1 bg-linear-to-r from-orange-600 to-amber-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300" />
                  <img 
                    src="/images/logo.webp" 
                    alt="Pizzger Logo" 
                    className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white dark:border-[#1c1410] shadow-lg"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl font-black tracking-tighter text-neutral-900 dark:text-white uppercase leading-none">
                    ᑭIᘔᘔGEᖇ
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-neutral-500 dark:text-orange-200/70 uppercase tracking-widest mt-1">
                    𝕯𝖆𝖎𝖑𝖞 𝕯𝖔𝖘𝖊 𝕺𝖋 𝕯𝖊𝖑𝖎𝖈𝖎𝖔𝖚𝖘
                  </span>
                </div>
              </Link>

              {/* Mobile Action Controls Group */}
              <div className="flex items-center gap-2 sm:hidden text-neutral-800 dark:text-neutral-100">
                <Link 
                  href="/cart" 
                  className="relative w-10 h-10 rounded-full bg-neutral-100 dark:bg-[#1a120e] hover:bg-orange-500 hover:text-white flex items-center justify-center transition-all shadow-sm border border-neutral-200/60 dark:border-orange-500/20" 
                  aria-label="Cart"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-black shadow-md border border-white dark:border-[#120D0A]">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <button 
                  onClick={() => setIsMenuOpen(true)}
                  className="w-10 h-10 rounded-full bg-neutral-900 dark:bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
                  aria-label="Open Menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Timings / Status Badge (Visible on both Mobile and Desktop) */}
            <div className="flex items-center justify-center gap-2 px-4 py-1.5 sm:py-2 rounded-full bg-neutral-100/90 dark:bg-[#1a120e]/90 border border-neutral-200/60 dark:border-orange-500/20 shadow-sm w-full sm:w-auto">
              <span className={`w-2.5 h-2.5 rounded-full animate-ping shrink-0 ${isOpenNow ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <div className="flex flex-col items-center sm:items-start">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-neutral-400 dark:text-orange-200/60 leading-none">
                  {isOpenNow ? 'Timing' : 'Status'}
                </span>
                <span className={`text-[11px] sm:text-xs font-extrabold tracking-wide mt-0.5 ${isOpenNow ? 'text-neutral-800 dark:text-orange-100' : 'text-red-500 dark:text-red-400 font-black'}`}>
                  {isOpenNow ? timingText : 'We Are Closed'}
                </span>
              </div>
            </div>

            {/* Desktop Interactive Actions Section */}
            <div className="hidden sm:flex items-center gap-3.5 text-neutral-800 dark:text-neutral-100">
              
              {/* Cart Button */}
              <Link 
                href="/cart" 
                className="relative w-12 h-12 rounded-full bg-neutral-100 dark:bg-[#1a120e] hover:bg-orange-500 hover:text-white dark:hover:bg-orange-600 flex items-center justify-center transition-all duration-300 shadow-sm border border-neutral-200/60 dark:border-orange-500/20" 
                aria-label="Cart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-black shadow-lg shadow-orange-600/50 border-2 border-white dark:border-[#120D0A] animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Menu Drawer Trigger */}
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="w-12 h-12 rounded-full bg-neutral-900 dark:bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center transition-all duration-300 shadow-lg shadow-orange-600/20 active:scale-95 cursor-pointer"
                aria-label="Open Menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* Modern, Spacious Mobile Drawer / Sliding Panel */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Blur */}
          <div 
            className="absolute inset-0 bg-neutral-950/70 backdrop-blur-md transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Sliding Panel */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-8">
            <div className="w-screen max-w-md bg-white dark:bg-[#120D0A] dark:border-l dark:border-orange-500/30 shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
              
              {/* Top Section */}
              <div className="space-y-6">
                
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-orange-500/20">
                  <span className="text-xs font-black uppercase tracking-widest text-neutral-400 dark:text-orange-200/70">
                    Account & Navigation
                  </span>
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-[#1c1410] text-neutral-700 dark:text-orange-200 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                    aria-label="Close Menu"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Profile & Auth Section */}
                <div className="bg-neutral-50 dark:bg-[#18110E] rounded-3xl p-5 border border-neutral-200/60 dark:border-orange-500/20 space-y-4 shadow-inner">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold text-lg shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-neutral-900 dark:text-white uppercase leading-tight">Guest Account</h3>
                      <p className="text-xs text-neutral-500 dark:text-orange-200/60 font-medium">Sign in to track orders & rewards</p>
                    </div>
                  </div>

                  {/* Auth Form */}
                  <form onSubmit={handleAuthSubmit} className="space-y-3 pt-2">
                    {authMode === 'signup' && (
                      <input 
                        type="text" 
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#120D0A] border border-neutral-200 dark:border-orange-500/30 text-neutral-900 dark:text-white text-sm font-medium outline-none focus:border-orange-500 shadow-sm"
                      />
                    )}

                    <input 
                      type="email" 
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#120D0A] border border-neutral-200 dark:border-orange-500/30 text-neutral-900 dark:text-white text-sm font-medium outline-none focus:border-orange-500 shadow-sm"
                    />

                    <input 
                      type="password" 
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#120D0A] border border-neutral-200 dark:border-orange-500/30 text-neutral-900 dark:text-white text-sm font-medium outline-none focus:border-orange-500 shadow-sm"
                    />

                    {authMode === 'signup' && (
                      <input 
                        type="password" 
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#120D0A] border border-neutral-200 dark:border-orange-500/30 text-neutral-900 dark:text-white text-sm font-medium outline-none focus:border-orange-500 shadow-sm"
                      />
                    )}

                    <button 
                      type="submit"
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-3.5 rounded-xl uppercase tracking-wider text-xs transition-colors shadow-lg shadow-orange-600/30 cursor-pointer active:scale-95"
                    >
                      {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                    </button>
                  </form>

                  <div className="text-center pt-2 text-xs">
                    {authMode === 'signin' ? (
                      <p className="text-neutral-500 dark:text-orange-200/70">
                        Don't have an account?{' '}
                        <button 
                          type="button" 
                          onClick={() => setAuthMode('signup')} 
                          className="text-orange-600 dark:text-orange-400 font-black uppercase hover:underline cursor-pointer"
                        >
                          Sign Up
                        </button>
                      </p>
                    ) : (
                      <p className="text-neutral-500 dark:text-orange-200/70">
                        Already have an account?{' '}
                        <button 
                          type="button" 
                          onClick={() => setAuthMode('signin')} 
                          className="text-orange-600 dark:text-orange-400 font-black uppercase hover:underline cursor-pointer"
                        >
                          Sign In
                        </button>
                      </p>
                    )}
                  </div>
                </div>

                {/* Navigation Options */}
                <div className="space-y-3">
                  <Link 
                    href="/menu" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-[#18110E] hover:bg-orange-500 hover:text-white dark:hover:bg-orange-600 text-neutral-800 dark:text-orange-100 font-black text-sm uppercase tracking-wider transition-all border border-neutral-200/60 dark:border-orange-500/20 shadow-sm"
                  >
                    <span>Explore Menu</span>
                    <span className="text-lg">→</span>
                  </Link>

                  {/* Theme Switcher Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-[#18110E] text-neutral-800 dark:text-orange-100 font-black text-sm uppercase tracking-wider border border-neutral-200/60 dark:border-orange-500/20 shadow-sm">
                    <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                    <button 
                      type="button"
                      onClick={toggleTheme}
                      className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-[#120D0A] hover:bg-neutral-300 dark:hover:bg-orange-950 flex items-center justify-center transition-colors cursor-pointer text-base shadow-sm"
                      title="Toggle Theme"
                    >
                      {isDarkMode ? '🌙' : '☀️'}
                    </button>
                  </div>

                  {/* Sign Out Button */}
                  <button 
                    type="button"
                    onClick={() => alert("Signed out successfully!")}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 font-black text-sm uppercase tracking-wider transition-all cursor-pointer border border-rose-500/30 shadow-sm"
                  >
                    <span>Sign Out</span>
                    <span className="text-base">⎋</span>
                  </button>
                </div>

              </div>

              {/* Drawer Footer Links */}
              <div className="pt-6 mt-6 border-t border-neutral-100 dark:border-orange-500/20 space-y-2 text-center">
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs font-black tracking-wider uppercase text-neutral-500 dark:text-orange-200/60">
                  <Link href="/about" onClick={() => setIsMenuOpen(false)} className="hover:text-orange-500 transition-colors">About Us</Link>
                  <Link href="/terms" onClick={() => setIsMenuOpen(false)} className="hover:text-orange-500 transition-colors">Terms of Service</Link>
                  <Link href="/privacy" onClick={() => setIsMenuOpen(false)} className="hover:text-orange-500 transition-colors">Privacy Policy</Link>
                </div>
                <p className="text-[10px] font-black tracking-widest text-neutral-400 dark:text-orange-200/40 uppercase">&copy; 2026 PIZZGER | RAWALPINDI</p>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}