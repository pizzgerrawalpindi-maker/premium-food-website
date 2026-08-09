importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCyHCgUZI0ZH1MqmDn2Hkevj62WaeX-WQ0",
  authDomain: "pz-orders-notf.firebaseapp.com",
  projectId: "pz-orders-notf",
  storageBucket: "pz-orders-notf.firebasestorage.app",
  messagingSenderId: "1087645335220",
  appId: "1:1087645335220:web:ac1dc12281c6b58280e1e1"
});

const messaging = firebase.messaging();

// NOTE: We now send "data" payloads only (not "notification") from the
// backend, so this is the ONLY place a background notification gets
// displayed — this prevents the double-notification bug.
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);

  const notificationTitle = payload.data?.title || 'New Notification';
  const notificationOptions = {
    body: payload.data?.body || '',
    icon: '/logo.webp',
    data: { link: payload.data?.link || '/admin' }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click — open/focus the admin panel
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification.data?.link || '/admin';
  event.waitUntil(clients.openWindow(link));
});