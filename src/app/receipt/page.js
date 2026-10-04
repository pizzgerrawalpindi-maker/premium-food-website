'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function ReceiptPage() {
  const [orderData, setOrderData] = useState(null);
  const [sharing, setSharing] = useState(false);
  const receiptRef = useRef(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem('last_confirmed_order');
    if (savedOrder) {
      try {
        setOrderData(JSON.parse(savedOrder));
      } catch (e) {
        console.error('Invalid receipt data', e);
      }
    }
  }, []);

  const handlePrintOrPDF = () => window.print();

  /* Convert receipt DOM → PNG, share via Web Share API (files),
     fall back to download on desktop browsers. */
  const handleShareImage = async () => {
    if (!receiptRef.current || sharing) return;
    setSharing(true);

    const receiptNo = orderData?.id
      ? String(orderData.id).slice(0, 8).toUpperCase()
      : String(Date.now()).slice(-8);

    // Temporarily disable dark mode so the exported image is always light.
    const html = document.documentElement;
    const hadDark = html.classList.contains('dark');
    if (hadDark) html.classList.remove('dark');

    try {
      // Make sure fonts & layout are settled before capture.
      if (document.fonts?.ready) await document.fonts.ready;
      await new Promise((r) => setTimeout(r, 60));

      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(receiptRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        style: { transform: 'none', margin: '0' },
      });

      // dataURL → Blob → File
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `pizzger-receipt-${receiptNo}.png`, { type: 'image/png' });

      // Preferred: native share with the image file
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Pizzger Receipt',
            text: `Pizzger order #${receiptNo}`,
          });
        } catch (err) {
          if (err?.name !== 'AbortError') throw err;
        }
      } else {
        // Fallback: download the PNG so it can be attached manually
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pizzger-receipt-${receiptNo}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        alert('Receipt image downloaded. You can now share it from your gallery.');
      }
    } catch (err) {
      console.error('Share failed', err);
      alert('Could not generate the image. Please try again.');
    } finally {
      if (hadDark) html.classList.add('dark');
      setSharing(false);
    }
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-[#f6f5f2] dark:bg-[#0d0907] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white dark:bg-[#17110d] p-10 rounded-2xl border border-stone-200 dark:border-white/10 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-white">No receipt found</h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
            Please place an order from the cart page to view your receipt.
          </p>
          <Link
            href="/menu"
            className="inline-block bg-stone-900 hover:bg-stone-800 dark:bg-white dark:hover:bg-stone-100 text-white dark:text-stone-900 font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            Go to menu
          </Link>
        </div>
      </div>
    );
  }

  const currentDate = new Date(orderData.created_at || Date.now());
  const formattedDate = currentDate.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const formattedTime = currentDate.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
  const receiptNo = orderData.id
    ? String(orderData.id).slice(0, 8).toUpperCase()
    : String(Date.now()).slice(-8);

  const subtotal = orderData.items.reduce((acc, i) => acc + (i.isFree ? 0 : i.price * i.quantity), 0);
  const gstAmount = Math.round(subtotal * 0.13);
  const deliveryCharges = orderData.total_amount > 0 ? (orderData.total_amount - subtotal - gstAmount) : 0;

  return (
    <div className="min-h-screen bg-[#f6f5f2] dark:bg-[#0d0907] text-stone-900 dark:text-stone-100 py-10 px-4 sm:px-6 flex flex-col items-center antialiased print:bg-white print:py-0 print:px-0 print:block">

      {/* Print styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4; margin: 12mm; }
          html, body { background: #fff !important; }
          .print\\:hidden { display: none !important; }
        }
      ` }} />

      {/* Action bar — hidden when printing */}
      <div className="print:hidden w-full max-w-2xl flex flex-wrap items-center justify-between gap-3 mb-6">
        <Link
          href="/menu"
          className="text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
        >
          ← Back to menu
        </Link>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleShareImage}
            disabled={sharing}
            className="border border-stone-300 dark:border-white/15 bg-white dark:bg-transparent hover:bg-stone-100 dark:hover:bg-white/5 text-stone-800 dark:text-stone-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sharing ? 'Preparing…' : 'Share as image'}
          </button>
          <button
            type="button"
            onClick={handlePrintOrPDF}
            className="bg-stone-900 hover:bg-stone-800 dark:bg-orange-600 dark:hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Save as PDF / Print
          </button>
        </div>
      </div>

      {/* Receipt card — this is what gets captured for the image */}
      <div
        ref={receiptRef}
        className="w-full max-w-2xl bg-white dark:bg-[#17110d] border border-stone-200 dark:border-white/10 rounded-2xl p-8 sm:p-10 shadow-sm space-y-8 print:shadow-none print:border-0 print:rounded-none print:p-0 print:max-w-full"
      >

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-stone-200 dark:border-white/10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
              Pizzger
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
              Tipu Road, Rawalpindi, Pakistan<br />
              +92 371 1343930 · pizzgerrawalpindi@gmail.com
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400 dark:text-stone-500">
              Receipt
            </p>
            <p className="text-sm font-semibold text-stone-900 dark:text-white mt-1">
              #{receiptNo}
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              {formattedDate} · {formattedTime}
            </p>
          </div>
        </header>

        {/* Customer + delivery grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div>
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400 dark:text-stone-500 mb-3">
              Billed to
            </h2>
            <p className="font-semibold text-stone-900 dark:text-white">{orderData.customer_name}</p>
            <p className="text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">{orderData.phone}</p>
            <p className="text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">{orderData.city}</p>
          </div>
          <div>
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400 dark:text-stone-500 mb-3">
              Delivery details
            </h2>
            <p className="text-stone-700 dark:text-stone-300 leading-relaxed">{orderData.address}</p>
            <p className="text-stone-500 dark:text-stone-400 text-xs mt-2">
              <span className="font-medium text-stone-600 dark:text-stone-400">Type:</span> {orderData.delivery_type}
              {orderData.scheduled_time && orderData.scheduled_time !== 'ASAP' && ` · ${orderData.scheduled_time}`}
            </p>
            {orderData.delivery_distance && (
              <p className="text-stone-500 dark:text-stone-400 text-xs mt-1">
                <span className="font-medium text-stone-600 dark:text-stone-400">Distance:</span> {orderData.delivery_distance} km
              </p>
            )}
            <p className="text-stone-500 dark:text-stone-400 text-xs mt-1">
              <span className="font-medium text-stone-600 dark:text-stone-400">Payment:</span> {orderData.payment_method}
            </p>
          </div>
        </section>

        {/* Items table */}
        <section>
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400 dark:text-stone-500 mb-3">
            Order items
          </h2>
          <div className="border-t border-stone-200 dark:border-white/10">
            <div className="grid grid-cols-12 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400 dark:text-stone-500 border-b border-stone-200 dark:border-white/10">
              <span className="col-span-1">#</span>
              <span className="col-span-6">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-3 text-right">Amount</span>
            </div>
            {orderData.items?.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 py-3 items-center text-sm border-b border-stone-100 dark:border-white/5"
              >
                <span className="col-span-1 text-stone-400 tabular-nums">{idx + 1}</span>
                <div className="col-span-6 pr-2">
                  <span className="font-medium text-stone-900 dark:text-white block">
                    {item.title}
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    {item.size}
                    {item.isFree && <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-medium">FREE</span>}
                  </span>
                </div>
                <span className="col-span-2 text-center text-stone-700 dark:text-stone-300 tabular-nums">
                  {item.quantity}
                </span>
                <span className="col-span-3 text-right font-medium text-stone-900 dark:text-white tabular-nums">
                  {item.isFree ? 'Rs. 0' : `Rs. ${(item.price * item.quantity).toLocaleString('en-PK')}`}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Totals */}
        <section className="flex justify-end">
          <div className="w-full sm:w-80 space-y-2 text-sm">
            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span>Subtotal</span>
              <span className="tabular-nums text-stone-900 dark:text-white">
                Rs. {subtotal.toLocaleString('en-PK')}
              </span>
            </div>
            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span>GST (13%)</span>
              <span className="tabular-nums text-stone-900 dark:text-white">
                Rs. {gstAmount.toLocaleString('en-PK')}
              </span>
            </div>
            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span>
                Delivery
                {orderData.delivery_distance ? (
                  <span className="text-xs text-stone-400 dark:text-stone-500 ml-1">
                    ({orderData.delivery_distance} km)
                  </span>
                ) : null}
              </span>
              <span className="tabular-nums text-stone-900 dark:text-white">
                Rs. {deliveryCharges.toLocaleString('en-PK')}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-4 mt-2 border-t border-stone-200 dark:border-white/10">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-stone-500 dark:text-stone-400">
                Total
              </span>
              <span className="text-xl font-bold text-stone-900 dark:text-white tabular-nums">
                Rs. {Number(orderData.total_amount).toLocaleString('en-PK')}
              </span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-6 border-t border-stone-200 dark:border-white/10 text-center">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Thank you for ordering from Pizzger.
          </p>
          <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">
            For any queries, contact our helpline at +92 371 1343930.
          </p>
        </footer>

      </div>
    </div>
  );
}