import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import api from '../../api/client';
import { formatDate, formatTZS } from '../../utils/format';
import { CardSkeleton } from '../../components/Skeleton';

const STATUS_COLORS = {
  pending: '#eab308',
  confirmed: '#22c55e',
  completed: '#3b82f6',
  cancelled: '#ef4444',
};

function StatCard({ label, value, sub, color }) {
  return (
    <div className="card group hover:border-primary/40 transition-colors">
      <p className="text-muted text-xs uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color || 'text-primary'}`}>{value}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#101827] border border-white/10 rounded-lg px-3 py-2 text-sm shadow-lg">
      <p className="text-muted text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {typeof p.value === 'number' && p.value > 999 ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics')
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="card h-64 animate-pulse" />
          <div className="card h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) return <p className="text-muted">Failed to load analytics.</p>;

  const { totals, serviceBreakdown, orderStatusBreakdown, bookingStatusBreakdown,
    revenueByDay, bookingsByDay, ordersByDay, lowStockProducts, recentBookings,
    recentOrders, recentAudit } = data;

  const pieData = orderStatusBreakdown.map((d) => ({ name: d.status, value: d.count }));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Dashboard Overview</h1>

      {/* ─── Stat Cards ─── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Bookings" value={totals.bookings} sub={`${totals.completedBookings} completed`} />
        <StatCard label="Total Orders" value={totals.orders} sub={`${totals.completedOrders} completed`} />
        <StatCard label="Revenue (Paid)" value={formatTZS(totals.totalRevenue)} color="text-green-400" />
        <StatCard label="Pending" value={totals.pendingBookings + totals.pendingOrders} sub={`${totals.pendingBookings} bookings · ${totals.pendingOrders} orders`} color="text-yellow-400" />
      </div>

      {/* ─── Charts Row 1 ─── */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Trend */}
        {revenueByDay.length > 0 && (
          <div className="card lg:col-span-2">
            <h2 className="font-semibold mb-4">Revenue (Last 30 Days)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" stroke="#a5adc8" tickFormatter={(d) => new Date(d).toLocaleDateString('en-TZ', { month: 'short', day: 'numeric' })} />
                <YAxis stroke="#a5adc8" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} name="Revenue (TZS)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Order Status Pie */}
        <div className="card">
          <h2 className="font-semibold mb-4">Order Status</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted text-sm text-center py-8">No orders yet.</p>
          )}
        </div>
      </div>

      {/* ─── Charts Row 2 ─── */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Bookings by Service */}
        {serviceBreakdown.length > 0 && (
          <div className="card">
            <h2 className="font-semibold mb-4">Bookings by Service</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={serviceBreakdown}>
                <XAxis dataKey="type" stroke="#a5adc8" />
                <YAxis stroke="#a5adc8" />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" fill="#d4af37" radius={[4, 4, 0, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bookings Over Time */}
        {bookingsByDay.length > 0 && (
          <div className="card">
            <h2 className="font-semibold mb-4">Bookings Over Time</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={bookingsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" stroke="#a5adc8" tickFormatter={(d) => new Date(d).toLocaleDateString('en-TZ', { month: 'short', day: 'numeric' })} />
                <YAxis stroke="#a5adc8" />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ─── Booking Status Breakdown ─── */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h2 className="font-semibold mb-4">Booking Status</h2>
          {bookingStatusBreakdown.length > 0 ? (
            <div className="space-y-3">
              {bookingStatusBreakdown.map((b) => (
                <div key={b.status} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: STATUS_COLORS[b.status] || '#6b7280' }} />
                  <span className="text-sm capitalize flex-1">{b.status}</span>
                  <span className="text-sm font-semibold">{b.count}</span>
                  <span className="text-xs text-muted w-16 text-right">{totals.bookings > 0 ? Math.round(b.count / totals.bookings * 100) : 0}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">No bookings yet.</p>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="card">
          <h2 className="font-semibold mb-4 text-yellow-400">Low Stock Alert</h2>
          {lowStockProducts.length > 0 ? (
            <div className="space-y-2">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="flex justify-between text-sm border-b border-border/50 pb-2">
                  <span>{p.name}</span>
                  <span className={`font-semibold ${p.stock === 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">All products well-stocked.</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="font-semibold mb-4">Recent Activity</h2>
          {recentAudit.length > 0 ? (
            <div className="space-y-2">
              {recentAudit.map((a) => (
                <div key={a.id} className="text-xs border-b border-border/50 pb-2">
                  <p className="text-muted">
                    <span className="text-primary font-medium">{a.admin_username}</span>{' '}
                    {a.action.replace(/_/g, ' ')}{' '}
                    <span className="text-text">{a.entity_type}</span>
                    {a.entity_name ? ` — ${a.entity_name}` : ''}
                  </p>
                  <p className="text-muted/60 mt-0.5">{formatDate(a.created_at)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-sm">No activity yet.</p>
          )}
        </div>
      </div>

      {/* ─── Recent Bookings & Orders ─── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-4">Recent Bookings</h2>
          {recentBookings.length === 0 ? (
            <p className="text-muted text-sm">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((b) => (
                <div key={b.id} className="flex justify-between text-sm border-b border-border pb-2">
                  <div>
                    <p className="font-medium">{b.name}</p>
                    <p className="text-muted capitalize">{b.type} — {formatDate(b.date)}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    b.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    b.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                    b.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <h2 className="font-semibold mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-muted text-sm">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex justify-between text-sm border-b border-border pb-2">
                  <div>
                    <p className="font-medium">{o.name}</p>
                    <p className="text-muted capitalize">{o.order_type} · {o.payment_status || 'unpaid'}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    o.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    o.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                    o.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>{o.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
