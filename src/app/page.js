'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const sliderImages = ['/1.webp', '/2.webp', '/3.webp', '/4.webp'];
  const [currentSlide, setCurrentSlide] = useState(0);

  const menuCategories = [
    "BURGERS",
    "PIZZAS",
    "SHAWARMAS",
    "PARATHAS",
    "FRIES",
    "WINGS",
    "NUGGETS",
    "DRINKS",
    "SIDE ORDERS"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 4000); 
    return () => clearInterval(timer);
  }, [sliderImages.length]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 selection:bg-orange-500 selection:text-white overflow-x-hidden antialiased relative z-0">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      {/* 1. AUTO-SCROLLING SLIDER */}
      <section className="relative w-full max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link href="/menu" className="block relative h-[320px] sm:h-[450px] md:h-[550px] rounded-[3rem] overflow-hidden transform-gpu shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] bg-[#0a0a0a] ring-1 ring-black/5 group cursor-pointer">
          {sliderImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] transform ${
                index === currentSlide 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-105'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
              {/* object-fill explicitly makes sure the image strictly fits the bounds even if stretched */}
              <img src={img} alt={`Slide ${index + 1}`} className="w-full h-full object-fill" />
            </div>
          ))}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5 z-20 bg-white/10 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/20 shadow-xl" onClick={(e) => e.stopPropagation()}>
            {sliderImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-500 ease-out ${
                  idx === currentSlide ? 'bg-orange-500 w-10 shadow-[0_0_10px_rgba(249,115,22,0.8)]' : 'bg-white/40 w-2.5 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </Link>
      </section>

      {/* 2. "EXCLUSIVE DEALS" HEADING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 text-center">
        <Link 
          href="/menu" 
          className="inline-block text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-500 hover:from-orange-600 hover:to-orange-400 transition-all duration-500 transform hover:scale-[1.02] relative group"
        >
          Exclusive Deals
          <span className="absolute -bottom-2 left-1/2 w-0 h-1.5 bg-orange-500 rounded-full transition-all duration-500 group-hover:w-full group-hover:left-0"></span>
        </Link>
        <p className="text-gray-500 text-sm sm:text-base mt-4 font-medium tracking-wide max-w-xl mx-auto">
          Handcrafted perfection delivered blazing fast to your door.
        </p>
      </section>

      {/* 3. 3 IMAGE CONTAINERS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-4">
        <div className="relative flex flex-col md:flex-row items-center justify-center min-h-[420px] gap-8 md:gap-0">
          
          {/* Left Card */}
          <Link href="/menu" className="w-full sm:w-72 md:w-80 md:absolute md:left-4 lg:left-10 z-10 transform md:-rotate-6 md:translate-y-4 hover:z-30 hover:-translate-y-4 hover:rotate-0 transition-all duration-500 bg-white rounded-[2.5rem] overflow-hidden transform-gpu shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.2)] ring-1 ring-gray-900/5 group block cursor-pointer">
            <div className="h-72 sm:h-80 bg-gray-50 relative overflow-hidden rounded-[2.5rem]">
              <img src="/5.webp" alt="Exclusive Deal 5" className="w-full h-full object-fill group-hover:scale-110 transition-transform duration-700 ease-out" />
            </div>
          </Link>

          {/* Center Card (Most Popular) */}
          <Link href="/menu" className="w-full sm:w-80 md:w-96 md:absolute z-20 transform hover:-translate-y-6 transition-all duration-500 bg-white rounded-[3rem] overflow-hidden transform-gpu shadow-[0_20px_60px_-15px_rgba(249,115,22,0.3)] hover:shadow-[0_30px_70px_-15px_rgba(249,115,22,0.4)] ring-2 ring-orange-500/50 group block cursor-pointer">
            <div className="h-80 sm:h-96 bg-gray-50 relative overflow-hidden rounded-[3rem]">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img src="/6.webp" alt="Exclusive Deal 6" className="w-full h-full object-fill group-hover:scale-110 transition-transform duration-700 ease-out" />
              <span className="absolute top-5 left-5 bg-gradient-to-r from-orange-600 to-orange-500 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg z-20 backdrop-blur-sm border border-white/20">Most Popular</span>
            </div>
          </Link>

          {/* Right Card */}
          <Link href="/menu" className="w-full sm:w-72 md:w-80 md:absolute md:right-4 lg:right-10 z-10 transform md:rotate-6 md:translate-y-4 hover:z-30 hover:-translate-y-4 hover:rotate-0 transition-all duration-500 bg-white rounded-[2.5rem] overflow-hidden transform-gpu shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.2)] ring-1 ring-gray-900/5 group block cursor-pointer">
            <div className="h-72 sm:h-80 bg-gray-50 relative overflow-hidden rounded-[2.5rem]">
              <img src="/7.webp" alt="Exclusive Deal 7" className="w-full h-full object-fill group-hover:scale-110 transition-transform duration-700 ease-out" />
            </div>
          </Link>

        </div>
      </section>

      {/* 4. "OUR SIGNATURE MENU" HEADING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 text-center">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-500">
          Our Signature Menu
        </h2>
        <div className="w-24 h-1.5 bg-gradient-to-r from-orange-500 to-orange-400 mx-auto mt-6 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]"></div>
      </section>

      {/* 5. 9 IMAGE CONTAINERS */}
      <section className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pb-28">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10">
          {[8, 9, 10, 11, 12, 13, 14, 15, 16].map((num, idx) => (
            <Link key={num} href="/menu" className="flex flex-col group cursor-pointer">
              <div className="w-full bg-white rounded-[2.5rem] p-2 overflow-hidden transform-gpu shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-500 ring-1 ring-gray-100">
                <div className="h-60 sm:h-64 rounded-[2rem] bg-gray-50 overflow-hidden transform-gpu relative">
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 z-10 pointer-events-none" />
                  <img src={`/${num}.webp`} alt={menuCategories[idx]} className="w-full h-full object-fill group-hover:scale-110 transition-transform duration-700 ease-out" />
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between px-2">
                <h3 className="text-xl font-black uppercase tracking-widest text-gray-800 group-hover:text-orange-600 transition-colors duration-300">
                  {menuCategories[idx]}
                </h3>
                <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. JUMBO DEAL BANNER */}
      <section className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pb-28">
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-[3rem] p-8 sm:p-12 md:p-16 text-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group">
          {/* Animated Background Gradients */}
          <div className="absolute -right-20 -top-20 w-[400px] h-[400px] bg-orange-500/20 rounded-full blur-[100px] pointer-events-none group-hover:bg-orange-500/30 transition-colors duration-700"></div>
          <div className="absolute -left-20 -bottom-20 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="space-y-8 text-center md:text-left z-10 max-w-xl">
            <span className="inline-block bg-white/10 backdrop-blur-xl text-orange-400 text-xs font-black px-5 py-2 rounded-full uppercase tracking-widest border border-white/10 shadow-[0_0_20px_rgba(249,115,22,0.2)]">Special Limited Offer</span>
            <div className="space-y-4">
              <h3 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">JUMBO DEAL <br/> <span className="text-orange-500">ORDER NOW!</span></h3>
              <p className="text-base sm:text-lg font-medium text-gray-400 max-w-md">
                Order any of your favourite meal worth 1999/- and get our crispy hot wings <span className="text-white font-bold">FREE</span>.
              </p>
            </div>
            <div>
              <Link href="/menu" className="inline-block bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black py-4 px-10 rounded-2xl uppercase tracking-widest shadow-[0_10px_30px_rgba(249,115,22,0.4)] transform hover:-translate-y-1 active:scale-95 transition-all">
                Claim Offer
              </Link>
            </div>
          </div>

          <Link href="/menu" className="z-10 transform md:rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-500 flex-shrink-0 cursor-pointer relative">
            <div className="absolute inset-0 bg-orange-500 rounded-[2.5rem] blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <div className="w-64 sm:w-72 md:w-80 lg:w-[400px] h-60 sm:h-72 lg:h-80 rounded-[2.5rem] overflow-hidden transform-gpu shadow-2xl border border-white/10 bg-black relative">
              <img src="/4.webp" alt="Jumbo Deal Preview" className="w-full h-full object-fill" />
            </div>
          </Link>
        </div>
      </section>

      {/* 7. 5 VIDEO CONTAINERS (REELS STYLE) */}
      <section className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pb-28">
        <div className="flex flex-col items-center mb-14">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-500">Taste The Action</h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-orange-500 to-orange-400 mt-5 rounded-full"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
          {['a', 'b', 'c', 'd', 'e'].map((vid) => (
            <div key={vid} className="aspect-[9/16] bg-gray-900 rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl relative group ring-1 ring-black/5 transform hover:-translate-y-3 transition-all duration-500 cursor-pointer transform-gpu">
              <video src={`/${vid}.webm`} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 scale-105 group-hover:scale-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-end p-5 opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100">
                  <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. NEWSLETTER SECTION */}
      <section className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Newsletter Box */}
          <div className="bg-[#050505] text-white rounded-[3rem] p-8 sm:p-12 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] flex flex-col justify-center gap-8 ring-1 ring-white/10 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px]"></div>
            <div className="relative z-10">
              <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Get Delicious Alerts</h3>
              <p className="text-sm sm:text-base text-gray-400 font-medium max-w-md">Subscribe to get special discount codes and secret menu drops directly in your inbox.</p>
            </div>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 relative z-10">
              <input 
                type="email" 
                placeholder="Enter your email address..." 
                className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:bg-white/10 focus:ring-1 focus:ring-orange-500/50 flex-grow text-sm font-medium transition-all"
              />
              <button type="submit" className="bg-white text-black hover:bg-gray-200 font-bold px-8 py-4 rounded-2xl transition-colors text-sm uppercase tracking-widest whitespace-nowrap shadow-lg">
                Subscribe
              </button>
            </form>
          </div>

          {/* Social Box */}
          <div className="bg-white text-gray-900 rounded-[3rem] p-8 sm:p-12 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.08)] flex flex-col justify-center gap-8 ring-1 ring-gray-900/5 relative overflow-hidden">
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
            <div className="relative z-10">
              <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">Follow The Vibe</h3>
              <p className="text-sm sm:text-base text-gray-500 font-medium max-w-md">Join our community across all platforms for daily cravings and food drops.</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 relative z-10">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-16 h-16 bg-gray-50 rounded-[1.25rem] flex items-center justify-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-[#1877F2] ring-1 ring-gray-200">
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-16 h-16 bg-gray-50 rounded-[1.25rem] flex items-center justify-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-[#E4405F] ring-1 ring-gray-200">
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              {/* Original Snapchat Logo Colors */}
              <a href="https://snapchat.com" target="_blank" rel="noreferrer" className="w-16 h-16 bg-[#FFFC00] rounded-[1.25rem] flex items-center justify-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-black ring-1 ring-[#FFFC00]/50">
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.965-2.906 2.167-2.906 1.022 0 1.514.767 1.514 1.694 0 1.032-.656 2.578-.995 4.012-.283 1.196.599 2.171 1.777 2.171 2.133 0 3.771-2.248 3.771-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.091.378-.293 1.189-.333 1.355-.053.218-.173.265-.398.159-1.488-.693-2.417-2.863-2.417-4.607 0-3.753 2.729-7.202 7.873-7.202 4.137 0 7.34 2.946 7.34 6.892 0 4.114-2.595 7.433-6.198 7.433-1.209 0-2.346-.628-2.735-1.365l-.744 2.835c-.27 1.035-1.001 2.33-1.493 3.123 1.112.341 2.302.527 3.535.527 6.621 0 11.988-5.367 11.988-11.987C24.005 5.367 18.638 0 12.017 0z"/></svg>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="w-16 h-16 bg-gray-50 rounded-[1.25rem] flex items-center justify-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-black ring-1 ring-gray-200">
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.242V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.853 4.853 0 0 1-1.015-.104z"/></svg>
              </a>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}