import { AppConfig, Platform, AppSettingsConfig, MonetizationConfig, UiSettings, AdsConfig, NotificationsConfig, LegalConfig, AISettings, Category, AdminStats } from '../types';

const API_BASE_URL = 'https://clipgenius-server.onrender.com/api';
let cachedConfig: AppConfig | null = null;

const DEFAULT_CONFIG: AppConfig = {
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
  monetization: {
    enabled: false,
    freeClipsPerDay: 5,
    premiumEnabled: false,
    stripePublishableKey: ''
  },
  uiSettings: {
    primaryColor: '#FF2D55',
    accentColor: '#5856D6',
    darkMode: true,
    showTutorial: true,
    defaultPlatform: 'tiktok'
  },
  ads: {
    adStatus: 'on',
    adType: 'admob',
    admobPublisherId: '',
    admobAppId: '',
    admobBannerUnitId: '',
    admobInterstitialUnitId: '',
    admobNativeUnitId: '',
    fanBannerUnitId: '',
    fanInterstitialUnitId: '',
    fanNativeUnitId: '',
    unityAppId: '',
    appnextAppId: '',
    appnextBannerId: '',
    appnextInterstitialId: '',
    interstitialAdInterval: 3,
    nativeAdInterval: 20,
    nativeAdIndex: 4
  },
  notifications: {
    enabled: false,
    onesignalAppId: '',
    onesignalApiKey: '',
    firebaseServerKey: ''
  },
  legal: {
    privacyPolicyUrl: '',
    termsUrl: '',
    faqUrl: '',
    feedbackUrl: '',
    contactEmail: ''
  },
  aiSettings: {
    videoIntelligenceEnabled: false,
    videoIntelligenceKey: '',
    openaiEnabled: false,
    openaiKey: '',
    sceneDetectionSensitivity: 50,
    enableAutoCaption: false,
    captionLanguage: 'en',
    enableFaceDetection: true,
    enableLabelDetection: true,
    enableShotChangeDetection: true,
    thumbnailAiEnabled: false,
    thumbnailAiKey: ''
  },
  categories: [
    { id: 'trending', name: 'Trending', enabled: true },
    { id: 'funny', name: 'Funny', enabled: true },
    { id: 'music', name: 'Music', enabled: true },
    { id: 'sports', name: 'Sports', enabled: true },
    { id: 'news', name: 'News', enabled: true }
  ],
  users: [],
  videos: []
};

export const fetchConfig = async (): Promise<AppConfig> => {
  try {
    const response = await fetch(`${API_BASE_URL}/config`);
    if (!response.ok) {
      console.log('Backend not available, using default config');
      cachedConfig = DEFAULT_CONFIG;
      return DEFAULT_CONFIG;
    }
    const data = await response.json();
    if (data.success) {
      cachedConfig = data.config;
      return data.config;
    }
    cachedConfig = DEFAULT_CONFIG;
    return DEFAULT_CONFIG;
  } catch (error) {
    console.log('Backend not available, using default config');
    cachedConfig = DEFAULT_CONFIG;
    return DEFAULT_CONFIG;
  }
};

export const getCachedConfig = (): AppConfig | null => cachedConfig;

export const fetchPlatforms = async (): Promise<Platform[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/config/platforms`);
    const data = await response.json();
    return data.success ? data.platforms : DEFAULT_CONFIG.platforms;
  } catch {
    return DEFAULT_CONFIG.platforms;
  }
};

export const updatePlatform = async (id: string, updates: Partial<Platform>): Promise<Platform> => {
  const response = await fetch(`${API_BASE_URL}/config/platforms/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.platform;
};

export const fetchSettings = async (): Promise<AppSettingsConfig> => {
  try {
    const response = await fetch(`${API_BASE_URL}/config/settings`);
    const data = await response.json();
    return data.success ? data.settings : DEFAULT_CONFIG.appSettings;
  } catch {
    return DEFAULT_CONFIG.appSettings;
  }
};

