
import React from 'react';

export type Language = 'en' | 'de';

export const COLORS = {
  primary: '#06b6d4', // Cyan 500
  secondary: '#64748b', // Slate 500
  background: '#0f172a', // Slate 900
  surface: '#1e293b', // Slate 800
  accent: '#10b981', // Emerald 500
};

export const ICONS = {
  Active: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  History: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
  Knowledge: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    planning: 'Planning',
    active: 'Active',
    history: 'History',
    knowledge: 'Knowledge',
    // Headers
    bakingSchedule: 'Baking Schedule',
    recipeDetails: 'Recipe Details',
    planYourBake: 'Plan your bake based on timing and temperature.',
    adjustWeights: 'Adjust weights for your batch size.',
    totalDuration: 'Total Duration',
    // Session Timing
    sessionTiming: 'Session Timing',
    forward: 'Forward',
    backward: 'Backward',
    startTime: 'Start Time',
    readyTime: 'Ready Time',
    readyBy: 'Ready By',
    startsAt: 'Starts At',
    // Basic Factors
    basicFactors: 'Basic Factors',
    yeastPercentage: 'Yeast Percentage',
    doughTemperature: 'Dough Temperature',
    // Additional Steps
    additionalSteps: 'Additional Steps',
    coldBulk: 'Cold Bulk',
    coldProof: 'Cold Proof',
    fridgeTemperature: 'Fridge Temperature',
    // Dough Settings
    doughSettings: 'Dough Settings',
    totalFlour: 'Flour',
    hydration: 'Hydration',
    bakerPercentages: "Baker's Percentages",
    // Recipe Components
    recipeComponents: 'Recipe Components',
    flour: 'Flour',
    water: 'Water',
    yeast: 'Yeast',
    salt: 'Salt',
    totalBatchWeight: 'Total Batch Weight',
    // Production Workflow
    productionWorkflow: 'Timeline',
    work: 'Work',
    cold: 'Cold',
    // Buttons & Actions
    confirmTimeline: 'Confirm Timeline & Recipe',
    commenceTracking: 'Commence Real-Time Tracking',
    scheduleDetails: 'Schedule Details',
    timing: 'Timing',
    amounts: 'Amounts',
    // Stage Names
    autolyse: 'Autolyse',
    mixing: 'Mixing',
    folds: 'Folds',
    bulkFerment: 'Bulk Ferment',
    shaping: 'Shaping',
    finalProof: 'Final Proof',
    baking: 'Baking',
  },
  de: {
    // Navigation
    planning: 'Planung',
    active: 'Aktiv',
    history: 'Verlauf',
    knowledge: 'Wissen',
    // Headers
    bakingSchedule: 'Zeiten planen',
    recipeDetails: 'Rezeptdetails',
    planYourBake: 'Planen Sie Ihren Backprozess basierend auf Timing und Temperatur.',
    adjustWeights: 'Passen Sie die Gewichte für Ihre Teiggröße an.',
    totalDuration: 'Gesamtdauer',
    // Session Timing
    sessionTiming: 'Zeitplanung',
    forward: 'Vorwärts',
    backward: 'Rückwärts',
    startTime: 'Startzeit',
    readyTime: 'Endzeit',
    readyBy: 'Fertig Um',
    startsAt: 'Beginn Um',
    // Basic Factors
    basicFactors: 'Gärungsparameter',
    yeastPercentage: 'Hefe',
    doughTemperature: 'Teigtemperatur',
    // Additional Steps
    additionalSteps: 'Weitere Schritte',
    coldBulk: 'Kalte Stockgare',
    coldProof: 'Kalte Stückgare',
    fridgeTemperature: 'Kühlschrank-Temperatur',
    // Dough Settings
    doughSettings: 'Teigzusammensetzung',
    totalFlour: 'Mehl',
    hydration: 'Hydration',
    bakerPercentages: 'Bäckerprozente',
    // Recipe Components
    recipeComponents: 'Zutaten',
    flour: 'Mehl',
    water: 'Wasser',
    yeast: 'Hefe',
    salt: 'Salz',
    totalBatchWeight: 'Teiggewicht',
    // Production Workflow
    productionWorkflow: 'Zeitplan',
    work: 'Arbeit',
    cold: 'Kalt',
    // Buttons & Actions
    confirmTimeline: 'Mengen planen',
    commenceTracking: 'Backverlauf Starten',
    scheduleDetails: 'Zeitplan Details',
    settings: 'Einstellungen',
    appSettingsDescription: 'Anwendungseinstellungen',
    language: 'Sprache',
    timing: 'Zeiten',
    amounts: 'Mengen',
    // Stage Names
    autolyse: 'Autolyse',
    mixing: 'Mischen',
    folds: 'Dehnen & Falten',
    bulkFerment: 'Stockgare',
    shaping: 'Formen',
    finalProof: 'Stückgare',
    baking: 'Backen',
  },
};
