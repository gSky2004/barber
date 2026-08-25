import { useState, useEffect } from 'react';
import api from '../../api/client';
import { formatDate } from '../../utils/format';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    api.get('/contact').then(setMessages).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Contact Messages</h1>
      <div className="space-y-4">
        {messages.map((m) => (
          <div key={m.id} className="card">
            <div className="flex justify-between">
              <p className="font-semibold">{m.name}</p>
              <p className="text-xs text-muted">{formatDate(m.created_at)}</p>
            </div>
            <p className="text-sm text-muted mt-1">{m.email} · {m.phone}</p>
            <p className="text-sm mt-3">{m.message}</p>
          </div>
        ))}
        {messages.length === 0 && <p className="text-muted text-center py-8">No messages yet.</p>}
      </div>
    </div>
  );
}
