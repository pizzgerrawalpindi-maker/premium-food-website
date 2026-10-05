// src/app/privacy/page.js
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Privacy Policy — Pizzger',
  description: 'How Pizzger collects, uses and protects your personal information.',
};

async function getPrivacyData() {
  try {
    const { data } = await supabase
      .from('site_pages')
      .select('*')
      .eq('key', 'privacy')
      .maybeSingle();
    return data || null;
  } catch (err) {
    console.error('Failed to fetch privacy page:', err);
    return null;
  }
}

export default async function PrivacyPage() {
  const page = await getPrivacyData();

  const title = page?.title || 'Privacy Policy';
  const badge = page?.badge_text || 'Secure & Trusted';
  const subtitle = page?.subtitle || 'We value your privacy like our secret sauces. Your trust is our main ingredient.';
  const points = Array.isArray(page?.points)
    ? page.points.filter((p) => p && p.hidden !== true)
    : [];

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] dark:bg-[#120D0A] text-gray-900 dark:text-gray-100 antialiased py-16 px-6 sm:px-8 lg:px-12 relative z-0 transition-colors duration-500 overflow-x-hidden">

      {/* Background Central High-Intensity Orange Light Reflection */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-2xl h-100 bg-orange-600/15 dark:bg-orange-600/25 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="max-w-4xl mx-auto space-y-12 relative z-10 w-full">

        {/* Header */}
        <div className="text-center space-y-4">
          <span className="inline-block bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-orange-500/20">
            {badge}
          </span>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-gray-900 dark:text-white font-sans">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-orange-200/70 font-medium max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white dark:bg-[#1c1410]/70 dark:backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-sm dark:shadow-[0_20px_50px_-10px_rgba(234,88,12,0.15)] border border-gray-100 dark:border-orange-500/20 space-y-8">

          {points.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-orange-200/70 font-medium text-center py-6">
              No policy points are published yet.
            </p>
          ) : (
            points.map((p, i) => (
              <div key={i} className="space-y-2">
                <span className="text-orange-600 dark:text-orange-400 font-black text-xs uppercase tracking-widest">
                  {p.num || String(i + 1).padStart(2, '0')}. {p.title}
                </span>
                <p className="text-sm text-gray-600 dark:text-orange-200/80 leading-relaxed font-medium">
                  {p.desc}
                </p>
              </div>
            ))
          )}

        </div>

        {/* Back Link */}
        <div className="text-center pt-4">
          <Link href="/" className="inline-block bg-gray-900 dark:bg-orange-600 hover:bg-orange-600 dark:hover:bg-orange-700 text-white font-bold px-8 py-3 rounded-2xl text-xs uppercase tracking-wider transition-colors shadow-md">
            ← Back To Home
          </Link>
        </div>

      </div>
    </div>
  );
}