import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, MapPin, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

const customerIcon = createCustomIcon('#3b82f6'); // Blue

const fetchAddress = async (lat: number, lng: number, callback: (lat: number, lng: number, address: string) => void) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const data = await res.json();
    if (data && data.display_name) {
      callback(lat, lng, data.display_name);
    } else {
      callback(lat, lng, `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
    }
  } catch (error) {
    callback(lat, lng, `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
  }
};

function LocationMarker({ 
  position, 
  onLocationSelect 
}: { 
  position: {lat: number, lng: number} | null, 
  onLocationSelect: (lat: number, lng: number, address: string) => void 
}) {
  const map = useMapEvents({
    click(e) {
      fetchAddress(e.latlng.lat, e.latlng.lng, onLocationSelect);
    },
  });

  // Effect to fly to position when it changes from outside (e.g. geolocation)
  React.useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 15);
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={[position.lat, position.lng]} icon={customerIcon}></Marker>
  );
}

const Checkout = ({ onBack, onComplete }: { onBack: () => void, onComplete: () => void }) => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // Default to COD
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [locating, setLocating] = useState(false);

  const handleLocationSelect = (lat: number, lng: number, fetchedAddress: string) => {
    setCoordinates({ lat, lng });
    setAddress(fetchedAddress);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    
    setLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        fetchAddress(lat, lng, handleLocationSelect);
        setLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to retrieve your location. Please ensure location permissions are granted in your browser.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !user) return;
    if (!address) {
      alert("Please enter a delivery address or select one from the map.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create the Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          restaurant_id: items[0].restaurant_id, // assuming single restaurant policy
          total_amount: total,
          status: 'pending_restaurant',
          delivery_address: address,
          delivery_lat: coordinates ? coordinates.lat : 22.3569,
          delivery_lng: coordinates ? coordinates.lng : 91.7832
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create Order Items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Success
      clearCart();
      alert('Order placed successfully!');
      onComplete();
    } catch (error: any) {
      alert('Checkout failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="soft-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <button onClick={onBack} className="btn-text" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <h2 style={{ marginBottom: '24px' }}>Checkout</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div>
          <div style={{ marginBottom: '32px', padding: '16px', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Order Summary</h3>
            {items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>{item.quantity}x {item.name}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', fontWeight: 'bold' }}>
              <span>Total To Pay:</span>
              <span style={{ color: 'var(--primary)' }}>${total.toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handleCheckout}>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 'bold' }}>
                <MapPin size={16} /> Delivery Address
              </label>
              <textarea 
                required 
                className="form-input" 
                rows={4} 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Click on the map to select address, or type here..."
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Payment Method</label>
              <select 
                className="form-input" 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cod">Cash on Delivery</option>
                <option value="card" disabled>Credit/Debit Card (Coming Soon)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-large" disabled={loading || items.length === 0}>
              {loading ? 'Processing...' : 'Place Order Now'}
            </button>
          </form>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Select Location on Map</h3>
            <button 
              type="button"
              className="btn btn-secondary" 
              onClick={handleGetCurrentLocation}
              disabled={locating}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.85rem' }}
            >
              <Navigation size={14} /> {locating ? 'Locating...' : 'Use Current Location'}
            </button>
          </div>
          <div style={{ height: '400px', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <MapContainer center={[22.3569, 91.7832]} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={coordinates} onLocationSelect={handleLocationSelect} />
            </MapContainer>
          </div>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '12px', textAlign: 'center' }}>
            Click anywhere on the map to pin your exact delivery location.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
