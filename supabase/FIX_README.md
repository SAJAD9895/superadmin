# 🔧 Fix for Foreign Key Constraint Error

## Problem
When trying to save company details, you get this error:
```
{
    "code": "23503",
    "details": "Key is not present in table \"profiles\".",
    "message": "insert or update on table \"companies\" violates foreign key constraint \"companies_user_id_fkey\""
}
```

## Root Cause
The `companies` table has a foreign key constraint that references the `profiles` table. When a user is created in Supabase Auth (`auth.users`), there's no automatic corresponding record created in the `profiles` table, causing the foreign key constraint to fail.

## Solution

### Quick Fix (Run this NOW)
Go to your Supabase SQL Editor and run:
```sql
-- Copy and paste the contents of:
supabase/fix_profile_trigger.sql
```

This will:
1. ✅ Create a trigger to automatically create profile records for new users
2. ✅ Fix all existing users by creating their missing profile records
3. ✅ Verify the fix worked

### What the Fix Does

#### 1. Auto-Create Profiles (for future users)
Creates a database trigger that automatically inserts a profile record whenever a new user signs up:
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### 2. Fix Existing Users (for current users)
Inserts profile records for any existing users who don't have one:
```sql
INSERT INTO public.profiles (id, email, full_name, created_at)
SELECT au.id, au.email, au.email, au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
```

## After Running the Fix

1. ✅ All existing users will have profile records
2. ✅ New users will automatically get profile records
3. ✅ You can now save company details without errors
4. ✅ The foreign key constraint will work properly

## Verify It Worked

After running the SQL, you should see output like:
```
Total auth users: 1
Total profiles: 1
Users without profiles: 0
```

If "Users without profiles" is 0, you're good to go! 🎉

## Try Again

Now try to save your company details in the Profile page. It should work without errors!
