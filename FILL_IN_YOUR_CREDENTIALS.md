# 📝 FILL IN YOUR CREDENTIALS HERE

**This is the easiest way to get it working!**

## Step 1: Get Your Spotify Credentials

Go to https://developer.spotify.com/dashboard

**Copy these 2 things:**
- Client ID: `_____________________`
- Client Secret: `_____________________`

## Step 2: Get Your MongoDB Connection Strings

Go to https://www.mongodb.com/cloud/atlas

**Copy these 2 connection strings:**
- Main DB: `_____________________`
- Playlists DB: `_____________________`

## Step 3: Generate NextAuth Secret

In terminal/command prompt, run:
```bash
openssl rand -base64 32
```

**Copy the output:**
- Secret: `_____________________`

---

## Step 4: Create `.env.local` File

In your jammify project folder (where `package.json` is), create a new file named:
```
.env.local
```

**Paste this exactly, but replace the blank parts with YOUR values from above:**

```env
# ========================
# SPOTIFY CONFIGURATION
# ========================
SPOTIFY_CLIENT_ID=YOUR_SPOTIFY_CLIENT_ID_HERE
SPOTIFY_CLIENT_SECRET=YOUR_SPOTIFY_CLIENT_SECRET_HERE

# ========================
# DATABASES
# ========================
MONGODB_URL=YOUR_MAIN_DB_CONNECTION_STRING_HERE
MONGODB_PLAYLISTS_URL=YOUR_PLAYLISTS_DB_CONNECTION_STRING_HERE

# ========================
# NEXTAUTH CONFIGURATION
# ========================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=YOUR_GENERATED_SECRET_KEY_HERE

# ========================
# API CONFIGURATION
# ========================
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Step 5: Restart Your Dev Server

In your terminal:

```bash
# Stop the server (press Ctrl+C)
# Wait 2 seconds
# Then start it again:
npm run dev
```

## Step 6: Test It

1. Go to http://localhost:3000
2. Sign up for an account
3. Go to "My Playlists"
4. Click "Import"
5. Select "Spotify"
6. Paste a **PUBLIC** Spotify playlist link
7. Click "Import Playlist"

## 🎯 It Should Work Now!

If not, send me:
1. Screenshot of the error
2. What's in your `.env.local` file (hide the passwords)
3. Any error messages from terminal or browser console
