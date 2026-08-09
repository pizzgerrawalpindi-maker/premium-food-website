'use client';
import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
const getImageSrc = (imgVal) => { if (!imgVal) return '/images/placeholder.webp'; const val = String(imgVal); if (val.startsWith('/') || val.startsWith('http')) return val; return `/images/${val}.webp`; };
const MenuCard = memo(function MenuCard({
  title,
  description,
  price,
  pricingOptions,
  imageNum,
  priority = false,
  className = '',
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [error, setError] = useState(false);
  const [addedEffect, setAddedEffect] = useState(false);

  const handleAddToCartClick = useCallback(() => {
    if (pricingOptions && pricingOptions.length > 0 && selectedSize === '') {
      setError(true);
      return;
    }
    setError(false);

    const finalSize = pricingOptions && pricingOptions.length > 0 ? selectedSize : 'Standard';
    const foundPriceObj =
      pricingOptions && pricingOptions.length > 0
        ? pricingOptions.find((p) => p.size === selectedSize)
        : null;
    const finalPrice = foundPriceObj
      ? parseInt(foundPriceObj.price, 10)
      : parseInt(String(price || '0').replace('Rs. ', '').replace(',', ''), 10);

    try {
      const savedCart = JSON.parse(localStorage.getItem('food_cart') || '[]');
      const existingIndex = savedCart.findIndex(
        (item) => item.title === title && item.size === finalSize
      );

      if (existingIndex > -1) {
        savedCart[existingIndex].quantity += 1;
      } else {
        savedCart.push({
          id: `${title}-${finalSize}`,
          image: getImageSrc(imageNum),
          title,
          size: finalSize,
          price: finalPrice,
          quantity: 1,
        });
      }

      localStorage.setItem('food_cart', JSON.stringify(savedCart));
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (e) {
      console.error('Cart update failed', e);
    }

    setAddedEffect(true);
    setTimeout(() => setAddedEffect(false), 800);
  }, [title, price, pricingOptions, selectedSize, imageNum]);

  const displayPrice =
    pricingOptions && pricingOptions.length > 0
      ? selectedSize
        ? `Rs. ${pricingOptions.find((p) => p.size === selectedSize)?.price}`
        : null
      : `Rs. ${price}`;

  return (
    <div
      className={`group relative bg-white/95 dark:bg-[#18110e]/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 flex flex-col shadow-xl shadow-black/3 dark:shadow-orange-950/20 hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-300 border border-gray-100 dark:border-orange-500/10 ${className}`}
    >
      <div className="w-full h-32 sm:h-48 bg-linear-to-b from-gray-50 to-gray-100/60 dark:from-[#120D0A] dark:to-[#1c1410] rounded-xl sm:rounded-2xl relative overflow-hidden mb-2.5 sm:mb-4 flex items-center justify-center p-2 sm:p-3">
        <Image
          src={getImageSrc(imageNum)}
          alt={title}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 20vw"
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          className="object-contain group-hover:scale-110 transition-transform duration-500 ease-out drop-shadow-md"
        />

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          aria-label="Save to favorites"
          className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all text-gray-400 dark:text-orange-200 z-10"
        >
          <svg
            className={`w-3.5 h-3.5 sm:w-5 sm:h-5 transition-colors duration-300 ${
              isLiked ? 'text-red-500 fill-current' : 'fill-none stroke-current stroke-2'
            }`}
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
      </div>

      <div className="flex flex-col grow px-0.5 sm:px-1">
        <h3 className="font-extrabold text-gray-900 dark:text-white text-xs sm:text-base uppercase tracking-tight line-clamp-1">
          {title}
        </h3>
        <p className="text-[11px] sm:text-sm text-gray-500 dark:text-orange-200/60 mt-0.5 sm:mt-1 font-medium leading-snug sm:leading-relaxed line-clamp-2 min-h-7 sm:min-h-8">
          {description}
        </p>

        <div className="mt-1.5 sm:mt-2 mb-2 sm:mb-3 min-h-6 sm:min-h-7 flex items-end">
          {displayPrice ? (
            <span className="text-orange-600 dark:text-orange-400 font-black text-sm sm:text-lg">
              {displayPrice}
            </span>
          ) : (
            <span className="text-[10px] sm:text-xs font-bold text-orange-500/70 uppercase tracking-wider">
              Choose size below
            </span>
          )}
        </div>

        {pricingOptions && pricingOptions.length > 0 && (
          <div className="mb-2.5 sm:mb-3 relative">
            <select
              value={selectedSize}
              onChange={(e) => {
                setSelectedSize(e.target.value);
                setError(false);
              }}
              className={`w-full p-2 sm:p-2.5 rounded-xl border-2 text-[11px] sm:text-sm font-bold bg-gray-50 dark:bg-[#120D0A] text-gray-800 dark:text-orange-100 outline-none transition-all appearance-none cursor-pointer ${
                error
                  ? 'border-red-500 ring-2 ring-red-500/20'
                  : 'border-gray-200 dark:border-orange-500/20 focus:border-orange-500 hover:bg-gray-100 dark:hover:bg-[#1c1410]'
              }`}
            >
              <option value="">-- Select Size --</option>
              {pricingOptions.map((opt) => (
                <option key={opt.size} value={opt.size}>
                  {opt.size} — Rs. {opt.price}
                </option>
              ))}
            </select>
            <div className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
            {error && (
              <span className="absolute -top-3.5 right-2 text-[9px] sm:text-[10px] text-red-500 font-black tracking-widest uppercase bg-white dark:bg-[#120D0A] px-1 py-0.5 rounded border border-red-200">
                Required!
              </span>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleAddToCartClick}
          className={`mt-auto w-full font-bold py-2.5 sm:py-3 rounded-xl sm:rounded-2xl uppercase tracking-wider text-[11px] sm:text-sm transition-all active:scale-95 shadow-md cursor-pointer ${
            addedEffect
              ? 'bg-emerald-600 text-white shadow-emerald-600/30'
              : 'bg-gray-900 dark:bg-orange-600 hover:bg-black dark:hover:bg-orange-500 text-white shadow-orange-600/10'
          }`}
        >
          {addedEffect ? 'Added ✓' : 'Add To Cart'}
        </button>
      </div>
    </div>
  );
});

const SectionHeader = memo(function SectionHeader({ title, subtitle }) {
  return (
    <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
      <h2 className="text-xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-white whitespace-nowrap">
        {title}
      </h2>
      <div className="h-0.5 grow bg-linear-to-r from-orange-500/80 via-orange-500/20 to-transparent rounded-full"></div>
      {subtitle && (
        <span className="text-orange-600 dark:text-orange-400 font-extrabold tracking-widest text-xs sm:text-sm bg-orange-500/10 px-3 py-1 rounded-full">
          {subtitle}
        </span>
      )}
    </div>
  );
});

const centerLastMd = 'max-md:col-span-2 max-md:max-w-[calc(50%-0.375rem)] max-md:mx-auto';

export default function MenuClientWrapper({ initialCategories, itemsByCategory }) {
  const [activeSection, setActiveSection] = useState(initialCategories[0]?.slug || '');
  const [cartCount, setCartCount] = useState(0);
  const navRef = useRef(null);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const savedCart = JSON.parse(localStorage.getItem('food_cart') || '[]');
        setCartCount(savedCart.length);
      } catch (e) {
        setCartCount(0);
      }
    };
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const sectionId = window.location.hash.replace('#', '');
      setActiveSection(sectionId);
      requestAnimationFrame(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const y = element.getBoundingClientRect().top + window.scrollY - 140;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      });
    }
  }, []);

  useEffect(() => {
    if (initialCategories.length === 0) return;

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection((prev) => (prev === entry.target.id ? prev : entry.target.id));
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: '-15% 0px -65% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    initialCategories.forEach(({ slug }) => {
      const element = document.getElementById(slug);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [initialCategories]);

  useEffect(() => {
    const activeTab = document.getElementById(`nav-${activeSection}`);
    if (activeTab && navRef.current) {
      activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeSection]);

  const handleNavClick = useCallback((id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 140;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0D0907] text-gray-900 dark:text-gray-100 antialiased relative selection:bg-orange-500 selection:text-white transition-colors duration-300">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* Premium Smooth Scrolling & Momentum */
        html { 
          scroll-behavior: smooth; 
          -webkit-overflow-scrolling: touch;
        }
        
        body {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-y: none;
        }

        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes custom-shake {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-8deg) scale(1.05); }
          40% { transform: rotate(8deg) scale(1.05); }
          60% { transform: rotate(-6deg); }
          80% { transform: rotate(6deg); }
        }
        .animate-custom-shake { animation: custom-shake 3s infinite ease-in-out; }

        @media (max-width: 640px) {
          nav.sticky {
            top: 115px !important;
          }
        }

        .menu-section {
          content-visibility: auto;
          contain-intrinsic-size: 800px;
        }
      `,
        }}
      />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-300 h-125 bg-linear-to-b from-orange-500/15 to-transparent blur-[120px] pointer-events-none -z-10"></div>

      <nav className="sticky top-23.75 sm:top-26.25 z-40 w-full bg-white/85 dark:bg-[#0D0907]/90 backdrop-blur-md border-y border-gray-200/80 dark:border-orange-500/15 shadow-md transition-all duration-300 mt-2">
        <div
          ref={navRef}
          className="max-w-340 mx-auto flex items-center gap-2 overflow-x-auto hide-scrollbar px-4 sm:px-6 lg:px-8 py-3 snap-x"
        >
          {initialCategories.map(({ slug, name }) => (
            <button
              key={slug}
              id={`nav-${slug}`}
              type="button"
              onClick={() => handleNavClick(slug)}
              className={`snap-center whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeSection === slug
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30 scale-105'
                  : 'bg-transparent text-gray-600 dark:text-orange-200/70 hover:bg-gray-100 dark:hover:bg-[#18110e] hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-340 mx-auto space-y-16 sm:space-y-24 pt-10 sm:pt-16 pb-36 px-4 sm:px-6 lg:px-8">
        <header className="text-center pb-2">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-3">
            Our Interactive{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-amber-500">
              Menu
            </span>
          </h1>
          <p className="text-gray-500 dark:text-orange-200/70 text-sm sm:text-base font-medium max-w-xl mx-auto">
            Discover freshly prepared exclusive deals, hand-tossed crust pizzas, burgers, and delightful
            midnight cravings.
          </p>
        </header>

        {initialCategories.map((cat, catIndex) => {
          const categoryItems = itemsByCategory[cat.id] || [];

          return (
            <section key={cat.id} id={cat.slug} className="menu-section scroll-mt-36">
              <SectionHeader title={cat.name} subtitle={`${categoryItems.length} ITEMS`} />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                {categoryItems.map((item, i, arr) => (
                  <MenuCard
                    key={item.id}
                    imageNum={item.image_num}
                    title={item.title}
                    description={item.description}
                    price={item.price}
                    pricingOptions={item.pricing_options}
                    priority={catIndex === 0 && i < 4}
                    className={i === arr.length - 1 && arr.length % 2 !== 0 ? centerLastMd : ''}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      <Link
        href="/cart"
        aria-label="View Cart"
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-linear-to-tr from-orange-600 to-amber-500 text-white shadow-2xl shadow-orange-600/50 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-white/30 dark:border-[#0D0907]/60 animate-custom-shake group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 sm:w-9 sm:h-9 fill-current" viewBox="0 0 256 256">
          <path d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16h18.05l15.6,85.78A16,16,0,0,0,65.27,128H200a8,8,0,0,0,0-16H65.27a.12.12,0,0,1-.05,0L61.85,96H213a8,8,0,0,0,7.88-6.62l10-56A8,8,0,0,0,222.14,58.87ZM206.63,80H58.94l-3.27-18H210ZM80,184a24,24,0,1,0-24-24A24,24,0,0,0,80,184Zm0-32a8,8,0,1,1-8,8A8,8,0,0,1,80,152Zm96,32a24,24,0,1,0-24-24A24,24,0,0,0,176,184Zm0-32a8,8,0,1,1-8,8A8,8,0,0,1,176,152Z"></path>
        </svg>

        {cartCount > 0 && (
          <span className="absolute top-0 right-0 w-6 h-6 sm:w-7 sm:h-7 bg-red-600 border-2 border-white dark:border-[#0D0907] text-white text-xs sm:text-sm font-black rounded-full flex items-center justify-center transform -translate-y-1/4 translate-x-1/4 shadow-lg group-hover:scale-110 transition-transform">
            {cartCount}
          </span>
        )}
      </Link>
    </div>
  );
}