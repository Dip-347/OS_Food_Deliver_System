import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Restaurant {
  id: string;
  name: string;
  description: string;
  image_url: string;
  rating: number;
}

const RestaurantList = ({ onSelect }: { onSelect: (id: string, name: string) => void }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true);
      
      if (!error && data) {
        setRestaurants(data);
      }
      setLoading(false);
    };

    fetchRestaurants();
  }, []);

  if (loading) return <div>Loading restaurants...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Available Restaurants</h2>
      <div className="dashboard-widgets">
        {restaurants.map((rest) => (
          <div 
            key={rest.id} 
            className="widget" 
            style={{ cursor: 'pointer', padding: 0, overflow: 'hidden' }}
            onClick={() => onSelect(rest.id, rest.name)}
          >
            <div 
              style={{ 
                height: '150px', 
                background: `url(${rest.image_url}) center/cover` 
              }} 
            />
            <div style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 8px 0' }}>{rest.name}</h3>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '12px' }}>{rest.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>★ {rest.rating}</span>
                <span className="btn-text">View Menu →</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {restaurants.length === 0 && <p>No restaurants available right now.</p>}
    </div>
  );
};

export default RestaurantList;
