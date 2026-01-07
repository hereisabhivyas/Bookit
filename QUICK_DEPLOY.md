# 🚀 Quick Deployment Reference

## Deployment URLs
```
Backend:  https://bookit-dijk.onrender.com
User App: https://bookit-cyan.vercel.app/
Admin:    https://bookitadmin.vercel.app/
```

## Quick Verification

Run the verification script:
```bash
node verify-deployment.mjs
```

## Essential Environment Variables

### Render (Backend)
```env
MONGO_URL=<mongodb_atlas_uri>
JWT_SECRET=<strong_random_string>
RAZORPAY_KEY_ID=<your_key>
RAZORPAY_KEY_SECRET=<your_secret>
CLOUDINARY_CLOUD_NAME=<your_name>
CLOUDINARY_API_KEY=<your_key>
CLOUDINARY_API_SECRET=<your_secret>
GOOGLE_CLIENT_ID=<your_client_id>
GOOGLE_CLIENT_SECRET=<your_client_secret>
ALLOWED_ORIGINS=https://bookit-cyan.vercel.app,https://bookitadmin.vercel.app
API_URL=https://bookit-dijk.onrender.com
NODE_ENV=production
PORT=10000
```

### Vercel User App
```env
VITE_API_URL=https://bookit-dijk.onrender.com
VITE_SUPABASE_URL=https://nueetqnzelgjvjfsjlzi.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<from .env file>
VITE_GOOGLE_CLIENT_ID=<from .env file>
```

### Vercel Admin App
```env
VITE_API_URL=https://bookit-dijk.onrender.com
```

## Deployment Commands

### Test Locally
```bash
# Backend
cd api
npm install
node index.js

# User App
cd vibe-weaver-main
npm install
npm run dev

# Admin App
cd Admin
npm install
npm run dev
```

### Build for Production
```bash
# User App
cd vibe-weaver-main
npm run build

# Admin App
cd Admin
npm run build
```

## Common Issues

### CORS Error
- Check ALLOWED_ORIGINS in Render environment variables
- Ensure no trailing slashes in URLs
- Verify both Vercel URLs are included

### API Connection Failed
- Confirm VITE_API_URL is set in Vercel
- Check backend is running on Render
- Verify environment variables are correct

### Database Connection Failed
- Check MONGO_URL is correct
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Confirm database user has correct permissions

## Post-Deployment Checklist

- [ ] Backend health check: `curl https://bookit-dijk.onrender.com/api/health`
- [ ] User app loads: Visit https://bookit-cyan.vercel.app/
- [ ] Admin app loads: Visit https://bookitadmin.vercel.app/
- [ ] User registration works
- [ ] Admin login works
- [ ] Database operations work
- [ ] Image uploads work (Cloudinary)
- [ ] Payment integration works (Razorpay)
- [ ] Google OAuth works

## Support

For detailed instructions, see: **DEPLOYMENT_READY.md**
