import { describe, it, expect, vi, beforeEach } from "vitest";
import { mergeTCX } from "./file";
import { generateTCX, mergeTCXData } from "@/lib/tcx";

// Mock the TCX functions
vi.mock("@/lib/tcx", () => ({
  generateTCX: vi.fn(),
  mergeTCXData: vi.fn(),
}));

describe("file utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock document methods
    document.createElement = vi.fn();
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
    URL.createObjectURL = vi.fn();
    URL.revokeObjectURL = vi.fn();
  });

  describe("mergeTCX", () => {
    const mockActivityPoints = [
      { timestamp: 0, power: 100, speed: 20 },
      { timestamp: 1000, power: 150, speed: 25 },
    ];

    const mockFileInput = {
      type: "",
      accept: "",
      click: vi.fn(),
      onchange: null as (() => void) | null,
      oncancel: null as (() => void) | null,
      files: null as FileList | null,
    };

    beforeEach(() => {
      (
        document.createElement as unknown as ReturnType<typeof vi.fn>
      ).mockReturnValue(mockFileInput);
      (generateTCX as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
        "generated-tcx"
      );
      (mergeTCXData as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
        "merged-tcx"
      );
    });

    it("should handle file selection and merge", async () => {
      const mockFile = {
        text: vi.fn().mockResolvedValue("existing-tcx"),
      } as unknown as File;
      mockFileInput.files = [mockFile] as unknown as FileList;

      mergeTCX(mockActivityPoints);
      expect(mockFileInput.click).toHaveBeenCalled();
      expect(mockFileInput.type).toBe("file");
      expect(mockFileInput.accept).toBe(".tcx");

      // Simulate file selection
      mockFileInput.onchange?.();
      await vi.waitFor(() => {
        expect(mergeTCXData).toHaveBeenCalledWith(
          "existing-tcx",
          mockActivityPoints
        );
      });
    });

    it("should handle file selection cancellation", () => {
      mergeTCX(mockActivityPoints);
      expect(mockFileInput.click).toHaveBeenCalled();

      // Simulate cancellation
      mockFileInput.oncancel?.();
      expect(generateTCX).toHaveBeenCalledWith(mockActivityPoints);
    });

    it("should handle error during merge", async () => {
      const mockFile = {
        text: vi.fn().mockResolvedValue("existing-tcx"),
      } as unknown as File;
      mockFileInput.files = [mockFile] as unknown as FileList;
      (mergeTCXData as unknown as ReturnType<typeof vi.fn>).mockImplementation(
        () => {
          throw new Error("Merge failed");
        }
      );

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

      mergeTCX(mockActivityPoints);
      mockFileInput.onchange?.();

      await vi.waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error merging TCX files:",
          expect.any(Error)
        );
        expect(alertSpy).toHaveBeenCalledWith(
          "Error merging TCX files. Please check the file format."
        );
        expect(generateTCX).toHaveBeenCalledWith(mockActivityPoints);
      });

      consoleSpy.mockRestore();
      alertSpy.mockRestore();
    });
  });
});
