-- Sandbox / future payment support
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(30) NOT NULL DEFAULT 'unpaid';

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_ref VARCHAR(100);

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);

CREATE TABLE IF NOT EXISTS payment_sessions (
  id VARCHAR(64) PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'TZS',
  status VARCHAR(30) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed', 'expired')),
  mode VARCHAR(30) NOT NULL DEFAULT 'sandbox',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payment_sessions_order ON payment_sessions(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
