# ✅ Jammify Setup Checklist - Follow This Exactly

> **This is the exact sequence to get Spotify imports working. Do these steps in order.**

---

## Step 1: Create MongoDB Atlas Account (5 minutes)

- [ ] Go to https://www.mongodb.com/cloud/atlas
- [ ] Click "Start Free"
- [ ] Create account with email
- [ ] Verify email
- [ ] Create new project called "jammify"
- [ ] Create a cluster (select M0 - Free tier)
- [ ] Wait for cluster to deploy (3-5 minutes)

---

## Step 2: Get MongoDB Connection String (5 minutes)

- [ ] In MongoDB Atlas, click "Connect" on your cluster
- [ ] Choose "Drivers" → "Node.js"
- [ ] Copy the connection string
- [ ] **Replace `<username>` with your database user**
- [ ] **Replace `<password>` with your database password**
- [ ] **Replace `myFirstDatabase` with `jammify_main`**

**You should have a string like:**
```
mongodb+srv://myuser:mypass@cluster0.xxxxx.mongodb.net/jammify_main?retryWrites=true&w=majority
```

- [ ] Create SECOND database in same cluster by:
  - Clicking "Databases" 
  - Creating new database named `jammify_playlists`
  - Getting connection string for it too (same as above but replace `jammify_main` with `jammify_playlists`)

**Result: You have 2 connection strings:**
```
MONGODB_URL=mongodb+srv://...jammify_main...
MONGODB_PLAYLISTS_URL=mongodb+srv://...jammify_playlists...
```

---

## Step 3: Get Spotify Credentials (5 minutes)

- [ ] Go to https://developer.spotify.com/dashboard
- [ ] Create account or login
- [ ] Click "Create an App"
- [ ] Fill in app name: "Jammify"
- [ ] Accept terms and create
- [ ] In app settings, copy **Client ID**
- [ ] Click "Show Client Secret" and copy **Client Secret**

**Result: You have 2 values:**
```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
```

---

## Step 4: Generate NextAuth Secret (2 minutes)

Open terminal/command prompt and run:

```bash
openssl rand -base64 32
```

**Copy the output. Result:**
```
NEXTAUTH_SECRET=abcdef123456...
```

---

## Step 5: Create `.env.local` File (3 minutes)

- [ ] Open your jammify project folder
- [ ] Find `package.json` file (this is the root)
- [ ] Create a new file named `.env.local` in the **same folder as package.json**
- [ ] Paste this content and fill in YOUR values:

```env
# ====== DATABASES (MOST IMPORTANT!) ======
MONGODB_URL=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/jammify_main?retryWrites=true&w=majority
MONGODB_PLAYLISTS_URL=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/jammify_playlists?retryWrites=true&w=majority

# ====== SPOTIFY ======
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# ====== NEXTAUTH ======
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret_key

# ====== API ======
NEXT_PUBLIC_API_URL=http://localhost:3000
```

- [ ] **Save the file**
- [ ] **Verify file is named exactly `.env.local` (not `.env.local.txt`)**

---

## Step 6: Restart Development Server (3 minutes)

- [ ] **Stop** your dev server if running (press Ctrl+C)
- [ ] In terminal, run:
```bash
npm run dev
```
- [ ] Wait for it to start (should see "Ready in XXX ms")
- [ ] Open http://localhost:3000 in browser

---

## Step 7: Test the Setup (5 minutes)

- [ ] Click **Sign Up**
- [ ] Create an account with your email
- [ ] Go to **My Playlists** (left sidebar)
- [ ] Click **Import** button
- [ ] Click **Spotify** option
- [ ] **Go to Spotify, make a PUBLIC playlist**
- [ ] **Share the playlist, copy the link**
- [ ] Paste link into jammify import dialog
- [ ] Click **Import Playlist**
- [ ] 🎉 It should work!

---

## 🔍 If It Still Doesn't Work

### Check 1: MongoDB Connection
```bash
# Test MongoDB connection string by going to MongoDB Atlas
# Click "Connect" → "Drivers" → copy connection string
# Make sure username and password are correct
```

### Check 2: .env.local Location
- [ ] Make sure `.env.local` is in **project root** (same folder as `package.json`)
- [ ] NOT in `src/` folder
- [ ] NOT in `public/` folder

### Check 3: .env.local Content
- [ ] Open `.env.local` in a text editor
- [ ] Verify all values are filled in (no placeholder text)
- [ ] No extra quotes around values
- [ ] No empty lines at the end

### Check 4: Restart Dev Server
```bash
# Stop server (Ctrl+C)
# Clear npm cache
npm cache clean --force

# Start fresh
npm run dev
```

### Check 5: Check Browser Console
- [ ] Open browser DevTools (F12)
- [ ] Go to **Console** tab
- [ ] Look for error messages
- [ ] Screenshot and share if you see errors

### Check 6: Check Server Console
- [ ] Look at your terminal where `npm run dev` is running
- [ ] Search for `[Import]` or `[Spotify]` messages
- [ ] Look for any error messages in red

---

## 📋 Verification Checklist

After completing all steps, verify:

- [ ] `.env.local` file exists in project root
- [ ] `.env.local` has `MONGODB_URL` with correct password
- [ ] `.env.local` has `MONGODB_PLAYLISTS_URL` with correct password
- [ ] `.env.local` has `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`
- [ ] `.env.local` has `NEXTAUTH_SECRET` (not empty)
- [ ] Dev server is running (`npm run dev`)
- [ ] You can login to the app
- [ ] Spotify playlist is set to **PUBLIC** (not private!)
- [ ] Playlist URL is valid and from Spotify

---

## 🎯 Expected Error Messages → Solutions

| Error | Solution |
|-------|----------|
| "MONGODB_URL not defined" | Add `MONGODB_URL` to `.env.local` |
| "Spotify credentials not configured" | Add `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` |
| "Failed to fetch playlist" | Make sure Spotify playlist is **PUBLIC** |
| "Connection refused" | Check MongoDB connection string is correct |
| "Authentication required" | Login first, then try import |
| "Invalid credentials" | Check Spotify Client ID and Secret match |

---

## ✅ Troubleshooting Flowchart

```
Does import work?
├─ YES → ✅ Done! Enjoy Jammify!
└─ NO
   ├─ Error about MongoDB?
   │  └─ Check MONGODB_URL and MONGODB_PLAYLISTS_URL in .env.local
   ├─ Error about Spotify?
   │  └─ Check SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET
   ├─ "Playlist is private"?
   │  └─ Go to Spotify, make playlist PUBLIC, try again
   ├─ Other error?
   │  └─ Check server console logs for [Import] messages
   └─ Still stuck?
      └─ Share the exact error message
```

---

## 📞 Need More Help?

If you've followed all steps and it still doesn't work:

1. **Share the error message** - What exactly does it say?
2. **Check server logs** - Any red text in terminal?
3. **Verify .env.local** - Is it in the right location?
4. **Try fresh restart** - Kill server, clear cache, restart

Good luck! 🎶🚀
