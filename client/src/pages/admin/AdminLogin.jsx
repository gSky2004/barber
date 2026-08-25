import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.username, form.password);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-md space-y-5">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold">Admin Login</h1>
          <p className="text-muted text-sm mt-2">Milestone Accessories Dashboard</p>
        </div>
        <div>
          <label className="label" htmlFor="username">Username</label>
          <input
            className="input"
            id="username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            className="input"
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
