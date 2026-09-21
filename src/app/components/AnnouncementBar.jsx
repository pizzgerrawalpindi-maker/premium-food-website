'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState({ text: '', is_active: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnnouncement() {
      try {
        // Admin panel ke mutabiq 'settings' table se fetch kar rahe hain
        const { data, error } = await supabase
          .from('settings')
          .select('announcement_text, is_announcement_active')
          .single();

        if (!error && data) {
          setAnnouncement({
            text: data.announcement_text || '',
            is_active: data.is_announcement_active ?? false,
          });
        }
      } catch (err) {
        console.error('Error fetching announcement:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnnouncement();
  }, []);

  // Agar loading ho, is_active false ho, ya text khaali ho to kuch na dikhaye
  if (loading || !announcement.is_active || !announcement.text.trim()) {
    return null;
  }

  // Infinite smooth loop ke liye Array repeat
  const items = Array(4).fill(announcement.text);

  return (
    <>
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-smooth {
          display: flex;
          width: max-content;
          animation: marquee 28s linear infinite;
        }
        .animate-marquee-smooth:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="w-full overflow-hidden bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 shadow-md border-b border-amber-500/30 py-2.5">
        <div className="animate-marquee-smooth flex items-center select-none">
          {items.map((itemText, idx) => (
            <div key={idx} className="flex items-center space-x-6 pr-12">
              <span className="bg-slate-950 text-yellow-400 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                <span className="animate-pulse text-amber-300">🔥</span> SPECIAL OFFER
              </span>
              <span className="text-sm font-extrabold tracking-wide uppercase font-sans drop-shadow-sm">
                {itemText}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}