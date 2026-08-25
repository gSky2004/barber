import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function AdminGallery() {
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({ image_url: '', caption: '' });

  const load = () => api.get('/gallery').then(setImages).catch(() => {});

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await api.post('/gallery', form);
    setForm({ image_url: '', caption: '' });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this image?')) return;
    await api.delete(`/gallery/${id}`);
    load();
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Gallery</h1>

      <form onSubmit={handleAdd} className="card mb-6 flex flex-wrap gap-3">
        <input className="input flex-1 min-w-[200px]" placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} required />
        <input className="input flex-1 min-w-[200px]" placeholder="Caption" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
        <button type="submit" className="btn btn-primary text-sm">Add Image</button>
      </form>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((img) => (
          <div key={img.id} className="card p-3">
            <img src={img.image_url} alt={img.caption || ''} className="aspect-square object-cover rounded-lg" />
            <p className="text-sm text-muted mt-2">{img.caption}</p>
            <button className="text-red-400 text-xs mt-2" onClick={() => handleDelete(img.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
