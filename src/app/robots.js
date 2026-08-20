export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/', '/cart', '/receipt', '/api/'],
    },
    sitemap: 'https://pizzgerfoods.pk/sitemap.xml',
  };
}