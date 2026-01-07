# 🎉 BookIt - Event Booking Platform

**Status**: ✅ **READY FOR DEPLOYMENT**

A full-stack event booking platform with user and admin interfaces.

---

## 🌐 Deployment URLs

| Service | URL | Status |
|---------|-----|--------|
| **Backend API** | https://bookit-dijk.onrender.com | 🔄 Ready to Deploy |
| **User App** | https://bookit-cyan.vercel.app/ | 🔄 Ready to Deploy |
| **Admin Dashboard** | https://bookitadmin.vercel.app/ | 🔄 Ready to Deploy |

---

## 📁 Project Structure

```
vibe-weaver-main (3)/
├── api/                          # Backend API (Node.js + Express)
│   ├── index.js                 # Main server file
│   ├── render.yaml              # Render deployment config ✅
│   ├── .env.example             # Environment template ✅
│   └── models/                  # MongoDB models
│
├── vibe-weaver-main/            # User Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/              # Route pages
│   │   ├── components/         # Reusable components
│   │   └── lib/api.ts         # API client ✅
│   ├── vercel.json             # Vercel config ✅
│   └── .env                    # Environment variables ✅
│
├── Admin/                       # Admin Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/              # Admin pages
│   │   └── lib/api.ts         # API client ✅
│   ├── vercel.json             # Vercel config ✅
│   └── .env                    # Environment variables ✅
│
└── Deployment Guides/
    ├── DEPLOYMENT_SUMMARY.md   # Complete summary ⭐
    ├── DEPLOYMENT_READY.md     # Detailed guide
    ├── QUICK_DEPLOY.md         # Quick reference
    ├── verify-deployment.mjs   # Verification script
    └── generate-secrets.mjs    # Secret generator
```

---

## 🚀 Quick Start - Deploy Now!

### Prerequisites
- [ ] GitHub account
- [ ] Render account (free tier OK)
- [ ] Vercel account (free tier OK)
- [ ] MongoDB Atlas account (free tier OK)
- [ ] Cloudinary account
- [ ] Razorpay account
- [ ] Google Cloud Console (for OAuth)

### 1. Verify Configuration
```bash
node verify-deployment.mjs
```
Expected output: ✅ All checks passed!

### 2. Generate Secrets
```bash
node generate-secrets.mjs
```
Save the JWT_SECRET for Render deployment.

### 3. Deploy Backend (Render)
1. Go to https://render.com → New Web Service
2. Connect repository → Select `api` folder
3. Add environment variables (see `api/.env.example`)
4. Deploy!

### 4. Deploy User App (Vercel)
1. Go to https://vercel.com → New Project
2. Import repository → Select `vibe-weaver-main` folder
3. Add environment variables (see `vibe-weaver-main/.env.example`)
4. Deploy!

### 5. Deploy Admin App (Vercel)
1. Go to https://vercel.com → New Project
2. Import repository → Select `Admin` folder
3. Add environment variable: `VITE_API_URL=https://bookit-dijk.onrender.com`
4. Deploy!

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)** | ⭐ Start here - Complete deployment overview |
| **[DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md)** | Detailed step-by-step deployment guide |
| **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** | Quick reference for environment variables |

---

## 🔧 Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT + Google OAuth
- **Storage**: Cloudinary
- **Payments**: Razorpay
- **Real-time**: Socket.IO

### Frontend (Both Apps)
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **HTTP Client**: Axios
- **Routing**: React Router

---

## 🔐 Environment Variables

### Required for Backend (Render)
```env
MONGO_URL=<your_mongodb_connection_string>
JWT_SECRET=<generated_from_generate-secrets.mjs>
RAZORPAY_KEY_ID=<from_razorpay_dashboard>
RAZORPAY_KEY_SECRET=<from_razorpay_dashboard>
CLOUDINARY_CLOUD_NAME=<from_cloudinary>
CLOUDINARY_API_KEY=<from_cloudinary>
CLOUDINARY_API_SECRET=<from_cloudinary>
GOOGLE_CLIENT_ID=<from_google_console>
GOOGLE_CLIENT_SECRET=<from_google_console>
ALLOWED_ORIGINS=https://bookit-cyan.vercel.app,https://bookitadmin.vercel.app
API_URL=https://bookit-dijk.onrender.com
NODE_ENV=production
PORT=10000
```