export const updateSettings = async (updates: Partial<AppSettingsConfig>): Promise<AppSettingsConfig> => {
  const response = await fetch(`${API_BASE_URL}/config/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.settings;
};

export const fetchMonetization = async (): Promise<MonetizationConfig> => {
  try {
    const response = await fetch(`${API_BASE_URL}/config/monetization`);
    const data = await response.json();
    return data.success ? data.monetization : DEFAULT_CONFIG.monetization;
  } catch {
    return DEFAULT_CONFIG.monetization;
  }
};

export const updateMonetization = async (updates: Partial<MonetizationConfig>): Promise<MonetizationConfig> => {
  const response = await fetch(`${API_BASE_URL}/config/monetization`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.monetization;
};

export const fetchUiSettings = async (): Promise<UiSettings> => {
  try {
    const response = await fetch(`${API_BASE_URL}/config/ui`);
    const data = await response.json();
    return data.success ? data.ui : DEFAULT_CONFIG.uiSettings;
  } catch {
    return DEFAULT_CONFIG.uiSettings;
  }
};

export const updateUiSettings = async (updates: Partial<UiSettings>): Promise<UiSettings> => {
  const response = await fetch(`${API_BASE_URL}/config/ui`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.ui;
};

export const fetchAds = async (): Promise<AdsConfig> => {
  try {
    const response = await fetch(`${API_BASE_URL}/config/ads`);
    const data = await response.json();
    return data.success ? data.ads : DEFAULT_CONFIG.ads;
  } catch {
    return DEFAULT_CONFIG.ads;
  }
};

export const updateAds = async (updates: Partial<AdsConfig>): Promise<AdsConfig> => {
  const response = await fetch(`${API_BASE_URL}/config/ads`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.ads;
};

export const fetchNotifications = async (): Promise<NotificationsConfig> => {
  try {
    const response = await fetch(`${API_BASE_URL}/config/notifications`);
    const data = await response.json();
    return data.success ? data.notifications : DEFAULT_CONFIG.notifications;
  } catch {
    return DEFAULT_CONFIG.notifications;
  }
};

export const updateNotifications = async (updates: Partial<NotificationsConfig>): Promise<NotificationsConfig> => {
  const response = await fetch(`${API_BASE_URL}/config/notifications`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.notifications;
};

export const fetchLegal = async (): Promise<LegalConfig> => {
  try {
    const response = await fetch(`${API_BASE_URL}/config/legal`);
    const data = await response.json();
    return data.success ? data.legal : DEFAULT_CONFIG.legal;
  } catch {
    return DEFAULT_CONFIG.legal;
  }
};

export const updateLegal = async (updates: Partial<LegalConfig>): Promise<LegalConfig> => {
  const response = await fetch(`${API_BASE_URL}/config/legal`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.legal;
};

export const fetchAISettings = async (): Promise<AISettings> => {
  try {
    const response = await fetch(`${API_BASE_URL}/config/ai`);
    const data = await response.json();
    return data.success ? data.ai : DEFAULT_CONFIG.aiSettings;
  } catch {
    return DEFAULT_CONFIG.aiSettings;
  }
};

export const updateAISettings = async (updates: Partial<AISettings>): Promise<AISettings> => {
  const response = await fetch(`${API_BASE_URL}/config/ai`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.ai;
};

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/config/categories`);
    const data = await response.json();
    return data.success ? data.categories : DEFAULT_CONFIG.categories;
  } catch {
    return DEFAULT_CONFIG.categories;
  }
};

export const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category> => {
  const response = await fetch(`${API_BASE_URL}/config/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.category;
};

export const fetchStats = async (): Promise<AdminStats> => {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    const data = await response.json();
    return data.success ? data.stats : {
      totalUsers: 0,
      totalVideos: 0,
      totalClips: 0,
      activeUsers: 0,
      processingVideos: 0,
      completedVideos: 0,
      failedVideos: 0
    };
  } catch {
    return {
      totalUsers: 0,
      totalVideos: 0,
      totalClips: 0,
      activeUsers: 0,
      processingVideos: 0,
      completedVideos: 0,
      failedVideos: 0
    };
  }
};

export const resetConfig = async (): Promise<AppConfig> => {
  try {
    const response = await fetch(`${API_BASE_URL}/config/reset`, { method: 'POST' });
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    cachedConfig = data.config;
    return data.config;
  } catch {
    cachedConfig = DEFAULT_CONFIG;
    return DEFAULT_CONFIG;
  }
};

export const setApiBaseUrl = (url: string) => {
  console.log('API Base URL set to:', url);
};
