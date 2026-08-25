import { useState, useEffect } from 'react';
import api from '../../api/client';
import { formatTZS } from '../../utils/format';

const emptyProduct = { name: '', category: 'phone', description: '', price: '', stock: '', image_url: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get('/products').then(setProducts).catch(() => {});

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock, 10) };
    try {
      if (editing) {
        await api.put(`/products/${editing}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setForm(emptyProduct);
      setEditing(null);
      setShowForm(false);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (p) => {
    setForm({ ...p, price: String(p.price), stock: String(p.stock) });
    setEditing(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Products</h1>
        <button className="btn btn-primary text-sm" onClick={() => { setShowForm(true); setEditing(null); setForm(emptyProduct); }}>
          Add Product
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 grid sm:grid-cols-2 gap-4">
          <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="phone">Phone</option>
            <option value="electrical">Electrical</option>
          </select>
          <input className="input" placeholder="Price (TZS)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <input className="input" placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
          <input className="input sm:col-span-2" placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          <textarea className="input sm:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" className="btn btn-primary text-sm">{editing ? 'Update' : 'Create'}</button>
            <button type="button" className="btn btn-secondary text-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted border-b border-border">
              <th className="text-left py-3 px-2">Name</th>
              <th className="text-left py-3 px-2">Category</th>
              <th className="text-left py-3 px-2">Price</th>
              <th className="text-left py-3 px-2">Stock</th>
              <th className="text-right py-3 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border/50">
                <td className="py-3 px-2">{p.name}</td>
                <td className="py-3 px-2 capitalize">{p.category}</td>
                <td className="py-3 px-2">{formatTZS(p.price)}</td>
                <td className="py-3 px-2">{p.stock}</td>
                <td className="py-3 px-2 text-right space-x-2">
                  <button className="text-accent text-xs" onClick={() => handleEdit(p)}>Edit</button>
                  <button className="text-red-400 text-xs" onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
