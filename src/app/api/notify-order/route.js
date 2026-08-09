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

    // 5. Get Tokens — up to 3 registered devices, most recently enabled first
    const { data: tokenRows, error } = await supabaseAdmin
      .from('admin_tokens')
      .select('id, fcm_token')
      .order('updated_at', { ascending: false })
      .limit(3);

    if (error || !tokenRows || tokenRows.length === 0) {
      console.error('No admin tokens found in database:', error);
      return new Response('No admin tokens saved yet', { status: 200 });
    }

    // 6. Send Notification to every registered device
    // NOTE: Using a "data" payload (not "notification") on purpose — when a
    // "notification" field is present, browsers can auto-display it AND our
    // own onMessage/onBackgroundMessage handlers display it again, causing
    // the notification to appear twice. Data-only messages let us control
    // display in exactly one place.
    const notificationTitle = '🍕 New Order Received!';
    const notificationBody = `${order.customer_name || 'A customer'} placed an order — Rs. ${order.total_amount || ''}`;

    const results = await Promise.allSettled(
      tokenRows.map((row) =>
        getMessaging().send({
          token: row.fcm_token,
          data: {
            title: notificationTitle,
            body: notificationBody,
            link: 'https://pizzgerweb.netlify.app/admin',
          },
          webpush: {
            fcmOptions: {
              link: 'https://pizzgerweb.netlify.app/admin',
            },
          },
        })
      )
    );

    // 7. Log per-device results, and clean up tokens that are no longer valid
    // (e.g. app uninstalled, browser data cleared, permission revoked)
    const invalidTokenIds = [];
    results.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        console.log(`Notification sent successfully to device ${idx + 1}`);
      } else {
        console.error(`Failed to send to device ${idx + 1}:`, result.reason?.message);
        const errCode = result.reason?.errorInfo?.code || '';
        if (errCode.includes('registration-token-not-registered') || errCode.includes('invalid-argument')) {
          invalidTokenIds.push(tokenRows[idx].id);
        }
      }
    });

    if (invalidTokenIds.length > 0) {
      await supabaseAdmin.from('admin_tokens').delete().in('id', invalidTokenIds);
      console.log('Removed invalid/expired tokens:', invalidTokenIds);
    }

    return new Response('Notifications processed', { status: 200 });
  } catch (err) {
    console.error('Detailed Error sending notification:', err.message, err.stack);
    return new Response('Internal Server Error', { status: 500 });
  }
}