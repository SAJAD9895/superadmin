# 🟡 Staging Setup Guide — Vercel + GitHub Branch

> You have a `staging` branch created. Follow these steps to connect it to your **existing Vercel staging project** so every push to `staging` auto-deploys.

---

## Overview — How It Works

```
You push code to 'staging' branch
        ↓
GitHub Actions runs deploy-staging.yml
        ↓
Builds with Staging Supabase credentials
        ↓
Deploys to your Vercel Staging project URL
```

---

## PART A — Vercel Staging Project Settings

### Step 1 — Open Your Existing Staging Vercel Project

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your **existing staging project** (the one already working)

---

### Step 2 — Change the Production Branch to `staging`

> ⚠️ By default Vercel auto-deploys `main`. You need to tell it to use `staging` instead.

1. Inside your staging Vercel project → click **Settings**
2. Click **Git** (left sidebar)
3. Under **"Production Branch"** → change it from `main` to **`staging`**
4. Click **Save**

Now Vercel will treat your `staging` branch as the live branch for this project.

---

### Step 3 — Set Environment Variables in Vercel (Staging Project)

1. Still inside your staging Vercel project → **Settings → Environment Variables**
2. Make sure these 3 variables exist (add or update them):

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://gmgrsuynufoycvnqaltj.supabase.co` | ✅ Production + Preview + Development |
| `VITE_SUPABASE_ANON_KEY` | *(your staging anon key — from `.env.staging`)* | ✅ Production + Preview + Development |
| `VITE_APP_ENV` | `staging` | ✅ Production + Preview + Development |

> ✅ Check all 3 environment checkboxes (Production, Preview, Development) so they work in all deploy types.

---

### Step 4 — Disable Vercel Auto-Deploy from GitHub (Prevent Double Deploys)

Since GitHub Actions will handle the deploy, you should turn off Vercel's own GitHub auto-deploy to avoid it running twice.

1. Staging Vercel project → **Settings → Git**
2. Scroll to **"Ignored Build Step"**
3. Enter this command so Vercel skips its own build when GitHub Actions deploys:
   ```
   echo "Skipping Vercel auto-build — GitHub Actions handles deploys"
   exit 0
   ```
   > **OR** — the simplest option: just leave Vercel auto-deploy ON for now. It will deploy from `staging` branch independently. You can remove the GitHub Actions deploy step later if you prefer Vercel's native auto-deploy (simpler, no secrets needed).

---

## PART B — GitHub Secrets Setup

Go to: **GitHub Repo → Settings → Secrets and variables → Actions**

Add these secrets (if not already added):

| Secret Name | Value |
|-------------|-------|
| `VERCEL_TOKEN` | *(Vercel → Settings → Tokens → Create → Full Account)* |
| `VERCEL_ORG_ID` | *(Vercel → Settings → General → scroll to "Your ID" or "Team ID")* |
| `VERCEL_PROJECT_ID_STAGING` | *(Your staging Vercel project → Settings → General → Project ID)* |
| `STAGING_SUPABASE_URL` | `https://gmgrsuynufoycvnqaltj.supabase.co` |
| `STAGING_SUPABASE_ANON_KEY` | *(your staging anon key)* |

### How to find your Staging Project ID

1. Go to your staging Vercel project
2. **Settings → General**
3. Scroll down to **"Project ID"** → copy it

---

## PART C — Push to `staging` Branch & Test

### Step 1 — Make sure the staging branch is pushed to GitHub

```bash
# If you just created the branch locally:
git checkout staging
git push -u origin staging
```

### Step 2 — Trigger a deploy (from your laptop)

```bash
git checkout staging

# Make a small change to test
echo "# staging test" >> README.md

git add .
git commit -m "test: trigger staging pipeline"
git push origin staging
```

### Step 3 — Watch the pipeline

1. Go to **GitHub → your repo → Actions tab**
2. You should see **"🚀 Deploy — Staging"** running
3. Wait for it to go ✅ green
4. Open your staging Vercel URL — it should be live!

---

## PART D — Recommended Simple Alternative (Skip GitHub Actions for Staging)

If you want the simplest possible setup, **use Vercel's built-in Git integration** for staging (no GitHub Secrets needed):

1. Vercel staging project → **Settings → Git → Production Branch = `staging`**
2. Every push to `staging` → Vercel auto-builds and deploys ✅
3. Use GitHub Actions **only for production** (`main` branch)

This works great because:
- Staging = Vercel auto-deploy (simple, instant)
- Production = GitHub Actions (controlled, with secrets + environment gates)

---

## Summary — Two Projects, Two Branches

| | Staging | Production |
|---|---------|------------|
| **Branch** | `staging` | `main` |
| **Vercel Project** | `souqroute-admin-staging` (existing) | `souqroute-admin-prod` (new) |
| **Supabase Project** | `gmgrsuynufoycvnqaltj` | `akwycltnkqcrwezqldbt` |
| **Deploy trigger** | Push to `staging` | Push to `main` |
| **Supabase URL var** | `https://gmgrsuynufoycvnqaltj.supabase.co` | `https://akwycltnkqcrwezqldbt.supabase.co` |

---

## ✅ Checklist

- [ ] Vercel staging project → Settings → Git → Production Branch = `staging`
- [ ] Vercel staging project → Settings → Env Vars → 3 vars added (staging Supabase)
- [ ] GitHub secret `VERCEL_PROJECT_ID_STAGING` added
- [ ] GitHub secret `STAGING_SUPABASE_URL` added
- [ ] GitHub secret `STAGING_SUPABASE_ANON_KEY` added
- [ ] `VERCEL_TOKEN` and `VERCEL_ORG_ID` added (shared with prod)
- [ ] Push to `staging` branch → GitHub Actions pipeline runs ✅
- [ ] Staging URL shows data from staging Supabase ✅

---

*Souq Route Admin Panel — Staging Deployment Guide*
