-- Database Seeding Script: Update Restaurant Metadata & Menus
-- Run this in your Supabase SQL Editor

DO $$
DECLARE
    kfc_id UUID;
    peninsula_id UUID;
    barcode_id UUID;
    milano_id UUID;
    pizzaburg_id UUID;
    ambrosia_id UUID;
    chillox_id UUID;
    sultans_id UUID;
    mezzan_id UUID;
    da_sig_id UUID;
    grand_id UUID;
BEGIN
    -- 1. Fetch existing restaurant IDs by Name
    SELECT id INTO kfc_id FROM public.restaurants WHERE name = 'KFC' LIMIT 1;
    SELECT id INTO peninsula_id FROM public.restaurants WHERE name = 'The Peninsula Chittagong' LIMIT 1;
    SELECT id INTO barcode_id FROM public.restaurants WHERE name = 'Barcode Cafe' LIMIT 1;
    SELECT id INTO milano_id FROM public.restaurants WHERE name = 'Cafe Milano' LIMIT 1;
    SELECT id INTO pizzaburg_id FROM public.restaurants WHERE name = 'PizzaBurg Chittagong' LIMIT 1;
    SELECT id INTO ambrosia_id FROM public.restaurants WHERE name = 'Ambrosia Restaurant' LIMIT 1;
    SELECT id INTO chillox_id FROM public.restaurants WHERE name = 'Chillox' LIMIT 1;
    SELECT id INTO sultans_id FROM public.restaurants WHERE name = 'Sultan''s Dine' LIMIT 1;
    SELECT id INTO mezzan_id FROM public.restaurants WHERE name = 'Mezzan Haile Aaiun' LIMIT 1;
    SELECT id INTO da_sig_id FROM public.restaurants WHERE name = 'Da Signature Restaurant' LIMIT 1;
    SELECT id INTO grand_id FROM public.restaurants WHERE name = 'Grand Mughal Restaurant' LIMIT 1;

    -- 2. Update Restaurant Metadata (Description & Unique Image URLs)
    
    IF kfc_id IS NOT NULL THEN
        UPDATE public.restaurants 
        SET description = 'Finger Lickin'' Good. Iconic fried chicken, burgers, and sides.', 
            image_url = 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=500&q=80' -- Fried chicken
        WHERE id = kfc_id;
        
        INSERT INTO public.menu_items (restaurant_id, name, description, price, category, image_url) VALUES 
        (kfc_id, 'KFC Bucket', 'Signature crispy fried chicken bucket.', 15.99, 'Chicken', 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=200&q=80'),
        (kfc_id, 'Zinger Burger', 'Spicy, crunchy chicken fillet burger.', 6.49, 'Burgers', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80'),
        (kfc_id, 'Fries', 'Golden crinkle-cut fries.', 2.99, 'Sides', 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=200&q=80');
    END IF;

    IF peninsula_id IS NOT NULL THEN
        UPDATE public.restaurants 
        SET description = 'Luxurious fine dining featuring multi-cuisine buffets and continental dishes.', 
            image_url = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80' -- Fine dining
        WHERE id = peninsula_id;
        
        INSERT INTO public.menu_items (restaurant_id, name, description, price, category, image_url) VALUES 
        (peninsula_id, 'Continental Buffet', 'Premium spread of international cuisines.', 35.00, 'Buffet', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&q=80'),
        (peninsula_id, 'Grilled Salmon', 'Norwegian salmon with asparagus.', 22.50, 'Mains', 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=200&q=80'),
        (peninsula_id, 'Tiramisu', 'Classic Italian dessert.', 8.00, 'Desserts', 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=200&q=80');
    END IF;

    IF barcode_id IS NOT NULL THEN
        UPDATE public.restaurants 
        SET description = 'Cozy cafe vibes with artisan coffee, steaks, and gourmet fast food.', 
            image_url = 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&q=80' -- Cafe atmosphere
        WHERE id = barcode_id;
        
        INSERT INTO public.menu_items (restaurant_id, name, description, price, category, image_url) VALUES 
        (barcode_id, 'T-Bone Steak', 'Juicy T-Bone steak cooked to perfection.', 25.99, 'Steaks', 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=200&q=80'),
        (barcode_id, 'Caramel Macchiato', 'Rich espresso with vanilla and caramel.', 4.50, 'Beverages', 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=200&q=80'),
        (barcode_id, 'Club Sandwich', 'Triple-decker sandwich with chicken and bacon.', 7.99, 'Sandwiches', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200&q=80');
    END IF;

    IF milano_id IS NOT NULL THEN
        UPDATE public.restaurants 
        SET description = 'Authentic Italian pizzas, pasta, and freshly brewed coffees.', 
            image_url = 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=500&q=80' -- Italian food/restaurant
        WHERE id = milano_id;
        
        INSERT INTO public.menu_items (restaurant_id, name, description, price, category, image_url) VALUES 
        (milano_id, 'Margherita Pizza', 'Classic tomato and fresh mozzarella.', 11.99, 'Pizzas', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&q=80'),
        (milano_id, 'Fettuccine Alfredo', 'Creamy parmesan pasta.', 13.50, 'Pasta', 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=200&q=80'),
        (milano_id, 'Espresso', 'Double shot of rich Italian roast.', 2.99, 'Beverages', 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=200&q=80');
    END IF;

    IF pizzaburg_id IS NOT NULL THEN
        UPDATE public.restaurants 
        SET description = 'The ultimate fusion of loaded pizzas and giant burgers.', 
            image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80' -- Pizza
        WHERE id = pizzaburg_id;
        
        INSERT INTO public.menu_items (restaurant_id, name, description, price, category, image_url) VALUES 
        (pizzaburg_id, 'Meaty Onion Pizza', 'Loaded with beef, sausage, and caramelized onions.', 14.99, 'Pizzas', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&q=80'),
        (pizzaburg_id, 'Tower Burger', 'Double patty burger with cheese lava.', 9.50, 'Burgers', 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=200&q=80'),
        (pizzaburg_id, 'Cheesy Garlic Bread', 'Freshly baked with extra mozzarella.', 4.99, 'Sides', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&q=80');
    END IF;

    IF ambrosia_id IS NOT NULL THEN
        UPDATE public.restaurants 
        SET description = 'Premium multi-cuisine restaurant known for exquisite seafood and Thai dishes.', 
            image_url = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=500&q=80' -- Nice dish/seafood
        WHERE id = ambrosia_id;
        
        INSERT INTO public.menu_items (restaurant_id, name, description, price, category, image_url) VALUES 
        (ambrosia_id, 'Tom Yum Soup', 'Spicy and sour Thai seafood soup.', 8.50, 'Appetizers', 'https://images.unsplash.com/photo-1548943487-a2e4d43b4850?w=200&q=80'),
        (ambrosia_id, 'Lobster Thermidor', 'Rich and creamy baked lobster.', 45.00, 'Seafood', 'https://images.unsplash.com/photo-1559742811-822873691df8?w=200&q=80'),
        (ambrosia_id, 'Pad Thai', 'Classic Thai stir-fried noodles.', 12.00, 'Mains', 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=200&q=80');
    END IF;

    IF chillox_id IS NOT NULL THEN
        UPDATE public.restaurants 
        SET description = 'Home to the juiciest, messiest, and most iconic burgers in town.', 
            image_url = 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80' -- Juicy burger
        WHERE id = chillox_id;
        
        INSERT INTO public.menu_items (restaurant_id, name, description, price, category, image_url) VALUES 
        (chillox_id, 'Naga Burger', 'Extremely spicy beef burger with naga chili.', 7.99, 'Burgers', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80'),
        (chillox_id, 'Beef Bacon Burger', 'Beef patty topped with crispy bacon.', 8.99, 'Burgers', 'https://images.unsplash.com/photo-1594212887874-cefc06637ce0?w=200&q=80'),
        (chillox_id, 'Loaded Fries', 'French fries loaded with cheese and chicken bits.', 5.50, 'Sides', 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=200&q=80');
    END IF;

    IF sultans_id IS NOT NULL THEN
        UPDATE public.restaurants 
        SET description = 'Royal Bengali and Mughlai cuisine. Legendary Kacchi Biryani.', 
            image_url = 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&q=80' -- Biryani / Mughlai
        WHERE id = sultans_id;
        
        INSERT INTO public.menu_items (restaurant_id, name, description, price, category, image_url) VALUES 
        (sultans_id, 'Kacchi Biryani', 'Traditional slow-cooked mutton biryani.', 14.00, 'Biryani', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=200&q=80'),
        (sultans_id, 'Beef Rezala', 'Rich and aromatic beef curry.', 9.00, 'Curries', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200&q=80'),
        (sultans_id, 'Borhani', 'Spiced mint yogurt drink.', 2.50, 'Beverages', 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=200&q=80');
    END IF;

    IF mezzan_id IS NOT NULL THEN
        UPDATE public.restaurants 
        SET description = 'Authentic Chittagonian traditional feast (Mezban) experience.', 
            image_url = 'https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?w=500&q=80' -- Traditional meat curry
        WHERE id = mezzan_id;
        
        INSERT INTO public.menu_items (restaurant_id, name, description, price, category, image_url) VALUES 
        (mezzan_id, 'Mezbani Beef', 'Spicy and tender traditional Chittagonian beef.', 12.00, 'Mains', 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=200&q=80'),
        (mezzan_id, 'Chana Dal with Beef', 'Rich lentil soup cooked with beef bones.', 7.00, 'Sides', 'https://images.unsplash.com/photo-1548943487-a2e4d43b4850?w=200&q=80'),
        (mezzan_id, 'Plain Rice', 'Steamed white rice, perfect for Mezbani beef.', 2.00, 'Sides', 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=200&q=80');
    END IF;

    IF da_sig_id IS NOT NULL THEN
        UPDATE public.restaurants 
        SET description = 'A signature culinary experience featuring premium steaks and pasta.', 
            image_url = 'https://images.unsplash.com/photo-1544025162-811114212349?w=500&q=80' -- Steakhouse/Premium
        WHERE id = da_sig_id;
        
        INSERT INTO public.menu_items (restaurant_id, name, description, price, category, image_url) VALUES 
        (da_sig_id, 'Signature Ribeye', 'Premium cut ribeye steak with garlic butter.', 35.00, 'Steaks', 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=200&q=80'),
        (da_sig_id, 'Truffle Mushroom Pasta', 'Pasta tossed in rich truffle oil and mushroom cream.', 18.00, 'Pasta', 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=200&q=80'),
        (da_sig_id, 'Molten Lava Cake', 'Warm chocolate cake with a gooey center.', 9.00, 'Desserts', 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=200&q=80');
    END IF;

    IF grand_id IS NOT NULL THEN
        UPDATE public.restaurants 
        SET description = 'Experience the grandeur of traditional Mughlai and Indian cuisine.', 
            image_url = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&q=80' -- Indian/Mughlai
        WHERE id = grand_id;
        
        INSERT INTO public.menu_items (restaurant_id, name, description, price, category, image_url) VALUES 
        (grand_id, 'Chicken Tikka Masala', 'Roasted marinated chicken chunks in spiced curry.', 12.50, 'Curries', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=200&q=80'),
        (grand_id, 'Mutton Rogan Josh', 'Aromatic lamb dish of Persian origin.', 15.00, 'Curries', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&q=80'),
        (grand_id, 'Garlic Naan', 'Oven-baked flatbread infused with garlic.', 2.50, 'Breads', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&q=80');
    END IF;

END $$;
