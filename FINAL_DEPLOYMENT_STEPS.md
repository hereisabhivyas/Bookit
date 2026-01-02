# Complete Deployment Guide - Quick Reference

## ✅ What You've Done
- [x] Removed sensitive credentials from GitHub
- [x] Fixed MongoDB connection error handling
- [x] Code is pushed to GitHub at: https://github.com/hereisabhivyas/Bookit

## 🚀 What's Next (4 Steps to Live)

---

## STEP 1: Verify Render Backend is Running ✓

**Status**: Your backend code is deployed to Render

**Action Required**: Add environment variables to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your **vibe-weaver-api** service
3. Click **"Environment"** tab
4. Add these 7 variables:

```
MONGO_URL = mongodb+srv://Brozone:Abhi2006@cluster0.iylfw9m.mongodb.net/vibeweaver?retryWrites=true&w=majority
JWT_SECRET = (generate a new one - run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
RAZORPAY_KEY_ID = rzp_test_RxJqPFVRR5HJG8
RAZORPAY_KEY_SECRET = TLoYsB9UoLn1adeflGS7xKhB
API_URL = https://vibe-weaver-api.onrender.com (replace with your actual Render URL)
NODE_ENV = production
PORT = 10000
```

5. Click **"Save Changes"** (this will restart the service)
6. Wait 2-5 minutes for the service to restart
7. Check logs - you should see: `✓ MongoDB connected successfully`

**Expected Render URL**: `https://vibe-weaver-api.onrender.com`

---

## STEP 2: Deploy User App to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repo: `https://github.com/hereisabhivyas/Bookit`
4. Configure:
   - **Framework**: Vite
   - **Root Directory**: `vibe-weaver-main`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **"Deploy"** to proceed
6. Add Environment Variables (before deployment completes):
   ```
   VITE_API_URL = https://vibe-weaver-api.onrender.com (use your Render URL)
   VITE_SUPABASE_URL = (your supabase URL if you have one)
   VITE_SUPABASE_ANON_KEY = (your supabase anon key if you have one)
   ```
7. Click **"Deploy"**

**Expected URL**: `https://vibe-weaver-main.vercel.app` (or custom name)

---

## STEP 3: Deploy Admin Panel to Vercel

1. In [Vercel Dashboard](https://vercel.com/dashboard), click **"Add New"** → **"Project"**
2. Import the **same** GitHub repo
3. Configure:
   - **Framework**: Vite
   - **Root Directory**: `Admin`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **"Deploy"** to proceed
5. Add Environment Variable:
   ```
   VITE_API_URL = https://vibe-weaver-api.onrender.com
   ```
6. Click **"Deploy"**

**Expected URL**: `https://admin-bookit.vercel.app` (or custom name)

---

## STEP 4: Update CORS Settings (Optional but Recommended)

Once you have your Vercel URLs, update the backend to allow them:

1. Update `api/index.js` line ~128 with your Vercel URLs:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://your-user-app.vercel.app',
  'https://your-admin-app.vercel.app'
];
```

2. Commit and push: 
```bash
git add api/index.js
git commit -m "Update CORS for production Vercel URLs"
git push origin main
```

3. Render will auto-deploy with new CORS settings

---

## 📋 Deployment Summary

When complete, you'll have:

| Service | Type | URL |
|---------|------|-----|
| **API** | Backend (Node.js) | `https://vibe-weaver-api.onrender.com` |
| **User App** | Frontend (React) | `https://vibe-weaver-main.vercel.app` |
| **Admin Panel** | Frontend (React) | `https://admin-bookit.vercel.app` |
| **Database** | MongoDB Atlas | `cluster0.iylfw9m.mongodb.net` |

---

## 🧪 Test Your Deployment

Once all 3 apps are deployed:

1. **Test User App**: Visit your Vercel user app URL
   - Should load without errors
   - Should be able to navigate

2. **Test Admin Panel**: Visit your Vercel admin app URL
   - Should load without errors
   - Should be able to log in

3. **Test API Connection**: In browser console on either app, check:
   ```javascript
   fetch('https://vibe-weaver-api.onrender.com/').then(r => r.json()).then(console.log)
   ```
   - Should return API response (not CORS error)

---

## ⚠️ Troubleshooting

### Frontend shows API errors?
- [ ] Check VITE_API_URL is correct in Vercel
- [ ] Check MongoDB is connected in Render logs
- [ ] Check CORS settings in api/index.js

### MongoDB still not connecting?
- [ ] Verify MONGO_URL in Render env vars
- [ ] Verify IP whitelist in MongoDB Atlas (0.0.0.0/0)
- [ ] Check connection string includes database name: `/vibeweaver`

### Render service keeps crashing?
- [ ] Check all required env vars are set
- [ ] Check Render logs for specific errors
- [ ] Verify Node.js version is 18+

---

## 💾 Save These URLs

Once deployed, save these for future reference:

- **API URL**: ___________________________________
- **User App URL**: ___________________________________
- **Admin App URL**: ___________________________________
- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repo**: https://github.com/hereisabhivyas/Bookit

---

## 🎉 You're Almost There!

The hard part is done! Just complete these 4 steps and your app will be live for the world to see.

**Estimated time**: 15-20 minutes total

---

## Need Help?
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Docs: https://docs.mongodb.com/atlas/
