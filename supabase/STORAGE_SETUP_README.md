# Storage Setup Instructions

## Issue Fixed
The "Bucket not found" error has been resolved. The application now uses the correct Supabase Storage buckets for company logos and cover images.

## What Was Changed

### 1. Storage Buckets Created
Two new storage buckets have been configured:
- **`company_logo`** - For company logos
- **`cover_images`** - For company cover images

### 2. One-Time Upload Restriction
- Users can upload their logo and cover image **only once**
- If they try to upload again, a support modal appears
- To update images, users must contact support at **info@souqroute.com**

## Setup Instructions

### Step 1: Fix Permissions & Create Buckets

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Run the SQL script located at:
   `/supabase/FIX_STORAGE_RLS.sql`

**This script will:**
- Create the storage buckets if they are missing
- Drop any old conflicting security policies
- Apply simple "name LIKE user_id/%" policies that fix the "new row violates row-level security policy" error

### Step 2: Verify Buckets Are Created

Run this query in SQL Editor:
```sql
SELECT id, name, public 
FROM storage.buckets 
WHERE id IN ('company_logo', 'cover_images');
```

You should see both buckets listed.

### Step 3: Test Upload Functionality

1. Log in to the admin panel
2. Go to **Company Profile**
3. Try uploading a logo - it should work
4. Try uploading a cover image - it should work
5. Try uploading again - you should see the support modal

## Troubleshooting

### Error: "new row violates row-level security policy"
**Solution**: This means your user doesn't have permission to upload to that specific folder.
1. Make sure you are logged in.
2. Run `supabase/FIX_STORAGE_RLS.sql` completely.
3. Check the browser console - if you see `User ID: undefined`, you need to re-login.

### Error: "Bucket not found"
**Solution**: Run `supabase/FIX_STORAGE_RLS.sql` to create the buckets.

## Security (RLS) Policies

The new policies are simplified and robust:

**company_logo bucket:**
- ✅ Authenticated users can upload to their own folder: `user_id/`
- ✅ Authenticated users can update/delete their own files
- ✅ Public can view all logos

**cover_images bucket:**
- ✅ Authenticated users can upload to their own folder: `user_id/`
- ✅ Authenticated users can update/delete their own files
- ✅ Public can view all cover images

## Next Steps

1. Run the `FIX_STORAGE_RLS.sql` script
2. Test the upload functionality
3. Verify the support modal appears on second upload
