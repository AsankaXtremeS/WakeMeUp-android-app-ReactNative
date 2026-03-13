import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useReminderStore, { REMINDER_STATUS } from '../store/reminderStore';
import { colors, typography, spacing, radius, shadows } from '../theme';
import ReminderCard from '../components/ReminderCard';

export default function HomeScreen() {
  const navigation = useNavigation();
  const reminders = useReminderStore((s) => s.reminders);
  const activeReminders = reminders.filter((r) => r.status === REMINDER_STATUS.ACTIVE);

  const todayCount = reminders.filter((r) => {
    const today = new Date().toDateString();
    return new Date(r.createdAt).toDateString() === today;
  }).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.title}>WakeMeUp</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="radio-button-on" size={10} color={colors.primary} />
            <Text style={styles.badgeText}>{activeReminders.length} active</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Active" value={activeReminders.length} iconName="location" color={colors.primary} />
          <StatCard label="Today" value={todayCount} iconName="today" color={colors.success} />
          <StatCard label="Total" value={reminders.length} iconName="albums" color={colors.warning} />
        </View>

        {/* Quick Add */}
        <Text style={styles.sectionLabel}>Quick Add</Text>
        <View style={styles.quickActions}>
          <QuickActionButton
            iconName="location"
            label="Location Reminder"
            subtitle="Alert near a place"
            color={colors.primary}
            onPress={() => navigation.navigate('MapScreen')}
          />
          <QuickActionButton
            iconName="alarm"
            label="Time Alarm"
            subtitle="Coming in v2"
            color={colors.textMuted}
            disabled
          />
        </View>

        {/* Active Reminders */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Active Reminders</Text>
          {activeReminders.length > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('Reminders')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          )}
        </View>

        {activeReminders.length === 0 ? (
          <EmptyState onPress={() => navigation.navigate('MapScreen')} />
        ) : (
          activeReminders.slice(0, 3).map((reminder) => (
            <ReminderCard key={reminder.id} reminder={reminder} />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => navigation.navigate('MapScreen')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

function StatCard({ label, value, iconName, color }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={iconName} size={20} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickActionButton({ iconName, label, subtitle, color, onPress, disabled }) {
  return (
    <TouchableOpacity
      style={[styles.quickAction, disabled && styles.quickActionDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={iconName} size={22} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.quickActionLabel, { color: disabled ? colors.textMuted : colors.textPrimary }]}>
          {label}
        </Text>
        <Text style={styles.quickActionSub}>{subtitle}</Text>
      </View>
      {!disabled && (
        <Ionicons name="chevron-forward" size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  );
}

function EmptyState({ onPress }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="map-outline" size={48} color={colors.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>No active reminders</Text>
      <Text style={styles.emptyBody}>
        Tap the button below to add your first location reminder.
      </Text>
     
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { padding: spacing.md, paddingBottom: 120 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: spacing.lg,
  },
  greeting: { ...typography.body, marginBottom: 2 },
  title: { ...typography.h1, color: colors.textPrimary },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.primaryGlow,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderWidth: 1, borderColor: colors.primary + '44',
  },
  badgeText: { ...typography.captionBold, color: colors.primary },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: {
    flex: 1, backgroundColor: colors.bgCard,
    borderRadius: radius.md, padding: spacing.md,
    alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: colors.border,
  },
  statValue: { ...typography.h2, color: colors.textPrimary },
  statLabel: { ...typography.caption },
  sectionLabel: { ...typography.label, marginBottom: spacing.sm },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.sm, marginTop: spacing.lg,
  },
  seeAll: { ...typography.captionBold, color: colors.primary },
  quickActions: { gap: spacing.sm, marginBottom: spacing.md },
  quickAction: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard, borderRadius: radius.md,
    padding: spacing.md, gap: spacing.md,
    borderWidth: 1, borderColor: colors.border, ...shadows.card,
  },
  quickActionDisabled: { opacity: 0.4 },
  quickActionIcon: {
    width: 48, height: 48, borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  quickActionLabel: { ...typography.bodyBold },
  quickActionSub: { ...typography.caption, marginTop: 2 },
  emptyState: {
    alignItems: 'center', paddingVertical: spacing.xxl,
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border,
    borderStyle: 'dashed', gap: spacing.sm,
  },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.bgElevated,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: { ...typography.h3 },
  emptyBody: { ...typography.body, textAlign: 'center', paddingHorizontal: spacing.xl },
  emptyButton: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.primary, borderRadius: radius.full,
    paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
  emptyButtonText: { ...typography.bodyBold, color: '#fff' },
  fab: {
    position: 'absolute', bottom: 90, alignSelf: 'center',
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.glow(colors.primary),
  },
  fabPressed: { transform: [{ scale: 0.93 }] },
});