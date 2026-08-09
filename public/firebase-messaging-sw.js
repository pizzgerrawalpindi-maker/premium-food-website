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

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.webp' // Aap apni app ka logo ya icon path yahan set kar sakte hain
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});