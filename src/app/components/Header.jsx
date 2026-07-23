'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Modal State Management (Sign In vs Sign Up forms)
  const [authMode, setAuthMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
      {/* High-Impact, Modern Sticky Header with Rich Glassmorphism & Glow */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#120D0A]/90 backdrop-blur-2xl rounded-b-[2.5rem] border-b-2 border-orange-500/40 shadow-2xl shadow-orange-950/10 dark:shadow-orange-950/30 transition-all duration-300 relative overflow-hidden">
        
        {/* Ambient Orange Glow Effect Behind Header */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[120px] bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-orange-500/20 blur-[50px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 h-24 sm:h-28 flex items-center justify-between">
          
          {/* Logo & Brand Section */}
          <Link href="/" className="group flex items-center gap-3.5">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-amber-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
              <img 
                src="/logo.webp" 
                alt="Pizzger Logo" 
                className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-white dark:border-[#1c1410] shadow-lg"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-black tracking-tighter text-neutral-900 dark:text-white uppercase leading-none">
                PIZZGER<span className="text-orange-500">.</span>
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-neutral-500 dark:text-orange-200/70 uppercase tracking-widest mt-1">
                Daily Dose Of Delicious
              </span>
            </div>
          </Link>

          {/* Interactive Actions Section */}
          <div className="flex items-center gap-3 sm:gap-4 text-neutral-800 dark:text-neutral-100">
            
            {/* Search Button */}
            <Link 
              href="/search" 
              className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-[#1a120e] hover:bg-orange-500 hover:text-white dark:hover:bg-orange-600 flex items-center justify-center transition-all duration-300 shadow-sm border border-neutral-200/60 dark:border-orange-500/20" 
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            {/* Cart Button */}
            <Link 
              href="/cart" 
              className="relative w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-[#1a120e] hover:bg-orange-500 hover:text-white dark:hover:bg-orange-600 flex items-center justify-center transition-all duration-300 shadow-sm border border-neutral-200/60 dark:border-orange-500/20" 
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
              className="w-12 h-12 rounded-2xl bg-neutral-900 dark:bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center transition-all duration-300 shadow-lg shadow-orange-600/20 active:scale-95 cursor-pointer"
              aria-label="Open Menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

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
                    className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-[#1c1410] text-neutral-700 dark:text-orange-200 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"
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