import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import DeliveryManager from './DeliveryManager';
import { Navigation, Bike, MapPin, Power } from 'lucide-react';
import Toast from '../shared/Toast';

const DeliveryBoyDashboard = ({ deliveryBoyId }: { deliveryBoyId: string }) => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [activeDelivery, setActiveDelivery] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const [stats, setStats] = useState({ earnings: 0, rating: 5.0 });

  const fetchDeliveryBoyStatus = async () => {
    const { data } = await supabase.from('riders').select('is_available, earnings, rating').eq('id', deliveryBoyId).single();
    if (data) {
      setIsOnline(data.is_available);
      setStats({ earnings: data.earnings || 0, rating: data.rating || 5.0 });
    }
  };

  const fetchOrders = async () => {
    // 1. Check if deliveryBoy already has an active delivery (ready or on_way)
    const { data: active } = await supabase
      .from('orders')
      .select('*, restaurants(name, lat, lng), users(full_name), order_items(quantity, menu_items(name))')
      .eq('rider_id', deliveryBoyId)
      .in('status', ['accepted', 'on_way', 'picked_up', 'arrived'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (active) {
      setActiveDelivery(active);
    } else {
      setActiveDelivery(null);
      // 2. Fetch available assigned orders (pending_rider and assigned to this rider, or ready_for_pickup for all)
      const { data: available } = await supabase
        .from('orders')
        .select('*, restaurants(name, lat, lng), users(full_name), order_items(quantity, menu_items(name))')
        .in('status', ['pending_rider', 'ready_for_pickup'])
        .or(`rider_id.eq.${deliveryBoyId},rider_id.is.null`)
        .order('created_at', { ascending: true });
        
      if (available) {
        const filtered = available.filter((o: any) => !(o.rejected_by || []).includes(deliveryBoyId));
        setAvailableOrders(filtered);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDeliveryBoyStatus();
    fetchOrders();

    // Realtime subscription for new orders
    const subscription = supabase
      .channel('rider-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'UPDATE' && payload.new.status === 'ready_for_pickup') {
          setToastMessage('🔔 New Delivery Request!');
          setShowToast(true);
        }
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [deliveryBoyId]);

  const toggleOnlineStatus = async () => {
    const newStatus = !isOnline;
    await supabase.from('riders').update({ is_available: newStatus }).eq('id', deliveryBoyId);
    setIsOnline(newStatus);
  };

  const acceptOrder = async (orderId: string) => {
    // The trigger already generated OTP and assigned rider_id
    // Just update status to 'accepted'
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status: 'accepted',
        rider_id: deliveryBoyId // ensure rider is set if they picked it from pool
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error || !data) {
      alert('Failed to accept order.');
      fetchOrders();
    } else {
      fetchOrders(); // Will fetch the now-active delivery
    }
  };

  const rejectOrder = async (orderId: string) => {
    // Get current rejected_by array
    const { data: currentOrder } = await supabase.from('orders').select('rejected_by').eq('id', orderId).single();
    const newRejectedBy = [...(currentOrder?.rejected_by || []), deliveryBoyId];

    // Revert to ready_for_pickup and nullify rider
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'ready_for_pickup',
        rider_id: null,
        rejected_by: newRejectedBy
      })
      .eq('id', orderId);

    if (error) {
      alert('Failed to reject order.');
    }
    fetchOrders();
  };

  if (loading) return <div>Loading dashboard...</div>;

  if (activeDelivery) {
    return <DeliveryManager order={activeDelivery} onDeliveryComplete={fetchOrders} />;
  }

  return (
    <div>
      <Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>DeliveryBoy Dashboard</h2>
        <button 
          onClick={toggleOnlineStatus}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', 
            borderRadius: 'var(--radius-full)', border: 'none', fontWeight: 'bold', cursor: 'pointer',
            backgroundColor: isOnline ? '#16a34a' : '#ef4444', color: 'white'
          }}
        >
          <Power size={16} /> {isOnline ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div className="widget" style={{ flex: 1, textAlign: 'center' }}>
          <p className="text-muted" style={{ margin: '0 0 8px 0' }}>Current Earnings</p>
          <h3 style={{ color: '#16a34a', margin: 0 }}>${stats.earnings.toFixed(2)}</h3>
        </div>
        <div className="widget" style={{ flex: 1, textAlign: 'center' }}>
          <p className="text-muted" style={{ margin: '0 0 8px 0' }}>Current Rating</p>
          <h3 style={{ color: '#f59e0b', margin: 0 }}>★ {stats.rating.toFixed(1)}</h3>
        </div>
      </div>

      {!isOnline ? (
        <div className="soft-container" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ display: 'inline-flex', padding: '16px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '50%', color: 'var(--text-muted)', marginBottom: '16px' }}>
            <Bike size={32} />
          </div>
          <h3>You are Offline</h3>
          <p className="text-muted">Go online to start receiving delivery requests.</p>
        </div>
      ) : (
        <>
          <h3 style={{ marginBottom: '16px' }}>Available Deliveries</h3>
          {availableOrders.length === 0 ? (
            <div className="soft-container" style={{ textAlign: 'center', padding: '40px' }}>
              <p className="text-muted">Waiting for new orders... Stay close to popular restaurants!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {availableOrders.map(order => (
                <div key={order.id} className="widget" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} color="var(--primary)" /> {order.restaurants?.name}
                    </h4>
                    <p className="text-muted" style={{ margin: '0 0 4px 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Navigation size={16} /> Deliver to: {order.delivery_address}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}>
                      Items: {order.order_items?.length} | Collect: ${order.total_amount.toFixed(2)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => acceptOrder(order.id)}
                    >
                      Accept
                    </button>
                    <button 
                      className="btn" 
                      style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }}
                      onClick={() => rejectOrder(order.id)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DeliveryBoyDashboard;
