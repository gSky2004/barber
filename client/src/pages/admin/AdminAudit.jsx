import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import api from '../../api/client';
import { formatDate } from '../../utils/format';

const ACTION_COLORS = {
  create: '#22c55e',
  update_status: '#eab308',
  delete: '#ef4444',
  approve: '#3b82f6',
  login: '#8b5cf6',
};

const ENTITY_COLORS = {
  booking: '#d4af37',
  order: '#3b82f6',
  product: '#22c55e',
  testimonial: '#8b5cf6',
  gallery: '#f59e0b',
  contact: '#ef4444',
  admin: '#6366f1',
};

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#101827] border border-white/10 rounded-lg px-3 py-2 text-sm shadow-lg">
      <p className="text-muted text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(0);
  const limit = 20;

  const loadLogs = async () => {
    try {
      const params = new URLSearchParams({ limit, offset: page * limit });
      if (entityFilter) params.set('entity', entityFilter);
      if (actionFilter) params.set('action', actionFilter);
      const data = await api.get(`/audit?${params}`);
      setLogs(data.logs);
      setTotal(data.total);
    } catch {}
  };

  const loadStats = async () => {
    try {
      const data = await api.get('/audit/stats');
      setStats(data);
    } catch {}
  };

  useEffect(() => {
    Promise.all([loadLogs(), loadStats()])
      .finally(() => setLoading(false));
  }, [page, entityFilter, actionFilter]);

  const formatAction = (a) => a.replace(/_/g, ' ');

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="card h-8 animate-pulse" />
        <div className="grid lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="card h-48 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Admin Audit Log</h1>

      {/* ─── Stats Charts ─── */}
      {stats && (
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* By Action */}
          <div className="card">
            <h2 className="font-semibold mb-4 text-sm">Actions Distribution</h2>
            {stats.byAction.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={stats.byAction.map((d) => ({ name: formatAction(d.action), value: d.count }))}
                    cx="50%" cy="50%" outerRadius={65} innerRadius={35} paddingAngle={3} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {stats.byAction.map((d) => (
                      <Cell key={d.action} fill={ACTION_COLORS[d.action] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted text-sm text-center py-8">No data.</p>
            )}
          </div>

          {/* By Entity */}
          <div className="card">
            <h2 className="font-semibold mb-4 text-sm">Entity Activity</h2>
            {stats.byEntity.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={stats.byEntity.map((d) => ({ name: d.entity_type, count: d.count }))}>
                  <XAxis dataKey="name" stroke="#a5adc8" fontSize={11} />
                  <YAxis stroke="#a5adc8" />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Actions">
                    {stats.byEntity.map((d) => (
                      <Cell key={d.entity_type} fill={ENTITY_COLORS[d.entity_type] || '#6b7280'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted text-sm text-center py-8">No data.</p>
            )}
          </div>

          {/* By Admin */}
          <div className="card">
            <h2 className="font-semibold mb-4 text-sm">Admin Activity</h2>
            {stats.byAdmin.length > 0 ? (
              <div className="space-y-3">
                {stats.byAdmin.map((a) => (
                  <div key={a.admin_username} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {a.admin_username[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{a.admin_username}</p>
                      <div className="w-full bg-white/5 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-primary rounded-full h-1.5"
                          style={{ width: `${Math.min((a.count / (stats.byAdmin[0]?.count || 1)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-primary">{a.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm text-center py-8">No data.</p>
            )}
          </div>
        </div>
      )}

      {/* ─── Filters ─── */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          className="input py-1.5 text-sm w-auto"
          value={entityFilter}
          onChange={(e) => { setEntityFilter(e.target.value); setPage(0); }}
        >
          <option value="">All Entities</option>
          <option value="booking">Bookings</option>
          <option value="order">Orders</option>
          <option value="product">Products</option>
          <option value="testimonial">Testimonials</option>
          <option value="gallery">Gallery</option>
        </select>
        <select
          className="input py-1.5 text-sm w-auto"
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
        >
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="update_status">Status Change</option>
          <option value="delete">Delete</option>
          <option value="approve">Approve</option>
        </select>
        <span className="text-muted text-sm self-center ml-auto">{total} total entries</span>
      </div>

      {/* ─── Log Table ─── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted border-b border-border">
              <th className="text-left py-3 px-2">Time</th>
              <th className="text-left py-3 px-2">Admin</th>
              <th className="text-left py-3 px-2">Action</th>
              <th className="text-left py-3 px-2">Entity</th>
              <th className="text-left py-3 px-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-border/50 hover:bg-white/[0.02]">
                <td className="py-3 px-2 text-xs text-muted whitespace-nowrap">{formatDate(log.created_at)}</td>
                <td className="py-3 px-2">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                      {log.admin_username?.[0]?.toUpperCase()}
                    </span>
                    <span className="text-xs">{log.admin_username}</span>
                  </span>
                </td>
                <td className="py-3 px-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    log.action === 'create' ? 'bg-green-500/20 text-green-400' :
                    log.action === 'delete' ? 'bg-red-500/20 text-red-400' :
                    log.action === 'update_status' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-white/10 text-muted'
                  }`}>
                    {formatAction(log.action)}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <span className="text-xs capitalize">{log.entity_type}</span>
                  {log.entity_id && <span className="text-xs text-muted ml-1">#{log.entity_id}</span>}
                  {log.entity_name && <p className="text-xs text-muted truncate max-w-[200px]">{log.entity_name}</p>}
                </td>
                <td className="py-3 px-2 text-xs text-muted">
                  {log.old_value && log.new_value && (
                    <span>
                      {log.old_value.status && log.new_value.status ? (
                        <span>
                          <span className="line-through">{log.old_value.status}</span>
                          {' → '}
                          <span className="text-primary">{log.new_value.status}</span>
                        </span>
                      ) : (
                        <span>Updated</span>
                      )}
                    </span>
                  )}
                  {!log.old_value && log.new_value && <span className="text-green-400">Created</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <p className="text-muted text-center py-8">No audit logs yet.</p>}
      </div>

      {/* ─── Pagination ─── */}
      {total > limit && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            className="btn btn-secondary text-sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="text-muted text-sm self-center">
            Page {page + 1} of {Math.ceil(total / limit)}
          </span>
          <button
            className="btn btn-secondary text-sm"
            disabled={(page + 1) * limit >= total}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
