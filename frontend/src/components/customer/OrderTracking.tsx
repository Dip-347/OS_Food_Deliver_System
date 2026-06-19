import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import ChatBox from '../shared/ChatBox';
import RatingForm from './RatingForm';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  restaurants: { name: string, lat?: number, lng?: number };
  deliveryBoy_location?: { lat: number; lng: number } | null;
  delivery_lat?: number;
  delivery_lng?: number;
  rider_id?: string;
  is_rated?: boolean;
}

const OrderTracking = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [verifying, setVerifying] = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState<Record<string, string>>({});
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, total_amount, status, created_at, rider_id, is_rated, delivery_lat, delivery_lng,
          restaurants ( name, lat, lng )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data as any);
      }
      setLoading(false);
    };

    fetchOrders();

    const subscription = supabase
      .channel('public:orders')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'orders',
        filter: `customer_id=eq.${user.id}` 
      }, (payload) => {
        setOrders(current => 
          current.map(order => 
            order.id === payload.new.id ? { ...order, status: payload.new.status } : order
          )
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  // Set up live GPS tracking for 'picked_up' and 'on_way' orders
  useEffect(() => {
    const activeTrackingOrders = orders.filter(o => o.status === 'picked_up' || o.status === 'on_way');
    const channels: any[] = [];

    activeTrackingOrders.forEach(order => {
      const channel = supabase.channel(`tracking:${order.id}`)
        .on('broadcast', { event: 'location' }, (payload) => {
          setOrders(current => current.map(o => 
            o.id === order.id ? { ...o, deliveryBoy_location: payload.payload } : o
          ));
        })
        .subscribe();
      channels.push(channel);
    });

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [orders.map(o => o.status).join(',')]); // Only re-run when statuses change

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending_restaurant': return 'orange';
      case 'rejected_by_restaurant': return '#ef4444';
      case 'preparing': return '#3b82f6';
      case 'ready_for_pickup': return '#8b5cf6';
      case 'pending_rider': return '#8b5cf6';
      case 'accepted': return '#f59e0b';
      case 'picked_up': return '#ec4899';
      case 'on_way': return '#ec4899';
      case 'arrived': return '#f97316';
      case 'delivered': return 'var(--primary)';
      default: return 'gray';
    }
  };

  const handleVerifyDeliveryOtp = async (orderId: string) => {
    setVerifying(prev => ({ ...prev, [orderId]: true }));
    setErrorMsg(prev => ({ ...prev, [orderId]: '' }));

    const inputOtp = otpInputs[orderId] || '';

    // Fetch the actual OTP from the database
    const { data: orderData, error: fetchError } = await supabase
      .from('orders')
      .select('delivery_otp, rider_id')
      .eq('id', orderId)
      .single();

    if (fetchError || !orderData) {
      setErrorMsg(prev => ({ ...prev, [orderId]: 'Failed to verify OTP.' }));
      setVerifying(prev => ({ ...prev, [orderId]: false }));
      return;
    }

    if (orderData.delivery_otp !== inputOtp.trim()) {
      setErrorMsg(prev => ({ ...prev, [orderId]: 'Incorrect OTP. Check with the rider.' }));
      setVerifying(prev => ({ ...prev, [orderId]: false }));
      return;
    }

    // Update order status to delivered
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'delivered' })
      .eq('id', orderId);

    if (updateError) {
      setErrorMsg(prev => ({ ...prev, [orderId]: updateError.message }));
      setVerifying(prev => ({ ...prev, [orderId]: false }));
      return;
    }

    // Add earnings to rider ($5 base pay)
    if (orderData.rider_id) {
      const { data: riderInfo } = await supabase.from('riders').select('earnings, total_deliveries').eq('id', orderData.rider_id).single();
      if (riderInfo) {
        await supabase.from('riders').update({
          earnings: (riderInfo.earnings || 0) + 5.00,
          total_deliveries: (riderInfo.total_deliveries || 0) + 1
        }).eq('id', orderData.rider_id);
      }
    }

    setVerifying(prev => ({ ...prev, [orderId]: false }));
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>My Orders</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {orders.map((order) => (
          <div key={order.id} className="widget" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0' }}>{order.restaurants?.name || 'Restaurant'}</h3>
                <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0 }}>
                  Order ID: {order.id.split('-')[0]}... • ${order.total_amount.toFixed(2)}
                </p>
                <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  display: 'inline-block', 
                  padding: '6px 12px', 
                  borderRadius: 'var(--radius-full)', 
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  color: getStatusColor(order.status),
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  fontSize: '0.8rem',
                  border: `1px solid ${getStatusColor(order.status)}`
                }}>
                  {order.status === 'on_way' ? 'Out for Delivery' : order.status === 'arrived' ? 'Rider Arrived' : order.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Live GPS Map for Active Deliveries */}
            {(order.status === 'picked_up' || order.status === 'on_way') && (
              <div style={{ height: '250px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative' }}>
                {order.deliveryBoy_location ? (
                  <MapContainer 
                    bounds={order.delivery_lat ? [
                      [order.deliveryBoy_location.lat, order.deliveryBoy_location.lng],
                      [order.delivery_lat, order.delivery_lng!]
                    ] : undefined}
                    center={!order.delivery_lat ? [order.deliveryBoy_location.lat, order.deliveryBoy_location.lng] : undefined}
                    zoom={15} 
                    style={{ height: '100%', width: '100%' }} 
                    zoomControl={false}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    
                    {/* Rider Marker */}
                    <Marker position={[order.deliveryBoy_location.lat, order.deliveryBoy_location.lng]}>
                      <Popup>Your deliveryBoy is here!</Popup>
                    </Marker>
                    
                    {/* Customer Destination Marker */}
                    {order.delivery_lat && order.delivery_lng && (
                      <Marker position={[order.delivery_lat, order.delivery_lng]}>
                        <Popup>Your Delivery Location</Popup>
                      </Marker>
                    )}
                  </MapContainer>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', backgroundColor: '#f8f9fa', color: 'var(--primary)', fontWeight: 'bold' }}>
                    Waiting for deliveryBoy GPS signal...
                  </div>
                )}
                <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, backgroundColor: 'white', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 'bold', color: '#16a34a', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', backgroundColor: '#16a34a', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
                  Live Tracking
                </div>
              </div>
            )}

            {/* OTP Verification for Arrived Orders */}
            {order.status === 'arrived' && (
              <div className="widget" style={{ textAlign: 'center', padding: '24px', backgroundColor: '#fff7ed', border: '2px dashed #f97316' }}>
                <h3 style={{ color: '#ea580c', marginBottom: '8px' }}>Your rider has arrived!</h3>
                <p className="text-muted" style={{ marginBottom: '16px' }}>Please enter the 4-digit code shown on the rider's phone to confirm delivery.</p>
                
                {errorMsg[order.id] && <div style={{ color: '#ef4444', marginBottom: '12px', fontWeight: 'bold' }}>{errorMsg[order.id]}</div>}
                
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <input 
                    type="text" 
                    maxLength={4}
                    value={otpInputs[order.id] || ''}
                    onChange={(e) => setOtpInputs(prev => ({ ...prev, [order.id]: e.target.value.replace(/\D/g, '') }))}
                    placeholder="0000"
                    style={{ width: '120px', textAlign: 'center', fontSize: '1.5rem', letterSpacing: '4px', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <button 
                  className="btn btn-primary" 
                  style={{ marginTop: '16px', width: '100%', backgroundColor: '#ea580c' }}
                  onClick={() => handleVerifyDeliveryOtp(order.id)}
                  disabled={verifying[order.id] || (otpInputs[order.id] || '').length !== 4}
                >
                  {verifying[order.id] ? 'Verifying...' : 'Confirm Receipt'}
                </button>
              </div>
            )}

            {/* Live Chat for Active Deliveries */}
            {(order.status === 'accepted' || order.status === 'picked_up' || order.status === 'on_way') && order.rider_id && (
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Message DeliveryBoy
                </h4>
                <ChatBox orderId={order.id} receiverId={order.rider_id} />
              </div>
            )}

            {/* Rating Form for Delivered Orders */}
            {order.status === 'delivered' && order.rider_id && !order.is_rated && (
              <RatingForm 
                orderId={order.id} 
                deliveryBoyId={order.rider_id} 
                onSubmitted={() => {
                  setOrders(current => current.map(o => o.id === order.id ? { ...o, is_rated: true } : o));
                }} 
              />
            )}
          </div>
        ))}

        {orders.length === 0 && (
          <div className="soft-container" style={{ textAlign: 'center', padding: '40px' }}>
            <p className="text-muted">You haven't placed any orders yet.</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.7); }
          70% { box-shadow: 0 0 0 8px rgba(22, 163, 74, 0); }
          100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
        }
      `}</style>
    </div>
  );
};

export default OrderTracking;
