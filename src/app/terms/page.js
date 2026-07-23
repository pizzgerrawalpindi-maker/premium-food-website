'use client';

import Link from 'next/link';

export default function TermsPage() {
  const termsData = [
    {
      num: "01",
      title: "Service Availability",
      desc: "The service is available only within selected delivery areas and operating hours. Availability may be affected by weather, traffic, or operational conditions."
    },
    {
      num: "02",
      title: "Order Confirmation",
      desc: "Orders are confirmed only after successful payment or verification. Orders may be cancelled if items are unavailable or due to technical issues."
    },
    {
      num: "03",
      title: "Minimum Order Value",
      desc: "A minimum order value of Rs. 600 is required for delivery. Orders below this amount will not be processed."
    },
    {
      num: "04",
      title: "Pricing & Taxes",
      desc: "All prices are subject to applicable taxes (including GST) and may change without prior notice."
    },
    {
      num: "05",
      title: "Delivery Estimates",
      desc: "Delivery times are estimated and may vary due to factors such as traffic, order volume, or weather conditions."
    },
    {
      num: "06",
      title: "Refunds & Returns",
      desc: "Food items are non-returnable. Refunds are only issued for incorrect, damaged, or incomplete orders after proper verification."
    },
    {
      num: "07",
      title: "Intellectual Property",
      desc: "All website content, including images, text, graphics, and design, is the property of the business and cannot be copied or reused without permission."
    },
    {
      num: "08",
      title: "Accuracy of Information",
      desc: "Customers must provide accurate delivery and contact details. Failed deliveries due to incorrect information are not the responsibility of the business."
    },
    {
      num: "09",
      title: "Promotional Offers",
      desc: "Discounts, coupons, and promotional offers are subject to specific terms and validity and cannot be combined unless explicitly stated."
    },
    {
      num: "10",
      title: "Policy Updates",
      desc: "The business reserves the right to update or modify these Terms & Conditions at any time. Users are responsible for reviewing updates."
    }
  ];

  return (
    <main className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0705] text-neutral-900 dark:text-neutral-100 antialiased selection:bg-orange-500 selection:text-white transition-colors duration-300 relative overflow-hidden">
      
      {/* Optimized Modern Ambient Background Glow */}
      <div aria-hidden="true" className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[350px] sm:h-[450px] bg-gradient-to-b from-orange-500/10 via-amber-500/5 to-transparent blur-[90px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10 space-y-12">
        
        {/* Header Section */}
        <header className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-orange-500/20 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            The fine print before the first bite
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">
            Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Service</span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
            Please read these terms carefully before placing an order on our platform.
          </p>
        </header>

        {/* Modern Bento-Style Grid Layout for Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {termsData.map((item, index) => (
            <article 
              key={index} 
              className="group relative bg-white/80 dark:bg-[#140F0D]/80 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm hover:shadow-xl hover:border-orange-500/40 dark:hover:border-orange-500/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black tracking-widest text-orange-600 dark:text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/10">
                    {item.num}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-bold uppercase tracking-wide text-neutral-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {item.title}
                </h2>

                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Notice Box */}
        <aside className="bg-orange-500/5 dark:bg-orange-950/20 border border-orange-500/20 rounded-3xl p-6 sm:p-8 space-y-2 backdrop-blur-xl">
          <h3 className="text-xs font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">
            Notice to Customers
          </h3>
          <p className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 leading-relaxed">
            By placing an order on our platform, you automatically agree to abide by the rules mentioned above. Failure to comply may result in order rejection.
          </p>
        </aside>

        {/* Back Link - Optimized with Next/Link */}
        <div className="text-center pt-4">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center gap-2 bg-neutral-900 dark:bg-orange-600 hover:bg-neutral-800 dark:hover:bg-orange-500 text-white font-bold px-8 py-4 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-orange-500/25 active:scale-95"
          >
            <span>←</span> Back To Home
          </Link>
        </div>

      </div>
    </main>
  );
}