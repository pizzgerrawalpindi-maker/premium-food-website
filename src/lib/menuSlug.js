// lib/menuSlug.js
// Shared slug + menu-link helpers used by BOTH server and client code.
// Do NOT add 'use client' here and do NOT import anything server-only.

export const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Unique slug for a NAME against a list of slugs already used.
export const makeUniqueSlug = (name, usedSlugs = []) => {
  const base = slugify(name) || 'category';
  const used = new Set(usedSlugs);
  let slug = base;
  let i = 2;
  while (used.has(slug)) slug = `${base}-${i++}`;
  return slug;
};

// Takes categories ALREADY in display order. Returns the same array where every
// item has a final, non-empty, unique `slug`. Blank slug -> slugify(name) ->
// `category-<id>`. Duplicate -> base-2, base-3.
// This function is used by BOTH home and menu so slugs are always identical.
export const withStableSlugs = (categories = []) => {
  const seen = new Set();
  return categories.map((c) => {
    const base = slugify(c.slug) || slugify(c.name) || `category-${c.id}`;
    let slug = base;
    let i = 2;
    while (seen.has(slug)) slug = `${base}-${i++}`;
    seen.add(slug);
    return { ...c, slug };
  });
};

export const menuHref = (slug) =>
  slug ? `/menu#${encodeURIComponent(slug)}` : '/menu';

// Remembers the clicked section so the menu page can scroll even if the URL hash
// is not updated yet (soft navigation). Valid for 10 seconds.
export const rememberMenuTarget = (slug) => {
  try {
    sessionStorage.setItem('menu_target', JSON.stringify({ slug, t: Date.now() }));
  } catch {}
};

export const consumeMenuTarget = () => {
  try {
    const raw = sessionStorage.getItem('menu_target');
    sessionStorage.removeItem('menu_target');
    if (!raw) return '';
    const { slug, t } = JSON.parse(raw);
    return Date.now() - t < 10000 ? slug || '' : '';
  } catch {
    return '';
  }
};