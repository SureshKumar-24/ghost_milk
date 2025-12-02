-- Run this in Supabase SQL Editor to delete test user
-- https://supabase.com/dashboard/project/oyrmpqcnjsaaicpthuiy/sql/new

-- Delete from auth.users (this will cascade to other tables)
DELETE FROM auth.users WHERE email = 'sk20012404@gmail.com';
