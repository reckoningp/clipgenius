import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Video, AppSettings, PlatformType, AppConfig } from '../types';
import { fetchConfig, getCachedConfig } from '../services/configService';

interface AppContextType {
  user: User | null;
  videos: Video[];
  settings: AppSettings;
  config: AppConfig | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  addVideo: (video: Video) => void;
  updateVideo: (videoId: string, updates: Partial<Video>) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  logout: () => void;
  isAdmin: boolean;
  refreshConfig: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  quality: 'medium',
  defaultPlatform: 'tiktok',
  saveLocation: 'device',
  notifications: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const refreshConfig = async () => {
    try {
      const cfg = await fetchConfig();
      setConfig(cfg);
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const loadData = async () => {
    try {
      const [userData, videosData, settingsData, configData] = await Promise.all([
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('videos'),
        AsyncStorage.getItem('settings'),
        fetchConfig().catch(() => null),
      ]);
      if (userData) setUser(JSON.parse(userData));
      if (videosData) setVideos(JSON.parse(videosData));
      if (settingsData) setSettings({ ...defaultSettings, ...JSON.parse(settingsData) });
      if (configData) setConfig(configData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
    } else {
      await AsyncStorage.removeItem('user');
    }
  };

  const addVideo = async (video: Video) => {
    const updatedVideos = [...videos, video];
    setVideos(updatedVideos);
    await AsyncStorage.setItem('videos', JSON.stringify(updatedVideos));
  };

  const updateVideo = async (videoId: string, updates: Partial<Video>) => {
    const updatedVideos = videos.map(v => v.id === videoId ? { ...v, ...updates } : v);
    setVideos(updatedVideos);
    await AsyncStorage.setItem('videos', JSON.stringify(updatedVideos));
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await AsyncStorage.setItem('settings', JSON.stringify(updated));
  };

  const logout = async () => {
    setUser(null);
    setVideos([]);
    await AsyncStorage.clear();
  };

  const value: AppContextType = {
    user,
    videos,
    settings,
    config,
    isLoading,
    setUser: updateUser,
    addVideo,
    updateVideo,
    updateSettings,
    logout,
    isAdmin: user?.isAdmin || false,
    refreshConfig,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};