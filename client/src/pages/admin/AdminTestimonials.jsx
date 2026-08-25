import { useState, useEffect } from 'react';
import api from '../../api/client';
import { formatDate } from '../../utils/format';

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([]);

  const load = () => api.get('/testimonials').then(setTestimonials).catch(() => {});

  useEffect(() => { load(); }, []);

  const toggleApprove = async (id, approved) => {
    await api.put(`/testimonials/${id}`, { approved });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this testimonial?')) return;
    await api.delete(`/testimonials/${id}`);
    load();
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Testimonials</h1>
      <div className="space-y-4">
        {testimonials.map((t) => (
          <div key={t.id} className="card">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="font-semibold">{t.customer_name}</p>
                <p className="text-sm text-muted mt-1">&ldquo;{t.message}&rdquo;</p>
                <p className="text-xs text-muted mt-2">{formatDate(t.created_at)} · {'★'.repeat(t.rating || 5)}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {!t.approved ? (
                  <button className="btn btn-primary text-xs py-1.5 px-3" onClick={() => toggleApprove(t.id, true)}>Approve</button>
                ) : (
                  <span className="text-green-400 text-xs">Approved</span>
                )}
                <button className="text-red-400 text-xs" onClick={() => handleDelete(t.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
        {testimonials.length === 0 && <p className="text-muted text-center py-8">No testimonials yet.</p>}
      </div>
    </div>
  );
}
