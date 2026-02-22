# 🚀 Production Hosting Setup — Vercel

> Since staging is already live on Vercel, follow these steps to create a **separate Production project** on Vercel pointing to your live Supabase.

---

## Step 1 — Create a New Vercel Project for Production

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Add New Project"**
3. Import the **same GitHub repository** (the one staging uses)
4. Give it a different name — e.g. `souqroute-admin-prod`
5. **Framework Preset** → select **Vite**
6. **Root Directory** → leave as `/` (or set to your project root)
7. **DO NOT deploy yet** → continue to Step 2 first

---

## Step 2 — Add Environment Variables in Vercel

In the Vercel project setup page, scroll to **"Environment Variables"** and add:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://akwycltnkqcrwezqldbt.supabase.co` | ✅ Production |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrd3ljbHRua3FjcndlenFsZGJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NDYxMTYsImV4cCI6MjA4NzMyMjExNn0.pzsSNA1e7MjV9JTHs4k4IuubNWisRc0R5rMIeC4E7sY` | ✅ Production |
| `VITE_APP_ENV` | `production` | ✅ Production |

> ⚠️ Make sure you select **"Production"** checkbox only (not Preview or Development).

---

## Step 3 — Set the Deploy Branch to `main`

In Vercel project settings:

1. Go to **Settings → Git**
2. **Production Branch** → set to `main`

This means only pushes to `main` will deploy to production.

---

## Step 4 — Deploy

Click **"Deploy"** in Vercel.  
Vercel will:
- Pull your code from the `main` branch
- Install dependencies (`npm ci`)
- Build with your production env vars
- Deploy to a live URL like `https://souqroute-admin-prod.vercel.app`

---

## Step 5 — Get Your Vercel Project IDs (for GitHub Actions)

After the project is created, grab these values for GitHub Secrets:

### Get Project ID
1. Vercel Dashboard → your **production project**
2. Go to **Settings → General**
3. Copy **Project ID**

### Get Team / Org ID
1. Vercel Dashboard → **Settings** (top-left account settings)
2. Copy **Team ID** (called "ID" under your team name)

> If you're on a personal account (not a team), the Org ID = your personal account ID. You can find it by running `vercel whoami --token=YOUR_TOKEN` or checking your account settings.

### Get Token
1. Vercel Dashboard → **Settings → Tokens**
2. Click **"Create Token"**
3. Name it `github-actions`
4. Scope: **Full Account**
5. Copy the token — **you only see it once**

---

## Step 6 — Add GitHub Secrets

Go to your **GitHub Repository → Settings → Secrets and variables → Actions → New repository secret** and add:

| Secret Name | Value |
|-------------|-------|
| `VERCEL_TOKEN` | *(token from Step 5)* |
| `VERCEL_ORG_ID` | *(Team/Account ID from Step 5)* |
| `VERCEL_PROJECT_ID_PROD` | *(Production project ID from Step 5)* |
| `VERCEL_PROJECT_ID_STAGING` | *(your existing staging project ID)* |
| `PROD_SUPABASE_URL` | `https://akwycltnkqcrwezqldbt.supabase.co` |
| `PROD_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` *(full key)* |
| `STAGING_SUPABASE_URL` | `https://gmgrsuynufoycvnqaltj.supabase.co` |
| `STAGING_SUPABASE_ANON_KEY` | *(your existing staging anon key)* |

---

## Step 7 — Create a `production` Environment in GitHub (Optional but Recommended)

This adds a protection layer before anything deploys to prod.

1. **GitHub → Settings → Environments → New environment**
2. Name it: `production`
3. Add **Required reviewers** (yourself) if you want manual approval before deploy
4. Move the `PROD_SUPABASE_URL` and `PROD_SUPABASE_ANON_KEY` secrets here instead of repository-level

---

## Step 8 — Test the Pipeline

1. Make a small change (e.g. update a comment in `App.jsx`)
2. Push to `main`:
```bash
git add .
git commit -m "test: trigger production pipeline"
git push origin main
```
3. Go to **GitHub → Actions** tab → watch the `🚀 Deploy — Production (Live)` workflow run
4. When it completes, open your Vercel production URL — it should be live with the new Supabase!

---

## Vercel Environment Summary

| Vercel Project | Branch | Supabase |
|---------------|--------|----------|
| `souqroute-admin-staging` (existing) | `staging` | `gmgrsuynufoycvnqaltj` |
| `souqroute-admin-prod` (new) | `main` | `akwycltnkqcrwezqldbt` (LIVE) |

---

## ✅ Checklist

- [ ] Create new Vercel project for production
- [ ] Add 3 env vars in Vercel project (URL, ANON_KEY, APP_ENV)
- [ ] Set production branch to `main` in Vercel settings
- [ ] Get Vercel Token, Org ID, and Production Project ID
- [ ] Add all 8 GitHub Secrets (Step 6)
- [ ] Run database SQL on Production Supabase (see `DATABASE_SETUP.md` Section 3 & 4)
- [ ] Add redirect URL to Production Supabase Auth settings
- [ ] Push to `main` and confirm GitHub Actions pipeline succeeds
- [ ] Verify production URL shows correct data from live Supabase

---

*Souq Route Admin Panel — Production Deployment Guide*
