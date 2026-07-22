export default function Footer() {
  return (
    <footer className="bg-white text-gray-800 pt-16 pb-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
        
        {/* Left Column: Rounded Map Preview & Location */}
        <div className="flex flex-col gap-3">
          <div className="w-full h-44 bg-gray-100 rounded-3xl overflow-hidden shadow-lg border border-gray-200 relative">
            <iframe 
              title="Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3321.355!2d73.0765117!3d33.6041094!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38df95002642ad41%3A0x133f9e75ab400240!8m2!3d33.6041094!4d73.0765117!16s%2Fg%2F11ml06jkl0!5e0!3m2!1sen!2spk!4v1000000000000!5m2!1sen!2spk" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy"
              className="grayscale contrast-125 opacity-90"
            ></iframe>
          </div>
          <p className="text-xs font-black tracking-widest text-gray-700 uppercase mt-1">
            MAIN TIPU ROAD, RAWALPINDI - PAKISTAN
          </p>
        </div>

        {/* Center Column: Orange Brand, Tagline & Icons */}
        <div className="flex flex-col items-center text-center gap-3 md:mt-2">
          <h2 className="text-4xl font-black italic tracking-tighter text-orange-600 uppercase font-sans">
            PIZZGER.
          </h2>
          <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
            DAILY DOSE OF DELICIOUS
          </p>
          <div className="flex items-center gap-8 mt-4 text-gray-900">
            {/* Call Icon */}
            <a href="tel:0512743930" className="hover:text-orange-600 transition-colors" title="Call">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </a>
            {/* Message / WhatsApp Icon */}
            <a href="https://wa.me/923711343930" target="_blank" rel="noopener noreferrer" className="hover:text-orange-600 transition-colors" title="WhatsApp">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </a>
            {/* Email Icon */}
            <a href="mailto:pizzgerrawalpindi@gmail.com" className="hover:text-orange-600 transition-colors" title="Email">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Right Column: Links & Copyright */}
        <div className="flex flex-col gap-3">
          <ul className="flex flex-col gap-3 text-xs font-black tracking-wider text-gray-900 uppercase">
            <li>
              <a href="/about" className="hover:text-orange-600 transition-colors">ABOUT US</a>
            </li>
            <li>
              <a href="/terms" className="hover:text-orange-600 transition-colors">TERMS OF SERVICE</a>
            </li>
            <li>
              <a href="/privacy" className="hover:text-orange-600 transition-colors">PRIVACY POLICY</a>
            </li>
            <li>
              <a href="https://www.google.com/maps/place/PizzGer/@33.1321165,73.4148312,18.49z/data=!4m12!1m5!3m4!2zMzPCsDA3JzU0LjkiTiA3M8KwMjQnNTcuMyJF!8m2!3d33.131926!4d73.415927!3m5!1s0x39201dba899352f9:0xdf4e7734098c0640!8m2!3d33.131791!4d73.4156801!16s%2Fg%2F11fn91ds67?entry=ttu&g_ep=EgoyMDI2MDcxOS4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700 transition-colors">OTHER LOCATORS</a>
            </li>
          </ul>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-[11px] font-black tracking-widest text-gray-900 uppercase">
              &copy; 2026 PIZZGER | RAWALPINDI
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}