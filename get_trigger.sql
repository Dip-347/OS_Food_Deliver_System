SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'auto_assign_rider';
