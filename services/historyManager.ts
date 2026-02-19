/**
 * HistoryManager - Centralized singleton for session history management
 *
 * Manages the history of baking sessions:
 * - Adds new sessions when they start
 * - Updates sessions when they complete
 * - Allows editing names and notes
 * - Handles deletion
 */

import { HistoryEntry, BakerSession, Stage } from '../types';

const HISTORY_STORAGE_KEY = 'bakerSessionHistory';

// Helper function to serialize history to localStorage
const serializeHistory = (history: HistoryEntry[]): string => {
  return JSON.stringify(history, (key, value) => {
    // Convert Date objects to ISO strings
    if (value instanceof Date) {
      return { __type: 'Date', value: value.toISOString() };
    }
    return value;
  });
};

// Helper function to deserialize history from localStorage
const deserializeHistory = (json: string): HistoryEntry[] | null => {
  try {
    return JSON.parse(json, (key, value) => {
      // Convert ISO strings back to Date objects
      if (value && typeof value === 'object' && value.__type === 'Date') {
        return new Date(value.value);
      }
      return value;
    });
  } catch (error) {
    console.error('Failed to deserialize history:', error);
    return null;
  }
};

type HistoryListener = (history: HistoryEntry[]) => void;

/**
 * HistoryManager - Singleton pattern for history management
 */
class HistoryManager {
  private history: HistoryEntry[] = [];
  private listeners: Set<HistoryListener> = new Set();

  constructor() {
    // Load history from localStorage
    this.loadFromStorage();
  }

  /**
   * Subscribe to history changes
   */
  subscribe(listener: HistoryListener): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get all history entries (read-only)
   */
  getHistory(): readonly HistoryEntry[] {
    return this.history;
  }

  /**
   * Add a new session to history (called when session starts)
   */
  addSession(session: BakerSession): void {
    // Calculate recipe amounts from config
    const flourGrams = session.config.totalFlour;
    const waterGrams = Math.round(flourGrams * (session.config.hydration / 100));
    const saltGrams = Math.round(flourGrams * (session.config.salt / 100));
    const starterGrams = Math.round(flourGrams * (session.config.yeast / 100));

    const entry: HistoryEntry = {
      id: session.id,
      name: '',
      startTime: session.startTime,
      endTime: undefined,
      status: 'in-progress',

      // Optional steps
      autolyseEnabled: session.config.autolyseEnabled,
      coldBulkEnabled: session.config.coldBulkEnabled,
      coldProofEnabled: session.config.coldProofEnabled,

      // Recipe amounts
      flourGrams,
      waterGrams,
      saltGrams,
      starterGrams,

      // Temperature data
      roomTemp: session.config.targetTemp,
      fridgeTemp: session.config.coldBulkEnabled || session.config.coldProofEnabled
        ? session.config.fridgeTemp
        : undefined,

      // User notes
      notes: '',

      // Metadata
      totalDurationMinutes: undefined,
      stages: session.stages,
    };

    // Add to beginning (newest first)
    this.history.unshift(entry);
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Update an existing history entry
   */
  updateSession(id: string, updates: Partial<HistoryEntry>): void {
    const index = this.history.findIndex(entry => entry.id === id);
    if (index !== -1) {
      this.history[index] = { ...this.history[index], ...updates };

      // Calculate duration if endTime is being set
      if (updates.endTime && this.history[index].startTime) {
        const durationMs = updates.endTime.getTime() - this.history[index].startTime.getTime();
        this.history[index].totalDurationMinutes = Math.round(durationMs / 60000);
      }

      this.saveToStorage();
      this.notifyListeners();
    }
  }

  /**
   * Update entry name
   */
  updateName(id: string, name: string): void {
    this.updateSession(id, { name });
  }

  /**
   * Update entry notes
   */
  updateNotes(id: string, notes: string): void {
    this.updateSession(id, { notes });
  }

  /**
   * Delete a history entry
   */
  deleteEntry(id: string): void {
    this.history = this.history.filter(entry => entry.id !== id);
    this.saveToStorage();
    this.notifyListeners();
  }

  // Private methods

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        const loadedHistory = deserializeHistory(stored);
        if (loadedHistory) {
          this.history = loadedHistory;
        }
      }
    } catch (error) {
      console.error('Failed to load history from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, serializeHistory(this.history));
    } catch (error) {
      console.error('Failed to save history to storage:', error);
      // If storage is full, could implement cleanup logic here
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.history));
  }
}

// Export singleton instance
export const historyManager = new HistoryManager();
