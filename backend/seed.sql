-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;

-- Create Categories Table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Products Table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  image_url VARCHAR(255),
  stock INTEGER DEFAULT 0,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert Sample Categories
INSERT INTO categories (name, description) VALUES
  ('Electronics', 'Gadgets, appliances, and electronic devices'),
  ('Mobiles', 'Smartphones and accessories'),
  ('Laptops', 'Computers and laptop accessories'),
  ('Fashion', 'Clothing, shoes, and apparel'),
  ('Home Appliances', 'Appliances for home and kitchen');

-- Insert Sample Products
INSERT INTO products (name, description, price, original_price, image_url, stock, category_id) VALUES
  ('Apple iPhone 15 Pro', 'Latest iPhone with A17 Pro chip and titanium design.', 999.00, 1099.00, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&auto=format&fit=crop', 50, (SELECT id FROM categories WHERE name = 'Mobiles')),
  ('Samsung Galaxy S24 Ultra', 'AI-powered smartphone with incredible zoom capabilities.', 1199.00, 1299.00, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop', 45, (SELECT id FROM categories WHERE name = 'Mobiles')),
  ('MacBook Air M3', 'Incredibly thin and light laptop with M3 chip.', 1099.00, 1199.00, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop', 30, (SELECT id FROM categories WHERE name = 'Laptops')),
  ('Dell XPS 15', 'High-performance laptop with 4K OLED display.', 1499.00, 1699.00, 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=600&auto=format&fit=crop', 20, (SELECT id FROM categories WHERE name = 'Laptops')),
  ('Sony WH-1000XM5', 'Industry-leading noise canceling wireless headphones.', 348.00, 399.00, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=600&auto=format&fit=crop', 100, (SELECT id FROM categories WHERE name = 'Electronics')),
  ('Nintendo Switch OLED', 'Hybrid gaming console with vibrant OLED screen.', 349.00, 349.00, 'https://images.unsplash.com/photo-1629853974415-1823eb508c90?q=80&w=600&auto=format&fit=crop', 60, (SELECT id FROM categories WHERE name = 'Electronics')),
  ('Men''s Casual T-Shirt', 'Comfortable cotton t-shirt for everyday wear.', 19.99, 29.99, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop', 200, (SELECT id FROM categories WHERE name = 'Fashion')),
  ('Women''s Running Shoes', 'Lightweight and breathable running shoes.', 79.99, 99.99, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop', 150, (SELECT id FROM categories WHERE name = 'Fashion')),
  ('Dyson V15 Detect', 'Powerful cordless vacuum cleaner with laser illumination.', 699.00, 749.00, 'https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=600&auto=format&fit=crop', 25, (SELECT id FROM categories WHERE name = 'Home Appliances')),
  ('Instant Pot Duo 7-in-1', 'Multi-use pressure cooker and slow cooker.', 89.99, 119.99, 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=600&auto=format&fit=crop', 80, (SELECT id FROM categories WHERE name = 'Home Appliances'));
