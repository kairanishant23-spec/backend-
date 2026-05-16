# 🌿 HIMSARU Backend - Render Deployment

## ✅ CORRECT Repository Structure

Your repo MUST look exactly like this:

```
backend-correct-structure/
├── README.md              ← This file (at root)
├── .gitignore             ← At root
└── src/                   ← All code goes in here
    ├── server.js
    ├── package.json
    ├── render.yaml
    ├── routes/
    ├── models/
    ├── middleware/
    └── public/
```

**The `src/` folder is REQUIRED for Render deployment!**

---

## 🚀 Deploy to Render

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Backend ready for Render"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/himsaru-backend.git
git push -u origin main
```

### Step 2: Render Settings

Go to https://dashboard.render.com

**Create New Web Service:**

```
┌─────────────────────────────────────┐
│ Name: himsaru-api                   │
├─────────────────────────────────────┤
│ Root Directory: src                 │ ← Type exactly: src
│                 ^^^                 │
│                 CRITICAL!           │
├─────────────────────────────────────┤
│ Build Command: npm install          │
├─────────────────────────────────────┤
│ Start Command: node server.js       │
└─────────────────────────────────────┘
```

### Step 3: Environment Variables

**Minimum for deployment:**
```env
NODE_ENV=production
PORT=10000
JWT_SECRET=your_random_32_character_secret_key
```

**Full setup (add these when ready):**
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/himsaru
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
FRONTEND_URL=https://your-frontend.vercel.app
```

### Step 4: Deploy

Click **"Create Web Service"** and wait for deployment!

---

## ✅ Why This Structure Works

```
GitHub Repo                      Render Filesystem
───────────────────────────────────────────────────
your-repo/src/package.json  →   /opt/render/project/src/package.json ✅
your-repo/src/server.js     →   /opt/render/project/src/server.js ✅

When Root Directory = "src":
- Render runs: cd /opt/render/project/src
- Then runs: npm install (finds package.json ✅)
- Then runs: node server.js (finds server.js ✅)
```

---

## 🧪 Test After Deployment

```bash
# Health check
curl https://your-app.onrender.com/api/health

# Expected:
{"success": true, "message": "HIMSARU API is running!"}
```

---

## 🐛 Troubleshooting

### Error: "Root directory 'src' does not exist"

**Cause:** Your GitHub repo doesn't have a `src` folder

**Check:** Go to your GitHub repo - do you see a `src/` folder?

**Fix Option 1:** Use this correct structure (recommended)

**Fix Option 2:** If files are at root, set Root Directory to blank in Render

---

### Error: "Cannot find package.json"

**Cause:** Root Directory setting doesn't match repo structure

**Fix:** 
- If package.json is in `src/` → Root Directory = `src`
- If package.json is at root → Root Directory = (blank)

---

**This structure is guaranteed to work! 🚀**
