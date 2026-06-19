import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Star } from 'lucide-react';

interface RatingFormProps {
  orderId: string;
  deliveryBoyId: string;
  onSubmitted: () => void;
}

const RatingForm = ({ orderId, deliveryBoyId, onSubmitted }: RatingFormProps) => {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Fetch current deliveryBoy stats
    const { data: deliveryBoyData } = await supabase
      .from('riders')
      .select('rating, total_deliveries')
      .eq('id', deliveryBoyId)
      .single();

    if (deliveryBoyData) {
      // Calculate the new moving average rating
      // total_deliveries already includes this delivery (updated in DeliveryManager)
      const currentRating = deliveryBoyData.rating || 5.0;
      const total = deliveryBoyData.total_deliveries || 1;
      
      // Moving average formula:
      const newAverage = ((currentRating * (total - 1)) + rating) / total;

      // 2. Update the deliveryBoy's average rating
      await supabase
        .from('riders')
        .update({ rating: newAverage })
        .eq('id', deliveryBoyId);
    }

    // 3. Mark the order as rated to prevent duplicate ratings
    await supabase
      .from('orders')
      .update({ is_rated: true })
      .eq('id', orderId);

    setLoading(false);
    onSubmitted();
  };

  return (
    <div style={{ backgroundColor: '#fdfbf7', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a', marginTop: '16px', textAlign: 'center' }}>
      <h3 style={{ marginBottom: '8px' }}>Rate your Delivery</h3>
      <p className="text-muted" style={{ marginBottom: '16px' }}>How was your deliveryBoy?</p>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(rating)}
            >
              <Star
                size={32}
                fill={(hover || rating) >= star ? '#f59e0b' : 'transparent'}
                color={(hover || rating) >= star ? '#f59e0b' : 'var(--border-color)'}
                style={{ transition: 'all 0.2s' }}
              />
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Leave a comment (optional)..."
          rows={3}
          style={{ width: '100%', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', marginBottom: '16px', outline: 'none' }}
        />

        <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ backgroundColor: '#f59e0b', border: 'none' }}>
          {loading ? 'Submitting...' : 'Submit Rating'}
        </button>
      </form>
    </div>
  );
};

export default RatingForm;
