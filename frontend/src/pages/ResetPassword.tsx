import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user has an active session for recovery
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setMessage({ type: 'error', text: 'Invalid or expired password reset link. Please try again.' });
      }
    });
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Password successfully updated! Redirecting...' });
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container center-content" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="auth-wrapper" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="auth-card" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h1 style={{ color: '#ff4b2b', fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'left' }}>Set New Password</h1>
          <p style={{ color: '#6c757d', marginBottom: '2rem', textAlign: 'left' }}>
            Please enter your new password below.
          </p>

          {message && (
            <div style={{ 
              color: message.type === 'error' ? 'red' : 'green', 
              marginBottom: '1rem', 
              fontSize: '0.9rem', 
              padding: '0.5rem', 
              backgroundColor: message.type === 'error' ? '#ffebe9' : '#e6fffa', 
              borderRadius: '4px' 
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleReset} className="auth-form">
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>New Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="form-input"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #dee2e6', boxSizing: 'border-box' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="form-input"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #dee2e6', boxSizing: 'border-box' }}
              />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#ff4b2b', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
