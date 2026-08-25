-- Milestone Accessories — PostgreSQL Schema
-- Run against Supabase or local Postgres

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('barber', 'gaming')),
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  date DATE NOT NULL,
  time VARCHAR(20) NOT NULL,
  details JSONB DEFAULT '{}',
  status VARCHAR(30) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  order_type VARCHAR(30) NOT NULL DEFAULT 'product'
    CHECK (order_type IN ('product', 'repair')),
  items JSONB NOT NULL DEFAULT '[]',
  total DECIMAL(12, 2) DEFAULT 0,
  issue_description TEXT,
  delivery_preference VARCHAR(30) DEFAULT 'pickup'
    CHECK (delivery_preference IN ('pickup', 'delivery')),
  status VARCHAR(30) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(200),
  phone VARCHAR(30),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery (
  id SERIAL PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption VARCHAR(300),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(approved);
