import { ActivityPoint } from "@/hooks/useActivity";
import { generateTCX, mergeTCXData } from "@/lib/tcx";
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const downloadTCX = (content: string, prefix: string) => {
  const filename = `${prefix}-${new Date().toISOString()}.tcx`;
  downloadFile(content, filename, "application/xml");
};

export const mergeTCX = (activityPoints: ActivityPoint[]) => {
  // Create file input and trigger click
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".tcx";

  fileInput.onchange = async () => {
    const file = fileInput.files?.[0];
    if (file) {
      try {
        const existingTCX = await file.text();
        const mergedTCX = mergeTCXData(existingTCX, activityPoints);
        downloadTCX(mergedTCX, "merged-activity");
      } catch (error) {
        console.error("Error merging TCX files:", error);
        alert("Error merging TCX files. Please check the file format.");
        // If there's an error, fall back to generating a new TCX
        const tcx = generateTCX(activityPoints);
        downloadTCX(tcx, "bike-activity");
      }
    } else {
      // If no file was selected, generate a new TCX
      const tcx = generateTCX(activityPoints);
      downloadTCX(tcx, "bike-activity");
    }
  };

  // Also handle the cancel case
  fileInput.oncancel = () => {
    const tcx = generateTCX(activityPoints);
    downloadTCX(tcx, "bike-activity");
  };

  fileInput.click();
};
