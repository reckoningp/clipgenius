# ClipGenius - Complete Developer Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Building for Android](#building-for-android)
3. [Running the Backend Server](#running-the-backend-server)
4. [Connecting to Real AI APIs](#connecting-to-real-ai-apis)
5. [Going Live](#going-live)
6. [Monetization](#monetization)
7. [Troubleshooting](#troubleshooting)

---

## Project Overview

**ClipGenius** is an AI-powered video clipper app that:
- Detects best scenes in videos using Google Video Intelligence API
- Crops videos for different platforms (TikTok, Reels, YouTube, etc.)
- Generates thumbnails automatically
- Built with React Native (Expo) + Node.js backend

### Tech Stack
| Layer | Technology |
|-------|------------|
| Mobile App | React Native + Expo |
| Backend | Node.js + Express |
| AI/Video Processing | FFmpeg + Google Video Intelligence API |
| Database | AsyncStorage (local) |

---

## Building for Android

### Step 1: Generate Android Project

```bash
cd ClipGenius
npx expo prebuild --platform android --clean
```

This creates an `android/` folder with native Android code.

### Step 2: Open in Android Studio

**IMPORTANT: Open the `android` folder, NOT the root project folder!**

1. Launch **Android Studio**
2. Click **"Open an existing project"**
3. Navigate to your project folder
4. **Select the `android` subfolder** (NOT the root folder)
   - ❌ Wrong: `C:\Users\...ClipGenius\ClipGenius`
   - ✅ Correct: `C:\Users\...ClipGenius\ClipGenius\android`
5. Click **OK**
6. Wait for Gradle to sync (this may take 5-10 minutes on first run)

> **Troubleshooting**: If you don't see the Android files in the project view, try:
> - Go to **File → Invalidate Caches → Invalidate and Restart**
> - Or change the dropdown from "Android" to "Project" in the left sidebar

### Step 3: Build Debug APK

**Option A: Through Android Studio UI**
- Go to `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
- Wait for build to complete
- APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

**Option B: Through Command Line**
```bash
cd android
./gradlew assembleDebug
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 4: Install on Device

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Building Release APK (For Distribution)

1. Create a keystore (if you don't have one):
   ```bash
   keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Edit `android/app/build.gradle`:
   ```groovy
   android {
       signingConfigs {
           release {
               storeFile file("my-release-key.keystore")
               storePassword "your_password"
               keyAlias "alias_name"
               keyPassword "your_password"
           }
       }
   }
   ```

3. Build release:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

---

## Running the Backend Server

### Prerequisites
- Node.js 18+ (NOT included in XAMPP - download from nodejs.org)
- FFmpeg installed on server machine

### Option 1: Run Node.js Server Locally (Recommended)

**Note: XAMPP is for PHP/MySQL. Node.js runs separately.**

#### Step 1: Install Node.js
- Download from: https://nodejs.org (LTS version)
- Install and verify:
```bash
node --version   # Should show v18.x or higher
npm --version
```

#### Step 2: Install FFmpeg (Required for video processing)

**Windows:**
- Download from: https://ffmpeg.org/download.html
- OR install via chocolatey:
```powershell
choco install ffmpeg
```

**Mac:**
```bash
brew install ffmpeg
```

**Linux (Ubuntu):**
```bash
sudo apt install ffmpeg
```

#### Step 3: Install Server Dependencies

```bash
cd server
npm install
```

#### Step 4: Configure Google Cloud API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable **Video Intelligence API**
4. Go to **IAM & Admin** → **Service Accounts**
5. Create service account → add role "Video Intelligence API User"
6. Create key → download JSON file
7. Rename to `google-credentials.json` and place in `server/` folder

#### Step 5: Start Server

```bash
cd server
npm start
```

Server runs on: `http://localhost:3000`

#### Step 6: Test the API

```bash
curl http://localhost:3000/api/health
```

Should return: `{"status":"ok","timestamp":"..."}`

### Option 2: Connect Mobile App to Local Server

For the app to communicate with your local server:

1. **Find your computer's IP address:**
   - **Windows**: Open CMD, type `ipconfig` → look for "IPv4 Address" (e.g., 192.168.1.X)
   - **Mac/Linux**: Open Terminal, type `ip a` → look for "inet"

2. **Update app's API URL:**
   
   In `src/services/videoService.ts`, change:
   ```typescript
   let API_BASE_URL = 'http://192.168.1.X:3000/api';
   ```
   
   Replace `192.168.1.X` with your actual IP address.

3. **Ensure both devices are on the same WiFi**

4. **Allow firewall (if needed):**
   - Windows: Allow Node.js through firewall when prompted
   - Or temporarily disable firewall for testing

### Option 3: Using XAMPP (Optional - for Database)

If you want to use MySQL instead of local storage:

1. Start Apache and MySQL in XAMPP Control Panel
2. Create database in phpMyAdmin
3. Update server code to connect to MySQL

For now, the app uses AsyncStorage (local storage) so XAMPP is NOT required.

---

## Connecting to Real AI APIs

### For Mobile App (Development)

Update the API URL in `src/services/videoService.ts`:

```typescript
let API_BASE_URL = 'http://YOUR_SERVER_IP:3000/api';
```

Find your computer's IP:
- **Windows**: `ipconfig` in cmd
- **Mac/Linux**: `ifconfig` or `ip a`

### For Production

#### Option 1: Deploy Server to Cloud

**Heroku (Easiest):**
```bash
cd server
git init
heroku create clipgenius-api
heroku config:set GOOGLE_APPLICATION_CREDENTIALS="$(cat google-credentials.json)"
git add .
git commit -m "Add server"
git push heroku master
```

**Render:**
1. Connect GitHub to Render
2. Create new Web Service
3. Set build command: `npm install`
4. Set start command: `node index.js`
5. Add environment variable: `GOOGLE_APPLICATION_CREDENTIALS` with JSON content

**AWS EC2:**
1. Launch Ubuntu EC2 instance
2. Install Node.js and FFmpeg:
   ```bash
   sudo apt update
   sudo apt install nodejs npm ffmpeg
   ```
3. Upload server files and run

#### Option 2: Update Mobile App for Production

In `src/services/videoService.ts`:
```typescript
let API_BASE_URL = 'https://your-production-api.com/api';
```

---

## Hosting Backend Server for Free

> **Update (2024)**: Glitch no longer offers free hosting for new users. Use these alternatives instead.

### Option 1: Render (Best Free Option - Recommended)

Render is the best free option available now - no credit card required for free tier.

---

#### Step 1: Create GitHub Account (If You Don't Have One)

1. Go to [github.com](https://github.com)
2. Click **"Sign up"**
3. Enter your email, password, username
4. Complete verification
5. Verify your email

---

#### Step 2: Upload Server Files to GitHub

**Create a new repository:**

1. Go to [github.com](https://github.com)
2. Click **"+"** (top right) → **"New repository"**
3. Repository name: `clipgenius-server`
4. Select **"Public"**
5. Click **"Create repository"**

**Add files to your repository:**

1. On your new repo page, click **"uploading an existing file"**
2. Drag and drop these files from your `server/` folder:
   - `package.json`
   - `index.js`
3. Scroll down and click **"Commit changes"**

**Important**: Create a new file in GitHub called `glitch.json` with this content:
```json
{
  "name": "clipgenius-server",
  "scripts": {
    "start": "node index.js"
  }
}
```

---

#### Step 3: Deploy to Render

1. Go to [render.com](https://render.com)
2. Click **"Sign Up"**
3. Select **"Sign up with GitHub"**
4. Authorize Render to access your GitHub

**Create a new web service:**

1. Click **"New +"** → **"Web Service"**
2. Find and select your `clipgenius-server` repository
3. Configure:
   - **Name**: clipgenius-api
   - **Branch**: main
   - **Root Directory**: (leave empty)
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
4. Click **"Create Web Service"**

**Wait for deployment:**

1. Watch the logs (first time takes 2-3 minutes)
2. When you see "✓ Deployed", it's ready!

---

#### Step 4: Get Your Server URL

1. In Render dashboard, you'll see your service
2. The URL will be like: `https://clipgenius-api.onrender.com`
3. Test it: `https://clipgenius-api.onrender.com/api/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

**Note**: First request after 15 minutes of inactivity will take ~30 seconds (server sleeps on free tier)

---

#### Step 5: Update Mobile App

In `src/services/videoService.ts`:
```typescript
let API_BASE_URL = 'https://your-app-name.onrender.com/api';
```

---

#### Troubleshooting Render

**Problem: Build fails**
- Check that `package.json` has `"scripts": { "start": "node index.js" }`

**Problem: 502 Bad Gateway**
- Your server might have crashed
- Check "Logs" tab in Render dashboard

**Problem: Server timing out**
- This is normal - free tier sleeps after 15 min inactivity
- Wait 30-60 seconds, try again

---

### Option 2: Fly.io (Best for Video Processing)

Fly.io is great if you need FFmpeg for real video processing.

#### Step 1: Install Fly CLI

**Windows:**
1. Open PowerShell as Administrator
2. Run:
```powershell
winget install flyctl
```

**Mac:**
```bash
brew install flyctl
```

**Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

#### Step 2: Login to Fly

```bash
fly auth login
```

This opens a browser - sign in with GitHub or email.

#### Step 3: Deploy Your Server

1. Create a folder on your computer with these files:
   - `package.json` (from your server)
   - `index.js` (from your server)
   - `Dockerfile` (create new file):

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000
CMD ["node", "index.js"]
```

2. Run in that folder:
```bash
fly launch
```

3. Follow the prompts:
   - App name: `clipgenius-api`
   - Region: select closest to you
   - Deploy now: **No** (press n)

4. After setup, run:
```bash
fly deploy
```

#### Step 4: Get Your URL

- Your URL: `https://clipgenius-api.fly.dev`
- Test: `https://clipgenius-api.fly.dev/api/health`

---

### Option 3: Railway (Simple)

#### Step 1: Sign Up

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Verify your email

#### Step 2: Deploy

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Select your `clipgenius-server` repo
4. Wait for deployment

#### Step 3: Configure

- **Build Command**: `npm install`
- **Start Command**: `node index.js`

---

### Option 4: Keep Using Local Development

If you don't want to host yet, run locally:

```bash
cd server
npm install
npm start
```

Your server runs at: `http://localhost:3000`

For testing on your phone, use:
```typescript
// Use your computer's IP address
let API_BASE_URL = 'http://192.168.1.100:3000/api';
```

---

### Quick Comparison

| Platform | Free Limits | Sleep? | Best For |
|----------|-------------|--------|----------|
| **Render** | 750 hrs/mo | Yes (15 min) | Beginners |
| **Fly.io** | 3 VMs | No | Video processing |
| **Railway** | $5 credit/mo | Yes | Quick setup |
| **Local** | Unlimited | N/A | Development |

---

### Important Notes

1. **Google Cloud Costs**: Video Intelligence API has a free tier
   - First 60 minutes/month = FREE
   - Monitor usage in Google Cloud Console

2. **Video Size Limits**: Free tiers typically limit file size to 10-100MB

---

## Going Live

#### Step 1: Prepare Your Code
1. Create a GitHub repository
2. Upload your `server/` folder contents
3. Create a `package.json` in the root (same as Glitch)

#### Step 2: Deploy to Render
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **"New"** → **"Web Service"**
4. Connect your GitHub repository
5. Configure:
   - **Name**: clipgenius-api
   - **Root Directory**: (leave empty or set to server)
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`

#### Step 3: Add Environment Variables
1. In Render dashboard, go to **"Environment"**
2. Add:
   - `GOOGLE_APPLICATION_CREDENTIALS` - Paste your entire JSON credential content
   - (Any other env vars from your .env file)

#### Step 4: Get Your URL
- Your API will be at: `https://clipgenius-api.onrender.com`
- Health check: `https://clipgenius-api.onrender.com/api/health`

**Note**: Render's free tier puts instances to sleep after 15 min of inactivity. First request after sleep takes ~30 seconds to wake up.

---

### Option 3: Fly.io (Good for Video Processing)

#### Step 1: Install Fly CLI
**Windows (PowerShell):**
```powershell
winget install flyctl
```

**Mac:**
```bash
brew install flyctl
```

#### Step 2: Login and Launch
```bash
fly auth login
cd server
fly launch
```

Follow the prompts:
- App name: `clipgenius-api`
- Region: Select closest to you
- Deploy now: No (we'll configure first)

#### Step 3: Configure for FFmpeg
Edit `fly.toml` to include FFmpeg:
```toml
[build]
  image = " flew/builder"

[run]
  cmd = "npm start"
```

#### Step 4: Add Secrets
```bash
fly secrets set GOOGLE_APPLICATION_CREDENTIALS="$(cat google-credentials.json)"
```

#### Step 5: Deploy
```bash
fly deploy
```

Your URL: `https://clipgenius-api.fly.dev`

---

### Option 4: Railway (Simple Setup)

#### Step 1: Deploy
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Select your repository

#### Step 2: Configure
- Build Command: `npm install`
- Start Command: `node index.js`

#### Step 3: Add Environment Variables
Add your Google Cloud credentials in the Variables tab.

---

### Quick Comparison

| Platform | Free Limits | Cold Start | Best For |
|----------|-------------|------------|----------|
| **Glitch** | Unlimited | ~3 sec | Quick testing |
| **Render** | 750 hrs/mo | ~30 sec | Production-like |
| **Fly.io** | 3 VMs | ~5 sec | Video processing |
| **Railway** | $5 credit/mo | ~10 sec | Easy setup |

---

### Important Notes

1. **Google Cloud Costs**: The Video Intelligence API has a free tier:
   - First 60 minutes/month = FREE
   - After that: ~$0.05/minute
   - Monitor usage in Google Cloud Console

2. **Video Upload Size**: 
   - Free hosting often has file size limits (typically 10-100MB)
   - Consider compressing videos before upload in production

3. **HTTPS**: All these platforms provide HTTPS automatically

---

### Testing Your Deployed API

```bash
# Replace with your actual URL
curl https://your-app.glitch.me/api/health
```

Response should be: `{"status":"ok","timestamp":"..."}`

---

## Going Live

### 1. Google Play Store Submission

#### Prepare Release APK
```bash
cd android
./gradlew assembleRelease
```

Sign the APK with your keystore (see Step 4 above)

#### Create Google Play Developer Account
- Go to [Google Play Console](https://play.google.com/console)
- Pay $25 one-time fee

#### Submit App
1. Create app in Play Console
2. Upload your signed APK
3. Fill in:
   - App name: "ClipGenius"
   - Description
   - Screenshots (create using device or emulator)
   - Privacy Policy (required - can use free template)
4. Submit for review (typically 1-2 hours)

### 2. App Store (iOS) - Future

For iOS, you'll need:
- Apple Developer Account ($99/year)
- Run `npx expo prebuild --platform ios`
- Build with Xcode

---

## Monetization

### Option 1: In-App Purchases (Recommended)

**Implementation:**

1. Install Expo In-App Purchases:
```bash
npx expo install expo-in-app-purchases
```

2. Add subscription plans:
- **Free**: 3 videos/month
- **Pro** ($4.99/month): Unlimited videos, HD quality
- **Enterprise** ($9.99/month): + API access, team features

3. Track usage in backend:
```javascript
// server/index.js - add to process-video endpoint
const userUsage = await getUserUsage(userId);
if (userUsage.monthly >= 3 && !user.isPro) {
  return res.status(402).json({ error: 'Upgrade to Pro' });
}
```

### Option 2: Ads

**Using AdMob:**
```bash
npx expo install react-native-google-mobile-ads
```

Add ad units to:
- Home screen (banner)
- Between clips (interstitial)
- Video player (rewarded ads)

### Option 3: Freemium Model

| Feature | Free | Pro |
|---------|------|-----|
| Videos/month | 3 | Unlimited |
| Quality | Medium | High |
| Platforms | TikTok, Reels | All |
| Thumbnails | 3 | 10 |
| API Access | ❌ | ✅ |
| Price | $0 | $4.99/mo |

### Option 4: API as a Service

Offer your AI processing as an API to other developers:
- $0.01 per video processing
- Pay-as-you-go pricing
- White-label options

---

## Troubleshooting

### Common Issues

**1. Gradle Build Fails**
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

**2. App Can't Connect to Server**
- Ensure phone and server are on same WiFi
- Check firewall allows port 3000
- Use correct local IP (not localhost)

**3. Google API Error**
- Verify credentials JSON is correct
- Check API is enabled in Google Cloud Console
- Ensure billing is set up (Google APIs require billing)

**4. FFmpeg Not Found**
```bash
# Windows - add to system PATH or install via chocolatey
choco install ffmpeg

# Mac
brew install ffmpeg

# Linux
sudo apt install ffmpeg
```

**5. APK Too Large**
- Enable ProGuard minification in `build.gradle`
- Remove unused dependencies

---

## File Structure

```
ClipGenius/
├── App.tsx                 # Main app with navigation
├── src/
│   ├── screens/           # All app screens
│   │   ├── AuthScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── UploadScreen.tsx
│   │   ├── VideoDetailScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── AdminScreen.tsx
│   ├── components/        # Reusable UI components
│   ├── services/          # API calls
│   ├── context/           # State management
│   ├── types/             # TypeScript definitions
│   └── utils/             # Theme & utilities
├── android/               # Android native project
└── server/                # Backend server
    ├── index.js           # Main server code
    ├── package.json
    ├── .env.example
    └── google-credentials.json
```

---

## Next Steps

1. ✅ Build debug APK → Test on device
2. ✅ Run backend server → Test AI processing
3. ⚙️ Configure production API
4. 📱 Submit to Play Store
5. 💰 Implement monetization

---

## Support

For issues, check:
- [Expo Docs](https://docs.expo.dev)
- [React Navigation Docs](https://reactnavigation.org)
- [Google Video Intelligence Docs](https://cloud.google.com/video-intelligence/docs)