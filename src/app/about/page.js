export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#120D0A] text-gray-900 dark:text-gray-100 antialiased py-16 px-6 sm:px-8 lg:px-12 relative z-0 transition-colors duration-500">
      
      {/* Background Central High-Intensity Orange Light Reflection */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-orange-600/15 dark:bg-orange-600/25 rounded-full blur-[140px] pointer-events-none -z-10"></div>

      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <span className="bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-orange-500/20">
            The Ultimate Vibe
          </span>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-gray-900 dark:text-white font-sans">
            About <span className="text-orange-600 italic">PizzGer</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-orange-200/70 font-medium max-w-2xl mx-auto">
            Serving Rawalpindi's favorite daily dose of delicious fast food, fusion parathas, and legendary burgers right from Main Tipu Road.
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-white dark:bg-[#1c1410]/70 dark:backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-sm dark:shadow-[0_20px_50px_-10px_rgba(234,88,12,0.15)] border border-gray-100 dark:border-orange-500/20 space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tight text-gray-800 dark:text-white">
            Our Story & Legacy
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-orange-200/80 leading-relaxed font-medium">
            Nestled on <strong className="text-gray-900 dark:text-white">Main Tipu Road, Rawalpindi</strong>, <strong className="text-gray-900 dark:text-white">PizzGer</strong> started with a bold mission: to revolutionize the fast-casual dining experience by blending exceptional taste with unmatched quality. What began as a passionate food hub has evolved into a local landmark trusted by food enthusiasts across the twin cities.
          </p>
          <p className="text-sm sm:text-base text-gray-600 dark:text-orange-200/80 leading-relaxed font-medium">
            From our iconic <span className="text-orange-600 dark:text-orange-400 font-bold">Pizzger Special Burgers</span> and innovative <span className="text-orange-600 dark:text-orange-400 font-bold">Pizza Parathas</span> to mouthwatering loaded fries and crispy wings, every recipe is crafted to perfection. We believe that great food brings people together, and our kitchen works tirelessly every single day to maintain that standard of excellence.
          </p>
        </div>

        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#1c1410]/70 dark:backdrop-blur-xl p-6 rounded-3xl border border-gray-100 dark:border-orange-500/20 shadow-sm space-y-2">
            <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center font-black text-lg border border-orange-500/20">01</div>
            <h3 className="font-extrabold text-base uppercase text-gray-900 dark:text-white">Premium Ingredients</h3>
            <p className="text-xs text-gray-500 dark:text-orange-200/70 leading-relaxed">We source top-grade cheese, fresh chicken, and crisp vegetables daily to ensure supreme taste in every bite.</p>
          </div>

          <div className="bg-white dark:bg-[#1c1410]/70 dark:backdrop-blur-xl p-6 rounded-3xl border border-gray-100 dark:border-orange-500/20 shadow-sm space-y-2">
            <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center font-black text-lg border border-orange-500/20">02</div>
            <h3 className="font-extrabold text-base uppercase text-gray-900 dark:text-white">Innovative Fusion</h3>
            <p className="text-xs text-gray-500 dark:text-orange-200/70 leading-relaxed">Pioneering unique culinary creations like our signature Pizza Parathas and stacked Tower Burgers.</p>
          </div>

          <div className="bg-white dark:bg-[#1c1410]/70 dark:backdrop-blur-xl p-6 rounded-3xl border border-gray-100 dark:border-orange-500/20 shadow-sm space-y-2">
            <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center font-black text-lg border border-orange-500/20">03</div>
            <h3 className="font-extrabold text-base uppercase text-gray-900 dark:text-white">Rawalpindi's Pride</h3>
            <p className="text-xs text-gray-500 dark:text-orange-200/70 leading-relaxed">Centrally located on Tipu Road, delivering hot, fresh, and delightful meals right to your doorstep with lightning speed.</p>
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