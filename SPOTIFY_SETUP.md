# 🎵 Spotify Import Setup Guide

## ❌ Problem: Spotify Playlist Import Not Working

If you're getting an error when trying to import Spotify playlists, it's likely because **Spotify API credentials are not configured**.

---

## ✅ Solution: Configure Spotify API Credentials

### Step 1: Get Spotify API Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. **Log in** with your Spotify account (create one if needed - it's free)
3. Click **"Create an App"**
4. Accept the terms and create the app
5. You'll see two credentials:
   - **Client ID**
   - **Client Secret**

⚠️ **IMPORTANT:** Keep your `Client Secret` private! Never share it or commit it to GitHub.

---

### Step 2: Add Credentials to Your Project

#### Option A: Using `.env.local` (Recommended for local development)

1. Create a file named `.env.local` in the **root of your project** (same level as `package.json`)

2. Copy this and replace with your credentials:

```env
SPOTIFY_CLIENT_ID=your_client_id_from_spotify_dashboard
SPOTIFY_CLIENT_SECRET=your_client_secret_from_spotify_dashboard
```

3. **Save the file**

4. Restart your development server:
   ```bash
   npm run dev
   ```

#### Option B: Using Environment Variables in Vercel (For Production)

If you're deploying on Vercel:

1. Go to your Vercel project settings
2. Navigate to **Settings → Environment Variables**
3. Add two new variables:
   - Name: `SPOTIFY_CLIENT_ID` | Value: `your_client_id`
   - Name: `SPOTIFY_CLIENT_SECRET` | Value: `your_client_secret`
4. **Redeploy** your project

---

### Step 3: Test the Setup

1. Start your app (or restart if already running)
2. Go to **My Playlists** page
3. Click **Import** button
4. Select **Spotify**
5. Paste a public Spotify playlist URL
6. Try importing - it should work now! ✅

---

## 🔧 Troubleshooting

### Error: "Spotify import is not configured"

**Solution:** Make sure your `.env.local` file:
- Is in the **project root** (not in `src/`)
- Contains both `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`
- Has the **correct values** from Spotify Dashboard
- Server was **restarted** after adding the file

### Error: "Invalid Spotify API credentials"

**Solution:** 
- Double-check your Client ID and Secret
- Make sure you copied them correctly (no extra spaces)
- Try generating new credentials from Spotify Dashboard

### Error: "Failed to fetch playlist from Spotify"

**Solution:**
- Make sure your Spotify playlist is set to **PUBLIC** (not private)
- Verify the playlist URL is correct
- Try a different playlist to test

### Still not working?

Check your server console for detailed error messages. Look for lines starting with `[Spotify]` or `[Import]`.

---

## 📚 Reference Links

- [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api)
- [Spotify API Authentication](https://developer.spotify.com/documentation/general/guides/authorization/)

---

## 🔐 Security Notes

- **Never** commit `.env.local` to Git (it's already in `.gitignore`)
- **Never** share your `Client Secret` publicly
- Use environment variables for production deployments
- The `Client ID` is safe to expose (used in frontend), but keep `Client Secret` private

---

## ✨ What's New in the Fix

The latest update includes:

✅ Better error messages explaining what went wrong  
✅ Guidance on how to fix configuration issues  
✅ Graceful fallback if credentials are missing  
✅ Support for both local development and production  
✅ Detailed logging for debugging  

Enjoy importing your Spotify playlists! 🎶
