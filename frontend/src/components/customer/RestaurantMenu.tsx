import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useCart } from '../../context/CartContext';
import { ArrowLeft } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
}

const RestaurantMenu = ({ 
  restaurantId, 
  restaurantName,
  onBack 
}: { 
  restaurantId: string; 
  restaurantName: string;
  onBack: () => void;
}) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchMenu = async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true);
      
      if (!error && data) {
        setItems(data);
      }
      setLoading(false);
    };

    fetchMenu();
  }, [restaurantId]);

  if (loading) return <div>Loading menu...</div>;

  return (
    <div>
      <button onClick={onBack} className="btn-text" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Restaurants
      </button>
      
      <h2 style={{ marginBottom: '24px' }}>{restaurantName} - Menu</h2>
      
      <div className="dashboard-widgets">
        {items.map((item) => (
          <div key={item.id} className="widget" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {item.image_url && (
                <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '12px' }} />
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ margin: 0 }}>{item.name}</h3>
                <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem' }}>
                  ${item.price.toFixed(2)}
                </span>
              </div>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>{item.description}</p>
            </div>
            <button 
              className="btn btn-secondary btn-full"
              onClick={() => addToCart({
                id: item.id,
                name: item.name,
                price: item.price,
                restaurant_id: restaurantId
              })}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
      {items.length === 0 && <p>This menu is currently empty.</p>}
    </div>
  );
};

export default RestaurantMenu;
