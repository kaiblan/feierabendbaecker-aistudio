
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
  Settings: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
};

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    planning: 'Planning',
    active: 'Active',
    history: 'History',
    settings: 'Settings',
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
    coldBulkDuration: 'Cold Bulk Duration',
    coldProofDuration: 'Cold Proof Duration',
    duration: 'Duration',
    minuteUnit: 'mins',
    bulk60: '60% Bulk',
    bulk90: '90% Bulk',
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
    startNow: 'Start Now',
    start: 'Start Now',
    noActiveProcess: 'Choose your timing to start the process',
    scheduleDetails: 'Schedule Details',
    timing: 'Timing',
    amounts: 'Amounts',
    close: 'Close',
    // Stage Names
    autolyse: 'Autolyse',
    kneading: 'Kneading',
    folds: 'Folds',
    bulkFerment: 'Bulk Ferment',
    shaping: 'Shaping',
    finalProof: 'Final Proof',
    baking: 'Baking',
    // Notifications
    complete: 'Complete',
    nextStage: 'Next',
    nextAt: 'Next at',
    sessionComplete: 'Baking session complete!',
    // Active Tab
    workingStep: 'Step',
    upcoming: 'Upcoming',
    sessionEnd: 'Session End',
    cancelSession: 'Cancel session',
    cancelSessionConfirm: 'Do you want to cancel the session? All progress will be lost.',
    resumeSession: 'Resume session',
    completeAndAdvance: 'Complete & Advance',
    sessionProgress: 'Session Progress',
    until: 'until',
    // Active Session Modal
    activeSessionDetected: 'Active Session Detected',
    activeSessionMessage: 'You already have an active baking session in progress. Would you like to cancel it and start a new one, or resume the current session?',
    cancelAndStartNew: 'Cancel & Start New',
    resumeCurrent: 'Resume Current',
    parametersLocked: 'Parameters are locked while the session is active. Reset the session to make changes.',
    
    // Help Content
    help_settings_title: 'Settings',
    help_settings_content: 'This section allows you to customize your baking assistant experience.\n\nLanguage: Switch between English and German for the entire interface.',
    
    help_timing_title: 'Session Timing',
    help_timing_content: 'Plan your baking session based on time constraints.\n\nForward Planning: Set when you want to start baking, and the schedule will calculate when everything will be ready.\n\nBackward Planning: Set when you need your bread to be ready, and the schedule will calculate when you need to start.\n\nTip: Use backward planning when you need bread ready for a specific meal or event.',
    
    help_basic_factors_title: 'Basic Factors',
    help_basic_factors_content: 'Control the fundamental variables that affect fermentation time and dough development.\n\nYeast Percentage: Lower percentages (0.1-0.5%) result in longer, more flavorful fermentation. Higher percentages (1-2%) speed up the process.\n\nDough Temperature: Warmer dough (75-80°F / 24-27°C) ferments faster. Cooler dough (65-70°F / 18-21°C) ferments slower and develops more complex flavors.\n\nTip: For the best flavor, use less yeast and allow more time for fermentation.',
    
    help_additional_steps_title: 'Additional Steps',
    help_additional_steps_content: 'Optional cold fermentation periods that enhance flavor and fit your schedule.\n\nCold Bulk Fermentation: Refrigerate the dough after mixing but before shaping. This develops flavor and makes the dough easier to work with.\n\nCold Proof: Refrigerate shaped loaves before baking. This is great for baking fresh bread in the morning - shape the night before and bake when you wake up.\n\nFridge Temperature: The calculator uses this to estimate fermentation rates in cold storage. Most home fridges are 37-40°F (3-4°C).\n\nTip: Cold fermentation is the secret to artisan-quality bread at home!',
    
    help_dough_settings_title: 'Dough Settings',
    help_dough_settings_content: 'Define the composition of your dough using baker\'s percentages.\n\nFlour: The base weight - all other ingredients are calculated as a percentage of this.\n\nHydration: Water content as a percentage of flour weight. 65-70% is typical for bread. Higher hydration (75-80%) creates more open crumb but is harder to handle.\n\nBaker\'s Percentages: Professional bakers use percentages relative to flour weight, making it easy to scale recipes up or down.\n\nTip: Start with 70% hydration if you\'re new to bread baking.',
    
    help_recipe_components_title: 'Recipe Components',
    help_recipe_components_content: 'The exact weights you need for your batch.\n\nThese amounts are calculated based on your dough settings and total batch weight. All measurements are in grams for accuracy.\n\nFlour: Your base ingredient\nWater: Based on hydration percentage\nYeast: Based on yeast percentage\nSalt: Typically 2% of flour weight\n\nTip: Use a digital scale for the best results. Measuring by weight is more accurate than measuring by volume.',
    
    help_timeline_title: 'Production Timeline',
    help_timeline_content: 'Your step-by-step baking schedule with precise times for each stage.\n\nThe timeline shows:\n- Each fermentation and working step\n- Start and end times for every stage\n- Visual indication of active work vs. waiting time\n\nWork steps (hands-on): Mixing, folding, shaping, baking\nCold steps (passive): Cold bulk, cold proof\n\nTip: Most of bread baking is waiting - plan accordingly! You only need to be present for the work steps.',
    
    help_active_session_title: 'Active Session',
    help_active_session_content: 'Track your baking progress in real-time.\n\nCurrent Step: What you should be doing right now\nNext Steps: Upcoming stages with countdown timers\nProgress: Visual indication of how far along you are\n\nYou can complete steps early if needed, or let the timers guide you for optimal results.\n\nTip: Set notifications or alarms for important steps so you don\'t miss them!',
  },
  de: {
    // Navigation
    planning: 'Planung',
    active: 'Aktiv',
    history: 'Verlauf',
    settings: 'Einstellungen',
    // Headers
    bakingSchedule: 'Zeiten planen',
    recipeDetails: 'Rezeptdetails',
    planYourBake: 'Du kannst entweder von einer Startzeit aus planen oder auf eine bestimmte Endzeit hin planen.',
    adjustWeights: 'Passen Sie die Gewichte für Ihre Teiggröße an.',
    totalDuration: 'Gesamtdauer',
    // Session Timing
    sessionTiming: 'Zeitplanung',
    forward: 'Startzeit vorgeben',
    backward: 'Endzeit vorgeben',
    startTime: ' ',
    readyTime: ' ',
    readyBy: 'Fertig Um',
    startsAt: 'Beginn Um',
    // Basic Factors
    basicFactors: 'Grundparameter',
    yeastPercentage: 'Hefe',
    doughTemperature: 'Teigtemperatur',
    // Additional Steps
    additionalSteps: 'Weitere Schritte',
    coldBulk: 'Kalte Stockgare',
    coldProof: 'Kalte Stückgare',
    coldBulkDuration: 'Dauer der kalten Stockgare',
    coldProofDuration: 'Dauer der kalten Stückgare',
    duration: 'Dauer',
    minuteUnit: 'Min',
    bulk60: '60% Stockgare',
    bulk90: '90% Stockgare',
    fridgeTemperature: 'Kühlschrank-Temperatur',
    // Dough Settings
    doughSettings: 'Teigzusammensetzung',
    totalFlour: 'Mehl',
    hydration: 'Hydration',
    bakerPercentages: 'Bäckerprozente',
    // Recipe Components
    recipeComponents: 'Mengen',
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
    startNow: 'Direkt Starten',
    start: 'Starten',
    noActiveProcess: 'Plane einen Ablauf, bevor Du einen Backvorgang startest',
    scheduleDetails: 'Zeitplan Details',
    appSettingsDescription: 'Anwendungseinstellungen',
    language: 'Sprache',
    timing: 'Zeiten',
    amounts: 'Mengen',
    close: 'Schließen',
    // Stage Names
    autolyse: 'Autolyse',
    kneading: 'Kneten',
    folds: 'Dehnen & Falten',
    bulkFerment: 'Stockgare',
    shaping: 'Formen',
    finalProof: 'Stückgare',
    baking: 'Backen',
    // Notifications
    complete: 'Abgeschlossen',
    nextStage: 'Weiter',
    nextAt: 'Als Nächstes um',
    sessionComplete: 'Backvorgang abgeschlossen!',
    // Active Tab
    workingStep: 'Gerade läuft',
    upcoming: 'Als Nächstes',
    sessionEnd: 'Fertig! :-)',
    cancelSession: 'Backvorgang abbrechen',
    cancelSessionConfirm: 'Möchtest du den Backvorgang abbrechen? Alle Fortschritte gehen verloren.',
    resumeSession: 'Backvorgang fortsetzen',
    completeAndAdvance: 'Abschließen & Weiter',
    sessionProgress: 'Backfortschritt',
    until: 'bis',
    // Active Session Modal
    activeSessionDetected: 'Aktiver Backvorgang erkannt',
    activeSessionMessage: 'Du hast bereits einen aktiven Backvorgang. Möchtest du ihn abbrechen und einen neuen starten, oder den aktuellen fortsetzen?',
    cancelAndStartNew: 'Abbrechen & neu starten',
    resumeCurrent: 'Aktuellen fortsetzen',
    parametersLocked: 'Parameter sind gesperrt, solange ein Backvorgang läuft. Breche den Backvorgang ab, um Änderungen vorzunehmen.',
    
    // Help Content
    help_settings_title: 'Einstellungen',
    help_settings_content: 'Hier kannst du deinen Backassistenten anpassen.\n\nSprache: Wechsle zwischen Englisch und Deutsch für die gesamte Benutzeroberfläche.',
    
    help_timing_title: 'Zeitplanung',
    help_timing_content: 'Plane deinen Backvorgang basierend auf deinen zeitlichen Anforderungen.\n\nVorwärts planen: Lege fest, wann du mit dem Backen beginnen möchtest, und der Zeitplan berechnet, wann alles fertig sein wird.\n\nRückwärts planen: Lege fest, wann dein Brot fertig sein soll, und der Zeitplan berechnet, wann du beginnen musst.\n\nTipp: Nutze die Rückwärtsplanung, wenn du Brot zu einer bestimmten Mahlzeit oder einem Event brauchst. Aber denk dran: Es muss auch noch abkühlen!',
        
    help_basic_factors_title: 'Grundparameter',
    help_basic_factors_content: 'Steuere die grundlegenden Variablen, die Garzeit und Teigentwicklung beeinflussen.\n\nHefe-Prozentsatz: Niedrigere Prozentsätze (0,1-0,5%) führen zu längerer Gare und mehr Geschmack. Höhere Prozentsätze (1-2%) beschleunigen den Prozess.\n\nTeigtemperatur: Wärmerer Teig (24-27°C) gärt schneller. Kühlerer Teig (18-21°C) gärt langsamer und entwickelt komplexere Aromen.\n\nTipp: Für den besten Geschmack plane eine lange Gare mit wenig Hefe und kühlerer Temperatur.',
        
    help_additional_steps_title: 'Weitere Schritte',
    help_additional_steps_content: 'Optionale Phasen, die die Teigstruktur oder den Geschmack verbessern und zu deinem Zeitplan passen.\n\nKalte Stockgare: Kühle den Teig nach dem Mischen, aber vor dem Formen. Das entwickelt Geschmack und macht den Teig leichter zu verarbeiten.\n\nKalte Stückgare: Kühle die geformten Laibe vor dem Backen. Ideal für frisches Brot am Morgen - forme am Abend und backe beim Aufwachen.\n\nKühlschrank-Temperatur: Der Rechner nutzt diese, um die Gärung im Kühlschrank zu schätzen. Die meisten Haushaltskühlschränke haben 5-7°C.\n\nTipp: Kalte Gare ist das Geheimnis für handwerklich hochwertiges Brot zu Hause!',
        
    help_dough_settings_title: 'Bäckerprozente',
    help_dough_settings_content: 'Definiere die Zusammensetzung deines Teigs mit Bäckerprozenten.\n\nMehl: Das Basisgewicht - alle anderen Zutaten werden als Prozentsatz davon berechnet.\n\nHydration: Wassergehalt als Prozentsatz des Mehlgewichts. 65-70% ist typisch für Brot. Höhere Hydration (75-80%) erzeugt eine offenere Krume, der Teig wird aber klebriger und ist schwieriger zu handhaben.\n\nTipp: Beginne mit 70% Hydration, wenn du neu im Brotbacken bist.',
        
    help_recipe_components_title: 'Mengen',
    help_recipe_components_content: 'Die exakten Gewichte, die du für deinen Teig brauchst.\n\nDiese Mengen werden basierend auf deinen Teigeinstellungen und dem Gesamtgewicht berechnet.\n\nMehl: Deine Basiszutat\nWasser: Basierend auf dem Hydrationsprozentsatz\nHefe: Basierend auf dem Hefeprozentsatz\nSalz: Typischerweise 2% des Mehlgewichts',
        
    help_timeline_title: 'Zeitplan',
    help_timeline_content: 'Dein schrittweiser Backplan mit Start- und End-Zeiten für jede Phase.\n\nDer Zeitplan zeigt:\n- Jeden Gar- und Arbeitsschritt\n- Start- und Endzeiten für jede Phase\n- Visuelle Kennzeichnung von aktiver Arbeit vs. Wartezeit\n\nArbeitsschritte (aktiv): Kneten, Falten, Formen, Backen\nKalte Schritte (passiv): Kalte Stockgare, Kalte Stückgare\n\nTipp: Das meiste beim Brotbacken ist Warten - plane entsprechend! Du musst nur bei den Arbeitsschritten anwesend sein.',
        
    help_active_session_title: 'Aktiver Backvorgang',
    help_active_session_content: 'Verfolge deinen Backfortschritt in Echtzeit.\n\nAktueller Schritt: Was du gerade tun solltest\nBackfortschritt: Alle kommenden Phasen und ihre Zeiten\n\nDu kannst Schritte vorzeitig abschließen, wenn nötig, oder die Timer für optimale Ergebnisse nutzen.\n\nTipp: Stelle Benachrichtigungen oder Wecker für wichtige Schritte, damit du sie nicht verpasst!',
  },
};
