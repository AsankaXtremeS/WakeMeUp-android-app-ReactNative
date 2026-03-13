import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useReminderStore, { ALERT_TYPES, TRIGGER_TYPES } from '../store/reminderStore';
import { colors, typography, spacing, radius, shadows } from '../theme';

const ALERT_OPTIONS = [
  { type: ALERT_TYPES.AGGRESSIVE, icon: 'alarm', label: 'Aggressive', subtitle: 'Persistent alarm + puzzle to dismiss' },
  { type: ALERT_TYPES.STANDARD, icon: 'notifications', label: 'Standard', subtitle: 'Sound + vibration notification' },
  { type: ALERT_TYPES.VIBRATION, icon: 'phone-portrait', label: 'Vibration Only', subtitle: 'Silent but physical alert' },
];

export default function SetupScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const addReminder = useReminderStore((s) => s.addReminder);

  const location = route.params?.location ?? {
    latitude: 0, longitude: 0,
    name: 'Unknown Location', address: '',
  };

  const [triggerType, setTriggerType] = useState(TRIGGER_TYPES.DISTANCE);
  const [distanceKm, setDistanceKm] = useState(1);
  const [etaMinutes, setEtaMinutes] = useState(10);
  const [alertType, setAlertType] = useState(ALERT_TYPES.AGGRESSIVE);

  const handleSave = () => {
    addReminder({
      location,
      label: location.name,
      triggerType,
      distanceKm,
      etaMinutes,
      alertType,
    });
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Set Reminder</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Destination */}
        <View style={styles.destinationCard}>
          <Ionicons name="location-outline" size={24} color={colors.primary} style={styles.destinationEmoji} />
          <View style={{ flex: 1 }}>
            <Text style={styles.destinationName} numberOfLines={1}>{location.name}</Text>
            <Text style={styles.destinationAddress} numberOfLines={1}>{location.address}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Trigger type */}
        <Text style={styles.sectionLabel}>Alert me by</Text>
        <View style={styles.segmentRow}>
          <SegmentButton icon="resize-outline" label="Distance" active={triggerType === TRIGGER_TYPES.DISTANCE} onPress={() => setTriggerType(TRIGGER_TYPES.DISTANCE)} />
          <SegmentButton icon="time-outline" label="ETA" active={triggerType === TRIGGER_TYPES.ETA} onPress={() => setTriggerType(TRIGGER_TYPES.ETA)} />
        </View>

        {/* Value control */}
        {triggerType === TRIGGER_TYPES.DISTANCE ? (
          <ValueControl
            label="Distance"
            value={`${distanceKm}`}
            unit="km away"
            iconName="resize-outline"
            onDecrement={() => setDistanceKm((v) => Math.max(0.2, +(v - 0.2).toFixed(1)))}
            onIncrement={() => setDistanceKm((v) => Math.min(20, +(v + 0.2).toFixed(1)))}
          />
        ) : (
          <ValueControl
            label="ETA"
            value={`${etaMinutes}`}
            unit="min before arrival"
            iconName="time-outline"
            onDecrement={() => setEtaMinutes((v) => Math.max(2, v - 1))}
            onIncrement={() => setEtaMinutes((v) => Math.min(60, v + 1))}
          />
        )}

        {distanceKm < 0.3 && triggerType === TRIGGER_TYPES.DISTANCE && (
          <View style={styles.warningRow}>
            <Ionicons name="warning-outline" size={14} color={colors.warning} />
            <Text style={styles.warningText}>Minimum reliable geofence is 200m</Text>
          </View>
        )}

        {/* Alert type */}
        <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>Alert type</Text>
        <View style={styles.alertOptions}>
          {ALERT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.type}
              style={[styles.alertOption, alertType === opt.type && styles.alertOptionActive]}
              onPress={() => setAlertType(opt.type)}
              activeOpacity={0.75}
            >
              <Ionicons name={opt.icon} size={24} color={alertType === opt.type ? colors.primary : colors.textMuted} style={styles.alertEmoji} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.alertLabel, alertType === opt.type && { color: colors.primary }]}>
                  {opt.label}
                </Text>
                <Text style={styles.alertSubtitle}>{opt.subtitle}</Text>
              </View>
              {alertType === opt.type && (
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Save */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.saveButtonText}>Set Reminder</Text>
            <Ionicons name="checkmark-done" size={20} color="#fff" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SegmentButton({ icon, label, active, onPress }) {
  return (
    <TouchableOpacity style={[styles.segment, active && styles.segmentActive]} onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Ionicons name={icon} size={16} color={active ? '#fff' : colors.textMuted} />
        <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

function ValueControl({ label, value, unit, iconName, onDecrement, onIncrement }) {
  return (
    <View style={styles.valueControl}>
      <View style={styles.valueLabelRow}>
        <Ionicons name={iconName} size={14} color={colors.textMuted} />
        <Text style={styles.sectionLabel}>{label}</Text>
      </View>
      <View style={styles.valueRow}>
        <TouchableOpacity style={styles.valueButton} onPress={onDecrement}>
          <Ionicons name="remove" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.valueDisplay}>
          <Text style={styles.valueNumber}>{value}</Text>
          <Text style={styles.valueUnit}>{unit}</Text>
        </View>
        <TouchableOpacity style={styles.valueButton} onPress={onIncrement}>
          <Ionicons name="add" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgCard },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  handle: {
    width: 40, height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerTitle: { ...typography.h3 },
  destinationCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  destIconWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primaryGlow,
    alignItems: 'center', justifyContent: 'center',
  },
  destinationName: { ...typography.bodyBold },
  destinationAddress: { ...typography.caption, marginTop: 2 },
  changeText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  sectionLabel: { ...typography.label, marginBottom: spacing.sm },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 4, gap: 4,
    marginBottom: spacing.md,
  },
  segment: {
    flex: 1, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.sm, gap: 6,
  },
  segmentActive: { backgroundColor: colors.primary },
  segmentText: { ...typography.bodyBold, color: colors.textMuted },
  segmentTextActive: { color: '#fff' },
  valueControl: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  valueLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  valueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  valueButton: {
    width: 48, height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.bgElevated,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  valueDisplay: { alignItems: 'center' },
  valueNumber: { ...typography.h1, color: colors.primary },
  valueUnit: { ...typography.caption },
  warningRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: spacing.sm, marginTop: spacing.sm,
  },
  warningText: { ...typography.caption, color: colors.warning },
  alertOptions: { gap: spacing.sm },
  alertOption: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.md, gap: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  alertOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  alertIconWrap: {
    width: 42, height: 42,
    borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  alertLabel: { ...typography.bodyBold },
  alertSubtitle: { ...typography.caption, marginTop: 2 },
  saveButton: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    marginTop: spacing.xl,
    ...shadows.glow(colors.primary),
  },
  saveButtonText: { ...typography.bodyBold, color: '#fff', fontSize: 16 },
  cancelButton: { alignItems: 'center', paddingVertical: spacing.md },
  cancelText: { ...typography.body, color: colors.textMuted },
});