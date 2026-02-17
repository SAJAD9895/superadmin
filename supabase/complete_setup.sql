-- ============================================
-- COMPLETE DATABASE SETUP FOR BUSINESS ADMIN PANEL
-- ============================================
-- Run this in Supabase SQL Editor if setting up from scratch
-- NOTE: This excludes the 'company_leads' table since you mentioned it already exists

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (Business Users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text UNIQUE,
  mobile_number text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING ( auth.uid() = id );

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

-- ============================================
-- 2. COMPANIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Basic Info
  company_name text,
  company_description text,
  year_established date,
  company_type text,

  -- Location
  country text,
  city text,
  complete_address text,
  google_map_location text,

  -- Contact
  phone text,
  whatsapp_mobile text,
  contact_email text,
  website text,

  -- Categories
  main_category text,
  sub_category text,

  -- Listing & Branding
  listing_type text DEFAULT 'Regular',
  logo_url text,
  cover_image_url text,

  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
DROP POLICY IF EXISTS "Users can view own company" ON public.companies;
CREATE POLICY "Users can view own company"
  ON public.companies FOR SELECT
  USING ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Users can insert own company" ON public.companies;
CREATE POLICY "Users can insert own company"
  ON public.companies FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Users can update own company" ON public.companies;
CREATE POLICY "Users can update own company"
  ON public.companies FOR UPDATE
  USING ( auth.uid() = user_id );

DROP POLICY IF EXISTS "Users can delete own company" ON public.companies;
CREATE POLICY "Users can delete own company"
  ON public.companies FOR DELETE
  USING ( auth.uid() = user_id );

-- ============================================
-- 3. MASTER_PRODUCTS TABLE (Product Catalog)
-- ============================================
CREATE TABLE IF NOT EXISTS public.master_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on master_products
ALTER TABLE public.master_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for master_products
DROP POLICY IF EXISTS "Authenticated users can view master products" ON public.master_products;
CREATE POLICY "Authenticated users can view master products"
  ON public.master_products FOR SELECT
  TO authenticated
  USING ( true );

DROP POLICY IF EXISTS "Authenticated users can insert master products" ON public.master_products;
CREATE POLICY "Authenticated users can insert master products"
  ON public.master_products FOR INSERT
  TO authenticated
  WITH CHECK ( true );

-- ============================================
-- 4. PRODUCTS TABLE (Company Products)
-- ============================================
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  master_product_id uuid REFERENCES public.master_products(id),
  product_description text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
DROP POLICY IF EXISTS "Users can view own company products" ON public.products;
CREATE POLICY "Users can view own company products"
  ON public.products FOR SELECT
  USING ( EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = products.company_id
    AND companies.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert own company products" ON public.products;
CREATE POLICY "Users can insert own company products"
  ON public.products FOR INSERT
  WITH CHECK ( EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = products.company_id
    AND companies.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update own company products" ON public.products;
CREATE POLICY "Users can update own company products"
  ON public.products FOR UPDATE
  USING ( EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = products.company_id
    AND companies.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete own company products" ON public.products;
CREATE POLICY "Users can delete own company products"
  ON public.products FOR DELETE
  USING ( EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = products.company_id
    AND companies.user_id = auth.uid()
  ));

-- ============================================
-- 5. TRIGGERS & FUNCTIONS
-- ============================================

-- Trigger function for auto-creating profiles when users sign up
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger function for updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to companies table
DROP TRIGGER IF EXISTS companies_updated_at ON public.companies;
CREATE TRIGGER companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

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
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 6. VERIFY COMPANY_LEADS TABLE EXISTS
-- ============================================
-- Since you mentioned the leads table already exists,
-- we just need to ensure it has the correct RLS policies

-- Enable RLS on company_leads (if not already enabled)
ALTER TABLE public.company_leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for company_leads
DROP POLICY IF EXISTS "Users can view own company leads" ON public.company_leads;
CREATE POLICY "Users can view own company leads"
  ON public.company_leads FOR SELECT
  USING ( EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = company_leads.company_id
    AND companies.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete own company leads" ON public.company_leads;
CREATE POLICY "Users can delete own company leads"
  ON public.company_leads FOR DELETE
  USING ( EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = company_leads.company_id
    AND companies.user_id = auth.uid()
  ));

-- Optional: Allow public/anonymous users to insert leads (for website forms)
DROP POLICY IF EXISTS "Anyone can insert company leads" ON public.company_leads;
CREATE POLICY "Anyone can insert company leads"
  ON public.company_leads FOR INSERT
  WITH CHECK ( true );

-- ============================================
-- SETUP COMPLETE
-- ============================================
SELECT 'Database setup completed successfully!' AS status;
