-- GhostMilk Initial Schema
-- Creates all core tables with RLS policies for multi-tenant isolation

-- ============================================
-- DAIRIES TABLE (Tenants)
-- ============================================
CREATE TABLE dairies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dairy_id UUID NOT NULL REFERENCES dairies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_customers_dairy_id ON customers(dairy_id);
CREATE INDEX idx_customers_name ON customers(dairy_id, name);

-- ============================================
-- USERS EXTENSION TABLE
-- Links auth.users to dairies and optionally to customers
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dairy_id UUID REFERENCES dairies(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'customer')),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_users_dairy_id ON users(dairy_id);

-- ============================================
-- MILK ENTRIES TABLE
-- ============================================
CREATE TABLE milk_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dairy_id UUID NOT NULL REFERENCES dairies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  fat DECIMAL(5,2) NOT NULL CHECK (fat >= 0 AND fat <= 15),
  snf DECIMAL(5,2) NOT NULL CHECK (snf >= 0 AND snf <= 15),
  liters DECIMAL(10,3) NOT NULL CHECK (liters > 0),
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_milk_entries_dairy_id ON milk_entries(dairy_id);
CREATE INDEX idx_milk_entries_customer_id ON milk_entries(customer_id);
CREATE INDEX idx_milk_entries_date ON milk_entries(dairy_id, date);

-- ============================================
-- RATES TABLE
-- ============================================
CREATE TABLE rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dairy_id UUID NOT NULL REFERENCES dairies(id) ON DELETE CASCADE,
  fat DECIMAL(5,2) NOT NULL,
  snf DECIMAL(5,2) NOT NULL,
  rate_per_liter DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dairy_id, fat, snf)
);

-- Index for faster lookups
CREATE INDEX idx_rates_dairy_id ON rates(dairy_id);
CREATE INDEX idx_rates_fat_snf ON rates(dairy_id, fat, snf);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE dairies ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE milk_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE rates ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's dairy_id
CREATE OR REPLACE FUNCTION get_user_dairy_id()
RETURNS UUID AS $$
  SELECT dairy_id FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- DAIRIES policies
CREATE POLICY "Users can view their own dairy"
  ON dairies FOR SELECT
  USING (id = get_user_dairy_id() OR owner_id = auth.uid());

CREATE POLICY "Owners can update their dairy"
  ON dairies FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Anyone can create a dairy during registration"
  ON dairies FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- USERS policies
CREATE POLICY "Users can view their own record"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own record"
  ON users FOR INSERT
  WITH CHECK (id = auth.uid());

-- CUSTOMERS policies
CREATE POLICY "Users can view customers in their dairy"
  ON customers FOR SELECT
  USING (dairy_id = get_user_dairy_id());

CREATE POLICY "Owners can insert customers in their dairy"
  ON customers FOR INSERT
  WITH CHECK (dairy_id = get_user_dairy_id());

CREATE POLICY "Owners can update customers in their dairy"
  ON customers FOR UPDATE
  USING (dairy_id = get_user_dairy_id());

CREATE POLICY "Owners can delete customers in their dairy"
  ON customers FOR DELETE
  USING (dairy_id = get_user_dairy_id());

-- MILK_ENTRIES policies
CREATE POLICY "Users can view entries in their dairy"
  ON milk_entries FOR SELECT
  USING (dairy_id = get_user_dairy_id());

CREATE POLICY "Owners can insert entries in their dairy"
  ON milk_entries FOR INSERT
  WITH CHECK (dairy_id = get_user_dairy_id());

CREATE POLICY "Owners can update entries in their dairy"
  ON milk_entries FOR UPDATE
  USING (dairy_id = get_user_dairy_id());

CREATE POLICY "Owners can delete entries in their dairy"
  ON milk_entries FOR DELETE
  USING (dairy_id = get_user_dairy_id());

-- Customer-specific policy for viewing their own entries
CREATE POLICY "Customers can view their own entries"
  ON milk_entries FOR SELECT
  USING (
    customer_id = (SELECT customer_id FROM users WHERE id = auth.uid())
  );

-- RATES policies
CREATE POLICY "Users can view rates in their dairy"
  ON rates FOR SELECT
  USING (dairy_id = get_user_dairy_id());

CREATE POLICY "Owners can insert rates in their dairy"
  ON rates FOR INSERT
  WITH CHECK (dairy_id = get_user_dairy_id());

CREATE POLICY "Owners can update rates in their dairy"
  ON rates FOR UPDATE
  USING (dairy_id = get_user_dairy_id());

CREATE POLICY "Owners can delete rates in their dairy"
  ON rates FOR DELETE
  USING (dairy_id = get_user_dairy_id());

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dairies_updated_at
  BEFORE UPDATE ON dairies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
