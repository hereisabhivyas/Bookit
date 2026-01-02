# Quick Deployment Checklist

## Prerequisites Setup
- [ ] MongoDB Atlas account created
- [ ] MongoDB database cluster created
- [ ] MongoDB connection string obtained
- [ ] GitHub repository created
- [ ] Vercel account created
- [ ] Render account created

## Environment Variables Ready
- [ ] MONGODB_URI
- [ ] JWT_SECRET (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- [ ] RAZORPAY_KEY_ID
- [ ] RAZORPAY_KEY_SECRET
- [ ] VITE_SUPABASE_URL
- [ ] VITE_SUPABASE_ANON_KEY

## Deployment Steps

### 1. Push to GitHub
- [ ] Run `deploy-setup.bat` (Windows) or manually initialize git
- [ ] Create GitHub repository
- [ ] Push code to GitHub

### 2. Deploy Backend (Render)
- [ ] Create new Web Service on Render
- [ ] Connect GitHub repo
- [ ] Set root directory to `api`
- [ ] Add environment variables
- [ ] Deploy and get API URL

### 3. Deploy Frontend (Vercel)
- [ ] Import project from GitHub
- [ ] Set root directory to `vibe-weaver-main`
- [ ] Add environment variables (including API URL from step 2)
- [ ] Deploy

### 4. Deploy Admin Panel (Vercel)
- [ ] Import same GitHub repo
- [ ] Set root directory to `Admin`
- [ ] Add VITE_API_URL environment variable
- [ ] Deploy

### 5. Post-Deployment
- [ ] Update CORS settings in backend with Vercel URLs
- [ ] Test all features
- [ ] Seed admin user if needed
- [ ] Set up custom domains (optional)

## Live URLs
- User App: ________________
- Admin Panel: ________________
- API: ________________

## Notes
- Free tier Render services sleep after 15 min of inactivity
- First request after sleep takes ~30 seconds
- Vercel auto-deploys on git push
- Render auto-deploys on git push
