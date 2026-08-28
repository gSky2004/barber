import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const poll = () => {
      api.get('/notifications?unread=true')
        .then((data) => {
          setUnread(data.unreadCount || 0);
        })
        .catch(() => {});
    };
    poll();
    const interval = setInterval(poll, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      try {
        const data = await api.get('/notifications?limit=20');
        setNotifications(data.notifications || []);
        setUnread(data.unreadCount || 0);
      } catch {}
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/all/read');
      setUnread(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  return (
    <div className="relative">
      <button onClick={toggleOpen} className="relative p-2 text-muted hover:text-primary transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-[#1b2a44] border border-border rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="text-muted text-sm text-center py-8">No notifications.</p>
            ) : (
              <div>
                {notifications.map((n) => (
                  <div key={n.id} className={`px-4 py-3 border-b border-border/50 ${!n.read ? 'bg-primary/5' : ''}`}>
                    <p className="text-xs font-medium">{n.title}</p>
                    <p className="text-xs text-muted mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-muted/60 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <aside className="hidden lg:flex w-56 bg-white/5 border-r border-border p-4 flex-col shrink-0">
        <h2 className="font-display font-bold text-lg mb-1">
          Admin<span className="text-primary">.</span>
        </h2>
        <p className="text-xs text-muted mb-6">{user?.username}</p>
        <nav className="flex flex-col gap-1 flex-1">
          <AdminTabList />
        </nav>
        <button onClick={handleLogout} className="btn btn-secondary text-sm mt-4">
          Logout
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 border-b border-border bg-bg/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-3 gap-3">
            <h2 className="font-display font-bold">
              Admin<span className="text-primary">.</span>
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">{user?.username}</span>
              <button onClick={handleLogout} className="btn btn-secondary text-xs py-1.5 px-3">Logout</button>
              <NotificationBell />
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-2 pb-2">
            <AdminTabList />
          </nav>
        </header>
        <header className="hidden lg:flex h-14 border-b border-border bg-white/5 backdrop-blur-sm items-center justify-end px-6 shrink-0">
          <NotificationBell />
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AdminTabList() {
  const tabs = [
    { to: '/admin', label: 'Overview', end: true },
    { to: '/admin/bookings', label: 'Bookings' },
    { to: '/admin/orders', label: 'Orders' },
    { to: '/admin/products', label: 'Products' },
    { to: '/admin/gallery', label: 'Gallery' },
    { to: '/admin/testimonials', label: 'Testimonials' },
    { to: '/admin/messages', label: 'Messages' },
    { to: '/admin/audit', label: 'Audit Log' },
  ];
  return (
    <>
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
              isActive ? 'bg-primary/20 text-primary' : 'text-muted hover:text-text'
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </>
  );
}
