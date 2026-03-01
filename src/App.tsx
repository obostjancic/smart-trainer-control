import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Stack } from "styled-system/jsx";
import { ActivityChart } from "./components/ActivityChart";
import { ActivityControls } from "./components/ActivityControls";
import { BikeControls } from "./components/BikeControls";
import { BikeProvider } from "./components/BikeProvider";
import { CurrentStats } from "./components/CurrentStats";
import { ActivitySummary } from "./components/ActivitySummary";
import { ThemeToggle } from "./components/ThemeToggle";
import { ActivityProvider, useActivity } from "./contexts/ActivityContext";
import { ActivityPoint, ActivityStatus } from "./hooks/useActivity";
import { BikeData } from "./lib/bike/types";
import { bikeBridge } from "./lib/bike";
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

  const activityStatusRef = useRef(activity.status);
  const activityDurationRef = useRef(activity.duration);
  activityStatusRef.current = activity.status;
  activityDurationRef.current = activity.duration;

  useEffect(() => {
    function handleBikeData(event: MessageEvent) {
      if (event.data.type === "bike-data") {
        const data = event.data.payload as BikeData;
        setCurrentData(data);
        addActivityPoint(data.instantaneousPower ?? null, data.speed ?? null);
        if (activityStatusRef.current === ActivityStatus.Running)
          chartData.current.push({
            timestamp: activityDurationRef.current,
            power: data.instantaneousPower,
            speed: data.speed,
          });
      }
    }

    window.addEventListener("message", handleBikeData);
    return () => window.removeEventListener("message", handleBikeData);
  }, [addActivityPoint]);

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

  const isActive = activity.status !== ActivityStatus.NotStarted;
  const hasSummary =
    activity.status === ActivityStatus.NotStarted &&
    activity.points.length > 0;

  return (
    <Box
      p={{ base: 3, md: 4 }}
      maxWidth="1200px"
      mx="auto"
      minHeight="100dvh"
    >
      {hasSummary ? (
        <ActivitySummary
          activity={activity}
          chartPoints={chartData.current}
          onReset={handleResetActivity}
        />
      ) : isActive ? (
        /* Active workout layout */
        <Stack gap={{ base: 4, md: 4 }} justify={{ md: "center" }} minHeight={{ md: "calc(100dvh - 32px)" }}>
          {/* Top bar: duration + pause/stop */}
          <ActivityControls
            disabled={!isConnected}
            status={activity.status}
            duration={activity.duration}
            onStartActivity={handleStartActivity}
            onPauseActivity={handlePauseActivity}
            onResumeActivity={handleResumeActivity}
            onStopActivity={handleStopActivity}
            onDisconnect={() => bikeBridge.disconnect()}
          />

          {/* Desktop: two columns. Mobile: single stack */}
          <Stack
            direction={{ base: "column", md: "row" }}
            gap={{ base: 4, md: 6 }}
          >
            {/* Left column: stats + controls */}
            <Stack gap={4} flex={{ md: "1" }}>
              {/* Hero stats */}
              <CurrentStats data={currentData} />

              {/* Bike controls (target power + resistance buttons) */}
              <BikeControls />
            </Stack>

            {/* Right column: chart (desktop only shows as column) */}
            <Box flex={{ md: "1.5" }} display="flex" alignItems="center">
              <ActivityChart points={chartData.current} />
            </Box>
          </Stack>
        </Stack>
      ) : (
        /* Pre-workout layout */
        <Stack gap={6} align="center" justify="center" minHeight="80dvh">
          {/* Connection + controls */}
          <Box width="100%" maxWidth="500px">
            <BikeControls />
          </Box>

          {/* Start button — only after connected */}
          {isConnected && (
            <Box width="100%" maxWidth="500px" className="animate-fade-in-up">
              <ActivityControls
                status={activity.status}
                duration={activity.duration}
                onStartActivity={handleStartActivity}
                onPauseActivity={handlePauseActivity}
                onResumeActivity={handleResumeActivity}
                onStopActivity={handleStopActivity}
              />
            </Box>
          )}
        </Stack>
      )}

      <ThemeToggle />
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
