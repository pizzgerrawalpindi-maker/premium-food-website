'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

          {/* Sliding Panel */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm bg-white shadow-2xl p-6 sm:p-8 flex flex-col justify-between transform transition-transform ease-in-out duration-300">
              
              {/* Drawer Header */}
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black uppercase text-gray-900 tracking-tight">Navigation</span>
                  </div>
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                {/* Drawer Links */}
                <nav className="flex flex-col gap-4 mt-8">
                  <Link 
                    href="/" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-orange-50 hover:text-orange-600 font-extrabold text-sm uppercase tracking-wider transition-colors"
                  >
                    <span>Home</span>
                    <span>→</span>
                  </Link>
                  <Link 
                    href="/menu" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-orange-50 hover:text-orange-600 font-extrabold text-sm uppercase tracking-wider transition-colors"
                  >
                    <span>Full Menu</span>
                    <span>→</span>
                  </Link>
                  <Link 
                    href="/cart" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-orange-50 hover:text-orange-600 font-extrabold text-sm uppercase tracking-wider transition-colors"
                  >
                    <span>Review Cart</span>
                    <span>→</span>
                  </Link>
                  <Link 
                    href="/about" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-orange-50 hover:text-orange-600 font-extrabold text-sm uppercase tracking-wider transition-colors"
                  >
                    <span>About Us</span>
                    <span>→</span>
                  </Link>
                  <Link 
                    href="/terms" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-orange-50 hover:text-orange-600 font-extrabold text-sm uppercase tracking-wider transition-colors"
                  >
                    <span>Terms of Service</span>
                    <span>→</span>
                  </Link>
                  <Link 
                    href="/privacy" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-orange-50 hover:text-orange-600 font-extrabold text-sm uppercase tracking-wider transition-colors"
                  >
                    <span>Privacy Policy</span>
                    <span>→</span>
                  </Link>
                </nav>
              </div>

              {/* Drawer Footer info */}
              <div className="pt-6 border-t border-gray-100 text-center space-y-2">
                <p className="text-xs font-black tracking-widest text-gray-400 uppercase">PIZZGER | RAWALPINDI</p>
                <p className="text-[11px] font-bold text-orange-600">Main Tipu Road</p>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}