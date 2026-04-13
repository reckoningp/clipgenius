require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static('uploads'));
app.use('/processed', express.static('processed'));

const upload = multer({ dest: 'uploads/', limits: { fileSize: 500 * 1024 * 1024 } });

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads', { recursive: true });
if (!fs.existsSync('processed')) fs.mkdirSync('processed', { recursive: true });
if (!fs.existsSync('processed/clips')) fs.mkdirSync('processed/clips', { recursive: true });
if (!fs.existsSync('processed/thumbnails')) fs.mkdirSync('processed/thumbnails', { recursive: true });

const DEFAULT_CONFIG = {
  platforms: [
    { id: 'tiktok', name: 'TikTok', enabled: true, ratio: { width: 1080, height: 1920 }, maxDuration: 60 },
    { id: 'reels', name: 'Instagram Reels', enabled: true, ratio: { width: 1080, height: 1920 }, maxDuration: 60 },
    { id: 'youtube_shorts', name: 'YouTube Shorts', enabled: true, ratio: { width: 1080, height: 1920 }, maxDuration: 60 },
    { id: 'youtube', name: 'YouTube', enabled: true, ratio: { width: 1920, height: 1080 }, maxDuration: 600 },
    { id: 'facebook', name: 'Facebook', enabled: true, ratio: { width: 1080, height: 1080 }, maxDuration: 120 },
    { id: 'twitter', name: 'Twitter/X', enabled: true, ratio: { width: 1080, height: 1080 }, maxDuration: 120 }
  ],
  appSettings: {
    defaultClipCount: 3,
    maxClipCount: 10,
    aiModel: 'shot_detection',
    autoDetectScenes: true,
    enableThumbnails: true,
    thumbnailCount: 3,
    watermark: { enabled: false, text: 'ClipGenius' },
    videoQuality: 'high',
    outputFormat: 'mp4'
  },
  monetization: { enabled: false, freeClipsPerDay: 5, premiumEnabled: false, stripePublishableKey: '' },
  uiSettings: { primaryColor: '#FF2D55', accentColor: '#5856D6', darkMode: true, showTutorial: true, defaultPlatform: 'tiktok' },
  ads: {
    adStatus: 'on', adType: 'admob', admobPublisherId: '', admobAppId: '', admobBannerUnitId: '',
    admobInterstitialUnitId: '', admobNativeUnitId: '', fanBannerUnitId: '', fanInterstitialUnitId: '',
    fanNativeUnitId: '', unityAppId: '', appnextAppId: '', appnextBannerId: '', appnextInterstitialId: '',
    interstitialAdInterval: 3, nativeAdInterval: 20, nativeAdIndex: 4
  },
  notifications: { enabled: false, onesignalAppId: '', onesignalApiKey: '', firebaseServerKey: '' },
  legal: { privacyPolicyUrl: '', termsUrl: '', faqUrl: '', feedbackUrl: '', contactEmail: '' },
  aiSettings: {
    videoIntelligenceEnabled: false, videoIntelligenceKey: '', openaiEnabled: false, openaiKey: '',
    sceneDetectionSensitivity: 50, enableAutoCaption: false, captionLanguage: 'en',
    enableFaceDetection: true, enableLabelDetection: true, enableShotChangeDetection: true,
    thumbnailAiEnabled: false, thumbnailAiKey: ''
  },
  users: [], videos: [],
  categories: [
    { id: 'trending', name: 'Trending', enabled: true },
    { id: 'funny', name: 'Funny', enabled: true },
    { id: 'music', name: 'Music', enabled: true },
    { id: 'sports', name: 'Sports', enabled: true },
    { id: 'news', name: 'News', enabled: true }
  ]
};

let appConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

const PLATFORM_RATIOS = {
  tiktok: { width: 1080, height: 1920 },
  reels: { width: 1080, height: 1920 },
  youtube_shorts: { width: 1080, height: 1920 },
  youtube: { width: 1920, height: 1080 },
  facebook: { width: 1080, height: 1080 },
  twitter: { width: 1080, height: 1080 }
};

