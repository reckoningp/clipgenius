import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Header, VideoCard } from '../components';
import { useApp } from '../context/AppContext';
import { colors, fontSize, spacing, borderRadius } from '../utils/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type HistoryScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
  const { videos } = useApp();
  const sortedVideos = [...videos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <View style={styles.container}>
      <Header title="History" showBack onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterBtn, styles.filterBtnActive]}>
            <Text style={[styles.filterText, styles.filterTextActive]}>Processing</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterText}>Completed</Text>
          </TouchableOpacity>
        </View>

        {sortedVideos.length > 0 ? (
          <FlatList
            data={sortedVideos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <VideoCard
                video={item}
                onPress={() => navigation.navigate('VideoDetail', { videoId: item.id })}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📹</Text>
            <Text style={styles.emptyTitle}>No videos yet</Text>
            <Text style={styles.emptyText}>
              Upload a video to see your history
            </Text>
          </View>
        )}
      </View>
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
  filterRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  filterBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  filterBtnActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  filterTextActive: {
    color: colors.white,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
});