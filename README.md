
# Business Admin Panel

A modern, responsive admin panel built with React + Vite and Supabase.

## Features

- **Dashboard**: Overview of company stats and recent leads.
- **Company Profile**: Manage business details, location, and branding.
- **Products**: Manage product catalog with master product dropdown.
- **Leads**: View and filter customer inquiries.
- **Authentication**: Secure login via Supabase Auth (Email + Password).
- **Security**: Row Level Security (RLS) ensures users only access their own data.

## Setup Instructions

### 1. Database Setup (Supabase)

1.  Create a new Supabase project.
2.  Go to the **SQL Editor** in your Supabase dashboard.
3.  Copy the content of `supabase/schema.sql` (located in this project) and run it. This will create all tables and policies.
4.  Go to **Storage** and create a new public bucket named `company-assets`.

### 2. Environment Variables

1.  Copy `.env.example` to `.env`:
    ```bash
    cp .env.example .env
    ```
2.  Fill in your Supabase URL and Anon Key from your project settings.

### 3. Run the App

```bash
cd admin-panel
npm install
npm run dev
```

## User Flow

1.  **Super Admin**: Manually create a user in Supabase Auth -> Users.
2.  **Business Owner**: Log in to the admin panel with the created credentials.
3.  **First Time**: Go to "Company Profile" and fill in the details. This creates the company record linked to your user.
4.  **Add Products**: Go to "Products" and add items to your catalog.
5.  **View Leads**: Monitor incoming leads on the "Leads" page or Dashboard.

## Tech Stack

- **Frontend**: React, Vite, Lucide Icons
- **Styling**: Vanilla CSS (Modern Design System with CSS Variables)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
