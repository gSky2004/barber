import { useState, useEffect } from 'react';
import api from '../../api/client';
import { formatDate, formatTZS } from '../../utils/format';

const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const load = () => api.get('/orders').then(setOrders).catch(() => {});

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/orders/${id}`, { status });
    load();
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Orders</h1>
      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="card">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-semibold">{o.name} — {o.phone}</p>
                <p className="text-muted text-sm capitalize">{o.order_type} · {o.delivery_preference} · {formatDate(o.created_at)}</p>
                <p className="text-xs mt-1">
                  Payment:{' '}
                  <span className={o.payment_status === 'paid' ? 'text-green-400' : 'text-yellow-400'}>
                    {o.payment_status || 'unpaid'}
                  </span>
                  {o.payment_ref ? ` · ${o.payment_ref}` : ''}
                  {o.payment_method ? ` · ${o.payment_method}` : ''}
                </p>
              </div>
              <select
                className="input py-1 text-xs w-auto"
                value={o.status}
                onChange={(e) => updateStatus(o.id, e.target.value)}
              >
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {o.order_type === 'repair' && o.issue_description && (
              <p className="text-sm text-muted mt-2">{o.issue_description}</p>
            )}
            {o.items && o.items.length > 0 && (
              <ul className="text-sm mt-2 text-muted">
                {o.items.map((item, i) => (
                  <li key={i}>{item.name} × {item.quantity}</li>
                ))}
              </ul>
            )}
            {o.total > 0 && <p className="text-primary text-sm mt-2">{formatTZS(o.total)}</p>}
          </div>
        ))}
        {orders.length === 0 && <p className="text-muted text-center py-8">No orders yet.</p>}
      </div>
    </div>
  );
}
