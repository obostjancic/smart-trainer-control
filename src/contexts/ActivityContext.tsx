import {
  createContext,
  useContext,
  useCallback,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { ActivityPoint, ActivityStatus } from "@/hooks/useActivity";
import { avg } from "@/utils/math";

export interface Activity {
  status: ActivityStatus;
  duration: number;
  points: ActivityPoint[];
}

interface ActivityContextType {
  activity: Activity;
  addActivityPoint: (power: number | null, speed: number | null) => void;
  startActivity: () => void;
  pauseActivity: () => void;
  resumeActivity: () => void;
  stopActivity: () => void;
  resetActivity: () => void;
}

const ActivityContext = createContext<ActivityContextType | null>(null);

const initialActivity: Activity = {
  status: ActivityStatus.NotStarted,
  duration: 0,
  points: [],
};

interface SecondData {
  power: number[];
  speed: number[];
}

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [activity, setActivity] = useState<Activity>(initialActivity);
  const intervalRef = useRef<number | null>(null);
  const currentSecondRef = useRef<SecondData>({ power: [], speed: [] });

  const addActivityPoint = useCallback(
    (power: number | null, speed: number | null) => {
      if (activity.status !== ActivityStatus.Running) return;

      const now = Date.now();
      const currentSecond = Math.floor(now / 1000);
      const lastPoint = activity.points[activity.points.length - 1];
      const lastSecond = lastPoint
        ? Math.floor(lastPoint.timestamp / 1000)
        : -1;

      if (power !== null) currentSecondRef.current.power.push(power);
      if (speed !== null) currentSecondRef.current.speed.push(speed);

      if (currentSecond > lastSecond) {
        const avgPower = avg(currentSecondRef.current.power);
        const avgSpeed = avg(currentSecondRef.current.speed);

        setActivity((prev) => ({
          ...prev,
          points: [
            ...prev.points,
            {
              timestamp: currentSecond * 1000,
              power: avgPower,
              speed: avgSpeed,
            },
          ],
        }));

        currentSecondRef.current = { power: [], speed: [] };
      }
    },
    [activity.status]
  );

  const startActivity = useCallback(() => {
    setActivity({
      status: ActivityStatus.Running,
      duration: 0,
      points: [],
    });
    currentSecondRef.current = { power: [], speed: [] };
  }, []);

  const pauseActivity = useCallback(() => {
    setActivity((prev) => ({
      ...prev,
      status: ActivityStatus.Paused,
    }));
  }, []);

  const resumeActivity = useCallback(() => {
    setActivity((prev) => ({
      ...prev,
      status: ActivityStatus.Running,
    }));
  }, []);

  const stopActivity = useCallback(() => {
    setActivity((prev) => ({
      ...prev,
      status: ActivityStatus.NotStarted,
    }));
  }, []);

  const resetActivity = useCallback(() => {
    setActivity(initialActivity);
    currentSecondRef.current = { power: [], speed: [] };
  }, []);

  useEffect(() => {
    if (activity.status === ActivityStatus.Running) {
      intervalRef.current = window.setInterval(() => {
        setActivity((prev) => ({
          ...prev,
          duration: prev.duration + 1000,
        }));
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [activity.status]);

  return (
    <ActivityContext.Provider
      value={{
        activity,
        addActivityPoint,
        startActivity,
        pauseActivity,
        resumeActivity,
        stopActivity,
        resetActivity,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error("useActivity must be used within an ActivityProvider");
  }
  return context;
}
