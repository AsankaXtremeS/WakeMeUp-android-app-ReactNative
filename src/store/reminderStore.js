import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ALERT_TYPES = {
  STANDARD: 'standard',
  VIBRATION: 'vibration',
};

export const TRIGGER_TYPES = {
  DISTANCE: 'distance',
  ETA: 'eta',
};

export const REMINDER_STATUS = {
  ACTIVE: 'active',
  TRIGGERED: 'triggered',
  DISMISSED: 'dismissed',
};

const STORAGE_KEY = 'wakemeup_reminders';

const useReminderStore = create((set, get) => ({
  reminders: [],
  hydrated: false,

  // Load reminders from storage on app start
  hydrate: async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) {
        const saved = JSON.parse(json);
        // Reset triggered reminders back to active on restart
        const restored = saved.map((r) => ({
          ...r,
          status:
            r.status === REMINDER_STATUS.TRIGGERED
              ? REMINDER_STATUS.ACTIVE
              : r.status,
          currentDistanceKm: undefined,
        }));
        set({ reminders: restored, hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch (e) {
      console.warn('Failed to load reminders:', e);
      set({ hydrated: true });
    }
  },

  // Save reminders to storage
  persist: async (reminders) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
    } catch (e) {
      console.warn('Failed to save reminders:', e);
    }
  },

  addReminder: (reminder) => {
    const newReminder = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: REMINDER_STATUS.ACTIVE,
      ...reminder,
    };
    set((state) => {
      const updated = [newReminder, ...state.reminders];
      get().persist(updated);
      return { reminders: updated };
    });
    return newReminder.id;
  },

  updateReminder: (id, updates) => {
    set((state) => {
      const updated = state.reminders.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      );
      // Don't persist live distance updates — too frequent
      if (!('currentDistanceKm' in updates)) {
        get().persist(updated);
      }
      return { reminders: updated };
    });
  },

  deleteReminder: (id) => {
    set((state) => {
      const updated = state.reminders.filter((r) => r.id !== id);
      get().persist(updated);
      return { reminders: updated };
    });
  },

  triggerReminder: (id) => {
    set((state) => {
      const updated = state.reminders.map((r) =>
        r.id === id ? { ...r, status: REMINDER_STATUS.TRIGGERED } : r
      );
      get().persist(updated);
      return { reminders: updated };
    });
  },

  dismissReminder: (id) => {
    set((state) => {
      const updated = state.reminders.map((r) =>
        r.id === id ? { ...r, status: REMINDER_STATUS.DISMISSED } : r
      );
      get().persist(updated);
      return { reminders: updated };
    });
  },

  toggleReminder: (id) => {
    set((state) => {
      const updated = state.reminders.map((r) =>
        r.id === id
          ? {
              ...r,
              status:
                r.status === REMINDER_STATUS.ACTIVE
                  ? REMINDER_STATUS.DISMISSED
                  : REMINDER_STATUS.ACTIVE,
            }
          : r
      );
      get().persist(updated);
      return { reminders: updated };
    });
  },

  getActiveReminders: () =>
    get().reminders.filter((r) => r.status === REMINDER_STATUS.ACTIVE),

  getTriggeredReminder: () =>
    get().reminders.find((r) => r.status === REMINDER_STATUS.TRIGGERED) || null,
}));

export default useReminderStore;