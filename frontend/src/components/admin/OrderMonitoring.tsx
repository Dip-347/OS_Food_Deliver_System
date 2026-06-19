import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const OrderMonitoring = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, restaurants(name), users(full_name), riders!orders_rider_id_fkey(users(full_name))')
      .order('created_at', { ascending: false });
    
    if (data) setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    const subscription = supabase
      .channel('admin-order-monitor')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  if (loading) return <div>Loading active orders...</div>;

  return (
    <div className="widget" style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
            <th style={{ padding: '12px' }}>Order ID</th>
            <th style={{ padding: '12px' }}>Customer</th>
            <th style={{ padding: '12px' }}>Restaurant</th>
            <th style={{ padding: '12px' }}>Amount</th>
            <th style={{ padding: '12px' }}>Rider</th>
            <th style={{ padding: '12px' }}>Status</th>
            <th style={{ padding: '12px' }}>Time</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>#{order.id.split('-')[0]}</td>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>{order.users?.full_name || 'Unknown'}</td>
              <td style={{ padding: '12px' }}>{order.restaurants?.name || 'Unknown'}</td>
              <td style={{ padding: '12px' }}>${Number(order.total_amount).toFixed(2)}</td>
              <td style={{ padding: '12px' }}>{order.riders?.users?.full_name || 'Unassigned'}</td>
              <td style={{ padding: '12px' }}>
                <span style={{ 
                  padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold',
                  backgroundColor: order.status === 'delivered' ? '#dcfce7' : '#e0e7ff',
                  color: order.status === 'delivered' ? '#16a34a' : '#4338ca'
                }}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </span>
              </td>
              <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderMonitoring;
