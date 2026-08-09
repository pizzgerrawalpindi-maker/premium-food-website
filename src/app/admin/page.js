'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { requestNotificationPermission } from '@/lib/firebase'; // NEW: for enabling notifications
import AdminAuthGate from './AdminAuthGate';

// Helper functions for smart path handling in admin
const getImagePath = (imgVal) => {
  if (!imgVal || imgVal.trim() === '') return '/images/placeholder.webp';
  if (imgVal.startsWith('/') || imgVal.startsWith('http')) return imgVal;
  return `/images/${imgVal}.webp`;
};

const getVideoPath = (vidVal) => {
  if (!vidVal || vidVal.trim() === '') return undefined; 
  if (vidVal.startsWith('/') || vidVal.startsWith('http')) return vidVal;
  return `/videos/${vidVal}.webm`;
};

// Cloudinary upload function
async function uploadImageToCloudinary(file) {
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    throw new Error('Image upload failed');
  }

  const data = await response.json();
  return data.secure_url;
}

// NEW: Cloudinary video upload function
async function uploadVideoToCloudinary(file) {
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    throw new Error('Video upload failed');
  }

  const data = await response.json();
  return data.secure_url;
}

// Reusable image upload field component
function ImageUploadField({ currentValue, onUploaded, label = 'Image' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.');
      return;
    }

    setError('');
    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      onUploaded(url);
    } catch (err) {
      console.error(err);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </label>
      <label className="flex items-center justify-center gap-2 w-full p-2.5 rounded-xl bg-gray-800 border border-dashed border-gray-600 text-white text-xs cursor-pointer hover:border-orange-500 transition-all">
        <span>{uploading ? 'Uploading...' : '📷 Upload New Image'}</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </label>
      {error && <p className="text-[10px] text-red-400">{error}</p>}
    </div>
  );
}

// NEW: Reusable video upload field component
function VideoUploadField({ currentValue, onUploaded, label = 'Video' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Please select a video file.');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError('Video must be under 100MB.');
      return;
    }

    setError('');
    setUploading(true);
    try {
      const url = await uploadVideoToCloudinary(file);
      onUploaded(url);
    } catch (err) {
      console.error(err);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </label>
      <label className="flex items-center justify-center gap-2 w-full p-2.5 rounded-xl bg-gray-800 border border-dashed border-gray-600 text-white text-xs cursor-pointer hover:border-orange-500 transition-all">
        <span>{uploading ? 'Uploading...' : '🎬 Upload New Video'}</span>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </label>
      {error && <p className="text-[10px] text-red-400">{error}</p>}
    </div>
  );
}

