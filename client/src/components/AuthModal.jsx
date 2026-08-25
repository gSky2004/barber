import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BrandMark from './BrandMark';
import { useCustomerAuth } from '../context/CustomerAuthContext';

export default function AuthModal() {
  const {
    authOpen,
    authMode,
    authMessage,
    setAuthMode,
    closeAuth,
    login,
    register,
  } = useCustomerAuth();

  const emptyForm = { full_name: '', email: '', phone: '', password: '' };
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authOpen) {
      setForm(emptyForm);
      setError('');
      setSuccess('');
      setLoading(false);
    }
  }, [authOpen]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleClose = () => {
    setForm(emptyForm);
    setError('');
    setSuccess('');
    closeAuth();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (authMode === 'login') {
        await login(form.email, form.password);
        setForm(emptyForm);
      } else {
        const data = await register(form);
        setForm(emptyForm);
        setSuccess(data.message || 'Registration successful! Please log in to continue.');
        setTimeout(() => {
          setAuthMode('login');
          setSuccess('Account created successfully. Log in to continue shopping.');
          setForm(emptyForm);
        }, 1200);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    setForm(emptyForm);
    setError('');
    setSuccess('');
  };

  return (
    <AnimatePresence>
      {authOpen && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="card w-full max-w-md relative overflow-hidden"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/15 pointer-events-none" />
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 text-muted hover:text-text text-2xl leading-none z-10"
              aria-label="Close"
            >
              ×
            </button>

            <div className="relative">
              <BrandMark size="sm" className="block mb-3" />
              <h2 className="font-display text-2xl font-bold mt-2">
                {authMode === 'login' ? 'Welcome back' : 'Join Milestone'}
              </h2>
              <p className="text-muted text-sm mt-2">
                {authMessage ||
                  (authMode === 'login'
                    ? 'Log in to shop, add to cart, and place orders.'
                    : 'Create your free account to shop phones, accessories, gaming sessions & more.')}
              </p>

              <div className="flex gap-2 mt-5 mb-6">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`flex-1 py-2 rounded-full text-sm transition-colors ${
                    authMode === 'login' ? 'bg-primary text-black font-semibold' : 'bg-white/10 text-muted'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className={`flex-1 py-2 rounded-full text-sm transition-colors ${
                    authMode === 'register' ? 'bg-primary text-black font-semibold' : 'bg-white/10 text-muted'
                  }`}
                >
                  Register
                </button>
              </div>

              {success && (
                <div className="mb-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                {authMode === 'register' && (
                  <>
                    <div>
                      <label className="label" htmlFor="auth-name">Full Name</label>
                      <input
                        className="input"
                        id="auth-name"
                        name="full_name"
                        value={form.full_name}
                        onChange={handleChange}
                        required
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor="auth-phone">Phone</label>
                      <input
                        className="input"
                        id="auth-phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+255 7XX XXX XXX"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="label" htmlFor="auth-email">Email</label>
                  <input
                    className="input"
                    id="auth-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@email.com"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="auth-password">Password</label>
                  <input
                    className="input"
                    id="auth-password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    placeholder={authMode === 'register' ? 'At least 6 characters' : 'Your password'}
                  />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                  {loading
                    ? 'Please wait...'
                    : authMode === 'login'
                      ? 'Log In'
                      : 'Create Account'}
                </button>
              </form>

              <p className="text-muted text-xs text-center mt-5">
                Browse freely. Account needed only to buy or add to cart.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
