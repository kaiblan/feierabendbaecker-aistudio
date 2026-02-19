
export enum StageType {
  AUTOLYSE = 'AUTOLYSE',
  KNEADING = 'KNEADING',
  BULK_FERMENTATION = 'BULK_FERMENTATION',
  STRETCH_AND_FOLD = 'STRETCH_AND_FOLD',
  SHAPING = 'SHAPING',
  PROVING = 'PROVING',
  BAKING = 'BAKING',
  COOLING = 'COOLING',
  PREFERMENT = 'PREFERMENT',
  FINISHED = 'FINISHED'
}

export interface Stage {
  id: string;
  type: StageType;
  label: string;
  durationMinutes: number;
  completed: boolean;
  isActive: boolean; // Distinction between work and waiting
  startTime?: Date;
  stageEndTime?: Date; // Timestamp when this stage should end
  notes?: string;
}

export interface BakerConfig {
  totalFlour: number;
  hydration: number;
  salt: number;
  yeast: number; // Changed from starter to yeast
  targetTemp: number;
  fridgeTemp: number;
  prefermentEnabled: boolean;
  autolyseEnabled: boolean;
  autolyseDurationMinutes: number;
  coldBulkEnabled: boolean;
  coldBulkDurationHours: number; // Duration of cold bulk in hours
  coldProofEnabled: boolean;
  coldProofDurationHours: number; // Duration of cold proof in hours
  finalProofDurationMinutes: number; // Duration of final proof at room temp
}

export interface BakerSession {
  id: string;
  name: string;
  startTime: Date;
  targetEndTime: Date;
  stages: Stage[];
  activeStageIndex: number;
  status: 'planning' | 'recipe' | 'active' | 'completed';
  config: BakerConfig;
}

export interface HistoryEntry {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  status: 'in-progress' | 'completed' | 'abandoned';

  // Optional steps (for tag pills)
  autolyseEnabled: boolean;
  coldBulkEnabled: boolean;
  coldProofEnabled: boolean;

  // Recipe amounts
  flourGrams: number;
  waterGrams: number;
  saltGrams: number;
  starterGrams: number;

  // Temperature data
  roomTemp: number;
  fridgeTemp?: number;

  // User notes
  notes: string;

  // Metadata
  totalDurationMinutes?: number;
  stages: Stage[];
}
