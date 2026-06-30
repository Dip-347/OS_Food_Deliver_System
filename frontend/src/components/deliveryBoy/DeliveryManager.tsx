import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { MapPin, Navigation, CheckCircle, KeyRound, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ChatBox from '../shared/ChatBox';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import RiderMapDashboard from './RiderMapDashboard';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface DeliveryManagerProps {
  order: any;
  onDeliveryComplete: () => void;
}

const DeliveryManager = ({ order, onDeliveryComplete }: DeliveryManagerProps) => {
  const { user } = useAuth();
  const [status, setStatus] = useState(order.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [trackingActive, setTrackingActive] = useState(false);
  const [deliveryOtpDisplay, setDeliveryOtpDisplay] = useState<string | null>(null);

  // Status progression: accepted -> picked_up -> delivered
  const verifyOtp = async () => {
    setLoading(true);
    setError(null);

    // Validate OTP against database
    const { data, error: fetchError } = await supabase
      .from('orders')
      .select('pickup_otp')
      .eq('id', order.id)
      .single();

    if (fetchError || !data) {
      setError('Failed to verify OTP.');
      setLoading(false);
      return;
    }

    if (data.pickup_otp !== otpInput.trim()) {
      setError('Invalid OTP. Please check with the restaurant.');
      setLoading(false);
      return;
    }

    // OTP Matches! Update status to picked_up
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'picked_up' })
      .eq('id', order.id);

    setLoading(false);
    if (updateError) {
      setError(updateError.message);
    } else {
      setStatus('picked_up');
    }
  };

  const arrivedAtDestination = async () => {
    setLoading(true);
    setError(null);
    
    // Generate 4-digit OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'arrived',
        delivery_otp: generatedOtp
      })
      .eq('id', order.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setDeliveryOtpDisplay(generatedOtp);
    setStatus('arrived');
    setLoading(false);
  };

  useEffect(() => {
    // Listen for customer confirming delivery
    const channel = supabase.channel(`order-status-${order.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${order.id}` }, (payload) => {
        if (payload.new.status === 'delivered') {
          setStatus('delivered');
          onDeliveryComplete();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order.id, onDeliveryComplete]);

  const lastDbUpdate = useRef<number>(0);

  useEffect(() => {
    let watchId: number;

    if (status === 'picked_up' || status === 'on_way') {
      setTrackingActive(true);
      const channel = supabase.channel(`tracking:${order.id}`);
      channel.subscribe();

      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            channel.send({
              type: 'broadcast',
              event: 'location',
              payload: { lat: latitude, lng: longitude }
            });

            // Update database at most every 5 seconds to avoid rate limits
            const now = Date.now();
            if (now - lastDbUpdate.current > 5000 && user) {
              lastDbUpdate.current = now;
              supabase.from('riders')
                .update({ current_lat: latitude, current_lng: longitude })
                .eq('user_id', user.id)
                .then(({ error }) => {
                  if (error) console.error('Failed to save location to DB', error);
                });
            }
          },
          (err) => {
            console.error('GPS tracking error:', err);
          },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
      }

      return () => {
        if (watchId) navigator.geolocation.clearWatch(watchId);
        supabase.removeChannel(channel);
        setTrackingActive(false);
      };
    }
  }, [status, order.id, user]);

  return (
    <div className="soft-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '8px' }}>Active Delivery</h2>
        <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--primary)', color: 'white', fontWeight: 'bold' }}>
          Order #{order.id.split('-')[0]}
        </div>
      </div>

      {error && <div className="auth-error">{error}</div>}

      {/* Rider Map Dashboard replaces the old grid and inline map */}
      <RiderMapDashboard 
        tasks={[
          ...(order.restaurants?.lat && order.restaurants?.lng ? [{
            id: 'pickup-' + order.id,
            type: 'pickup' as const,
            lat: order.restaurants.lat,
            lng: order.restaurants.lng,
            title: order.restaurants.name,
            subtitle: 'Pickup Location',
            orderId: order.id
          }] : []),
          ...(order.delivery_lat && order.delivery_lng ? [{
            id: 'delivery-' + order.id,
            type: 'delivery' as const,
            lat: order.delivery_lat,
            lng: order.delivery_lng,
            title: order.users?.full_name || 'Customer',
            subtitle: order.delivery_address,
            orderId: order.id
          }] : [])
        ]}
        riderLocation={trackingActive && user ? undefined : null} // Rider location handled by component or GPS state if we had it here
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
        {status === 'accepted' && (
          <div className="widget" style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ display: 'inline-flex', padding: '12px', backgroundColor: 'rgba(255, 75, 43, 0.1)', borderRadius: '50%', color: 'var(--primary)', marginBottom: '16px' }}>
              <KeyRound size={24} />
            </div>
            <h3 style={{ marginBottom: '8px' }}>Verify Pickup</h3>
            <p className="text-muted" style={{ marginBottom: '16px' }}>Enter the 4-digit OTP provided by the restaurant.</p>
            
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <input 
                type="text" 
                maxLength={4}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                placeholder="0000"
                style={{ width: '120px', textAlign: 'center', fontSize: '1.5rem', letterSpacing: '4px', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              />
            </div>
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '16px', width: '100%' }}
              onClick={verifyOtp}
              disabled={loading || otpInput.length !== 4}
            >
              {loading ? 'Verifying...' : 'Confirm Pickup'}
            </button>
          </div>
        )}

        {(status === 'picked_up' || status === 'on_way') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {trackingActive && (
              <div style={{ textAlign: 'center', padding: '12px', color: '#16a34a', backgroundColor: '#dcfce7', borderRadius: 'var(--radius-md)', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <span className="live-dot" style={{ width: '10px', height: '10px', backgroundColor: '#16a34a', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
                Live GPS Tracking Active
              </div>
            )}
            
            <button 
              className="btn btn-full" 
              style={{ padding: '16px', fontSize: '1.1rem', backgroundColor: '#16a34a', color: 'white', border: 'none' }}
              onClick={arrivedAtDestination}
              disabled={loading}
            >
              <CheckCircle size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Arrived at Destination
            </button>
          </div>
        )}

        {status === 'arrived' && (
          <div className="widget" style={{ textAlign: 'center', padding: '24px', backgroundColor: '#fff7ed', border: '2px dashed #f97316' }}>
            <h3 style={{ color: '#ea580c', marginBottom: '8px' }}>You have arrived!</h3>
            <p className="text-muted" style={{ marginBottom: '16px' }}>Show this OTP to the customer so they can confirm receipt on their app.</p>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', letterSpacing: '8px', color: '#ea580c', margin: '20px 0' }}>
              {deliveryOtpDisplay || order.delivery_otp || '----'}
            </div>
            <p style={{ fontSize: '0.9rem', color: '#9a3412' }}>Waiting for customer to verify...</p>
          </div>
        )}
      </div>

      {(status === 'accepted' || status === 'picked_up' || status === 'on_way') && (
        <div style={{ marginTop: '16px' }}>
          <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={16} color="var(--primary)" /> Message Customer
          </h4>
          <ChatBox orderId={order.id} receiverId={order.customer_id} />
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(22, 163, 74, 0); }
          100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
        }
      `}</style>
    </div>
  );
};

export default DeliveryManager;
