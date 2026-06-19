import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'customer' | 'restaurant' | 'deliveryBoy'>('customer');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const { user, signInWithGoogle } = useAuth();

  // If already logged in, go to dashboard or admin
  if (user) {
    if (user.email === 'admin1@gmail.com') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
    return null;
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role === 'deliveryBoy' ? 'rider' : role,
            }
          }
        });
        if (error) throw error;
        alert('Registration successful! Please login.');
        setIsRegister(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        if (data.user?.email === 'admin1@gmail.com') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      let msg = err.message || 'An error occurred during authentication';
      if (typeof msg === 'object') msg = JSON.stringify(msg);
      if (msg === '{}') msg = 'Database error: the sign up trigger failed. Please check your role or database logs.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container center-content" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="auth-wrapper" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="auth-card" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h1 style={{ color: '#ff4b2b', fontSize: '2.5rem', marginBottom: '0.5rem', textAlign: 'left' }}>Foodloop</h1>
          <p style={{ color: '#6c757d', marginBottom: '2rem', textAlign: 'left' }}>
            {isRegister 
              ? 'Create your account to get started with delicious food deliveries' 
              : 'Enter your credentials to access your account.'}
          </p>

          {error && <div className="auth-error" style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem', padding: '0.5rem', backgroundColor: '#ffebe9', borderRadius: '4px' }}>{error}</div>}

          <form onSubmit={handleAuth} className="auth-form">
            {isRegister && (
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="fullName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="form-input"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #dee2e6', boxSizing: 'border-box' }}
                />
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email</label>
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

            <div className="form-group" style={{ marginBottom: '1rem', position: 'relative' }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Password</label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="form-input"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #dee2e6', boxSizing: 'border-box' }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', top: '38px', background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d' }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {isRegister && (
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Role</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={() => setRole('customer')} style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #dee2e6', backgroundColor: role === 'customer' ? '#ff4b2b' : 'white', color: role === 'customer' ? 'white' : '#495057', cursor: 'pointer' }}>user</button>
                  <button type="button" onClick={() => setRole('restaurant')} style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #dee2e6', backgroundColor: role === 'restaurant' ? '#ff4b2b' : 'white', color: role === 'restaurant' ? 'white' : '#495057', cursor: 'pointer' }}>restaurant</button>
                  <button type="button" onClick={() => setRole('deliveryBoy')} style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid #dee2e6', backgroundColor: role === 'deliveryBoy' ? '#ff4b2b' : 'white', color: role === 'deliveryBoy' ? 'white' : '#495057', cursor: 'pointer' }}>deliveryBoy</button>
                </div>
              </div>
            )}

            {!isRegister && (
              <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                <Link to="/forgot-password" style={{ color: '#007bff', textDecoration: 'none', fontSize: '0.9rem' }}>Forgot Password?</Link>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#ff4b2b', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginBottom: '1rem' }}>
              {loading ? 'Processing...' : isRegister ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <button onClick={signInWithGoogle} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'white', color: '#495057', border: '1px solid #dee2e6', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
            {isRegister ? 'Sign up with Google' : 'Sign in with Google'}
          </button>

          <div style={{ textAlign: 'center' }}>
            <span style={{ color: '#6c757d' }}>{isRegister ? 'Already have an account?' : "Don't have an account?"}</span>
            <button type="button" onClick={() => setIsRegister(!isRegister)} style={{ background: 'none', border: 'none', color: '#ff4b2b', fontWeight: 'bold', cursor: 'pointer', marginLeft: '0.5rem' }}>
              {isRegister ? 'Login here' : 'Register here'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
