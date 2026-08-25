import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { useCart } from '../context/CartContext';

export default function PayCallback() {
  const { sessionId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    const stripeSessionId = params.get('session_id');

    if (!stripeSessionId) {
      setError('Missing Stripe session. Return to checkout and try again.');
      return undefined;
    }

    api
      .get(`/payments/${sessionId}/stripe/verify?session_id=${encodeURIComponent(stripeSessionId)}`)
      .then(async (data) => {
        if (!alive) return;
        await refreshCart();
        navigate(data.receipt_path || `/receipt/${data.order_id}`, { replace: true });
      })
      .catch((err) => {
        if (alive) setError(err.message || 'Could not verify payment');
      });

    return () => {
      alive = false;
    };
  }, [sessionId, params, navigate, refreshCart]);

  return (
    <div className="section pt-32 max-w-md mx-auto text-center">
      {error ? (
        <>
          <h1 className="font-display text-2xl font-bold text-red-400">Payment issue</h1>
          <p className="text-muted mt-3">{error}</p>
          <button
            type="button"
            className="btn btn-primary mt-6"
            onClick={() => navigate(`/pay/${sessionId}`)}
          >
            Back to checkout
          </button>
        </>
      ) : (
        <>
          <h1 className="font-display text-2xl font-bold">Confirming Stripe payment…</h1>
          <p className="text-muted mt-3">
            Please wait while we verify your card payment and prepare your receipt.
          </p>
        </>
      )}
    </div>
  );
}