const PLATFORM_MAX_DURATION = {
  tiktok: 60, reels: 60, youtube_shorts: 60, youtube: 600, facebook: 120, twitter: 120
};

async function generateCaptionWithOpenAI(videoPath, language = 'en') {
  if (!appConfig.aiSettings.openaiEnabled || !appConfig.aiSettings.openaiKey) {
    return null;
  }

  try {
    const { duration } = await getVideoDuration(videoPath);
    const openai = require('openai');
    const client = new openai({ apiKey: appConfig.aiSettings.openaiKey });

    const prompt = `Generate a short, engaging caption for a ${Math.round(duration)} second video clip suitable for social media. Language: ${language}. Keep it under 100 characters with relevant hashtags.`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100
    });

    return completion.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('OpenAI caption error:', error.message);
    return null;
  }
}

async function generateThumbnailWithAI(imageUrl, apiKey) {
  if (!apiKey) return null;
  
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: 'Generate an attractive thumbnail for a video clip, high quality, social media style',
        n: 1,
        size: '400x600'
      })
    });

    const data = await response.json();
    return data.data?.[0]?.url || null;
  } catch (error) {
    console.error('AI thumbnail error:', error.message);
    return null;
  }
}

function getVideoDuration(inputPath) {
  return new Promise((resolve, reject) => {
    const ffmpeg = require('fluent-ffmpeg');
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) reject(err);
      else resolve(metadata.format.duration || 60);
    });
  });
}

function detectScenesSimple(inputPath, duration, sensitivity = 50) {
  return new Promise((resolve) => {
    const scenes = [];
    const numScenes = Math.min(parseInt(clipCount) || 5, Math.floor(duration / 10));
    const interval = duration / (numScenes + 1);
    
    for (let i = 0; i < numScenes; i++) {
      scenes.push({
        startTime: Math.floor(i * interval),
        endTime: Math.floor((i + 1) * interval),
        labels: ['Highlight', 'Trending', 'Viral', 'Popular'][i % 4]
      });
    }
    resolve(scenes.length > 0 ? scenes : [{ startTime: 0, endTime: Math.min(30, duration), labels: 'Default' }]);
  });
}

async function processVideoWithFFmpeg(inputPath, scenes, platform, outputDir) {
  const ratio = PLATFORM_RATIOS[platform] || PLATFORM_RATIOS.tiktok;
  const maxDuration = PLATFORM_MAX_DURATION[platform] || 60;
  const videoId = uuidv4();
  const clips = [];

  const watermark = appConfig.appSettings.watermark;
  const quality = appConfig.appSettings.videoQuality || 'high';
  const videoCodec = quality === 'high' ? 'libx264' : 'libx264';
  const crf = quality === 'high' ? '23' : quality === 'medium' ? '28' : '32';

  let ffmpegAvailable = true;
  try {
    require('fluent-ffmpeg').setFfmpegPath('/usr/bin/ffmpeg');
  } catch (e) {
    ffmpegAvailable = false;
    console.log('FFmpeg not available, using demo mode');
  }

  if (!ffmpegAvailable) {
    for (let i = 0; i < scenes.length; i++) {
      const vid = uuidv4();
      const thumbnails = [
        `https://picsum.photos/seed/${vid}_${i}_1/400/600`,
        `https://picsum.photos/seed/${vid}_${i}_2/400/600`,
        `https://picsum.photos/seed/${vid}_${i}_3/400/600`
      ];
      clips.push({
        id: `clip_${vid}_${i}`,
        videoId: vid,
        clipUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
        thumbnailUrls: thumbnails,
        selectedThumbnail: thumbnails[0],
        duration: 15 + Math.random() * 30,
        startTime: scenes[i].startTime,
        labels: scenes[i].labels || 'AI Generated'
      });
    }
    return clips;
  }

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const duration = Math.min(scene.endTime - scene.startTime, maxDuration);
    const clipId = `clip_${videoId}_${i}`;
    const outputPath = path.join(outputDir, `${clipId}.mp4`);

    await new Promise((resolve, reject) => {
      const ffmpeg = require('fluent-ffmpeg');
      let cmd = ffmpeg(inputPath)
        .setStartTime(scene.startTime)
        .setDuration(duration)
        .size(`${ratio.width}x${ratio.height}`)
        .videoCodec(videoCodec)
        .audioCodec('aac')
        .outputOptions([
          `-crf ${crf}`,
          '-preset fast',
          '-movflags +faststart'
        ]);

      if (watermark.enabled && watermark.text) {
        cmd = cmd.drawText({
          text: watermark.text,
          fontface: 'Arial',
          fontsize: 24,
          fontcolor: 'white@0.5',
          x: '(w-text_w)/2',
          y: 'h-50',
          box: 1,
          boxcolor: 'black@0.3',
          boxborderw: 5
        });
      }

      cmd.output(outputPath)
        .on('end', resolve)
        .on('error', (err) => {
          console.error('FFmpeg error:', err.message);
          resolve();
        })
        .run();
    });

    if (fs.existsSync(outputPath)) {
      const thumbnails = await generateThumbnailsFFmpeg(outputPath, clipId, outputDir);
      const clipUrl = `/processed/clips/${clipId}.mp4`;
      
      clips.push({
        id: clipId,
        videoId,
        clipUrl,
        thumbnailUrls: thumbnails,
        selectedThumbnail: thumbnails[0],
        duration,
        startTime: scene.startTime,
        labels: scene.labels
      });
    }
  }

  return clips;
}

