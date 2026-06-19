import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { MapPin, Navigation, Calendar } from 'lucide-react';

interface HistoryPageProps {
  deliveryBoyId: string;
}

const HistoryPage = ({ deliveryBoyId }: HistoryPageProps) => {
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, restaurants(name), users(full_name), order_items(quantity, menu_items(name))')
        .eq('rider_id', deliveryBoyId)
        .eq('status', 'delivered')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setHistoryOrders(data);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [deliveryBoyId]);

  if (loading) return <div>Loading history...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Delivery History</h2>
      
      {historyOrders.length === 0 ? (
        <div className="soft-container" style={{ textAlign: 'center', padding: '40px' }}>
          <p className="text-muted">You haven't completed any deliveries yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {historyOrders.map(order => (
            <div key={order.id} className="widget" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} color="var(--primary)" /> {order.restaurants?.name}
                </h4>
                <p className="text-muted" style={{ margin: '0 0 4px 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Navigation size={16} /> Delivered to: {order.delivery_address}
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#16a34a', fontWeight: 'bold' }}>
                  Earned: $5.00
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', color: 'var(--text-muted)' }}>
                  <Calendar size={14} /> {new Date(order.created_at).toLocaleDateString()}
                </p>
                <span style={{ 
                  display: 'inline-block', 
                  padding: '4px 12px', 
                  borderRadius: 'var(--radius-full)', 
                  backgroundColor: '#dcfce7',
                  color: '#16a34a',
                  fontWeight: 'bold',
                  fontSize: '0.8rem'
                }}>
                  COMPLETED
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
