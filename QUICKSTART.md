# Quick Deployment Checklist

Follow these steps in order to deploy your app to free tiers.

## ✅ Pre-Deployment Checklist

- [ ] Code is committed to GitHub
- [ ] Database schema/data is ready to migrate
- [ ] You have accounts on: Neon, Render, Vercel

---

## 🗄️ Step 1: Neon Database (5 minutes)

1. **Create project**: https://neon.tech → New Project → `kewinchem-db`
2. **Copy connection string** from dashboard
3. **Import schema**:
   ```bash
   psql "YOUR_NEON_CONNECTION_STRING" < your_schema.sql
   ```
4. **Import data** (if needed):
   ```bash
   psql "YOUR_NEON_CONNECTION_STRING" < your_data.sql
   ```

**Save this**: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/db?sslmode=require`

---

## 🔧 Step 2: Render Backend (10 minutes)

1. **Push to GitHub**:
   ```bash
   cd /Users/shashvishah/KChemWebsite
   git add .
   git commit -m "Add deployment configs"
   git push origin main
   ```

2. **Create Web Service**: https://render.com → New → Web Service
   - Repository: `KChemWebsite`
   - Name: `kewinchem-backend`
   - Root Directory: `backend`
   - Runtime: `Python 3`
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Environment Variables**:
   ```
   DATABASE_URL = <your Neon connection string>
   FRONTEND_URL = https://your-app.vercel.app  (update after Vercel deploy)
   ```

4. **Deploy** → Wait 2-3 minutes

5. **Test**: Visit `https://kewinchem-backend.onrender.com/`

**Save this URL**: `https://kewinchem-backend.onrender.com`

---

## 🌐 Step 3: Vercel Frontend (5 minutes)

1. **Update vercel.json** (already created):
   - Open: `kewin-chem-connect-main/vercel.json`
   - Line 4: Replace with your Render URL:
     ```json
     "destination": "https://kewinchem-backend.onrender.com/api/:path*"
     ```

2. **Commit changes**:
   ```bash
   git add kewin-chem-connect-main/vercel.json
   git commit -m "Update Vercel config with Render backend URL"
   git push
   ```

3. **Import Project**: https://vercel.com → Add New → Project
   - Repository: `KChemWebsite`
   - Framework: `Vite`
   - Root Directory: `kewin-chem-connect-main`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Deploy** → Wait 1-2 minutes

5. **Test**: Visit `https://your-app.vercel.app`

**Save this URL**: `https://your-app.vercel.app`

---

## 🔄 Step 4: Update Backend CORS (2 minutes)

1. Go to Render dashboard → `kewinchem-backend` → Environment
2. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL = https://your-app.vercel.app
   ```
3. Click **Save** → Render will auto-redeploy

---

## ✅ Verification

Test these URLs:

- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://kewinchem-backend.onrender.com/`
- **API Docs**: `https://kewinchem-backend.onrender.com/docs`
- **Products API**: `https://kewinchem-backend.onrender.com/api/v1/products/`

---

## 🚨 Common Issues

### "Backend not responding"
- **First request after idle takes 30 seconds** (free tier spins down)
- Check Render logs for errors

### "CORS error in browser"
- Verify `FRONTEND_URL` is set in Render
- Verify `vercel.json` has correct backend URL
- Clear browser cache

### "Database connection failed"
- Check Neon connection string has `?sslmode=require`
- Verify DATABASE_URL in Render matches Neon exactly

---

## 📊 What You Get (Free Tier)

| Service | What's Included | Limitations |
|---------|----------------|-------------|
| **Neon** | 512MB storage, 1 compute | Auto-suspends after 5min idle |
| **Render** | 750 hours/month | Spins down after 15min idle |
| **Vercel** | Unlimited deploys, 100GB bandwidth | - |

**Total Cost**: $0/month 🎉

---

## 🔗 Useful Links

- **Neon Dashboard**: https://console.neon.tech
- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## 📝 Next Steps (Optional)

1. **Custom Domain**: Add `kewinchem.com` in Vercel settings
2. **Monitoring**: Set up Vercel Analytics (free)
3. **Upgrade**: If you need always-on backend, upgrade Render to $7/month
