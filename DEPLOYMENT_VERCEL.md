# Deployment Guide - Vercel

## Quick Start

### 1. Prepare Backend (Choose One)

**Option A: Deploy Backend ke VPS/Render/Heroku**
```bash
# Backend (api folder) perlu di-deploy ke server yang support Node.js
# Database: minta kredensial ke admin, jangan hardcode di sini/di repo

# Environment variables yang diperlukan:
DATABASE_URL=mysql://<user>:<password>@<host>:3306/<database>
CORS_ORIGIN=https://your-vercel-domain.vercel.app
JWT_SECRET=your-secure-secret
PORT=3001
```

**Option B: Backend tetap lokal (untuk development testing)**
- Backend berjalan di: `http://localhost:3001`
- Frontend di Vercel akan koneksi ke localhost (hanya untuk testing)

### 2. Deploy Frontend ke Vercel

#### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

#### Step 2: Create Vercel Project
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Select your GitHub repository
4. Configure Build Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build --prefix apps/grid-monitor`
   - **Output Directory**: `apps/grid-monitor/dist`
   - **Install Command**: `npm ci`

#### Step 3: Set Environment Variables in Vercel
Go to Project Settings → Environment Variables and add:

```
VITE_API_URL=https://energiitera.com
```

Examples:
- VPS/Heroku: `https://api.yourdomain.com`
- Localhost: `http://localhost:3001` (development only)
- Same domain reverse proxy: `https://yourdomain.com`

#### Step 4: Deploy
Click "Deploy" and wait for build to complete.

---

## Database Info

**Current Database Setup:**
- Kredensial database tidak lagi dicantumkan di sini — minta ke admin/simpan di secret manager, jangan commit ke repo.

**Test Credentials (seeded in database):**
- Email: `admin@gridmonitor.iot`
- Password: `password`

---

## Troubleshooting

### "Failed to fetch" Login Error
1. Check `VITE_API_URL` environment variable is set correctly
2. Verify backend is running and accessible
3. Check CORS configuration in backend `.env`

### CORS Errors
Backend CORS needs to allow Vercel domain:
```
CORS_ORIGIN=https://yourdomain.vercel.app
```

### WebSocket Connection Failed
If using Socket.io, ensure `VITE_SOCKET_URL` is set correctly:
```
VITE_SOCKET_URL=https://your-backend-url.com
```

---

## Production Checklist

- [ ] Backend deployed and running
- [ ] Database accessible from backend server
- [ ] JWT_SECRET changed to production value
- [ ] CORS_ORIGIN updated to production domain
- [ ] VITE_API_URL set in Vercel environment variables
- [ ] Test login works after deployment
- [ ] MQTT connection configured (if needed)

---

## Backend Deployment Options

### 1. Render.com (Free tier available)
```bash
# Create render.com account
# Connect GitHub repo
# Set environment variables same as .env
# Deploy
```

### 2. Heroku
```bash
# heroku login
# heroku create your-app-name
# heroku config:set DATABASE_URL=...
# git push heroku main
```

### 3. VPS (AWS, DigitalOcean, Linode)
```bash
# SSH to server
# npm install
# npm run build
# pm2 start dist/index.js --name "api"
# Use nginx as reverse proxy for domain
```

### 4. Keep Localhost (Development/Testing)
- Backend runs locally
- Frontend on Vercel connects to `http://localhost:3001`
- Only works if frontend can reach local network
