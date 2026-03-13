import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import SetupScreen from '../screens/SetupScreen';
import AlarmScreen from '../screens/AlarmScreen';
import RemindersScreen from '../screens/RemindersScreen';

const TabIcon = ({ name, label, focused }) => (
  <View style={{ alignItems: 'center', justifyContent: 'center' }}>
    <Ionicons
      name={focused ? name : name + '-outline'}
      size={24}
      color={focused ? colors.primary : colors.textMuted}
      style={{ opacity: focused ? 1 : 0.7 }}
    />
    <Text
      style={{
        fontSize: 10,
        fontWeight: '600',
        color: focused ? colors.primary : colors.textMuted,
        marginTop: 2,
      }}
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {label}
    </Text>
  </View>
);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#0F0F18',
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 10, // Added top padding for better spacing
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" label="Home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Reminders"
        component={RemindersScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="list" label="Reminders" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer
      theme={{
        dark: true,
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '700' },
          heavy: { fontFamily: 'System', fontWeight: '900' },
        },
        colors: {
          primary: colors.primary,
          background: colors.bg,
          card: colors.bgCard,
          text: colors.textPrimary,
          border: colors.border,
          notification: colors.primary,
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="MapScreen"
          component={MapScreen}
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="SetupScreen"
          component={SetupScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="AlarmScreen"
          component={AlarmScreen}
          options={{
            presentation: 'fullScreenModal',
            animation: 'fade',
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}