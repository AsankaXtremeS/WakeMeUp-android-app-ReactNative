import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
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
    latitude: 0, longitude: 0, name: 'Unknown Location', address: '',
  };

  const [triggerType, setTriggerType] = useState(TRIGGER_TYPES.DISTANCE);
  const [distanceKm, setDistanceKm] = useState(1);
  const [etaMinutes, setEtaMinutes] = useState(10);
  const [alertType, setAlertType] = useState(ALERT_TYPES.AGGRESSIVE);

  const handleSave = () => {
    addReminder({ location, label: location.name, triggerType, distanceKm, etaMinutes, alertType });
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.handle} />

        <View style={styles.destinationCard}>
          <Ionicons name="location-outline" size={24} color={colors.primary} style={styles.destinationEmoji} />
          <View style={{ flex: 1 }}>
            <Text style={styles.destinationName} numberOfLines={1}>{location.name}</Text>
            <Text style={styles.destinationAddress} numberOfLines={1}>{location.address}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>Change</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Alert me by</Text>
        <View style={styles.segmentRow}>
          <SegmentButton icon="resize-outline" label="Distance" active={triggerType === TRIGGER_TYPES.DISTANCE} onPress={() => setTriggerType(TRIGGER_TYPES.DISTANCE)} />
          <SegmentButton icon="time-outline" label="ETA" active={triggerType === TRIGGER_TYPES.ETA} onPress={() => setTriggerType(TRIGGER_TYPES.ETA)} />
        </View>

        {triggerType === TRIGGER_TYPES.DISTANCE ? (
          <ValueControl
            label="Distance" value={distanceKm} unit="km away"
            onDecrement={() => setDistanceKm((v) => Math.max(0.2, +(v - 0.2).toFixed(1)))}
            onIncrement={() => setDistanceKm((v) => Math.min(20, +(v + 0.2).toFixed(1)))}
          />
        ) : (
          <ValueControl
            label="ETA" value={etaMinutes} unit="min before arrival"
            onDecrement={() => setEtaMinutes((v) => Math.max(2, v - 1))}
            onIncrement={() => setEtaMinutes((v) => Math.min(60, v + 1))}
          />
        )}

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
                <Text style={[styles.alertLabel, alertType === opt.type && { color: colors.primary }]}>{opt.label}</Text>
                <Text style={styles.alertSubtitle}>{opt.subtitle}</Text>
              </View>
              {alertType === opt.type && <View style={styles.checkDot} />}
            </TouchableOpacity>
          ))}
        </View>

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

function ValueControl({ label, value, unit, onDecrement, onIncrement }) {
  return (
    <View style={styles.valueControl}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.valueRow}>
        <TouchableOpacity style={styles.valueButton} onPress={onDecrement}>
          <Text style={styles.valueButtonText}>−</Text>
        </TouchableOpacity>
        <View style={styles.valueDisplay}>
          <Text style={styles.valueNumber}>{value}</Text>
          <Text style={styles.valueUnit}>{unit}</Text>
        </View>
        <TouchableOpacity style={styles.valueButton} onPress={onIncrement}>
          <Text style={styles.valueButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgCard },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  handle: { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.lg },
  destinationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
  destinationEmoji: { fontSize: 24 },
  destinationName: { ...typography.bodyBold },
  destinationAddress: { ...typography.caption, marginTop: 2 },
  sectionLabel: { ...typography.label, marginBottom: spacing.sm },
  segmentRow: { flexDirection: 'row', backgroundColor: colors.bg, borderRadius: radius.md, padding: 4, marginBottom: spacing.md },
  segment: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.sm },
  segmentActive: { backgroundColor: colors.primary },
  segmentText: { ...typography.bodyBold, color: colors.textMuted },
  segmentTextActive: { color: '#fff' },
  valueControl: { backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  valueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  valueButton: { width: 48, height: 48, borderRadius: radius.sm, backgroundColor: colors.bgElevated, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  valueButtonText: { fontSize: 24, color: colors.textPrimary, fontWeight: '300' },
  valueDisplay: { alignItems: 'center' },
  valueNumber: { ...typography.h1, color: colors.primary },
  valueUnit: { ...typography.caption },
  alertOptions: { gap: spacing.sm },
  alertOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg, borderRadius: radius.md, padding: spacing.md, gap: spacing.md, borderWidth: 1, borderColor: colors.border },
  alertOptionActive: { borderColor: colors.primary, backgroundColor: colors.primaryGlow },
  alertEmoji: { fontSize: 24 },
  alertLabel: { ...typography.bodyBold },
  alertSubtitle: { ...typography.caption, marginTop: 2 },
  checkDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  saveButton: { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xl, ...shadows.glow(colors.primary) },
  saveButtonText: { ...typography.bodyBold, color: '#fff', fontSize: 16 },
  cancelButton: { alignItems: 'center', paddingVertical: spacing.md },
  cancelText: { ...typography.body, color: colors.textMuted },
});