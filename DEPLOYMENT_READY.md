# 🚀 Deployment Ready Configuration

## Deployment URLs
- **Backend API (Render)**: https://bookit-dijk.onrender.com
- **User App (Vercel)**: https://bookit-cyan.vercel.app/
- **Admin App (Vercel)**: https://bookitadmin.vercel.app/

---

## ✅ Configuration Completed

### 1. Backend API (Render)
**Location**: `api/`
**Deployment**: https://bookit-dijk.onrender.com

#### Files Configured:
- ✅ `render.yaml` - Updated with production environment variables
- ✅ `.env.example` - Updated with deployment template

#### Environment Variables Required on Render:
Set these in your Render dashboard for the service:

```bash
MONGO_URL=<your_mongodb_atlas_connection_string>
JWT_SECRET=<your_secure_jwt_secret>
RAZORPAY_KEY_ID=<your_razorpay_key_id>
RAZORPAY_KEY_SECRET=<your_razorpay_key_secret>
CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
ALLOWED_ORIGINS=https://bookit-cyan.vercel.app,https://bookitadmin.vercel.app
API_URL=https://bookit-dijk.onrender.com
NODE_ENV=production
PORT=10000
```

---

### 2. User App (Vercel)
**Location**: `vibe-weaver-main/`
**Deployment**: https://bookit-cyan.vercel.app/

#### Files Configured:
- ✅ `.env` - Production API URL configured
- ✅ `.env.example` - Template updated
- ✅ `vercel.json` - Deployment configuration ready
- ✅ `src/lib/api.ts` - API client configured

#### Environment Variables Required on Vercel:
Set these in Vercel Project Settings → Environment Variables:

```bash
VITE_API_URL=https://bookit-dijk.onrender.com
VITE_SUPABASE_PROJECT_ID=nueetqnzelgjvjfsjlzi
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51ZWV0cW56ZWxnanZqZnNqbHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMjYyMjcsImV4cCI6MjA4MDcwMjIyN30.LljltwmkcYV1Y-5G_hKoXBj_LnxTrwTpUaZYWsGv4Ig
VITE_SUPABASE_URL=https://nueetqnzelgjvjfsjlzi.supabase.co
VITE_GOOGLE_CLIENT_ID=214617912712-octfprnlbi17eagsn49hb726anbs7ife.apps.googleusercontent.com
```

---

### 3. Admin App (Vercel)
**Location**: `Admin/`
**Deployment**: https://bookitadmin.vercel.app/

#### Files Configured:
- ✅ `.env` - Production API URL configured
- ✅ `.env.example` - Template updated
- ✅ `vercel.json` - Deployment configuration ready
- ✅ `src/lib/api.ts` - API client configured

#### Environment Variables Required on Vercel:
Set these in Vercel Project Settings → Environment Variables:

```bash
VITE_API_URL=https://bookit-dijk.onrender.com
```

---

## 🔧 Deployment Steps

### Backend (Render)

1. **Connect Repository**
   - Go to https://render.com
   - Create new Web Service
   - Connect your GitHub repository
   - Select the `api` folder as root directory

2. **Configure Service**
   - Build Command: `npm install`
   - Start Command: `node index.js`
   - Environment: Node

3. **Set Environment Variables**
   - Copy all variables from the "Environment Variables Required on Render" section above
   - Add them in the Render dashboard

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Verify at: https://bookit-dijk.onrender.com

### User App (Vercel)

1. **Import Project**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the `vibe-weaver-main` folder as root directory

2. **Configure Project**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from the "User App Environment Variables" section
   - Apply to: Production, Preview, and Development

4. **Deploy**
   - Click "Deploy"
   - Verify at: https://bookit-cyan.vercel.app/

### Admin App (Vercel)

1. **Import Project**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import the same repository
   - Select the `Admin` folder as root directory

2. **Configure Project**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add: `VITE_API_URL=https://bookit-dijk.onrender.com`
   - Apply to: Production, Preview, and Development

4. **Deploy**
   - Click "Deploy"
   - Verify at: https://bookitadmin.vercel.app/

---

## 🧪 Post-Deployment Testing

### 1. Backend API Test
```bash
curl https://bookit-dijk.onrender.com/api/health
```
Expected: Health check response

### 2. User App Test
- Visit: https://bookit-cyan.vercel.app/
- Test user registration/login
- Test event browsing
- Test booking functionality

### 3. Admin App Test
- Visit: https://bookitadmin.vercel.app/
- Test admin login
- Test dashboard access
- Test management features

---

## 🔐 Security Checklist

- [ ] All sensitive environment variables are set on respective platforms (not in code)
- [ ] JWT_SECRET is a strong, random string
- [ ] MongoDB Atlas IP whitelist configured (allow 0.0.0.0/0 for Render)
- [ ] CORS origins properly configured in backend
- [ ] Cloudinary API keys are valid
- [ ] Razorpay keys are in production mode
- [ ] Google OAuth credentials match deployed URLs

---

## 📝 Important Notes

1. **First Deployment**: Render free tier may sleep after inactivity. First request might take 30-60 seconds.

2. **CORS Issues**: If you encounter CORS errors, verify:
   - ALLOWED_ORIGINS includes both Vercel URLs
   - No trailing slashes in URLs
   - Environment variables are properly set

3. **Database**: Ensure MongoDB Atlas allows connections from Render's IP addresses (use 0.0.0.0/0 for simplicity in production)

4. **Google OAuth**: Update authorized redirect URIs in Google Console:
   - https://bookit-cyan.vercel.app
   - https://bookitadmin.vercel.app

5. **API Key Rotation**: After deployment, consider rotating all API keys and secrets for security

---

## 🎯 Next Steps After Deployment

1. Set up custom domains (optional)
2. Configure SSL certificates (handled automatically by Render/Vercel)
3. Set up monitoring and alerts
4. Configure backup strategy for MongoDB
5. Set up CI/CD for automatic deployments
6. Add error tracking (e.g., Sentry)

---

## 🆘 Troubleshooting

### Backend not responding
- Check Render logs
- Verify environment variables are set
- Check MongoDB connection string

### Frontend can't connect to backend
- Verify VITE_API_URL in Vercel
- Check CORS configuration
- Verify backend is running

### Authentication issues
- Check JWT_SECRET matches between deployments
- Verify Google OAuth credentials
- Check cookie/session configuration

---

**Last Updated**: January 8, 2026
**Status**: ✅ Ready for Deployment
