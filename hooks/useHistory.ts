/**
 * useHistory - Custom hook for managing baking session history
 * Thin wrapper around the centralized historyManager
 */

import { useState, useEffect, useCallback } from 'react';
import { HistoryEntry } from '../types';
import { historyManager } from '../services/historyManager';

export const useHistory = () => {
  // Subscribe to history changes from the centralized manager
  const [history, setHistory] = useState<HistoryEntry[]>(
    historyManager.getHistory() as HistoryEntry[]
  );

  useEffect(() => {
    // Subscribe to history updates
    const unsubscribe = historyManager.subscribe((updatedHistory) => {
      setHistory(updatedHistory as HistoryEntry[]);
    });

    return unsubscribe;
  }, []);

  // Expose history manager methods
  const updateName = useCallback((id: string, name: string) => {
    historyManager.updateName(id, name);
  }, []);

  const updateNotes = useCallback((id: string, notes: string) => {
    historyManager.updateNotes(id, notes);
  }, []);

  const deleteEntry = useCallback((id: string) => {
    historyManager.deleteEntry(id);
  }, []);

  return {
    history,
    updateName,
    updateNotes,
    deleteEntry,
  };
};
