export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#120D0A] text-gray-900 dark:text-gray-100 antialiased py-16 px-6 sm:px-8 lg:px-12 relative z-0 transition-colors duration-500">
      
      {/* Background Central High-Intensity Orange Light Reflection */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-orange-600/15 dark:bg-orange-600/25 rounded-full blur-[140px] pointer-events-none -z-10"></div>

      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-orange-500/20">
            Secure & Trusted
          </span>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-gray-900 dark:text-white font-sans">
            Privacy <span className="text-orange-600 italic">Policy</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-orange-200/70 font-medium max-w-2xl mx-auto">
            We value your privacy like our secret sauces. Your trust is our main ingredient.
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white dark:bg-[#1c1410]/70 dark:backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-sm dark:shadow-[0_20px_50px_-10px_rgba(234,88,12,0.15)] border border-gray-100 dark:border-orange-500/20 space-y-8">
          
          <div className="space-y-2">
            <span className="text-orange-600 dark:text-orange-400 font-black text-xs uppercase tracking-widest">01. Information Collection</span>
            <p className="text-sm text-gray-600 dark:text-orange-200/80 leading-relaxed font-medium">
              We collect basic customer information such as name, phone number, address, and order details only for processing and delivering orders.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-orange-600 dark:text-orange-400 font-black text-xs uppercase tracking-widest">02. Data Sharing</span>
            <p className="text-sm text-gray-600 dark:text-orange-200/80 leading-relaxed font-medium">
              All personal information is kept strictly confidential and is only shared with delivery partners or payment processors when necessary to complete an order.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-orange-600 dark:text-orange-400 font-black text-xs uppercase tracking-widest">03. Payment Details</span>
            <p className="text-sm text-gray-600 dark:text-orange-200/80 leading-relaxed font-medium">
              We do not store or have access to your payment details; all payments are securely handled by trusted third-party payment gateways.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-orange-600 dark:text-orange-400 font-black text-xs uppercase tracking-widest">04. Communications & Opt-Out</span>
            <p className="text-sm text-gray-600 dark:text-orange-200/80 leading-relaxed font-medium">
              Contact information may be used for order updates, service notifications, and promotional messages. Users can opt out of promotional messages at any time.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-orange-600 dark:text-orange-400 font-black text-xs uppercase tracking-widest">05. Cookies & Tracking</span>
            <p className="text-sm text-gray-600 dark:text-orange-200/80 leading-relaxed font-medium">
              We use cookies to improve user experience, analyze website performance, and personalize content. Users can disable cookies through their browser settings.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-orange-600 dark:text-orange-400 font-black text-xs uppercase tracking-widest">06. Service Improvement</span>
            <p className="text-sm text-gray-600 dark:text-orange-200/80 leading-relaxed font-medium">
              Collected data may be used for improving services, website performance, and customer experience, but it will never be used to personally identify users.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-orange-600 dark:text-orange-400 font-black text-xs uppercase tracking-widest">07. Third-Party Links</span>
            <p className="text-sm text-gray-600 dark:text-orange-200/80 leading-relaxed font-medium">
              Our website may contain links to third-party services. We are not responsible for their privacy policies or content.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-orange-600 dark:text-orange-400 font-black text-xs uppercase tracking-widest">08. Security Measures</span>
            <p className="text-sm text-gray-600 dark:text-orange-200/80 leading-relaxed font-medium">
              We apply reasonable security measures to protect user data, but no online system can guarantee 100% security.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-orange-600 dark:text-orange-400 font-black text-xs uppercase tracking-widest">09. Data Retention</span>
            <p className="text-sm text-gray-600 dark:text-orange-200/80 leading-relaxed font-medium">
              Personal data is retained only for as long as necessary for operational or legal purposes and is securely deleted afterward.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-orange-600 dark:text-orange-400 font-black text-xs uppercase tracking-widest">10. Policy Updates</span>
            <p className="text-sm text-gray-600 dark:text-orange-200/80 leading-relaxed font-medium">
              By using this website, users agree to this Privacy Policy. We may update it from time to time without prior notice.
            </p>
          </div>

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