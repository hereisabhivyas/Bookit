# 🚀 Deployment Action Plan

## Current Status
✅ Backend code deployed to Render (waiting for env vars)
✅ Frontend code ready for Vercel
✅ All secrets removed from GitHub
✅ Code pushed to GitHub

---

## IMMEDIATE ACTION ITEMS (Next 20 minutes)

### [ ] 1. Add Environment Variables to Render
**Time**: 5 minutes

Go to: https://dashboard.render.com

1. Click on **vibe-weaver-api** service
2. Click **Environment** tab
3. Add these 7 variables:
   - MONGO_URL = `mongodb+srv://Brozone:Abhi2006@cluster0.iylfw9m.mongodb.net/vibeweaver?retryWrites=true&w=majority`
   - JWT_SECRET = (generate new: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - RAZORPAY_KEY_ID = `rzp_test_RxJqPFVRR5HJG8`
   - RAZORPAY_KEY_SECRET = `TLoYsB9UoLn1adeflGS7xKhB`
   - API_URL = `https://vibe-weaver-api.onrender.com` (replace with your URL)
   - NODE_ENV = `production`
   - PORT = `10000`

4. Click "Save Changes"
5. Wait 2-5 minutes for restart
6. Check logs for: `✓ MongoDB connected successfully`

**Verify**: Open Render logs, you should see MongoDB connected message

---

### [ ] 2. Deploy User App to Vercel
**Time**: 5 minutes

Go to: https://vercel.com/dashboard

1. Click **"Add New"** → **"Project"**
2. Import GitHub: `https://github.com/hereisabhivyas/Bookit`
3. Set:
   - Root Directory: `vibe-weaver-main`
   - Build Command: `npm run build`
   - Output: `dist`
4. Before clicking Deploy, add env vars:
   - VITE_API_URL = `https://vibe-weaver-api.onrender.com`
   - VITE_SUPABASE_URL = (optional)
   - VITE_SUPABASE_ANON_KEY = (optional)
5. Click **"Deploy"**

**Verify**: URL should be live at `https://vibe-weaver-main.vercel.app`

---

### [ ] 3. Deploy Admin Panel to Vercel
**Time**: 5 minutes

Go to: https://vercel.com/dashboard

1. Click **"Add New"** → **"Project"**
2. Import GitHub: `https://github.com/hereisabhivyas/Bookit` (same repo)
3. Set:
   - Root Directory: `Admin`
   - Build Command: `npm run build`
   - Output: `dist`
4. Before clicking Deploy, add env var:
   - VITE_API_URL = `https://vibe-weaver-api.onrender.com`
5. Click **"Deploy"**

**Verify**: URL should be live at something like `https://admin-bookit.vercel.app`

---

## FINAL STEP (After all 3 deployed)

### [ ] 4. Test Everything
**Time**: 2 minutes

1. Open your user app URL in browser
   - Should load without errors
   - Try clicking around

2. Open your admin app URL in browser
   - Should load without errors
   - Try logging in

3. Check browser console (F12) for any API errors
   - Errors about VITE_API_URL?
   - Verify env vars are set in Vercel

---

## Important URLs to Save

**Render Dashboard**: https://dashboard.render.com
**Vercel Dashboard**: https://vercel.com/dashboard
**GitHub Repo**: https://github.com/hereisabhivyas/Bookit

---

## Success Indicators

When you're done, you'll see:

1. ✅ API at: `https://vibe-weaver-api.onrender.com` (returns data)
2. ✅ User App at: `https://vibe-weaver-main.vercel.app` (loads and works)
3. ✅ Admin App at: `https://admin-bookit.vercel.app` (loads and works)
4. ✅ All three can communicate (no API errors in console)

---

## Estimated Total Time: 20 minutes ⏱️

Most of the time is waiting for services to deploy automatically.

---

**Ready to go live? Follow the action items above!** 🎉
