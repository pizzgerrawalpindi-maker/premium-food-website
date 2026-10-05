// src/app/terms/page.js
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Terms of Service — Pizzger',
  description: 'The rules that apply when you order from Pizzger.',
};

async function getTermsData() {
  try {
    const { data } = await supabase
      .from('site_pages')
      .select('*')
      .eq('key', 'terms')
      .maybeSingle();
    return data || null;
  } catch (err) {
    console.error('Failed to fetch terms page:', err);
    return null;
  }
}

export default async function TermsPage() {
  const page = await getTermsData();

  const title = page?.title || 'Terms of Service';
  const badge = page?.badge_text || 'The fine print before the first bite';
  const subtitle = page?.subtitle || 'Please read these terms carefully before placing an order on our platform.';
  const points = Array.isArray(page?.points)
    ? page.points.filter((p) => p && p.hidden !== true)
    : [];

  return (
    <main className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0705] text-neutral-900 dark:text-neutral-100 antialiased selection:bg-orange-500 selection:text-white transition-colors duration-300 relative overflow-hidden">

      {/* Ambient Background Glow */}
      <div aria-hidden="true" className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[350px] sm:h-[450px] bg-gradient-to-b from-orange-500/10 via-amber-500/5 to-transparent blur-[90px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10 space-y-12">

        {/* Header Section */}
        <header className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-orange-500/20 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            {badge}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">
            {title}
          </h1>

          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
            {subtitle}
          </p>
        </header>

        {/* Points Grid */}
        {points.length === 0 ? (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium text-center py-6">
            No terms are published yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {points.map((item, index) => (
              <article
                key={index}
                className="group relative bg-white/80 dark:bg-[#140F0D]/80 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm hover:shadow-xl hover:border-orange-500/40 dark:hover:border-orange-500/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-widest text-orange-600 dark:text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/10">
                      {item.num || String(index + 1).padStart(2, '0')}
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
        )}

        {/* Notice Box */}
        <aside className="bg-orange-500/5 dark:bg-orange-950/20 border border-orange-500/20 rounded-3xl p-6 sm:p-8 space-y-2 backdrop-blur-xl">
          <h3 className="text-xs font-black uppercase tracking-widest text-orange-600 dark:text-orange-400">
            Notice to Customers
          </h3>
          <p className="text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 leading-relaxed">
            By placing an order on our platform, you automatically agree to abide by the rules mentioned above. Failure to comply may result in order rejection.
          </p>
        </aside>

        {/* Back Link */}
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