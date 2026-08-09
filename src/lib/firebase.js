import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

let messaging = null;
if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error("Firebase Messaging initialization error:", error);
  }
}

// Function to request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    if (typeof window === 'undefined' || !messaging) return null;
    
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      if (currentToken) {
        return currentToken;
      } else {
        console.warn('No registration token available.');
      }
    } else {
      console.warn('Notification permission denied.');
    }
  } catch (error) {
    console.error('An error occurred while retrieving token: ', error);
  }
  return null;
};

// Function to listen for messages while the app tab is OPEN (foreground).
// Without this, notifications only show up when the tab is closed/minimized,
// because the background service worker handler doesn't fire for an active tab.
// NOTE: reads from payload.data (not payload.notification) — this is the
// ONLY place a foreground notification gets displayed, matching how the
// service worker is now the only place background ones get displayed.
// This prevents the double-notification bug.
export const listenForForegroundMessages = (callback) => {
  if (typeof window === 'undefined' || !messaging) return;

  onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);

    if (Notification.permission === 'granted') {
      const title = payload.data?.title || 'New Notification';
      const options = {
        body: payload.data?.body || '',
        icon: '/logo.webp',
      };
      new Notification(title, options);
    }

    // Optional: also let the caller run custom logic (e.g. play a sound, refresh orders)
    if (typeof callback === 'function') {
      callback(payload);
    }
  });
};

export { app, messaging };