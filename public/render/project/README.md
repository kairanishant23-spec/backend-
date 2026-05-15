# 🚀 HIMSARU Backend - Render Deployment

## ⚠️ IMPORTANT: Repository Structure

Your GitHub repository MUST look like this:

```
your-github-repo/
├── README.md           ← This file
├── .gitignore
├── .env.example
└── src/                ← All code goes in here
    ├── server.js
    ├── package.json
    ├── render.yaml
    ├── routes/
    ├── models/
    ├── middleware/
    └── public/
```

**The `src/` folder is REQUIRED!**

---

## 📦 Step 1: Push to GitHub

```bash
# You're already in the correct directory
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## ⚙️ Step 2: Configure Render (EXACT SETTINGS)

Go to Render Dashboard → Create New Web Service → Connect your GitHub repo

### Build & Deploy Settings:

```
┌─────────────────────────────────────────┐
│ Root Directory:    src                  │  ← Type EXACTLY: src
├─────────────────────────────────────────┤
│ Build Command:     npm install          │
├─────────────────────────────────────────┤
│ Start Command:     node server.js       │
└─────────────────────────────────────────┘
```

**CRITICAL:** 
- Root Directory = `src` (NOT blank, NOT `/src`, just `src`)
- This tells Render: "Run everything from the src/ folder"

---

## 🔑 Step 3: Set Environment Variables

In Render → Your Service → Environment tab:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/himsaru?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
FRONTEND_URL=https://your-frontend.vercel.app
```

**Get MongoDB URI:**
1. Go to MongoDB Atlas
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual database password

---

## 🎯 Step 4: Deploy

1. Click **"Create Web Service"** or **"Manual Deploy"**
2. Watch the build logs
3. Should see: ✅ Build successful
4. Should see: ✅ Your service is live at https://your-app.onrender.com

---

## ✅ Verify Deployment

Test these endpoints:

```bash
# Health check
curl https://your-app.onrender.com/api/health

# Expected response:
{"success": true, "message": "HIMSARU API is running!"}

# List all products
curl https://your-app.onrender.com/api/products
```

---

## 🐛 Troubleshooting

### Still getting "Cannot find package.json"?

**Check these EXACT steps:**

1. **Verify GitHub Structure:**
   ```bash
   # In your local repo, run:
   ls -la
   # You should see: README.md, .gitignore, src/
   
   ls -la src/
   # You should see: package.json, server.js, routes/, models/, etc.
   ```

2. **Verify Render Settings:**
   - Go to: Dashboard → Your Service → Settings → Build & Deploy
   - Root Directory field should show: `src`
   - If it shows anything else (blank, `/src`, `./src`), change it to just `src`
   - Click "Save Changes"

3. **Clear Build Cache:**
   - Settings → scroll down → "Clear build cache"
   - Then Manual Deploy → "Deploy latest commit"

4. **Check Build Logs:**
   - During deployment, logs should show:
   ```
   ==> Building from source
   ==> Using Node.js 18.x
   ==> Running 'npm install' in /opt/render/project/src
   ```
   - If it says `/opt/render/project/src/src`, your Root Directory is wrong!

### MongoDB Connection Issues?

- Service will start even without MongoDB
- Check logs for: "⚠️ MONGODB_URI not set"
- Make sure connection string format is correct
- Test connection using MongoDB Compass first

### CORS Errors?

- Add your frontend URL to `FRONTEND_URL` environment variable
- Make sure there's no trailing slash: `https://frontend.com` NOT `https://frontend.com/`

---

## 📞 Need Help?

If deployment still fails:
1. Copy the EXACT error message from Render logs
2. Check what Root Directory is set to
3. Verify your GitHub repo structure matches the layout above

**This structure is tested and works 100%!**