### Required for User App (Vercel)
```env
VITE_API_URL=https://bookit-dijk.onrender.com
VITE_SUPABASE_URL=https://nueetqnzelgjvjfsjlzi.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<from_vibe-weaver-main/.env>
VITE_GOOGLE_CLIENT_ID=<from_vibe-weaver-main/.env>
```

### Required for Admin App (Vercel)
```env
VITE_API_URL=https://bookit-dijk.onrender.com
```

---

## 🧪 Testing After Deployment

### Backend Health Check
```bash
curl https://bookit-dijk.onrender.com/api/health
```

### Frontend Access
- User App: https://bookit-cyan.vercel.app/
- Admin App: https://bookitadmin.vercel.app/

### Full Test Checklist
- [ ] Backend health endpoint responds
- [ ] User registration works
- [ ] User login works
- [ ] Google OAuth works
- [ ] Event browsing works
- [ ] Booking creation works
- [ ] Admin login works
- [ ] Admin dashboard loads
- [ ] Image uploads work
- [ ] Payment flow works

---

## 🛠️ Local Development

### Backend
```bash
cd api
npm install
cp .env.example .env
# Edit .env with your local values
npm start
```

### User App
```bash
cd vibe-weaver-main
npm install
cp .env.example .env
# Edit .env with your local values
npm run dev
```

### Admin App
```bash
cd Admin
npm install
cp .env.example .env
# Edit .env with your local values
npm run dev
```

---

## 🔒 Security Notes

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use strong JWT secrets** - Generated by `generate-secrets.mjs`
3. **Keep API keys secure** - Store in environment variables only
4. **MongoDB Atlas** - Whitelist appropriate IPs (0.0.0.0/0 for Render)
5. **CORS** - Properly configured for production URLs
6. **HTTPS Only** - All production URLs use HTTPS

---

## 📞 Support & Troubleshooting

### Common Issues

**CORS Error**
- Check `ALLOWED_ORIGINS` includes both Vercel URLs
- No trailing slashes in URLs
- Verify environment variables in Render

**Can't Connect to API**
- Confirm `VITE_API_URL` in Vercel
- Check Render service is running
- Verify backend health endpoint

**Database Connection Failed**
- Check MongoDB connection string format
- Verify IP whitelist in Atlas
- Confirm database user permissions

**Images Not Uploading**
- Verify Cloudinary credentials
- Check API key quotas
- Confirm environment variables

### Getting Help
1. Check [DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md) troubleshooting section
2. Review Render/Vercel logs
3. Verify all environment variables are set

---

## 📊 Deployment Verification

All configuration files have been checked and verified:

```
✅ Backend Configuration
   ✓ api/package.json
   ✓ api/index.js
   ✓ api/render.yaml
   ✓ api/.env.example

✅ User App Configuration
   ✓ vibe-weaver-main/package.json
   ✓ vibe-weaver-main/vercel.json
   ✓ vibe-weaver-main/.env
   ✓ vibe-weaver-main/src/lib/api.ts

✅ Admin App Configuration
   ✓ Admin/package.json
   ✓ Admin/vercel.json
   ✓ Admin/.env
   ✓ Admin/src/lib/api.ts
```

**Status**: All systems ready for deployment! 🚀

---

## 🎯 Next Steps

1. **Review**: Read [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md)
2. **Verify**: Run `node verify-deployment.mjs`
3. **Generate**: Run `node generate-secrets.mjs`
4. **Deploy**: Follow steps in [DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md)
5. **Test**: Use the testing checklist above
6. **Monitor**: Check logs and performance

---

## 📄 License

[Your License Here]

## 👥 Contributors

[Your Team Here]

---

**Last Updated**: January 8, 2026  
**Configuration Status**: ✅ Production Ready  
**Deployment Status**: 🔄 Awaiting Deployment

---

**Happy Deploying! 🚀**
