import { useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { AppState } from 'react-native';
import { calculateDistance, isInsideGeofence } from '../services/geofenceService';
import useReminderStore, { REMINDER_STATUS } from '../store/reminderStore';

const LOCATION_UPDATE_INTERVAL = 10000; // 10 seconds
const LOCATION_UPDATE_DISTANCE = 20;    // 20 meters minimum movement

export default function useGeofence({ onTrigger }) {
  const locationSubscription = useRef(null);
  const appState = useRef(AppState.currentState);
  const triggeredIds = useRef(new Set()); // prevent double triggers

  const reminders = useReminderStore((s) => s.reminders);
  const triggerReminder = useReminderStore((s) => s.triggerReminder);

  const checkGeofences = useCallback((latitude, longitude) => {
    const activeReminders = reminders.filter(
      (r) => r.status === REMINDER_STATUS.ACTIVE
    );

    for (const reminder of activeReminders) {
      // Skip already triggered reminders this session
      if (triggeredIds.current.has(reminder.id)) continue;

      const { location, triggerType, distanceKm } = reminder;
      if (!location?.latitude || !location?.longitude) continue;

      const distance = calculateDistance(
        latitude, longitude,
        location.latitude, location.longitude
      );

      // Update distance in store for UI display
      useReminderStore.getState().updateReminder(reminder.id, {
        currentDistanceKm: distance,
      });

      // Check if inside geofence
      const triggerRadius = triggerType === 'distance' ? distanceKm : 0.5;
      const inside = isInsideGeofence(
        latitude, longitude,
        location.latitude, location.longitude,
        triggerRadius
      );

      if (inside) {
        triggeredIds.current.add(reminder.id);
        triggerReminder(reminder.id);
        onTrigger?.(reminder);
        break; // Trigger one at a time
      }
    }
  }, [reminders, triggerReminder, onTrigger]);

  const startWatching = useCallback(async () => {
    // Stop any existing subscription
    if (locationSubscription.current) {
      locationSubscription.current.remove();
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Location permission denied');
      return;
    }

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: LOCATION_UPDATE_INTERVAL,
        distanceInterval: LOCATION_UPDATE_DISTANCE,
      },
      (location) => {
        const { latitude, longitude } = location.coords;
        checkGeofences(latitude, longitude);
      }
    );
  }, [checkGeofences]);

  const stopWatching = useCallback(() => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  }, []);

  // Start/stop based on app state
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App came to foreground — restart watching
        startWatching();
      }
      appState.current = nextAppState;
    });

    return () => subscription?.remove();
  }, [startWatching]);

  // Start watching on mount
  useEffect(() => {
    startWatching();
    return () => stopWatching();
  }, []);

  // Restart when reminders change
  useEffect(() => {
    if (locationSubscription.current) {
      startWatching();
    }
  }, [reminders.length]);

  return { startWatching, stopWatching };
}