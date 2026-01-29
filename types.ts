
export enum StageType {
  AUTOLYSE = 'AUTOLYSE',
  MIXING = 'MIXING',
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
  coldBulkEnabled: boolean;
  coldBulkDurationHours: number; // Duration of cold bulk in hours
  coldProofEnabled: boolean;
  coldProofDurationHours: number; // Duration of cold proof in hours
}

export interface Session {
  id: string;
  name: string;
  startTime: Date;
  targetEndTime: Date;
  stages: Stage[];
  activeStageIndex: number;
  status: 'planning' | 'recipe' | 'active' | 'completed';
  config: BakerConfig;
}
