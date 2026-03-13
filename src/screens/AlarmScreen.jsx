import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
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
  const soundRef = useRef(null);
  const [dismissed, setDismissed] = useState(false);

  // Pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15, duration: 600, useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1, duration: 600, useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Sound + vibration
  useEffect(() => {
    let isMounted = true;

    const startAlarm = async () => {
      try {
        // Set audio mode — play even on silent
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
        });

        if (alertType === 'standard') {
          // Load and play alarm sound on loop
          const { sound } = await Audio.Sound.createAsync(
            require('../../assets/sounds/alarm.mp3'),
            { shouldPlay: true, isLooping: true, volume: 1.0 }
          );
          if (isMounted) soundRef.current = sound;

          // Haptic feedback
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning
          );

          // Repeating vibration pattern
          Vibration.vibrate([0, 500, 300, 500], true);

        } else if (alertType === 'vibration') {
          // Vibration only — no sound
          Vibration.vibrate([0, 800, 400, 800], true);
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
      } catch (e) {
        console.warn('Alarm sound error:', e);
        // Fallback to vibration if sound fails
        Vibration.vibrate([0, 500, 300, 500], true);
      }
    };

    startAlarm();

    return () => {
      isMounted = false;
      stopAlarm();
    };
  }, []);

  const stopAlarm = async () => {
    try {
      Vibration.cancel();
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch (e) {}
  };

  const handleDismiss = async () => {
    await stopAlarm();
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setDismissed(true);
    if (reminderId) dismissReminder(reminderId);
    setTimeout(() => {
      navigation.navigate('MainTabs', { screen: 'Home' });
    }, 500);
  };

  const alertConfig = {
    standard: {
      icon: 'notifications',
      color: colors.primary,
      label: 'Location Alert',
      dismissText: 'Dismiss Alarm',
    },
    vibration: {
      icon: 'phone-portrait',
      color: colors.warning,
      label: 'Vibration Alert',
      dismissText: 'Dismiss',
    },
  };

  const config = alertConfig[alertType] ?? alertConfig.standard;

  return (
    <SafeAreaView style={styles.container}>
      {/* Background glow */}
      <View style={[styles.bgGlow, { backgroundColor: config.color }]} />

      <View style={styles.content}>
        <Animated.View style={[styles.iconRing, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.iconInner}>
            <Ionicons name="location" size={48} color={colors.primary} style={styles.iconEmoji} />
          </View>
        </Animated.View>

        {/* Text */}
        <Text style={styles.headline}>Almost there!</Text>
        <Text style={[styles.locationName, { color: config.color }]}>
          {locationName}
        </Text>
        <Text style={styles.subtitle}>
          You are approaching your destination.{'\n'}
          Tap dismiss when you are ready.
        </Text>

        {/* Alert type badge */}
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

      {/* Dismiss button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.dismissButton,
            { backgroundColor: dismissed ? colors.success : config.color },
          ]}
          onPress={handleDismiss}
          activeOpacity={0.85}
        >
          <Ionicons
            name={dismissed ? 'checkmark-circle' : 'hand-left'}
            size={22}
            color="#fff"
          />
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
  bgGlow: {
    position: 'absolute',
    top: -100, left: -100, right: -100,
    height: 400, opacity: 0.07, borderRadius: 200,
  },
  content: {
    flex: 1, alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl, gap: spacing.md,
  },
  iconRing: {
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: colors.primaryGlow,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  iconInner: {
    width: 108, height: 108, borderRadius: 54,
    alignItems: 'center', justifyContent: 'center',
  },
  headline: { ...typography.h1, textAlign: 'center' },
  locationName: {
    fontSize: 26, fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.xl,
  },
  typeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginTop: spacing.sm,
    backgroundColor: colors.bgCard,
    borderRadius: radius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  typeBadgeText: { ...typography.captionBold },
  footer: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  dismissButton: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: spacing.sm,
    borderRadius: radius.full,
    paddingVertical: spacing.md + 4,
    paddingHorizontal: spacing.xxl,
  },
  dismissText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});