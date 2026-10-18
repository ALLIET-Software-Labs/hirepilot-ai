import { ApplicationSession } from '../types';

const STORAGE_KEY_SESSIONS = 'hirepilot_sessions';
const STORAGE_KEY_ACTIVE_ID = 'hirepilot_active_session_id';
const LEGACY_STORAGE_KEY_SESSIONS = 'applyforge_sessions';
const LEGACY_STORAGE_KEY_ACTIVE_ID = 'applyforge_active_session_id';

export const storage = {
  getSessions: (): ApplicationSession[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SESSIONS) || localStorage.getItem(LEGACY_STORAGE_KEY_SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getActiveSessionId: (): string | null => {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_ID) || localStorage.getItem(LEGACY_STORAGE_KEY_ACTIVE_ID);
  },

  setActiveSessionId: (id: string | null) => {
    if (id) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
      localStorage.removeItem(LEGACY_STORAGE_KEY_ACTIVE_ID);
    }
  },

  saveSession: (session: ApplicationSession): void => {
    try {
      const sessions = storage.getSessions();
      const existingIdx = sessions.findIndex((s) => s.id === session.id);
      const updated = {
        ...session,
        updated_at: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        sessions[existingIdx] = updated;
      } else {
        sessions.unshift(updated);
      }

      // Limit to 10 stored sessions
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions.slice(0, 10)));
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, session.id);
    } catch (e) {
      console.error('Failed to save session to localStorage', e);
    }
  },

  deleteSession: (id: string): void => {
    try {
      const sessions = storage.getSessions().filter((s) => s.id !== id);
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
      if (storage.getActiveSessionId() === id) {
        storage.setActiveSessionId(sessions[0]?.id || null);
      }
    } catch (e) {
      console.error('Failed to delete session', e);
    }
  },

  getSession: (id: string): ApplicationSession | null => {
    const sessions = storage.getSessions();
    return sessions.find((s) => s.id === id) || null;
  },
};
