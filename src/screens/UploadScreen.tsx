import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { launchImageLibrary, launchCamera, Asset } from 'react-native-image-picker';
import { Header, Button, Input } from '../components';
import { useApp } from '../context/AppContext';
import { colors, fontSize, spacing, borderRadius } from '../utils/theme';
import { PlatformType, Video, VideoStatus, Platform } from '../types';
import { getPlatformName, simulateAIProcessing, getPlatformRatio, processVideoWithAI, getEnabledPlatforms, getDefaultClipCount } from '../services/videoService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type UploadScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const platformIcons: Record<string, string> = {
  tiktok: '🎵',
  reels: '📸',
  youtube_shorts: '▶️',
  youtube: '📺',
  facebook: '👥',
  twitter: '🐦',
};

export const UploadScreen: React.FC<UploadScreenProps> = ({ navigation }) => {
  const { user, addVideo, settings, config } = useApp();
  const [selectedVideo, setSelectedVideo] = useState<Asset | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('tiktok');
  const [clipCount, setClipCount] = useState(3);
  const [isProcessing, setIsProcessing] = useState(false);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loadingPlatforms, setLoadingPlatforms] = useState(true);

  useEffect(() => {
    loadPlatforms();
  }, []);

  useEffect(() => {
    if (config?.uiSettings?.defaultPlatform) {
      setSelectedPlatform(config.uiSettings.defaultPlatform as PlatformType);
    }
  }, [config]);

  const loadPlatforms = async () => {
    try {
      const enabled = await getEnabledPlatforms();
      setPlatforms(enabled);
      if (enabled.length > 0 && !selectedPlatform) {
        setSelectedPlatform(enabled[0].id as PlatformType);
      }
      const defaultCount = await getDefaultClipCount();
      setClipCount(defaultCount);
    } catch (error) {
      console.error('Failed to load platforms:', error);
    } finally {
      setLoadingPlatforms(false);
    }
  };

  const handleSelectVideo = async () => {
    Alert.alert('Select Video', 'Choose an option', [
      {
        text: 'Camera',
        onPress: async () => {
          const result = await launchCamera({ mediaType: 'video', videoQuality: 'high' });
          if (result.assets && result.assets[0]) {
            setSelectedVideo(result.assets[0]);
          }
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const result = await launchImageLibrary({ mediaType: 'video', selectionLimit: 1 });
          if (result.assets && result.assets[0]) {
            setSelectedVideo(result.assets[0]);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleProcessVideo = async () => {
    if (!selectedVideo || !user) return;

    setIsProcessing(true);

    try {
      const videoId = `video_${Date.now()}`;
      const ratio = getPlatformRatio(selectedPlatform);

      const newVideo: Video = {
        id: videoId,
        userId: user.id,
        originalUrl: selectedVideo.uri || '',
        platformType: selectedPlatform,
        status: 'processing' as VideoStatus,
        createdAt: new Date().toISOString(),
      };

      addVideo(newVideo);

      const result = await processVideoWithAI(
        selectedVideo.uri || '',
        selectedPlatform,
        clipCount
      );

      const updatedVideo: Video = {
        ...newVideo,
        id: result.videoId,
        status: 'done' as VideoStatus,
        clips: result.clips,
      };

      addVideo(updatedVideo);

      navigation.replace('VideoDetail', { videoId: result.videoId });
    } catch (error) {
      console.error('Processing error:', error);
      Alert.alert('Error', 'Failed to process video. Using fallback...');
      
      const videoId = `video_${Date.now()}`;
      const fallbackClips = await simulateAIProcessing(videoId, selectedPlatform, clipCount);
      
      const fallbackVideo: Video = {
        id: videoId,
        userId: user.id,
        originalUrl: selectedVideo.uri || '',
        platformType: selectedPlatform,
        status: 'done' as VideoStatus,
        clips: fallbackClips,
        createdAt: new Date().toISOString(),
      };
      
      addVideo(fallbackVideo);
      navigation.replace('VideoDetail', { videoId });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Upload Video" showBack onBack={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Main')} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Video</Text>
          <TouchableOpacity style={styles.videoSelector} onPress={handleSelectVideo}>
            {selectedVideo ? (
              <View style={styles.selectedVideo}>
                <Text style={styles.videoName} numberOfLines={1}>
                  {selectedVideo.fileName || 'Selected Video'}
                </Text>
                <Text style={styles.changeText}>Tap to change</Text>
              </View>
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderIcon}>📁</Text>
                <Text style={styles.placeholderText}>Tap to select video</Text>
                <Text style={styles.placeholderSubtext}>MP4, MOV supported</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform</Text>
          <Text style={styles.sectionSubtitle}>Select target platform for best results</Text>
          {loadingPlatforms ? (
            <ActivityIndicator color={colors.primary} style={{ margin: 20 }} />
          ) : (
            <View style={styles.platformGrid}>
              {platforms.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.platformCard,
                    selectedPlatform === p.id && styles.platformSelected,
                  ]}
                  onPress={() => setSelectedPlatform(p.id as PlatformType)}
                >
                  <Text style={styles.platformIcon}>{platformIcons[p.id] || '📱'}</Text>
                  <Text
                    style={[
                      styles.platformName,
                      selectedPlatform === p.id && styles.platformNameSelected,
                    ]}
                  >
                    {p.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of Clips</Text>
          <View style={styles.clipCountRow}>
            {[1, 2, 3, 5].map((count) => (
              <TouchableOpacity
                key={count}
                style={[styles.clipCountBtn, clipCount === count && styles.clipCountSelected]}
                onPress={() => setClipCount(count)}
              >
                <Text
                  style={[styles.clipCountText, clipCount === count && styles.clipCountTextSelected]}
                >
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.previewSection}>
          <Text style={styles.previewLabel}>Output Preview</Text>
          <View style={styles.previewBox}>
            <View
              style={[
                styles.previewAspect,
                {
                  aspectRatio:
                    selectedPlatform === 'youtube'
                      ? 16 / 9
                      : selectedPlatform === 'facebook' || selectedPlatform === 'twitter'
                      ? 1
                      : 9 / 16,
                },
              ]}
            >
              <Text style={styles.previewText}>
                {selectedPlatform === 'youtube'
                  ? '16:9 Landscape'
                  : selectedPlatform === 'facebook' || selectedPlatform === 'twitter'
                  ? '1:1 Square'
                  : '9:16 Vertical'}
              </Text>
              <Text style={styles.previewDuration}>Max {clipCount} clips • Up to 60s</Text>
            </View>
          </View>
        </View>

        <Button
          title={isProcessing ? 'Processing...' : 'Start AI Processing'}
          onPress={handleProcessVideo}
          disabled={!selectedVideo || isProcessing}
          loading={isProcessing}
          size="large"
          style={styles.processBtn}
        />

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            AI will analyze your video and extract the best moments based on motion, faces, and
            audio energy.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  videoSelector: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
  },
  selectedVideo: {
    alignItems: 'center',
  },
  videoName: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  changeText: {
    color: colors.primary,
    fontSize: fontSize.sm,
  },
  placeholder: {
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  placeholderText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  placeholderSubtext: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  platformCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    margin: '1%',
    borderWidth: 2,
    borderColor: colors.transparent,
  },
  platformSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDark + '20',
  },
  platformIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  platformName: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  platformNameSelected: {
    color: colors.primary,
  },
  clipCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clipCountBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    borderWidth: 2,
    borderColor: colors.transparent,
  },
  clipCountSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDark + '20',
  },
  clipCountText: {
    color: colors.textSecondary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  clipCountTextSelected: {
    color: colors.primary,
  },
  previewSection: {
    marginBottom: spacing.lg,
  },
  previewLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  previewBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  previewAspect: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  previewText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  previewDuration: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  processBtn: {
    marginBottom: spacing.md,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  infoText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
});