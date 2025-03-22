import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Stack } from "styled-system/jsx";
import { ActivityChart } from "./components/ActivityChart";
import { ActivityControls } from "./components/ActivityControls";
import { BikeControls } from "./components/BikeControls";
import { BikeProvider, useBike } from "./components/BikeProvider";
import { CurrentStats } from "./components/CurrentStats";
import {
  Activity,
  ActivityPoint,
  ActivityStatus,
  useActivity,
} from "./hooks/useActivity";
import { BikeData } from "./lib/bike/types";
import { ActivityEndDialog } from "./components/ActivityEndDialog";
import { useDialog } from "./hooks/useDialog";

function AppContent({
  onStopActivity,
}: {
  onStopActivity: (activity: Activity) => void;
}) {
  const {
    addActivityPoint,
    startActivity,
    pauseActivity,
    resumeActivity,
    stopActivity,
    getActivity,
  } = useActivity();
  const { isConnected } = useBike();

  const activity = getActivity();
  const [currentData, setCurrentData] = useState<BikeData>({});
  const chartData = useRef<ActivityPoint[]>([]);

  useEffect(() => {
    function handleBikeData(event: MessageEvent) {
      if (event.data.type === "bike-data") {
        const data = event.data.payload as BikeData;
        setCurrentData(data);
        addActivityPoint(data.instantaneousPower, data.speed);
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
  }, [addActivityPoint, getActivity, activity.status, activity.duration]);

  const handleStartActivity = useCallback(() => {
    chartData.current = [];
    startActivity();
  }, [startActivity]);

  const handlePauseActivity = useCallback(() => {
    pauseActivity();
  }, [pauseActivity]);

  const handleStopActivity = useCallback(async () => {
    stopActivity();
    onStopActivity(activity);
  }, [stopActivity, onStopActivity, activity]);

  const handleResumeActivity = useCallback(() => {
    resumeActivity();
  }, [resumeActivity]);

  return (
    <Box width="100%" height="100vh" p={4} bg="bg.base">
      <Stack direction="column" gap={3} width="100%">
        <Stack direction="row" gap={3} width="100%" align="center">
          <BikeControls />
        </Stack>
        <Stack direction="row" gap={3} width="100%" align="center">
          <Box width="1/3">
            <ActivityControls
              status={activity.status}
              duration={activity.duration}
              disabled={!isConnected}
              onStartActivity={handleStartActivity}
              onPauseActivity={handlePauseActivity}
              onStopActivity={handleStopActivity}
              onResumeActivity={handleResumeActivity}
            />
          </Box>
          <Box width="2/3">
            <CurrentStats data={currentData} />
          </Box>
        </Stack>
        <Stack gap={4}>
          <ActivityChart points={chartData.current} />
        </Stack>
      </Stack>
    </Box>
  );
}

function App() {
  const { dialogProps, openDialog } = useDialog();
  const [activity, setActivity] = useState<Activity | null>(null);

  const handleStopActivity = useCallback(
    (activity: Activity) => {
      setActivity(activity);
      openDialog();
    },
    [openDialog]
  );

  return (
    <BikeProvider>
      <AppContent onStopActivity={handleStopActivity} />
      <ActivityEndDialog {...dialogProps} activity={activity} />
    </BikeProvider>
  );
}
export default App;
