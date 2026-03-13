import { create } from 'zustand';

export const ALERT_TYPES = {
  AGGRESSIVE: 'aggressive',
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

const useReminderStore = create((set, get) => ({
  reminders: [],

  addReminder: (reminder) => {
    const newReminder = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: REMINDER_STATUS.ACTIVE,
      ...reminder,
    };
    set((state) => ({ reminders: [newReminder, ...state.reminders] }));
    return newReminder.id;
  },

  updateReminder: (id, updates) => {
    set((state) => ({
      reminders: state.reminders.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    }));
  },

  deleteReminder: (id) => {
    set((state) => ({
      reminders: state.reminders.filter((r) => r.id !== id),
    }));
  },

  triggerReminder: (id) => {
    set((state) => ({
      reminders: state.reminders.map((r) =>
        r.id === id ? { ...r, status: REMINDER_STATUS.TRIGGERED } : r
      ),
    }));
  },

  dismissReminder: (id) => {
    set((state) => ({
      reminders: state.reminders.map((r) =>
        r.id === id ? { ...r, status: REMINDER_STATUS.DISMISSED } : r
      ),
    }));
  },

  toggleReminder: (id) => {
    set((state) => ({
      reminders: state.reminders.map((r) =>
        r.id === id
          ? {
              ...r,
              status:
                r.status === REMINDER_STATUS.ACTIVE
                  ? REMINDER_STATUS.DISMISSED
                  : REMINDER_STATUS.ACTIVE,
            }
          : r
      ),
    }));
  },

  getActiveReminders: () =>
    get().reminders.filter((r) => r.status === REMINDER_STATUS.ACTIVE),

  getTriggeredReminder: () =>
    get().reminders.find((r) => r.status === REMINDER_STATUS.TRIGGERED) || null,
}));

export default useReminderStore;