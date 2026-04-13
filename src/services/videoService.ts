import { PlatformType, Clip, Platform } from '../types';
import { fetchConfig, getCachedConfig } from './configService';

let API_BASE_URL = 'https://clipgenius-server.onrender.com/api';

export const getPlatformRatio = (platform: PlatformType | string): { width: number; height: number } => {
  const config = getCachedConfig();
  if (config) {
    const p = config.platforms.find((pl: Platform) => pl.id === platform);
    if (p) return p.ratio;
  }
  switch (platform) {
    case 'tiktok':
    case 'reels':
    case 'youtube_shorts':
      return { width: 1080, height: 1920 };
    case 'youtube':
      return { width: 1920, height: 1080 };
    case 'facebook':
    case 'twitter':
      return { width: 1080, height: 1080 };
    default:
      return { width: 1080, height: 1920 };
  }
};

export const getPlatformMaxDuration = (platform: PlatformType | string): number => {
  const config = getCachedConfig();
  if (config) {
    const p = config.platforms.find((pl: Platform) => pl.id === platform);
    if (p) return p.maxDuration;
  }
  switch (platform) {
    case 'tiktok':
    case 'reels':
    case 'youtube_shorts':
      return 60;
    case 'youtube':
      return 600;
    case 'facebook':
    case 'twitter':
      return 120;
    default:
      return 60;
  }
};

export const getPlatformName = (platform: PlatformType): string => {
  switch (platform) {
    case 'tiktok':
      return 'TikTok';
    case 'reels':
      return 'Instagram Reels';
    case 'youtube_shorts':
      return 'YouTube Shorts';
    case 'youtube':
      return 'YouTube';
    case 'facebook':
      return 'Facebook';
    case 'twitter':
      return 'Twitter/X';
    default:
      return platform;
  }
};

export const getEnabledPlatforms = async (): Promise<Platform[]> => {
  try {
    const config = await fetchConfig();
    return config.platforms.filter((p: Platform) => p.enabled);
  } catch {
    return [
      { id: 'tiktok', name: 'TikTok', enabled: true, ratio: { width: 1080, height: 1920 }, maxDuration: 60 },
      { id: 'reels', name: 'Instagram Reels', enabled: true, ratio: { width: 1080, height: 1920 }, maxDuration: 60 },
      { id: 'youtube_shorts', name: 'YouTube Shorts', enabled: true, ratio: { width: 1080, height: 1920 }, maxDuration: 60 },
    ];
  }
};

export const getDefaultClipCount = async (): Promise<number> => {
  try {
    const config = await fetchConfig();
    return config.appSettings.defaultClipCount;
  } catch {
    return 3;
  }
};

export const getMaxClipCount = async (): Promise<number> => {
  try {
    const config = await fetchConfig();
    return config.appSettings.maxClipCount;
  } catch {
    return 10;
  }
};

export const processVideoWithAI = async (
  videoUri: string,
  platform: PlatformType,
  clipCount: number
): Promise<{ videoId: string; clips: Clip[] }> => {
  const formData = new FormData();
  
  const videoFile = {
    uri: videoUri,
    type: 'video/mp4',
    name: 'video.mp4',
  } as any;
  
  formData.append('video', videoFile);
  formData.append('platform', platform);
  formData.append('clipCount', clipCount.toString());

  try {
    const response = await fetch(`${API_BASE_URL}/process-video`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Processing failed');
    }

    return {
      videoId: data.videoId,
      clips: data.clips,
    };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const simulateAIProcessing = async (
  videoId: string,
  platform: PlatformType,
  clipCount: number
): Promise<Clip[]> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const clips: Clip[] = [];
  const baseTime = Math.random() * 30;
  
  for (let i = 0; i < clipCount; i++) {
    const clip: Clip = {
      id: `clip_${videoId}_${i}`,
      videoId,
      clipUrl: `https://example.com/clips/${videoId}_${i}.mp4`,
      thumbnailUrls: [
        `https://picsum.photos/seed/${videoId}_${i}_1/400/600`,
        `https://picsum.photos/seed/${videoId}_${i}_2/400/600`,
        `https://picsum.photos/seed/${videoId}_${i}_3/400/600`,
      ],
      selectedThumbnail: `https://picsum.photos/seed/${videoId}_${i}_1/400/600`,
      duration: 15 + Math.random() * 30,
      startTime: baseTime + i * 5,
    };
    clips.push(clip);
  }
  
  return clips;
};

export const generateThumbnails = async (clipId: string): Promise<string[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    `https://picsum.photos/seed/${clipId}_thumb1/400/600`,
    `https://picsum.photos/seed/${clipId}_thumb2/400/600`,
    `https://picsum.photos/seed/${clipId}_thumb3/400/600`,
  ];
};

export const setApiBaseUrl = (url: string) => {
  API_BASE_URL = url;
};
