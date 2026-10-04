// app/menu/page.js
import { supabase } from '@/lib/supabase';
import MenuClientWrapper from './MenuClientWrapper';
import { withStableSlugs } from '@/lib/menuSlug';
import { isVisibleNow } from '@/lib/visibility';

export const metadata = {
  title: 'Menu — Pizzger | Pizzas, Burgers, Shawarmas & More',
  description:
    'Browse the full Pizzger menu — pizzas, burgers, shawarmas, parathas, fries, wings, and exclusive midnight deals. Order online for fast delivery.',
  openGraph: {
    title: 'Pizzger Menu — Order Online',
    description: 'Explore our full menu of pizzas, burgers, shawarmas & more.',
    url: 'https://pizzgerfoods.pk/menu',
    siteName: 'Pizzger',
    images: [{ url: 'https://pizzgerfoods.pk/images/logo.webp', width: 800, height: 800 }],
    locale: 'en_PK',
    type: 'website',
  },
};

export const dynamic = 'force-dynamic';

// ⚡ Ye Server Component hai ('use client' NAHI hai yahan) — data yahan
// server par fetch hota hai, isliye jab HTML customer ke browser tak pohanchta
// hai, tab tak image URLs aur menu data usmein already maujood hote hain.
// Browser JS load/hydrate hone ka wait kiye bagair hi images preload/priority
// download karna shuru kar deta hai — yahi wo "customer aaye jese hi
// preloaded hon images" wala asal fix hai.

export default async function MenuPage() {
  const [
    { data: catData, error: catError },
    { data: itemData, error: itemError },
    { data: settingsData },
  ] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true }),
    supabase
      .from('menu_items')
      .select('*')
      .order('display_order', { ascending: true }),
    supabase
      .from('settings')
      .select('opening_time, closing_time')
      .limit(1)
      .maybeSingle(),
  ]);

  if (catError) console.error('Error fetching categories:', catError);
  if (itemError) console.error('Error fetching menu items:', itemError);

  const settings = settingsData || null;
  const now = new Date();

  // ✅ Slugs first on the FULL ordered list — so a temporarily hidden
  // category does not shift the slugs of the other categories.
  const allCats = withStableSlugs(catData || []);

  // Then filter by the smart visibility rule (manual hide / schedule / date range).
  const categories = allCats.filter((c) => isVisibleNow(c, settings, now));
  const menuItems = (itemData || []).filter((i) => isVisibleNow(i, settings, now));

  // Grouping bhi ab yahan, server par, ek hi baar hoti hai —
  // client ko koi extra kaam nahi karna parta
  const itemsByCategory = {};
  for (const item of menuItems) {
    if (!itemsByCategory[item.category_id]) itemsByCategory[item.category_id] = [];
    itemsByCategory[item.category_id].push(item);
  }

  return (
    <MenuClientWrapper
      initialCategories={categories}
      itemsByCategory={itemsByCategory}
    />
  );
}