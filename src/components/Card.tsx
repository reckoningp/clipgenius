import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, borderRadius, fontSize, spacing } from '../utils/theme';
import { Clip, Video } from '../types';
import { getPlatformName } from '../services/videoService';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
  const Container = onPress ? TouchableOpacity : View;
  return (
    <Container style={[styles.card, style]} onPress={onPress} activeOpacity={0.8}>
      {children}
    </Container>
  );
};

interface VideoCardProps {
  video: Video;
  onPress?: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onPress }) => {
  const getStatusColor = () => {
    switch (video.status) {
      case 'processing': return colors.warning;
      case 'done': return colors.success;
      case 'failed': return colors.error;
      default: return colors.textMuted;
    }
  };

  return (
    <Card style={styles.videoCard} onPress={onPress}>
      <View style={styles.videoThumb}>
        <Text style={styles.videoIcon}>🎬</Text>
      </View>
      <View style={styles.videoInfo}>
        <Text style={styles.videoPlatform}>{getPlatformName(video.platformType)}</Text>
        <Text style={styles.videoDate}>
          {new Date(video.createdAt).toLocaleDateString()}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{video.status}</Text>
        </View>
      </View>
    </Card>
  );
};

interface ClipCardProps {
  clip: Clip;
  selected?: boolean;
  onPress?: () => void;
  onSelectThumbnail?: () => void;
}

export const ClipCard: React.FC<ClipCardProps> = ({ clip, selected, onPress, onSelectThumbnail }) => {
  const cardStyle = [
    styles.clipCard,
    selected ? styles.clipSelected : undefined,
  ];

  return (
    <Card style={cardStyle as any} onPress={onPress}>
      <View style={styles.clipThumb}>
        <Image
          source={{ uri: clip.selectedThumbnail || clip.thumbnailUrls[0] }}
          style={styles.clipImage}
        />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{Math.round(clip.duration)}s</Text>
        </View>
      </View>
      <Text style={styles.clipTime}>Start: {Math.round(clip.startTime)}s</Text>
      <TouchableOpacity onPress={onSelectThumbnail} style={styles.thumbnailBtn}>
        <Text style={styles.thumbnailBtnText}>Select Thumbnail</Text>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  videoCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoThumb: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoIcon: {
    fontSize: 24,
  },
  videoInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  videoPlatform: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  videoDate: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  statusText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  clipCard: {
    width: 160,
    marginRight: spacing.md,
  },
  clipSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  clipThumb: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  clipImage: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  durationText: {
    color: colors.white,
    fontSize: fontSize.xs,
  },
  clipTime: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
  thumbnailBtn: {
    marginTop: spacing.sm,
  },
  thumbnailBtnText: {
    color: colors.primary,
    fontSize: fontSize.sm,
  },
});