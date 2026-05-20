# 🌿 HIMSARU Frontend - Vercel Deployment Guide

## ✅ What's Included

```
himsaru-vercel-deploy/
├── vercel.json          ← SPA routing config
├── README.md            ← This file
└── public/
    └── index.html       ← Your complete frontend (1.3MB)
```

---

## ⚠️ CRITICAL: Update API URL Before Deploying

### Step 1: Get Your Backend URL

After deploying your backend to Render, you'll get a URL like:
```
https://himsaru-api.onrender.com
```

### Step 2: Update index.html

Open `public/index.html` and find line ~2854:

```javascript
// Currently:
const API_BASE = 'https://your-app-name.onrender.com/api';

// Change to YOUR actual Render URL:
const API_BASE = 'https://himsaru-api.onrender.com/api';
                        ^^^^^^^^^^^
                        Your Render service name
```

**Don't forget the `/api` at the end!**

---

## 🚀 Deployment Methods

### Option 1: Vercel CLI (Fastest)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to folder
cd himsaru-vercel-deploy

# Deploy
vercel --prod
```

The CLI will:
- Auto-detect the project
- Deploy to production
- Give you a live URL instantly

### Option 2: GitHub + Vercel Dashboard

```bash
# Initialize Git
cd himsaru-vercel-deploy
git init
git add .
git commit -m "HIMSARU frontend deploy"
git branch -M main

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/himsaru-frontend.git
git push -u origin main
```

**Then:**
1. Go to https://vercel.com/dashboard
2. Click **"New Project"**
3. Import your GitHub repo
4. **Framework Preset:** Select **"Other"**
5. **Root Directory:** Leave as `./` (default)
6. **Build Command:** Leave empty
7. **Output Directory:** Leave empty
8. Click **"Deploy"**

### Option 3: Drag & Drop

1. Zip this entire folder
2. Go to https://vercel.com/dashboard
3. Click **"Add New..."** → **"Project"** → **"Deploy from ZIP"**
4. Drag and drop the zip file
5. **Framework Preset:** **"Other"**
6. Click **"Deploy"**

---

## ⚙️ Vercel Dashboard Settings

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Other` |
| **Root Directory** | `./` (default) |
| **Build Command** | *(leave empty)* |
| **Output Directory** | *(leave empty)* |
| **Install Command** | *(leave empty)* |

---

## 🔗 Connect Frontend & Backend

### 1. Deploy Backend First
Follow the backend deployment guide to deploy to Render.

### 2. Update Frontend API URL
Edit `public/index.html` line ~2854 with your Render URL.

### 3. Set Environment Variables on Render

In your Render backend, make sure `FRONTEND_URL` is set:

```env
FRONTEND_URL=https://himsaru.vercel.app
```
Replace with your actual Vercel URL.

### 4. Test the Connection

After both are deployed:

```bash
# Test backend
curl https://your-backend.onrender.com/api/health

# Visit frontend
https://your-frontend.vercel.app
```

**Try:**
- Browse products
- Add to cart
- Create an account
- Place an order

---

## 🐛 Common Issues & Fixes

### Issue 1: "404 - Page Not Found" on refresh

**Cause:** The `vercel.json` rewrite rule isn't working.

**Fix:**
1. Check that `vercel.json` is at the root level (not inside public/)
2. Re-deploy: `vercel --prod`

### Issue 2: Products not loading

**Cause:** API_BASE URL is wrong or backend isn't running.

**Fix:**
1. Check browser console (F12) for errors
2. Verify API_BASE in index.html matches your Render URL
3. Test backend: `curl https://your-backend.onrender.com/api/products`
4. Make sure backend is running (not sleeping on free tier)

### Issue 3: CORS errors

**Cause:** Backend doesn't have your frontend URL in CORS whitelist.

**Fix:**
1. Go to Render → Your Service → Environment
2. Add/update `FRONTEND_URL` variable:
   ```
   FRONTEND_URL=https://himsaru.vercel.app
   ```
3. Redeploy backend

### Issue 4: Images/styles not loading

**Cause:** All assets are embedded in index.html, so this shouldn't happen.

**Fix:** 
- Clear browser cache (Ctrl+Shift+R)
- Check Vercel deployment logs

---

## 🧪 Verification Checklist

After deployment, test:

- [ ] Homepage loads ✅
- [ ] Products page shows items ✅
- [ ] Can add products to cart ✅
- [ ] Can view cart ✅
- [ ] Can register/login ✅
- [ ] Can place order (with Razorpay) ✅
- [ ] Page refresh works on any route ✅
- [ ] Contact form submits ✅
- [ ] About page loads ✅

---

## 📊 Expected Project Structure on Vercel

After deployment, Vercel sees:

```
/
└── public/
    └── index.html     ← Served as root "/"
```

The `vercel.json` rewrite rule:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

**Means:** All routes (`/products`, `/about`, etc.) serve `index.html`, which handles client-side routing.

---

## 🎨 Customization

### Update Branding

In `public/index.html`:
- Line ~6: Update meta description
- Line ~7: Update page title
- Line ~67-81: Update logo and brand name

### Update Colors

CSS variables at line ~18-42:
```css
:root {
  --forest: #1B3A20;    /* Primary dark green */
  --gold: #C4890A;      /* Accent gold */
  --amber: #E0A020;     /* Buttons */
  /* ... */
}
```

### Update Products

Products array starts at line ~2856. Edit product details there.

---

## 🌐 Custom Domain

### On Vercel:

1. Go to Project Settings → Domains
2. Add your domain: `himsaru.com`
3. Add DNS records (Vercel will show exact records)
4. Wait for propagation (5-60 minutes)

### Update Backend CORS:

In Render environment variables:
```env
FRONTEND_URL=https://himsaru.com
```

---

## 📞 Support

**Still having issues?**

1. Check Vercel deployment logs
2. Check browser console (F12)
3. Verify backend is deployed and running
4. Test backend API directly with curl
5. Share the exact error message

---

**Your frontend is ready to deploy! 🚀**

Just remember to update the API_BASE URL first!
