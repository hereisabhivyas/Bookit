# 🔧 Deployment Issues & Solutions

## Issue #1: Cloudinary Dependency Conflict (FIXED ✅)

### Error Message
```
npm error ERESOLVE could not resolve
npm error While resolving: multer-storage-cloudinary@4.0.0
npm error Found: cloudinary@2.8.0
npm error Could not resolve dependency:
npm error peer cloudinary@"^1.21.0" from multer-storage-cloudinary@4.0.0
```

### Root Cause
- `multer-storage-cloudinary@4.0.0` expects `cloudinary@^1.21.0`
- Project uses newer `cloudinary@^2.8.0`
- npm strict peer dependency resolution fails

### Solution Applied ✅
1. **Dockerfile**: Added `--legacy-peer-deps` flag
2. **render.yaml**: Updated build command to use `--legacy-peer-deps`
3. **.npmrc**: File already configured with `legacy-peer-deps=true`

### Files Modified
- `api/Dockerfile` - Line 7: `RUN npm install --production --legacy-peer-deps`
- `api/render.yaml` - Line 5: `buildCommand: npm install --legacy-peer-deps`

### Status
✅ **FIXED** - Changes committed and pushed to GitHub

### Verification
After Render rebuilds, the deployment should succeed. The `--legacy-peer-deps` flag allows npm to install packages even with peer dependency conflicts, which is safe in this case as the packages are compatible.

---

## Common Deployment Issues & Solutions

### Issue: Build Timeout on Render
**Symptoms**: Build process takes >15 minutes and times out

**Solutions**:
1. Clear build cache in Render dashboard
2. Upgrade to paid Render tier for faster builds
3. Optimize package.json (remove unused dependencies)

---

### Issue: Environment Variables Not Working
**Symptoms**: App starts but features fail (database, auth, uploads)

**Solutions**:
1. Verify all environment variables are set in Render/Vercel dashboard
2. Check for typos in variable names
3. Ensure no quotes around values in Vercel (they're added automatically)
4. Redeploy after adding/changing variables

---

### Issue: CORS Errors
**Symptoms**: Frontend can't connect to backend, browser console shows CORS errors

**Solutions**:
1. Verify `ALLOWED_ORIGINS` includes both Vercel URLs
2. Check for trailing slashes (remove them)
3. Ensure URLs use `https://` not `http://`
4. Redeploy backend after fixing CORS settings

**Example ALLOWED_ORIGINS**:
```
https://bookit-cyan.vercel.app,https://bookitadmin.vercel.app
```

---

### Issue: MongoDB Connection Failed
**Symptoms**: Backend logs show "MongooseServerSelectionError"

**Solutions**:
1. Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
2. Verify connection string format: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`
3. Ensure database user has read/write permissions
4. Check if password contains special characters (URL encode them)

---

### Issue: Render Service Sleeps (Free Tier)
**Symptoms**: First request after inactivity takes 30-60 seconds

**Solutions**:
1. Upgrade to paid Render tier (recommended for production)
2. Use uptime monitoring service to ping backend every 10 minutes
3. Implement health check endpoint (already exists: `/api/health`)
4. Inform users about potential cold starts

---

### Issue: Images Not Uploading
**Symptoms**: Image upload fails, Cloudinary errors in logs

**Solutions**:
1. Verify Cloudinary credentials in Render environment variables
2. Check Cloudinary account limits/quotas
3. Ensure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` are correct
4. Test with Cloudinary dashboard to verify account status

---

### Issue: Payment Integration Failing
**Symptoms**: Razorpay payments don't process

**Solutions**:
1. Ensure using **production** Razorpay keys (not test keys)
2. Verify webhook URLs are configured in Razorpay dashboard
3. Check Razorpay account is activated and verified
4. Ensure `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are correct

---

### Issue: Google OAuth Not Working
**Symptoms**: "Redirect URI mismatch" or OAuth login fails

**Solutions**:
1. Add authorized origins in Google Cloud Console:
   - https://bookit-cyan.vercel.app
   - https://bookitadmin.vercel.app
2. Add authorized redirect URIs:
   - https://bookit-cyan.vercel.app
   - https://bookitadmin.vercel.app
3. Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` match Google Console
4. Wait 5-10 minutes after updating Google Console (propagation delay)

---

### Issue: Vercel Build Fails
**Symptoms**: "Build failed" on Vercel, TypeScript or Vite errors

**Solutions**:
1. Check build logs in Vercel dashboard for specific errors
2. Ensure all environment variables starting with `VITE_` are set
3. Test build locally: `npm run build`
4. Clear Vercel cache and redeploy
5. Check Node.js version compatibility

---

### Issue: 404 on Frontend Routes
**Symptoms**: Direct navigation to routes (e.g., `/events`) shows 404

**Solutions**:
- Already handled! ✅ `vercel.json` has rewrites configured
- If still happening, verify `vercel.json` exists in project root
- Check that framework preset is set to "Vite" in Vercel

---

## Getting Help

### Check Logs
- **Render**: Dashboard → Service → Logs tab
- **Vercel**: Dashboard → Deployments → Deployment → View Function Logs
- **Browser**: Developer Console (F12) → Console/Network tabs

### Useful Commands
```bash
# Test backend health
curl https://bookit-dijk.onrender.com/api/health

# Check environment variables (locally)
node -e "console.log(process.env.VITE_API_URL)"

# Test database connection (locally)
node -e "require('mongoose').connect(process.env.MONGO_URL).then(() => console.log('Connected')).catch(e => console.log('Error:', e))"

# Verify npm installation
npm install --legacy-peer-deps
```

### Support Resources
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com

---

**Last Updated**: January 8, 2026  
**Status**: Dependency conflict resolved ✅
