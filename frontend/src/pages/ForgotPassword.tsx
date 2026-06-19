import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Password reset instructions have been sent to your email.' });
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
          <h1 style={{ color: '#ff4b2b', fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'left' }}>Reset Password</h1>
          <p style={{ color: '#6c757d', marginBottom: '2rem', textAlign: 'left' }}>
            Enter your email address and we'll send you instructions to reset your password.
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
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="form-input"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #dee2e6', boxSizing: 'border-box' }}
              />
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#ff4b2b', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginBottom: '1.5rem' }}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div style={{ textAlign: 'center' }}>
            <Link to="/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
