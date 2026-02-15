/**
 * BakingSessionManager - Centralized singleton-like session manager
 * 
 * Two major operations:
 * - startSession: Initializes a new active session or restarts over an existing one
 * - resetSession: Stops and resets the current session back to planning state
 */

import { BakerSession, BakerConfig, Stage } from '../types';
import { generateBakingStages, calculateSessionDuration } from './bakerService';
import { computeSequentialStages } from '../utils/sessionUtils';

const SESSION_STORAGE_KEY = 'bakerSession';

// Helper function to serialize session to localStorage
const serializeSession = (session: BakerSession): string => {
  return JSON.stringify(session, (key, value) => {
    // Convert Date objects to ISO strings
    if (value instanceof Date) {
      return { __type: 'Date', value: value.toISOString() };
    }
    return value;
  });
};

// Helper function to deserialize session from localStorage
const deserializeSession = (json: string): BakerSession | null => {
  try {
    return JSON.parse(json, (key, value) => {
      // Convert ISO strings back to Date objects
      if (value && typeof value === 'object' && value.__type === 'Date') {
        return new Date(value.value);
      }
      return value;
    });
  } catch (error) {
    console.error('Failed to deserialize session:', error);
    return null;
  }
};

type SessionListener = (session: BakerSession) => void;

/**
 * BakingSessionManager - Singleton pattern for session management
 */
class BakingSessionManager {
  private session: BakerSession;
  private listeners: Set<SessionListener> = new Set();
  private translateFn: ((key: string) => string) | null = null;

  constructor() {
    // Initialize with default planning session
    this.session = this.createDefaultSession();
    
    // Try to restore from localStorage
    this.restoreFromStorage();
  }

  /**
   * Subscribe to session changes
   */
  subscribe(listener: SessionListener): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Set the translation function for generating stages
   */
  setTranslateFn(fn: (key: string) => string): void {
    this.translateFn = fn;
  }

  /**
   * Get current session state (read-only)
   */
  getSession(): Readonly<BakerSession> {
    return this.session;
  }

  /**
   * Get current config (read-only)
   */
  getConfig(): Readonly<BakerConfig> {
    return this.session.config;
  }

  /**
   * Update configuration (only allowed in planning/recipe state)
   */
  updateConfig(updates: Partial<BakerConfig>): void {
    if (this.session.status === 'planning' || this.session.status === 'recipe') {
      this.updateSession({
        config: { ...this.session.config, ...updates },
      });
    }
  }

  /**
   * MAJOR OPERATION: Start Session
   * Starts a new baking session or restarts over an existing one
   * This operation:
   * - Transitions session to active state
   * - Generates fresh stages based on current config
   * - Sets start time to now
   * - Computes all stage timings
   * - Persists to localStorage
   */
  startSession(): void {
    const now = new Date();
    
    if (!this.translateFn) {
      console.error('Translation function not set. Call setTranslateFn first.');
      return;
    }

    // Generate fresh stages from current config
    const freshStages = generateBakingStages(this.session.config, this.translateFn);
    const computedStages = computeSequentialStages(freshStages, 0, now);
    
    // Calculate session end time
    const totalMins = calculateSessionDuration(this.session.config);
    const targetEndTime = new Date(now.getTime() + totalMins * 60000);

    // Update session to active state
    this.updateSession({
      status: 'active',
      activeStageIndex: 0,
      startTime: now,
      targetEndTime,
      stages: computedStages,
    });
  }

  /**
   * MAJOR OPERATION: Reset Session
   * Stops the current session and resets to planning state
   * This operation:
   * - Sets status back to planning
   * - Resets active stage index to 0
   * - Clears localStorage (no active session to persist)
   * - Notifies all subscribers
   */
  resetSession(): void {
    this.updateSession({
      status: 'planning',
      activeStageIndex: 0,
      stages: this.session.stages.map(stage => ({
        ...stage,
        completed: false,
        isActive: false,
        startTime: undefined,
        stageEndTime: undefined,
      })),
    });
  }

  /**
   * Transition to recipe view state
   */
  transitionToRecipe(): void {
    if (this.session.status === 'planning') {
      this.updateSession({ status: 'recipe' });
    }
  }

  /**
   * Complete the current session
   */
  completeSession(): void {
    if (this.session.status === 'active') {
      this.updateSession({ status: 'completed' });
    }
  }

  /**
   * Advance to the next stage in an active session
   */
  advanceToNextStage(): void {
    if (this.session.status !== 'active') {
      return;
    }

    const currentIdx = this.session.activeStageIndex;
    const nextIdx = currentIdx + 1;
    const now = new Date();

    // Mark current stage as completed
    const updatedStages = this.session.stages.map((stage, i) => {
      if (i === currentIdx) {
        return { ...stage, completed: true, isActive: false, stageEndTime: now };
      }
      return { ...stage };
    });

    // If there's a next stage, advance to it
    if (nextIdx < updatedStages.length) {
      const recomputedStages = computeSequentialStages(updatedStages, nextIdx, now);
      this.updateSession({
        stages: recomputedStages,
        activeStageIndex: nextIdx,
      });
    } else {
      // No next stage — mark session complete
      this.updateSession({
        stages: updatedStages,
        status: 'completed',
      });
    }
  }

  /**
   * Update stages (used for planning adjustments)
   */
  updateStages(stages: Stage[]): void {
    this.updateSession({ stages });
  }

  /**
   * Regenerate stages from config (used when config changes in planning/recipe)
   */
  regenerateStages(): void {
    if ((this.session.status === 'planning' || this.session.status === 'recipe') && this.translateFn) {
      const freshStages = generateBakingStages(this.session.config, this.translateFn);
      this.updateSession({ stages: freshStages });
    }
  }

  // Private methods

  private createDefaultSession(): BakerSession {
    // This will be replaced by the actual initialConfig when initialized
    return {
      id: 'new-bake',
      name: 'Experimental Batch',
      startTime: new Date(),
      targetEndTime: new Date(),
      stages: [],
      activeStageIndex: 0,
      status: 'planning',
      config: {
        totalFlour: 500,
        hydration: 70,
        salt: 2,
        yeast: 0.5,
        targetTemp: 26,
        fridgeTemp: 4,
        prefermentEnabled: false,
        autolyseEnabled: true,
        autolyseDurationMinutes: 30,
        coldBulkEnabled: false,
        coldBulkDurationHours: 12,
        coldProofEnabled: true,
        coldProofDurationHours: 12,
        finalProofDurationMinutes: 60,
      },
    };
  }

  private restoreFromStorage(): void {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const restoredSession = deserializeSession(stored);
        // Only restore if it's an active session
        if (restoredSession && restoredSession.status === 'active') {
          this.session = restoredSession;
          this.notifyListeners();
        }
      }
    } catch (error) {
      console.error('Failed to restore session from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      // Only persist active sessions
      if (this.session.status === 'active') {
        localStorage.setItem(SESSION_STORAGE_KEY, serializeSession(this.session));
      } else {
        // Clear storage if session is not active
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Failed to save session to storage:', error);
    }
  }

  private updateSession(updates: Partial<BakerSession>): void {
    this.session = { ...this.session, ...updates };
    this.saveToStorage();
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.session));
  }

  /**
   * Initialize session with custom config (used on first load)
   */
  initialize(config: BakerConfig): void {
    if (this.session.status === 'planning' && this.session.stages.length === 0) {
      this.updateSession({ config });
    }
  }
}

// Export singleton instance
export const sessionManager = new BakingSessionManager();
