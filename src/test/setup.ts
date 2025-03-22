import { beforeAll } from "vitest";
import { vi } from "vitest";

beforeAll(() => {
  // Mock document methods
  document.createElement = vi.fn();
  document.body.appendChild = vi.fn();
  document.body.removeChild = vi.fn();
  URL.createObjectURL = vi.fn();
  URL.revokeObjectURL = vi.fn();
});
