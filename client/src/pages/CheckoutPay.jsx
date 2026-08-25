import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';
import { formatTZS } from '../utils/format';
import { useCart } from '../context/CartContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';

function formatCardInput(value) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

const MOBILE_PROVIDERS = [
  { id: 'mpesa', label: 'M-Pesa (Vodacom)', prefix: '07', color: '#e31837', icon: '📱' },
  { id: 'airtel', label: 'Airtel Money', prefix: '07', color: '#ed1c24', icon: '📱' },
  { id: 'halotel', label: 'Halotel (HaloPesa)', prefix: '06', color: '#00a651', icon: '📱' },
  { id: 'mixx', label: 'Mixx by Yas', prefix: '07', color: '#0057b8', icon: '📱' },
];

export default function CheckoutPay() {
  const { sessionId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const { customer } = useCustomerAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startingStripe, setStartingStripe] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  // Mobile money state
  const [payMethod, setPayMethod] = useState('mobile');
  const [mobilePhone, setMobilePhone] = useState(customer?.phone || '');
  const [mobileProvider, setMobileProvider] = useState('mpesa');
  const [mobileRef, setMobileRef] = useState(null);
  const [mobileStatus, setMobileStatus] = useState('');
  const pollRef = useRef(null);

  // Sandbox card form
  const [form, setForm] = useState({
    card_name: '',
    card_number: '',
    expiry: '',
    cvc: '',
  });

  useEffect(() => {
    if (params.get('canceled') === '1') {
      setError('Payment was canceled. You can try again when ready.');
    }
  }, [params]);

  useEffect(() => {
    let alive = true;
    api
      .get(`/payments/${sessionId}`)
      .then((data) => {
        if (!alive) return;
        setSession(data);
        if (data.status === 'paid') {
          setSuccess({
            message: 'This order is already paid.',
            payment_ref: data.payment_ref,
            order_id: data.order_id,
            receipt_path: `/receipt/${data.order_id}`,
          });
        }
        // Default to mobile if snippe is configured, else sandbox
        if (!data.snippe_configured && !data.stripe_configured) {
          setPayMethod('sandbox');
        } else if (!data.snippe_configured && data.stripe_configured) {
          setPayMethod('stripe');
        } else {
          setPayMethod('mobile');
        }
      })
      .catch((err) => {
        if (alive) setError(err.message || 'Could not load payment');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [sessionId]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const goReceipt = (path, orderId) => {
    navigate(path || `/receipt/${orderId}`);
  };

  // ── Stripe ──
  const handleStripePay = async () => {
    setStartingStripe(true);
    setError('');
    try {
      const data = await api.post(`/payments/${sessionId}/stripe/init`, {
        email: customer?.email,
      });
      if (data.already_paid) {
        navigate(data.path);
        return;
      }
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }
      setError('Could not start Stripe checkout');
    } catch (err) {
      setError(err.message);
    } finally {
      setStartingStripe(false);
    }
  };

  // ── Mobile Money ──
  const handleMobilePay = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMobileStatus('initiating');

    try {
      const data = await api.post(`/payments/${sessionId}/mobile`, {
        phone: mobilePhone.trim(),
      });

      if (data.already_paid) {
        navigate(data.path);
        return;
      }

      if (data.reference) {
        setMobileRef(data.reference);
        setMobileStatus('waiting');
        startPolling(data.reference);
      } else {
        setError('Could not start mobile payment');
        setMobileStatus('');
      }
    } catch (err) {
      setError(err.message);
      setMobileStatus('');
    } finally {
      setSubmitting(false);
    }
  };

  const startPolling = useCallback(
    (ref) => {
      if (pollRef.current) clearInterval(pollRef.current);
      let attempts = 0;
      const maxAttempts = 45;

      pollRef.current = setInterval(async () => {
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(pollRef.current);
          setMobileStatus('expired');
          setError('Payment timed out. Please try again.');
          return;
        }

        try {
          const data = await api.get(`/payments/${sessionId}`);
          if (data.status === 'paid') {
            clearInterval(pollRef.current);
            setMobileStatus('completed');
            setSuccess({
              message: 'Payment confirmed!',
              payment_ref: data.payment_ref,
              order_id: data.order_id,
              receipt_path: `/receipt/${data.order_id}`,
            });
            await refreshCart();
          } else if (data.status === 'failed' || data.status === 'expired') {
            clearInterval(pollRef.current);
            setMobileStatus(data.status);
            setError(`Payment ${data.status}. Please try again.`);
          }
        } catch {
          // ignore poll errors
        }
      }, 4000);
    },
    [sessionId, refreshCart]
  );

  // ── Sandbox Card ──
  const handleSandboxSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const data = await api.post(`/payments/${sessionId}/confirm`, form);
      setSuccess(data);
      await refreshCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="section pt-32 text-center text-muted">
        Loading checkout…
      </div>
    );
  }

  if (!session && error) {
    return (
      <div className="section pt-32 max-w-lg mx-auto text-center">
        <h1 className="font-display text-2xl font-bold">Payment not found</h1>
        <p className="text-muted mt-3">{error}</p>
        <Link to="/#shop" className="btn btn-primary mt-6 inline-flex">Back to Shop</Link>
      </div>
    );
  }

  const isStripe = session?.mode === 'stripe' || session?.stripe_configured;
  const isSnippe = session?.snippe_configured;
  const isSandbox = session?.mode === 'sandbox' && !isSnippe && !isStripe;
  const showMethodPicker = (isSnippe || isStripe) && !success;

  return (
    <div className="section pt-28 pb-20 max-w-lg mx-auto">
      <motion.div
        className="card overflow-hidden p-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-gradient-to-r from-primary/20 to-accent/20 px-6 py-5 border-b border-border">
          <p className="eyebrow">Secure Checkout</p>
          <h1 className="font-display text-2xl font-bold mt-1">Complete your payment</h1>
          <p className="text-muted text-sm mt-2">
            {isSnippe && isStripe
              ? 'Pay with mobile money (M-Pesa, Airtel, Halotel, Mixx) or card.'
              : isSnippe
                ? 'Pay with mobile money — M-Pesa, Airtel, Halotel, or Mixx by Yas.'
                : isStripe
                  ? 'Pay securely with Stripe (card). You will get a receipt after payment.'
                  : 'Sandbox mode — add payment keys in server/.env to take real payments.'}
          </p>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex justify-between items-end gap-3">
            <div>
              <p className="text-muted text-sm">Amount due</p>
              <p className="text-primary font-bold text-3xl">{formatTZS(session?.amount || 0)}</p>
              {session?.charge_hint && (
                <p className="text-xs text-muted mt-1">{session.charge_hint}</p>
              )}
            </div>
            <span className="text-xs uppercase tracking-wider px-2 py-1 rounded-full bg-primary/15 text-primary border border-primary/30 shrink-0">
              {session?.mode || 'sandbox'}
            </span>
          </div>

          {session?.items?.length > 0 && (
            <ul className="text-sm space-y-1 text-muted border border-border rounded-xl p-3">
              {session.items.map((item, i) => (
                <li key={i} className="flex justify-between gap-3">
                  <span className="truncate">{item.name} × {item.quantity}</span>
                  <span className="shrink-0">{formatTZS(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
          )}

          {success ? (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-5 text-center space-y-3">
              <p className="text-green-400 font-semibold text-lg">Payment successful</p>
              <p className="text-sm text-muted">{success.message}</p>
              {success.payment_ref && (
                <p className="text-xs text-muted">Ref: {success.payment_ref}</p>
              )}
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => goReceipt(success.receipt_path, success.order_id)}
                >
                  View receipt
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/#shop')}>
                  Continue shopping
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Method Picker */}
              {showMethodPicker && (
                <div className="flex gap-2">
                  {isSnippe && (
                    <button
                      type="button"
                      onClick={() => { setPayMethod('mobile'); setError(''); }}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all border ${
                        payMethod === 'mobile'
                          ? 'bg-primary/15 border-primary text-primary'
                          : 'bg-white/5 border-border text-muted hover:text-text'
                      }`}
                    >
                      📱 Mobile Money
                    </button>
                  )}
                  {isStripe && (
                    <button
                      type="button"
                      onClick={() => { setPayMethod('stripe'); setError(''); }}
                      className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all border ${
                        payMethod === 'stripe'
                          ? 'bg-primary/15 border-primary text-primary'
                          : 'bg-white/5 border-border text-muted hover:text-text'
                      }`}
                    >
                      💳 Card (Stripe)
                    </button>
                  )}
                </div>
              )}

              {/* ── Mobile Money Form ── */}
              {payMethod === 'mobile' && isSnippe && !mobileRef && (
                <form onSubmit={handleMobilePay} className="space-y-4">
                  <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-xs text-muted space-y-1">
                    <p className="font-semibold text-text">Pay with Mobile Money</p>
                    <p>You will receive a USSD prompt on your phone. Enter your PIN to confirm.</p>
                  </div>

                  {/* Provider selector */}
                  <div>
                    <label className="label">Select Provider</label>
                    <div className="grid grid-cols-2 gap-2">
                      {MOBILE_PROVIDERS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setMobileProvider(p.id)}
                          className={`py-3 px-3 rounded-xl text-sm font-medium transition-all border text-left ${
                            mobileProvider === p.id
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-white/5 text-muted hover:text-text'
                          }`}
                        >
                          <span className="mr-1">{p.icon}</span> {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Phone number */}
                  <div>
                    <label className="label" htmlFor="mobile-phone">Phone Number</label>
                    <input
                      id="mobile-phone"
                      type="tel"
                      className="input"
                      placeholder="0712 345 678"
                      value={mobilePhone}
                      onChange={(e) => setMobilePhone(e.target.value)}
                      required
                      pattern="[0-9\s\+\-]{9,15}"
                    />
                    <p className="text-[11px] text-muted mt-1">
                      Enter the phone number registered with {MOBILE_PROVIDERS.find((p) => p.id === mobileProvider)?.label}
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={submitting || !mobilePhone.trim()}
                  >
                    {submitting ? 'Sending USSD prompt…' : `Pay ${formatTZS(session?.amount || 0)}`}
                  </button>
                </form>
              )}

              {/* ── Mobile Money Waiting State ── */}
              {payMethod === 'mobile' && mobileRef && mobileStatus !== 'completed' && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-center space-y-3">
                    {mobileStatus === 'waiting' || mobileStatus === 'initiating' ? (
                      <>
                        <div className="flex justify-center">
                          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                        <p className="text-primary font-semibold">Check your phone</p>
                        <p className="text-sm text-muted">
                          A USSD prompt has been sent to <strong>{mobilePhone}</strong>.
                          Enter your PIN to complete the payment.
                        </p>
                        <p className="text-xs text-muted">
                          Ref: {mobileRef}
                        </p>
                      </>
                    ) : mobileStatus === 'expired' ? (
                      <>
                        <p className="text-yellow-400 font-semibold">Payment expired</p>
                        <p className="text-sm text-muted">The USSD prompt timed out.</p>
                        <button
                          type="button"
                          className="btn btn-secondary mt-2"
                          onClick={() => { setMobileRef(null); setMobileStatus(''); setError(''); }}
                        >
                          Try again
                        </button>
                      </>
                    ) : mobileStatus === 'failed' ? (
                      <>
                        <p className="text-red-400 font-semibold">Payment failed</p>
                        <p className="text-sm text-muted">The payment was not completed.</p>
                        <button
                          type="button"
                          className="btn btn-secondary mt-2"
                          onClick={() => { setMobileRef(null); setMobileStatus(''); setError(''); }}
                        >
                          Try again
                        </button>
                      </>
                    ) : null}
                  </div>

                  {mobileStatus === 'waiting' && (
                    <button
                      type="button"
                      className="btn btn-secondary w-full text-sm"
                      onClick={() => { setMobileRef(null); setMobileStatus(''); setError(''); }}
                    >
                      Cancel and choose another method
                    </button>
                  )}
                </div>
              )}

              {/* ── Stripe ── */}
              {payMethod === 'stripe' && (
                <>
                  <button
                    type="button"
                    className="btn btn-primary w-full"
                    disabled={startingStripe}
                    onClick={handleStripePay}
                  >
                    {startingStripe ? 'Opening Stripe…' : `Pay with Stripe`}
                  </button>
                  <p className="text-[11px] text-muted text-center">
                    Test mode card: 4242 4242 4242 4242 · any future expiry · any CVC
                  </p>
                </>
              )}

              {/* ── Sandbox Card ── */}
              {payMethod === 'sandbox' && (
                <form onSubmit={handleSandboxSubmit} className="space-y-4">
                  <div className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-xs text-muted space-y-1">
                    <p className="font-semibold text-text">Local sandbox (no payment keys yet)</p>
                    <p>Success: <span className="text-primary">4242 4242 4242 4242</span></p>
                    <p>Decline: <span className="text-red-300">4000 0000 0000 0002</span></p>
                  </div>

                  <div>
                    <label className="label" htmlFor="card_name">Name on card</label>
                    <input
                      id="card_name"
                      className="input"
                      value={form.card_name}
                      onChange={(e) => setForm({ ...form, card_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="card_number">Card number</label>
                    <input
                      id="card_number"
                      className="input font-mono tracking-wider"
                      value={form.card_number}
                      onChange={(e) => setForm({ ...form, card_number: formatCardInput(e.target.value) })}
                      required
                      inputMode="numeric"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label" htmlFor="expiry">Expiry</label>
                      <input
                        id="expiry"
                        className="input"
                        value={form.expiry}
                        onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                        placeholder="12/28"
                        required
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor="cvc">CVC</label>
                      <input
                        id="cvc"
                        className="input"
                        value={form.cvc}
                        onChange={(e) => setForm({ ...form, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        required
                        inputMode="numeric"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-secondary w-full" disabled={submitting}>
                    {submitting ? 'Processing…' : `Pay ${formatTZS(session?.amount || 0)} (Sandbox)`}
                  </button>
                </form>
              )}

              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
