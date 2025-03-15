import { IndoorBikeDataFlags, BikeData } from "./types";

const bit = (nr: number): number => 1 << nr;

export const IndoorBikeDataFlag: IndoorBikeDataFlags = {
  MoreData: bit(0),
  AverageSpeedPresent: bit(1),
  InstantaneousCadence: bit(2),
  AverageCadencePresent: bit(3),
  TotalDistancePresent: bit(4),
  ResistanceLevelPresent: bit(5),
  InstantaneousPowerPresent: bit(6),
  AveragePowerPresent: bit(7),
  ExpendedEnergyPresent: bit(8),
  HeartRatePresent: bit(9),
  MetabolicEquivalentPresent: bit(10),
  ElapsedTimePresent: bit(11),
  RemainingTimePresent: bit(12),
};

function getUint16LE(data: Uint8Array, offset: number): number {
  return (data[offset] ?? 0) + ((data[offset + 1] ?? 0) << 8);
}

function getInt16LE(data: Uint8Array, offset: number): number {
  const val = getUint16LE(data, offset);
  return val & 0x8000 ? val | ~0xffff : val;
}

export function parseIndoorBikeData(data: Uint8Array): BikeData {
  let offset = 2;
  const result: BikeData = {};

  try {
    const flags = getUint16LE(data, 0);

    if ((flags & IndoorBikeDataFlag.MoreData) === 0) {
      result.speed = getUint16LE(data, offset) / 100;
      offset += 2;
    }
    if (flags & IndoorBikeDataFlag.AverageSpeedPresent) {
      result.averageSpeed = getUint16LE(data, offset) / 100;
      offset += 2;
    }
    if (flags & IndoorBikeDataFlag.InstantaneousCadence) {
      result.cadence = getUint16LE(data, offset) / 2;
      offset += 2;
    }
    if (flags & IndoorBikeDataFlag.AverageCadencePresent) {
      result.averageCadence = getUint16LE(data, offset) / 2;
      offset += 2;
    }

    if (flags & IndoorBikeDataFlag.TotalDistancePresent) {
      const dvLow = data[offset] ?? 0;
      offset += 1;
      const dvHigh = getUint16LE(data, offset);
      offset += 2;
      result.totalDistance = (dvHigh << 8) + dvLow;
    }
    if (flags & IndoorBikeDataFlag.ResistanceLevelPresent) {
      result.resistanceLevel = getInt16LE(data, offset);
      offset += 2;
    }
    if (flags & IndoorBikeDataFlag.InstantaneousPowerPresent) {
      result.instantaneousPower = getInt16LE(data, offset);
      offset += 2;
    }
    if (flags & IndoorBikeDataFlag.AveragePowerPresent) {
      result.averagePower = getInt16LE(data, offset);
      offset += 2;
    }
    if (flags & IndoorBikeDataFlag.ExpendedEnergyPresent) {
      result.totalEnergy = getUint16LE(data, offset);
      offset += 2;
      result.energyPerHour = getUint16LE(data, offset);
      offset += 2;
      result.energyPerMinute = data[offset];
      offset += 1;
    }

    if (flags & IndoorBikeDataFlag.HeartRatePresent) {
      result.heartrate = data[offset];
      offset += 1;
    }
    if (flags & IndoorBikeDataFlag.MetabolicEquivalentPresent) {
      result.metabolicEquivalent = data[offset] ?? 0 / 10;
      offset += 1;
    }
    if (flags & IndoorBikeDataFlag.ElapsedTimePresent) {
      result.time = getUint16LE(data, offset);
      offset += 2;
    }
    if (flags & IndoorBikeDataFlag.RemainingTimePresent) {
      result.remainingTime = getUint16LE(data, offset);
    }
  } catch (err) {
    console.error({
      message: "error",
      fn: "parseIndoorBikeData()",
      data: Array.from(data)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
      offset,
      error: err instanceof Error ? err.message : err,
      stack: err instanceof Error ? err.stack : undefined,
    });
  }
  return {
    ...result,
    raw: `2ad2:${Array.from(data)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")}`,
  };
}
