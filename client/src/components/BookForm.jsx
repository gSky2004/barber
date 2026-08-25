import { useState, useEffect } from 'react';
import api from '../api/client';
import { BOOKING_SERVICES, GAMING_DURATIONS } from '../utils/format';
import DateTimePicker from './DateTimePicker';

export default function BookForm() {
  const [tab, setTab] = useState('barber');
  const [form, setForm] = useState({
    name: '', phone: '', date: '', time: '', service: 'haircut', duration: '1', players: '1',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('book-tab');
    if (saved) {
      setTab(saved);
      sessionStorage.removeItem('book-tab');
    }
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const details = tab === 'barber'
        ? { service: form.service }
        : { duration: form.duration, players: form.players };

      await api.post('/bookings', {
        type: tab,
        name: form.name,
        phone: form.phone,
        date: form.date,
        time: form.time,
        details,
      });

      setStatus({ type: 'success', message: 'Booking submitted! We will confirm by phone shortly.' });
      setForm({ name: '', phone: '', date: '', time: '', service: 'haircut', duration: '1', players: '1' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {['barber', 'gaming'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-full text-sm capitalize transition-colors ${
              tab === t ? 'bg-primary text-black font-semibold' : 'bg-white/10 text-muted'
            }`}
          >
            {t === 'barber' ? 'Barbershop' : 'Gaming Station'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="label" htmlFor="book-name">Full Name</label>
          <input className="input" id="book-name" name="name" value={form.name} onChange={handleChange} required placeholder="John Mwangi" />
        </div>
        <div>
          <label className="label" htmlFor="book-phone">Phone Number</label>
          <input className="input" id="book-phone" name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="0712 345 678" />
        </div>

        <DateTimePicker
          date={form.date}
          time={form.time}
          onDateChange={(d) => setForm({ ...form, date: d })}
          onTimeChange={(t) => setForm({ ...form, time: t })}
          label="Preferred Date & Time"
        />

        {tab === 'barber' ? (
          <div>
            <label className="label" htmlFor="book-service">Service Type</label>
            <select className="input" id="book-service" name="service" value={form.service} onChange={handleChange}>
              {BOOKING_SERVICES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        ) : (
          <>
            <div>
              <label className="label" htmlFor="book-duration">Duration</label>
              <select className="input" id="book-duration" name="duration" value={form.duration} onChange={handleChange}>
                {GAMING_DURATIONS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="book-players">Number of Players</label>
              <input className="input" id="book-players" name="players" type="number" min="1" max="4" value={form.players} onChange={handleChange} />
            </div>
          </>
        )}

        {status.message && (
          <p className={`text-sm ${status.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{status.message}</p>
        )}

        <button type="submit" className="btn btn-primary w-full" disabled={submitting || !form.date || !form.time}>
          {submitting ? 'Submitting…' : 'Submit Booking'}
        </button>
      </form>
    </div>
  );
}
