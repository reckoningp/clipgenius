import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { Header, Button } from '../components';
import { useApp } from '../context/AppContext';
import { colors, fontSize, spacing, borderRadius } from '../utils/theme';
import { PlatformType } from '../types';
import { getPlatformName } from '../services/videoService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

const platformOptions: PlatformType[] = ['tiktok', 'reels', 'youtube_shorts', 'youtube', 'facebook', 'twitter'];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { settings, updateSettings, logout } = useApp();

  const handleDeleteData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your videos and clips. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            logout();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Settings" showBack onBack={() => navigation.goBack()} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Video Quality</Text>
          <View style={styles.optionsRow}>
            {(['low', 'medium', 'high'] as const).map((q) => (
              <TouchableOpacity
                key={q}
                style={[styles.optionBtn, settings.quality === q && styles.optionSelected]}
                onPress={() => updateSettings({ quality: q })}
              >
                <Text style={[styles.optionText, settings.quality === q && styles.optionTextSelected]}>
                  {q.charAt(0).toUpperCase() + q.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Platform</Text>
          <View style={styles.platformGrid}>
            {platformOptions.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.platformBtn, settings.defaultPlatform === p && styles.platformSelected]}
                onPress={() => updateSettings({ defaultPlatform: p })}
              >
                <Text style={[styles.platformText, settings.defaultPlatform === p && styles.platformTextSelected]}>
                  {getPlatformName(p)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Save Location</Text>
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[styles.optionBtn, settings.saveLocation === 'device' && styles.optionSelected]}
              onPress={() => updateSettings({ saveLocation: 'device' })}
            >
              <Text style={[styles.optionText, settings.saveLocation === 'device' && styles.optionTextSelected]}>
                Device
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionBtn, settings.saveLocation === 'cloud' && styles.optionSelected]}
              onPress={() => updateSettings({ saveLocation: 'cloud' })}
            >
              <Text style={[styles.optionText, settings.saveLocation === 'cloud' && styles.optionTextSelected]}>
                Cloud
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Notifications</Text>
            <Text style={styles.switchSubtext}>Get notified when processing is done</Text>
          </View>
          <Switch
            value={settings.notifications}
            onValueChange={(value) => updateSettings({ notifications: value })}
            trackColor={{ false: colors.surfaceLight, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>📧</Text>
            <Text style={styles.menuText}>Change Email</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🔒</Text>
            <Text style={styles.menuText}>Change Password</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🔔</Text>
            <Text style={styles.menuText}>Notification Preferences</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Delete All Data"
          variant="danger"
          onPress={handleDeleteData}
          style={styles.deleteBtn}
        />

        <Text style={styles.version}>ClipGenius v1.0.0</Text>
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
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  optionsRow: {
    flexDirection: 'row',
  },
  optionBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: colors.transparent,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDark + '20',
  },
  optionText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: colors.primary,
  },
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  platformBtn: {
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
  platformText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  platformTextSelected: {
    color: colors.primary,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  switchLabel: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  switchSubtext: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  menuText: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.md,
  },
  menuArrow: {
    color: colors.textMuted,
    fontSize: fontSize.xl,
  },
  deleteBtn: {
    marginTop: spacing.lg,
  },
  version: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
});