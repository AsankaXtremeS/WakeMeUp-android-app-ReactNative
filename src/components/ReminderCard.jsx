import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import useReminderStore, {
  ALERT_TYPES,
  TRIGGER_TYPES,
  REMINDER_STATUS,
} from '../store/reminderStore';
import { colors, typography, spacing, radius, shadows } from '../theme';

const alertEmoji = {
  [ALERT_TYPES.AGGRESSIVE]: '🚨',
  [ALERT_TYPES.STANDARD]: '🔔',
  [ALERT_TYPES.VIBRATION]: '📳',
};

export default function ReminderCard({ reminder }) {
  const toggleReminder = useReminderStore((s) => s.toggleReminder);
  const deleteReminder = useReminderStore((s) => s.deleteReminder);

  const isActive = reminder.status === REMINDER_STATUS.ACTIVE;
  const triggerLabel =
    reminder.triggerType === TRIGGER_TYPES.DISTANCE
      ? `${reminder.distanceKm} km away`
      : `${reminder.etaMinutes} min before`;

  return (
    <View style={[styles.card, !isActive && styles.cardInactive]}>
      <View style={[styles.accent, { backgroundColor: isActive ? colors.primary : colors.textMuted }]} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.emoji}>{alertEmoji[reminder.alertType] ?? '🔔'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, !isActive && { color: colors.textMuted }]} numberOfLines={1}>
              {reminder.label || reminder.location?.name}
            </Text>
            <Text style={styles.address} numberOfLines={1}>
              {reminder.location?.address}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.toggle, isActive && styles.toggleActive]}
            onPress={() => toggleReminder(reminder.id)}
          >
            <Text style={styles.toggleText}>{isActive ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>📍 {triggerLabel}</Text>
          </View>
          <TouchableOpacity onPress={() => deleteReminder(reminder.id)}>
            <Text style={{ fontSize: 16 }}>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  cardInactive: { opacity: 0.55 },
  accent: { width: 4 },
  body: { flex: 1, padding: spacing.md },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  emoji: { fontSize: 22 },
  name: { ...typography.bodyBold },
  address: { ...typography.caption, marginTop: 2 },
  toggle: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleActive: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
  },
  toggleText: { ...typography.captionBold, color: colors.primary, fontSize: 10 },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pill: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  pillText: { ...typography.caption, color: colors.textSecondary },
});