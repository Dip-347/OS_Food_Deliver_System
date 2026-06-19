import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const RestaurantAnalytics = ({ restaurantId }: { restaurantId: string }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [topItems, setTopItems] = useState<{name: string, count: number}[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at, id')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'delivered');

      let revenue = 0;
      const last7Days = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return { 
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          rawDate: d.toISOString().split('T')[0],
          sales: 0 
        };
      });

      let topSelling: Record<string, number> = {};

      if (orders && orders.length > 0) {
        orders.forEach(order => {
          revenue += Number(order.total_amount);
          const orderDate = new Date(order.created_at).toISOString().split('T')[0];
          const dayIndex = last7Days.findIndex(d => d.rawDate === orderDate);
          if (dayIndex !== -1) {
            last7Days[dayIndex].sales += Number(order.total_amount);
          }
        });

        const orderIds = orders.map(o => o.id);
        
        // Fetch order items to calculate top selling
        const { data: items } = await supabase
          .from('order_items')
          .select('quantity, menu_items(name)')
          .in('order_id', orderIds);

        if (items) {
          items.forEach((item: any) => {
            const name = item.menu_items?.name;
            if (name) {
              topSelling[name] = (topSelling[name] || 0) + item.quantity;
            }
          });
        }
      }

      const topItemsArray = Object.keys(topSelling)
        .map(key => ({ name: key, count: topSelling[key] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // top 5

      setStats({
        totalRevenue: revenue,
        totalOrders: orders?.length || 0
      });
      setChartData(last7Days);
      setTopItems(topItemsArray);
      setLoading(false);
    };

    fetchAnalytics();
  }, [restaurantId]);

  if (loading) return <div>Loading Analytics...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="widget" style={{ textAlign: 'center' }}>
          <p className="text-muted" style={{ margin: '0 0 8px 0' }}>Total Revenue</p>
          <h2 style={{ color: '#16a34a', margin: 0 }}>${stats.totalRevenue.toFixed(2)}</h2>
        </div>
        <div className="widget" style={{ textAlign: 'center' }}>
          <p className="text-muted" style={{ margin: '0 0 8px 0' }}>Completed Orders</p>
          <h2 style={{ color: '#3b82f6', margin: 0 }}>{stats.totalOrders}</h2>
        </div>
      </div>

      <div className="widget">
        <h3 style={{ marginBottom: '16px' }}>7-Day Sales Trend ($)</h3>
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="sales" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="widget">
        <h3 style={{ marginBottom: '16px' }}>Top Selling Menu Items</h3>
        {topItems.length === 0 ? (
          <p className="text-muted">No sales data yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topItems.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                <span style={{ color: 'var(--text-muted)' }}>{item.count} sold</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantAnalytics;