function AdminDashboardContent() {
  const [activeTab, setActiveTab] = useState('menu');
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // Home Management States
  const [homeSliders, setHomeSliders] = useState([]);
  const [homePromos, setHomePromos] = useState([]);
  const [homeMenuImages, setHomeMenuImages] = useState([]);
  const [homeVideos, setHomeVideos] = useState([]);

  // Store Settings States (Open/Close & Timings)
  const [storeSettings, setStoreSettings] = useState({
    id: null,
    is_open: true,
    opening_time: '15:00',
    closing_time: '02:00'
  });

  const [loading, setLoading] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false); // NEW: for notification button

  // ⚡ Supabase Realtime Listener for New Orders (Silent update without buzzer)
  useEffect(() => {
    const channel = supabase
      .channel('live-orders-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const newOrder = payload.new;
          setOrders((prevOrders) => [newOrder, ...prevOrders]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    try {
      const [
        { data: catData },
        { data: itemData },
        { data: orderData },
        { data: sliderData },
        { data: promoData },
        { data: menuImgData },
        { data: vidData },
        { data: settingsData }
      ] = await Promise.all([
        supabase.from('categories').select('*').order('display_order', { ascending: true }),
        supabase.from('menu_items').select('*').order('display_order', { ascending: true }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('home_sliders').select('*').order('display_order', { ascending: true }),
        supabase.from('home_promos').select('*').order('display_order', { ascending: true }),
        supabase.from('home_menu_images').select('*').order('display_order', { ascending: true }),
        supabase.from('home_videos').select('*').order('display_order', { ascending: true }),
        supabase.from('settings').select('*').single(),
      ]);

      setCategories(catData || []);
      setMenuItems(itemData || []);
      setOrders(orderData || []);
      setHomeSliders(sliderData || []);
      setHomePromos(promoData || []);
      setHomeMenuImages(menuImgData || []);
      setHomeVideos(vidData || []);

      if (settingsData) {
        setStoreSettings({
          id: settingsData.id,
          is_open: settingsData.is_open ?? true,
          opening_time: settingsData.opening_time || '15:00',
          closing_time: settingsData.closing_time || '02:00'
        });
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
  }

  // --- MASTER SILENT SAVE ALL FUNCTION (No popups/alerts) ---
  const handleSaveAll = async () => {
    setLoading(true);
    try {
      // 1. Save Store Settings
      if (storeSettings.id) {
        await supabase.from('settings').update({
          is_open: storeSettings.is_open,
          opening_time: storeSettings.opening_time,
          closing_time: storeSettings.closing_time,
        }).eq('id', storeSettings.id);
      }

      // 2. Save Categories
      for (const cat of categories) {
        await supabase.from('categories').update({
          name: cat.name,
          slug: cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
        }).eq('id', cat.id);
      }

      // 3. Save Menu Items
      for (const item of menuItems) {
        const payload = {
          title: item.title,
          description: item.description,
          image_num: item.image_num !== '' && item.image_num !== null ? String(item.image_num) : null,
          price: item.pricing_options && item.pricing_options.length > 0 ? null : parseFloat(item.price || 0),
          pricing_options: item.pricing_options && item.pricing_options.length > 0 ? item.pricing_options : null,
        };
        await supabase.from('menu_items').update(payload).eq('id', item.id);
      }

      // 4. Save Home Sliders
      for (const slider of homeSliders) {
        await supabase.from('home_sliders').update({ img: slider.img, link: slider.link }).eq('id', slider.id);
      }

      // 5. Save Home Promos
      for (const promo of homePromos) {
        await supabase.from('home_promos').update({ img: promo.img, link: promo.link, badge: promo.badge }).eq('id', promo.id);
      }

      // 6. Save Home Menu Images
      for (const item of homeMenuImages) {
        await supabase.from('home_menu_images').update({ img: item.img, name: item.name, category_id: item.category_id }).eq('id', item.id);
      }

      // 7. Save Home Videos
      for (const vid of homeVideos) {
        await supabase.from('home_videos').update({ video_url: vid.video_url }).eq('id', vid.id);
      }

      fetchInitialData();
    } catch (err) {
      console.error('Error saving all data:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- STORE SETTINGS HANDLER ---
  const handleSaveStoreSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        is_open: storeSettings.is_open,
        opening_time: storeSettings.opening_time,
        closing_time: storeSettings.closing_time,
      };

      if (storeSettings.id) {
        await supabase.from('settings').update(payload).eq('id', storeSettings.id);
      } else {
        await supabase.from('settings').insert([payload]);
        fetchInitialData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- NOTIFICATION ENABLING HANDLER (NEW) ---
  const handleEnableNotifications = async () => {
    setNotificationLoading(true);
    const token = await requestNotificationPermission();
    
    if (token) {
      // Save token to Supabase database for later use when orders arrive
      const { error } = await supabase
        .from('admin_tokens')
        .upsert([{ id: 1, fcm_token: token }], { onConflict: ['id'] });

      if (error) {
        console.error('Error saving token to Supabase:', error);
      } else {
        console.log('Token saved successfully in database!');
      }
    }
    setNotificationLoading(false);
  };

  // --- MENU & CATEGORIES HANDLERS ---
  const handleItemChange = (id, field, value) => {
    setMenuItems(menuItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleCategoryChange = (id, field, value) => {
    setCategories(categories.map(cat => cat.id === id ? { ...cat, [field]: value } : cat));
  };

  const handlePricingTypeChange = (id, type) => {
    setMenuItems(menuItems.map(item => {
      if (item.id === id) {
        if (type === 'fix') {
          return { ...item, pricing_type: 'fix', price: 0, pricing_options: null };
        } else {
          return { ...item, pricing_type: 'size', price: null, pricing_options: [{ size: 'Regular', price: '' }] };
        }
      }
      return item;
    }));
  };

  const handleSizeOptionChange = (itemId, index, field, value) => {
    setMenuItems(menuItems.map(item => {
      if (item.id === itemId) {
        const updatedOptions = [...(item.pricing_options || [])];
        updatedOptions[index][field] = value;
        return { ...item, pricing_options: updatedOptions };
      }
      return item;
    }));
  };

  const addSizeOption = (itemId) => {
    setMenuItems(menuItems.map(item => {
      if (item.id === itemId) {
        return { ...item, pricing_options: [...(item.pricing_options || []), { size: '', price: '' }] };
      }
      return item;
    }));
  };

  const removeSizeOption = (itemId, index) => {
    setMenuItems(menuItems.map(item => {
      if (item.id === itemId) {
        const updatedOptions = item.pricing_options.filter((_, i) => i !== index);
        return { ...item, pricing_options: updatedOptions };
      }
      return item;
    }));
  };

  const handleSaveItem = async (item) => {
    setLoading(true);
    try {
      const payload = {
        title: item.title,
        description: item.description,
        image_num: item.image_num !== '' && item.image_num !== null ? String(item.image_num) : null,
        price: item.pricing_options && item.pricing_options.length > 0 ? null : parseFloat(item.price || 0),
        pricing_options: item.pricing_options && item.pricing_options.length > 0 ? item.pricing_options : null,
      };

      await supabase.from('menu_items').update(payload).eq('id', item.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async (cat) => {
    setLoading(true);
    try {
      const payload = {
        name: cat.name,
        slug: cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
      };

      await supabase.from('categories').update(payload).eq('id', cat.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (!error) {
      setMenuItems(menuItems.filter(item => item.id !== id));
    }
  };

  const handleDeleteCategory = async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) {
      setCategories(categories.filter(cat => cat.id !== id));
    }
  };

  const handleInsertItemBetween = async (categoryId, targetOrder) => {
    const newOrder = targetOrder + 5;
    const itemsToShift = menuItems.filter(item => item.category_id === categoryId && (item.display_order || 0) >= newOrder);
    
    for (const itm of itemsToShift) {
      await supabase.from('menu_items').update({ display_order: (itm.display_order || 0) + 10 }).eq('id', itm.id);
    }

    const newItem = {
      title: 'New Deal / Item',
      description: 'Enter description here...',
      price: 500,
      image_num: null,
      category_id: categoryId,
      display_order: newOrder,
      pricing_options: null
    };

    const { error } = await supabase.from('menu_items').insert([newItem]);
    if (!error) fetchInitialData();
  };

  const handleInsertCategoryBetween = async (targetOrder) => {
    const newOrder = targetOrder + 5;
    const catsToShift = categories.filter(cat => (cat.display_order || 0) >= newOrder);

    for (const c of catsToShift) {
      await supabase.from('categories').update({ display_order: (c.display_order || 0) + 10 }).eq('id', c.id);
    }

    const newCat = {
      name: 'New Category',
      slug: 'new-category-' + Date.now(),
      display_order: newOrder
    };

    const { error } = await supabase.from('categories').insert([newCat]);
    if (!error) fetchInitialData();
  };

  // --- NEW: Toggle Hide/Unhide handlers ---
  const handleToggleCategoryHidden = async (cat) => {
    const newValue = !cat.is_hidden;
    await supabase.from('categories').update({ is_hidden: newValue }).eq('id', cat.id);
    setCategories(categories.map(c => c.id === cat.id ? { ...c, is_hidden: newValue } : c));
  };

  const handleToggleItemHidden = async (item) => {
    const newValue = !item.is_hidden;
    await supabase.from('menu_items').update({ is_hidden: newValue }).eq('id', item.id);
    setMenuItems(menuItems.map(i => i.id === item.id ? { ...i, is_hidden: newValue } : i));
  };

  const handleToggleSliderHidden = async (slider) => {
    const newValue = !slider.is_hidden;
    await supabase.from('home_sliders').update({ is_hidden: newValue }).eq('id', slider.id);
    setHomeSliders(homeSliders.map(s => s.id === slider.id ? { ...s, is_hidden: newValue } : s));
  };

  const handleTogglePromoHidden = async (promo) => {
    const newValue = !promo.is_hidden;
    await supabase.from('home_promos').update({ is_hidden: newValue }).eq('id', promo.id);
    setHomePromos(homePromos.map(p => p.id === promo.id ? { ...p, is_hidden: newValue } : p));
  };

  const handleToggleMenuImgHidden = async (item) => {
    const newValue = !item.is_hidden;
    await supabase.from('home_menu_images').update({ is_hidden: newValue }).eq('id', item.id);
    setHomeMenuImages(homeMenuImages.map(m => m.id === item.id ? { ...m, is_hidden: newValue } : m));
  };

  const handleToggleVideoHidden = async (vid) => {
    const newValue = !vid.is_hidden;
    await supabase.from('home_videos').update({ is_hidden: newValue }).eq('id', vid.id);
    setHomeVideos(homeVideos.map(v => v.id === vid.id ? { ...v, is_hidden: newValue } : v));
  };

  // --- HOME PAGE MANAGEMENT HANDLERS ---
  const handleSliderChange = (id, field, value) => {
    setHomeSliders(homeSliders.map(s => s.id === id ? { ...s, [field]: value } : s));
  };
  const handleSaveSlider = async (slider) => {
    setLoading(true);
    await supabase.from('home_sliders').update({ img: slider.img, link: slider.link }).eq('id', slider.id);
    setLoading(false);
  };
  const handleDeleteSlider = async (id) => {
    await supabase.from('home_sliders').delete().eq('id', id);
    setHomeSliders(homeSliders.filter(s => s.id !== id));
  };
  const handleAddSlider = async () => {
    const newOrder = homeSliders.length > 0 ? homeSliders[homeSliders.length - 1].display_order + 10 : 10;
    const { error } = await supabase.from('home_sliders').insert([{ img: '1', link: '/menu', display_order: newOrder }]);
    if (!error) fetchInitialData();
  };

  const handlePromoChange = (id, field, value) => {
    setHomePromos(homePromos.map(p => p.id === id ? { ...p, [field]: value } : p));
  };
  const handleSavePromo = async (promo) => {
    setLoading(true);
    await supabase.from('home_promos').update({ img: promo.img, link: promo.link, badge: promo.badge }).eq('id', promo.id);
    setLoading(false);
  };
  const handleDeletePromo = async (id) => {
    await supabase.from('home_promos').delete().eq('id', id);
    setHomePromos(homePromos.filter(p => p.id !== id));
  };
  const handleAddPromo = async () => {
    const newOrder = homePromos.length > 0 ? homePromos[homePromos.length - 1].display_order + 10 : 10;
    const { error } = await supabase.from('home_promos').insert([{ img: '5', link: '/menu', badge: '', display_order: newOrder }]);
    if (!error) fetchInitialData();
  };

  const handleMenuImgChange = (id, field, value) => {
    setHomeMenuImages(homeMenuImages.map(m => m.id === id ? { ...m, [field]: value } : m));
  };
  const handleSaveMenuImg = async (item) => {
    setLoading(true);
    await supabase.from('home_menu_images').update({ img: item.img, name: item.name, category_id: item.category_id }).eq('id', item.id);
    setLoading(false);
  };
  const handleDeleteMenuImg = async (id) => {
    await supabase.from('home_menu_images').delete().eq('id', id);
    setHomeMenuImages(homeMenuImages.filter(m => m.id !== id));
  };
  const handleAddMenuImg = async () => {
    const newOrder = homeMenuImages.length > 0 ? homeMenuImages[homeMenuImages.length - 1].display_order + 10 : 10;
    const { error } = await supabase.from('home_menu_images').insert([{ img: '8', name: 'NEW CATEGORY', category_id: 'burgers', display_order: newOrder }]);
    if (!error) fetchInitialData();
  };

  const handleVideoChange = (id, field, value) => {
    setHomeVideos(homeVideos.map(v => v.id === id ? { ...v, [field]: value } : v));
  };
  const handleSaveVideo = async (vid) => {
    setLoading(true);
    await supabase.from('home_videos').update({ video_url: vid.video_url }).eq('id', vid.id);
    setLoading(false);
  };
  const handleDeleteVideo = async (id) => {
    await supabase.from('home_videos').delete().eq('id', id);
    setHomeVideos(homeVideos.filter(v => v.id !== id));
  };
  const handleAddVideo = async () => {
    const newOrder = homeVideos.length > 0 ? homeVideos[homeVideos.length - 1].display_order + 10 : 10;
    const { error } = await supabase.from('home_videos').insert([{ video_url: 'a', display_order: newOrder }]);
    if (!error) fetchInitialData();
  };

  // --- ORDERS HANDLERS ---
  const handleToggleOrderStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    }
  };

  const handleDeleteOrder = async (id) => {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (!error) {
      setOrders(orders.filter(o => o.id !== id));
    }
  };

  // --- WhatsApp Share to Rider Handler ---
  const handleShareToRider = (order) => {
    // Agar GPS coordinates mojood hain toh exact lat/lng use honge, warna manual address ki bajaye sirf City use hoga taake map kharab na ho
    const mapsLink = (order.latitude && order.longitude)
      ? `https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.city || 'Rawalpindi')}`;

    const itemsText = order.items?.map(i => `▫️ ${i.title} (${i.size || 'Std'}) x ${i.quantity}`).join('\n') || '';

    const message = ` *NEW ORDER FOR DELIVERY* \n\n` +
      ` *Customer:* ${order.customer_name}\n` +
      ` *Phone:* ${order.phone}\n` +
      ` *Manual Address:* ${order.address} (${order.city}) ${order.apartment ? `| Apt: ${order.apartment}` : ''}\n` +
      (order.detected_address ? `🛰️ *GPS Location:* ${order.detected_address}\n` : '') +
      ` *Google Maps Direction:*\n${mapsLink}\n\n` +
      ` *Ordered Items:*\n${itemsText}\n\n` +
      ` *Total Amount:* Rs. ${order.total_amount}\n` +
      ` *Payment:* ${order.payment_method}\n` +
      ` *Type:* ${order.delivery_type}\n` +
      (order.special_instructions ? ` *Instructions:* ${order.special_instructions}` : '');

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8 relative pb-24">
      <div className="max-w-[85rem] mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 border-b border-gray-800 pb-6">
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-orange-500 tracking-wider">
            Restaurant Admin Panel
          </h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-5 py-2.5 rounded-xl font-bold uppercase text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'menu' ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Manage Menu
            </button>
            <button
              onClick={() => setActiveTab('home')}
              className={`px-5 py-2.5 rounded-xl font-bold uppercase text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'home' ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Manage Home Page
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-5 py-2.5 rounded-xl font-bold uppercase text-xs sm:text-sm transition-all cursor-pointer ${
                activeTab === 'settings' ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Store Status & Timing
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-5 py-2.5 rounded-xl font-bold uppercase text-xs sm:text-sm transition-all cursor-pointer relative ${
                activeTab === 'orders' ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Live Orders
              {orders.filter(o => o.status !== 'Completed').length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-xs rounded-full flex items-center justify-center font-black">
                  {orders.filter(o => o.status !== 'Completed').length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* TAB 1: MANAGE MENU & CATEGORIES */}
        {activeTab === 'menu' && (
          <div className="space-y-16">
            <div className="flex justify-between items-center bg-gray-800/60 p-5 rounded-2xl border border-gray-700/60">
              <h2 className="text-lg font-extrabold text-orange-400 uppercase">Interactive Menu Layout</h2>
              <p className="text-xs text-gray-400">Use stylish lines & <strong className="text-orange-400">(+)</strong> icons to insert items or categories anywhere smoothly.</p>
            </div>

            <div className="space-y-16">
              {categories.map((cat, catIdx) => {
                const categoryItems = menuItems.filter(item => item.category_id === cat.id);
                const currentCatOrder = cat.display_order || (catIdx * 10);

                return (
                  <div key={cat.id} className={`relative group/cat space-y-6 ${cat.is_hidden ? 'opacity-50' : ''}`}>
                    <div className="relative flex items-center justify-center my-6">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700/60"></div></div>
                      <button
                        type="button"
                        onClick={() => handleInsertCategoryBetween(currentCatOrder - 5)}
                        className="relative z-10 w-8 h-8 bg-gray-800 hover:bg-orange-600 text-orange-400 hover:text-white rounded-full border border-gray-700 flex items-center justify-center font-black shadow-lg transition-all cursor-pointer"
                        title="Insert new category section here"
                      >
                        +
                      </button>
                    </div>

                    <div className="bg-gray-800/80 p-4 rounded-2xl border border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <span className="text-xs font-black uppercase text-orange-400">Category #{catIdx + 1}</span>
                        <input
                          type="text"
                          value={cat.name}
                          onChange={(e) => handleCategoryChange(cat.id, 'name', e.target.value)}
                          className="p-2 rounded-xl bg-gray-900 border border-gray-700 text-white font-black uppercase text-sm outline-none focus:border-orange-500"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => handleSaveCategory(cat)}
                          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase rounded-xl shadow-md transition-all cursor-pointer"
                        >
                          💾 Save Category
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleCategoryHidden(cat)}
                          className={`px-3 py-2 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer ${
                            cat.is_hidden ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white' : 'bg-gray-700/40 text-gray-400 hover:bg-gray-700 hover:text-white'
                          }`}
                        >
                          {cat.is_hidden ? '👁️ Unhide' : '🙈 Hide'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="px-3 py-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {categoryItems.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-xs uppercase font-bold tracking-wider bg-gray-800/30 rounded-2xl border border-gray-800">
                        No items in this category yet. Click "+ Add Card" below.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {categoryItems.map((item, index) => {
                          const isSizeWise = item.pricing_options && item.pricing_options.length > 0;
                          const currentOrder = item.display_order || (index * 10);

                          return (
                            <div key={item.id} className={`relative group/card ${item.is_hidden ? 'opacity-50' : ''}`}>
                              <button
                                type="button"
                                onClick={() => handleInsertItemBetween(cat.id, currentOrder - 5)}
                                className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 bg-orange-600 hover:bg-orange-500 text-white rounded-full flex items-center justify-center font-black shadow-lg opacity-0 group-hover/card:opacity-100 transition-all cursor-pointer"
                                title="Insert new card before this"
                              >
                                +
                              </button>

                              <button
                                type="button"
                                onClick={() => handleInsertItemBetween(cat.id, currentOrder)}
                                className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-7 h-7 bg-orange-600 hover:bg-orange-500 text-white rounded-full flex items-center justify-center font-black shadow-lg opacity-0 group-hover/card:opacity-100 transition-all cursor-pointer"
                                title="Insert new card after this"
                              >
                                +
                              </button>

                              <div className="bg-gray-800/95 backdrop-blur-xl p-4 rounded-3xl border border-gray-700/80 shadow-xl flex flex-col justify-between gap-3 h-full">
                                <div className="flex justify-between items-center border-b border-gray-700/60 pb-2">
                                  <span className="text-[10px] font-black uppercase text-orange-400">Card #{index + 1}</span>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleToggleItemHidden(item)}
                                      className={`p-1 rounded-md transition-all cursor-pointer ${
                                        item.is_hidden ? 'text-amber-400 hover:bg-amber-500/10' : 'text-gray-500 hover:bg-gray-500/10'
                                      }`}
                                      title={item.is_hidden ? 'Unhide Card' : 'Hide Card'}
                                    >
                                      {item.is_hidden ? '👁️' : '🙈'}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="text-red-400 hover:text-red-300 p-1 rounded-md hover:bg-red-500/10 transition-all cursor-pointer"
                                      title="Delete Card"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                  </div>
                                </div>

                                <div className="space-y-2 grow">
                                  <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Title</label>
                                    <input
                                      type="text"
                                      value={item.title || ''}
                                      onChange={(e) => handleItemChange(item.id, 'title', e.target.value)}
                                      className="w-full p-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-xs outline-none focus:border-orange-500 font-medium"
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Image No</label>
                                      <input
                                        type="number"
                                        value={item.image_num ?? ''}
                                        onChange={(e) => handleItemChange(item.id, 'image_num', e.target.value)}
                                        placeholder="e.g. 19"
                                        className="w-full p-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-xs outline-none focus:border-orange-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Pricing Type</label>
                                      <select
                                        value={isSizeWise ? 'size' : 'fix'}
                                        onChange={(e) => handlePricingTypeChange(item.id, e.target.value)}
                                        className="w-full p-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-[11px] outline-none focus:border-orange-500 cursor-pointer font-medium"
                                      >
                                        <option value="fix">Fix Price</option>
                                        <option value="size">Size Wise</option>
                                      </select>
                                    </div>
                                  </div>

                                  <ImageUploadField
                                    currentValue={item.image_num}
                                    onUploaded={(url) => handleItemChange(item.id, 'image_num', url)}
                                    label="Or Upload New Image"
                                  />

                                  <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Description</label>
                                    <textarea
                                      rows="2"
                                      value={item.description || ''}
                                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                      className="w-full p-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-xs outline-none focus:border-orange-500 font-medium resize-none"
                                    ></textarea>
                                  </div>

                                  {!isSizeWise ? (
                                    <div>
                                      <label className="block text-[10px] font-bold uppercase tracking-wider text-orange-400 mb-0.5">Price (Rs.)</label>
                                      <input
                                        type="number"
                                        value={item.price || ''}
                                        onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                                        className="w-full p-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-xs outline-none focus:border-orange-500 font-bold"
                                      />
                                    </div>
                                  ) : (
                                    <div className="bg-gray-900/80 p-2.5 rounded-xl border border-gray-700 space-y-2">
                                      <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase text-orange-400">Sizes & Prices</span>
                                        <button
                                          type="button"
                                          onClick={() => addSizeOption(item.id)}
                                          className="px-2 py-0.5 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-bold rounded uppercase cursor-pointer"
                                        >
                                          + Add Size
                                        </button>
                                      </div>
                                      <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                                        {item.pricing_options?.map((opt, optIdx) => (
                                          <div key={optIdx} className="flex items-center gap-1.5">
                                            <input
                                              type="text"
                                              placeholder="Size"
                                              value={opt.size}
                                              onChange={(e) => handleSizeOptionChange(item.id, optIdx, 'size', e.target.value)}
                                              className="w-full p-1.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-[11px] outline-none"
                                            />
                                            <input
                                              type="number"
                                              placeholder="Rs."
                                              value={opt.price}
                                              onChange={(e) => handleSizeOptionChange(item.id, optIdx, 'price', e.target.value)}
                                              className="w-full p-1.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-[11px] outline-none"
                                            />
                                            {item.pricing_options.length > 1 && (
                                              <button
                                                type="button"
                                                onClick={() => removeSizeOption(item.id, optIdx)}
                                                className="text-red-400 hover:text-red-300 font-bold px-1 text-xs"
                                              >
                                                ✕
                                              </button>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="pt-2 mt-auto">
                                  <button
                                    type="button"
                                    disabled={loading}
                                    onClick={() => handleSaveItem(item)}
                                    className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold uppercase text-[11px] tracking-widest shadow-md shadow-orange-600/30 cursor-pointer disabled:opacity-50"
                                  >
                                    {loading ? 'Saving...' : '💾 Save Changes'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => handleInsertItemBetween(cat.id, categoryItems.length > 0 ? (categoryItems[categoryItems.length - 1].display_order || 0) : 0)}
                        className="px-4 py-2 bg-gray-800 hover:bg-orange-600 text-orange-400 hover:text-white rounded-xl border border-gray-700 text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
                      >
                        + Add Card in {cat.name}
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="relative flex items-center justify-center my-10">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700/60"></div></div>
                <button
                  type="button"
                  onClick={() => handleInsertCategoryBetween(categories.length > 0 ? (categories[categories.length - 1].display_order || 0) : 0)}
                  className="relative z-10 px-5 py-2 bg-gray-800 hover:bg-orange-600 text-orange-400 hover:text-white rounded-full border border-gray-700 flex items-center gap-2 font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
                >
                  <span>+ Add New Category Section</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE HOME PAGE */}
        {activeTab === 'home' && (
          <div className="space-y-16">
            <div className="bg-gray-800/60 p-6 rounded-3xl border border-gray-700/60 space-y-6">
              <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-orange-400 uppercase">Home Page Sliders</h2>
                  <p className="text-xs text-gray-400">Sirf image number likhein (jaise: 1, 2, 3)</p>
                </div>
                <button onClick={handleAddSlider} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold uppercase cursor-pointer">
                  + Add Slider Image
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {homeSliders.map((slider, idx) => (
                  <div key={slider.id} className={`bg-gray-900 p-4 rounded-2xl border border-gray-700 space-y-3 ${slider.is_hidden ? 'opacity-50' : ''}`}>
                    <div className="flex justify-between items-center text-xs font-black text-orange-400">
                      <span>Slide #{idx + 1}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleSliderHidden(slider)}
                          className={slider.is_hidden ? 'text-amber-400 font-bold' : 'text-gray-400 font-bold'}
                        >
                          {slider.is_hidden ? '👁️ Unhide' : '🙈 Hide'}
                        </button>
                        <button onClick={() => handleDeleteSlider(slider.id)} className="text-red-400 font-bold">Delete</button>
                      </div>
                    </div>
                    <div className="h-28 bg-gray-950 rounded-xl overflow-hidden border border-gray-800">
                      <img src={getImagePath(slider.img)} alt="Slider preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={slider.img}
                        onChange={(e) => handleSliderChange(slider.id, 'img', e.target.value)}
                        placeholder="Image No"
                        className="w-full p-2 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs outline-none"
                      />
                      <ImageUploadField
                        currentValue={slider.img}
                        onUploaded={(url) => handleSliderChange(slider.id, 'img', url)}
                        label="Or Upload New Image"
                      />
                      <input
                        type="text"
                        value={slider.link || ''}
                        onChange={(e) => handleSliderChange(slider.id, 'link', e.target.value)}
                        placeholder="Link"
                        className="w-full p-2 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs outline-none"
                      />
                    </div>
                    <button onClick={() => handleSaveSlider(slider)} disabled={loading} className="w-full py-2 bg-orange-600 hover:bg-orange-500 rounded-xl text-xs font-bold uppercase text-white cursor-pointer">
                      Save Slider
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* PROMOS SECTION */}
            <div className="bg-gray-800/60 p-6 rounded-3xl border border-gray-700/60 space-y-6">
              <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-orange-400 uppercase">Home Page Promos</h2>
                  <p className="text-xs text-gray-400">Sirf image number likhein (jaise: 5, 6, 7). Badge optional hai.</p>
                </div>
                <button onClick={handleAddPromo} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold uppercase cursor-pointer">
                  + Add Promo
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {homePromos.map((promo, idx) => (
                  <div key={promo.id} className={`bg-gray-900 p-4 rounded-2xl border border-gray-700 space-y-3 ${promo.is_hidden ? 'opacity-50' : ''}`}>
                    <div className="flex justify-between items-center text-xs font-black text-orange-400">
                      <span>Promo #{idx + 1}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTogglePromoHidden(promo)}
                          className={promo.is_hidden ? 'text-amber-400 font-bold' : 'text-gray-400 font-bold'}
                        >
                          {promo.is_hidden ? '👁️ Unhide' : '🙈 Hide'}
                        </button>
                        <button onClick={() => handleDeletePromo(promo.id)} className="text-red-400 font-bold">Delete</button>
                      </div>
                    </div>
                    <div className="h-28 bg-gray-950 rounded-xl overflow-hidden border border-gray-800">
                      <img src={getImagePath(promo.img)} alt="Promo preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={promo.img}
                        onChange={(e) => handlePromoChange(promo.id, 'img', e.target.value)}
                        placeholder="Image No"
                        className="w-full p-2 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs outline-none"
                      />
                      <ImageUploadField
                        currentValue={promo.img}
                        onUploaded={(url) => handlePromoChange(promo.id, 'img', url)}
                        label="Or Upload New Image"
                      />
                      <input
                        type="text"
                        value={promo.link || ''}
                        onChange={(e) => handlePromoChange(promo.id, 'link', e.target.value)}
                        placeholder="Link"
                        className="w-full p-2 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs outline-none"
                      />
                      <input
                        type="text"
                        value={promo.badge || ''}
                        onChange={(e) => handlePromoChange(promo.id, 'badge', e.target.value)}
                        placeholder="Badge (e.g. Most Popular) - optional"
                        className="w-full p-2 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs outline-none"
                      />
                    </div>
                    <button onClick={() => handleSavePromo(promo)} disabled={loading} className="w-full py-2 bg-orange-600 hover:bg-orange-500 rounded-xl text-xs font-bold uppercase text-white cursor-pointer">
                      Save Promo
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* HOME MENU CATEGORY IMAGES SECTION */}
            <div className="bg-gray-800/60 p-6 rounded-3xl border border-gray-700/60 space-y-6">
              <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-orange-400 uppercase">Home Menu Category Images</h2>
                  <p className="text-xs text-gray-400">Home page par jo category icons dikhte hain (BURGERS, PIZZAS, etc.)</p>
                </div>
                <button onClick={handleAddMenuImg} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold uppercase cursor-pointer">
                  + Add Category Image
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {homeMenuImages.map((item, idx) => (
                  <div key={item.id} className={`bg-gray-900 p-4 rounded-2xl border border-gray-700 space-y-3 ${item.is_hidden ? 'opacity-50' : ''}`}>
                    <div className="flex justify-between items-center text-xs font-black text-orange-400">
                      <span>Item #{idx + 1}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleMenuImgHidden(item)}
                          className={item.is_hidden ? 'text-amber-400 font-bold' : 'text-gray-400 font-bold'}
                        >
                          {item.is_hidden ? '👁️ Unhide' : '🙈 Hide'}
                        </button>
                        <button onClick={() => handleDeleteMenuImg(item.id)} className="text-red-400 font-bold">Delete</button>
                      </div>
                    </div>
                    <div className="h-28 bg-gray-950 rounded-xl overflow-hidden border border-gray-800">
                      <img src={getImagePath(item.img)} alt="Category preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={item.img}
                        onChange={(e) => handleMenuImgChange(item.id, 'img', e.target.value)}
                        placeholder="Image No"
                        className="w-full p-2 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs outline-none"
                      />
                      <ImageUploadField
                        currentValue={item.img}
                        onUploaded={(url) => handleMenuImgChange(item.id, 'img', url)}
                        label="Or Upload New Image"
                      />
                      <input
                        type="text"
                        value={item.name || ''}
                        onChange={(e) => handleMenuImgChange(item.id, 'name', e.target.value)}
                        placeholder="Display Name (e.g. BURGERS)"
                        className="w-full p-2 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs outline-none"
                      />
                      <input
                        type="text"
                        value={item.category_id || ''}
                        onChange={(e) => handleMenuImgChange(item.id, 'category_id', e.target.value)}
                        placeholder="Category ID (e.g. burgers)"
                        className="w-full p-2 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs outline-none"
                      />
                    </div>
                    <button onClick={() => handleSaveMenuImg(item)} disabled={loading} className="w-full py-2 bg-orange-600 hover:bg-orange-500 rounded-xl text-xs font-bold uppercase text-white cursor-pointer">
                      Save Category Image
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* HOME VIDEOS SECTION */}
            <div className="bg-gray-800/60 p-6 rounded-3xl border border-gray-700/60 space-y-6">
              <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-orange-400 uppercase">Home Page Videos</h2>
                  <p className="text-xs text-gray-400">Sirf video ka naam likhein (jaise: a, b, c) — .webm khud add ho jayega.</p>
                </div>
                <button onClick={handleAddVideo} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold uppercase cursor-pointer">
                  + Add Video
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {homeVideos.map((vid, idx) => (
                  <div key={vid.id} className={`bg-gray-900 p-4 rounded-2xl border border-gray-700 space-y-3 ${vid.is_hidden ? 'opacity-50' : ''}`}>
                    <div className="flex justify-between items-center text-xs font-black text-orange-400">
                      <span>Video #{idx + 1}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleVideoHidden(vid)}
                          className={vid.is_hidden ? 'text-amber-400 font-bold' : 'text-gray-400 font-bold'}
                        >
                          {vid.is_hidden ? '👁️ Unhide' : '🙈 Hide'}
                        </button>
                        <button onClick={() => handleDeleteVideo(vid.id)} className="text-red-400 font-bold">Delete</button>
                      </div>
                    </div>
                    <div className="h-28 bg-gray-950 rounded-xl overflow-hidden border border-gray-800 flex items-center justify-center">
                      {getVideoPath(vid.video_url) ? (
                        <video src={getVideoPath(vid.video_url)} className="w-full h-full object-cover" muted />
                      ) : (
                        <span className="text-[10px] text-gray-500 uppercase font-bold">No preview</span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={vid.video_url}
                      onChange={(e) => handleVideoChange(vid.id, 'video_url', e.target.value)}
                      placeholder="Video Name (e.g. a)"
                      className="w-full p-2 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs outline-none"
                    />
                    <VideoUploadField
                      currentValue={vid.video_url}
                      onUploaded={(url) => handleVideoChange(vid.id, 'video_url', url)}
                      label="Or Upload New Video"
                    />
                    <button onClick={() => handleSaveVideo(vid)} disabled={loading} className="w-full py-2 bg-orange-600 hover:bg-orange-500 rounded-xl text-xs font-bold uppercase text-white cursor-pointer">
                      Save Video
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STORE STATUS & TIMINGS MANAGEMENT */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div className="bg-gray-800/60 p-6 sm:p-8 rounded-3xl border border-gray-700/60 shadow-xl max-w-2xl mx-auto space-y-6">
              <h2 className="text-xl font-extrabold text-orange-400 uppercase border-b border-gray-700 pb-4">
                Store Operating Hours & Status Control
              </h2>

              <form onSubmit={handleSaveStoreSettings} className="space-y-6">
                <div className="bg-gray-900 p-5 rounded-2xl border border-gray-700 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm uppercase text-white">Store Status</h3>
                    <p className="text-xs text-gray-400">If toggled to closed, website will instantly show closed.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={storeSettings.is_open} 
                      onChange={(e) => setStoreSettings({ ...storeSettings, is_open: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Opening Time</label>
                    <input 
                      type="time" 
                      value={storeSettings.opening_time}
                      onChange={(e) => setStoreSettings({ ...storeSettings, opening_time: e.target.value })}
                      className="w-full p-3.5 rounded-2xl bg-gray-900 border border-gray-700 text-white font-bold text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Closing Time</label>
                    <input 
                      type="time" 
                      value={storeSettings.closing_time}
                      onChange={(e) => setStoreSettings({ ...storeSettings, closing_time: e.target.value })}
                      className="w-full p-3.5 rounded-2xl bg-gray-900 border border-gray-700 text-white font-bold text-sm outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-600/30 transition-all cursor-pointer"
                >
                  {loading ? 'Saving...' : '💾 Save Store Settings'}
                </button>
              </form>
            </div>

            {/* NEW: Enable Notifications Section */}
            <div className="bg-gray-800/60 p-6 sm:p-8 rounded-3xl border border-gray-700/60 shadow-xl max-w-2xl mx-auto space-y-4">
              <h3 className="text-lg font-extrabold text-orange-400 uppercase">Enable Notifications</h3>
              <p className="text-xs text-gray-400">
                Get real-time alerts on new orders directly on your mobile device. 
                Click the button below to grant permission and save your device token.
              </p>
              <button
                onClick={handleEnableNotifications}
                disabled={notificationLoading}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {notificationLoading ? 'Enabling...' : '🔔 Enable Mobile Notifications'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: LIVE ORDERS */}
        {activeTab === 'orders' && (
          <div className="bg-gray-800/60 p-6 rounded-3xl border border-gray-700/60 shadow-xl">
            <h2 className="text-xl font-extrabold mb-6 text-orange-400 uppercase">Customer Live Orders</h2>
            {orders.length === 0 ? (
              <div className="text-center py-16 text-gray-500 font-bold uppercase tracking-wider">
                No active orders found right now.
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="bg-gray-900 p-5 sm:p-6 rounded-2xl border border-gray-700 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-800 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-orange-400 uppercase text-sm">Order #{order.id.slice(0, 6)}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${order.status === 'Completed' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {order.status || 'Pending'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</span>
                    </div>

                    {/* 3-Column Layout: Details | Mini Map + WhatsApp Button | Items */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Column 1: Customer Details */}
                      <div className="space-y-1.5 bg-gray-950/40 p-4 rounded-xl border border-gray-800 md:col-span-1">
                        <h4 className="text-xs font-black uppercase tracking-wider text-orange-400 mb-2">Customer Details</h4>
                        <p className="text-sm font-bold text-gray-200">{order.customer_name}</p>
                        <p className="text-xs text-gray-300">
                          <strong className="text-gray-400">Phone:</strong> <a href={`https://wa.me/${order.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-mono inline-flex items-center gap-1">{order.phone}</a>
                        </p>
                        <p className="text-xs text-gray-300">
                          <strong className="text-gray-400">Manual Address:</strong> {order.address} ({order.city}) {order.apartment && `| Apt: ${order.apartment}`}
                        </p>
                        {order.detected_address && (
                          <p className="text-xs text-emerald-300 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 mt-1">
                            <strong className="text-emerald-400">GPS Location:</strong> {order.detected_address}
                          </p>
                        )}
                        {order.special_instructions && (
                          <p className="text-xs text-orange-200/80 bg-orange-500/10 p-2 rounded-lg border border-orange-500/20 mt-1">
                            <strong className="text-orange-400">Instructions:</strong> {order.special_instructions}
                          </p>
                        )}
                        <p className="text-xs text-gray-300 pt-1"><strong className="text-gray-400">Payment:</strong> {order.payment_method}</p>
                      </div>

                      {/* Column 2: Mini Map Preview & WhatsApp Share to Rider */}
                      <div className="bg-gray-950/40 p-3 rounded-xl border border-gray-800 flex flex-col justify-between md:col-span-1">
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-orange-400 mb-2">Location Map</h4>
                          {order.latitude && order.longitude ? (
                            <div className="w-full h-36 rounded-lg overflow-hidden border border-gray-700 relative">
                              <iframe
                                title="Customer Location Map"
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                scrolling="no"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${order.longitude-0.005},${order.latitude-0.005},${order.longitude+0.005},${order.latitude+0.005}&layer=mapnik&marker=${order.latitude},${order.longitude}`}
                                className="w-full h-full"
                              ></iframe>
                            </div>
                          ) : (
                            <div className="w-full h-36 bg-gray-900 rounded-lg flex items-center justify-center text-xs text-gray-500 font-bold uppercase text-center p-2">
                              GPS Coordinates Unavailable
                            </div>
                          )}
                        </div>

                        {/* Share to Rider Button */}
                        <button
                          onClick={() => handleShareToRider(order)}
                          className="mt-3 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-[11px] tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <span>💬</span> Share to Rider on WhatsApp
                        </button>
                      </div>

                      {/* Column 3: Ordered Items */}
                      <div className="space-y-2 bg-gray-950/40 p-4 rounded-xl border border-gray-800 md:col-span-1">
                        <h4 className="text-xs font-black uppercase tracking-wider text-orange-400 mb-2">Ordered Items</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {order.items && order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs border-b border-gray-800/60 pb-1.5">
                              <div>
                                <span className="font-bold text-white uppercase">{item.title}</span>
                                <span className="text-gray-400 block text-[10px]">Size: {item.size} | Qty: {item.quantity}</span>
                              </div>
                              <span className="font-black text-orange-400">Rs. {item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2 border-t border-gray-800">
                      <div>
                        <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Total Amount: </span>
                        <span className="text-xl font-black text-orange-500">Rs. {order.total_amount}</span>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleToggleOrderStatus(order.id, order.status)}
                          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${order.status === 'Completed' ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
                        >
                          {order.status === 'Completed' ? 'Mark Pending' : 'Mark Completed'}
                        </button>
                        
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="px-4 py-2 rounded-xl bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Delete Order
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Buttons (Bottom Right) - Silent Save & Reload */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <button
          onClick={handleSaveAll}
          disabled={loading}
          className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs tracking-wider rounded-2xl shadow-2xl shadow-emerald-950/60 flex items-center gap-2 transition-all cursor-pointer border border-emerald-400/30 active:scale-95 disabled:opacity-50"
          title="Save all modifications across all tabs seamlessly"
        >
          <span className="text-base">💾</span>
          <span>{loading ? 'Saving All...' : 'Save All Changes'}</span>
        </button>

        <button
          onClick={() => window.location.reload()}
          className="px-5 py-3.5 bg-gray-800 hover:bg-orange-600 text-white font-black uppercase text-xs tracking-wider rounded-2xl shadow-2xl shadow-black/60 flex items-center gap-2 transition-all cursor-pointer border border-gray-700 active:scale-95"
          title="Reload Admin Panel"
        >
          <span className="text-base">🔄</span>
          <span>Reload Panel</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminAuthGate>
      <AdminDashboardContent />
    </AdminAuthGate>
  );
}