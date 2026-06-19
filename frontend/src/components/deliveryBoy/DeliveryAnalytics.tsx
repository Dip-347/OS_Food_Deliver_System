import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const DeliveryAnalytics = ({ deliveryBoyId }: { deliveryBoyId: string }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalDeliveries: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      // 1. Fetch total earnings from riders table
      const { data: riderInfo } = await supabase
        .from('riders')
        .select('earnings, total_deliveries')
        .eq('id', deliveryBoyId)
        .single();

      // 2. Fetch daily delivery counts for the last 7 days
      const { data: orders } = await supabase
        .from('orders')
        .select('created_at')
        .eq('rider_id', deliveryBoyId)
        .eq('status', 'delivered');

      const last7Days = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return { 
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          rawDate: d.toISOString().split('T')[0],
          deliveries: 0 
        };
      });

      if (orders) {
        orders.forEach(order => {
          const orderDate = new Date(order.created_at).toISOString().split('T')[0];
          const dayIndex = last7Days.findIndex(d => d.rawDate === orderDate);
          if (dayIndex !== -1) {
            last7Days[dayIndex].deliveries += 1;
          }
        });
      }

      if (riderInfo) {
        setStats({
          totalEarnings: riderInfo.earnings || 0,
          totalDeliveries: riderInfo.total_deliveries || 0
        });
      }
      
      setChartData(last7Days);
      setLoading(false);
    };

    fetchAnalytics();
  }, [deliveryBoyId]);

  if (loading) return <div>Loading Analytics...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="widget" style={{ textAlign: 'center' }}>
          <p className="text-muted" style={{ margin: '0 0 8px 0' }}>Total Earnings</p>
          <h2 style={{ color: '#16a34a', margin: 0 }}>${stats.totalEarnings.toFixed(2)}</h2>
        </div>
        <div className="widget" style={{ textAlign: 'center' }}>
          <p className="text-muted" style={{ margin: '0 0 8px 0' }}>Successful Deliveries</p>
          <h2 style={{ color: '#3b82f6', margin: 0 }}>{stats.totalDeliveries}</h2>
        </div>
      </div>

      <div className="widget">
        <h3 style={{ marginBottom: '16px' }}>7-Day Delivery Trend</h3>
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="deliveries" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DeliveryAnalytics;
