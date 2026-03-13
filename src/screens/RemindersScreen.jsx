import React, { useState } from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Reminders</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('MapScreen')}
        >
          <Ionicons name="add" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.tabTextActive,
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <ReminderCard reminder={item} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No reminders here</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: spacing.md,
  },
  title: { ...typography.h2 },
  addButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row', gap: spacing.sm,
    paddingHorizontal: spacing.md, marginBottom: spacing.md,
  },
  tab: {
    paddingVertical: spacing.xs, paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.bgCard,
    borderWidth: 1, borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { ...typography.captionBold },
  tabTextActive: { color: '#fff' },
  list: { paddingHorizontal: spacing.md, paddingBottom: 100 },
  emptyState: {
    alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md,
  },
  emptyText: { ...typography.body },
});