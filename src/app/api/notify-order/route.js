import { createClient } from '@supabase/supabase-js';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK only once (Next.js can reuse this file across requests)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// Server-only Supabase client using the service role key — this bypasses
// RLS safely because this code never runs in the browser.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    // Basic security check — only Supabase's webhook (which knows the secret) can trigger this
    const secret = request.headers.get('x-webhook-secret');
    if (secret !== process.env.ORDER_WEBHOOK_SECRET) {
      return new Response('Unauthorized', { status: 401 });
    }

    const payload = await request.json();
    const order = payload.record; // Supabase sends the new row as "record"

    if (!order) {
      return new Response('No order data', { status: 400 });
    }

    // Get the admin's saved device token
    const { data: tokenRow, error } = await supabaseAdmin
      .from('admin_tokens')
      .select('fcm_token')
      .eq('id', 1)
      .single();

    if (error || !tokenRow?.fcm_token) {
      console.error('No admin token found:', error);
      return new Response('No admin token saved yet', { status: 200 });
    }

    // Send the actual push notification via Firebase
    await admin.messaging().send({
      token: tokenRow.fcm_token,
      notification: {
        title: '🍕 New Order Received!',
        body: `${order.customer_name || 'A customer'} placed an order — Rs. ${order.total_amount || ''}`,
      },
      webpush: {
        fcmOptions: {
          link: 'https://pizzgerweb.netlify.app/admin',
        },
      },
    });

    return new Response('Notification sent', { status: 200 });
  } catch (err) {
    console.error('Error sending notification:', err);
    return new Response('Error', { status: 500 });
  }
}