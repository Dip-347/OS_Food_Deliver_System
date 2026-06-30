-- Run this in your Supabase SQL Editor to fix the Cheesy Garlic Bread image URL
UPDATE public.menu_items
SET image_url = 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&q=80'
WHERE name = 'Cheesy Garlic Bread' AND image_url LIKE '%1573140247632%';