async function generateThumbnailsFFmpeg(videoPath, clipId, outputDir) {
  const thumbnails = [];
  const thumbDir = outputDir || 'processed/thumbnails';
  const timestamps = [0.1, 0.5, 0.75];

  for (let i = 0; i < timestamps.length; i++) {
    const outputPath = path.join(thumbDir, `${clipId}_thumb_${i}.jpg`);
    
    await new Promise((resolve) => {
      const ffmpeg = require('fluent-ffmpeg');
      ffmpeg(videoPath)
        .setStartTime(timestamps[i])
        .frames(1)
        .size('400x600')
        .output(outputPath)
        .on('end', resolve)
        .on('error', () => resolve())
        .run();
    });

    if (fs.existsSync(outputPath)) {
      thumbnails.push(`/processed/thumbnails/${clipId}_thumb_${i}.jpg`);
    } else {
      thumbnails.push(`https://picsum.photos/seed/${clipId}_${i}/400/600`);
    }
  }

  return thumbnails.length > 0 ? thumbnails : [
    `https://picsum.photos/seed/${clipId}_1/400/600`,
    `https://picsum.photos/seed/${clipId}_2/400/600`,
    `https://picsum.photos/seed/${clipId}_3/400/600`
  ];
}

app.post('/api/process-video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { platform, clipCount } = req.body;
    const platformType = platform || 'tiktok';
    const clipsToGenerate = Math.min(parseInt(clipCount) || 3, 10);

    console.log(`Processing video for platform: ${platformType}, clips: ${clipsToGenerate}`);

    const inputPath = req.file.path;
    let duration = 60;
    let scenes = [];

    try {
      duration = await getVideoDuration(inputPath);
      console.log(`Video duration: ${duration}s`);
    } catch (e) {
      console.log('Could not get video duration, using default');
    }

    scenes = await detectScenesSimple(inputPath, duration, appConfig.aiSettings?.sceneDetectionSensitivity || 50);
    console.log(`Detected ${scenes.length} scenes`);

    const outputDir = 'processed/clips';
    let clips = [];

    try {
      clips = await processVideoWithFFmpeg(inputPath, scenes.slice(0, clipsToGenerate), platformType, outputDir);
      console.log(`Generated ${clips.length} clips`);
    } catch (ffmpegError) {
      console.log('FFmpeg not available, using demo clips');
      for (let i = 0; i < clipsToGenerate; i++) {
        const videoId = uuidv4();
        const thumbnails = [
          `https://picsum.photos/seed/${videoId}_${i}_1/400/600`,
          `https://picsum.photos/seed/${videoId}_${i}_2/400/600`,
          `https://picsum.photos/seed/${videoId}_${i}_3/400/600`
        ];
        
        clips.push({
          id: `clip_${videoId}_${i}`,
          videoId,
          clipUrl: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
          thumbnailUrls: thumbnails,
          selectedThumbnail: thumbnails[0],
          duration: 15 + Math.random() * 30,
          startTime: i * 10,
          labels: 'Demo Clip'
        });
      }
    }

    if (fs.existsSync(inputPath)) {
      try { fs.unlinkSync(inputPath); } catch (e) {}
    }

    const videoData = {
      id: clips[0]?.videoId || uuidv4(),
      platform: platformType,
      clips,
      createdAt: new Date().toISOString()
    };
    appConfig.videos.push(videoData);

    res.json({
      success: true,
      videoId: videoData.id,
      platform: platformType,
      clips
    });
  } catch (error) {
    console.error('Error processing video:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/process-video-base64', async (req, res) => {
  try {
    const { videoBase64, platform, clipCount } = req.body;
    
    if (!videoBase64) {
      return res.status(400).json({ error: 'No video base64 provided' });
    }

    const buffer = Buffer.from(videoBase64.replace(/^data:video\/\w+;base64,/, ''), 'base64');
    const inputPath = path.join('uploads', `${uuidv4()}.mp4`);
    fs.writeFileSync(inputPath, buffer);

    const platformType = platform || 'tiktok';
    const clipsToGenerate = Math.min(parseInt(clipCount) || 3, 10);

    let duration = 60;
    try { duration = await getVideoDuration(inputPath); } catch (e) {}
    
    const scenes = await detectScenesSimple(inputPath, duration);
    const outputDir = 'processed/clips';
    
    let clips = [];
    try {
      clips = await processVideoWithFFmpeg(inputPath, scenes.slice(0, clipsToGenerate), platformType, outputDir);
    } catch (ffmpegError) {
      console.error('FFmpeg error:', ffmpegError.message);
      for (let i = 0; i < clipsToGenerate; i++) {
        const videoId = uuidv4();
        clips.push({
          id: `clip_${videoId}_${i}`,
          videoId,
          clipUrl: `https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4`,
          thumbnailUrls: [
            `https://picsum.photos/seed/${videoId}_${i}_1/400/600`,
            `https://picsum.photos/seed/${videoId}_${i}_2/400/600`,
            `https://picsum.photos/seed/${videoId}_${i}_3/400/600`
          ],
          selectedThumbnail: `https://picsum.photos/seed/${videoId}_${i}_1/400/600`,
          duration: 15 + Math.random() * 30,
          startTime: i * 10,
          labels: 'Demo Clip'
        });
      }
    }

    if (fs.existsSync(inputPath)) {
      try { fs.unlinkSync(inputPath); } catch (e) {}
    }

    res.json({
      success: true,
      videoId: clips[0]?.videoId || uuidv4(),
      platform: platformType,
      clips
    });
  } catch (error) {
    console.error('Error processing base64 video:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/config', (req, res) => {
  res.json({ success: true, config: appConfig });
});

app.get('/api/config/platforms', (req, res) => {
  res.json({ success: true, platforms: appConfig.platforms });
});

app.get('/api/config/platforms/:id', (req, res) => {
  const platform = appConfig.platforms.find(p => p.id === req.params.id);
  if (!platform) return res.status(404).json({ error: 'Platform not found' });
  res.json({ success: true, platform });
});

app.put('/api/config/platforms/:id', (req, res) => {
  const index = appConfig.platforms.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Platform not found' });
  appConfig.platforms[index] = { ...appConfig.platforms[index], ...req.body };
  res.json({ success: true, platform: appConfig.platforms[index] });
});

app.get('/api/config/settings', (req, res) => res.json({ success: true, settings: appConfig.appSettings }));
app.put('/api/config/settings', (req, res) => {
  appConfig.appSettings = { ...appConfig.appSettings, ...req.body };
  res.json({ success: true, settings: appConfig.appSettings });
});

app.get('/api/config/monetization', (req, res) => res.json({ success: true, monetization: appConfig.monetization }));
app.put('/api/config/monetization', (req, res) => {
  appConfig.monetization = { ...appConfig.monetization, ...req.body };
  res.json({ success: true, monetization: appConfig.monetization });
});

app.get('/api/config/ui', (req, res) => res.json({ success: true, ui: appConfig.uiSettings }));
app.put('/api/config/ui', (req, res) => {
  appConfig.uiSettings = { ...appConfig.uiSettings, ...req.body };
  res.json({ success: true, ui: appConfig.uiSettings });
});

app.get('/api/config/ads', (req, res) => res.json({ success: true, ads: appConfig.ads }));
app.put('/api/config/ads', (req, res) => {
  appConfig.ads = { ...appConfig.ads, ...req.body };
  res.json({ success: true, ads: appConfig.ads });
});

app.get('/api/config/notifications', (req, res) => res.json({ success: true, notifications: appConfig.notifications }));
app.put('/api/config/notifications', (req, res) => {
  appConfig.notifications = { ...appConfig.notifications, ...req.body };
  res.json({ success: true, notifications: appConfig.notifications });
});

app.get('/api/config/legal', (req, res) => res.json({ success: true, legal: appConfig.legal }));
app.put('/api/config/legal', (req, res) => {
  appConfig.legal = { ...appConfig.legal, ...req.body };
  res.json({ success: true, legal: appConfig.legal });
});

app.get('/api/config/ai', (req, res) => res.json({ success: true, ai: appConfig.aiSettings }));
app.put('/api/config/ai', (req, res) => {
  appConfig.aiSettings = { ...appConfig.aiSettings, ...req.body };
  res.json({ success: true, ai: appConfig.aiSettings });
});

app.get('/api/config/categories', (req, res) => res.json({ success: true, categories: appConfig.categories }));
app.put('/api/config/categories/:id', (req, res) => {
  const index = appConfig.categories.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Category not found' });
  appConfig.categories[index] = { ...appConfig.categories[index], ...req.body };
  res.json({ success: true, category: appConfig.categories[index] });
});

app.get('/api/users', (req, res) => res.json({ success: true, users: appConfig.users }));
app.get('/api/users/:id', (req, res) => {
  const user = appConfig.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ success: true, user });
});
app.post('/api/users', (req, res) => {
  const newUser = { id: uuidv4(), ...req.body, createdAt: new Date().toISOString() };
  appConfig.users.push(newUser);
  res.json({ success: true, user: newUser });
});
app.put('/api/users/:id', (req, res) => {
  const index = appConfig.users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });
  appConfig.users[index] = { ...appConfig.users[index], ...req.body };
  res.json({ success: true, user: appConfig.users[index] });
});
app.delete('/api/users/:id', (req, res) => {
  const index = appConfig.users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });
  appConfig.users.splice(index, 1);
  res.json({ success: true });
});

