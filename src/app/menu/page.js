'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function MenuPage() {
  const [activeSection, setActiveSection] = useState('exclusive-deals');
  const [cartCount, setCartCount] = useState(0); 
  const navRef = useRef(null);

  // Sync Unique Cart Count on load from localStorage
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

  // Function to Add Item to LocalStorage WITHOUT redirecting
  const addToCart = (itemData) => {
    const savedCart = JSON.parse(localStorage.getItem('food_cart') || '[]');
    const existingIndex = savedCart.findIndex(
      item => item.title === itemData.title && item.size === itemData.size
    );

    if (existingIndex > -1) {
      savedCart[existingIndex].quantity += 1;
    } else {
      savedCart.push({ ...itemData, quantity: 1 });
    }

    localStorage.setItem('food_cart', JSON.stringify(savedCart));
    window.dispatchEvent(new Event('cartUpdated'));
    setCartCount(savedCart.length);
  };

  // --- PRICING ARRAYS & CONFIGS ---
  const standardPricing = [
    { size: 'Small', price: '689' },
    { size: 'Regular', price: '1149' },
    { size: 'Large', price: '1599' },
    { size: 'Family', price: '2199' }
  ];
  
  const crustPricing = [
    { size: 'Regular', price: '1549' },
    { size: 'Large', price: '2049' },
    { size: 'Family', price: '3149' }
  ];

  const specialPricing = [
    { size: 'Small', price: '899' },
    { size: 'Regular', price: '1449' },
    { size: 'Large', price: '1899' },
    { size: 'Family', price: '2799' }
  ];

  const doubleStackedPricing = [
    { size: 'Small', price: '1349' },
    { size: 'Regular', price: '1999' },
    { size: 'Large', price: '2749' },
    { size: 'Family', price: '3799' }
  ];

  const shawarmaPricing2and3 = [
    { size: 'Normal', price: '299' },
    { size: 'Large', price: '389' }
  ];
  const shawarmaPricing4 = [
    { size: 'Normal', price: '299' },
    { size: 'Large', price: '369' }
  ];
  const shawarmaPricing5 = [
    { size: 'Normal', price: '139' },
    { size: 'Large', price: '169' }
  ];

  const friesPricing1 = [
    { size: 'Small', price: '199' },
    { size: 'Large', price: '249' },
    { size: 'Family', price: '299' }
  ];
  const friesPricing2 = [
    { size: 'Small', price: '229' },
    { size: 'Large', price: '279' },
    { size: 'Family', price: '329' }
  ];
  const friesPricing3 = [
    { size: 'Small', price: '269' },
    { size: 'Large', price: '329' },
    { size: 'Family', price: '399' }
  ];
  const friesPricing4 = [
    { size: 'Small', price: '349' },
    { size: 'Large', price: '599' }
  ];

  const pastaPricing1 = [
    { size: 'Small', price: '500' },
    { size: 'Large', price: '850' }
  ];
  const pastaPricing2and3 = [
    { size: 'Small', price: '550' },
    { size: 'Large', price: '1000' }
  ];

  const siderPricingFirst = [
    { size: '6 Pcs', price: '349' },
    { size: '12 Pcs', price: '699' }
  ];
  const siderPricingRest = [
    { size: '6 Pcs', price: '369' },
    { size: '12 Pcs', price: '699' }
  ];

  const menuSections = [
    { id: 'exclusive-deals', label: 'Exclusive Deals' },
    { id: 'midnight-deals', label: 'Midnight Deals' },
    { id: 'birthday-offers', label: 'Birthday Offers' },
    { id: 'event-section', label: 'Events' },
    { id: 'burgers', label: 'Burgers' },
    { id: 'pizzas', label: 'Pizzas' },
    { id: 'shawarmas', label: 'Shawarmas' },
    { id: 'parathas', label: 'Parathas' },
    { id: 'fries', label: 'Fries' },
    { id: 'pasta', label: 'Creamy Pasta' },
    { id: 'sauces', label: 'Sauces' },
    { id: 'side-orders', label: 'Side Orders' },
    { id: 'drinks', label: 'Drinks' }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries.find((entry) => entry.isIntersecting);
        if (visibleSection) {
          setActiveSection(visibleSection.target.id);
        }
      },
      { rootMargin: '-20% 0px -75% 0px', threshold: 0 }
    );

    menuSections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const activeTab = document.getElementById(`nav-${activeSection}`);
    if (activeTab && navRef.current) {
      activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeSection]);

  const handleNavClick = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 160;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const MenuCard = ({ title, description, price, pricingOptions, imageNum }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [selectedSize, setSelectedSize] = useState("");
    const [error, setError] = useState(false);
    const [addedEffect, setAddedEffect] = useState(false);

    const handleAddToCartClick = () => {
      if (pricingOptions && selectedSize === "") {
        setError(true);
        return;
      }
      setError(false);

      const finalSize = pricingOptions ? selectedSize : 'Standard';
      const finalPrice = pricingOptions 
        ? parseInt(pricingOptions.find(p => p.size === selectedSize).price) 
        : parseInt(price.replace('Rs. ', '').replace(',', ''));

      addToCart({
        id: `${title}-${finalSize}`,
        image: `/${imageNum}.webp`,
        title,
        size: finalSize,
        price: finalPrice
      });

      setAddedEffect(true);
      setTimeout(() => setAddedEffect(false), 800);
    };

    const displayPrice = pricingOptions
      ? (selectedSize ? `Rs. ${pricingOptions.find(p => p.size === selectedSize).price}` : null)
      : price;

    return (
      <div className="group relative bg-white dark:bg-[#1c1410]/70 dark:backdrop-blur-xl rounded-[2.5rem] p-3 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_10px_30px_rgba(234,88,12,0.1)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.12)] hover:-translate-y-1.5 transition-all duration-300 ring-1 ring-gray-900/5 dark:ring-orange-500/20">
        
        {/* Top Image Area */}
        <div className="w-full h-44 sm:h-48 bg-gray-50 dark:bg-[#18110e] rounded-[1.5rem] relative overflow-hidden mb-4 flex items-center justify-center p-2">
          <img 
            src={`/${imageNum}.webp`} 
            alt={title} 
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out" 
          />
          
          <button 
            onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
            className="absolute top-3 right-3 w-10 h-10 bg-white/80 dark:bg-[#120D0A]/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all z-10"
          >
            <svg 
              className={`w-5 h-5 transition-colors duration-300 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-400 dark:text-orange-200/60 fill-none stroke-current stroke-2'}`} 
              viewBox="0 0 24 24" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>

        {/* Bottom Content Area */}
        <div className="flex flex-col flex-grow px-1">
          <h3 className="font-black text-gray-900 dark:text-white text-lg uppercase tracking-tight leading-none">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-orange-200/70 mt-2 font-medium leading-snug line-clamp-2 min-h-[40px]">
            {description}
          </p>
          
          <div className="mt-2 mb-3 min-h-[32px] flex items-end">
            {displayPrice ? (
               <span className="text-orange-600 dark:text-orange-400 font-black text-xl">{displayPrice}</span>
            ) : (
               <span className="text-sm font-bold text-gray-400 dark:text-orange-200/50 uppercase tracking-widest">Select Size For Price</span>
            )}
          </div>

          {/* Size Selector */}
          {pricingOptions && (
            <div className="mb-3 relative">
              <select 
                value={selectedSize}
                onChange={(e) => { setSelectedSize(e.target.value); setError(false); }}
                className={`w-full p-2.5 rounded-xl border-2 text-sm font-bold bg-gray-50 dark:bg-[#120D0A] text-gray-700 dark:text-orange-100 outline-none transition-colors appearance-none cursor-pointer ${
                  error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 dark:border-orange-500/30 focus:border-orange-500 hover:bg-gray-100 dark:hover:bg-[#18110e]'
                }`}
              >
                <option value="">-- Select Size --</option>
                {pricingOptions.map(opt => (
                  <option key={opt.size} value={opt.size}>{opt.size} ({opt.price})</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400 dark:text-orange-200/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
              {error && <span className="absolute -top-5 right-1 text-xs text-red-500 font-black tracking-widest uppercase bg-white dark:bg-[#120D0A] px-1">Required!</span>}
            </div>
          )}
          
          <button 
            onClick={handleAddToCartClick}
            className={`mt-auto w-full font-bold py-3.5 rounded-xl uppercase tracking-widest text-sm transition-all active:scale-95 shadow-md hover:shadow-lg cursor-pointer ${
              addedEffect ? 'bg-green-600 text-white' : 'bg-gray-900 dark:bg-orange-600 hover:bg-black dark:hover:bg-orange-700 text-white'
            }`}
          >
            {addedEffect ? 'Added ✓' : 'Add To Cart'}
          </button>
        </div>
      </div>
    );
  };

  const SectionHeader = ({ title, subtitle }) => (
    <div className="flex items-center gap-6 mb-8">
      <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-gray-900 dark:text-white whitespace-nowrap">
        {title}
      </h2>
      <div className="h-[2px] flex-grow bg-gradient-to-r from-orange-500 to-orange-100 dark:to-orange-900/50 rounded-full opacity-70"></div>
      {subtitle && <span className="text-gray-400 dark:text-orange-200/60 font-bold tracking-widest text-sm hidden sm:block">{subtitle}</span>}
    </div>
  );

  const SubSectionHeader = ({ title }) => (
    <div className="flex items-center gap-4 mb-6 mt-4">
      <h3 className="text-xl font-extrabold uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400">
        {title}
      </h3>
      <div className="h-px flex-grow bg-gray-200 dark:bg-orange-500/20"></div>
    </div>
  );

  const imgOffset = {
    exclusive: 17,
    midnight: 29,
    birthday: 35,
    event: 37,
    burgers: 46,
    pizzaStd: 54,
    pizzaCrust: 65,
    pizzaSpec: 69,
    pizzaDbl: 78,
    pizzaFav: 79,
    shawarmas: 83,
    parathas: 88,
    fries: 93,
    pasta: 97,
    sauces: 100,
    sides: 105,
    drinks: 112
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#120D0A] text-gray-900 dark:text-gray-100 antialiased relative z-0 transition-colors duration-500">
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes custom-shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-12deg) scale(1.1); }
          50% { transform: rotate(12deg) scale(1.1); }
          75% { transform: rotate(-12deg) scale(1.1); }
        }
        .animate-custom-shake { animation: custom-shake 2s infinite ease-in-out; }
      `}} />

      {/* Background Ambient High-Intensity Central Orange Light Reflections */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-orange-600/15 dark:bg-orange-600/25 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="absolute top-[30%] left-10 w-[450px] h-[450px] bg-amber-600/10 rounded-full blur-[130px] pointer-events-none -z-10"></div>
      <div className="absolute top-[70%] right-10 w-[550px] h-[550px] bg-orange-500/15 rounded-full blur-[160px] pointer-events-none -z-10"></div>

      {/* Sticky Categories Navigation Bar */}
      <div className="sticky top-[70px] md:top-[80px] z-40 w-full bg-white/70 dark:bg-[#120D0A]/85 backdrop-blur-2xl border-b border-gray-200 dark:border-orange-500/20 shadow-sm transition-all duration-300">
        <div ref={navRef} className="max-w-[85rem] mx-auto flex items-center gap-2 overflow-x-auto hide-scrollbar px-4 sm:px-6 lg:px-8 py-4 snap-x">
          {menuSections.map(({ id, label }) => (
            <button
              key={id}
              id={`nav-${id}`}
              onClick={() => handleNavClick(id)}
              className={`snap-center whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-300 border-2 cursor-pointer ${
                activeSection === id 
                  ? 'bg-orange-600 text-white border-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.4)]' 
                  : 'bg-transparent text-gray-500 dark:text-orange-200/70 border-transparent hover:bg-gray-100 dark:hover:bg-[#1c1410] hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[85rem] mx-auto space-y-24 pt-12 pb-32 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        
        <div className="text-center pb-4">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-500 dark:from-white dark:via-orange-100 dark:to-orange-300 mb-4">
            Our Full Menu
          </h1>
          <p className="text-gray-500 dark:text-orange-200/70 text-base sm:text-lg font-medium tracking-wide max-w-2xl mx-auto">
            Explore all exclusive deals, midnight specials, hand-tossed pizzas, and more.
          </p>
        </div>

        {/* 1. Exclusive Deals */}
        <section id="exclusive-deals" className="scroll-mt-48">
          <SectionHeader title="Exclusive Deals" subtitle="12 ITEMS" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {[...Array(12)].map((_, i) => (
              <MenuCard key={i} imageNum={imgOffset.exclusive + i} title={`Deal 0${i+1}`} description="1x Zinger Burger + 1x Regular Fries + 1x Regular Drink" price="Rs. 850" />
            ))}
          </div>
        </section>

        {/* 2. Midnight Deals */}
        <section id="midnight-deals" className="scroll-mt-48">
          <SectionHeader title="Midnight Deals" subtitle="6 ITEMS" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {[...Array(6)].map((_, i) => (
              <MenuCard key={i} imageNum={imgOffset.midnight + i} title={`Midnight ${i+1}`} description="2x Loaded Shawarmas + 2x Mint Margaritas" price="Rs. 1,200" />
            ))}
          </div>
        </section>

        {/* 3. Birthday Offers */}
        <section id="birthday-offers" className="scroll-mt-48">
          <SectionHeader title="Birthday Offers" subtitle="2 EXCLUSIVE" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => (
              <MenuCard key={i} imageNum={imgOffset.birthday + i} title={`Birthday Special ${i+1}`} description="4x Zinger Burgers + 2x Large Fries + 1.5L Cold Drink" price="Rs. 2,999" />
            ))}
          </div>
        </section>

        {/* 4. Event Section */}
        <section id="event-section" className="scroll-mt-48">
          <SectionHeader title="Event Section" subtitle="9 ITEMS" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {[...Array(9)].map((_, i) => (
              <MenuCard key={i} imageNum={imgOffset.event + i} title={`Platter 0${i+1}`} description="Assorted wings, nuggets, and fries platter for the group." price="Rs. 1,500" />
            ))}
          </div>
        </section>

        {/* 5. Burgers */}
        <section id="burgers" className="scroll-mt-48">
          <SectionHeader title="Signature Burgers" subtitle="8 ITEMS" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {[...Array(8)].map((_, i) => (
              <MenuCard key={i} imageNum={imgOffset.burgers + i} title={`Zinger Burger ${i+1}`} description="Crispy chicken fillet with secret mayo and fresh iceberg." price="Rs. 450" />
            ))}
          </div>
        </section>

        {/* 6. Pizzas */}
        <section id="pizzas" className="bg-white/40 dark:bg-[#18110e]/60 p-6 sm:p-10 rounded-[3rem] ring-1 ring-gray-900/5 dark:ring-orange-500/20 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.02)] backdrop-blur-3xl scroll-mt-48">
          <SectionHeader title="Hand-Tossed Pizzas" />
          <div className="space-y-16">
            <div>
              <SubSectionHeader title="Standard Range (11)" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                {[...Array(11)].map((_, i) => (
                  <MenuCard key={i} imageNum={imgOffset.pizzaStd + i} title={`Fajita Pizza ${i+1}`} description="Chicken fajita, onions, capsicum & loads of mozzarella." pricingOptions={standardPricing} />
                ))}
              </div>
            </div>
            <div>
              <SubSectionHeader title="Pizzger Crust Range (4)" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {[...Array(4)].map((_, i) => (
                  <MenuCard key={i} imageNum={imgOffset.pizzaCrust + i} title={`Stuffed Crust ${i+1}`} description="Kabob stuffed crust with malai boti topping." pricingOptions={crustPricing} />
                ))}
              </div>
            </div>
            <div>
              <SubSectionHeader title="Pizzger Special Range (9)" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                {[...Array(9)].map((_, i) => (
                  <MenuCard key={i} imageNum={imgOffset.pizzaSpec + i} title={`Crown Crust ${i+1}`} description="Special crown crust filled with chicken chunks and sauce." pricingOptions={specialPricing} />
                ))}
              </div>
            </div>
            <div>
              <SubSectionHeader title="Double Stacked (1)" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                <MenuCard imageNum={imgOffset.pizzaDbl} title="Double Stacked Pro" description="Two layers of pizza magic with extra cheese." pricingOptions={doubleStackedPricing} />
              </div>
            </div>
            <div>
              <SubSectionHeader title="All Time Favourites (4)" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                <MenuCard imageNum={imgOffset.pizzaFav} title="Classic Tikka 1" description="Traditional chicken tikka flavor with premium cheese." price="Rs. 1449" />
                <MenuCard imageNum={imgOffset.pizzaFav + 1} title="Classic Tikka 2" description="Traditional chicken tikka flavor with premium cheese." price="Rs. 2349" />
                <MenuCard imageNum={imgOffset.pizzaFav + 2} title="Classic Tikka 3" description="Traditional chicken tikka flavor with premium cheese." price="Rs. 3299" />
                <MenuCard imageNum={imgOffset.pizzaFav + 3} title="Classic Tikka 4" description="Traditional chicken tikka flavor with premium cheese." price="Rs. 4499" />
              </div>
            </div>
          </div>
        </section>

        {/* 7. Shawarmas */}
        <section id="shawarmas" className="scroll-mt-48">
          <SectionHeader title="Authentic Shawarmas" subtitle="5 ITEMS" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            <MenuCard imageNum={imgOffset.shawarmas} title="Loaded Shawarma 1" description="Grilled chicken, pickles, fries, and garlic sauce wrapped in pita." price="Rs. 399" />
            <MenuCard imageNum={imgOffset.shawarmas + 1} title="Loaded Shawarma 2" description="Grilled chicken, pickles, fries, and garlic sauce wrapped in pita." pricingOptions={shawarmaPricing2and3} />
            <MenuCard imageNum={imgOffset.shawarmas + 2} title="Loaded Shawarma 3" description="Grilled chicken, pickles, fries, and garlic sauce wrapped in pita." pricingOptions={shawarmaPricing2and3} />
            <MenuCard imageNum={imgOffset.shawarmas + 3} title="Loaded Shawarma 4" description="Grilled chicken, pickles, fries, and garlic sauce wrapped in pita." pricingOptions={shawarmaPricing4} />
            <MenuCard imageNum={imgOffset.shawarmas + 4} title="Loaded Shawarma 5" description="Grilled chicken, pickles, fries, and garlic sauce wrapped in pita." pricingOptions={shawarmaPricing5} />
          </div>
        </section>

        {/* 8. Parathas */}
        <section id="parathas" className="scroll-mt-48">
          <SectionHeader title="Hot Parathas" subtitle="5 ITEMS" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            <MenuCard imageNum={imgOffset.parathas} title="Zinger Paratha 1" description="Crispy zinger wrapped in a flaky, hot paratha roll." price="Rs. 589" />
            <MenuCard imageNum={imgOffset.parathas + 1} title="Zinger Paratha 2" description="Crispy zinger wrapped in a flaky, hot paratha roll." price="Rs. 389" />
            <MenuCard imageNum={imgOffset.parathas + 2} title="Zinger Paratha 3" description="Crispy zinger wrapped in a flaky, hot paratha roll." price="Rs. 389" />
            <MenuCard imageNum={imgOffset.parathas + 3} title="Zinger Paratha 4" description="Crispy zinger wrapped in a flaky, hot paratha roll." price="Rs. 309" />
            <MenuCard imageNum={imgOffset.parathas + 4} title="Zinger Paratha 5" description="Crispy zinger wrapped in a flaky, hot paratha roll." price="Rs. 259" />
          </div>
        </section>

        {/* 9. Fries */}
        <section id="fries" className="scroll-mt-48">
          <SectionHeader title="Loaded Fries" subtitle="4 ITEMS" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <MenuCard imageNum={imgOffset.fries} title="Pizza Fries 1" description="Crispy fries topped with pizza sauce and cheese." pricingOptions={friesPricing1} />
            <MenuCard imageNum={imgOffset.fries + 1} title="Pizza Fries 2" description="Crispy fries topped with pizza sauce and cheese." pricingOptions={friesPricing2} />
            <MenuCard imageNum={imgOffset.fries + 2} title="Pizza Fries 3" description="Crispy fries topped with pizza sauce and cheese." pricingOptions={friesPricing3} />
            <MenuCard imageNum={imgOffset.fries + 3} title="Pizza Fries 4" description="Crispy fries topped with pizza sauce and cheese." pricingOptions={friesPricing4} />
          </div>
        </section>

        {/* 10. Creamy Pasta */}
        <section id="pasta" className="scroll-mt-48">
          <SectionHeader title="Creamy Pasta" subtitle="3 ITEMS" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <MenuCard imageNum={imgOffset.pasta} title="Alfredo Pasta 1" description="Penne pasta in rich alfredo sauce." pricingOptions={pastaPricing1} />
            <MenuCard imageNum={imgOffset.pasta + 1} title="Alfredo Pasta 2" description="Penne pasta in rich alfredo sauce." pricingOptions={pastaPricing2and3} />
            <MenuCard imageNum={imgOffset.pasta + 2} title="Alfredo Pasta 3" description="Penne pasta in rich alfredo sauce." pricingOptions={pastaPricing2and3} />
          </div>
        </section>

        {/* 11. Sauces */}
        <section id="sauces" className="scroll-mt-48">
          <SectionHeader title="Dips & Sauces" subtitle="5 ITEMS" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
            <MenuCard imageNum={imgOffset.sauces} title="Garlic Mayo Dip 1" description="Homemade garlic mayo sauce." price="Rs. 70" />
            <MenuCard imageNum={imgOffset.sauces + 1} title="Garlic Mayo Dip 2" description="Homemade garlic mayo sauce." price="Rs. 70" />
            <MenuCard imageNum={imgOffset.sauces + 2} title="Garlic Mayo Dip 3" description="Homemade garlic mayo sauce." price="Rs. 80" />
            <MenuCard imageNum={imgOffset.sauces + 3} title="Garlic Mayo Dip 4" description="Homemade garlic mayo sauce." price="Rs. 15" />
            <MenuCard imageNum={imgOffset.sauces + 4} title="Garlic Mayo Dip 5" description="Homemade garlic mayo sauce." price="Rs. 15" />
          </div>
        </section>

        {/* 12. Side Orders */}
        <section id="side-orders" className="scroll-mt-48">
          <SectionHeader title="Side Orders" subtitle="7 ITEMS" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            <MenuCard imageNum={imgOffset.sides} title="Hot Wings 1" description="Spicy and crispy hot wings." pricingOptions={siderPricingFirst} />
            <MenuCard imageNum={imgOffset.sides + 1} title="Hot Wings 2" description="Spicy and crispy hot wings." pricingOptions={siderPricingRest} />
            <MenuCard imageNum={imgOffset.sides + 2} title="Hot Wings 3" description="Spicy and crispy hot wings." pricingOptions={siderPricingRest} />
            <MenuCard imageNum={imgOffset.sides + 3} title="Hot Wings 4" description="Spicy and crispy hot wings." pricingOptions={siderPricingRest} />
            <MenuCard imageNum={imgOffset.sides + 4} title="Side Order 5" description="Crispy snack item." price="Rs. 279" />
            <MenuCard imageNum={imgOffset.sides + 5} title="Side Order 6" description="Crispy snack item." price="Rs. 279" />
            <MenuCard imageNum={imgOffset.sides + 6} title="Side Order 7" description="Crispy snack item." price="Rs. 329" />
          </div>
        </section>

        {/* 13. Drinks */}
        <section id="drinks" className="scroll-mt-48">
          <SectionHeader title="Chilled Drinks" subtitle="7 ITEMS" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            <MenuCard imageNum={imgOffset.drinks} title="345 ML Drink" description="Chilled refreshing carbonated beverage." price="Rs. 120" />
            <MenuCard imageNum={imgOffset.drinks + 1} title="500 ML Drink" description="Chilled refreshing carbonated beverage." price="Rs. 160" />
            <MenuCard imageNum={imgOffset.drinks + 2} title="1000 ML Drink" description="Chilled refreshing carbonated beverage." price="Rs. 220" />
            <MenuCard imageNum={imgOffset.drinks + 3} title="1500 ML Drink" description="Chilled refreshing carbonated beverage." price="Rs. 270" />
            <MenuCard imageNum={imgOffset.drinks + 4} title="2000 ML Drink" description="Chilled refreshing carbonated beverage." price="Rs. 350" />
            <MenuCard imageNum={imgOffset.drinks + 5} title="Water Small" description="Pure mineral drinking water." price="Rs. 90" />
            <MenuCard imageNum={imgOffset.drinks + 6} title="Water Large" description="Pure mineral drinking water." price="Rs. 160" />
          </div>
        </section>

      </div>

      {/* FLOATING CART BUTTON LINKED TO CART PAGE */}
      <Link href="/cart" className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-50 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-orange-600 to-orange-400 text-white shadow-[0_10px_40px_rgba(234,88,12,0.6)] flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-300 border-4 border-white/20 dark:border-[#120D0A]/40 animate-custom-shake group">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 sm:w-10 sm:h-10 fill-current" viewBox="0 0 256 256">
          <path d="M222.14,58.87A8,8,0,0,0,216,56H54.68L49.79,29.14A16,16,0,0,0,34.05,16H16a8,8,0,0,0,0,16h18.05l15.6,85.78A16,16,0,0,0,65.27,128H200a8,8,0,0,0,0-16H65.27a.12.12,0,0,1-.05,0L61.85,96H213a8,8,0,0,0,7.88-6.62l10-56A8,8,0,0,0,222.14,58.87ZM206.63,80H58.94l-3.27-18H210ZM80,184a24,24,0,1,0-24-24A24,24,0,0,0,80,184Zm0-32a8,8,0,1,1-8,8A8,8,0,0,1,80,152Zm96,32a24,24,0,1,0-24-24A24,24,0,0,0,176,184Zm0-32a8,8,0,1,1-8,8A8,8,0,0,1,176,152Z"></path>
        </svg>
        
        {cartCount > 0 && (
          <span className="absolute top-0 right-0 w-6 h-6 sm:w-7 sm:h-7 bg-red-600 border-2 border-white dark:border-[#120D0A] text-white text-xs sm:text-sm font-black rounded-full flex items-center justify-center transform -translate-y-1/4 translate-x-1/4 shadow-lg group-hover:scale-110 transition-transform">
            {cartCount}
          </span>
        )}
      </Link>

    </div>
  );
}