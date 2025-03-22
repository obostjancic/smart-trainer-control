import { avg } from "@/utils/math";
import { useState, useEffect, useCallback, useRef } from "react";

export interface Activity {
  duration: number;
  points: ActivityPoint[];
  status: ActivityStatus;
}

export interface ActivityPoint {
  timestamp: number;
  power?: number;
  speed?: number;
}

export enum ActivityStatus {
  NotStarted = "not_started",
  Running = "running",
  Paused = "paused",
  Stopped = "stopped",
}

interface SecondData {
  power: number[];
  speed: number[];
}

export const useActivity = () => {
  const [status, setStatus] = useState<ActivityStatus>(
    ActivityStatus.NotStarted
  );
  const [timeElapsed, setTimeElapsed] = useState(0);
  const activityPointsRef = useRef<ActivityPoint[]>([]);
  const intervalRef = useRef<number | null>(null);
  const currentSecondRef = useRef<SecondData>({ power: [], speed: [] });

  const startActivity = useCallback(() => {
    setStatus(ActivityStatus.Running);
  }, []);

  const stopActivity = useCallback(() => {
    setStatus(ActivityStatus.Stopped);
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
    }
  }, []);

  const resumeActivity = useCallback(() => {
    setStatus(ActivityStatus.Running);
  }, []);

  const pauseActivity = useCallback(() => {
    setStatus(ActivityStatus.Paused);
  }, []);

  const resetActivity = useCallback(() => {
    setStatus(ActivityStatus.NotStarted);
    setTimeElapsed(0);
    activityPointsRef.current = [];
    currentSecondRef.current = { power: [], speed: [] };
  }, []);

  const addActivityPoint = useCallback(
    (power?: number, speed?: number) => {
      if (status !== ActivityStatus.Running) return;

      const now = Date.now();
      const currentSecond = Math.floor(now / 1000);
      const lastPoint =
        activityPointsRef.current[activityPointsRef.current.length - 1];
      const lastSecond = lastPoint
        ? Math.floor(lastPoint.timestamp / 1000)
        : -1;

      if (power !== undefined) currentSecondRef.current.power.push(power);
      if (speed !== undefined) currentSecondRef.current.speed.push(speed);

      if (currentSecond > lastSecond) {
        const avgPower = avg(currentSecondRef.current.power);
        const avgSpeed = avg(currentSecondRef.current.speed);

        activityPointsRef.current = [
          ...activityPointsRef.current,
          {
            timestamp: currentSecond * 1000,
            power: avgPower,
            speed: avgSpeed,
          },
        ];

        currentSecondRef.current = { power: [], speed: [] };
      }
    },
    [status]
  );

  useEffect(() => {
    if (status === ActivityStatus.Running) {
      intervalRef.current = window.setInterval(() => {
        setTimeElapsed((prev) => prev + 1000);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [status]);

  const getActivity = useCallback(() => {
    return {
      duration: timeElapsed,
      points: activityPointsRef.current,
      status,
    };
  }, [timeElapsed, status]);

  return {
    getActivity,
    addActivityPoint,
    startActivity,
    stopActivity,
    pauseActivity,
    resumeActivity,
    resetActivity,
  };
};
