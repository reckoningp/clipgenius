export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Video {
  id: string;
  userId: string;
  originalUrl: string;
  platformType: PlatformType;
  status: VideoStatus;
  createdAt: string;
  clips?: Clip[];
}

export interface Clip {
  id: string;
  videoId: string;
  clipUrl: string;
  thumbnailUrls: string[];
  selectedThumbnail?: string;
  duration: number;
  startTime: number;
}

export type PlatformType = 'tiktok' | 'reels' | 'youtube_shorts' | 'youtube' | 'facebook' | 'twitter';

export type VideoStatus = 'processing' | 'done' | 'failed';

export interface ProcessingSettings {
  platform: PlatformType;
  clipCount: number;
  quality: 'low' | 'medium' | 'high';
}

export interface Platform {
  id: string;
  name: string;
  enabled: boolean;
  ratio: { width: number; height: number };
  maxDuration: number;
}

export interface WatermarkSettings {
  enabled: boolean;
  text: string;
}

export interface AppSettingsConfig {
  defaultClipCount: number;
  maxClipCount: number;
  aiModel: string;
  autoDetectScenes: boolean;
  enableThumbnails: boolean;
  thumbnailCount: number;
  watermark: WatermarkSettings;
  videoQuality: string;
  outputFormat: string;
}

export interface MonetizationConfig {
  enabled: boolean;
  freeClipsPerDay: number;
  premiumEnabled: boolean;
  stripePublishableKey: string;
}

export interface UiSettings {
  primaryColor: string;
  accentColor: string;
  darkMode: boolean;
  showTutorial: boolean;
  defaultPlatform: string;
}

export interface AdsConfig {
  adStatus: string;
  adType: string;
  admobPublisherId: string;
  admobAppId: string;
  admobBannerUnitId: string;
  admobInterstitialUnitId: string;
  admobNativeUnitId: string;
  fanBannerUnitId: string;
  fanInterstitialUnitId: string;
  fanNativeUnitId: string;
  unityAppId: string;
  appnextAppId: string;
  appnextBannerId: string;
  appnextInterstitialId: string;
  interstitialAdInterval: number;
  nativeAdInterval: number;
  nativeAdIndex: number;
}

export interface NotificationsConfig {
  enabled: boolean;
  onesignalAppId: string;
  onesignalApiKey: string;
  firebaseServerKey: string;
}

export interface LegalConfig {
  privacyPolicyUrl: string;
  termsUrl: string;
  faqUrl: string;
  feedbackUrl: string;
  contactEmail: string;
}

export interface AISettings {
  videoIntelligenceEnabled: boolean;
  videoIntelligenceKey: string;
  openaiEnabled: boolean;
  openaiKey: string;
  sceneDetectionSensitivity: number;
  enableAutoCaption: boolean;
  captionLanguage: string;
  enableFaceDetection: boolean;
  enableLabelDetection: boolean;
  enableShotChangeDetection: boolean;
  thumbnailAiEnabled: boolean;
  thumbnailAiKey: string;
}

export interface Category {
  id: string;
  name: string;
  enabled: boolean;
}

export interface AdminStats {
  totalUsers: number;
  totalVideos: number;
  totalClips: number;
  activeUsers: number;
  processingVideos: number;
  completedVideos: number;
  failedVideos: number;
}

export interface AppConfig {
  platforms: Platform[];
  appSettings: AppSettingsConfig;
  monetization: MonetizationConfig;
  uiSettings: UiSettings;
  ads: AdsConfig;
  notifications: NotificationsConfig;
  legal: LegalConfig;
  aiSettings: AISettings;
  categories: Category[];
  users: User[];
  videos: Video[];
}