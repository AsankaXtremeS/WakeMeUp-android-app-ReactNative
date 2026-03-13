import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useReminderStore, {
  ALERT_TYPES,
  TRIGGER_TYPES,
  REMINDER_STATUS,
} from '../store/reminderStore';
import { colors, typography, spacing, radius, shadows } from '../theme';

const alertConfig = {
  [ALERT_TYPES.AGGRESSIVE]: { icon: 'alarm', color: colors.danger },
  [ALERT_TYPES.STANDARD]: { icon: 'notifications', color: colors.primary },
  [ALERT_TYPES.VIBRATION]: { icon: 'phone-portrait', color: colors.warning },
};

export default function ReminderCard({ reminder }) {
  const toggleReminder = useReminderStore((s) => s.toggleReminder);
  const deleteReminder = useReminderStore((s) => s.deleteReminder);

  const isActive = reminder.status === REMINDER_STATUS.ACTIVE;
  const alert = alertConfig[reminder.alertType] ?? alertConfig[ALERT_TYPES.STANDARD];
  const triggerLabel =
    reminder.triggerType === TRIGGER_TYPES.DISTANCE
      ? `${reminder.distanceKm} km away`
      : `${reminder.etaMinutes} min before`;

  return (
    <View style={[styles.card, !isActive && styles.cardInactive]}>
      <View style={[styles.accent, { backgroundColor: isActive ? colors.primary : colors.textMuted }]} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={[styles.iconWrap, { backgroundColor: alert.color + '22' }]}>
            <Ionicons name={alert.icon} size={20} color={alert.color} />
          </View>
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
            <Text style={[styles.toggleText, { color: isActive ? colors.primary : colors.textMuted }]}>
              {isActive ? 'ON' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.pill}>
            <Ionicons name="location-outline" size={11} color={colors.textSecondary} />
            <Text style={styles.pillText}>{triggerLabel}</Text>
          </View>
          <TouchableOpacity
            onPress={() => deleteReminder(reminder.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
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
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  toggleText: { fontSize: 10, fontWeight: '700' },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  pillText: { ...typography.caption, color: colors.textSecondary },
  deleteButton: { padding: 4 },
});