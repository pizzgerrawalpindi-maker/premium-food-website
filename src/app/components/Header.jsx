'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [cartCount, setCartCount] = useState(0);

  // Sync Unique Cart Count from localStorage across components
  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = JSON.parse(localStorage.getItem('food_cart') || '[]');
      setCartCount(savedCart.length); // Unique items count (not quantity sum)
    };

    // Initial check
    updateCartCount();

    // Listen to storage events
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md rounded-b-3xl shadow-xl border-b-2 border-orange-500 shadow-orange-500/40">
      <div className="max-w-[85rem] mx-auto px-6 sm:px-8 lg:px-10 h-24 flex items-center justify-between">
        
        {/* Left Side: Logo & Brand with Tagline */}
        <div className="flex items-center gap-4 ml-2">
          <img 
            src="/logo.webp" 
            alt="Logo" 
            className="w-13 h-13 rounded-full object-cover border-2 border-orange-500 shadow-md"
          />
          <div className="flex flex-col">
            <Link href="/" className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-gray-900 leading-none font-sans rounded-lg">
              PIZZGER
            </Link>
            <span className="text-[10px] sm:text-[11px] font-medium text-orange-600 tracking-wide mt-1">
              Your Daily Dose Of Delicious
            </span>
          </div>
        </div>

        {/* Right Side: Icons */}
        <div className="flex items-center gap-4 sm:gap-8 text-gray-800 mr-2">
          {/* Search Page / Icon */}
          <Link href="/search" className="hover:text-orange-600 transition-colors p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>

          {/* Cart Page with Live Unique Items Count */}
          <Link href="/cart" className="relative hover:text-orange-600 transition-colors p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] sm:text-xs w-5 h-5 flex items-center justify-center rounded-full font-black shadow-md border border-white">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Hamburger Menu */}
          <button className="hover:text-orange-600 transition-colors p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

      </div>
    </header>
  );
}