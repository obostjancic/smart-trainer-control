import { BikeControl } from "./bike-interface";

export enum FTMSControlOpCode {
  RequestControl = 0x00,
  Reset = 0x01,
  SetTargetSpeed = 0x02,
  SetTargetInclination = 0x03,
  SetTargetResistanceLevel = 0x04,
  SetTargetPower = 0x05,
  SetTargetHeartRate = 0x06,
  StartOrResume = 0x07,
  StopOrPause = 0x08,
  SetTargetedExpendedEnergy = 0x09,
  SetTargetedNumberOfSteps = 0x0a,
  SetTargetedNumberOfStrides = 0x0b,
  SetTargetedDistance = 0x0c,
  SetTargetedTrainingTime = 0x0d,
  SetTargetedTimeInTwoHeartRateZones = 0x0e,
  SetTargetedTimeInThreeHeartRateZones = 0x0f,
  SetTargetedTimeInFiveHeartRateZones = 0x10,
  SetIndoorBikeSimulationParameters = 0x11,
  SetWheelCircumference = 0x12,
  SetSpinDownControl = 0x13,
  SetTargetedCadence = 0x14,
}

export enum FTMSControlResponseCode {
  Success = 0x01,
  OpCodeNotSupported = 0x02,
  InvalidParameter = 0x03,
  OperationFailed = 0x04,
  ControlNotPermitted = 0x05,
}

export function getControlPointOpCode(
  control: keyof BikeControl
): FTMSControlOpCode {
  const map = {
    resistance: FTMSControlOpCode.SetTargetResistanceLevel,
    targetPower: FTMSControlOpCode.SetTargetPower,
    requestControl: FTMSControlOpCode.RequestControl,
  };

  return map[control];
}

// Helper function to create control point data
export function createControlPointData(
  opCode: FTMSControlOpCode,
  ...parameters: number[]
): Uint8Array {
  return new Uint8Array([opCode, ...parameters]);
}

export function createSetTargetPowerData(targetPower: number): Uint8Array {
  // Target power is in watts, sent as sint16
  const powerBytes = new Int16Array([targetPower]);
  return createControlPointData(
    FTMSControlOpCode.SetTargetPower,
    powerBytes[0] ?? 0 & 0xff,
    (powerBytes[0] ?? 0 >> 8) & 0xff
  );
}

export function createSetResistanceData(resistanceLevel: number): Uint8Array {
  // Resistance level is sent as sint16
  const resistanceBytes = new Int16Array([resistanceLevel]);
  return createControlPointData(
    FTMSControlOpCode.SetTargetResistanceLevel,
    resistanceBytes[0] ?? 0 & 0xff,
    (resistanceBytes[0] ?? 0 >> 8) & 0xff
  );
}

export function createSetInclinationData(inclination: number): Uint8Array {
  // Inclination is sent as sint16
  const inclinationBytes = new Int16Array([inclination]);
  return createControlPointData(
    FTMSControlOpCode.SetTargetInclination,
    inclinationBytes[0] ?? 0 & 0xff,
    (inclinationBytes[0] ?? 0 >> 8) & 0xff
  );
}
