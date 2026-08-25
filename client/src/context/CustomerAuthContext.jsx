import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authMessage, setAuthMessage] = useState('');

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('customerToken');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.get('/customers/me', { token });
      setCustomer(data.user);
    } catch {
      localStorage.removeItem('customerToken');
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const openAuth = (mode = 'login', message = '') => {
    setAuthMode(mode);
    setAuthMessage(message);
    setAuthOpen(true);
  };

  const closeAuth = () => {
    setAuthOpen(false);
    setAuthMessage('');
  };

  const register = async (payload) => {
    const data = await api.post('/customers/register', payload, { token: null });
    // Do not auto-login — user must log in after successful registration
    return data;
  };

  const login = async (email, password) => {
    const data = await api.post('/customers/login', { email, password }, { token: null });
    localStorage.setItem('customerToken', data.token);
    setCustomer(data.user);
    closeAuth();
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/customers/logout', {}, { token: localStorage.getItem('customerToken') });
    } catch { /* ignore */ }
    localStorage.removeItem('customerToken');
    setCustomer(null);
  };

  const requireAuth = (message = 'Create a free account or log in to continue.') => {
    if (customer) return true;
    openAuth('login', message);
    return false;
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        loading,
        isLoggedIn: !!customer,
        authOpen,
        authMode,
        authMessage,
        setAuthMode,
        openAuth,
        closeAuth,
        register,
        login,
        logout,
        requireAuth,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  return ctx;
}
