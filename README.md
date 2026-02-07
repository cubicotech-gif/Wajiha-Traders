# Wajeeha Traders - Inventory, Sales & Accounts Management System

A complete web-based management system for confectionary distribution business handling inventory, purchases, sales, billing, credit management, and accounting.

## 🚀 Features

### 📦 Inventory Management
- Add/Edit/Delete products with complete details
- Multiple unit types: gm, ml, pieces, cartons
- Company/Brand management
- Stock tracking in real-time
- Low stock alerts

### 🛒 Purchase Management
- Record purchases from vendors
- Multiple discount types (percentage off retail)
- Credit/Cash/Advance payment options
- Vendor management
- Purchase history tracking

### 💰 Sales Management
- Create sales orders/bills
- Advance booking system (book today, deliver tomorrow)
- Set custom selling prices with margins
- Apply discounts per item or total
- Print-ready bills
- Unpaid bills tracking

### 👥 Customer Management
- Shop/Mart profiles
- Credit limits
- Payment history
- Outstanding balances

### 📊 Accounts & Reports
- Daily Sales Report (DSR)
- Credit tracking (Receivables & Payables)
- Payment collections
- Vendor payments
- Profit/Loss calculations
- Dashboard with key metrics

### 📱 Mobile-First Design
- Fully responsive on all devices
- Works perfectly on mobile phones
- Touch-friendly interface
- Fast loading
- Beautiful aesthetics

## 🛠 Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📋 Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Supabase Database

Go to your Supabase project and run this SQL in the SQL Editor:

