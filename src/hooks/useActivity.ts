import { useState, useEffect, useCallback, useRef } from "react";

export interface ActivityPoint {
  timestamp: number;
  power?: number;
  speed?: number;
}

export enum ActivityStatus {
  NotStarted = "not_started",
  Running = "running",
  Paused = "paused",
}

interface SecondData {
  power: number[];
  speed: number[];
}

const calculateAverage = (values: number[]): number | undefined => {
  if (values.length === 0) return undefined;
  return values.reduce((a, b) => a + b, 0) / values.length;
};

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
    setTimeElapsed(0);
    activityPointsRef.current = [];
    currentSecondRef.current = { power: [], speed: [] };
  }, []);

  const stopActivity = useCallback(() => {
    setStatus(ActivityStatus.NotStarted);
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

      // Add to current second's data
      if (power !== undefined) currentSecondRef.current.power.push(power);
      if (speed !== undefined) currentSecondRef.current.speed.push(speed);

      // If we've moved to a new second, save the averages
      if (currentSecond > lastSecond) {
        const avgPower = calculateAverage(currentSecondRef.current.power);
        const avgSpeed = calculateAverage(currentSecondRef.current.speed);

        activityPointsRef.current = [
          ...activityPointsRef.current,
          {
            timestamp: currentSecond * 1000,
            power: avgPower,
            speed: avgSpeed,
          },
        ];

        // Reset current second data
        currentSecondRef.current = { power: [], speed: [] };
      }
    },
    [status]
  );

  const getActivityPoints = useCallback(() => {
    return activityPointsRef.current;
  }, []);

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

  return {
    status,
    timeElapsed,
    addActivityPoint,
    getActivityPoints,
    startActivity,
    stopActivity,
    pauseActivity,
    resumeActivity,
  };
};
