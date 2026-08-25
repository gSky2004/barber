import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/client';
import { formatTZS } from '../utils/format';
import BrandMark from '../components/BrandMark';

export default function Receipt() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api
      .get(`/payments/receipt/${orderId}`)
      .then((data) => {
        if (alive) setOrder(data.order);
      })
      .catch((err) => {
        if (alive) setError(err.message || 'Receipt not found');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [orderId]);

  const printReceipt = () => window.print();

  const openHtmlReceipt = async () => {
    try {
      const token = localStorage.getItem('customerToken');
      const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${base}/payments/receipt/${orderId}?format=html`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
      });
      const html = await res.text();
      if (!res.ok) throw new Error('Could not load printable receipt');
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="section pt-32 text-center text-muted">Loading receipt…</div>;
  }

  if (error || !order) {
    return (
      <div className="section pt-32 max-w-lg mx-auto text-center">
        <h1 className="font-display text-2xl font-bold">Receipt unavailable</h1>
        <p className="text-muted mt-3">{error || 'Order not found'}</p>
        <Link to="/#shop" className="btn btn-primary mt-6 inline-flex">Back to Shop</Link>
      </div>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="section pt-28 pb-20 max-w-2xl mx-auto">
      <motion.div
        className="card print:shadow-none print:border-0"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
          <div>
            <BrandMark size="lg" />
            <p className="text-muted text-sm mt-2">Official payment receipt · Mbeya, Tanzania</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-green-400 font-semibold">Paid</p>
            <p className="font-display text-xl font-bold mt-1">#{order.id}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 text-sm mt-5">
          <div>
            <p className="text-muted">Customer</p>
            <p className="font-semibold">{order.name}</p>
          </div>
          <div>
            <p className="text-muted">Phone</p>
            <p className="font-semibold">{order.phone || '—'}</p>
          </div>
          <div>
            <p className="text-muted">Payment ref</p>
            <p className="font-semibold break-all">{order.payment_ref || '—'}</p>
          </div>
          <div>
            <p className="text-muted">Method</p>
            <p className="font-semibold capitalize">{order.payment_method || '—'}</p>
          </div>
          <div>
            <p className="text-muted">Delivery</p>
            <p className="font-semibold capitalize">{order.delivery_preference || 'pickup'}</p>
          </div>
          <div>
            <p className="text-muted">Date</p>
            <p className="font-semibold">
              {order.created_at ? new Date(order.created_at).toLocaleString() : '—'}
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted border-b border-border">
                <th className="text-left py-2 font-medium">Item</th>
                <th className="text-center py-2 font-medium">Qty</th>
                <th className="text-right py-2 font-medium">Price</th>
                <th className="text-right py-2 font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b border-border/60">
                  <td className="py-3">{item.name}</td>
                  <td className="py-3 text-center">{item.quantity}</td>
                  <td className="py-3 text-right">{formatTZS(item.price)}</td>
                  <td className="py-3 text-right">{formatTZS(Number(item.price) * Number(item.quantity))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
          <span className="font-semibold">Total paid</span>
          <span className="text-primary font-bold text-2xl">{formatTZS(order.total)}</span>
        </div>

        <div className="flex flex-wrap gap-2 mt-8 print:hidden">
          <button type="button" className="btn btn-primary" onClick={printReceipt}>
            Print receipt
          </button>
          <button type="button" className="btn btn-secondary" onClick={openHtmlReceipt}>
            Open printable page
          </button>
          <Link to="/#shop" className="btn btn-secondary">
            Back to shop
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
