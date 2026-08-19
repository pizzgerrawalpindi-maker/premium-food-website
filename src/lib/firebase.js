/* =========================================================
   PIZZGER - Firebase Client Configuration
   ========================================================= */

import {
  initializeApp,
  getApps
} from 'firebase/app';

import {
  getMessaging,
  getToken,
  onMessage
} from 'firebase/messaging';


/* =========================================================
   FIREBASE CONFIGURATION
   ========================================================= */

const firebaseConfig = {

  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY,

  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,

  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,

  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,

  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,

  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID

};


/* =========================================================
   INITIALIZE FIREBASE
   ========================================================= */

const app =
  !getApps().length
    ? initializeApp(firebaseConfig)
    : getApps()[0];


/* =========================================================
   FIREBASE CLOUD MESSAGING
   ========================================================= */

let messaging = null;


if (typeof window !== 'undefined') {

  try {

    messaging = getMessaging(app);

    console.log(
      'Firebase Messaging initialized successfully.'
    );

  } catch (error) {

    console.error(
      'Firebase Messaging initialization error:',
      error
    );

  }

}


/* =========================================================
   REGISTER SERVICE WORKER
   ========================================================= */

const registerFirebaseServiceWorker = async () => {

  if (
    typeof window === 'undefined' ||
    !('serviceWorker' in navigator)
  ) {

    console.warn(
      'Service Worker is not supported in this browser.'
    );

    return null;
  }


  try {

    const registration =
      await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js',
        {
          scope: '/'
        }
      );


    console.log(
      'Firebase Messaging Service Worker registered:',
      registration
    );


    /*
      Wait until the service worker is ready.
      This is especially important on mobile browsers.
    */

    await navigator.serviceWorker.ready;


    console.log(
      'Firebase Messaging Service Worker is ready.'
    );


    return registration;

  } catch (error) {

    console.error(
      'Firebase Messaging Service Worker registration failed:',
      error
    );

    return null;
  }

};


/* =========================================================
   REQUEST NOTIFICATION PERMISSION + GET FCM TOKEN
   ========================================================= */

export const requestNotificationPermission = async () => {

  try {

    /*
      Make sure this code only runs in the browser.
    */

    if (
      typeof window === 'undefined' ||
      !messaging
    ) {

      console.warn(
        'Firebase Messaging is not available.'
      );

      return null;
    }


    /*
      Check whether this browser supports notifications.
    */

    if (!('Notification' in window)) {

      console.warn(
        'This browser does not support notifications.'
      );

      return null;
    }


    /* -----------------------------------------------------
       REGISTER SERVICE WORKER FIRST
       ----------------------------------------------------- */

    const serviceWorkerRegistration =
      await registerFirebaseServiceWorker();


    if (!serviceWorkerRegistration) {

      console.error(
        'Unable to register Firebase Messaging Service Worker.'
      );

      return null;
    }


    /* -----------------------------------------------------
       REQUEST NOTIFICATION PERMISSION
       ----------------------------------------------------- */

    let permission = Notification.permission;


    if (permission === 'default') {

      permission =
        await Notification.requestPermission();

    }


    if (permission !== 'granted') {

      console.warn(
        'Notification permission was not granted:',
        permission
      );

      return null;
    }


    console.log(
      'Notification permission granted.'
    );


    /* -----------------------------------------------------
       GET FCM TOKEN
       ----------------------------------------------------- */

    const currentToken =
      await getToken(
        messaging,
        {

          vapidKey:
            process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,

          serviceWorkerRegistration:
            serviceWorkerRegistration

        }
      );


    if (currentToken) {

      console.log(
        'FCM registration token obtained successfully.'
      );

      console.log(
        'FCM Token:',
        currentToken
      );


      return currentToken;

    }


    console.warn(
      'No FCM registration token available.'
    );


    return null;

  } catch (error) {

    console.error(
      'Error while requesting notification permission or retrieving FCM token:',
      error
    );

    return null;
  }

};


/* =========================================================
   FOREGROUND MESSAGE LISTENER
   =========================================================
   
   This handles notifications when the admin website is
   currently OPEN and visible.

   Background notifications are handled by:
   firebase-messaging-sw.js
   ========================================================= */

export const listenForForegroundMessages = (
  callback
) => {

  if (
    typeof window === 'undefined' ||
    !messaging
  ) {

    return;
  }


  try {

    onMessage(
      messaging,
      async (payload) => {

        console.log(
          'Foreground FCM message received:',
          payload
        );


        const title =
          payload.data?.title ||
          '🍕 New Order Received!';


        const body =
          payload.data?.body ||
          'A new order has been received.';


        const link =
          payload.data?.link ||
          '/admin';


        /*
          Use the registered service worker to display
          the notification.

          This is more reliable than:
          
          new Notification(...)
          
          especially across mobile browsers.
        */

        try {

          const registration =
            await navigator.serviceWorker.ready;


          await registration.showNotification(
            title,
            {

              body: body,

              icon: '/logo.webp',

              badge: '/logo.webp',

              data: {
                link: link
              },

              requireInteraction: false

            }
          );


          console.log(
            'Foreground notification displayed successfully.'
          );

        } catch (notificationError) {

          console.error(
            'Failed to display foreground notification:',
            notificationError
          );

        }


        /*
          Allow the rest of the website to react to the
          incoming order.

          For example:
          - Refresh orders
          - Play sound
          - Update order counter
        */

        if (typeof callback === 'function') {

          callback(payload);

        }

      }
    );

  } catch (error) {

    console.error(
      'Failed to register foreground FCM listener:',
      error
    );

  }

};


/* =========================================================
   EXPORTS
   ========================================================= */

export {
  app,
  messaging
};