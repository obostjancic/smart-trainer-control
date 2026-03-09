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
