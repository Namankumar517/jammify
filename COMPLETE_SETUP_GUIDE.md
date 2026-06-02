# 🚀 Complete Jammify Setup Guide

## ❌ Why Import Fails

Your Spotify (or YouTube Music) playlist import fails because **required environment variables are missing**. The app needs:

1. ✅ **Spotify API credentials** - for Spotify imports
2. ✅ **MongoDB databases** (2 of them!) - to store playlists & user data
3. ✅ **NextAuth credentials** - for authentication
4. ✅ **API URL** - for internal communication

---

## ✅ Step-by-Step Setup

### **Step 1: Set Up MongoDB (REQUIRED - Most Important!)**

This is the PRIMARY reason why imports fail.

#### Option A: Free MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new project called "jammify"
4. Create a cluster (free tier is fine)
5. Go to **Database → Deployments**
6. Click **Connect** on your cluster
7. Choose **Drivers** → **Node.js**
8. Copy the connection string
9. Replace `<password>` with your DB password and `<username>` with your username
10. Example: `mongodb+srv://myuser:mypass123@cluster0.abcde.mongodb.net/jammify_main?retryWrites=true&w=majority`

**You need to create 2 separate databases:**

1. **Database 1: Main App DB**
   ```
   MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/jammify_main?retryWrites=true&w=majority
   ```

2. **Database 2: Playlists DB**
   ```
   MONGODB_PLAYLISTS_URL=mongodb+srv://username:password@cluster.mongodb.net/jammify_playlists?retryWrites=true&w=majority
   ```

> 💡 **Tip:** You can use the same cluster but different database names (jammify_main, jammify_playlists)

---

### **Step 2: Get Spotify API Credentials**

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a free account (or login)
3. Click **Create an App**
4. Accept terms and create
5. In your app settings, copy:
   - **Client ID** → `SPOTIFY_CLIENT_ID`
   - **Client Secret** → `SPOTIFY_CLIENT_SECRET`

---

### **Step 3: Generate NextAuth Secret**

Run this command in your terminal:

```bash
openssl rand -base64 32
```

Copy the output and use it for `NEXTAUTH_SECRET`

---

### **Step 4: Create `.env.local` File**

In your project root (same level as `package.json`), create `.env.local`:

```env
# ========================
# DATABASES (REQUIRED!)
# ========================
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/jammify_main?retryWrites=true&w=majority
MONGODB_PLAYLISTS_URL=mongodb+srv://username:password@cluster.mongodb.net/jammify_playlists?retryWrites=true&w=majority

# ========================
# SPOTIFY CONFIGURATION
# ========================
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# ========================
# NEXTAUTH CONFIGURATION
# ========================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret_key_here

# ========================
# API CONFIGURATION
# ========================
NEXT_PUBLIC_API_URL=http://localhost:3000

# ========================
# OPTIONAL: Google OAuth
# ========================
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=

# ========================
# OPTIONAL: GitHub OAuth
# ========================
# GITHUB_CLIENT_ID=
# GITHUB_CLIENT_SECRET=
```

---

### **Step 5: Test Your Setup**

1. **Stop** any running dev server (Ctrl+C)
2. **Restart** your dev server:
   ```bash
   npm run dev
   ```
3. Open http://localhost:3000
4. **Sign up** for an account
5. Go to **My Playlists**
6. Click **Import** → **Spotify**
7. Paste a public Spotify playlist URL
8. It should work now! ✅

---

## 🔧 Troubleshooting

### Error: "MONGODB_URL environment variable not defined"

**Solution:** Add both MongoDB connection strings to `.env.local`

### Error: "Spotify API credentials are not configured"

**Solution:** 
- Add `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` to `.env.local`
- Restart your dev server

### Error: "Connection refused" or "Cannot connect to database"

**Solution:**
- Check your MongoDB connection string is correct
- Make sure you copied the full string including the password
- Verify MongoDB Atlas has your IP whitelisted (usually allows all IPs by default)

### Error: "Authentication required" when trying to import

**Solution:**
- Make sure you're logged in
- Check that `NEXTAUTH_SECRET` is set to a non-empty value

### Still not working?

Check the server console logs. Look for messages like:
- `[Import]` - Import process logs
- `[Spotify]` - Spotify API logs
- `[MongoDB]` - Database connection logs

---

## 🚀 Production Deployment (Vercel)

If deploying to Vercel:

1. Go to your Vercel project → **Settings → Environment Variables**
2. Add all the variables from `.env.local`:
   - `MONGODB_URL`
   - `MONGODB_PLAYLISTS_URL`
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `NEXTAUTH_URL` (set to your Vercel domain)
   - `NEXTAUTH_SECRET`
   - `NEXT_PUBLIC_API_URL` (set to your Vercel domain)

3. Redeploy your application

---

## 📚 What Each Variable Does

| Variable | Purpose | Required |
|----------|---------|----------|
| `MONGODB_URL` | Main database (users, auth) | ✅ YES |
| `MONGODB_PLAYLISTS_URL` | Playlist database | ✅ YES |
| `SPOTIFY_CLIENT_ID` | Spotify API auth | For Spotify imports |
| `SPOTIFY_CLIENT_SECRET` | Spotify API auth | For Spotify imports |
| `NEXTAUTH_URL` | Your app URL | ✅ YES |
| `NEXTAUTH_SECRET` | Session encryption key | ✅ YES |
| `NEXT_PUBLIC_API_URL` | Internal API calls | ✅ YES |

---

## ✨ Features That Now Work

After setup:
- ✅ Spotify playlist imports
- ✅ YouTube Music playlist imports
- ✅ User authentication
- ✅ Save playlists
- ✅ Like songs
- ✅ All app features

---

## 🔐 Security Notes

⚠️ **NEVER:**
- Commit `.env.local` to Git (it's in `.gitignore`)
- Share your MongoDB password or Spotify secrets
- Push environment variables to GitHub

✅ **DO:**
- Keep `.env.local` in `.gitignore`
- Use strong passwords for MongoDB
- Regenerate secrets if accidentally exposed

---

## 🆘 Still Need Help?

1. Check your `.env.local` file has all required variables
2. Make sure MongoDB connection strings are correct
3. Verify Spotify credentials are valid
4. Check server console for detailed error messages
5. Try a fresh dev server restart

Enjoy Jammify! 🎶
