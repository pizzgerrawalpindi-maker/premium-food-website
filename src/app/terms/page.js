export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#120D0A] text-gray-900 dark:text-gray-100 antialiased py-16 px-6 sm:px-8 lg:px-12 relative z-0 transition-colors duration-500">
      
      {/* Background Central High-Intensity Orange Light Reflection */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-orange-600/15 dark:bg-orange-600/25 rounded-full blur-[140px] pointer-events-none -z-10"></div>

      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-orange-500/20">
            The fine print before the first bite
          </span>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-gray-900 dark:text-white font-sans">
            Terms of <span className="text-orange-600 italic">Service</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-orange-200/70 font-medium max-w-2xl mx-auto">
            Please read these terms carefully before placing an order on our platform.
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white dark:bg-[#1c1410]/70 dark:backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-sm dark:shadow-[0_20px_50px_-10px_rgba(234,88,12,0.15)] border border-gray-100 dark:border-orange-500/20 space-y-8">
          
          <div className="space-y-2">
            <span className="text-orange-600 dark:text-orange-400 font-black text-xs uppercase tracking-widest">01. Service Availability</span>
            <p className="text-sm text-gray-600 dark:text-orange-200/80 leading-relaxed font-medium">
              The service is available only within selected delivery areas and operating hours. Availability may be affected by weather, traffic, or operational conditions.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-orange-600 dark:text-orange-400 font-black text-xs uppercase tracking-widest">02. Order Confirmation</span>
            <p className="text-sm text-gray-600 dark:text-orange-200/80 leading-relaxed font-medium">
              Orders are confirmed only after successful payment or verification. Orders may be cancelled if items are unavailable or due to technical issues.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-orange-600 dark:text-orange-400 font-black text-xs uppercase tracking-widest">03. Minimum Order Value</span>
            <p className="text-sm text-gray-600 dark:text-orange-200/80 leading-relaxed font-medium">
              A minimum order value of 600 is required for delivery. Orders below this amount will not be processed.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-orange-600 dark:text-orange-400 font-black text-xs uppercase tracking-widest">04. Pricing & Taxes</span>
            <p className="text-sm text-gray-600 dark:text-orange-200/80 leading-relaxed font-medium">
              All prices are subject to applicable taxes (including GST) and may change without prior notice.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-orange-600 dark:text-orange-400 font-black text-xs uppercase tracking-widest">05. Delivery Estimates</span>
            <p className="text-sm text-gray-600 dark:text-orange-200/80 leading-relaxed font-medium">
              Delivery times are estimated and may vary due to factors such as traffic, order volume, or weather conditions.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-orange-600 dark:text-orange-400 font-black text-xs uppercase tracking-widest">06. Refunds & Returns</span>
            <p className="text-sm text-gray-600 dark:text-orange-200/80 leading-relaxed font-medium">
              Food items are non-returnable. Refunds are only issued for incorrect, damaged, or incomplete orders after proper verification.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-orange-600 dark:text-orange-400 font-black text-xs uppercase tracking-widest">07. Intellectual Property</span>
            <p className="text-sm text-gray-600 dark:text-orange-200/80 leading-relaxed font-medium">
              All website content, including images, text, graphics, and design, is the property of the business and cannot be copied or reused without permission.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-orange-600 dark:text-orange-400 font-black text-xs uppercase tracking-widest">08. Accuracy of Information</span>
            <p className="text-sm text-gray-600 dark:text-orange-200/80 leading-relaxed font-medium">
              Customers must provide accurate delivery and contact details. Failed deliveries due to incorrect information are not the responsibility of the business.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-orange-600 dark:text-orange-400 font-black text-xs uppercase tracking-widest">09. Promotional Offers</span>
            <p className="text-sm text-gray-600 dark:text-orange-200/80 leading-relaxed font-medium">
              Discounts, coupons, and promotional offers are subject to specific terms and validity and cannot be combined unless explicitly stated.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-orange-600 dark:text-orange-400 font-black text-xs uppercase tracking-widest">010. Policy Updates</span>
            <p className="text-sm text-gray-600 dark:text-orange-200/80 leading-relaxed font-medium">
              The business reserves the right to update or modify these Terms & Conditions at any time. Users are responsible for reviewing updates.
            </p>
          </div>

        </div>

        {/* Notice Box */}
        <div className="bg-orange-50 dark:bg-[#18110e] border border-orange-200 dark:border-orange-500/30 rounded-3xl p-6 sm:p-8 space-y-2 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">Notice to Customers</h3>
          <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-orange-100/80 leading-relaxed">
            By placing an order on our platform, you automatically agree to abide by the rules mentioned above. Failure to comply may result in order rejection.
          </p>
        </div>

        {/* Back Link */}
        <div className="text-center pt-4">
          <a href="/" className="inline-block bg-gray-900 dark:bg-orange-600 hover:bg-orange-600 dark:hover:bg-orange-700 text-white font-bold px-8 py-3 rounded-2xl text-xs uppercase tracking-wider transition-colors shadow-md">
            ← Back To Home
          </a>
        </div>

      </div>
    </div>
  );
}