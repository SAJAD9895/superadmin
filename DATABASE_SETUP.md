# 🗄️ Souq Route Admin Panel — Full Database & Pipeline Setup Guide

> **Last Updated:** February 2026  
> **Project:** Souq Route Business Admin Panel  
> **Stack:** React + Vite + Supabase

---

## 📋 Table of Contents

1. [Environment Overview](#1-environment-overview)
2. [Supabase Projects](#2-supabase-projects)
3. [Full Database Schema (SQL)](#3-full-database-schema-sql)
4. [Storage Buckets Setup (SQL)](#4-storage-buckets-setup-sql)
5. [Additional Migrations (SQL)](#5-additional-migrations-sql)
6. [Order of Execution](#6-order-of-execution)
7. [GitHub Secrets Setup](#7-github-secrets-setup)
8. [GitHub Pipeline (CI/CD) Setup](#8-github-pipeline-cicd-setup)
9. [Deployment Platforms](#9-deployment-platforms)
10. [Email / Auth Settings in Supabase](#10-email--auth-settings-in-supabase)

---

## 1. Environment Overview

| Environment | Branch  | Supabase Project      | Purpose                              |
|-------------|---------|----------------------|--------------------------------------|
| Staging     | staging | `gmgrsuynufoycvnqaltj` (existing) | Dev & testing, NOT for real users  |
| Production  | main    | `akwycltnkqcrwezqldbt` (new LIVE) | Real users, live data                |

---

## 2. Supabase Projects

### 🟡 Staging
| Key       | Value |
|-----------|-------|
| URL       | `https://gmgrsuynufoycvnqaltj.supabase.co` |
| Anon Key  | (your existing staging anon key — see `.env.staging`) |

### 🟢 Production (Live)
| Key       | Value |
|-----------|-------|
| URL       | `https://akwycltnkqcrwezqldbt.supabase.co` |
| Anon Key  | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (see `.env.production`) |

> ⚠️ **Never expose these keys in code or GitHub.** Always use GitHub Secrets for CI/CD.

---

## 3. Full Database Schema (SQL)

Run the **entire block below** in the **Supabase SQL Editor** for each project.  
Go to: **Supabase Dashboard → SQL Editor → New Query → Paste → Run**

Do this **once for Staging** and **once for Production**.

```sql
-- ============================================================
-- SOUQ ROUTE ADMIN PANEL — COMPLETE DATABASE SETUP
-- ============================================================
-- Run this in: Supabase Dashboard → SQL Editor
-- Run separately on STAGING and PRODUCTION Supabase projects.
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE 1: PROFILES (Business Users)
-- Automatically created when a user signs up via Auth trigger
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       text,
  email           text UNIQUE,
  mobile_number   text,
  created_at      timestamp with time zone DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT   USING ( auth.uid() = id );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE   USING ( auth.uid() = id );

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT   WITH CHECK ( auth.uid() = id );

-- ============================================================
-- TABLE 2: COMPANIES
-- One company per user (business listing)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.companies (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Basic Info
  company_name         text,
  company_description  text,
  year_established     date,
  company_type         text,

  -- Location
  country              text,
  city                 text,
  complete_address     text,
  google_map_location  text,

  -- Contact
  phone                text,
  whatsapp_mobile      text,
  contact_email        text,
  website              text,

  -- Categories
  main_category        text,
  sub_category         text,

  -- Listing & Branding
  listing_type         text DEFAULT 'Regular',
  logo_url             text,
  cover_image_url      text,

  -- Limits
  product_limit        integer DEFAULT 10,

  -- Timestamps
  created_at           timestamp with time zone DEFAULT now(),
  updated_at           timestamp with time zone DEFAULT now()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own company"   ON public.companies;
DROP POLICY IF EXISTS "Users can insert own company" ON public.companies;
DROP POLICY IF EXISTS "Users can update own company" ON public.companies;
DROP POLICY IF EXISTS "Users can delete own company" ON public.companies;

CREATE POLICY "Users can view own company"
  ON public.companies FOR SELECT   USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert own company"
  ON public.companies FOR INSERT   WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update own company"
  ON public.companies FOR UPDATE   USING ( auth.uid() = user_id );

CREATE POLICY "Users can delete own company"
  ON public.companies FOR DELETE   USING ( auth.uid() = user_id );

-- ============================================================
-- TABLE 3: MASTER_PRODUCTS (Global Product Catalog / Dropdown)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.master_products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text UNIQUE NOT NULL,
  created_at  timestamp with time zone DEFAULT now()
);

ALTER TABLE public.master_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view master products"   ON public.master_products;
DROP POLICY IF EXISTS "Authenticated users can insert master products" ON public.master_products;

CREATE POLICY "Authenticated users can view master products"
  ON public.master_products FOR SELECT TO authenticated USING ( true );

CREATE POLICY "Authenticated users can insert master products"
  ON public.master_products FOR INSERT TO authenticated WITH CHECK ( true );

-- ============================================================
-- TABLE 4: PRODUCTS (Company-specific Products)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id         uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  master_product_id  uuid REFERENCES public.master_products(id),
  product_description text,
  created_at         timestamp with time zone DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own company products"   ON public.products;
DROP POLICY IF EXISTS "Users can insert own company products" ON public.products;
DROP POLICY IF EXISTS "Users can update own company products" ON public.products;
DROP POLICY IF EXISTS "Users can delete own company products" ON public.products;

CREATE POLICY "Users can view own company products"
  ON public.products FOR SELECT
  USING ( EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = products.company_id
      AND companies.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own company products"
  ON public.products FOR INSERT
  WITH CHECK ( EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = products.company_id
      AND companies.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own company products"
  ON public.products FOR UPDATE
  USING ( EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = products.company_id
      AND companies.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own company products"
  ON public.products FOR DELETE
  USING ( EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = products.company_id
      AND companies.user_id = auth.uid()
  ));

-- ============================================================
-- TABLE 5: COMPANY_LEADS (Inbound leads from website forms)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.company_leads (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,

  customer_name     text,
  customer_email    text,
  customer_phone    text,
  message           text,

  master_product_id uuid REFERENCES public.master_products(id),
  created_at        timestamp with time zone DEFAULT now()
);

ALTER TABLE public.company_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own company leads"   ON public.company_leads;
DROP POLICY IF EXISTS "Users can delete own company leads" ON public.company_leads;
DROP POLICY IF EXISTS "Anyone can insert company leads"   ON public.company_leads;

-- Business owners can view leads for their company
CREATE POLICY "Users can view own company leads"
  ON public.company_leads FOR SELECT
  USING ( EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = company_leads.company_id
      AND companies.user_id = auth.uid()
  ));

-- Business owners can delete their own leads
CREATE POLICY "Users can delete own company leads"
  ON public.company_leads FOR DELETE
  USING ( EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = company_leads.company_id
      AND companies.user_id = auth.uid()
  ));

-- Public (anonymous website visitors) can submit a lead
CREATE POLICY "Anyone can insert company leads"
  ON public.company_leads FOR INSERT
  WITH CHECK ( true );

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create a profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update the 'updated_at' column on companies
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS companies_updated_at ON public.companies;
CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ============================================================
-- FIX: Create profiles for any existing users who are missing one
-- ============================================================
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

-- ============================================================
-- DONE
-- ============================================================
SELECT 'Database setup completed successfully!' AS status;
```

---

## 4. Storage Buckets Setup (SQL)

Run this **after** the schema above. Run separately for each Supabase project.

```sql
-- ============================================================
-- STORAGE BUCKETS — SOUQ ROUTE ADMIN PANEL
-- ============================================================

-- Create buckets (public = files are publicly readable via URL)
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('company_logo',  'company_logo',  true),
  ('cover_images',  'cover_images',  true)
ON CONFLICT (id) DO NOTHING;

-- ── COMPANY LOGO BUCKET POLICIES ─────────────────────────────

DROP POLICY IF EXISTS "Users can upload own company logo"  ON storage.objects;
DROP POLICY IF EXISTS "Users can update own company logo"  ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own company logo"  ON storage.objects;
DROP POLICY IF EXISTS "Public can view company logos"      ON storage.objects;

CREATE POLICY "Users can upload own company logo"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'company_logo' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own company logo"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'company_logo' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own company logo"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'company_logo' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public can view company logos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'company_logo');

-- ── COVER IMAGES BUCKET POLICIES ─────────────────────────────

DROP POLICY IF EXISTS "Users can upload own cover image"  ON storage.objects;
DROP POLICY IF EXISTS "Users can update own cover image"  ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own cover image"  ON storage.objects;
DROP POLICY IF EXISTS "Public can view cover images"      ON storage.objects;

CREATE POLICY "Users can upload own cover image"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'cover_images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own cover image"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'cover_images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own cover image"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'cover_images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public can view cover images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'cover_images');

-- ── VERIFY ───────────────────────────────────────────────────
SELECT 'Storage setup completed!' AS status, COUNT(*) AS bucket_count
FROM storage.buckets WHERE id IN ('company_logo', 'cover_images');
```

---

## 5. Additional Migrations (SQL)

These are **optional one-time patches**. Only run them if you need the feature.

### 5a. Add `product_limit` column to companies

```sql
-- Only needed if you created the table without product_limit
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS product_limit integer DEFAULT 10;
```

### 5b. Fix Profile Trigger (if users exist but profiles are missing)

```sql
-- Re-run these to ensure the trigger exists
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', new.email), now())
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 6. Order of Execution

Run SQL in this order for each environment:

```
1. Section 3 → Full Database Schema    (complete_setup from above)
2. Section 4 → Storage Buckets         (storage_setup from above)
3. Section 5 → Any extra migrations    (if applicable)
```

✅ Repeat steps 1–3 for **both Staging** and **Production** Supabase projects.

---

## 7. GitHub Secrets Setup

Secrets must be added to your GitHub repository so that the pipelines can access them without exposing the keys in code.

### Step-by-step

1. Go to your **GitHub repository**
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"** and add the following:

### Staging Secrets

| Secret Name                   | Value                                                          |
|-------------------------------|----------------------------------------------------------------|
| `STAGING_SUPABASE_URL`        | `https://gmgrsuynufoycvnqaltj.supabase.co`                    |
| `STAGING_SUPABASE_ANON_KEY`   | *(your existing staging anon key from `.env.staging`)*        |

### Production Secrets (via GitHub Environment)

> For extra security, add these under a **GitHub Environment** named `production`:  
> Settings → Environments → New environment → name it `production`

| Secret Name                 | Value                                                                        |
|-----------------------------|------------------------------------------------------------------------------|
| `PROD_SUPABASE_URL`         | `https://akwycltnkqcrwezqldbt.supabase.co`                                  |
| `PROD_SUPABASE_ANON_KEY`    | `eyJhbGci...` *(the full anon key from `.env.production`)*                  |

### Optional: Deploy target secrets

If deploying to **Netlify**:

| Secret Name              | How to get it                                            |
|--------------------------|----------------------------------------------------------|
| `NETLIFY_AUTH_TOKEN`     | Netlify → User settings → Applications → New token       |
| `NETLIFY_STAGING_SITE_ID`| Netlify → Site settings → General → Site ID (staging)   |
| `NETLIFY_PROD_SITE_ID`   | Netlify → Site settings → General → Site ID (production) |

If deploying to **Vercel**:

| Secret Name           | How to get it                                     |
|-----------------------|---------------------------------------------------|
| `VERCEL_TOKEN`        | Vercel → Settings → Tokens → Create               |
| `VERCEL_ORG_ID`       | Vercel Project → Settings → General → Team ID     |
| `VERCEL_PROJECT_ID`   | Vercel Project → Settings → General → Project ID  |

---

## 8. GitHub Pipeline (CI/CD) Setup

Two workflow files are already created at:

```
.github/
└── workflows/
    ├── deploy-staging.yml     ← triggers on push to 'staging' branch
    └── deploy-production.yml  ← triggers on push to 'main' branch
```

### Branch Strategy

```
main      ──→ Production (Live) pipeline   akwycltnkqcrwezqldbt.supabase.co
staging   ──→ Staging pipeline              gmgrsuynufoycvnqaltj.supabase.co
```

### Activating Deploy Steps

The workflow files build the project automatically. To **also deploy** the `dist/` folder:

1. Open `.github/workflows/deploy-staging.yml`
2. Find the commented-out block for your platform (Netlify **or** Vercel)
3. Uncomment the block and save
4. Push to `staging` branch → pipeline runs automatically

Do the same for `deploy-production.yml` for the `main` branch.

### Workflow Diagram

```
Developer pushes code
         │
         ├─── to 'staging' ──→ deploy-staging.yml ──→ Builds with STAGING secrets
         │                                          ──→ Deploys to Staging URL
         │
         └─── to 'main'    ──→ deploy-production.yml ──→ Builds with PROD secrets
                                                      ──→ Deploys to Live URL
```

---

## 9. Deployment Platforms

### Option A: Netlify (Recommended — free tier works well)

1. Go to [netlify.com](https://netlify.com) → New site from Git
2. Connect your GitHub repository
3. Set **Build command:** `npm run build`
4. Set **Publish directory:** `dist`
5. Add environment variables in Netlify UI:  
   - `VITE_SUPABASE_URL`  
   - `VITE_SUPABASE_ANON_KEY`
6. Create **two Netlify sites** — one for staging, one for production
7. Add site IDs as GitHub Secrets (see Section 7)

### Option B: Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repository
3. Framework preset: **Vite**
4. Add env vars in Vercel dashboard
5. Create **two Vercel projects** for staging and production
6. Add project IDs as GitHub Secrets (see Section 7)

---

## 10. Email / Auth Settings in Supabase

For the **Forgot Password** feature to work, configure the email redirect URL:

1. Go to **Supabase Dashboard → Authentication → URL Configuration**
2. Add these to **Redirect URLs**:
   - Staging: `http://localhost:5173/reset-password` (local dev)
   - Staging: `https://your-staging-site.netlify.app/reset-password`
   - Production: `https://your-live-domain.com/reset-password`
3. Under **Email Templates → Reset Password**, you can customize the email body.

> The app already calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: ... })` in `Login.jsx` — you just need the URL configured in Supabase to whitelist it.

---

## ✅ Checklist

### Staging (do first)
- [ ] Run Section 3 SQL in Staging Supabase SQL Editor
- [ ] Run Section 4 SQL in Staging Supabase SQL Editor  
- [ ] Add Staging secrets to GitHub (`STAGING_SUPABASE_URL`, `STAGING_SUPABASE_ANON_KEY`)
- [ ] Create `staging` branch in GitHub
- [ ] Push code → confirm staging pipeline runs in GitHub Actions
- [ ] Add redirect URL to Staging Supabase Auth settings

### Production (after staging is validated)
- [ ] Run Section 3 SQL in **Production** Supabase SQL Editor
- [ ] Run Section 4 SQL in **Production** Supabase SQL Editor
- [ ] Create `production` environment in GitHub Settings → Environments
- [ ] Add Production secrets to GitHub Environment (`PROD_SUPABASE_URL`, `PROD_SUPABASE_ANON_KEY`)
- [ ] Push to `main` branch → confirm production pipeline runs
- [ ] Add redirect URL to Production Supabase Auth settings
- [ ] Test Forgot Password email on live environment

---

*Generated by Antigravity — Souq Route Admin Panel Setup Guide*
