import { describe, it, expect } from "vitest";
import { avg } from "./math";

describe("math utils", () => {
  describe("avg", () => {
    it("should calculate average of numbers", () => {
      expect(avg([1, 2, 3])).toBe(2);
      expect(avg([0, 0, 0])).toBe(0);
      expect(avg([1])).toBe(1);
    });

    it("should handle empty array", () => {
      expect(avg([])).toBe(0);
    });

    it("should handle negative numbers", () => {
      expect(avg([-1, -2, -3])).toBe(-2);
      expect(avg([-1, 0, 1])).toBe(0);
    });

    it("should handle decimal numbers", () => {
      expect(avg([1.5, 2.5, 3.5])).toBe(2.5);
      expect(avg([0.1, 0.2, 0.3])).toBe(0.2);
    });
  });
});
