export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 antialiased py-16 px-6 sm:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
            Legal Guidelines
          </span>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-gray-900 font-sans">
            Terms of <span className="text-orange-600 italic">Service</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 font-medium max-w-2xl mx-auto">
            Please read these terms carefully before placing an order or using our services at PizzGer.
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 space-y-8">
          
          <div className="space-y-3">
            <h2 className="text-lg font-black uppercase text-gray-900">1. Acceptance of Terms</h2>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              By accessing our website or placing an order through PizzGer, you agree to be bound by these Terms of Service and all applicable laws and regulations in Rawalpindi, Pakistan.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-black uppercase text-gray-900">2. Orders & Minimum Pricing</h2>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              All orders are subject to availability and confirmation of the order price. A minimum order amount of Rs. 600 is required to successfully place a delivery order. We reserve the right to refuse any order placed with us.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-black uppercase text-gray-900">3. Delivery & Scheduling</h2>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              We strive to deliver orders within the estimated timeframe (ASAP 30-45 minutes or scheduled time). However, delivery times may vary due to weather conditions, traffic, or unforeseen circumstances on Main Tipu Road and surrounding areas.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-black uppercase text-gray-900">4. Pricing & Modifications</h2>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              Prices for our menu items are subject to change without notice. We reserve the right at any time to modify or discontinue any service or product without liability.
            </p>
          </div>

        </div>

        {/* Back Link */}
        <div className="text-center pt-4">
          <a href="/" className="inline-block bg-gray-900 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-2xl text-xs uppercase tracking-wider transition-colors">
            ← Back To Home
          </a>
        </div>

      </div>
    </div>
  );
}