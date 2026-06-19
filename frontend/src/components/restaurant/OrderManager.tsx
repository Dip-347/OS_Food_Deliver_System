import { useEffect, useState } from 'react';
// Import path corrected: removed one '../'
import { supabase } from '../../lib/supabase';
import { Clock, CheckCircle, Package } from 'lucide-react';
import Toast from '../shared/Toast';

interface OrderItem {
  id: string;
  quantity: number;
  menu_items: { name: string };
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  delivery_address: string;
  order_items: OrderItem[];
  users: { full_name: string, email: string };
  pickup_otp?: string;
}

const OrderManager = ({ restaurantId }: { restaurantId: string }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items ( id, quantity, menu_items ( name ) ),
          users ( full_name, email )
        `)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        console.log("Fetched orders for restaurant:", data);
        setOrders(data as any);
      } else if (error) {
        console.error("Error fetching orders:", error);
      }
      setLoading(false);
    };

    fetchOrders();

    // Realtime subscription for incoming orders
    const subscription = supabase
      .channel('restaurant-orders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `restaurant_id=eq.${restaurantId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setToastMessage('🔔 New Order Arrived!');
          setShowToast(true);
        } else if (payload.eventType === 'UPDATE') {
          setToastMessage(`Order #${payload.new.id.split('-')[0]} updated!`);
          setShowToast(true);
        }
        fetchOrders(); // Re-fetch on any order change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [restaurantId]);

  const updateStatus = async (id: string, newStatus: string) => {
    const updateData: any = { status: newStatus };
    
    // If retrying or first time ready, reset the rider pool and generate OTP
    if (newStatus === 'ready_for_pickup') {
      updateData.rider_id = null;
      updateData.rejected_by = [];
      updateData.pickup_otp = Math.floor(1000 + Math.random() * 9000).toString();
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id);

    if (error) alert('Failed to update status: ' + error.message);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_restaurant': return 'orange';
      case 'rejected_by_restaurant': return '#ef4444';
      case 'preparing': return '#3b82f6';
      case 'ready_for_pickup': return '#8b5cf6';
      case 'pending_rider': return '#8b5cf6';
      case 'ready_for_pickup_no_rider': return '#ef4444';
      case 'accepted': return '#f59e0b';
      case 'picked_up': return '#ec4899';
      case 'on_way': return '#ec4899';
      case 'delivered': return 'var(--primary)';
      default: return 'gray';
    }
  };

  if (loading) return <div>Loading orders...</div>;

  const activeOrders = orders.filter(o => ['pending_restaurant', 'preparing', 'ready_for_pickup', 'pending_rider', 'ready_for_pickup_no_rider', 'accepted', 'picked_up', 'on_way'].includes(o.status));
  const pastOrders = orders.filter(o => ['delivered'].includes(o.status));

  return (
    <div>
      <Toast message={toastMessage} isVisible={showToast} onClose={() => setShowToast(false)} />
      <h2 style={{ marginBottom: '24px' }}>Active Orders</h2>

      <div style={{ display: 'grid', gap: '24px' }}>
        {activeOrders.map(order => (
          <div key={order.id} className="widget" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0' }}>Order #{order.id.split('-')[0]}</h3>
                <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0 }}>
                  {order.users?.full_name || order.users?.email || 'Customer'} • {new Date(order.created_at).toLocaleTimeString()}
                </p>
                <p className="text-muted" style={{ fontSize: '0.9rem', marginTop: '4px' }}>
                  📍 {order.delivery_address || 'No address provided'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  display: 'inline-block', padding: '6px 12px', borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(0,0,0,0.05)', color: getStatusColor(order.status),
                  fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem',
                  border: `1px solid ${getStatusColor(order.status)}`, marginBottom: '8px'
                }}>
                  {order.status === 'pending_restaurant' ? 'Placed' : 
                   order.status === 'preparing' ? 'Processing' : 
                   (order.status === 'ready_for_pickup' || order.status === 'pending_rider') ? 'Ready for DeliveryBoy' : 
                   order.status === 'ready_for_pickup_no_rider' ? 'No Rider Found' :
                   order.status.replace('_', ' ')}
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>${order.total_amount.toFixed(2)}</div>
              </div>
            </div>

            {/* OTP Display for Restaurant Verification */}
            {order.pickup_otp && (order.status === 'accepted' || order.status === 'ready_for_pickup' || order.status === 'pending_rider' || order.status === 'pending_restaurant') && (
              <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid #f59e0b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: '#b45309' }}>DeliveryBoy Pickup OTP:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '4px', color: '#b45309', backgroundColor: 'white', padding: '4px 12px', borderRadius: '4px' }}>
                  {order.pickup_otp}
                </span>
              </div>
            )}

            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '8px' }}>Items:</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {order.order_items?.map((item, i) => (
                  <li key={i} style={{ padding: '4px 0', fontSize: '0.95rem' }}>
                    <span style={{ fontWeight: 'bold', marginRight: '8px' }}>{item.quantity}x</span>
                    {item.menu_items?.name}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              {order.status === 'pending_restaurant' && (
                <>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => updateStatus(order.id, 'preparing')}>
                    <Clock size={16} /> Accept & Prepare
                  </button>
                  <button className="btn" style={{ flex: 1, backgroundColor: '#ef4444', color: 'white', border: 'none' }} onClick={() => updateStatus(order.id, 'rejected_by_restaurant')}>
                    Reject
                  </button>
                </>
              )}
              {order.status === 'preparing' && (
                <button className="btn btn-full" style={{ backgroundColor: '#8b5cf6', color: 'white', border: 'none' }} onClick={() => updateStatus(order.id, 'ready_for_pickup')}>
                  <CheckCircle size={16} /> Ready for Delivery
                </button>
              )}
              {(order.status === 'ready_for_pickup' || order.status === 'pending_rider') && (
                <button className="btn btn-secondary btn-full" disabled>
                  <Package size={16} /> Waiting for DeliveryBoy to Accept...
                </button>
              )}
              {order.status === 'ready_for_pickup_no_rider' && (
                <button className="btn btn-full" style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }} onClick={() => updateStatus(order.id, 'ready_for_pickup')}>
                  <Clock size={16} /> Retry Finding Rider
                </button>
              )}
              {order.status === 'accepted' && (
                <button className="btn btn-secondary btn-full" disabled style={{ backgroundColor: '#f59e0b', color: 'white', border: 'none' }}>
                  <Package size={16} /> DeliveryBoy En Route. Verify OTP on arrival.
                </button>
              )}
              {(order.status === 'picked_up' || order.status === 'on_way') && (
                <button className="btn btn-secondary btn-full" disabled style={{ backgroundColor: '#ec4899', color: 'white', border: 'none' }}>
                  <Package size={16} /> Out For Delivery
                </button>
              )}
            </div>
          </div>
        ))}

        {activeOrders.length === 0 && (
          <div className="soft-container" style={{ textAlign: 'center', padding: '40px' }}>
            <p className="text-muted">No active orders right now. Time to prep!</p>
          </div>
        )}
      </div>

      <h3 style={{ marginTop: '48px', marginBottom: '24px' }}>Past Orders</h3>
      <div style={{ opacity: 0.7 }}>
        {pastOrders.slice(0, 5).map(order => (
          <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
            <span>Order #{order.id.split('-')[0]}</span>
            <span style={{ color: getStatusColor(order.status) }}>{order.status.replace('_', ' ')}</span>
          </div>
        ))}
        {pastOrders.length === 0 && <p className="text-muted">No past orders.</p>}
      </div>
    </div>
  );
};

export default OrderManager;