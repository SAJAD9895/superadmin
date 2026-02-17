-- ============================================
-- MIGRATION: Rename 'leads' table to 'company_leads'
-- ============================================
-- Run this ONLY if you already have a 'leads' table in your database
-- This will preserve all existing data

-- Step 1: Rename the table
ALTER TABLE IF EXISTS public.leads RENAME TO company_leads;

-- Step 2: Drop old policies (they reference the old table name)
DROP POLICY IF EXISTS "Users can view own company leads" ON public.company_leads;
DROP POLICY IF EXISTS "Users can delete own company leads" ON public.company_leads;
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.company_leads;

-- Step 3: Recreate policies with correct table name
CREATE POLICY "Users can view own company leads"
  ON public.company_leads FOR SELECT
  USING ( EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = company_leads.company_id
    AND companies.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own company leads"
  ON public.company_leads FOR DELETE
  USING ( EXISTS (
    SELECT 1 FROM public.companies
    WHERE companies.id = company_leads.company_id
    AND companies.user_id = auth.uid()
  ));

-- Optional: Allow public/anonymous users to insert leads (for website forms)
CREATE POLICY "Anyone can insert company leads"
  ON public.company_leads FOR INSERT
  WITH CHECK ( true );

-- Verify the migration
SELECT 'Migration completed successfully!' AS status;
SELECT COUNT(*) AS total_company_leads FROM public.company_leads;
