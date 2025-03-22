import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { tcxFormat } from "./tcx";

const FIXTURE_PATH = path.join(__dirname, "../test/fixtures/activity.tcx");

describe("TCX utils", () => {
  const fixtureTCX = fs.readFileSync(FIXTURE_PATH, "utf-8");

  describe("mergeTCXData", () => {
    it("should merge activity points while preserving existing data", async () => {
      const firstPoint = {
        timestamp: new Date("2025-03-20T18:15:58.000Z").getTime(),
        power: 100,
        speed: 36, // 10 m/s
      };
      const secondPoint = {
        timestamp: new Date("2025-03-20T18:15:59.000Z").getTime(),
        power: 150,
        speed: 72, // 20 m/s
      };
      const activityPoints = [firstPoint, secondPoint];

      const mergedTCX = await tcxFormat.merge(fixtureTCX, activityPoints);
      const mergedParsed = await tcxFormat.parse(mergedTCX);
      const originalParsed = await tcxFormat.parse(fixtureTCX);

      // Check that we have the same number of trackpoints
      expect(mergedParsed).toHaveLength(originalParsed.length);

      // Check that the merged data has our new power and speed values
      const [firstMerged, secondMerged] = mergedParsed;
      expect(firstMerged).toEqual({
        timestamp: firstPoint.timestamp,
        heartRate: originalParsed[0]?.heartRate,
        power: firstPoint.power,
        speed: firstPoint.speed / 3.6,
      });
      expect(secondMerged).toEqual({
        timestamp: secondPoint.timestamp,
        heartRate: originalParsed[1]?.heartRate,
        power: secondPoint.power,
        speed: secondPoint.speed / 3.6,
      });

      // Check that the XML structure is preserved
      const parser = new DOMParser();
      const originalDoc = parser.parseFromString(fixtureTCX, "text/xml");
      const mergedDoc = parser.parseFromString(
        mergedTCX.toString(),
        "text/xml"
      );

      // Compare the structure (excluding the merged data)
      const originalTrackpoints =
        originalDoc.getElementsByTagName("Trackpoint");
      const mergedTrackpoints = mergedDoc.getElementsByTagName("Trackpoint");

      for (let i = 0; i < originalTrackpoints.length; i++) {
        const original = originalTrackpoints[i];
        const merged = mergedTrackpoints[i];
        if (!merged || !original) continue;

        // Check that all original elements are present
        expect(merged.getElementsByTagName("DistanceMeters")).toHaveLength(1);
        expect(merged.getElementsByTagName("HeartRateBpm")).toHaveLength(1);
        expect(merged.getElementsByTagName("Extensions")).toHaveLength(1);

        // Check that the values of non-merged elements are the same
        const originalDistance =
          original.getElementsByTagName("DistanceMeters")[0]?.textContent;
        const mergedDistance =
          merged.getElementsByTagName("DistanceMeters")[0]?.textContent;
        expect(mergedDistance).toBe(originalDistance);

        const originalHR = original
          .getElementsByTagName("HeartRateBpm")[0]
          ?.getElementsByTagName("Value")[0]?.textContent;
        const mergedHR = merged
          .getElementsByTagName("HeartRateBpm")[0]
          ?.getElementsByTagName("Value")[0]?.textContent;
        expect(mergedHR).toBe(originalHR);
      }
    });
  });
});
