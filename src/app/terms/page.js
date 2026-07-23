'use client';

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
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0D0907] text-gray-900 dark:text-gray-100 antialiased py-12 sm:py-20 px-4 sm:px-6 lg:px-8 relative z-0 selection:bg-orange-500 selection:text-white transition-colors duration-500">
      
      {/* Background Ambient High-Intensity Orange Light Reflection */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-gradient-to-b from-orange-500/15 to-transparent blur-[120px] pointer-events-none -z-10"></div>

      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        
        {/* Header Section */}
        <header className="text-center space-y-4">
          <span className="inline-block bg-orange-500/10 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-orange-500/20 shadow-sm">
            The fine print before the first bite
          </span>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
            Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Service</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-orange-200/70 font-medium max-w-xl mx-auto leading-relaxed">
            Please read these terms carefully before placing an order on our platform.
          </p>
        </header>

        {/* Content Box with Grid/Stack Layout */}
        <div className="bg-white/90 dark:bg-[#140F0C]/80 backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-10 shadow-2xl shadow-black/[0.03] dark:shadow-orange-950/20 border border-gray-100 dark:border-orange-500/15 space-y-8">
          
          {termsData.map((item, index) => (
            <div 
              key={index} 
              className="group relative pl-6 sm:pl-8 border-l-2 border-orange-500/30 hover:border-orange-500 transition-colors duration-300 space-y-2 py-1"
            >
              <div className="flex items-center gap-3">
                <span className="text-orange-600 dark:text-orange-400 font-black text-xs sm:text-sm uppercase tracking-widest bg-orange-500/10 px-2.5 py-1 rounded-lg">
                  {item.num}.
                </span>
                <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-gray-900 dark:text-white">
                  {item.title}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-orange-200/70 leading-relaxed font-medium pl-1">
                {item.desc}
              </p>
            </div>
          ))}

        </div>

        {/* Notice Box */}
        <div className="bg-orange-500/5 dark:bg-[#18110e] border border-orange-500/20 rounded-3xl p-6 sm:p-8 space-y-2 shadow-sm backdrop-blur-xl">
          <h3 className="text-xs font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">Notice to Customers</h3>
          <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-orange-100/80 leading-relaxed">
            By placing an order on our platform, you automatically agree to abide by the rules mentioned above. Failure to comply may result in order rejection.
          </p>
        </div>

        {/* Back Link */}
        <div className="text-center pt-2">
          <a 
            href="/" 
            className="inline-block bg-gray-900 dark:bg-orange-600 hover:bg-black dark:hover:bg-orange-500 text-white font-extrabold px-8 py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-orange-600/20 active:scale-95"
          >
            ← Back To Home
          </a>
        </div>

      </div>
    </div>
  );
}