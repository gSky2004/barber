import { useState } from 'react';
import api from '../api/client';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      await api.post('/contact', form);
      setStatus({ type: 'success', message: 'Message sent! We will get back to you soon.' });
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div>
        <label className="label" htmlFor="contact-name">Name</label>
        <input className="input" id="contact-name" name="name" value={form.name} onChange={handleChange} required />
      </div>
      <div>
        <label className="label" htmlFor="contact-email">Email</label>
        <input className="input" id="contact-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="optional" />
      </div>
      <div>
        <label className="label" htmlFor="contact-phone">Phone</label>
        <input className="input" id="contact-phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
      </div>
      <div>
        <label className="label" htmlFor="contact-message">Message</label>
        <textarea
          className="input min-h-[140px] resize-y"
          id="contact-message"
          name="message"
          value={form.message}
          onChange={handleChange}
          required
          placeholder="How can we help you?"
        />
      </div>

      {status.message && (
        <p className={`text-sm ${status.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{status.message}</p>
      )}

      <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
        {submitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
