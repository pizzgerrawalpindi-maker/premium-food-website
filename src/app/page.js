import { supabase } from '@/lib/supabase';
import HomeClientWrapper from './HomeClientWrapper';
export const dynamic = 'force-dynamic';

async function getHomeData() {
  try {
    const [
      { data: sliderData },
      { data: promoData },
      { data: menuImagesData },
      { data: videoData }
    ] = await Promise.all([
      supabase.from('home_sliders').select('*').eq('is_hidden', false).order('display_order', { ascending: true }),
      supabase.from('home_promos').select('*').eq('is_hidden', false).order('display_order', { ascending: true }),
      supabase.from('home_menu_images').select('*').eq('is_hidden', false).order('display_order', { ascending: true }),
      supabase.from('home_videos').select('*').eq('is_hidden', false).order('display_order', { ascending: true }),
    ]);

    return {
      slider: sliderData && sliderData.length > 0 ? sliderData : [
        { img: '/images/1.webp', link: '/menu' },
        { img: '/images/2.webp', link: '/menu#midnight-deals' },
        { img: '/images/3.webp', link: '/menu#birthday-offers' },
        { img: '/images/4.webp', link: '/menu#event-section' }
      ],
      promos: promoData && promoData.length > 0 ? promoData : [
        { img: '/images/5.webp', link: '/menu#midnight-deals' },
        { img: '/images/6.webp', link: '/menu#event-section', badge: 'Most Popular' },
        { img: '/images/7.webp', link: '/menu#birthday-offers' }
      ],
      menuImages: menuImagesData && menuImagesData.length > 0 ? menuImagesData : [
        { img: '/images/8.webp', category_id: 'burgers', name: 'BURGERS' },
        { img: '/images/9.webp', category_id: 'pizzas', name: 'PIZZAS' },
        { img: '/images/10.webp', category_id: 'shawarmas', name: 'SHAWARMAS' },
        { img: '/images/11.webp', category_id: 'parathas', name: 'PARATHAS' },
        { img: '/images/12.webp', category_id: 'fries', name: 'FRIES' },
        { img: '/images/13.webp', category_id: 'side-orders', name: 'WINGS' },
        { img: '/images/14.webp', category_id: 'side-orders', name: 'NUGGETS' },
        { img: '/images/15.webp', category_id: 'pizzger-refreshment', name: 'Refreshment' },
        { img: '/images/16.webp', category_id: 'siders', name: 'SIDErs' }
      ],
      videos: videoData && videoData.length > 0 ? videoData : [
        { video_url: '/videos/a.webm' },
        { video_url: '/videos/b.webm' },
        { video_url: '/videos/c.webm' },
        { video_url: '/videos/d.webm' },
        { video_url: '/videos/e.webm' }
      ]
    };
  } catch (err) {
    console.error('Failed to fetch home dynamic data:', err);
    return { slider: [], promos: [], menuImages: [], videos: [] };
  }
}

export default async function Home() {
  const data = await getHomeData();

  return <HomeClientWrapper initialData={data} />;
}