import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, radius } from '../theme';

export default function MapScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderEmoji}>🗺️</Text>
        <Text style={styles.placeholderTitle}>Map Screen</Text>
        <Text style={styles.placeholderBody}>
          Mapbox map coming in Session 2.{'\n'}Pin drop, search, and geofence circle.
        </Text>
        <TouchableOpacity
          style={styles.simulateButton}
          onPress={() =>
            navigation.navigate('SetupScreen', {
              location: {
                latitude: 6.0535,
                longitude: 80.2210,
                name: 'Matara Fort',
                address: 'Matara, Southern Province, Sri Lanka',
              },
            })
          }
        >
          <Text style={styles.simulateButtonText}>Simulate: Pick "Matara Fort"</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  backButton: { padding: spacing.md },
  backText: { ...typography.bodyBold, color: colors.primary },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  placeholderEmoji: { fontSize: 64 },
  placeholderTitle: { ...typography.h2 },
  placeholderBody: { ...typography.body, textAlign: 'center', lineHeight: 22 },
  simulateButton: { marginTop: spacing.lg, backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
  simulateButtonText: { ...typography.bodyBold, color: '#fff' },
});