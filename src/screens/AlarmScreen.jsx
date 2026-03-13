import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import useReminderStore from '../store/reminderStore';
import { colors, typography, spacing, radius } from '../theme';

export default function AlarmScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dismissReminder = useReminderStore((s) => s.dismissReminder);

  const reminderId = route.params?.reminderId;
  const locationName = route.params?.locationName ?? 'Your destination';
  const alertType = route.params?.alertType ?? 'standard';

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    if (alertType === 'aggressive') {
      Vibration.vibrate([0, 500, 300, 500, 300, 1000], true);
    }
    return () => Vibration.cancel();
  }, []);

  const handleDismiss = () => {
    Vibration.cancel();
    setDismissed(true);
    if (reminderId) dismissReminder(reminderId);
    setTimeout(() => navigation.navigate('MainTabs', { screen: 'Home' }), 300);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.bgGlow} />
      <View style={styles.content}>
        <Animated.View style={[styles.iconRing, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.iconInner}>
            <Ionicons name="location" size={48} color={colors.primary} style={styles.iconEmoji} />
          </View>
        </Animated.View>
        <Text style={styles.headline}>Almost there!</Text>
        <Text style={styles.locationName}>{locationName}</Text>
        <Text style={styles.subtitle}>
          {alertType === 'aggressive'
            ? 'You are approaching your destination. Tap dismiss when ready.'
            : "You're getting close to your stop."}
        </Text>
        <View style={styles.typeBadge}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            {alertType === 'aggressive' && (
              <Ionicons name="alarm" size={16} color={colors.danger} style={{ marginRight: 2 }} />
            )}
            {alertType === 'vibration' && (
              <Ionicons name="phone-portrait" size={16} color={colors.primary} style={{ marginRight: 2 }} />
            )}
            {alertType === 'standard' && (
              <Ionicons name="notifications" size={16} color={colors.primary} style={{ marginRight: 2 }} />
            )}
            <Text style={styles.typeBadgeText}>
              {alertType === 'aggressive'
                ? 'Aggressive Wake-Up'
                : alertType === 'vibration'
                ? 'Vibration'
                : 'Standard'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.dismissButton, dismissed && styles.dismissButtonDone]}
          onPress={handleDismiss}
          activeOpacity={0.85}
        >
          <Text style={styles.dismissText}>
            {dismissed
              ? 'Dismissed'
              : alertType === 'aggressive'
              ? "I'm Awake — Dismiss"
              : 'Dismiss'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  bgGlow: { position: 'absolute', top: -100, left: -100, right: -100, height: 400, backgroundColor: colors.primary, opacity: 0.08, borderRadius: 200 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  iconRing: { width: 140, height: 140, borderRadius: 70, backgroundColor: colors.primaryGlow, borderWidth: 2, borderColor: colors.primary + '66', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  iconInner: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primary + '33', alignItems: 'center', justifyContent: 'center' },
  iconEmoji: { fontSize: 48 },
  headline: { ...typography.h1, textAlign: 'center' },
  locationName: { fontSize: 26, fontWeight: '700', color: colors.primary, textAlign: 'center' },
  subtitle: { ...typography.body, textAlign: 'center', lineHeight: 22, paddingHorizontal: spacing.xl },
  typeBadge: { marginTop: spacing.sm, backgroundColor: colors.bgCard, borderRadius: radius.full, paddingVertical: spacing.xs, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border },
  typeBadgeText: { ...typography.captionBold },
  footer: { padding: spacing.xl, paddingBottom: spacing.xxl },
  dismissButton: { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: spacing.md + 4, paddingHorizontal: spacing.xxl, alignItems: 'center' },
  dismissButtonDone: { backgroundColor: colors.success },
  dismissText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});