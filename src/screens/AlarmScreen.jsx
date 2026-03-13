import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import useReminderStore from '../store/reminderStore';
import { colors, typography, spacing, radius } from '../theme';

const AudioPlayer = ({ alertType, onReady }) => {
  const audioHTML = `
    <!DOCTYPE html>
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;background:transparent;">
      <script>
        var ctx = new (window.AudioContext || window.webkitAudioContext)();
        var intervalId = null;

        function beep(freq, duration) {
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = freq || 880;
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.8, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (duration || 0.4));
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + (duration || 0.4));
        }

        function startStandard() {
          beep(880, 0.3);
          setTimeout(function() { beep(1100, 0.3); }, 350);
          intervalId = setInterval(function() {
            beep(880, 0.3);
            setTimeout(function() { beep(1100, 0.3); }, 350);
          }, 1200);
        }

        function startVibration() {
          beep(60, 0.5);
          intervalId = setInterval(function() { beep(60, 0.5); }, 900);
        }

        function stopAlarm() {
          if (intervalId) clearInterval(intervalId);
        }

        var alertType = '${alertType}';

        setTimeout(function() {
          if (alertType === 'standard') startStandard();
          else startVibration();
          window.ReactNativeWebView.postMessage('ready');
        }, 300);

        window.addEventListener('message', function(e) {
          if (e.data === 'stop') stopAlarm();
        });
        document.addEventListener('message', function(e) {
          if (e.data === 'stop') stopAlarm();
        });
      </script>
    </body>
    </html>
  `;

  return (
    <WebView
      source={{ html: audioHTML }}
      style={{ width: 1, height: 1, opacity: 0 }}
      javaScriptEnabled
      onMessage={(e) => {
        if (e.nativeEvent.data === 'ready') onReady?.();
      }}
    />
  );
};

export default function AlarmScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dismissReminder = useReminderStore((s) => s.dismissReminder);

  const reminderId = route.params?.reminderId;
  const locationName = route.params?.locationName ?? 'Your destination';
  const alertType = route.params?.alertType ?? 'standard';

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [dismissed, setDismissed] = useState(false);
  const [soundPlaying, setSoundPlaying] = useState(false);

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
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (e) {}
  }, []);

  const handleDismiss = async () => {
    setSoundPlaying(false);
    setDismissed(true);
    if (reminderId) dismissReminder(reminderId);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {}
    setTimeout(() => {
      navigation.navigate('MainTabs', { screen: 'Home' });
    }, 500);
  };

  const alertConfig = {
    standard: { icon: 'notifications', color: colors.primary, dismissText: 'Dismiss Alarm' },
    vibration: { icon: 'phone-portrait', color: colors.warning, dismissText: 'Dismiss' },
  };

  const config = alertConfig[alertType] ?? alertConfig.standard;

  return (
    <SafeAreaView style={styles.container}>
      {!dismissed && (
        <AudioPlayer alertType={alertType} onReady={() => setSoundPlaying(true)} />
      )}

      <View style={[styles.bgGlow, { backgroundColor: config.color }]} />

      <View style={styles.content}>
        <Animated.View style={[
          styles.iconRing,
          { transform: [{ scale: pulseAnim }], borderColor: config.color + '66' },
        ]}>
          <View style={[styles.iconInner, { backgroundColor: config.color + '33' }]}>
            <Ionicons name="location" size={52} color={config.color} />
          </View>
        </Animated.View>

        <Text style={styles.headline}>Almost there!</Text>
        <Text style={[styles.locationName, { color: config.color }]}>{locationName}</Text>
        <Text style={styles.subtitle}>
          You are approaching your destination.{'\n'}
          Tap dismiss when you are ready.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.dismissButton,
            { backgroundColor: dismissed ? colors.success : config.color },
          ]}
          onPress={handleDismiss}
          activeOpacity={0.85}
        >
          <Ionicons name={dismissed ? 'checkmark-circle' : 'hand-left'} size={22} color="#fff" />
          <Text style={styles.dismissText}>
            {dismissed ? 'Dismissed!' : config.dismissText}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  bgGlow: {
    position: 'absolute', top: -100, left: -100, right: -100,
    height: 400, opacity: 0.07, borderRadius: 200,
  },
  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: spacing.xl, gap: spacing.md,
  },
  iconRing: {
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: colors.primaryGlow, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg,
  },
  iconInner: {
    width: 108, height: 108, borderRadius: 54,
    alignItems: 'center', justifyContent: 'center',
  },
  headline: { ...typography.h1, textAlign: 'center' },
  locationName: { fontSize: 26, fontWeight: '700', textAlign: 'center' },
  subtitle: { ...typography.body, textAlign: 'center', lineHeight: 24, paddingHorizontal: spacing.xl },
  footer: { padding: spacing.xl, paddingBottom: spacing.xxl },
  dismissButton: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: spacing.sm,
    borderRadius: radius.full,
    paddingVertical: spacing.md + 4, paddingHorizontal: spacing.xxl,
  },
  dismissText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});