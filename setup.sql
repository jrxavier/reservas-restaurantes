-- =============================================
-- Sistema de Reservas de Restaurantes
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- Tabela de Restaurantes
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Mesas
CREATE TABLE IF NOT EXISTS tables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL,
  capacity INTEGER DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(restaurant_id, table_number)
);

-- Tabela de Reservas
CREATE TABLE IF NOT EXISTS reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  num_people INTEGER NOT NULL,
  tables_needed INTEGER NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de relacionamento Reserva <-> Mesas alocadas
CREATE TABLE IF NOT EXISTS reservation_tables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  table_id UUID REFERENCES tables(id) ON DELETE CASCADE,
  UNIQUE(reservation_id, table_id)
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_tables ENABLE ROW LEVEL SECURITY;

-- Policies: acesso total via service_role (backend)
CREATE POLICY "service_role full access restaurants" ON restaurants
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "service_role full access tables" ON tables
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "service_role full access reservations" ON reservations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "service_role full access reservation_tables" ON reservation_tables
  FOR ALL USING (true) WITH CHECK (true);
