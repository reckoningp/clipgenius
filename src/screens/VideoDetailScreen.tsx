import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Header, Button, ClipCard } from '../components';
import { useApp } from '../context/AppContext';
import { colors, fontSize, spacing, borderRadius } from '../utils/theme';
import { Clip } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  VideoDetail: { videoId: string };
  [key: string]: undefined | object;
};

type VideoDetailScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  route: RouteProp<RootStackParamList, 'VideoDetail'>;
};

const { width } = Dimensions.get('window');

export const VideoDetailScreen: React.FC<VideoDetailScreenProps> = ({ navigation, route }) => {
  const { videoId } = route.params;
  const { videos, updateVideo } = useApp();
  const video = videos.find((v) => v.id === videoId);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null);

  if (!video) {
    return (
      <View style={styles.container}>
        <Header title="Video Detail" showBack onBack={() => navigation.goBack()} />
        <View style={styles.errorState}>
          <Text style={styles.errorText}>Video not found</Text>
        </View>
      </View>
    );
  }

  const handleExport = () => {
    if (!selectedClip) {
      Alert.alert('Select a clip', 'Please select a clip to export');
      return;
    }
    Alert.alert('Export', 'Video exported successfully!');
  };

  const handleThumbnailSelect = (clipId: string, thumbnails: string[]) => {
    Alert.alert('Select Thumbnail', 'Choose a thumbnail', [
      ...thumbnails.map((t, i) => ({
        text: `Thumbnail ${i + 1}`,
        onPress: () => setSelectedThumbnail(t),
      })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header title="Your Clips" showBack onBack={() => navigation.goBack()} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusBanner}>
          <View style={[styles.statusDot, { backgroundColor: video.status === 'done' ? colors.success : colors.warning }]} />
          <Text style={styles.statusText}>
            {video.status === 'done' ? 'Processing Complete' : 'Processing...'}
          </Text>
        </View>

        {video.clips && video.clips.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Best Clips Found</Text>
            <Text style={styles.sectionSubtitle}>
              Tap a clip to select it for export
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.clipsList}
              contentContainerStyle={styles.clipsContainer}
            >
              {video.clips.map((clip) => (
                <ClipCard
                  key={clip.id}
                  clip={clip}
                  selected={selectedClip === clip.id}
                  onPress={() => setSelectedClip(clip.id)}
                  onSelectThumbnail={() => handleThumbnailSelect(clip.id, clip.thumbnailUrls)}
                />
              ))}
            </ScrollView>

            {selectedThumbnail && (
              <View style={styles.thumbnailSection}>
                <Text style={styles.sectionTitle}>Selected Thumbnail</Text>
                <Image source={{ uri: selectedThumbnail }} style={styles.thumbnailImage} />
              </View>
            )}

            <View style={styles.exportSection}>
              <Text style={styles.exportTitle}>Export Settings</Text>
              <View style={styles.exportRow}>
                <Text style={styles.exportLabel}>Format</Text>
                <Text style={styles.exportValue}>MP4</Text>
              </View>
              <View style={styles.exportRow}>
                <Text style={styles.exportLabel}>Quality</Text>
                <Text style={styles.exportValue}>High</Text>
              </View>
              <View style={styles.exportRow}>
                <Text style={styles.exportLabel}>Aspect Ratio</Text>
                <Text style={styles.exportValue}>
                  {video.platformType === 'youtube'
                    ? '16:9'
                    : video.platformType === 'facebook' || video.platformType === 'twitter'
                    ? '1:1'
                    : '9:16'}
                </Text>
              </View>
            </View>

            <Button
              title="Export Video"
              onPress={handleExport}
              size="large"
              style={styles.exportBtn}
            />
          </>
        ) : (
          <View style={styles.processingState}>
            <Text style={styles.processingIcon}>⏳</Text>
            <Text style={styles.processingTitle}>AI is analyzing your video</Text>
            <Text style={styles.processingText}>
              Finding the best moments based on motion, faces, and audio energy...
            </Text>
          </View>
        )}
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
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.lg,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  statusText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '500',
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
  clipsList: {
    marginHorizontal: -spacing.md,
    marginBottom: spacing.lg,
  },
  clipsContainer: {
    paddingHorizontal: spacing.md,
  },
  thumbnailSection: {
    marginBottom: spacing.lg,
  },
  thumbnailImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  exportSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  exportTitle: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  exportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  exportLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  exportValue: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  exportBtn: {
    marginBottom: spacing.xl,
  },
  processingState: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  processingIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  processingTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  processingText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
});