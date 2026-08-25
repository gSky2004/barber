-- Admin audit log — tracks every action taken in the admin panel
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES admin_users(id) ON DELETE SET NULL,
  admin_username VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER,
  entity_name VARCHAR(200),
  old_value JSONB,
  new_value JSONB,
  ip_address VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications — in-app notifications for admin and customers
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  recipient_type VARCHAR(20) NOT NULL DEFAULT 'admin'
    CHECK (recipient_type IN ('admin', 'customer')),
  recipient_id INTEGER,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_admin ON admin_audit_log(admin_username);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON admin_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_type, recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
