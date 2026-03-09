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

  const lastSecondRef = useRef(-1);

  // Wall-clock refs for accurate duration across sleep/wake
  const startedAtRef = useRef(0);
  const pausedDurationRef = useRef(0);
  const pausedAtRef = useRef<number | null>(null);

  // Wake Lock to prevent phone from sleeping during workout
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const addActivityPoint = useCallback(
    (power: number | null, speed: number | null) => {
      if (activity.status !== ActivityStatus.Running) return;

      const now = Date.now();
      const currentSecond = Math.floor(now / 1000);
      const lastSecond = lastSecondRef.current;

      if (power !== null) currentSecondRef.current.power.push(power);
      if (speed !== null) currentSecondRef.current.speed.push(speed);

      if (currentSecond > lastSecond) {
        const avgPower = avg(currentSecondRef.current.power);
        const avgSpeed = avg(currentSecondRef.current.speed);

        lastSecondRef.current = currentSecond;
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
    startedAtRef.current = Date.now();
    pausedDurationRef.current = 0;
    pausedAtRef.current = null;
    setActivity({
      status: ActivityStatus.Running,
      duration: 0,
      points: [],
    });
    currentSecondRef.current = { power: [], speed: [] };
    lastSecondRef.current = -1;
  }, []);

  const pauseActivity = useCallback(() => {
    pausedAtRef.current = Date.now();
    setActivity((prev) => ({
      ...prev,
      status: ActivityStatus.Paused,
    }));
  }, []);

  const resumeActivity = useCallback(() => {
    if (pausedAtRef.current !== null) {
      pausedDurationRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
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
    lastSecondRef.current = -1;
  }, []);

  // Wall-clock based timer — survives phone sleep
  useEffect(() => {
    if (activity.status === ActivityStatus.Running) {
      intervalRef.current = window.setInterval(() => {
        const elapsed =
          Date.now() - startedAtRef.current - pausedDurationRef.current;
        setActivity((prev) => ({
          ...prev,
          duration: elapsed,
        }));
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [activity.status]);

  // Wake Lock — prevent phone from sleeping during workout
  useEffect(() => {
    async function requestWakeLock() {
      try {
        if ("wakeLock" in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        }
      } catch {
        // Wake lock request can fail (e.g. low battery)
      }
    }

    function releaseWakeLock() {
      wakeLockRef.current?.release();
      wakeLockRef.current = null;
    }

    // Re-acquire wake lock when page becomes visible again
    function handleVisibilityChange() {
      if (
        document.visibilityState === "visible" &&
        activity.status === ActivityStatus.Running
      ) {
        requestWakeLock();
      }
    }

    if (activity.status === ActivityStatus.Running) {
      requestWakeLock();
      document.addEventListener("visibilitychange", handleVisibilityChange);
    } else {
      releaseWakeLock();
    }

    return () => {
      releaseWakeLock();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
