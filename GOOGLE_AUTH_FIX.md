# 🔧 Google OAuth Not Working - Fix Guide

## Problem
Google authentication is not working in your BookIt application.

## Root Cause Analysis

Your code is **correctly implemented**, but Google OAuth requires proper configuration in Google Cloud Console. The issue is likely one or more of the following:

### 1. **Missing Authorized JavaScript Origins**
Google OAuth requires you to whitelist the domains that can initiate OAuth requests.

### 2. **Missing Authorized Redirect URIs** 
Google needs to know where to redirect users after authentication.

### 3. **OAuth Consent Screen Not Published**
If the consent screen is in testing mode, only test users can authenticate.

---

## ✅ Step-by-Step Fix

### Step 1: Go to Google Cloud Console

1. Visit: https://console.cloud.google.com
2. Select your project (or create one if you haven't)
3. Go to **APIs & Services** → **Credentials**

### Step 2: Configure OAuth Client ID

1. Find your OAuth 2.0 Client ID: `214617912712-octfprnlbi17eagsn49hb726anbs7ife.apps.googleusercontent.com`
2. Click on it to edit

### Step 3: Add Authorized JavaScript Origins

Add these URIs in the **Authorized JavaScript origins** section:

**For Local Development:**
```
http://localhost:5173
http://localhost:4173
http://127.0.0.1:5173
```

**For Production:**
```
https://bookit-cyan.vercel.app
```

### Step 4: Add Authorized Redirect URIs

Add these URIs in the **Authorized redirect URIs** section:

**For Local Development:**
```
http://localhost:5173
http://localhost:4173
http://127.0.0.1:5173
```

**For Production:**
```
https://bookit-cyan.vercel.app
```

**Important:** Do NOT add `/callback` or any path - just the base URLs.

### Step 5: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. If it's in "Testing" mode:
   - Option A: Add your email as a test user
   - Option B: **Publish the app** (recommended for production)
3. Fill in required fields:
   - App name: BookIt
   - User support email: your email
   - Developer contact: your email
4. Save and continue

### Step 6: Verify Scopes

Make sure these scopes are included:
- `userinfo.email`
- `userinfo.profile`
- `openid`

These should be added automatically, but verify in the OAuth consent screen.

---

## 🧪 Testing After Configuration

### 1. Wait for Propagation
After making changes in Google Cloud Console, wait **5-10 minutes** for changes to propagate.

### 2. Clear Browser Cache
```
1. Open DevTools (F12)
2. Right-click refresh button → "Empty Cache and Hard Reload"
3. Or use Incognito/Private mode
```

### 3. Test Locally

```bash
cd vibe-weaver-main
npm run dev
```

1. Navigate to http://localhost:5173/auth
2. Click "Google" button
3. You should see Google login popup
4. Sign in with your Google account
5. Check browser console for any errors

### 4. Common Error Messages

**Error: "redirect_uri_mismatch"**
- ✅ Fix: Add the exact URL to Authorized redirect URIs in Google Console

**Error: "invalid_client"**
- ✅ Fix: Verify VITE_GOOGLE_CLIENT_ID in .env matches Google Console

**Error: "access_denied"**
- ✅ Fix: Add your email as a test user OR publish the OAuth app

**Error: "idpiframe_initialization_failed"**
- ✅ Fix: Check that cookies are enabled and not blocked by browser

---

## 📝 Current Configuration Status

### ✅ Code Implementation - CORRECT
Your implementation in `Auth.tsx` is correct:
- Using `@react-oauth/google` library ✓
- GoogleOAuthProvider wrapper in `main.tsx` ✓
- useGoogleLogin hook properly configured ✓
- Backend endpoint `/auth/google` exists ✓

### ✅ Environment Variables - CONFIGURED
```env
VITE_GOOGLE_CLIENT_ID=214617912712-octfprnlbi17eagsn49hb726anbs7ife.apps.googleusercontent.com
```

### ⚠️ Google Cloud Console - NEEDS CONFIGURATION
This is what you need to fix (see steps above).

---

## 🔍 Debugging Tips

### Check Browser Console
Open DevTools (F12) and look for errors like:
```
Failed to load resource: the server responded with a status of 400 (Bad Request)
Error: redirect_uri_mismatch
```

### Check Network Tab
1. Open DevTools → Network tab
2. Click Google login button
3. Look for failed requests
4. Check the error response

### Test Backend Endpoint
```bash
curl -X POST https://bookit-dijk.onrender.com/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token":"test"}'
```

Expected: Should return error about invalid token (this confirms endpoint works)

---

## 📋 Configuration Checklist

Before testing, ensure:

- [ ] Google Cloud Console project created
- [ ] OAuth 2.0 Client ID created
- [ ] Client ID matches your .env file
- [ ] Authorized JavaScript origins added (local + production)
- [ ] Authorized redirect URIs added (local + production)
- [ ] OAuth consent screen configured
- [ ] App published OR test users added
- [ ] Required scopes added (email, profile, openid)
- [ ] Waited 5-10 minutes for propagation
- [ ] Browser cache cleared
- [ ] Environment variables set in Vercel (for production)

---

## 🌐 For Production (Vercel)

After deploying to Vercel, make sure:

1. **Environment Variable Set in Vercel:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add: `VITE_GOOGLE_CLIENT_ID=214617912712-octfprnlbi17eagsn49hb726anbs7ife.apps.googleusercontent.com`
   - Apply to: Production, Preview, Development

2. **Google Console Updated:**
   - Add `https://bookit-cyan.vercel.app` to Authorized JavaScript origins
   - Add `https://bookit-cyan.vercel.app` to Authorized redirect URIs

3. **Redeploy Vercel:**
   - After adding environment variables, redeploy the app

---

## 🆘 Still Not Working?

If you've completed all steps and it's still not working:

1. **Verify Client ID:**
   ```bash
   # In browser console on your auth page:
   console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID)
   ```
   Should print: `214617912712-octfprnlbi17eagsn49hb726anbs7ife.apps.googleusercontent.com`

2. **Check Google Console Logs:**
   - Go to Google Cloud Console → Logging
   - Filter by OAuth errors

3. **Try Creating New Credentials:**
   - Sometimes starting fresh helps
   - Create new OAuth 2.0 Client ID
   - Update .env with new Client ID

4. **Verify Backend is Accessible:**
   ```bash
   curl https://bookit-dijk.onrender.com/auth/google -v
   ```

---

## 📞 Support Links

- **Google OAuth 2.0 Setup:** https://developers.google.com/identity/protocols/oauth2
- **@react-oauth/google Docs:** https://www.npmjs.com/package/@react-oauth/google
- **Common Errors:** https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#error-codes

---

**Last Updated:** January 8, 2026  
**Status:** Configuration Required in Google Cloud Console
