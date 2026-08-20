export default function RestaurantSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'Pizzger',
    image: 'https://pizzgerfoods.pk/images/logo.webp',
    '@id': 'https://pizzgerfoods.pk',
    url: 'https://pizzgerfoods.pk',
    telephone: '+923711343930',
    priceRange: 'Rs. 300 - Rs. 3000',
    servesCuisine: ['Pizza', 'Burgers', 'Shawarma', 'Fast Food'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Sir Syed Chowk, Tipu Road',
      addressLocality: 'Rawalpindi',
      addressRegion: 'Punjab',
      addressCountry: 'PK',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 33.6041699,
      longitude: 73.0760369,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday',
        'Friday', 'Saturday', 'Sunday',
      ],
      opens: '15:00',
      closes: '02:00',
    },
    sameAs: [
      'https://www.facebook.com/profile.php?id=61583111042280',
      'https://www.instagram.com/pizzgerrwp/',
      'https://www.snapchat.com/@pizzgerrwp',
      'https://www.tiktok.com/@pizzger.rwp',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}