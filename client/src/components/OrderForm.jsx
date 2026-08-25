import { useState, useEffect } from 'react';
import api from '../api/client';
import { formatTZS } from '../utils/format';

const DEVICE_TYPES = [
  'Smart phone',
  'Computer',
  'Music speaker',
  'Viswaswadu',
  'Torch',
  'Gamepads',
];

const emptyForm = {
  name: '',
  phone: '',
  items: '',
  quantity: '1',
  device_type: '',
  issue_description: '',
  delivery_preference: 'pickup',
};

export default function OrderForm({ prefillProduct, onClearPrefill, onTabChange }) {
  const [tab, setTab] = useState('product');
  const [form, setForm] = useState(emptyForm);
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/products')
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    if (prefillProduct) {
      setTab('product');
      onTabChange?.('product');
      setForm((f) => ({ ...f, items: prefillProduct.name }));
    }
  }, [prefillProduct, onTabChange]);

  const switchTab = (t) => {
    setTab(t);
    onTabChange?.(t);
    setStatus({ type: '', message: '' });
    setForm((f) => ({
      ...emptyForm,
      name: f.name,
      phone: f.phone,
      items: t === 'product' && prefillProduct ? prefillProduct.name : '',
    }));
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const selectedProduct = products.find((p) => p.name === form.items);
  const unitPrice = prefillProduct?.name === form.items
    ? Number(prefillProduct.price)
    : Number(selectedProduct?.price || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      if (tab === 'product') {
        if (!form.items) {
          setStatus({ type: 'error', message: 'Please select a product.' });
          setSubmitting(false);
          return;
        }

        await api.post('/orders', {
          name: form.name,
          phone: form.phone,
          order_type: 'product',
          items: [{
            name: form.items,
            quantity: parseInt(form.quantity, 10),
            price: unitPrice,
          }],
          delivery_preference: form.delivery_preference,
          total: unitPrice * parseInt(form.quantity, 10),
        });
      } else {
        if (!form.device_type) {
          setStatus({ type: 'error', message: 'Please select the type of device.' });
          setSubmitting(false);
          return;
        }

        await api.post('/orders', {
          name: form.name,
          phone: form.phone,
          order_type: 'repair',
          items: [{ name: form.device_type, quantity: 1 }],
          issue_description: `Device: ${form.device_type}. ${form.issue_description}`,
          delivery_preference: 'pickup',
          total: 0,
        });
      }

      setStatus({
        type: 'success',
        message: tab === 'product'
          ? 'Product order submitted! We will confirm shortly.'
          : 'Repair request submitted! We will contact you soon.',
      });
      setForm(emptyForm);
      onClearPrefill?.();
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {['product', 'repair'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => switchTab(t)}
            className={`px-5 py-2.5 rounded-full text-sm transition-colors ${
              tab === t ? 'bg-primary text-black font-semibold' : 'bg-white/10 text-muted'
            }`}
          >
            {t === 'product' ? 'Order Products' : 'Request Repair'}
          </button>
        ))}
      </div>

      {prefillProduct && tab === 'product' && (
        <div className="card mb-6 flex items-center gap-4">
          <img src={prefillProduct.image_url} alt="" className="w-16 h-16 rounded-lg object-cover" />
          <div>
            <p className="font-semibold">{prefillProduct.name}</p>
            <p className="text-primary text-sm">{formatTZS(prefillProduct.price)}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="label" htmlFor="order-name">Full Name</label>
          <input className="input" id="order-name" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <label className="label" htmlFor="order-phone">Phone Number</label>
          <input className="input" id="order-phone" name="phone" type="tel" value={form.phone} onChange={handleChange} required />
        </div>

        {tab === 'product' ? (
          <>
            <div>
              <label className="label" htmlFor="order-items">Product</label>
              <select
                className="input"
                id="order-items"
                name="items"
                value={form.items}
                onChange={handleChange}
                required
              >
                <option value="">Select a product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} — {formatTZS(p.price)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="order-quantity">Quantity</label>
              <input
                className="input"
                id="order-quantity"
                name="quantity"
                type="number"
                min="1"
                value={form.quantity}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="order-delivery">Pickup or Delivery</label>
              <select
                className="input"
                id="order-delivery"
                name="delivery_preference"
                value={form.delivery_preference}
                onChange={handleChange}
                required
              >
                <option value="pickup">Pickup at store</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
            {unitPrice > 0 && (
              <p className="text-sm text-muted">
                Estimated total:{' '}
                <span className="text-primary font-semibold">
                  {formatTZS(unitPrice * parseInt(form.quantity || '1', 10))}
                </span>
              </p>
            )}
          </>
        ) : (
          <>
            <div>
              <label className="label" htmlFor="order-device">Type of Device</label>
              <select
                className="input"
                id="order-device"
                name="device_type"
                value={form.device_type}
                onChange={handleChange}
                required
              >
                <option value="">Select device type</option>
                {DEVICE_TYPES.map((device) => (
                  <option key={device} value={device}>{device}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="order-issue">Issue Description</label>
              <textarea
                className="input min-h-[120px] resize-y"
                id="order-issue"
                name="issue_description"
                value={form.issue_description}
                onChange={handleChange}
                required
                placeholder="Describe the problem — cracked screen, battery not charging, etc."
              />
            </div>
          </>
        )}

        {status.message && (
          <p className={`text-sm ${status.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {status.message}
          </p>
        )}

        <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
          {submitting
            ? 'Submitting…'
            : tab === 'product'
              ? 'Submit Product Order'
              : 'Submit Repair Request'}
        </button>
      </form>
    </div>
  );
}
