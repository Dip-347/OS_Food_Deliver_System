import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Send, Bell } from 'lucide-react';

const NotificationBroadcaster = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState<'all' | 'customer' | 'restaurant' | 'rider'>('all');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const { error } = await supabase.from('system_notifications').insert([{
      title,
      message,
      target_role: targetRole
    }]);

    if (error) {
      setStatus({ type: 'error', text: error.message });
    } else {
      setStatus({ type: 'success', text: 'Notification broadcasted successfully!' });
      setTitle('');
      setMessage('');
    }
    
    setLoading(false);
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className="widget" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Bell size={20} color="var(--primary)" /> Broadcast Notification
      </h3>
      
      {status && (
        <div style={{ 
          padding: '12px', 
          marginBottom: '16px', 
          borderRadius: 'var(--radius-md)', 
          backgroundColor: status.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: status.type === 'success' ? '#16a34a' : '#ef4444',
          fontWeight: 'bold'
        }}>
          {status.text}
        </div>
      )}

      <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="form-group">
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Target Audience</label>
          <select 
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value as any)}
            style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
          >
            <option value="all">All Users</option>
            <option value="customer">Customers Only</option>
            <option value="restaurant">Restaurants Only</option>
            <option value="rider">Riders Only</option>
          </select>
        </div>

        <div className="form-group">
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Title</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., System Maintenance"
            required
            maxLength={50}
            style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
          />
        </div>

        <div className="form-group">
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Message</label>
          <textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter the notification message..."
            required
            rows={4}
            style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxSizing: 'border-box', resize: 'vertical' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
        >
          <Send size={18} /> {loading ? 'Sending...' : 'Send Broadcast'}
        </button>
      </form>
    </div>
  );
};

export default NotificationBroadcaster;
