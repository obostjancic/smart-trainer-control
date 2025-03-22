export interface ActivityPoint {
  timestamp: number;
  power?: number;
  speed?: number;
  heartRate?: number;
}

export interface ActivityFileFormat {
  parse(content: string | ArrayBuffer): Promise<ActivityPoint[]>;
  merge(
    existingContent: string | ArrayBuffer,
    newPoints: ActivityPoint[]
  ): Promise<string | ArrayBuffer>;
}

export function aggregateActivityPoints(
  activityPoints: ActivityPoint[]
): (ActivityPoint & { count: number })[] {
  const pointsBySecond = new Map<number, ActivityPoint & { count: number }>();

  activityPoints.forEach((point) => {
    // Round timestamp to nearest second
    const secondTimestamp = Math.floor(point.timestamp / 1000) * 1000;

    if (!pointsBySecond.has(secondTimestamp)) {
      pointsBySecond.set(secondTimestamp, {
        timestamp: secondTimestamp,
        speed: point.speed,
        power: point.power,
        heartRate: point.heartRate,
        count: 1,
      });
    } else {
      const existing = pointsBySecond.get(secondTimestamp)!;
      pointsBySecond.set(secondTimestamp, {
        timestamp: secondTimestamp,
        speed:
          existing.speed !== undefined && point.speed !== undefined
            ? (existing.speed * existing.count + point.speed) /
              (existing.count + 1)
            : (existing.speed ?? point.speed),
        power:
          existing.power !== undefined && point.power !== undefined
            ? (existing.power * existing.count + point.power) /
              (existing.count + 1)
            : (existing.power ?? point.power),
        heartRate:
          existing.heartRate !== undefined && point.heartRate !== undefined
            ? (existing.heartRate * existing.count + point.heartRate) /
              (existing.count + 1)
            : (existing.heartRate ?? point.heartRate),
        count: existing.count + 1,
      });
    }
  });

  // Convert back to array and sort by timestamp
  return Array.from(pointsBySecond.values()).sort(
    (a, b) => a.timestamp - b.timestamp
  );
}
