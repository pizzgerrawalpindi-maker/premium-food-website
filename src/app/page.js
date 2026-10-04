// app/page.js
import { supabase } from '@/lib/supabase';
import HomeClientWrapper from './HomeClientWrapper';
import { withStableSlugs } from '@/lib/menuSlug';
import { isVisibleNow } from '@/lib/visibility';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pizzger — Order Delicious Pizzas, Burgers & Fast Food in Rawalpindi',
  description: 'Order fresh pizzas, juicy burgers, shawarmas, and more from Pizzger in Rawalpindi. Fast delivery, midnight deals, and exclusive offers. Order online now!',
  openGraph: {
    title: 'Pizzger — Daily Dose Of Delicious',
    description: 'Order fresh pizzas, burgers, shawarmas & more. Fast delivery across Rawalpindi & Islamabad.',
    url: 'https://pizzgerfoods.pk',
    siteName: 'Pizzger',
    images: [{ url: 'https://pizzgerfoods.pk/images/logo.webp', width: 800, height: 800 }],
    locale: 'en_PK',
    type: 'website',
  },
};

async function getHomeData() {
  try {
    const [
      { data: sliderData },
      { data: promoData },
      { data: videoData },
      { data: categoryData },
      { data: settingsData },
      offerRes,
    ] = await Promise.all([
      supabase.from('home_sliders').select('*').eq('is_hidden', false).order('display_order', { ascending: true }),
      supabase.from('home_promos').select('*').eq('is_hidden', false).order('display_order', { ascending: true }),
      supabase.from('home_videos').select('*').eq('is_hidden', false).order('display_order', { ascending: true }),
      supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true }),
      supabase
        .from('settings')
        .select('opening_time, closing_time')
        .limit(1)
        .maybeSingle(),
      supabase.from('home_offer').select('*').eq('id', 1).maybeSingle(),
    ]);

    const settings = settingsData || null;
    const now = new Date();

    // ✅ Slugs first on the FULL ordered list — so a temporarily hidden
    // category does not shift the slugs of the other categories.
    const allCats = withStableSlugs(categoryData || []);

    // Then filter by the smart visibility rule (manual hide / schedule / date range).
    const cats = allCats.filter((c) => isVisibleNow(c, settings, now));
    const slugSet = new Set(cats.map((c) => c.slug).filter(Boolean));

    // Home tiles come straight from the categories table — no more guessing.
    const menuImages = cats
      .filter((c) => c.show_on_home !== false)
      .map((c) => ({
        id: c.id,
        name: c.name,
        img: c.home_image || '',
        category_slug: c.slug,
      }));

    // Deals slug — prefer exact match, else any "deal" category, else first.
    const dealsSlug =
      (slugSet.has('exclusive-deals') && 'exclusive-deals') ||
      cats.find((c) => /deal/i.test(`${c.slug || ''} ${c.name || ''}`))?.slug ||
      cats[0]?.slug ||
      'exclusive-deals';

    // Warn (dev-friendly) on bad manual links in sliders/promos.
    const checkLink = (row) => {
      const m = /^\/menu#(.+)$/.exec(row.link || '');
      if (m && cats.length && !slugSet.has(decodeURIComponent(m[1]))) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            `[home] link "${row.link}" does not match any visible menu category`
          );
        }
      }
      return row;
    };

    return {
      slider: (sliderData && sliderData.length > 0
        ? sliderData
        : [
            { img: '/images/1.webp', link: '/menu' },
            { img: '/images/2.webp', link: '/menu#midnight-deals' },
            { img: '/images/3.webp', link: '/menu#birthday-offers' },
            { img: '/images/4.webp', link: '/menu#event-section' },
          ]
      ).map(checkLink),
      promos: (promoData && promoData.length > 0
        ? promoData
        : [
            { img: '/images/5.webp', link: '/menu#midnight-deals' },
            { img: '/images/6.webp', link: '/menu#event-section', badge: 'Most Popular' },
            { img: '/images/7.webp', link: '/menu#birthday-offers' },
          ]
      ).map(checkLink),
      menuImages,
      videos:
        videoData && videoData.length > 0
          ? videoData
          : [
              { video_url: '/videos/a.webm' },
              { video_url: '/videos/b.webm' },
              { video_url: '/videos/c.webm' },
              { video_url: '/videos/d.webm' },
              { video_url: '/videos/e.webm' },
            ],
      dealsSlug,
      offer: offerRes.error ? undefined : offerRes.data ?? null,
    };
  } catch (err) {
    console.error('Failed to fetch home dynamic data:', err);
    return {
      slider: [],
      promos: [],
      menuImages: [],
      videos: [],
      dealsSlug: 'exclusive-deals',
      offer: undefined,
    };
  }
}

export default async function Home() {
  const data = await getHomeData();
  return <HomeClientWrapper initialData={data} />;
}