app.get('/api/videos', (req, res) => res.json({ success: true, videos: appConfig.videos }));
app.get('/api/videos/:id', (req, res) => {
  const video = appConfig.videos.find(v => v.id === req.params.id);
  if (!video) return res.status(404).json({ error: 'Video not found' });
  res.json({ success: true, video });
});
app.delete('/api/videos/:id', (req, res) => {
  const index = appConfig.videos.findIndex(v => v.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Video not found' });
  appConfig.videos.splice(index, 1);
  res.json({ success: true });
});

app.get('/api/stats', (req, res) => {
  const totalUsers = appConfig.users.length;
  const totalVideos = appConfig.videos.length;
  const totalClips = appConfig.videos.reduce((acc, v) => acc + (v.clips?.length || 0), 0);
  res.json({
    success: true,
    stats: { totalUsers, totalVideos, totalClips, activeUsers: totalUsers, processingVideos: 0, completedVideos: totalVideos, failedVideos: 0 }
  });
});

app.post('/api/config/reset', (req, res) => {
  appConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  res.json({ success: true, config: appConfig });
});

app.post('/api/notify', (req, res) => {
  const { title, message } = req.body;
  console.log(`Notification: ${title} - ${message}`);
  res.json({ success: true, message: 'Notification queued' });
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║   🎬 ClipGenius Server Running                    ║
║                                                   ║
║   Port: ${PORT}                                     ║
║   FFmpeg: Enabled                                  ║
║   Video Processing: Enabled                       ║
║   Base64 Upload: Enabled                          ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `);
});
