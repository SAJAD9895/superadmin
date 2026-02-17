-- ============================================
-- FIX: Auto-create profile when user signs up
-- ============================================
-- This trigger automatically creates a profile record
-- whenever a new user is created in auth.users

-- Step 1: Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 3: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FIX EXISTING USERS: Create missing profiles
-- ============================================
-- This will create profile records for any existing users
-- that don't have a profile yet

INSERT INTO public.profiles (id, email, full_name, created_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
  au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- ============================================
-- VERIFY THE FIX
-- ============================================
SELECT 
  'Total auth users:' AS description,
  COUNT(*) AS count
FROM auth.users
UNION ALL
SELECT 
  'Total profiles:' AS description,
  COUNT(*) AS count
FROM public.profiles
UNION ALL
SELECT 
  'Users without profiles:' AS description,
  COUNT(*) AS count
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Success message
SELECT 'Profile trigger setup completed! All existing users now have profiles.' AS status;
