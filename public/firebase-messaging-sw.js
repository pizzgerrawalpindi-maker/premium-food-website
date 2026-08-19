/* =========================================================
   PIZZGER - Firebase Cloud Messaging Service Worker
   ========================================================= */

importScripts(
  'https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js'
);

importScripts(
  'https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js'
);


/* =========================================================
   FIREBASE CONFIGURATION
   ========================================================= */

firebase.initializeApp({
  apiKey: "AIzaSyCyHCgUZI0ZH1MqmDn2Hkevj62WaeX-WQ0",
  authDomain: "pz-orders-notf.firebaseapp.com",
  projectId: "pz-orders-notf",
  storageBucket: "pz-orders-notf.firebasestorage.app",
  messagingSenderId: "1087645335220",
  appId: "1:1087645335220:web:ac1dc12281c6b58280e1e1"
});


/* =========================================================
   FIREBASE MESSAGING
   ========================================================= */

const messaging = firebase.messaging();


/* =========================================================
   BACKGROUND NOTIFICATIONS
   =========================================================
   
   This runs when:
   - Website tab is closed
   - Website is in background
   - Browser is minimized
   - Phone screen is locked (where supported)

   Our backend sends DATA-ONLY messages, so we manually
   create the notification here.
   ========================================================= */

messaging.onBackgroundMessage((payload) => {

  console.log(
    '[firebase-messaging-sw.js] Background message received:',
    payload
  );

  const notificationTitle =
    payload.data?.title || '🍕 New Order Received!';

  const notificationBody =
    payload.data?.body || 'A new order has been received.';

  const notificationLink =
    payload.data?.link || '/admin';


  const notificationOptions = {

    body: notificationBody,

    icon: '/logo.webp',

    badge: '/logo.webp',

    data: {
      link: notificationLink
    },

    requireInteraction: false
  };


  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});


/* =========================================================
   NOTIFICATION CLICK
   ========================================================= */

self.addEventListener('notificationclick', (event) => {

  console.log(
    '[firebase-messaging-sw.js] Notification clicked'
  );

  event.notification.close();


  const link =
    event.notification.data?.link || '/admin';


  event.waitUntil(

    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {

      // Try to find an already-open admin page
      for (const client of clientList) {

        if (
          client.url.includes('/admin') &&
          'focus' in client
        ) {

          return client.focus();
        }
      }


      // Otherwise open the admin page
      if (clients.openWindow) {

        return clients.openWindow(link);
      }

    })

  );

});