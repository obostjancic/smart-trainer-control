export interface BikeData {
  speed?: number;
  averageSpeed?: number;
  cadence?: number;
  averageCadence?: number;
  totalDistance?: number;
  resistanceLevel?: number;
  instantaneousPower?: number;
  averagePower?: number;
  totalEnergy?: number;
  energyPerHour?: number;
  energyPerMinute?: number;
  heartrate?: number;
  metabolicEquivalent?: number;
  time?: number;
  remainingTime?: number;
  raw?: string;
}

export interface Characteristics {
  FEATURE: string;
  STATUS: string;
  CONTROL_POINT: string;
  INDOOR_BIKE_DATA: string;
  TRAINING_STATUS: string;
  SUPPORTED_SPEED_RANGE: string;
  SUPPORTED_RESISTANCE_LEVEL_RANGE: string;
  SUPPORTED_POWER_RANGE: string;
}

export interface IndoorBikeDataFlags {
  MoreData: number;
  AverageSpeedPresent: number;
  InstantaneousCadence: number;
  AverageCadencePresent: number;
  TotalDistancePresent: number;
  ResistanceLevelPresent: number;
  InstantaneousPowerPresent: number;
  AveragePowerPresent: number;
  ExpendedEnergyPresent: number;
  HeartRatePresent: number;
  MetabolicEquivalentPresent: number;
  ElapsedTimePresent: number;
  RemainingTimePresent: number;
}
