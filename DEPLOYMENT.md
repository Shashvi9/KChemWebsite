# Deployment Guide: Neon + Render + Vercel

This guide walks you through deploying the KChem website stack on free tiers:
- **Database**: Neon PostgreSQL (Free tier: 512MB storage, 1 compute)
- **Backend**: Render (Free tier: 750 hours/month)
- **Frontend**: Vercel (Free tier: unlimited deployments)

---

## Step 1: Deploy Database on Neon

### 1.1 Create Neon Account & Project
1. Go to https://neon.tech and sign up (free)
2. Click **Create Project**
3. Name it: `kewinchem-db`
4. Select region closest to you
5. Click **Create Project**

### 1.2 Get Connection String
1. In your Neon dashboard, go to **Connection Details**
2. Copy the **Connection String** (it looks like):
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```
3. **Save this** - you'll need it for Render

### 1.3 Import Your Database Schema
You have two options:

**Option A: Using pg_dump from your current DB**
```bash
# Export from your current database
pg_dump -h your-current-host -U your-user -d your-db --schema-only > schema.sql

# Import to Neon
psql "postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require" < schema.sql
```

**Option B: Using SQLAlchemy migrations (if you have them)**
```bash
# Set DATABASE_URL to your Neon connection string
export DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"

# Run migrations
cd backend
python -m alembic upgrade head
```

### 1.4 Import Data (if needed)
```bash
# Export data from current DB
pg_dump -h your-current-host -U your-user -d your-db --data-only > data.sql

# Import to Neon
psql "postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require" < data.sql
```

---

## Step 2: Deploy Backend on Render

### 2.1 Create Render Account
1. Go to https://render.com and sign up (free)
2. Connect your GitHub account

### 2.2 Push Code to GitHub
```bash
cd /Users/shashvishah/KChemWebsite
git add .
git commit -m "Add deployment configs for Render and Vercel"
git push origin main
```

### 2.3 Create Web Service on Render
1. In Render dashboard, click **New +** → **Web Service**
2. Connect your GitHub repository: `KChemWebsite`
3. Configure:
   - **Name**: `kewinchem-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`

### 2.4 Set Environment Variables
In Render dashboard → Environment:
```
DATABASE_URL = <paste your Neon connection string>
FRONTEND_URL = https://your-app.vercel.app  (you'll update this after Vercel deploy)
```

### 2.5 Deploy
1. Click **Create Web Service**
2. Wait for build to complete (~2-3 minutes)
3. Your backend will be at: `https://kewinchem-backend.onrender.com`
4. Test it: `https://kewinchem-backend.onrender.com/` should return welcome message

**Important**: Free tier spins down after 15 minutes of inactivity. First request after idle takes ~30 seconds.

---

## Step 3: Deploy Frontend on Vercel

### 3.1 Update vercel.json with your Render backend URL
The file is already created at `kewin-chem-connect-main/vercel.json`.

**Update line 4** with your actual Render backend URL:
```json
"destination": "https://kewinchem-backend.onrender.com/api/:path*"
```

### 3.2 Create Vercel Account
1. Go to https://vercel.com and sign up (free)
2. Connect your GitHub account

### 3.3 Import Project
1. Click **Add New** → **Project**
2. Import your GitHub repository: `KChemWebsite`
3. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `kewin-chem-connect-main`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.4 Set Environment Variables (Optional)
In Vercel dashboard → Settings → Environment Variables:
```
VITE_BACKEND_URL = https://kewinchem-backend.onrender.com
```

### 3.5 Deploy
1. Click **Deploy**
2. Wait for build (~1-2 minutes)
3. Your site will be at: `https://your-app.vercel.app`

### 3.6 Update Backend CORS
Go back to Render → Environment and update:
```
FRONTEND_URL = https://your-app.vercel.app
```
Then manually redeploy the backend.

---

## Step 4: Custom Domain (Optional)

### For Vercel (Frontend):
1. Vercel dashboard → Settings → Domains
2. Add `kewinchem.com`
3. Follow DNS instructions

### For Render (Backend):
1. Render dashboard → Settings → Custom Domain
2. Add `api.kewinchem.com`
3. Update Vercel's `vercel.json` to point to `https://api.kewinchem.com`

---

## Troubleshooting

### Backend not responding
- Check Render logs: Dashboard → Logs
- Verify DATABASE_URL is set correctly
- Free tier spins down - first request takes 30s

### Frontend API calls failing
- Check browser console for CORS errors
- Verify `vercel.json` has correct backend URL
- Verify backend CORS allows your Vercel domain

### Database connection errors
- Verify Neon connection string includes `?sslmode=require`
- Check Neon dashboard for compute status (should be "Active")
- Free tier has connection limits (check Neon docs)

---

## Free Tier Limitations

**Neon**:
- 512MB storage
- 1 compute unit
- Compute auto-suspends after 5 minutes idle
- 100 hours compute/month

**Render**:
- 750 hours/month (enough for 1 service)
- Spins down after 15 min idle
- 512MB RAM
- Slower cold starts

**Vercel**:
- 100GB bandwidth/month
- 6000 build minutes/month
- Unlimited deployments
- Fast global CDN

---

## Monitoring

- **Neon**: Dashboard shows storage, compute usage
- **Render**: Dashboard shows build logs, runtime logs, metrics
- **Vercel**: Analytics tab shows page views, performance

---

## Cost Estimates (if you exceed free tier)

- **Neon**: ~$19/month for 3GB storage
- **Render**: $7/month for always-on instance
- **Vercel**: Pro plan $20/month (usually not needed)

Total: Can run entirely free with limitations above.
