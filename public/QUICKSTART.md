# ⚡ QUICK START - 3 Steps to Deploy

## 1️⃣ Update API URL

Open `public/index.html`, find line ~2854, and replace:
```javascript
const API_BASE = 'https://your-app-name.onrender.com/api';
```
with your actual Render backend URL.

## 2️⃣ Deploy to Vercel

**Option A - Vercel CLI** (fastest):
```bash
npm install -g vercel
cd himsaru-vercel-deploy
vercel --prod
```

**Option B - GitHub**:
```bash
git init
git add .
git commit -m "Deploy HIMSARU"
git remote add origin YOUR_GITHUB_URL
git push -u origin main
# Then import on vercel.com/dashboard
```

**Option C - Drag & Drop**:
1. Zip this folder
2. Go to vercel.com/dashboard
3. Upload the zip
4. Set Framework to "Other"
5. Deploy!

## 3️⃣ Test

Visit your Vercel URL and:
- ✅ Browse products
- ✅ Add to cart
- ✅ Register/login
- ✅ Place an order

---

## 🔧 Backend Not Deployed Yet?

No problem! Deploy backend first, then update the API_BASE URL and redeploy frontend.

**Backend Deployment:** See the backend deployment guide (himsaru-backend-FINAL.zip)

---

## 🎯 Settings Summary

| Vercel Setting | Value |
|----------------|-------|
| Framework | Other |
| Build Command | *(empty)* |
| Output Dir | *(empty)* |
| Root Dir | `./` |

---

**Need detailed help?** See `README.md`

**Ready to go!** 🚀