```sql
-- ===========================================
-- WAJEEHA TRADERS DATABASE SCHEMA
-- ===========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PRODUCTS & INVENTORY
-- ============================================

-- Companies/Brands Table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  unit_type TEXT NOT NULL CHECK (unit_type IN ('gm', 'ml', 'pieces', 'cartons', 'kg', 'liter')),
  unit_value DECIMAL(10,2), -- e.g., 250 for 250ml
  retail_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  current_stock DECIMAL(10,2) DEFAULT 0,
  min_stock_level DECIMAL(10,2) DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VENDORS
-- ============================================

CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  default_discount_percent DECIMAL(5,2) DEFAULT 0,
  outstanding_balance DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CUSTOMERS (Shops/Marts)
-- ============================================

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  shop_name TEXT,
  phone TEXT,
  address TEXT,
  credit_limit DECIMAL(12,2) DEFAULT 0,
  outstanding_balance DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PURCHASES
-- ============================================

CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount DECIMAL(12,2) DEFAULT 0,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  net_amount DECIMAL(12,2) DEFAULT 0,
  payment_type TEXT CHECK (payment_type IN ('cash', 'credit', 'advance')),
  paid_amount DECIMAL(12,2) DEFAULT 0,
  remaining_balance DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE purchase_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity DECIMAL(10,2) NOT NULL,
  retail_price DECIMAL(10,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  purchase_price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SALES
-- ============================================

CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  delivery_date DATE,
  is_advance_booking BOOLEAN DEFAULT FALSE,
  total_amount DECIMAL(12,2) DEFAULT 0,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  net_amount DECIMAL(12,2) DEFAULT 0,
  payment_type TEXT CHECK (payment_type IN ('cash', 'credit', 'advance')),
  paid_amount DECIMAL(12,2) DEFAULT 0,
  remaining_balance DECIMAL(12,2) DEFAULT 0,
  status TEXT CHECK (status IN ('pending', 'delivered', 'paid', 'cancelled')) DEFAULT 'pending',
  bill_number TEXT UNIQUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYMENTS
-- ============================================

-- Customer Payments (Collections)
CREATE TABLE customer_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount DECIMAL(12,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'cheque')),
  reference_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor Payments (Payables)
CREATE TABLE vendor_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  purchase_id UUID REFERENCES purchases(id) ON DELETE SET NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount DECIMAL(12,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'cheque')),
  reference_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_products_company ON products(company_id);
CREATE INDEX idx_purchases_vendor ON purchases(vendor_id);
CREATE INDEX idx_purchases_date ON purchases(purchase_date);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_customer_payments_customer ON customer_payments(customer_id);
CREATE INDEX idx_vendor_payments_vendor ON vendor_payments(vendor_id);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE
-- ============================================

-- Update product updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (Optional - for multi-user)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_payments ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (adjust as needed)
CREATE POLICY "Allow all for authenticated users" ON companies FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON products FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON vendors FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON customers FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON purchases FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON purchase_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON sales FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON sale_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON customer_payments FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON vendor_payments FOR ALL TO authenticated USING (true);

-- For development: Allow anonymous access (REMOVE IN PRODUCTION)
CREATE POLICY "Allow all for anon" ON companies FOR ALL TO anon USING (true);
CREATE POLICY "Allow all for anon" ON products FOR ALL TO anon USING (true);
CREATE POLICY "Allow all for anon" ON vendors FOR ALL TO anon USING (true);
CREATE POLICY "Allow all for anon" ON customers FOR ALL TO anon USING (true);
CREATE POLICY "Allow all for anon" ON purchases FOR ALL TO anon USING (true);
CREATE POLICY "Allow all for anon" ON purchase_items FOR ALL TO anon USING (true);
CREATE POLICY "Allow all for anon" ON sales FOR ALL TO anon USING (true);
CREATE POLICY "Allow all for anon" ON sale_items FOR ALL TO anon USING (true);
CREATE POLICY "Allow all for anon" ON customer_payments FOR ALL TO anon USING (true);
CREATE POLICY "Allow all for anon" ON vendor_payments FOR ALL TO anon USING (true);

-- ============================================
-- SEED DATA (Sample/Initial Data)
-- ============================================

-- Insert some sample companies
INSERT INTO companies (name) VALUES
  ('Nestle'),
  ('Cadbury'),
  ('Peek Freans'),
  ('Tapal'),
  ('National');

-- Insert sample products
INSERT INTO products (name, company_id, unit_type, unit_value, retail_price, current_stock) 
SELECT 
  'KitKat', 
  id, 
  'pieces', 
  1, 
  50, 
  100 
FROM companies WHERE name = 'Nestle';

INSERT INTO products (name, company_id, unit_type, unit_value, retail_price, current_stock) 
SELECT 
  'Dairy Milk', 
  id, 
  'gm', 
  45, 
  120, 
  50 
FROM companies WHERE name = 'Cadbury';

-- Sample vendors
INSERT INTO vendors (name, phone, default_discount_percent) VALUES
  ('Wholesale Distributor A', '0300-1234567', 5),
  ('Wholesale Distributor B', '0321-7654321', 3);

-- Sample customers
INSERT INTO customers (name, shop_name, phone, credit_limit) VALUES
  ('Ahmed Ali', 'Ali General Store', '0333-1111111', 50000),
  ('Hassan Traders', 'Hassan Mart', '0345-2222222', 100000);
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Deploy to Vercel

1. Push code to GitHub
2. Import repo in Vercel
3. Add environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## 📁 Project Structure

```
wajeeha-traders-system/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Dashboard
│   ├── globals.css          # Global styles
│   ├── inventory/           # Inventory pages
│   ├── purchases/           # Purchase pages
│   ├── sales/               # Sales pages
│   ├── customers/           # Customer management
│   ├── vendors/             # Vendor management
│   ├── accounts/            # Accounts & reports
│   └── settings/            # Settings
├── components/
│   ├── layout/              # Layout components
│   ├── ui/                  # Reusable UI components
│   ├── forms/               # Form components
│   └── bills/               # Bill templates
├── lib/
│   ├── supabase.ts          # Supabase client
│   ├── types.ts             # TypeScript types
│   └── utils.ts             # Utility functions
└── public/                  # Static assets
```

## 🎯 Key Pages

- `/` - Dashboard with metrics
- `/inventory` - Product management
- `/purchases` - Purchase management
- `/purchases/new` - Add new purchase
- `/sales` - Sales list
- `/sales/new` - Create new sale/bill
- `/sales/advance-bookings` - Advance bookings
- `/customers` - Customer management
- `/vendors` - Vendor management
- `/accounts/dsr` - Daily Sales Report
- `/accounts/receivables` - Customer credits
- `/accounts/payables` - Vendor credits

## 📱 Mobile Features

- Responsive design for phones/tablets
- Touch-friendly buttons and inputs
- Fast loading on mobile networks
- Offline-capable (with service worker)
- PWA support

## 🔐 Security

- Supabase Row Level Security (RLS)
- Environment variables for keys
- Input validation
- XSS protection

## 📞 Support

For issues or questions, contact the development team.

---

**Developed by Cubico Technologies for Wajeeha Traders**
