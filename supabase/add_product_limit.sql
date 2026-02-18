-- Add product_limit column to companies table
-- This allows the master admin to set a custom product limit per company
-- Default is 10 products per company

ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS product_limit integer DEFAULT 10;

-- To update a specific company's limit (run from master admin):
-- UPDATE public.companies SET product_limit = 20 WHERE id = '<company_uuid>';

-- To verify:
-- SELECT id, company_name, product_limit FROM public.companies;
