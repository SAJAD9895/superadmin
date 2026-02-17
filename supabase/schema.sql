-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Business Users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  mobile_number text,
  created_at timestamp with time zone default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- 2. COMPANIES
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,

  company_name text,
  company_description text,
  year_established date,
  company_type text,

  country text,
  city text,
  complete_address text,
  google_map_location text,

  phone text,
  whatsapp_mobile text,
  contact_email text,
  website text,

  main_category text,
  sub_category text,

  listing_type text default 'Regular',
  logo_url text,
  cover_image_url text,

  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on companies
alter table public.companies enable row level security;

-- Policy: Users can only access their own company data
create policy "Users can view own company"
  on public.companies for select
  using ( auth.uid() = user_id );

create policy "Users can insert own company"
  on public.companies for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own company"
  on public.companies for update
  using ( auth.uid() = user_id );

create policy "Users can delete own company"
  on public.companies for delete
  using ( auth.uid() = user_id );

-- 3. MASTER_PRODUCTS (Dropdown Source)
create table public.master_products (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamp with time zone default now()
);

-- Note: Master products might need to be readable by authenticated users
alter table public.master_products enable row level security;

create policy "Authenticated users can view master products"
  on public.master_products for select
  to authenticated
  using ( true );

create policy "Authenticated users can insert master products"
  on public.master_products for insert
  to authenticated
  with check ( true );

-- 4. PRODUCTS (Company Products)
create table public.products (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  master_product_id uuid references public.master_products(id),
  product_description text,
  created_at timestamp with time zone default now()
);

-- Enable RLS on products
alter table public.products enable row level security;

-- Policy: Users can only access products via their company
create policy "Users can view own company products"
  on public.products for select
  using ( exists (
    select 1 from public.companies
    where companies.id = products.company_id
    and companies.user_id = auth.uid()
  ));

create policy "Users can insert own company products"
  on public.products for insert
  with check ( exists (
    select 1 from public.companies
    where companies.id = products.company_id
    and companies.user_id = auth.uid()
  ));

create policy "Users can update own company products"
  on public.products for update
  using ( exists (
    select 1 from public.companies
    where companies.id = products.company_id
    and companies.user_id = auth.uid()
  ));

create policy "Users can delete own company products"
  on public.products for delete
  using ( exists (
    select 1 from public.companies
    where companies.id = products.company_id
    and companies.user_id = auth.uid()
  ));

-- 5. COMPANY_LEADS
create table public.company_leads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,

  customer_name text,
  customer_email text,
  customer_phone text,
  message text,

  master_product_id uuid references public.master_products(id),
  created_at timestamp with time zone default now()
);

-- Enable RLS on company_leads
alter table public.company_leads enable row level security;

-- Policy: Users can only access company_leads for their company
create policy "Users can view own company leads"
  on public.company_leads for select
  using ( exists (
    select 1 from public.companies
    where companies.id = company_leads.company_id
    and companies.user_id = auth.uid()
  ));

-- Note: Company_leads insertion usually comes from public/anonymous users (the website visitors)
-- Use a separate policy or function for public insertion if needed, but for Admin Panel usage:
create policy "Users can delete own company leads"
  on public.company_leads for delete
  using ( exists (
    select 1 from public.companies
    where companies.id = company_leads.company_id
    and companies.user_id = auth.uid()
  ));


-- 6. Trigger for auto-creating profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, created_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 7. Trigger for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger companies_updated_at
before update on public.companies
for each row execute procedure public.handle_updated_at();

-- 7. Storage Bucket Setup (Instructions)
-- Go to Storage -> Create new bucket 'company-assets'
-- Set to Public
-- Add Policy: "Authenticated users can upload" -> bucket_id = 'company-assets' AND auth.role() = 'authenticated'
-- Add Policy: "Users can update/delete own assets" -> (storage.foldername(name))[1] = auth.uid()::text
