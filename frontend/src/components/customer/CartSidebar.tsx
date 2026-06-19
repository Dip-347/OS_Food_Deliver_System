import { useCart } from '../../context/CartContext';
import { ShoppingCart, X, Plus, Minus } from 'lucide-react';

const CartSidebar = ({ isOpen, onClose, onCheckout }: { isOpen: boolean, onClose: () => void, onCheckout: () => void }) => {
  const { items, updateQuantity, total } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div 
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999 
        }} 
        onClick={onClose}
      />
      <div 
        className="soft-container"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', maxWidth: '100%',
          zIndex: 1000, overflowY: 'auto', display: 'flex', flexDirection: 'column',
          borderRadius: '0', borderLeft: '1px solid var(--border-color)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <ShoppingCart /> Your Cart
          </h2>
          <button onClick={onClose} className="btn-text"><X /></button>
        </div>

        {items.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Your cart is empty.
          </div>
        ) : (
          <>
            <div style={{ flex: 1 }}>
              {items.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0' }}>{item.name}</h4>
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="btn-text" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={16} /></button>
                    <span>{item.quantity}</span>
                    <button className="btn-text" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '2px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button className="btn btn-primary btn-full btn-large" onClick={onCheckout}>
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
