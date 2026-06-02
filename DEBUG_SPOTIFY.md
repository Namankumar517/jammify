# 🔍 Spotify Import Debug Guide

## The Error You're Seeing

```
Failed to fetch playlist from Spotify. Make sure:
1. The playlist is PUBLIC
2. The playlist URL is correct
3. The playlist exists
```

## What This REALLY Means

One of these is happening:
1. ❌ Spotify credentials are MISSING
2. ❌ Spotify credentials are INVALID/WRONG
3. ❌ Spotify API is temporarily down
4. ❌ The playlist URL format is wrong

## How to Debug

### Check 1: Is .env.local file created?

**On your computer:**
1. Open your jammify project folder
2. Look for a file called `.env.local` (starts with a dot)
3. Open it with a text editor
4. It should have these lines filled with REAL values:

```env
SPOTIFY_CLIENT_ID=your_actual_id
SPOTIFY_CLIENT_SECRET=your_actual_secret
MONGODB_URL=your_mongodb_connection
MONGODB_PLAYLISTS_URL=your_mongodb_connection_2
```

If the file:
- ❌ Doesn't exist → CREATE IT NOW
- ❌ Exists but empty → FILL IT WITH VALUES
- ✅ Exists and has values → Go to Check 2

### Check 2: Are Spotify credentials correct?

**Get NEW credentials:**
1. Go to https://developer.spotify.com/dashboard
2. Login
3. Find your app → Click "Settings"
4. Copy **Client ID** exactly (no spaces, no quotes)
5. Click "Show Client Secret" 
6. Copy **Client Secret** exactly (no spaces, no quotes)
7. Put them in `.env.local`

### Check 3: Did you restart the dev server?

**IMPORTANT:** After editing `.env.local`, you MUST restart:

```bash
# Stop the server (Ctrl+C in terminal)
# Wait 2 seconds
# Start it again
npm run dev
```

The app reads `.env.local` only at startup!

### Check 4: Is the playlist URL correct?

Your URL should look like:
```
https://open.spotify.com/playlist/0goo...
```

NOT:
```
https://open.spotify.com/user/...  ❌
https://open.spotify.com/album/...  ❌
https://open.spotify.com/track/...  ❌
```

### Check 5: Is the playlist PUBLIC?

1. Go to Spotify
2. Open your playlist
3. Click the three dots (...)
4. Look for "Make Private" or "Public"
5. If you see "Make Private" → It's already PUBLIC ✅
6. If you see "Make Public" → Click it to make it PUBLIC ✅

## The EXACT sequence to fix this:

1. Create/Edit `.env.local` with YOUR credentials
2. Restart dev server (`npm run dev`)
3. Go to Jammify app
4. Make sure Spotify playlist is PUBLIC
5. Copy Spotify playlist link
6. Try import again

## Still Not Working?

Check the CONSOLE LOGS:

**In your browser (F12 → Console):**
- Look for red error messages
- Screenshot and send

**In your terminal (where npm run dev is running):**
- Look for lines starting with `[Spotify]` or `[Import]`
- Look for red error text
- Screenshot and send

## Common Issues & Fixes

| Problem | Fix |
|---------|-----|
| "Credentials not configured" | `.env.local` is missing or server wasn't restarted |
| "Invalid credentials" | Spotify Client ID or Secret is wrong |
| "Failed to fetch playlist" | Playlist is PRIVATE or URL is wrong |
| "Unauthorized" | Spotify credentials format is wrong (extra spaces?) |

