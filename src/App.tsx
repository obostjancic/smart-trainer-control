import { useState, useRef, useCallback } from "react";
import { Box, Stack } from "styled-system/jsx";
import { Dashboard } from "./components/Dashboard";
import { BikeProvider } from "./components/BikeProvider";
import { Controls } from "./components/Controls";
import { BikeData } from "./lib/bike/types";
import { generateTCX, mergeTCXData } from "./lib/tcx";

interface ActivityPoint {
  timestamp: number;
  power?: number;
  speed?: number;
}

function AppContent() {
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const activityDataRef = useRef<ActivityPoint[]>([]);

  const handleStartActivity = () => {
    activityDataRef.current = [];
    setStartTime(Date.now());
    setIsActive(true);
  };

  const downloadTCX = (content: string, prefix: string) => {
    const blob = new Blob([content], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prefix}-${new Date().toISOString()}.tcx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleStopActivity = useCallback(async () => {
    setIsActive(false);

    // Create file input and trigger click
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".tcx";

    fileInput.onchange = async () => {
      const file = fileInput.files?.[0];
      if (file) {
        try {
          const existingTCX = await file.text();
          const mergedTCX = mergeTCXData(existingTCX, activityDataRef.current);
          downloadTCX(mergedTCX, "merged-activity");
        } catch (error) {
          console.error("Error merging TCX files:", error);
          alert("Error merging TCX files. Please check the file format.");
          // If there's an error, fall back to generating a new TCX
          const tcx = generateTCX(activityDataRef.current);
          downloadTCX(tcx, "bike-activity");
        }
      } else {
        // If no file was selected, generate a new TCX
        const tcx = generateTCX(activityDataRef.current);
        downloadTCX(tcx, "bike-activity");
      }
    };

    // Also handle the cancel case
    fileInput.oncancel = () => {
      const tcx = generateTCX(activityDataRef.current);
      downloadTCX(tcx, "bike-activity");
    };

    fileInput.click();
  }, []);

  const handleBikeData = useCallback(
    (data: BikeData) => {
      if (isActive) {
        activityDataRef.current.push({
          timestamp: Date.now(),
          power: data.instantaneousPower,
          speed: data.speed,
        });
      }
    },
    [isActive]
  );

  return (
    <Box width="100%" height="100%" p={4} bg="gray.900">
      <Stack direction="column" gap={3} width="100%">
        <Stack direction="row" gap={3} width="100%" align="center">
          <Controls
            timeElapsed={isActive ? Date.now() - startTime : 0}
            isActive={isActive}
            onStartActivity={handleStartActivity}
            onStopActivity={handleStopActivity}
          />
        </Stack>
        <Dashboard isActive={isActive} onData={handleBikeData} />
      </Stack>
    </Box>
  );
}

function App() {
  return (
    <BikeProvider>
      <AppContent />
    </BikeProvider>
  );
}

export default App;
