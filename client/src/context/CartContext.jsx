import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useCustomerAuth } from './CustomerAuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { customer, isLoggedIn } = useCustomerAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isLoggedIn) {
      setItems([]);
      setTotal(0);
      setCount(0);
      return;
    }
    try {
      const data = await api.get('/cart');
      setItems(data.items || []);
      setTotal(Number(data.total) || 0);
      setCount(data.count || 0);
    } catch {
      setItems([]);
      setTotal(0);
      setCount(0);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart, customer?.id]);

  const addToCart = async (product, quantity = 1) => {
    if (!isLoggedIn) {
      return { ok: false, needsAuth: true };
    }
    setLoading(true);
    try {
      await api.post('/cart', { product_id: product.id, quantity });
      await refreshCart();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /** Add one item and start payment checkout immediately */
  const buyNow = async (product, options = {}) => {
    if (!isLoggedIn) {
      return { ok: false, needsAuth: true };
    }
    if (String(product.id).startsWith('feat-')) {
      return { ok: false, error: 'This item is display-only for now' };
    }
    setLoading(true);
    try {
      await api.post('/cart', { product_id: product.id, quantity: 1 });
      await refreshCart();
      const data = await api.post('/cart/checkout', {
        delivery_preference: options.delivery_preference || 'pickup',
        phone: options.phone || customer?.phone,
      });
      await refreshCart();
      const path =
        data.payment?.path ||
        (data.payment?.session_id ? `/pay/${data.payment.session_id}` : null);
      return { ok: true, path, data };
    } catch (err) {
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    await api.put(`/cart/${cartItemId}`, { quantity });
    await refreshCart();
  };

  const removeItem = async (cartItemId) => {
    await api.delete(`/cart/${cartItemId}`);
    await refreshCart();
  };

  const checkout = async (payload) => {
    const data = await api.post('/cart/checkout', payload);
    return data;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        count,
        loading,
        cartOpen,
        setCartOpen,
        addToCart,
        buyNow,
        updateQuantity,
        removeItem,
        checkout,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
