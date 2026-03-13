import React, { useRef, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import useGeofence from './src/hooks/useGeofence';
import useReminderStore from './src/store/reminderStore';

function GeofenceWatcher({ navigationRef }) {
  useGeofence({
    onTrigger: (reminder) => {
      navigationRef.current?.navigate('AlarmScreen', {
        reminderId: reminder.id,
        locationName: reminder.label || reminder.location?.name,
        alertType: reminder.alertType,
      });
    },
  });
  return null;
}

export default function App() {
  const navigationRef = useRef(null);
  const hydrate = useReminderStore((s) => s.hydrate);
  const hydrated = useReminderStore((s) => s.hydrated);

  useEffect(() => {
    hydrate();
  }, []);

  // Show loading screen until reminders are restored
  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0A0F', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#6C63FF" size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <RootNavigator navigationRef={navigationRef} />
        <GeofenceWatcher navigationRef={navigationRef} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}