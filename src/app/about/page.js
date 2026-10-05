// src/app/about/page.js
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'About — Pizzger',
  description: "Serving Rawalpindi's favorite daily dose of delicious fast food, fusion parathas, and legendary burgers right from Main Tipu Road.",
};

async function getAboutData() {
  try {
    const { data } = await supabase
      .from('site_pages')
      .select('*')
      .eq('key', 'about')
      .maybeSingle();
    return data || null;
  } catch (err) {
    console.error('Failed to fetch about page:', err);
    return null;
  }
}

export default async function AboutUsPage() {
  const page = await getAboutData();

  const title = page?.title || 'About';
  const titleHighlight = page?.title_highlight || 'PizzGer';
  const badge = page?.badge_text || 'The Ultimate Vibe';
  const subtitle = page?.subtitle || "Serving Rawalpindi's favorite daily dose of delicious fast food, fusion parathas, and legendary burgers right from Main Tipu Road.";

  const storyTitle = page?.story_title || 'Our Story & Legacy';
  const storyParagraphs = Array.isArray(page?.story_paragraphs)
    ? page.story_paragraphs.filter((p) => typeof p === 'string' && p.trim())
    : [];

  const pillars = Array.isArray(page?.points)
    ? page.points.filter((p) => p && p.hidden !== true)
    : [];

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] dark:bg-[#120D0A] text-gray-900 dark:text-gray-100 antialiased py-16 px-6 sm:px-8 lg:px-12 relative z-0 transition-colors duration-500 overflow-x-hidden">

      {/* Background Central High-Intensity Orange Light Reflection */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[400px] bg-orange-600/15 dark:bg-orange-600/25 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="max-w-4xl mx-auto space-y-12 relative z-10 w-full">

        {/* Header Section */}
        <div className="text-center space-y-4">
          <span className="inline-block bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-orange-500/20">
            {badge}
          </span>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-gray-900 dark:text-white font-sans">
            {title}{titleHighlight ? ' ' : ''}
            {titleHighlight && <span className="text-orange-600 italic">{titleHighlight}</span>}
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-orange-200/70 font-medium max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Story Section */}
        {(storyTitle || storyParagraphs.length > 0) && (
          <div className="bg-white dark:bg-[#1c1410]/70 dark:backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-sm dark:shadow-[0_20px_50px_-10px_rgba(234,88,12,0.15)] border border-gray-100 dark:border-orange-500/20 space-y-6">
            {storyTitle && (
              <h2 className="text-2xl font-black uppercase tracking-tight text-gray-800 dark:text-white">
                {storyTitle}
              </h2>
            )}
            {storyParagraphs.map((p, i) => (
              <p key={i} className="text-sm sm:text-base text-gray-600 dark:text-orange-200/80 leading-relaxed font-medium">
                {p}
              </p>
            ))}
          </div>
        )}

        {/* Core Pillars Grid */}
        {pillars.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((item, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#1c1410]/70 dark:backdrop-blur-xl p-6 rounded-3xl border border-gray-100 dark:border-orange-500/20 shadow-sm space-y-2"
              >
                <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center font-black text-lg border border-orange-500/20">
                  {item.num || String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="font-extrabold text-base uppercase text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-orange-200/70 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Back Link */}
        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-block bg-gray-900 dark:bg-orange-600 hover:bg-orange-600 dark:hover:bg-orange-700 text-white font-bold px-8 py-3 rounded-2xl text-xs uppercase tracking-wider transition-colors shadow-md"
          >
            ← Back To Home
          </Link>
        </div>

      </div>
    </div>
  );
}