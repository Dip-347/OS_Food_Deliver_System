import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Bike } from 'lucide-react';

const DeliveryBoyApplication = ({ onApplied }: { onApplied: () => void }) => {
  const { user } = useAuth();
  const [vehicleType, setVehicleType] = useState('bicycle');
  const [licensePlate, setLicensePlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    const { error } = await supabase.from('riders').insert({
      user_id: user.id,
      vehicle_type,
      license_plate: vehicleType === 'motorcycle' || vehicleType === 'car' ? licensePlate : null,
      is_available: true,
      current_lat: 22.3569 + (Math.random() * 0.05 - 0.025), // Dummy coordinates near Chattogram
      current_lng: 91.7832 + (Math.random() * 0.05 - 0.025)
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      onApplied();
    }
  };

  return (
    <div className="center-content">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', padding: '16px', backgroundColor: 'rgba(255, 75, 43, 0.1)', borderRadius: '50%', color: 'var(--primary)', marginBottom: '16px' }}>
            <Bike size={32} />
          </div>
          <h2>Apply to ride with Foodloop</h2>
          <p className="text-muted">Set up your deliveryBoy profile. For testing purposes, you will be auto-approved immediately.</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Vehicle Type</label>
            <select 
              className="form-input" 
              value={vehicleType} 
              onChange={e => setVehicleType(e.target.value)}
              required
            >
              <option value="bicycle">Bicycle</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="car">Car</option>
              <option value="scooter">Electric Scooter</option>
            </select>
          </div>

          {(vehicleType === 'motorcycle' || vehicleType === 'car') && (
            <div className="form-group">
              <label>License Plate</label>
              <input 
                type="text" 
                className="form-input" 
                value={licensePlate} 
                onChange={e => setLicensePlate(e.target.value)}
                placeholder="e.g. ABC-1234"
                required
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '16px' }}>
            {loading ? 'Submitting...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DeliveryBoyApplication;
