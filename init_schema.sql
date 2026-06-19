-- Run this script in your Supabase SQL Editor to initialize the database

-- 0. Create Users Table (extends auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'restaurant', 'rider', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 1. Create Tables
CREATE TABLE public.restaurants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    rating NUMERIC DEFAULT 4.5,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    image_url TEXT,
    category TEXT NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL, -- references auth.users(id) in a real setup
    restaurant_id UUID REFERENCES public.restaurants(id),
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, preparing, ready, on_way, delivered
    delivery_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES public.menu_items(id),
    quantity INTEGER NOT NULL,
    price_at_time NUMERIC NOT NULL
);

-- 2. Insert Mock Data
-- Insert Restaurants
INSERT INTO public.restaurants (id, name, description, image_url) VALUES 
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Burger Loop', 'The best burgers in town optimized by AI.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80'),
('b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e', 'Pizza Disk', 'Round pizzas delivered in O(1) time.', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80');

-- Insert Menu Items for Burger Loop
INSERT INTO public.menu_items (restaurant_id, name, description, price, category, image_url) VALUES 
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'FCFS Burger', 'First come, first served classic cheeseburger.', 8.99, 'Burgers', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80'),
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'SSTF Fries', 'Shortest seek time fries. Crispy and fast.', 3.99, 'Sides', 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=200&q=80');

-- Insert Menu Items for Pizza Disk
INSERT INTO public.menu_items (restaurant_id, name, description, price, category, image_url) VALUES 
('b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e', 'SCAN Pepperoni', 'Scans across your tastebuds.', 12.99, 'Pizzas', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=200&q=80'),
('b2c3d4e5-f6a7-4b5c-8d9e-0f1a2b3c4d5e', 'LOOK Margherita', 'Look no further for the best cheese pizza.', 10.99, 'Pizzas', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&q=80');

-- 3. Setup RLS (Row Level Security) - Allow all for MVP
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public read access to restaurants" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Allow public read access to menu_items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Allow all actions for orders" ON public.orders FOR ALL USING (true);
CREATE POLICY "Allow all actions for order_items" ON public.order_items FOR ALL USING (true);
