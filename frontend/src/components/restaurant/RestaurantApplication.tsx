import { useState } from 'react';
// Import paths corrected here: removed one '../'
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const RestaurantApplication = ({ onApproved }: { onApproved: () => void }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('restaurants')
        .insert({
          user_id: user.id,
          name,
          description,
          image_url: imageUrl || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=500&q=80',
          is_active: true, // Auto-approved for Phase 3 mock
          lat: 22.3569 + (Math.random() * 0.05 - 0.025), // Dummy coordinates near Chattogram
          lng: 91.7832 + (Math.random() * 0.05 - 0.025)
        });

      if (error) throw error;

      alert('Restaurant application submitted and auto-approved!');
      onApproved();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="soft-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '16px' }}>Apply to Join Foodloop</h2>
      <p className="text-muted" style={{ marginBottom: '24px' }}>
        Fill out your restaurant details to get started. For testing purposes, your application will be instantly auto-approved.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Restaurant Name</label>
          <input
            type="text"
            className="form-input"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. CPU Burgers"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            className="form-input"
            rows={3}
            required
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Briefly describe your restaurant..."
          />
        </div>

        <div className="form-group">
          <label>Image URL (Optional)</label>
          <input
            type="url"
            className="form-input"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <button type="submit" className="btn btn-primary btn-full btn-large" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit & Auto-Approve'}
        </button>
      </form>
    </div>
  );
};

export default RestaurantApplication;