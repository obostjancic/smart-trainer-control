import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Stack } from "styled-system/jsx";
import { ActivityChart } from "./components/ActivityChart";
import { ActivityControls } from "./components/ActivityControls";
import { BikeControls } from "./components/BikeControls";
import { BikeProvider } from "./components/BikeProvider";
import { CurrentStats } from "./components/CurrentStats";
import { ActivityEndDialog } from "./components/ActivityEndDialog";
import { ActivityProvider, useActivity } from "./contexts/ActivityContext";
import { ActivityPoint, ActivityStatus } from "./hooks/useActivity";
import { BikeData } from "./lib/bike/types";
import { useBike } from "./components/BikeProvider";

function AppContent() {
  const {
    activity,
    addActivityPoint,
    startActivity,
    pauseActivity,
    resumeActivity,
    stopActivity,
    resetActivity,
  } = useActivity();
  const { isConnected } = useBike();
  const [currentData, setCurrentData] = useState<BikeData>({});
  const chartData = useRef<ActivityPoint[]>([]);

  useEffect(() => {
    function handleBikeData(event: MessageEvent) {
      if (event.data.type === "bike-data") {
        const data = event.data.payload as BikeData;
        setCurrentData(data);
        addActivityPoint(data.instantaneousPower ?? null, data.speed ?? null);
        if (activity.status === ActivityStatus.Running)
          chartData.current.push({
            timestamp: activity.duration,
            power: data.instantaneousPower,
            speed: data.speed,
          });
      }
    }

    window.addEventListener("message", handleBikeData);
    return () => window.removeEventListener("message", handleBikeData);
  }, [addActivityPoint, activity.status, activity.duration]);

  const handleStartActivity = useCallback(() => {
    startActivity();
  }, [startActivity]);

  const handlePauseActivity = useCallback(() => {
    pauseActivity();
  }, [pauseActivity]);

  const handleStopActivity = useCallback(async () => {
    stopActivity();
  }, [stopActivity]);

  const handleResumeActivity = useCallback(() => {
    resumeActivity();
  }, [resumeActivity]);

  const handleResetActivity = useCallback(() => {
    chartData.current = [];
    resetActivity();
  }, [resetActivity]);

  return (
    <Box p="4">
      <Stack gap="2">
        <BikeControls />
        <Stack
          direction={{ base: "column", md: "row" }}
          gap="2"
          width="100%"
          alignItems="center"
        >
          <Box width={{ base: "100%", md: "1/3" }}>
            <ActivityControls
              disabled={!isConnected}
              status={activity.status}
              duration={activity.duration}
              onStartActivity={handleStartActivity}
              onPauseActivity={handlePauseActivity}
              onResumeActivity={handleResumeActivity}
              onStopActivity={handleStopActivity}
            />
          </Box>
          <Box width={{ base: "100%", md: "2/3" }}>
            <CurrentStats data={currentData} />
          </Box>
        </Stack>
        <ActivityChart points={chartData.current} />
      </Stack>
      <ActivityEndDialog
        onOpenChange={(details) => {
          if (!details.open) {
            handleResetActivity();
          }
        }}
      />
    </Box>
  );
}

function App() {
  return (
    <BikeProvider>
      <ActivityProvider>
        <AppContent />
      </ActivityProvider>
    </BikeProvider>
  );
}

export default App;
