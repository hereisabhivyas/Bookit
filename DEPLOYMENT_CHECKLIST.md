# 📋 Deployment Checklist - BookIt Platform

**Deployment URLs**:
- Backend API: https://bookit-dijk.onrender.com
- User App: https://bookit-cyan.vercel.app/
- Admin App: https://bookitadmin.vercel.app/

---

## ✅ Pre-Deployment (Complete First)

### Verification
- [ ] Run `node verify-deployment.mjs` - all checks pass ✅
- [ ] Run `node generate-secrets.mjs` - JWT secret generated
- [ ] All deployment docs reviewed (README.md, DEPLOYMENT_SUMMARY.md)

### Accounts Ready
- [ ] MongoDB Atlas account created
- [ ] Render account created
- [ ] Vercel account created (will use for 2 projects)
- [ ] Cloudinary account created
- [ ] Razorpay account created
- [ ] Google Cloud Console project created

### Credentials Obtained
- [ ] MongoDB connection string
- [ ] JWT secret (from generate-secrets.mjs)
- [ ] Razorpay production keys
- [ ] Cloudinary API credentials
- [ ] Google OAuth client ID & secret

---

## 🚀 Backend Deployment (Render) - Do This First

### Create Service
- [ ] Go to https://render.com → New Web Service
- [ ] Connect GitHub repository
- [ ] Root directory: `api`
- [ ] Build: `npm install`
- [ ] Start: `node index.js`

### Add Environment Variables
- [ ] MONGO_URL
- [ ] JWT_SECRET
- [ ] RAZORPAY_KEY_ID
- [ ] RAZORPAY_KEY_SECRET
- [ ] CLOUDINARY_CLOUD_NAME
- [ ] CLOUDINARY_API_KEY
- [ ] CLOUDINARY_API_SECRET
- [ ] GOOGLE_CLIENT_ID
- [ ] GOOGLE_CLIENT_SECRET
- [ ] ALLOWED_ORIGINS=`https://bookit-cyan.vercel.app,https://bookitadmin.vercel.app`
- [ ] API_URL=`https://bookit-dijk.onrender.com`
- [ ] NODE_ENV=`production`
- [ ] PORT=`10000`

### Verify
- [ ] Deploy succeeded
- [ ] Service is live
- [ ] Test: `curl https://bookit-dijk.onrender.com/api/health`

---

## 🌐 User App Deployment (Vercel)

### Create Project
- [ ] Go to https://vercel.com → New Project
- [ ] Import GitHub repo
- [ ] Root directory: `vibe-weaver-main`
- [ ] Framework: Vite (auto-detected)

### Add Environment Variables
- [ ] VITE_API_URL=`https://bookit-dijk.onrender.com`
- [ ] VITE_SUPABASE_URL
- [ ] VITE_SUPABASE_PUBLISHABLE_KEY
- [ ] VITE_GOOGLE_CLIENT_ID
- [ ] Apply to: Production, Preview, Development ✓

### Verify
- [ ] Build succeeded
- [ ] Site live at https://bookit-cyan.vercel.app/
- [ ] Homepage loads
- [ ] No console errors

---

## 👨‍💼 Admin App Deployment (Vercel)

### Create Project
- [ ] Go to https://vercel.com → New Project
- [ ] Import same GitHub repo
- [ ] Root directory: `Admin`
- [ ] Framework: Vite (auto-detected)

### Add Environment Variables
- [ ] VITE_API_URL=`https://bookit-dijk.onrender.com`
- [ ] Apply to: Production, Preview, Development ✓

### Verify
- [ ] Build succeeded
- [ ] Site live at https://bookitadmin.vercel.app/
- [ ] Login page loads
- [ ] No console errors

---

## 🔐 Third-Party Configuration

### MongoDB Atlas
- [ ] IP whitelist: 0.0.0.0/0 (for Render)
- [ ] Database user created
- [ ] Connection tested

### Google OAuth
- [ ] Authorized origins: https://bookit-cyan.vercel.app, https://bookitadmin.vercel.app
- [ ] Redirect URIs configured
- [ ] Credentials match .env

### Cloudinary
- [ ] API limits checked
- [ ] Test upload works

### Razorpay
- [ ] Production mode enabled
- [ ] API keys configured
- [ ] Test payment works

---

## 🧪 Post-Deployment Testing

### Backend
- [ ] Health check passes
- [ ] Database connected
- [ ] CORS working

### User App
- [ ] User registration
- [ ] User login
- [ ] Google OAuth
- [ ] Event browsing
- [ ] Booking creation
- [ ] Payment flow

### Admin App
- [ ] Admin login
- [ ] Dashboard loads
- [ ] User management
- [ ] Event management
- [ ] Payment history

---

## 🎯 Final Steps

- [ ] All tests passing
- [ ] Documentation updated
- [ ] Team has access
- [ ] Support ready

---

**Status**: ☐ Ready ☐ In Progress ☐ Complete

**Deployed By**: ____________  
**Date**: ____________

**Notes**:
```
(Add deployment notes here)
```
