import { useState, useEffect } from 'react';
// Import path corrected: removed one '../'
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_available: boolean;
}

const MenuManager = ({ restaurantId }: { restaurantId: string }) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const fetchMenu = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMenu();
  }, [restaurantId]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategory('');
    setImageUrl('');
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (item: MenuItem) => {
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price.toString());
    setCategory(item.category);
    setImageUrl(item.image_url || '');
    setEditingId(item.id);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (!error) {
      setItems(items.filter(item => item.id !== id));
    } else {
      alert('Error deleting item: ' + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      restaurant_id: restaurantId,
      name,
      description,
      price: parseFloat(price),
      category: category || 'General',
      image_url: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
      is_available: true
    };

    if (editingId) {
      const { error } = await supabase.from('menu_items').update(payload).eq('id', editingId);
      if (!error) {
        alert('Item updated!');
        resetForm();
        fetchMenu();
      } else alert(error.message);
    } else {
      const { error } = await supabase.from('menu_items').insert(payload);
      if (!error) {
        alert('Item added!');
        resetForm();
        fetchMenu();
      } else alert(error.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Manage Menu</h2>
        {!isEditing && (
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
            <Plus size={16} /> Add New Item
          </button>
        )}
      </div>

      {isEditing && (
        <div className="soft-container" style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3>{editingId ? 'Edit Item' : 'Add New Item'}</h3>
            <button className="btn-text" onClick={resetForm}><X /></button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Name</label>
              <input required type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Price ($)</label>
              <input required type="number" step="0.01" className="form-input" value={price} onChange={e => setPrice(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Category</label>
              <input required type="text" className="form-input" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Burgers, Drinks" />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Description</label>
              <textarea required className="form-input" rows={2} value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Image URL (Optional)</label>
              <input type="url" className="form-input" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2' }}>
              {editingId ? 'Save Changes' : 'Add Item'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading menu...</p>
      ) : (
        <div className="dashboard-widgets">
          {items.map(item => (
            <div key={item.id} className="widget" style={{ display: 'flex', flexDirection: 'column' }}>
              {item.image_url && (
                <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '12px' }} />
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ margin: 0 }}>{item.name}</h3>
                <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>${item.price.toFixed(2)}</span>
              </div>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '16px', flex: 1 }}>{item.description}</p>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => handleEdit(item)}>
                  <Edit2 size={14} /> Edit
                </button>
                <button className="btn" style={{ flex: 1, backgroundColor: '#fee2e2', color: '#ef4444', border: 'none' }} onClick={() => handleDelete(item.id)}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && !isEditing && (
            <p className="text-muted" style={{ gridColumn: '1 / -1' }}>Your menu is empty. Add some items to get started!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MenuManager;