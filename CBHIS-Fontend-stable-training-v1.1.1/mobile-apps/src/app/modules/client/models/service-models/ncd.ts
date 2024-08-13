export interface NCDCondition {
  Oid: number;
  Description: string;
  IsDeleted?: number; // Default 0 assumed
}

export interface ClientNCDHistory {
  TransactionId: string;
  ClientId: string;
  NCDConditionId: number;
  ScreeningOutcome: number;
  IsTestConducted?: boolean | null; // Nullable since it might not be set initially
  TestOutcome?: number | null; // Nullable since it might not be set initially
  IsDeleted?: boolean; // Default 0 assumed
  OnlineDbOid?: string;
  CreatedBy: string;
  ModifiedBy?: string;
}

export interface NCDScreening {
  TransactionId: string;
  ClientId: string;
  WaterIntake: number;
  IsClientSmoking: boolean;
  BreathingDifficulty: number;
  Exercise: number;
  HeartRateRaisingActivity: number;
  VegetableConsumption?: number | null;
  FruitConsumption?: number | null;
  IsSweetenedFoodConsumed: boolean;
  IsRefinedWheatConsumed: boolean;
  SaltIntake: number;
  AlcoholConsumption: number;
  IsDeleted: boolean;
  IsSynced?: number | null;
  OnlineDbOid?: string | null;
  CreatedBy: string;
  ModifiedBy?: string | null;
}
