'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white/90 dark:bg-[#0A0705]/95 text-neutral-800 dark:text-neutral-200 pt-16 pb-10 border-t border-neutral-200/80 dark:border-neutral-800/80 relative overflow-hidden transition-colors duration-300">
      
      {/* Ambient Glow Reflection */}
      <div aria-hidden="true" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[250px] bg-gradient-to-t from-orange-500/10 via-amber-500/5 to-transparent blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Grid Container - Fully Mobile Optimized */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Interactive Map Preview */}
          <div className="flex flex-col gap-3">
            <div className="w-full h-44 sm:h-48 bg-neutral-100 dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-md border border-neutral-200/80 dark:border-neutral-800/80 relative group">
              <iframe 
                title="Pizzger Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1661.5230292616598!2d73.0765117!3d33.604109400000006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38df95002642ad41%3A0x133f9e75ab400240!2sPizzGer!5e0!3m2!1sen!2s!4v1784721376048!5m2!1sen!2s" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="grayscale contrast-125 opacity-90 group-hover:grayscale-0 transition-all duration-500"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <p className="text-[11px] sm:text-xs font-bold tracking-widest text-neutral-600 dark:text-neutral-400 uppercase">
                Main Tipu Road, Rawalpindi - Pakistan
              </p>
            </div>
          </div>

          {/* Center Column: Brand Info & Contact Actions */}
          <div className="flex flex-col items-center text-center gap-4 py-4 md:py-0">
            <Link href="/" className="inline-block group">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 dark:text-white uppercase transition-transform group-hover:scale-105 duration-300">
                PIZZGER<span className="text-orange-500">.</span>
              </h2>
            </Link>

            <p className="text-[10px] sm:text-xs font-bold tracking-widest text-orange-600 dark:text-orange-400 uppercase bg-orange-500/10 px-4 py-1.5 rounded-full border border-orange-500/20">
              Daily Dose Of Delicious
            </p>

            <div className="flex items-center gap-4 pt-2">
              {/* Call Button */}
              <a 
                href="tel:0512743930" 
                className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-neutral-900 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-600 flex items-center justify-center transition-all duration-300 shadow-sm border border-neutral-200/60 dark:border-neutral-800"
                title="Call Us"
                aria-label="Call Us"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </a>

              {/* WhatsApp Button */}
              <a 
                href="https://wa.me/923711343930" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-neutral-900 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 flex items-center justify-center transition-all duration-300 shadow-sm border border-neutral-200/60 dark:border-neutral-800"
                title="WhatsApp"
                aria-label="WhatsApp"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </a>

              {/* Email Button */}
              <a 
                href="mailto:pizzgerrawalpindi@gmail.com" 
                className="w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-neutral-900 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-600 flex items-center justify-center transition-all duration-300 shadow-sm border border-neutral-200/60 dark:border-neutral-800"
                title="Email Us"
                aria-label="Email Us"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right Column: Quick Navigation Links */}
          <div className="flex flex-col gap-4 text-center md:text-left">
            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              Quick Links
            </h3>

            <ul className="flex flex-col gap-2.5 text-xs font-bold tracking-wider uppercase text-neutral-800 dark:text-neutral-200">
              <li>
                <Link href="/about" className="hover:text-orange-500 transition-colors inline-block py-1">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-orange-500 transition-colors inline-block py-1">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-orange-500 transition-colors inline-block py-1">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a 
                  href="https://www.google.com/maps/place/PizzGer/@33.1321165,73.4148312,18.49z/data=!4m12!1m5!3m4!2zMzPCsDA3JzU0LjkiTiA3M8KwMjQnNTcuMyJF!8m2!3d33.131926!4d73.415927!3m5!1s0x39201dba899352f9:0xdf4e7734098c0640!8m2!3d33.131791!4d73.4156801!16s%2Fg%2F11fn91ds67?entry=ttu&g_ep=EgoyMDI2MDcxOS4wIKXMDSoASAFQAw%3D%3D" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-orange-600 dark:text-orange-400 hover:text-orange-500 transition-colors inline-block py-1"
                >
                  Other Locators ↗
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-12 pt-6 border-t border-neutral-200/80 dark:border-neutral-800/80 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] sm:text-xs font-black tracking-widest text-neutral-500 dark:text-neutral-400 uppercase">
            &copy; 2026 PIZZGER | RAWALPINDI. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
            <span>Crafted for Food Lovers</span>
          </div>
        </div>

      </div>
    </footer>
  );
}