# 📧 Supabase Email Template Setup Guide
# Souq Route Admin Panel — Reset Password Email

---

## ⚠️ PART 0 — Fix OTP Expired Error (Do This First!)

If you see `otp_expired` in the reset link URL, the token lifetime is too short.

### Steps (do for BOTH Supabase projects):
1. Go to Supabase Dashboard → **Authentication → Settings** (or URL Configuration)
2. Scroll to **"Email OTP Expiry"** (or "Token Expiry" / "JWT Expiry")
3. Set it to: **`86400`** seconds = 24 hours (default is often 3600 = 1 hour)
4. Click **Save**

### Staging:
https://supabase.com/dashboard/project/gmgrsuynufoycvnqaltj/settings/auth

### Production:
https://supabase.com/dashboard/project/akwycltnkqcrwezqldbt/settings/auth

> Look for **"Email OTP Expiry"** field → change to `86400` → Save

---

## PART 1 — Supabase Auth URL Configuration

You MUST whitelist your custom domains in Supabase Auth settings.

### Steps for STAGING Supabase project:
1. Go to: https://supabase.com/dashboard/project/gmgrsuynufoycvnqaltj/auth/url-configuration
2. Under **"Site URL"** → set to: `https://staging.company.souqroute.com`
3. Under **"Redirect URLs"** → click Add and add ALL of these:
   ```
   https://staging.company.souqroute.com/reset-password
   https://staging.company.souqroute.com/**
   http://localhost:5173/reset-password
   http://localhost:5173/**
   ```
4. Click **Save**

### Steps for PRODUCTION Supabase project:
1. Go to: https://supabase.com/dashboard/project/akwycltnkqcrwezqldbt/auth/url-configuration
2. Under **"Site URL"** → set to: `https://company.souqroute.com`
3. Under **"Redirect URLs"** → click Add and add ALL of these:
   ```
   https://company.souqroute.com/reset-password
   https://company.souqroute.com/**
   ```
4. Click **Save**

---

## PART 2 — Fix Spam Issue with Resend.com

The email goes to spam because of missing DNS records or sender configuration.

### Check these in Resend.com dashboard:

1. **Domain Verification** — Go to Resend → Domains
   - Make sure your domain `souqroute.com` shows ✅ verified
   - If not verified — add the DNS records Resend shows (SPF, DKIM, DMARC)

2. **Required DNS Records** — Add these to your domain registrar (GoDaddy / Namecheap etc):

   **SPF Record** (TXT record on `souqroute.com`):
   ```
   v=spf1 include:_spf.resend.com ~all
   ```

   **DKIM Record** (TXT record — Resend gives you the exact key):
   ```
   Name:  resend._domainkey.souqroute.com
   Value: (copy from Resend dashboard)
   ```

   **DMARC Record** (TXT record):
   ```
   Name:  _dmarc.souqroute.com
   Value: v=DMARC1; p=none; rua=mailto:admin@souqroute.com;
   ```

3. **Use a real "From" address** in Supabase SMTP settings:
   - Use: `noreply@souqroute.com` or `admin@souqroute.com`
   - NOT a free Gmail/Yahoo address

4. **Supabase SMTP config** (if using Resend SMTP):
   - Host: `smtp.resend.com`
   - Port: `465` (SSL) or `587` (TLS)
   - Username: `resend`
   - Password: your Resend API key
   - Sender: `noreply@souqroute.com`

---

## PART 3 — Reset Password Email Template (HTML)

### Where to add this:
1. Supabase Dashboard → Authentication → Email Templates → **Reset Password**
2. Replace the entire content with the HTML below

### For STAGING project:
https://supabase.com/dashboard/project/gmgrsuynufoycvnqaltj/auth/templates

### For PRODUCTION project:
https://supabase.com/dashboard/project/akwycltnkqcrwezqldbt/auth/templates

---

### STAGING — Reset Password Email Template:

**Subject line:**
```
Reset your Souq Route password
```

**Body (HTML) — copy everything below:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background:#0f1117;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#1a1d27;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">

          <!-- Header with gradient -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1d27 0%,#0f1117 100%);padding:36px 40px 28px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06);">
              <img
                src="https://staging.company.souqroute.com/images/Souq_Route_white_red.png"
                alt="Souq Route"
                width="160"
                style="display:block;margin:0 auto 16px;"
              />
              <p style="margin:0;color:rgba(255,255,255,0.4);font-size:13px;letter-spacing:2px;text-transform:uppercase;">Admin Panel</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">

              <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#ffffff;line-height:1.3;">
                Reset your password
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:rgba(255,255,255,0.6);line-height:1.6;">
                We received a request to reset the password for your <strong style="color:#fff;">Souq Route</strong> admin account.
                Click the button below to set a new password.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 32px;">
                    <a
                      href="{{ .ConfirmationURL }}"
                      style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#e8b86d,#c9973a);color:#0f1117;font-size:15px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.3px;"
                    >
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid rgba(255,255,255,0.07);margin:0 0 28px;" />

              <!-- Fallback link -->
              <p style="margin:0 0 8px;font-size:13px;color:rgba(255,255,255,0.4);">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 28px;font-size:12px;word-break:break-all;">
                <a href="{{ .ConfirmationURL }}" style="color:#e8b86d;text-decoration:underline;">
                  {{ .ConfirmationURL }}
                </a>
              </p>

              <!-- Warning notice -->
              <div style="background:rgba(232,184,109,0.08);border:1px solid rgba(232,184,109,0.2);border-radius:10px;padding:16px;">
                <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.5);line-height:1.6;">
                  ⏱️ This link expires in <strong style="color:rgba(255,255,255,0.7);">1 hour</strong>.<br/>
                  🔒 If you didn't request this, you can safely ignore this email — your password won't change.
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:rgba(255,255,255,0.25);">
                © 2026 Souq Route. All rights reserved.
              </p>
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.2);">
                Souq Route B2B Marketplace · Saudi Arabia
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
```

---

### PRODUCTION — Reset Password Email Template:

**Same HTML as above** but replace the logo src URL with:
```
https://company.souqroute.com/images/Souq_Route_white_red.png
```

---

## PART 4 — Verification Checklist

After applying everything above:

- [ ] Staging Supabase → Site URL = `https://staging.company.souqroute.com`
- [ ] Staging Supabase → Redirect URLs includes `https://staging.company.souqroute.com/reset-password`
- [ ] Production Supabase → Site URL = `https://company.souqroute.com`
- [ ] Production Supabase → Redirect URLs includes `https://company.souqroute.com/reset-password`
- [ ] Resend domain `souqroute.com` is verified (SPF + DKIM + DMARC DNS records added)
- [ ] Supabase SMTP sender email uses `@souqroute.com` (not Gmail/Hotmail)
- [ ] Email template updated in both Supabase projects
- [ ] Test: request password reset → email arrives in inbox (not spam) → click link → lands on `/reset-password` → form appears → submit → redirects to `/login`
