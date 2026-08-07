'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ReceiptPage() {
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    const savedOrder = localStorage.getItem('last_confirmed_order');
    if (savedOrder) {
      setOrderData(JSON.parse(savedOrder));
    }
  }, []);

  const handlePrintOrPDF = () => {
    window.print();
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PizzGer Order Receipt',
          text: `Check out my order receipt from PizzGer. Total Amount: Rs. ${orderData?.total_amount}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Sharing failed', err);
      }
    } else {
      alert('Sharing is not supported on this browser. You can save as PDF instead.');
    }
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#120D0A] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white dark:bg-[#1c1410] p-8 rounded-3xl border border-gray-200 dark:border-orange-500/20 shadow-xl space-y-4">
          <h2 className="text-xl font-black uppercase text-gray-800 dark:text-white">No Receipt Found</h2>
          <p className="text-xs text-gray-500 dark:text-orange-200/70">Please place an order from the cart page to view your receipt.</p>
          <Link href="/menu" className="inline-block bg-orange-600 text-white font-bold px-6 py-3 rounded-2xl text-xs uppercase tracking-wider">
            Go To Menu
          </Link>
        </div>
      </div>
    );
  }

  const currentDate = new Date(orderData.created_at || Date.now());
  const formattedDate = currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
  const formattedTime = currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#120D0A] text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 flex flex-col items-center justify-center antialiased">
      
      {/* Top Action Buttons (Hidden when printing/saving PDF) */}
      <div className="print:hidden w-full max-w-lg flex items-center justify-between gap-3 mb-6">
        <Link href="/menu" className="bg-gray-200 dark:bg-[#1c1410] hover:bg-gray-300 dark:hover:bg-orange-950 text-gray-800 dark:text-orange-200 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors border border-gray-300 dark:border-orange-500/20">
          ← Back To Menu
        </Link>
        <div className="flex gap-2">
          <button 
            onClick={handleNativeShare}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <span>📤 Share</span>
          </button>
          <button 
            onClick={handlePrintOrPDF}
            className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <span>💾 Save PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Receipt Printable Card */}
      <div className="w-full max-w-lg bg-white dark:bg-[#1c1410] text-gray-900 dark:text-gray-100 p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-orange-500/30 shadow-2xl relative space-y-5 print:shadow-none print:border-none print:p-0 print:w-full">
        
        {/* Brand Header */}
        <div className="text-center space-y-1 pb-4 border-b-2 border-dashed border-gray-200 dark:border-orange-500/30">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-orange-600 dark:text-orange-500">ᑭIᘔᘔGEᖇ</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-orange-200/60">Tipu Road, Rawalpindi, Pakistan</p>
          <p className="text-[10px] font-bold text-gray-500 dark:text-orange-200/70">Phone: +92 3711343930 | Email: pizzgerrawalpindi@gmail.com</p>
          <div className="text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-orange-100 pt-2">
            {formattedDate} &bull; {formattedTime}
          </div>
        </div>

        {/* Customer Details Section */}
        <div className="space-y-2 text-xs bg-gray-50 dark:bg-[#120D0A]/60 p-4 rounded-2xl border border-gray-100 dark:border-orange-500/10">
          <h3 className="font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 mb-2">Customer Details</h3>
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-gray-400 dark:text-gray-500 block text-[10px] uppercase font-bold">Name</span> <span className="font-extrabold">{orderData.customer_name}</span></div>
            <div><span className="text-gray-400 dark:text-gray-500 block text-[10px] uppercase font-bold">Phone</span> <span className="font-extrabold">{orderData.phone}</span></div>
            <div><span className="text-gray-400 dark:text-gray-500 block text-[10px] uppercase font-bold">City</span> <span className="font-extrabold">{orderData.city}</span></div>
            <div><span className="text-gray-400 dark:text-gray-500 block text-[10px] uppercase font-bold">Payment</span> <span className="font-extrabold">{orderData.payment_method}</span></div>
          </div>
          <div className="pt-1">
            <span className="text-gray-400 dark:text-gray-500 block text-[10px] uppercase font-bold">Delivery Type</span> 
            <span className="font-extrabold">{orderData.delivery_type} {orderData.scheduled_time !== 'ASAP' && `(${orderData.scheduled_time})`}</span>
          </div>
        </div>

        {/* Deliver To Line */}
        <div className="space-y-1 pb-3 border-b border-gray-200 dark:border-orange-500/20">
          <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 block">Deliver To</span>
          <p className="text-xs font-bold text-gray-800 dark:text-white leading-relaxed">{orderData.address}</p>
        </div>

        {/* Order Details Items Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">Order Items</h3>
          
          <div className="divide-y divide-gray-100 dark:divide-orange-500/10 text-xs">
            <div className="grid grid-cols-12 pb-2 font-black uppercase text-[10px] text-gray-400 dark:text-orange-200/60">
              <span className="col-span-1">#</span>
              <span className="col-span-6">Item Name</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-3 text-right">Amount</span>
            </div>

            {orderData.items && orderData.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 py-2.5 items-center font-medium">
                <span className="col-span-1 font-bold text-gray-400">{idx + 1}</span>
                <div className="col-span-6 pr-2">
                  <span className="font-bold uppercase block text-gray-900 dark:text-white line-clamp-1">{item.title}</span>
                  <span className="text-[10px] text-gray-400 dark:text-orange-200/60">Size: {item.size} {item.isFree && '(FREE)'}</span>
                </div>
                <span className="col-span-2 text-center font-black">{item.quantity}</span>
                <span className="col-span-3 text-right font-black text-orange-600 dark:text-orange-400">
                  {item.isFree ? 'Rs. 0' : `Rs. ${item.price * item.quantity}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Calculation Summary Line */}
        <div className="pt-3 border-t-2 border-dashed border-gray-200 dark:border-orange-500/30 space-y-2 text-xs">
          <div className="flex justify-between text-gray-500 dark:text-orange-200/70 font-medium">
            <span>Subtotal</span>
            <span className="font-bold text-gray-800 dark:text-white">
              Rs. {orderData.items.reduce((acc, i) => acc + (i.isFree ? 0 : i.price * i.quantity), 0)}
            </span>
          </div>
          <div className="flex justify-between text-gray-500 dark:text-orange-200/70 font-medium">
            <span>Delivery Charges</span>
            <span className="font-bold text-gray-800 dark:text-white">Rs. 150</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-orange-500/10 text-sm">
            <span className="font-black uppercase tracking-wider text-gray-900 dark:text-white">Grand Total</span>
            <span className="text-xl font-black text-orange-600 dark:text-orange-500">Rs. {orderData.total_amount}</span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center pt-4 border-t border-gray-200 dark:border-orange-500/20 space-y-1">
          <p className="text-[10px] font-bold text-gray-400 dark:text-orange-200/60 uppercase tracking-widest">Thank you for ordering from PizzGer!</p>
          <p className="text-[9px] text-gray-400">For any queries, contact our helpline.</p>
        </div>

      </div>

    </div>
  );
}