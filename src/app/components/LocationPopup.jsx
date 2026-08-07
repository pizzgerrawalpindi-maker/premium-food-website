'use client';
import { useState, useEffect } from 'react';

export default function LocationPopup() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sessionAddress = sessionStorage.getItem('user_detected_address');
    if (!sessionAddress) {
      setShowModal(true);
    }
  }, []);

  const handleEnableLocation = () => {
    setLoading(true);

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setLoading(false);
      setShowModal(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          
          const road = data.address.road || data.address.suburb || '';
          const area = data.address.neighbourhood || data.address.city_district || data.address.town || 'Rawalpindi';
          const detectedCity = data.address.city || data.address.state_district || 'Rawalpindi';
          
          const fullDetectedAddress = `${road ? road + ', ' : ''}${area}, ${detectedCity}`;
          
          sessionStorage.setItem('user_detected_address', fullDetectedAddress);
          sessionStorage.setItem('user_detected_city', detectedCity);
          localStorage.setItem('user_detected_address', fullDetectedAddress);
        } catch (err) {
          console.error("Error reverse geocoding:", err);
          sessionStorage.setItem('user_detected_address', 'Tipu Road, Rawalpindi');
          localStorage.setItem('user_detected_address', 'Tipu Road, Rawalpindi');
        } finally {
          setLoading(false);
          setShowModal(false);
        }
      },
      (error) => {
        console.error("Location error:", error);
        setLoading(false);
        // Agar location off hogi toh browser ya yeh alert guide kar dega
        alert("Please turn on your device location / GPS settings and try again, or skip to enter manually.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#18110e] border-2 border-orange-500 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl space-y-4">
        <div className="w-14 h-14 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mx-auto text-2xl border border-orange-500/30">
          📍
        </div>
        <h3 className="text-xl font-black uppercase text-white tracking-wide">Enable Your Location</h3>
        <p className="text-xs text-orange-200/70 font-medium leading-relaxed">
          Allow us to detect your current location to deliver your favorite PizzGer meals blazing fast near Tipu Road, Rawalpindi.
        </p>

        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={handleEnableLocation}
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-3.5 rounded-2xl uppercase tracking-wider text-xs shadow-lg shadow-orange-600/30 transition-all cursor-pointer"
          >
            {loading ? 'Detecting...' : 'Enable Location'}
          </button>
          
          <button
            type="button"
            onClick={() => {
              sessionStorage.setItem('user_detected_address', 'Rawalpindi');
              setShowModal(false);
            }}
            className="w-full bg-transparent text-gray-400 hover:text-orange-200 font-bold py-2 text-xs uppercase tracking-wider cursor-pointer"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}