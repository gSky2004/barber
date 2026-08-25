import { useState, useEffect } from 'react';
import api from '../../api/client';
import { formatDate } from '../../utils/format';

const statuses = ['pending', 'confirmed', 'cancelled', 'completed'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);

  const load = () => api.get('/bookings').then(setBookings).catch(() => {});

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/bookings/${id}`, { status });
    load();
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Bookings</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted border-b border-border">
              <th className="text-left py-3 px-2">Name</th>
              <th className="text-left py-3 px-2">Type</th>
              <th className="text-left py-3 px-2">Date</th>
              <th className="text-left py-3 px-2">Time</th>
              <th className="text-left py-3 px-2">Phone</th>
              <th className="text-left py-3 px-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-border/50">
                <td className="py-3 px-2">{b.name}</td>
                <td className="py-3 px-2 capitalize">{b.type}</td>
                <td className="py-3 px-2">{formatDate(b.date)}</td>
                <td className="py-3 px-2">{b.time}</td>
                <td className="py-3 px-2">{b.phone}</td>
                <td className="py-3 px-2">
                  <select
                    className="input py-1 text-xs"
                    value={b.status}
                    onChange={(e) => updateStatus(b.id, e.target.value)}
                  >
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && <p className="text-muted text-center py-8">No bookings yet.</p>}
      </div>
    </div>
  );
}
