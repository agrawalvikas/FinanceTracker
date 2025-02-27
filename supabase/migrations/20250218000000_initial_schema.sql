/*
  # Finance Tracker Initial Schema
  
  This migration sets up the core schema for the finance tracking application.

  ## Tables Created:
  1. transactions
     - Stores all financial transactions (income and expenses)
     - Includes date, amount, description, category, source, etc.
  
  2. categories
     - Stores expense categories and their subcategories
     - Includes default categories for common expenses
  
  3. sources
     - Stores payment sources/accounts
     - Includes common credit cards and payment methods

  ## Security:
  - Row Level Security (RLS) enabled on all tables
  - Policies for authenticated users to manage their data
  - Read-only access to default categories and sources
*/

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  date date NOT NULL,
  amount decimal(10,2) NOT NULL,
  description text NOT NULL,
  category text,
  sub_category text,
  source text NOT NULL,
  notes text,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL UNIQUE,
  sub_categories jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- Create sources table
CREATE TABLE IF NOT EXISTS sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;

-- Transactions policies
CREATE POLICY "Users can manage their own transactions"
  ON transactions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Categories policies
CREATE POLICY "Users can manage their own categories"
  ON categories FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view default categories"
  ON categories FOR SELECT
  TO authenticated
  USING (user_id IS NULL);

-- Sources policies
CREATE POLICY "Enable read access for authenticated users"
  ON sources FOR SELECT
  TO authenticated
  USING (true);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, sub_categories, user_id, created_at)
VALUES
  ('Food & Dining', '["Groceries", "Restaurants", "Delivery"]'::jsonb, NULL, now()),
  ('Transportation', '["Fuel", "Public Transit", "Maintenance", "Parking"]'::jsonb, NULL, now()),
  ('Housing', '["Rent", "Utilities", "Maintenance", "Insurance"]'::jsonb, NULL, now()),
  ('Entertainment', '["Movies", "Games", "Events", "Hobbies"]'::jsonb, NULL, now()),
  ('Shopping', '["Clothing", "Electronics", "Home", "Gifts"]'::jsonb, NULL, now()),
  ('Healthcare', '["Medical", "Pharmacy", "Insurance"]'::jsonb, NULL, now()),
  ('Education', '["Tuition", "Books", "Courses", "Supplies"]'::jsonb, NULL, now()),
  ('Personal Care', '["Grooming", "Fitness", "Spa & Massage"]'::jsonb, NULL, now()),
  ('Travel', '["Flights", "Hotels", "Car Rental", "Activities"]'::jsonb, NULL, now()),
  ('Bills & Utilities', '["Phone", "Internet", "Streaming Services"]'::jsonb, NULL, now())
ON CONFLICT (name) DO NOTHING;

-- Insert default sources
INSERT INTO sources (name) VALUES 
  ('Capital One'),
  ('Chase'),
  ('Citi'),
  ('Bilt'),
  ('Apple'),
  ('Chase Lipi'),
  ('Sofi'),
  ('Sofi Lipi'),
  ('Chase Freedom'),
  ('Amex'),
  ('Discover')
ON CONFLICT (name) DO NOTHING; 