import { ActivityPoint } from "@/hooks/useActivity";
import { generateTCX, tcxFormat } from "@/lib/file/tcx";

export const downloadFile = (content: string, filename: string, mimeType: string) => {
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

export const downloadTCX = (content: string, prefix: string) => {
  const filename = `${prefix}-${new Date().toISOString()}.tcx`;
  downloadFile(content, filename, "application/xml");
};

export const mergeTCX = (activityPoints: ActivityPoint[]) => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".tcx";

  fileInput.onchange = async () => {
    const file = fileInput.files?.[0];
    if (file) {
      try {
        const existingTCX = await file.text();
        const mergedTCX = await tcxFormat.merge(existingTCX, activityPoints);
        downloadTCX(mergedTCX.toString(), "merged-activity");
      } catch (error) {
        console.error("Error merging TCX files:", error);
        alert("Error merging TCX files. Please check the file format.");
        const tcx = generateTCX(activityPoints);
        downloadTCX(tcx, "bike-activity");
      }
    } else {
      const tcx = generateTCX(activityPoints);
      downloadTCX(tcx, "bike-activity");
    }
  };

  fileInput.oncancel = () => {
    const tcx = generateTCX(activityPoints);
    downloadTCX(tcx, "bike-activity");
  };

  fileInput.click();
};
