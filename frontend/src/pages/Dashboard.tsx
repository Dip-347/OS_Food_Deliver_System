import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Customer Components
import RestaurantList from '../components/customer/RestaurantList';
import RestaurantMenu from '../components/customer/RestaurantMenu';
import Checkout from '../components/customer/Checkout';
import OrderTracking from '../components/customer/OrderTracking';
import CartSidebar from '../components/customer/CartSidebar';

// Restaurant Components
import RestaurantApplication from '../components/restaurant/RestaurantApplication';
import MenuManager from '../components/restaurant/MenuManager';
import OrderManager from '../components/restaurant/OrderManager';

// DeliveryBoy Components
import DeliveryBoyApplication from '../components/deliveryBoy/DeliveryBoyApplication';
import DeliveryBoyDashboard from '../components/deliveryBoy/DeliveryBoyDashboard';
import HistoryPage from '../components/deliveryBoy/HistoryPage';

const Dashboard = () => {
  const { user, profile, signOut } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  
  // State for Customer ordering flow
  const [selectedRestaurant, setSelectedRestaurant] = useState<{id: string, name: string} | null>(null);
  const [isCheckout, setIsCheckout] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // State for Restaurant flow
  const [myRestaurantId, setMyRestaurantId] = useState<string | null>(null);
  const [checkingRestaurant, setCheckingRestaurant] = useState(true);

  // State for DeliveryBoy flow
  const [myDeliveryBoyId, setMyDeliveryBoyId] = useState<string | null>(null);
  const [checkingDeliveryBoy, setCheckingDeliveryBoy] = useState(true);

  // State for notification badge
  const [activeOrderCount, setActiveOrderCount] = useState(0);

  useEffect(() => {
    if (profile?.role === 'restaurant' && user) {
      const checkRestaurant = async () => {
        const { data } = await supabase
          .from('restaurants')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (data) setMyRestaurantId(data.id);
        setCheckingRestaurant(false);
      };
      checkRestaurant();
    } else {
      setCheckingRestaurant(false);
    }

    if (profile?.role === 'deliveryBoy' && user) {
      const checkDeliveryBoy = async () => {
        const { data } = await supabase.from('riders').select('id').eq('user_id', user.id).single();
        if (data) setMyDeliveryBoyId(data.id);
        setCheckingDeliveryBoy(false);
      };
      checkDeliveryBoy();
    } else {
      setCheckingDeliveryBoy(false);
    }
  }, [profile, user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  useEffect(() => {
    if (!myRestaurantId) return;

    const fetchActiveCount = async () => {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', myRestaurantId)
        .in('status', ['pending_restaurant', 'preparing']);

      setActiveOrderCount(count || 0);
    };

    fetchActiveCount();

    const subscription = supabase
      .channel('dashboard-restaurant-orders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `restaurant_id=eq.${myRestaurantId}`
      }, () => {
        fetchActiveCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [myRestaurantId]);

  const handleRestaurantSelect = (id: string, name: string) => {
    setSelectedRestaurant({ id, name });
  };

  const renderCustomerContent = () => {
    if (activeTab === 'overview') {
      return (
        <div className="dashboard-widgets">
          <div className="widget" onClick={() => setActiveTab('order_food')} style={{ cursor: 'pointer' }}>
            <h3>Hungry?</h3>
            <p className="text-muted">Browse restaurants and order food now. Click here to get started.</p>
          </div>
          <div className="widget" onClick={() => setActiveTab('my_orders')} style={{ cursor: 'pointer' }}>
            <h3>Recent Activity</h3>
            <p className="text-muted">Track your current orders and view history.</p>
          </div>
        </div>
      );
    }

    if (activeTab === 'order_food') {
      if (isCheckout) {
        return <Checkout onBack={() => setIsCheckout(false)} onComplete={() => { setIsCheckout(false); setActiveTab('my_orders'); }} />;
      }
      if (selectedRestaurant) {
        return <RestaurantMenu 
          restaurantId={selectedRestaurant.id} 
          restaurantName={selectedRestaurant.name} 
          onBack={() => setSelectedRestaurant(null)} 
        />;
      }
      return <RestaurantList onSelect={handleRestaurantSelect} />;
    }

    if (activeTab === 'my_orders') {
      return <OrderTracking />;
    }

    return <div>Content for {activeTab} is not implemented yet.</div>;
  };

  const renderRestaurantContent = () => {
    if (checkingRestaurant) return <div>Checking restaurant status...</div>;

    if (!myRestaurantId) {
      return <RestaurantApplication onApproved={() => window.location.reload()} />;
    }

    if (activeTab === 'overview') {
      return (
        <div className="dashboard-widgets">
          <div className="widget" onClick={() => setActiveTab('active_orders')} style={{ cursor: 'pointer', position: 'relative' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 8px 0' }}>
              Active Orders
              {activeOrderCount > 0 && (
                <span style={{
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  {activeOrderCount}
                </span>
              )}
            </h3>
            <p className="text-muted" style={{ margin: 0 }}>View and manage incoming orders.</p>
          </div>
          <div className="widget" onClick={() => setActiveTab('manage_menu')} style={{ cursor: 'pointer' }}>
            <h3>Menu Management</h3>
            <p className="text-muted">Add or edit your menu items.</p>
          </div>
        </div>
      );
    }

    if (activeTab === 'manage_menu') {
      return <MenuManager restaurantId={myRestaurantId} />;
    }

    if (activeTab === 'active_orders') {
      return <OrderManager restaurantId={myRestaurantId} />;
    }

    return <div>Content for {activeTab} is not implemented yet.</div>;
  };

  const renderDeliveryBoyContent = () => {
    if (checkingDeliveryBoy) return <div>Checking deliveryBoy status...</div>;

    if (!myDeliveryBoyId) {
      return <DeliveryBoyApplication onApplied={() => window.location.reload()} />;
    }

    if (activeTab === 'overview' || activeTab === 'delivery_tasks') {
      return <DeliveryBoyDashboard deliveryBoyId={myDeliveryBoyId} />;
    }

    if (activeTab === 'history') {
      return <HistoryPage deliveryBoyId={myDeliveryBoyId} />;
    }

    return <div>Content for {activeTab} is not implemented yet.</div>;
  };

  return (
    <div className="page-container dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3>Foodloop</h3>
          <span className="role-badge">{profile?.role || 'customer'}</span>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>Overview</li>
            
            {profile?.role === 'customer' && (
              <>
                <li className={activeTab === 'order_food' ? 'active' : ''} onClick={() => { setActiveTab('order_food'); setIsCheckout(false); setSelectedRestaurant(null); }}>
                  Order Food
                </li>
                <li className={activeTab === 'my_orders' ? 'active' : ''} onClick={() => setActiveTab('my_orders')}>
                  My Orders
                </li>
                <li>Apply for DeliveryBoy</li>
                <li>Add Restaurant</li>
              </>
            )}
            
            {profile?.role === 'restaurant' && myRestaurantId && (
              <>
                <li className={activeTab === 'manage_menu' ? 'active' : ''} onClick={() => setActiveTab('manage_menu')}>Manage Menu</li>
                <li className={activeTab === 'active_orders' ? 'active' : ''} onClick={() => setActiveTab('active_orders')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Active Orders
                  {activeOrderCount > 0 && (
                    <span style={{
                      background: '#ef4444',
                      color: 'white',
                      borderRadius: '12px',
                      padding: '2px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {activeOrderCount}
                    </span>
                  )}
                </li>
                <li>Analytics</li>
              </>
            )}
            
            {profile?.role === 'deliveryBoy' && (
              <>
                {myDeliveryBoyId ? (
                  <>
                    <li className={activeTab === 'delivery_tasks' ? 'active' : ''} onClick={() => setActiveTab('delivery_tasks')}>Delivery Tasks</li>
                    <li>Simulation View</li>
                    <li className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>History</li>
                  </>
                ) : (
                  <li className="active">Apply for DeliveryBoy</li>
                )}
              </>
            )}
            
            {profile?.role === 'admin' && (
              <>
                <li>User Management</li>
                <li>Approvals</li>
                <li>System Analytics</li>
                <li>Scheduling Engine</li>
              </>
            )}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <p className="user-email">{user?.email}</p>
          <button onClick={handleSignOut} className="btn btn-secondary btn-full">Sign Out</button>
        </div>
      </aside>

      <main className="dashboard-content">
        <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{activeTab.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
          
          {profile?.role === 'customer' && (
            <button className="btn btn-primary" onClick={() => setIsCartOpen(true)} style={{ position: 'relative' }}>
              <ShoppingCart size={20} />
              {items.length > 0 && (
                <span style={{ 
                  position: 'absolute', top: '-8px', right: '-8px', 
                  background: 'white', color: 'var(--primary)', 
                  borderRadius: '50%', width: '20px', height: '20px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: '0.75rem', fontWeight: 'bold' 
                }}>
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          )}
        </header>

        {profile?.role === 'customer' && renderCustomerContent()}
        {profile?.role === 'restaurant' && renderRestaurantContent()}
        {profile?.role === 'deliveryBoy' && renderDeliveryBoyContent()}
        {(profile?.role !== 'customer' && profile?.role !== 'restaurant' && profile?.role !== 'deliveryBoy') && (
          <div className="widget">
            <h3>Role specific features coming soon...</h3>
          </div>
        )}
      </main>

      {/* Shopping Cart Sidebar */}
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        onCheckout={() => { setIsCartOpen(false); setActiveTab('order_food'); setIsCheckout(true); }}
      />
    </div>
  );
};

export default Dashboard;
