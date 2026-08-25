import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { formatTZS } from '../utils/format';

export default function CartDrawer() {
  const navigate = useNavigate();
  const { items, total, count, cartOpen, setCartOpen, updateQuantity, removeItem, checkout } = useCart();
  const { customer } = useCustomerAuth();
  const [delivery, setDelivery] = useState('pickup');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleCheckout = async () => {
    setSubmitting(true);
    setStatus({ type: '', message: '' });
    try {
      const data = await checkout({
        delivery_preference: delivery,
        phone: customer?.phone,
      });
      const payPath =
        data.payment?.path ||
        (data.payment?.session_id ? `/pay/${data.payment.session_id}` : null);
      if (payPath) {
        setCartOpen(false);
        navigate(payPath);
        return;
      }
      setStatus({ type: 'success', message: data.message });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
          />
          <motion.aside
            className="fixed top-0 right-0 z-[111] h-full w-full max-w-md bg-bg border-l border-border shadow-2xl flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.28 }}
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h2 className="font-display font-bold text-xl">Your Cart</h2>
                <p className="text-muted text-sm">{count} item{count === 1 ? '' : 's'}</p>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="text-2xl text-muted hover:text-text"
                aria-label="Close cart"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <p className="text-muted text-center py-16">
                  Your cart is empty. Browse the shop and add products.
                </p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="card flex gap-3 p-3">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover bg-white shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{item.name}</p>
                      <p className="text-primary text-sm mt-0.5">{formatTZS(item.price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          className="w-7 h-7 rounded-full bg-white/10 text-sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span className="text-sm w-6 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          className="w-7 h-7 rounded-full bg-white/10 text-sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="ml-auto text-xs text-red-400"
                          onClick={() => removeItem(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-5 border-t border-border space-y-4">
                <div>
                  <label className="label" htmlFor="cart-delivery">
                    Pickup or Delivery
                  </label>
                  <select
                    id="cart-delivery"
                    className="input"
                    value={delivery}
                    onChange={(e) => setDelivery(e.target.value)}
                  >
                    <option value="pickup">Pickup at store</option>
                    <option value="delivery">Delivery (Mbeya area)</option>
                  </select>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Total</span>
                  <span className="text-primary font-bold text-xl">{formatTZS(total)}</span>
                </div>
                {status.message && (
                  <p
                    className={`text-sm ${
                      status.type === 'success' ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {status.message}
                  </p>
                )}
                <button
                  type="button"
                  className="btn btn-primary w-full"
                  disabled={submitting}
                  onClick={handleCheckout}
                >
                  {submitting ? 'Starting checkout…' : 'Pay now'}
                </button>
                <p className="text-[11px] text-muted text-center">
                  Secure checkout · card & mobile money · receipt after payment
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
