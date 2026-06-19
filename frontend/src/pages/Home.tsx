import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="page-container">
      <nav className="navbar">
        <div className="logo">Foodloop</div>
        <div className="nav-links">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
          ) : (
            <Link to="/login" className="btn btn-primary">Login</Link>
          )}
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Smart Food Delivery Optimized by AI</h1>
          <p className="subtitle">
            Experience the next generation of food delivery. We use Operating System Disk Scheduling Algorithms (like SSTF, SCAN) to ensure your food arrives faster, hotter, and more efficiently.
          </p>
          <div className="hero-actions">
            <Link to="/login" className="btn btn-primary btn-large">
              Get Started <ArrowRight size={20} />
            </Link>
            <a href="#about" className="btn btn-secondary btn-large">View Pricing</a>
          </div>
          
          <div className="trust-signals">
            <span><CheckCircle2 size={16} style={{display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px'}}/> No hidden fees</span>
            <span><CheckCircle2 size={16} style={{display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px'}}/> Real-time tracking</span>
            <span><CheckCircle2 size={16} style={{display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px'}}/> Educational simulation</span>
          </div>
        </div>
        
        <div className="hero-graphic">
          <div className="simulation-preview">
            <div className="disk-head"></div>
            <div className="request-node n1"></div>
            <div className="request-node n2"></div>
            <div className="request-node n3"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
