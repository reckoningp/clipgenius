import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useApp } from '../context/AppContext';
import { Header, Button, VideoCard } from '../components';
import { colors, fontSize, spacing, borderRadius } from '../utils/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, videos, isAdmin } = useApp();

  const recentVideos = videos.slice(-5).reverse();

  return (
    <View style={styles.container}>
      <Header title="ClipGenius" subtitle="AI-Powered Video Clipper" />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Transform Your Videos</Text>
          <Text style={styles.heroSubtitle}>
            Upload your raw footage and let AI find the best moments automatically
          </Text>
          <Button
            title="Upload Video"
            onPress={() => navigation.navigate('Upload')}
            size="large"
            style={styles.heroBtn}
          />
        </View>

        {user && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{videos.length}</Text>
              <Text style={styles.statLabel}>Videos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {videos.reduce((acc, v) => acc + (v.clips?.length || 0), 0)}
              </Text>
              <Text style={styles.statLabel}>Clips</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{user.isAdmin ? 'Admin' : 'Free'}</Text>
              <Text style={styles.statLabel}>Plan</Text>
            </View>
          </View>
        )}

        {recentVideos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Videos</Text>
              <TouchableOpacity onPress={() => navigation.navigate('History')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {recentVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onPress={() => navigation.navigate('VideoDetail', { videoId: video.id })}
              />
            ))}
          </View>
        )}

        {videos.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎥</Text>
            <Text style={styles.emptyTitle}>No videos yet</Text>
            <Text style={styles.emptyText}>
              Upload your first video to get started
            </Text>
          </View>
        )}

        {isAdmin && (
          <Button
            title="Admin Panel"
            variant="outline"
            onPress={() => navigation.navigate('Admin')}
            style={styles.adminBtn}
          />
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
  hero: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroTitle: {
    color: colors.text,
    fontSize: fontSize.xxl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  heroBtn: {
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  statNumber: {
    color: colors.primary,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  seeAll: {
    color: colors.primary,
    fontSize: fontSize.sm,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  adminBtn: {
    marginBottom: spacing.xl,
  },
});