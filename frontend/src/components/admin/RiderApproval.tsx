import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Check, X } from 'lucide-react';

const RiderApproval = () => {
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRiders = async () => {
    const { data } = await supabase
      .from('riders')
      .select('*, users(full_name, email)')
      .order('created_at', { ascending: false });
    
    if (data) setRiders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('riders')
      .update({ is_approved: !currentStatus })
      .eq('id', id);
    
    if (!error) fetchRiders();
    else alert('Failed to update status');
  };

  if (loading) return <div>Loading riders...</div>;

  return (
    <div className="widget" style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
            <th style={{ padding: '12px' }}>Rider Name</th>
            <th style={{ padding: '12px' }}>Email</th>
            <th style={{ padding: '12px' }}>Total Deliveries</th>
            <th style={{ padding: '12px' }}>Status</th>
            <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {riders.map(rider => (
            <tr key={rider.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>{rider.users?.full_name || 'N/A'}</td>
              <td style={{ padding: '12px' }}>{rider.users?.email || 'N/A'}</td>
              <td style={{ padding: '12px' }}>{rider.total_deliveries || 0}</td>
              <td style={{ padding: '12px' }}>
                <span style={{ 
                  padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold',
                  backgroundColor: rider.is_approved ? '#dcfce7' : '#fef3c7',
                  color: rider.is_approved ? '#16a34a' : '#d97706'
                }}>
                  {rider.is_approved ? 'Approved' : 'Pending'}
                </span>
              </td>
              <td style={{ padding: '12px', textAlign: 'right' }}>
                <button 
                  onClick={() => toggleApproval(rider.id, rider.is_approved)}
                  className="btn"
                  style={{ 
                    padding: '6px 12px', fontSize: '0.85rem',
                    backgroundColor: rider.is_approved ? '#ef4444' : '#16a34a', color: 'white', border: 'none'
                  }}
                >
                  {rider.is_approved ? <span style={{display: 'flex', alignItems:'center', gap:'4px'}}><X size={14}/> Revoke</span> : <span style={{display: 'flex', alignItems:'center', gap:'4px'}}><Check size={14}/> Approve</span>}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RiderApproval;
