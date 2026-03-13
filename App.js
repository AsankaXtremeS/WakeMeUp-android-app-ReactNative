import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainerRef } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import useGeofence from './src/hooks/useGeofence';

// Geofence wrapper — runs at app level so it always watches
function GeofenceWatcher({ navigationRef }) {
  useGeofence({
    onTrigger: (reminder) => {
      // Navigate to alarm screen when geofence triggered
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