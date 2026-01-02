# Deployment Guide for Vibe Weaver

This guide will help you deploy your full-stack application to production.

## Architecture Overview

- **Frontend (User App)**: React + Vite → Deploy to Vercel
- **Admin Panel**: React + Vite → Deploy to Vercel  
- **Backend API**: Node.js + Express + MongoDB → Deploy to Render

## Prerequisites

1. **GitHub Account** - to host your code
2. **MongoDB Atlas Account** - for production database ([Sign up free](https://www.mongodb.com/cloud/atlas/register))
3. **Vercel Account** - for frontend hosting ([Sign up free](https://vercel.com/signup))
4. **Render Account** - for backend hosting ([Sign up free](https://render.com/register))
5. **Razorpay Account** - for payments (if not already set up)

---

## Step 1: Setup MongoDB Atlas (Production Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier is fine)
3. Create a database user with username and password
4. **Whitelist all IP addresses** (0.0.0.0/0) under Network Access for Render to connect
5. Get your connection string:
   - Click "Connect" → "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster.mongodb.net/`)
   - Replace `<password>` with your actual password
   - Add your database name at the end: `mongodb+srv://username:password@cluster.mongodb.net/vibeweaver`

---

## Step 2: Push Code to GitHub

If you haven't already:

```bash
# Navigate to your project root
cd "c:\Users\abhis\Downloads\vibe-weaver-main (3)"

# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - ready for deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/vibe-weaver.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy Backend API to Render

### 3.1 Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `vibe-weaver-api`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `api`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Instance Type**: Free

### 3.2 Add Environment Variables

In the "Environment" section, add these variables:

```
MONGODB_URI=your_mongodb_connection_string_from_step1
JWT_SECRET=generate_a_random_32_character_string
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NODE_ENV=production
PORT=10000
```

**To generate JWT_SECRET**, run in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3.3 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Once deployed, copy your API URL (e.g., `https://vibe-weaver-api.onrender.com`)

---

## Step 4: Deploy Frontend to Vercel

### 4.1 Deploy User App

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `vibe-weaver-main`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:
   ```
   VITE_API_URL=https://vibe-weaver-api.onrender.com
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

6. Click **"Deploy"**
7. Your app will be live at `https://your-project.vercel.app`

### 4.2 Deploy Admin Panel

1. In Vercel Dashboard, click **"Add New..."** → **"Project"**
2. Import the same GitHub repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `Admin`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add Environment Variable:
   ```
   VITE_API_URL=https://vibe-weaver-api.onrender.com
   ```

5. Click **"Deploy"**
6. Your admin panel will be live at `https://your-admin-project.vercel.app`

---

## Step 5: Configure CORS

Update your backend CORS settings to allow your Vercel domains:

In `api/index.js`, update the CORS configuration to include your Vercel URLs:

```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://your-project.vercel.app',
  'https://your-admin-project.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

Then commit and push to trigger a new deployment.

---

## Step 6: Seed Admin User (Optional)

If you need to create an admin user, you can:

1. SSH into Render service or use Render Shell
2. Run: `node seedadmin.js`

Or manually create an admin user via MongoDB Atlas interface.

---

## Step 7: Custom Domain (Optional)

### For Vercel (Frontend):
1. Go to your project settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### For Render (API):
1. Go to your service settings → Custom Domain
2. Add your domain (e.g., `api.yourdomain.com`)
3. Update DNS records as instructed

---

## Alternative Deployment Options

### Option A: Deploy Everything to Vercel
- Frontend: Native Vercel support
- API: Deploy as Vercel Serverless Functions
- Requires converting Express app to serverless functions

### Option B: Deploy to Railway
- Similar to Render but with different pricing
- One-click deploy for full stack

### Option C: Deploy to DigitalOcean/AWS/GCP
- More control but requires more setup
- Use Docker containers

---

## Environment Variables Checklist

### Backend (Render):
- ✅ MONGODB_URI
- ✅ JWT_SECRET
- ✅ RAZORPAY_KEY_ID
- ✅ RAZORPAY_KEY_SECRET
- ✅ NODE_ENV
- ✅ PORT

### Frontend (Vercel):
- ✅ VITE_API_URL
- ✅ VITE_SUPABASE_URL
- ✅ VITE_SUPABASE_ANON_KEY

### Admin (Vercel):
- ✅ VITE_API_URL

---

## Troubleshooting

### Backend won't start:
- Check environment variables are set correctly
- Check MongoDB connection string is valid
- Check logs in Render dashboard

### Frontend can't connect to API:
- Verify VITE_API_URL is correct
- Check CORS settings in backend
- Check browser console for errors

### Database connection issues:
- Verify MongoDB Atlas IP whitelist (0.0.0.0/0)
- Check connection string format
- Ensure database user has correct permissions

---

## Post-Deployment Tasks

1. ✅ Test all features on production
2. ✅ Set up monitoring (Render and Vercel have built-in)
3. ✅ Configure backup for MongoDB Atlas
4. ✅ Set up SSL certificates (automatic on Vercel/Render)
5. ✅ Update your README with live URLs
6. ✅ Set up CI/CD (automatic with Vercel/Render on git push)

---

## Monitoring & Maintenance

- **Render**: Check logs and metrics in dashboard
- **Vercel**: Check analytics and logs in dashboard  
- **MongoDB Atlas**: Monitor database performance
- **Uptime**: Use services like UptimeRobot for monitoring

---

## Cost Estimate

- **MongoDB Atlas**: Free (512MB)
- **Render**: Free tier (spins down after inactivity)
- **Vercel**: Free tier (generous limits)
- **Total**: $0/month for basic usage

**Note**: Free tier Render services spin down after 15 minutes of inactivity. First request after sleep takes ~30 seconds.

---

## Need Help?

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/

---

**Your apps will be live at**:
- User App: `https://your-project.vercel.app`
- Admin Panel: `https://your-admin-project.vercel.app`
- API: `https://vibe-weaver-api.onrender.com`
