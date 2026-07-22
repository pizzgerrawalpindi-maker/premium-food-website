'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa';
import { SiSnapchat } from 'react-icons/si';

export default function Home() {
  const sliderData = [
    { img: '/1.webp', link: '/menu' },
    { img: '/2.webp', link: '/menu#midnight-deals' },
    { img: '/3.webp', link: '/menu#birthday-offers' },
    { img: '/4.webp', link: '/menu#event-section' }
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  const menuCategories = [
    { name: "BURGERS", id: "burgers" },
    { name: "PIZZAS", id: "pizzas" },
    { name: "SHAWARMAS", id: "shawarmas" },
    { name: "PARATHAS", id: "parathas" },
    { name: "FRIES", id: "fries" },
    { name: "WINGS", id: "side-orders" },
    { name: "NUGGETS", id: "side-orders" },
    { name: "DRINKS", id: "drinks" },
    { name: "SIDE ORDERS", id: "side-orders" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 4000); 
    return () => clearInterval(timer);
  }, [sliderData.length]);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletterEmail)) {
      setNewsletterMsg("Please enter a CORRECT email address!");
      setNewsletterSuccess(false);
      return;
    }
    setNewsletterMsg("You are added to our list! 🎉 Enjoy your delicious updates.");
    setNewsletterSuccess(true);
    setNewsletterEmail('');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#120D0A] text-gray-900 dark:text-gray-100 selection:bg-orange-500 selection:text-white overflow-x-hidden antialiased relative z-0 transition-colors duration-500 animate-[fadeIn_0.5s_cubic-bezier(0.16,1,0.3,1)]">
      
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Background Ambient Orange Glow Reflections */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-orange-600/15 dark:bg-orange-600/20 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="absolute top-[40%] left-10 w-[400px] h-[400px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute top-[70%] right-10 w-[500px] h-[500px] bg-orange-500/15 rounded-full blur-[150px] pointer-events-none -z-10"></div>

      {/* 1. AUTO-SCROLLING SLIDER */}
      <section className="relative w-full max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="relative h-[280px] sm:h-[450px] md:h-[550px] rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden transform-gpu shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] bg-[#0a0a0a] ring-1 ring-black/5 dark:ring-orange-500/30">
          {sliderData.map((item, index) => (
            <Link
              key={index}
              href={item.link}
              className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] transform cursor-pointer ${
                index === currentSlide 
                  ? 'opacity-100 scale-100 pointer-events-auto' 
                  : 'opacity-0 scale-105 pointer-events-none'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
              <img src={item.img} alt={`Slide ${index + 1}`} className="w-full h-full object-fill" />
            </Link>
          ))}
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-white/10 dark:bg-black/30 backdrop-blur-xl px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border border-white/20 dark:border-orange-500/20 shadow-xl" onClick={(e) => e.stopPropagation()}>
            {sliderData.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-500 ease-out cursor-pointer ${
                  idx === currentSlide ? 'bg-orange-500 w-8 sm:w-10 shadow-[0_0_10px_rgba(249,115,22,0.8)]' : 'bg-white/40 w-2 sm:w-2.5 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. "EXCLUSIVE DEALS" HEADING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-8 sm:pb-12 text-center">
        <Link 
          href="/menu#exclusive-deals" 
          className="inline-block text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-500 dark:from-white dark:via-orange-100 dark:to-orange-300 hover:from-orange-600 hover:to-orange-400 transition-all duration-500 transform hover:scale-[1.02] relative group"
        >
          Exclusive Deals
          <span className="absolute -bottom-2 left-1/2 w-0 h-1.5 bg-orange-500 rounded-full transition-all duration-500 group-hover:w-full group-hover:left-0"></span>
        </Link>
        <p className="text-gray-500 dark:text-orange-200/70 text-xs sm:text-base mt-3 sm:mt-4 font-medium tracking-wide max-w-xl mx-auto">
          Handcrafted perfection delivered blazing fast to your door.
        </p>
      </section>

      {/* 3. 3 IMAGE CONTAINERS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 pt-4">
        <div className="relative flex flex-col md:flex-row items-center justify-center min-h-[420px] gap-8 md:gap-0">
          
          {/* Left Card -> Midnight Deals */}
          <Link href="/menu#midnight-deals" className="w-full sm:w-72 md:w-80 md:absolute md:left-4 lg:left-10 z-10 transform md:-rotate-6 md:translate-y-4 hover:z-30 hover:-translate-y-4 hover:rotate-0 transition-all duration-500 bg-white dark:bg-[#1c1410]/70 dark:backdrop-blur-xl rounded-[2.5rem] overflow-hidden transform-gpu shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_-10px_rgba(234,88,12,0.15)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.2)] ring-1 ring-gray-900/5 dark:ring-orange-500/20 group block cursor-pointer">
            <div className="h-64 sm:h-72 md:h-80 bg-gray-50 dark:bg-[#18110e] relative overflow-hidden rounded-[2.5rem]">
              <img src="/5.webp" alt="Exclusive Deal 5" className="w-full h-full object-fill group-hover:scale-110 transition-transform duration-700 ease-out" />
            </div>
          </Link>

          {/* Center Card -> Events */}
          <Link href="/menu#event-section" className="w-full sm:w-80 md:w-96 md:absolute z-20 transform hover:-translate-y-6 transition-all duration-500 bg-white dark:bg-[#1c1410]/80 dark:backdrop-blur-xl rounded-[3rem] overflow-hidden transform-gpu shadow-[0_20px_60px_-15px_rgba(249,115,22,0.3)] hover:shadow-[0_30px_70px_-15px_rgba(249,115,22,0.4)] ring-2 ring-orange-500/50 group block cursor-pointer">
            <div className="h-72 sm:h-80 md:h-96 bg-gray-50 dark:bg-[#18110e] relative overflow-hidden rounded-[3rem]">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img src="/6.webp" alt="Exclusive Deal 6" className="w-full h-full object-fill group-hover:scale-110 transition-transform duration-700 ease-out" />
              <span className="absolute top-5 left-5 bg-gradient-to-r from-orange-600 to-orange-500 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg z-20 backdrop-blur-sm border border-white/20">Most Popular</span>
            </div>
          </Link>

          {/* Right Card -> Birthday Offers */}
          <Link href="/menu#birthday-offers" className="w-full sm:w-72 md:w-80 md:absolute md:right-4 lg:right-10 z-10 transform md:rotate-6 md:translate-y-4 hover:z-30 hover:-translate-y-4 hover:rotate-0 transition-all duration-500 bg-white dark:bg-[#1c1410]/70 dark:backdrop-blur-xl rounded-[2.5rem] overflow-hidden transform-gpu shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_-10px_rgba(234,88,12,0.15)] hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.2)] ring-1 ring-gray-900/5 dark:ring-orange-500/20 group block cursor-pointer">
            <div className="h-64 sm:h-72 md:h-80 bg-gray-50 dark:bg-[#18110e] relative overflow-hidden rounded-[2.5rem]">
              <img src="/7.webp" alt="Exclusive Deal 7" className="w-full h-full object-fill group-hover:scale-110 transition-transform duration-700 ease-out" />
            </div>
          </Link>

        </div>
      </section>

      {/* 4. "OUR SIGNATURE MENU" HEADING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-12 sm:pb-16 text-center">
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-500 dark:from-white dark:via-orange-100 dark:to-orange-300">
          Our Signature Menu
        </h2>
        <div className="w-20 sm:w-24 h-1.5 bg-gradient-to-r from-orange-500 to-orange-400 mx-auto mt-4 sm:mt-6 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]"></div>
      </section>

      {/* 5. 9 IMAGE CONTAINERS */}
      <section className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10">
          {[8, 9, 10, 11, 12, 13, 14, 15, 16].map((num, idx) => (
            <Link key={num} href={`/menu#${menuCategories[idx].id}`} className="flex flex-col group cursor-pointer">
              <div className="w-full bg-white dark:bg-[#1c1410]/70 dark:backdrop-blur-xl rounded-[2.5rem] p-2 overflow-hidden transform-gpu shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_10px_30px_rgba(234,88,12,0.1)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-500 ring-1 ring-gray-100 dark:ring-orange-500/20">
                <div className="h-56 sm:h-64 rounded-[2rem] bg-gray-50 dark:bg-[#18110e] overflow-hidden transform-gpu relative">
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 z-10 pointer-events-none" />
                  <img src={`/${num}.webp`} alt={menuCategories[idx].name} className="w-full h-full object-fill group-hover:scale-110 transition-transform duration-700 ease-out" />
                </div>
              </div>
              <div className="mt-4 sm:mt-5 flex items-center justify-between px-2">
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-widest text-gray-800 dark:text-orange-100 group-hover:text-orange-600 transition-colors duration-300">
                  {menuCategories[idx].name}
                </h3>
                <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-[#1c1410] dark:border dark:border-orange-500/30 text-orange-500 flex items-center justify-center opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. JUMBO DEAL BANNER */}
      <section className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
        <div className="bg-gradient-to-br from-[#1c1410] via-[#120D0A] to-[#1a120e] dark:border dark:border-orange-500/30 rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-12 md:p-16 text-white shadow-[0_20px_50px_-10px_rgba(234,88,12,0.2)] flex flex-col md:flex-row items-center justify-between gap-8 sm:gap-12 relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-[400px] h-[400px] bg-orange-600/30 rounded-full blur-[100px] pointer-events-none group-hover:bg-orange-600/40 transition-colors duration-700"></div>
          <div className="absolute -left-20 -bottom-20 w-[300px] h-[300px] bg-amber-600/20 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="space-y-6 sm:space-y-8 text-center md:text-left z-10 max-w-xl">
            <span className="inline-block bg-orange-500/20 backdrop-blur-xl text-orange-400 text-xs font-black px-5 py-2 rounded-full uppercase tracking-widest border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.2)]">Special Limited Offer</span>
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-orange-200">JUMBO DEAL <br/> <span className="text-orange-500">ORDER NOW!</span></h3>
              <p className="text-sm sm:text-lg font-medium text-orange-100/70 max-w-md">
                Order any of your favourite meal worth 1999/- and get our crispy hot wings <span className="text-white font-bold">FREE</span>.
              </p>
            </div>
            <div>
              <Link href="/menu#exclusive-deals" className="inline-block bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black py-3.5 sm:py-4 px-8 sm:px-10 rounded-2xl uppercase tracking-widest shadow-[0_10px_30px_rgba(249,115,22,0.4)] transform hover:-translate-y-1 active:scale-95 transition-all text-xs sm:text-sm">
                Claim Offer
              </Link>
            </div>
          </div>

          <Link href="/menu#exclusive-deals" className="z-10 transform md:rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-500 flex-shrink-0 cursor-pointer relative">
            <div className="absolute inset-0 bg-orange-500 rounded-[2.5rem] blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
            <div className="w-56 sm:w-72 md:w-80 lg:w-[400px] h-52 sm:h-72 lg:h-80 rounded-[2.5rem] overflow-hidden transform-gpu shadow-2xl border border-orange-500/30 bg-[#120D0A] relative">
              <img src="/4.webp" alt="Jumbo Deal Preview" className="w-full h-full object-fill" />
            </div>
          </Link>
        </div>
      </section>

      {/* 7. 5 VIDEO CONTAINERS (REELS STYLE) */}
      <section className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
        <div className="flex flex-col items-center mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-500 dark:from-white dark:via-orange-100 dark:to-orange-300">Taste The Action</h2>
          <div className="w-20 h-1.5 bg-gradient-to-r from-orange-500 to-orange-400 mt-4 sm:mt-5 rounded-full"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
          {['a', 'b', 'c', 'd', 'e'].map((vid) => (
            <div key={vid} className="aspect-[9/16] bg-[#1c1410] rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl relative group ring-1 ring-orange-500/20 transform hover:-translate-y-3 transition-all duration-500 cursor-pointer transform-gpu">
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
      <section className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pb-24 sm:pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Functional Newsletter Box */}
          <div className="bg-[#18110e] dark:border dark:border-orange-500/30 text-white rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-12 shadow-[0_20px_50px_-10px_rgba(234,88,12,0.15)] flex flex-col justify-center gap-6 sm:gap-8 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-600/30 rounded-full blur-[80px]"></div>
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter mb-3 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-orange-200">Get Delicious Alerts</h3>
              <p className="text-xs sm:text-base text-orange-100/70 font-medium max-w-md">Subscribe to get special discount codes and secret menu drops directly in your inbox.</p>
            </div>
            
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 relative z-10">
              <input 
                type="email" 
                value={newsletterEmail}
                onChange={(e) => { setNewsletterEmail(e.target.value); setNewsletterMsg(''); }}
                placeholder="Enter your email address..." 
                className="bg-white/5 border border-white/10 rounded-2xl px-5 sm:px-6 py-3.5 sm:py-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:bg-white/10 focus:ring-1 focus:ring-orange-500/50 flex-grow text-xs sm:text-sm font-medium transition-all"
              />
              <button type="submit" className="bg-white text-black hover:bg-gray-200 font-bold px-7 sm:px-8 py-3.5 sm:py-4 rounded-2xl transition-colors text-xs sm:text-sm uppercase tracking-widest whitespace-nowrap shadow-lg cursor-pointer">
                Subscribe
              </button>
            </form>

            {newsletterMsg && (
              <p className={`text-xs font-bold uppercase tracking-wider relative z-10 ${newsletterSuccess ? 'text-green-400' : 'text-red-400'}`}>
                {newsletterMsg}
              </p>
            )}
          </div>

          {/* Social Box with React Icons */}
          <div className="bg-white dark:bg-[#18110e] dark:border dark:border-orange-500/30 text-gray-900 dark:text-gray-100 rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-12 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.08)] flex flex-col justify-center gap-6 sm:gap-8 relative overflow-hidden">
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px]"></div>
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter mb-3 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-orange-200">Follow The Vibe</h3>
              <p className="text-xs sm:text-base text-gray-500 dark:text-orange-100/70 font-medium max-w-md">Join our community across all platforms for daily cravings and food drops.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 relative z-10">
              {/* Facebook */}
              <a href="https://www.facebook.com/profile.php?id=61583111042280#" target="_blank" rel="noreferrer" className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 dark:bg-[#120D0A] dark:border dark:border-orange-500/20 rounded-[1.25rem] flex items-center justify-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-[#1877F2]" title="Facebook">
                <FaFacebookF className="w-7 h-7 sm:w-8 sm:h-8" />
              </a>
              
              {/* Instagram */}
              <a href="https://www.instagram.com/pizzgerrwp/" target="_blank" rel="noreferrer" className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 dark:bg-[#120D0A] dark:border dark:border-orange-500/20 rounded-[1.25rem] flex items-center justify-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-[#E4405F]" title="Instagram">
                <FaInstagram className="w-7 h-7 sm:w-8 sm:h-8" />
              </a>

              {/* Snapchat */}
              <a href="https://www.snapchat.com/@pizzgerrwp" target="_blank" rel="noreferrer" className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 dark:bg-[#120D0A] dark:border dark:border-orange-500/20 rounded-[1.25rem] flex items-center justify-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-[#FFFC00]" title="Snapchat">
                <SiSnapchat className="w-7 h-7 sm:w-8 sm:h-8" style={{ filter: "drop-shadow(1px 0 0 #000) drop-shadow(-1px 0 0 #000) drop-shadow(0 1px 0 #000) drop-shadow(0 -1px 0 #000)" }} />
              </a>

              {/* TikTok */}
              <a href="https://www.tiktok.com/@pizzger.rwp" target="_blank" rel="noreferrer" className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 dark:bg-[#120D0A] dark:border dark:border-orange-500/20 rounded-[1.25rem] flex items-center justify-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-black dark:text-white" title="TikTok">
                <FaTiktok className="w-7 h-7 sm:w-8 sm:h-8" />
              </a>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}