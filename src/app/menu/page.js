import { supabase } from '@/lib/supabase';
import MenuClientWrapper from './MenuClientWrapper';

// ⚡ Ye Server Component hai ('use client' NAHI hai yahan) — data yahan
// server par fetch hota hai, isliye jab HTML customer ke browser tak pohanchta
// hai, tab tak image URLs aur menu data usmein already maujood hote hain.
// Browser JS load/hydrate hone ka wait kiye bagair hi images preload/priority
// download karna shuru kar deta hai — yahi wo "customer aaye jese hi
// preloaded hon images" wala asal fix hai.

export const revalidate = 60; // ISR: har 60 second baad background mein fresh data aa jayegi
// Agar menu roz-roz change hota hai toh 60 rakhein, agar bohat kam change
// hota hai (jaise hafte mein ek baar) toh 3600 (1 ghanta) ya isse zyada kar dein —
// jitna zyada revalidate time, utni hi tez aur sasti requests (Supabase par kam load).

export default async function MenuPage() {
  const [{ data: catData, error: catError }, { data: itemData, error: itemError }] = await Promise.all([
    supabase.from('categories').select('*').order('display_order', { ascending: true }),
    supabase.from('menu_items').select('*').order('display_order', { ascending: true }),
  ]);

  if (catError) console.error('Error fetching categories:', catError);
  if (itemError) console.error('Error fetching menu items:', itemError);

  const categories = catData || [];
  const menuItems = itemData || [];

  // Grouping bhi ab yahan, server par, ek hi baar hoti hai —
  // client ko koi extra kaam nahi karna parta
  const itemsByCategory = {};
  for (const item of menuItems) {
    if (!itemsByCategory[item.category_id]) itemsByCategory[item.category_id] = [];
    itemsByCategory[item.category_id].push(item);
  }

  return <MenuClientWrapper initialCategories={categories} itemsByCategory={itemsByCategory} />;
}