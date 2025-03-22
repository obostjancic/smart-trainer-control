import { describe, it, expect } from "vitest";
import { formatDuration } from "./time";

describe("time utils", () => {
  describe("formatDuration", () => {
    it("should format duration in HH:MM:SS format by default for durations over 1 hour", () => {
      expect(formatDuration(0)).toBe("00:00");
      expect(formatDuration(1000)).toBe("00:01");
      expect(formatDuration(60000)).toBe("01:00");
      expect(formatDuration(3600000)).toBe("01:00:00");
    });

    it("should format duration in HH:MM:SS format when specified", () => {
      expect(formatDuration(0, "HH:MM:SS")).toBe("00:00:00");
      expect(formatDuration(1000, "HH:MM:SS")).toBe("00:00:01");
      expect(formatDuration(60000, "HH:MM:SS")).toBe("00:01:00");
      expect(formatDuration(3600000, "HH:MM:SS")).toBe("01:00:00");
    });

    it("should format duration in MM:SS format when specified", () => {
      expect(formatDuration(0, "MM:SS")).toBe("00:00");
      expect(formatDuration(1000, "MM:SS")).toBe("00:01");
      expect(formatDuration(60000, "MM:SS")).toBe("01:00");
      expect(formatDuration(3600000, "MM:SS")).toBe("01:00:00");
    });

    it("should handle hours", () => {
      expect(formatDuration(7200000)).toBe("02:00:00");
      expect(formatDuration(3660000)).toBe("01:01:00");
      expect(formatDuration(3601000)).toBe("01:00:01");
    });

    it("should handle minutes", () => {
      expect(formatDuration(120000)).toBe("02:00");
      expect(formatDuration(61000)).toBe("01:01");
    });

    it("should handle seconds", () => {
      expect(formatDuration(2000)).toBe("00:02");
      expect(formatDuration(5000)).toBe("00:05");
    });
  });
});
