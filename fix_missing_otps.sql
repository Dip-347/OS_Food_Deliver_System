UPDATE public.orders 
SET pickup_otp = floor(random() * 9000 + 1000)::text 
WHERE pickup_otp IS NULL;
