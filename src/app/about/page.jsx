export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 antialiased py-16 px-6 sm:px-8 lg:px-12">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <span className="bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
            Established Excellence
          </span>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-gray-900 font-sans">
            About <span className="text-orange-600 italic">PizzGer</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 font-medium max-w-2xl mx-auto">
            Redefining the art of fast-casual dining with unmatched taste, premium ingredients, and a passion for perfection in Rawalpindi.
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-800">
            Our Story & Heritage
          </h2>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium">
            Located at the heart of Main Tipu Road, Rawalpindi, <strong className="text-gray-900">PizzGer</strong> was born out of a singular obsession: to serve a daily dose of deliciousness that leaves a lasting impression. What started as a vision to deliver premium-quality fast food has grown into a landmark destination for food lovers who refuse to compromise on taste or quality.
          </p>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium">
            Every crust we stretch, every sauce we simmer, and every recipe we craft reflects our commitment to culinary excellence. We combine local warmth with international standards to ensure that every single bite delivers pure satisfaction.
          </p>
        </div>

        {/* Why Choose Us Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center font-black text-lg">01</div>
            <h3 className="font-extrabold text-base uppercase text-gray-900">100% Fresh Ingredients</h3>
            <p className="text-xs text-gray-500 leading-relaxed">We source the finest local and imported ingredients daily to maintain superior quality.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center font-black text-lg">02</div>
            <h3 className="font-extrabold text-base uppercase text-gray-900">Signature Recipes</h3>
            <p className="text-xs text-gray-500 leading-relaxed">Crafted exclusively by expert culinary minds to give you unique and unforgettable flavors.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center font-black text-lg">03</div>
            <h3 className="font-extrabold text-base uppercase text-gray-900">Lightning Fast Service</h3>
            <p className="text-xs text-gray-500 leading-relaxed">Whether dining in or ordering to your doorstep, freshness arrives hot and right on time.</p>
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