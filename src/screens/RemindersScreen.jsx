import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import useReminderStore, { REMINDER_STATUS } from '../store/reminderStore';
import { colors, typography, spacing, radius } from '../theme';
import ReminderCard from '../components/ReminderCard';

const TABS = ['All', 'Active', 'Done'];

export default function RemindersScreen() {
  const navigation = useNavigation();
  const reminders = useReminderStore((s) => s.reminders);
  const [activeTab, setActiveTab] = useState('All');

  const filtered = reminders.filter((r) => {
    if (activeTab === 'Active') return r.status === REMINDER_STATUS.ACTIVE;
    if (activeTab === 'Done') return r.status !== REMINDER_STATUS.ACTIVE;
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Reminders</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('MapScreen')}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No reminders here</Text>
          </View>
        ) : (
          filtered.map((reminder) => <ReminderCard key={reminder.id} reminder={reminder} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  title: { ...typography.h2 },
  addButton: { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  addButtonText: { ...typography.captionBold, color: '#fff', fontSize: 13 },
  tabs: { flexDirection: 'row', paddingHorizontal: spacing.md, gap: spacing.sm, marginBottom: spacing.md },
  tab: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, borderRadius: radius.full, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.primaryGlow, borderColor: colors.primary },
  tabText: { ...typography.captionBold, color: colors.textMuted },
  tabTextActive: { color: colors.primary },
  list: { padding: spacing.md, gap: spacing.sm, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: spacing.xxl },
  emptyText: { ...typography.body },
});