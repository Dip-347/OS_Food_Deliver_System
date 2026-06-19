import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AdminAnalytics from '../components/admin/AdminAnalytics';
import RestaurantApproval from '../components/admin/RestaurantApproval';
import RiderApproval from '../components/admin/RiderApproval';
import OrderMonitoring from '../components/admin/OrderMonitoring';

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Protect this route
  useEffect(() => {
    if (user && user.email !== 'admin1@gmail.com') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const renderContent = () => {
    if (activeTab === 'overview') {
      return (
        <div className="dashboard-widgets">
          <div className="widget" onClick={() => setActiveTab('order_monitoring')} style={{ cursor: 'pointer' }}>
            <h3>Order Monitoring</h3>
            <p className="text-muted">Live view of all active orders in the system.</p>
          </div>
          <div className="widget" onClick={() => setActiveTab('analytics')} style={{ cursor: 'pointer' }}>
            <h3>System Analytics</h3>
            <p className="text-muted">Revenue and performance charts.</p>
          </div>
          <div className="widget" onClick={() => setActiveTab('restaurant_approval')} style={{ cursor: 'pointer' }}>
            <h3>Restaurant Approval</h3>
            <p className="text-muted">Manage new restaurant applications.</p>
          </div>
          <div className="widget" onClick={() => setActiveTab('rider_approval')} style={{ cursor: 'pointer' }}>
            <h3>Rider Approval</h3>
            <p className="text-muted">Manage new rider applications.</p>
          </div>
        </div>
      );
    }

    if (activeTab === 'analytics') return <AdminAnalytics />;
    if (activeTab === 'restaurant_approval') return <RestaurantApproval />;
    if (activeTab === 'rider_approval') return <RiderApproval />;
    if (activeTab === 'order_monitoring') return <OrderMonitoring />;

    return <div>Content for {activeTab} is coming soon.</div>;
  };

  if (!user || user.email !== 'admin1@gmail.com') return null;

  return (
    <div className="page-container dashboard-layout">
      <aside className="sidebar" style={{ backgroundColor: '#1e293b', color: 'white' }}>
        <div className="sidebar-header">
          <h3 style={{ color: 'white' }}>Foodloop Admin</h3>
          <span className="role-badge" style={{ backgroundColor: '#ff4b2b', color: 'white' }}>Superadmin</span>
        </div>
        <nav className="sidebar-nav">
          <ul style={{ color: '#cbd5e1' }}>
            <li className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')} style={{ color: activeTab === 'overview' ? 'white' : 'inherit' }}>Overview</li>
            <li className={activeTab === 'user_management' ? 'active' : ''} onClick={() => setActiveTab('user_management')} style={{ color: activeTab === 'user_management' ? 'white' : 'inherit' }}>User Management</li>
            <li className={activeTab === 'restaurant_approval' ? 'active' : ''} onClick={() => setActiveTab('restaurant_approval')} style={{ color: activeTab === 'restaurant_approval' ? 'white' : 'inherit' }}>Restaurant Approval</li>
            <li className={activeTab === 'rider_approval' ? 'active' : ''} onClick={() => setActiveTab('rider_approval')} style={{ color: activeTab === 'rider_approval' ? 'white' : 'inherit' }}>Rider Approval</li>
            <li className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')} style={{ color: activeTab === 'analytics' ? 'white' : 'inherit' }}>Analytics</li>
            <li className={activeTab === 'order_monitoring' ? 'active' : ''} onClick={() => setActiveTab('order_monitoring')} style={{ color: activeTab === 'order_monitoring' ? 'white' : 'inherit' }}>Order Monitoring</li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <p className="user-email" style={{ color: '#94a3b8' }}>{user.email}</p>
          <button onClick={handleSignOut} className="btn" style={{ width: '100%', backgroundColor: '#ef4444', color: 'white', border: 'none' }}>Sign Out</button>
        </div>
      </aside>

      <main className="dashboard-content" style={{ backgroundColor: '#f8fafc' }}>
        <header className="dashboard-header">
          <h2 style={{ color: '#0f172a' }}>{activeTab.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
        </header>

        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
