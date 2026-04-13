import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, ActivityIndicator } from 'react-native';
import { Header, Button, Input } from '../components';
import { useApp } from '../context/AppContext';
import { colors, fontSize, spacing, borderRadius } from '../utils/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { 
  updateSettings, updateMonetization, updateUiSettings, updatePlatform, 
  updateAds, updateNotifications, updateLegal, updateAISettings, fetchStats, fetchConfig 
} from '../services/configService';
import { Platform, AppSettingsConfig, MonetizationConfig, UiSettings, AdsConfig, NotificationsConfig, LegalConfig, AISettings, AdminStats, User } from '../types';

type AdminScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const AdminScreen: React.FC<AdminScreenProps> = ({ navigation }) => {
  const { videos, user, refreshConfig, config } = useApp();
  const [selectedTab, setSelectedTab] = useState<'stats' | 'platforms' | 'monetization' | 'ads' | 'notifications' | 'ai' | 'legal' | 'settings' | 'ui'>('stats');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);

  const [monetization, setMonetization] = useState<MonetizationConfig>({
    enabled: false,
    freeClipsPerDay: 5,
    premiumEnabled: false,
    stripePublishableKey: '',
  });

  const [appSettings, setAppSettings] = useState<AppSettingsConfig>({
    defaultClipCount: 3,
    maxClipCount: 10,
    aiModel: 'shot_detection',
    autoDetectScenes: true,
    enableThumbnails: true,
    thumbnailCount: 3,
    watermark: { enabled: false, text: 'ClipGenius' },
    videoQuality: 'high',
    outputFormat: 'mp4',
  });

  const [uiSettings, setUiSettings] = useState<UiSettings>({
    primaryColor: '#FF2D55',
    accentColor: '#5856D6',
    darkMode: true,
    showTutorial: true,
    defaultPlatform: 'tiktok',
  });

  const [ads, setAds] = useState<AdsConfig>({
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
    nativeAdIndex: 4,
  });

  const [notifications, setNotifications] = useState<NotificationsConfig>({
    enabled: false,
    onesignalAppId: '',
    onesignalApiKey: '',
    firebaseServerKey: '',
  });

  const [legal, setLegal] = useState<LegalConfig>({
    privacyPolicyUrl: '',
    termsUrl: '',
    faqUrl: '',
    feedbackUrl: '',
    contactEmail: '',
  });

  const [aiSettings, setAiSettings] = useState<AISettings>({
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
    thumbnailAiKey: '',
  });

  const [platforms, setPlatforms] = useState<Platform[]>([]);

  useEffect(() => {
    loadConfig();
    loadStats();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      await refreshConfig();
      if (config) {
        setMonetization(config.monetization);
        setAppSettings(config.appSettings);
        setUiSettings(config.uiSettings);
        setPlatforms(config.platforms);
        setAds(config.ads || ads);
        setNotifications(config.notifications || notifications);
        setLegal(config.legal || legal);
        setAiSettings(config.aiSettings || aiSettings);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
    setLoading(false);
  };

  const loadStats = async () => {
    try {
      const s = await fetchStats();
      setStats(s);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSaveMonetization = async () => {
    setSaving(true);
    try {
      await updateMonetization(monetization);
      await refreshConfig();
      Alert.alert('Success', 'Monetization settings saved!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
    setSaving(false);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await updateSettings(appSettings);
      await refreshConfig();
      Alert.alert('Success', 'App settings saved!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
    setSaving(false);
  };

  const handleSaveUiSettings = async () => {
    setSaving(true);
    try {
      await updateUiSettings(uiSettings);
      await refreshConfig();
      Alert.alert('Success', 'UI settings saved!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
    setSaving(false);
  };

  const handleSaveAds = async () => {
    setSaving(true);
    try {
      await updateAds(ads);
      await refreshConfig();
      Alert.alert('Success', 'Ads settings saved!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save ads settings');
    }
    setSaving(false);
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await updateNotifications(notifications);
      await refreshConfig();
      Alert.alert('Success', 'Notification settings saved!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save notification settings');
    }
    setSaving(false);
  };

  const handleSaveLegal = async () => {
    setSaving(true);
    try {
      await updateLegal(legal);
      await refreshConfig();
      Alert.alert('Success', 'Legal settings saved!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save legal settings');
    }
    setSaving(false);
  };

  const handleSaveAiSettings = async () => {
    setSaving(true);
    try {
      await updateAISettings(aiSettings);
      await refreshConfig();
      Alert.alert('Success', 'AI settings saved!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save AI settings');
    }
    setSaving(false);
  };

  const handleTogglePlatform = async (platformId: string, enabled: boolean) => {
    try {
      await updatePlatform(platformId, { enabled });
      setPlatforms(platforms.map(p => p.id === platformId ? { ...p, enabled } : p));
      await refreshConfig();
    } catch (error) {
      Alert.alert('Error', 'Failed to update platform');
    }
  };

  const tabs = [
    { id: 'stats', label: 'Stats' },
    { id: 'platforms', label: 'Platforms' },
    { id: 'monetization', label: 'Money' },
    { id: 'ads', label: 'Ads' },
    { id: 'notifications', label: 'Notify' },
    { id: 'ai', label: 'AI' },
    { id: 'legal', label: 'Legal' },
    { id: 'settings', label: 'Settings' },
    { id: 'ui', label: 'UI' },
  ];

  return (
    <View style={styles.container}>
      <Header title="Admin Panel" showBack onBack={() => navigation.goBack()} />
      <View style={styles.adminBadge}>
        <Text style={styles.adminText}>Welcome, Admin {user?.name}</Text>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
        <View style={styles.tabRow}>
          {tabs.map((tab) => (
            <TouchableOpacity 
              key={tab.id} 
              style={[styles.tab, selectedTab === tab.id && styles.tabSelected]} 
              onPress={() => setSelectedTab(tab.id as any)}
            >
              <Text style={[styles.tabText, selectedTab === tab.id && styles.tabTextSelected]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {selectedTab === 'stats' && (
            <View>
              <Text style={styles.sectionTitle}>Dashboard Stats</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats?.totalUsers || 0}</Text>
                  <Text style={styles.statLabel}>Total Users</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats?.totalVideos || videos.length}</Text>
                  <Text style={styles.statLabel}>Total Videos</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats?.totalClips || 0}</Text>
                  <Text style={styles.statLabel}>Total Clips</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats?.activeUsers || 0}</Text>
                  <Text style={styles.statLabel}>Active Users</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats?.processingVideos || 0}</Text>
                  <Text style={styles.statLabel}>Processing</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats?.completedVideos || 0}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
              </View>
              <Button title="Refresh Stats" variant="outline" onPress={loadStats} style={styles.refreshBtn} />
            </View>
          )}

          {selectedTab === 'platforms' && (
            <View>
              <Text style={styles.sectionTitle}>Platform Management</Text>
              <Text style={styles.sectionSubtitle}>Enable or disable platforms</Text>
              {platforms.map((p) => (
                <View key={p.id} style={styles.platformRow}>
                  <View style={styles.platformInfo}>
                    <Text style={styles.platformName}>{p.name}</Text>
                    <Text style={styles.platformDetails}>{p.ratio.width}x{p.ratio.height} • Max {p.maxDuration}s</Text>
                  </View>
                  <Switch
                    value={p.enabled}
                    onValueChange={(enabled) => handleTogglePlatform(p.id, enabled)}
                    trackColor={{ false: colors.surfaceLight, true: colors.primary }}
                    thumbColor={colors.white}
                  />
                </View>
              ))}
            </View>
          )}

          {selectedTab === 'monetization' && (
            <View>
              <Text style={styles.sectionTitle}>Monetization Settings</Text>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Enable Monetization</Text>
                </View>
                <Switch
                  value={monetization.enabled}
                  onValueChange={(value) => setMonetization({ ...monetization, enabled: value })}
                  trackColor={{ false: colors.surfaceLight, true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Premium Features</Text>
                </View>
                <Switch
                  value={monetization.premiumEnabled}
                  onValueChange={(value) => setMonetization({ ...monetization, premiumEnabled: value })}
                  trackColor={{ false: colors.surfaceLight, true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Free Clips Per Day: {monetization.freeClipsPerDay}</Text>
                <View style={styles.numberInput}>
                  <TouchableOpacity style={styles.numberBtn} onPress={() => setMonetization({ ...monetization, freeClipsPerDay: Math.max(0, monetization.freeClipsPerDay - 1) })}>
                    <Text style={styles.numberBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.numberValue}>{monetization.freeClipsPerDay}</Text>
                  <TouchableOpacity style={styles.numberBtn} onPress={() => setMonetization({ ...monetization, freeClipsPerDay: monetization.freeClipsPerDay + 1 })}>
                    <Text style={styles.numberBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Stripe Publishable Key</Text>
                <Input value={monetization.stripePublishableKey} onChangeText={(text) => setMonetization({ ...monetization, stripePublishableKey: text })} placeholder="pk_live_..." />
              </View>
              <Button title="Save Monetization Settings" onPress={handleSaveMonetization} loading={saving} style={styles.saveBtn} />
            </View>
          )}

          {selectedTab === 'ads' && (
            <View>
              <Text style={styles.sectionTitle}>Ads Settings</Text>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Enable Ads</Text>
                </View>
                <Switch value={ads.adStatus === 'on'} onValueChange={(value) => setAds({ ...ads, adStatus: value ? 'on' : 'off' })} trackColor={{ false: colors.surfaceLight, true: colors.primary }} thumbColor={colors.white} />
              </View>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Ad Network</Text>
                <View style={styles.optionRow}>
                  {['admob', 'facebook', 'unity', 'appnext'].map((type) => (
                    <TouchableOpacity key={type} style={[styles.optionBtn, ads.adType === type && styles.optionSelected]} onPress={() => setAds({ ...ads, adType: type })}>
                      <Text style={[styles.optionText, ads.adType === type && styles.optionTextSelected]}>{type.toUpperCase()}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Admob Publisher ID</Text>
                <Input value={ads.admobPublisherId} onChangeText={(text) => setAds({ ...ads, admobPublisherId: text })} placeholder="pub-xxxxxxxxxxxx" />
              </View>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Admob App ID</Text>
                <Input value={ads.admobAppId} onChangeText={(text) => setAds({ ...ads, admobAppId: text })} placeholder="ca-app-pub-xxxxx" />
              </View>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Banner Unit ID</Text>
                <Input value={ads.admobBannerUnitId} onChangeText={(text) => setAds({ ...ads, admobBannerUnitId: text })} placeholder="ca-app-pub-xxx/banner" />
              </View>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Interstitial Unit ID</Text>
                <Input value={ads.admobInterstitialUnitId} onChangeText={(text) => setAds({ ...ads, admobInterstitialUnitId: text })} placeholder="ca-app-pub-xxx/interstitial" />
              </View>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Native Unit ID</Text>
                <Input value={ads.admobNativeUnitId} onChangeText={(text) => setAds({ ...ads, admobNativeUnitId: text })} placeholder="ca-app-pub-xxx/native" />
              </View>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Interstitial Ad Interval (seconds)</Text>
                <View style={styles.numberInput}>
                  <TouchableOpacity style={styles.numberBtn} onPress={() => setAds({ ...ads, interstitialAdInterval: Math.max(1, ads.interstitialAdInterval - 1) })}><Text style={styles.numberBtnText}>-</Text></TouchableOpacity>
                  <Text style={styles.numberValue}>{ads.interstitialAdInterval}</Text>
                  <TouchableOpacity style={styles.numberBtn} onPress={() => setAds({ ...ads, interstitialAdInterval: ads.interstitialAdInterval + 1 })}><Text style={styles.numberBtnText}>+</Text></TouchableOpacity>
                </View>
              </View>
              <Button title="Save Ads Settings" onPress={handleSaveAds} loading={saving} style={styles.saveBtn} />
            </View>
          )}

          {selectedTab === 'notifications' && (
            <View>
              <Text style={styles.sectionTitle}>Push Notifications</Text>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Enable Notifications</Text>
                </View>
                <Switch value={notifications.enabled} onValueChange={(value) => setNotifications({ ...notifications, enabled: value })} trackColor={{ false: colors.surfaceLight, true: colors.primary }} thumbColor={colors.white} />
              </View>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>OneSignal App ID</Text>
                <Input value={notifications.onesignalAppId} onChangeText={(text) => setNotifications({ ...notifications, onesignalAppId: text })} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
              </View>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>OneSignal API Key</Text>
                <Input value={notifications.onesignalApiKey} onChangeText={(text) => setNotifications({ ...notifications, onesignalApiKey: text })} placeholder="Your OneSignal REST API Key" secureTextEntry />
              </View>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Firebase Server Key</Text>
                <Input value={notifications.firebaseServerKey} onChangeText={(text) => setNotifications({ ...notifications, firebaseServerKey: text })} placeholder="Firebase Cloud Messaging Server Key" secureTextEntry />
              </View>
              <Button title="Save Notification Settings" onPress={handleSaveNotifications} loading={saving} style={styles.saveBtn} />
            </View>
          )}

          {selectedTab === 'ai' && (
            <View>
              <Text style={styles.sectionTitle}>AI Settings</Text>
              
              <Text style={styles.subSectionTitle}>Google Cloud Video Intelligence</Text>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Enable Google AI</Text>
                </View>
                <Switch value={aiSettings.videoIntelligenceEnabled} onValueChange={(value) => setAiSettings({ ...aiSettings, videoIntelligenceEnabled: value })} trackColor={{ false: colors.surfaceLight, true: colors.primary }} thumbColor={colors.white} />
              </View>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Google Cloud JSON Key</Text>
                <Input value={aiSettings.videoIntelligenceKey} onChangeText={(text) => setAiSettings({ ...aiSettings, videoIntelligenceKey: text })} placeholder="Paste your Google Cloud JSON key content" multiline numberOfLines={4} />
              </View>

              <Text style={styles.subSectionTitle}>OpenAI API</Text>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Enable OpenAI</Text>
                </View>
                <Switch value={aiSettings.openaiEnabled} onValueChange={(value) => setAiSettings({ ...aiSettings, openaiEnabled: value })} trackColor={{ false: colors.surfaceLight, true: colors.primary }} thumbColor={colors.white} />
              </View>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>OpenAI API Key</Text>
                <Input value={aiSettings.openaiKey} onChangeText={(text) => setAiSettings({ ...aiSettings, openaiKey: text })} placeholder="sk-..." secureTextEntry />
              </View>

              <Text style={styles.subSectionTitle}>Scene Detection Settings</Text>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Sensitivity: {aiSettings.sceneDetectionSensitivity}%</Text>
                <View style={styles.numberInput}>
                  <TouchableOpacity style={styles.numberBtn} onPress={() => setAiSettings({ ...aiSettings, sceneDetectionSensitivity: Math.max(10, aiSettings.sceneDetectionSensitivity - 10) })}><Text style={styles.numberBtnText}>-</Text></TouchableOpacity>
                  <Text style={styles.numberValue}>{aiSettings.sceneDetectionSensitivity}</Text>
                  <TouchableOpacity style={styles.numberBtn} onPress={() => setAiSettings({ ...aiSettings, sceneDetectionSensitivity: Math.min(100, aiSettings.sceneDetectionSensitivity + 10) })}><Text style={styles.numberBtnText}>+</Text></TouchableOpacity>
                </View>
              </View>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}><Text style={styles.settingLabel}>Face Detection</Text></View>
                <Switch value={aiSettings.enableFaceDetection} onValueChange={(value) => setAiSettings({ ...aiSettings, enableFaceDetection: value })} trackColor={{ false: colors.surfaceLight, true: colors.primary }} thumbColor={colors.white} />
              </View>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}><Text style={styles.settingLabel}>Label Detection</Text></View>
                <Switch value={aiSettings.enableLabelDetection} onValueChange={(value) => setAiSettings({ ...aiSettings, enableLabelDetection: value })} trackColor={{ false: colors.surfaceLight, true: colors.primary }} thumbColor={colors.white} />
              </View>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}><Text style={styles.settingLabel}>Shot Change Detection</Text></View>
                <Switch value={aiSettings.enableShotChangeDetection} onValueChange={(value) => setAiSettings({ ...aiSettings, enableShotChangeDetection: value })} trackColor={{ false: colors.surfaceLight, true: colors.primary }} thumbColor={colors.white} />
              </View>

              <Text style={styles.subSectionTitle}>Auto Caption</Text>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}><Text style={styles.settingLabel}>Enable Auto Caption</Text></View>
                <Switch value={aiSettings.enableAutoCaption} onValueChange={(value) => setAiSettings({ ...aiSettings, enableAutoCaption: value })} trackColor={{ false: colors.surfaceLight, true: colors.primary }} thumbColor={colors.white} />
              </View>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Caption Language</Text>
                <View style={styles.optionRow}>
                  {['en', 'es', 'fr', 'de', 'zh', 'ja'].map((lang) => (
                    <TouchableOpacity key={lang} style={[styles.optionBtn, aiSettings.captionLanguage === lang && styles.optionSelected]} onPress={() => setAiSettings({ ...aiSettings, captionLanguage: lang })}>
                      <Text style={[styles.optionText, aiSettings.captionLanguage === lang && styles.optionTextSelected]}>{lang.toUpperCase()}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Text style={styles.subSectionTitle}>AI Thumbnail Generation</Text>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}><Text style={styles.settingLabel}>Enable AI Thumbnails</Text></View>
                <Switch value={aiSettings.thumbnailAiEnabled} onValueChange={(value) => setAiSettings({ ...aiSettings, thumbnailAiEnabled: value })} trackColor={{ false: colors.surfaceLight, true: colors.primary }} thumbColor={colors.white} />
              </View>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>AI Thumbnail API Key</Text>
                <Input value={aiSettings.thumbnailAiKey} onChangeText={(text) => setAiSettings({ ...aiSettings, thumbnailAiKey: text })} placeholder="Your AI thumbnail service API key" secureTextEntry />
              </View>

              <Button title="Save AI Settings" onPress={handleSaveAiSettings} loading={saving} style={styles.saveBtn} />
            </View>
          )}

          {selectedTab === 'legal' && (
            <View>
              <Text style={styles.sectionTitle}>Legal Settings</Text>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Privacy Policy URL</Text>
                <Input value={legal.privacyPolicyUrl} onChangeText={(text) => setLegal({ ...legal, privacyPolicyUrl: text })} placeholder="https://yoursite.com/privacy" />
              </View>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Terms of Service URL</Text>
                <Input value={legal.termsUrl} onChangeText={(text) => setLegal({ ...legal, termsUrl: text })} placeholder="https://yoursite.com/terms" />
              </View>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>FAQ URL</Text>
                <Input value={legal.faqUrl} onChangeText={(text) => setLegal({ ...legal, faqUrl: text })} placeholder="https://yoursite.com/faq" />
              </View>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Feedback URL</Text>
                <Input value={legal.feedbackUrl} onChangeText={(text) => setLegal({ ...legal, feedbackUrl: text })} placeholder="https://yoursite.com/feedback" />
              </View>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Contact Email</Text>
                <Input value={legal.contactEmail} onChangeText={(text) => setLegal({ ...legal, contactEmail: text })} placeholder="support@yourapp.com" keyboardType="email-address" />
              </View>
              <Button title="Save Legal Settings" onPress={handleSaveLegal} loading={saving} style={styles.saveBtn} />
            </View>
          )}

          {selectedTab === 'settings' && (
            <View>
              <Text style={styles.sectionTitle}>App Settings</Text>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Default Clip Count</Text>
                <View style={styles.numberInput}>
                  <TouchableOpacity style={styles.numberBtn} onPress={() => setAppSettings({ ...appSettings, defaultClipCount: Math.max(1, appSettings.defaultClipCount - 1) })}>
                    <Text style={styles.numberBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.numberValue}>{appSettings.defaultClipCount}</Text>
                  <TouchableOpacity style={styles.numberBtn} onPress={() => setAppSettings({ ...appSettings, defaultClipCount: appSettings.defaultClipCount + 1 })}>
                    <Text style={styles.numberBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Max Clip Count</Text>
                <View style={styles.numberInput}>
                  <TouchableOpacity style={styles.numberBtn} onPress={() => setAppSettings({ ...appSettings, maxClipCount: Math.max(1, appSettings.maxClipCount - 1) })}>
                    <Text style={styles.numberBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.numberValue}>{appSettings.maxClipCount}</Text>
                  <TouchableOpacity style={styles.numberBtn} onPress={() => setAppSettings({ ...appSettings, maxClipCount: appSettings.maxClipCount + 1 })}>
                    <Text style={styles.numberBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Auto-detect Scenes</Text>
                </View>
                <Switch value={appSettings.autoDetectScenes} onValueChange={(value) => setAppSettings({ ...appSettings, autoDetectScenes: value })} trackColor={{ false: colors.surfaceLight, true: colors.primary }} thumbColor={colors.white} />
              </View>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Generate Thumbnails</Text>
                </View>
                <Switch value={appSettings.enableThumbnails} onValueChange={(value) => setAppSettings({ ...appSettings, enableThumbnails: value })} trackColor={{ false: colors.surfaceLight, true: colors.primary }} thumbColor={colors.white} />
              </View>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Add Watermark</Text>
                </View>
                <Switch value={appSettings.watermark.enabled} onValueChange={(value) => setAppSettings({ ...appSettings, watermark: { ...appSettings.watermark, enabled: value } })} trackColor={{ false: colors.surfaceLight, true: colors.primary }} thumbColor={colors.white} />
              </View>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Video Quality</Text>
                <View style={styles.optionRow}>
                  {['low', 'medium', 'high'].map((q) => (
                    <TouchableOpacity key={q} style={[styles.optionBtn, appSettings.videoQuality === q && styles.optionSelected]} onPress={() => setAppSettings({ ...appSettings, videoQuality: q })}>
                      <Text style={[styles.optionText, appSettings.videoQuality === q && styles.optionTextSelected]}>{q.toUpperCase()}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <Button title="Save App Settings" onPress={handleSaveSettings} loading={saving} style={styles.saveBtn} />
            </View>
          )}

          {selectedTab === 'ui' && (
            <View>
              <Text style={styles.sectionTitle}>UI Settings</Text>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Primary Color</Text>
                <Input value={uiSettings.primaryColor} onChangeText={(text) => setUiSettings({ ...uiSettings, primaryColor: text })} placeholder="#FF2D55" />
              </View>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Accent Color</Text>
                <Input value={uiSettings.accentColor} onChangeText={(text) => setUiSettings({ ...uiSettings, accentColor: text })} placeholder="#5856D6" />
              </View>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Dark Mode</Text>
                </View>
                <Switch value={uiSettings.darkMode} onValueChange={(value) => setUiSettings({ ...uiSettings, darkMode: value })} trackColor={{ false: colors.surfaceLight, true: colors.primary }} thumbColor={colors.white} />
              </View>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Show Tutorial</Text>
                </View>
                <Switch value={uiSettings.showTutorial} onValueChange={(value) => setUiSettings({ ...uiSettings, showTutorial: value })} trackColor={{ false: colors.surfaceLight, true: colors.primary }} thumbColor={colors.white} />
              </View>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Default Platform</Text>
                <View style={styles.optionRow}>
                  {platforms.filter(p => p.enabled).map((p) => (
                    <TouchableOpacity key={p.id} style={[styles.optionBtn, uiSettings.defaultPlatform === p.id && styles.optionSelected]} onPress={() => setUiSettings({ ...uiSettings, defaultPlatform: p.id })}>
                      <Text style={[styles.optionText, uiSettings.defaultPlatform === p.id && styles.optionTextSelected]}>{p.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <Button title="Save UI Settings" onPress={handleSaveUiSettings} loading={saving} style={styles.saveBtn} />
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  adminBadge: { backgroundColor: colors.primaryDark, padding: spacing.sm, alignItems: 'center' },
  adminText: { color: colors.white, fontSize: fontSize.sm, fontWeight: '600' },
  tabScroll: { maxHeight: 60 },
  tabRow: { flexDirection: 'row', padding: spacing.md, paddingHorizontal: spacing.sm },
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginRight: spacing.xs },
  tabSelected: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { color: colors.textSecondary, fontSize: fontSize.sm },
  tabTextSelected: { color: colors.primary, fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: spacing.md },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -spacing.sm },
  statCard: { width: '45%', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, alignItems: 'center', margin: '2.5%' },
  statNumber: { color: colors.primary, fontSize: fontSize.xxl, fontWeight: '700' },
  statLabel: { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: spacing.xs },
  refreshBtn: { marginTop: spacing.md, marginBottom: spacing.lg },
  sectionTitle: { color: colors.text, fontSize: fontSize.xl, fontWeight: '700', marginBottom: spacing.lg, marginTop: spacing.md },
  subSectionTitle: { color: colors.primary, fontSize: fontSize.md, fontWeight: '600', marginBottom: spacing.md, marginTop: spacing.lg },
  sectionSubtitle: { color: colors.textSecondary, fontSize: fontSize.sm, marginBottom: spacing.md },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.md },
  settingInfo: { flex: 1, marginRight: spacing.md },
  settingLabel: { color: colors.text, fontSize: fontSize.md, fontWeight: '600' },
  inputSection: { marginBottom: spacing.lg },
  inputLabel: { color: colors.text, fontSize: fontSize.md, fontWeight: '600', marginBottom: spacing.sm },
  numberInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md },
  numberBtn: { padding: spacing.md, backgroundColor: colors.primaryDark, borderRadius: borderRadius.md },
  numberBtnText: { color: colors.white, fontSize: fontSize.xl, fontWeight: '700' },
  numberValue: { flex: 1, textAlign: 'center', color: colors.text, fontSize: fontSize.xl, fontWeight: '700' },
  saveBtn: { marginTop: spacing.lg, marginBottom: spacing.xl },
  platformRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm },
  platformInfo: { flex: 1 },
  platformName: { color: colors.text, fontSize: fontSize.md, fontWeight: '600' },
  platformDetails: { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: spacing.xs },
  optionRow: { flexDirection: 'row', marginHorizontal: -spacing.xs },
  optionBtn: { flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.sm, alignItems: 'center', marginHorizontal: spacing.xs, borderWidth: 2, borderColor: 'transparent' },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primaryDark + '20' },
  optionText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '500' },
  optionTextSelected: { color: colors.primary },
});
