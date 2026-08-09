import { createClient } from '@supabase/supabase-js';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

export async function POST(request) {
  try {
    // 1. Secret check
    const secret = request.headers.get('x-webhook-secret');
    if (secret !== process.env.ORDER_WEBHOOK_SECRET) {
      console.error('Unauthorized webhook attempt');
      return new Response('Unauthorized', { status: 401 });
    }

    const payload = await request.json();
    const order = payload.record;

    if (!order) {
      console.error('No order data found in payload');
      return new Response('No order data', { status: 400 });
    }

    // 2. Validate Firebase Environment Variables explicitly
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      console.error('Missing Firebase environment variables:', {
        projectId: !!projectId,
        clientEmail: !!clientEmail,
        privateKey: !!privateKey,
      });
      return new Response('Server configuration error: Missing Firebase keys', { status: 500 });
    }

    // 3. Initialize Firebase safely (modular SDK — avoids bundling issues with default import)
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    }

    // 4. Supabase Admin Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response('Server configuration error: Missing Supabase keys', { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 5. Get Token
    const { data: tokenRow, error } = await supabaseAdmin
      .from('admin_tokens')
      .select('fcm_token')
      .eq('id', 1)
      .single();

    if (error || !tokenRow?.fcm_token) {
      console.error('No admin token found in database:', error);
      return new Response('No admin token saved yet', { status: 200 });
    }

    // 6. Send Notification
    await getMessaging().send({
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

    console.log('Notification sent successfully!');
    return new Response('Notification sent', { status: 200 });
  } catch (err) {
    console.error('Detailed Error sending notification:', err.message, err.stack);
    return new Response('Internal Server Error', { status: 500 });
  }
}