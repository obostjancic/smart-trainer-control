import { FitParser, FitData } from "fit-file-parser";
import {
  ActivityFileFormat,
  ActivityPoint,
  aggregateActivityPoints,
} from "./common";

interface FitRecord {
  timestamp: Date;
  heart_rate?: number;
  power?: number;
  speed?: number;
}

export const fitFormat: ActivityFileFormat = {
  async parse(content: string | ArrayBuffer): Promise<ActivityPoint[]> {
    const fitContent =
      typeof content === "string" ? new TextEncoder().encode(content) : content;
    const parser = new FitParser({
      force: true,
      mode: "list",
    });

    const data = await new Promise<FitData>((resolve, reject) => {
      parser.parse(fitContent, (error: Error | null, data: FitData) => {
        if (error) reject(error);
        else resolve(data);
      });
    });

    const records = data.records as FitRecord[];
    return records.map((record) => ({
      timestamp: record.timestamp.getTime(),
      heartRate: record.heart_rate,
      power: record.power,
      speed: record.speed,
    }));
  },

  async merge(
    existingContent: string | ArrayBuffer,
    activityPoints: ActivityPoint[]
  ): Promise<ArrayBuffer> {
    const existingFIT =
      typeof existingContent === "string"
        ? new TextEncoder().encode(existingContent)
        : existingContent;
    const parser = new FitParser({
      force: true,
      mode: "list",
    });

    const data = await new Promise<FitData>((resolve, reject) => {
      parser.parse(existingFIT, (error: Error | null, data: FitData) => {
        if (error) reject(error);
        else resolve(data);
      });
    });

    const records = data.records as FitRecord[];
    const aggregatedActivityPoints = aggregateActivityPoints(activityPoints);
    const activityPointsMap = new Map(
      aggregatedActivityPoints.map((point) => [point.timestamp, point])
    );

    // Update existing records with new data
    records.forEach((record) => {
      const timestamp = record.timestamp.getTime();
      const activityPoint = Array.from(activityPointsMap.entries()).find(
        ([pointTimestamp]) => Math.abs(pointTimestamp - timestamp) <= 100
      )?.[1];

      if (activityPoint) {
        if (activityPoint.speed !== undefined) {
          record.speed = activityPoint.speed;
        }
        if (activityPoint.power !== undefined) {
          record.power = activityPoint.power;
        }
      }
    });

    // TODO: Implement FIT file generation
    // This requires a FIT encoder which is more complex
    // We might want to use a different library for this
    throw new Error("FIT file generation not implemented yet");
  },
};
