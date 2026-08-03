-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Migration script to update existing database
-- Run this first if you have existing data

-- Step 1: Add a temporary column for the new colors format
ALTER TABLE products ADD COLUMN IF NOT EXISTS colors_new TEXT;

-- Step 2: Convert existing JSONB colors to string format (names only)
UPDATE products 
SET colors_new = CASE 
  WHEN jsonb_typeof(colors) = 'array' THEN (
    SELECT string_agg(
      CASE 
        WHEN jsonb_typeof(item) = 'object' THEN 
          item->>'name'
        ELSE 
          item::text
      END, ', ')
    FROM jsonb_array_elements(colors) AS item
  )
  ELSE colors::text
END
WHERE colors IS NOT NULL;

-- Step 3: Drop the old column and rename the new one
ALTER TABLE products DROP COLUMN colors;
ALTER TABLE products RENAME COLUMN colors_new TO colors;

-- Step 4: Set default value
ALTER TABLE products ALTER COLUMN colors SET DEFAULT '';

-- Step 5: Remove category check constraint to allow free text
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;

-- Step 6: Remove is_featured and is_bestseller columns if they exist
ALTER TABLE products DROP COLUMN IF EXISTS is_featured;
ALTER TABLE products DROP COLUMN IF EXISTS is_bestseller;

-- Step 7: Remove original_price, craft_time_hours, sizes, materials columns if they exist
ALTER TABLE products DROP COLUMN IF EXISTS original_price;
ALTER TABLE products DROP COLUMN IF EXISTS craft_time_hours;
ALTER TABLE products DROP COLUMN IF EXISTS sizes;
ALTER TABLE products DROP COLUMN IF EXISTS materials;

-- Step 8: Remove old indexes that reference dropped columns
DROP INDEX IF EXISTS idx_products_featured;

-- Step 9: Remove color_hex column from order_items table
ALTER TABLE order_items DROP COLUMN IF EXISTS color_hex;

-- Products Table (for fresh installations)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    images TEXT[] NOT NULL,
    colors TEXT NOT NULL DEFAULT '',
    available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_ref VARCHAR(20) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    shipping_address TEXT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Processing', 'Delivered', 'Cancelled')),
    delivery_preference VARCHAR(255),
    payment_method VARCHAR(100),
    special_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    product_title VARCHAR(255) NOT NULL,
    product_image TEXT NOT NULL,
    color_name VARCHAR(100) NOT NULL,
    color_hex VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages Table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Settings Table (for password management)
CREATE TABLE admin_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_password_hash VARCHAR(255) NOT NULL DEFAULT '$2b$10$default_hash_change_me',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin settings (default password: wengi123)
INSERT INTO admin_settings (admin_password_hash) 
VALUES ('$2b$10$YourHashedPasswordHere');

-- Function to hash password (using pgcrypto)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to verify password
CREATE OR REPLACE FUNCTION verify_admin_password(password_text TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- In production, use crypt() with proper hashing
  -- For now, simple comparison (upgrade to bcrypt in production)
  RETURN EXISTS (
    SELECT 1 FROM admin_settings 
    WHERE admin_password_hash = password_text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update admin password
CREATE OR REPLACE FUNCTION update_admin_password(new_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE admin_settings 
  SET admin_password_hash = new_password, updated_at = NOW();
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_available ON products(available);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_messages_read ON messages(read);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial sample data
INSERT INTO products (title, category, description, price, images, colors, available) VALUES
('Royal Tote Bag', 'Bags', 'Elegant handcrafted tote bag made with premium organic cotton', 250.00, ARRAY['/src/assets/images/wengi_crochet_tote_1785323544902.jpg'], 
 'Classic Navy, Warm Adobe, Cream Beige', true),

('Parisian Cardigan', 'Garments', 'Beautiful crochet cardigan inspired by Parisian fashion', 450.00, ARRAY['/src/assets/images/wengi_crochet_cardigan_1785323557878.jpg'],
 'Ivory White, Soft Pink', true),

('Botanical Bouquet', 'Home & Floral', 'Handcrafted crochet flowers arrangement', 180.00, ARRAY['/src/assets/images/wengi_crochet_flowers_1785323568097.jpg'],
 'Rose Red, Lavender, Sunflower Yellow', true),

('Hero Masterpiece', 'Accessories', 'Showcase piece featuring advanced crochet techniques', 1200.00, ARRAY['/src/assets/images/wengi_hero_crochet_1785323531326.jpg'],
 'Royal Gold, Deep Burgundy', true);