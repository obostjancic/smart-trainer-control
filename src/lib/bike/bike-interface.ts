import { EventEmitter } from "events";
import { FTMSControlOpCode } from "./ftms-control";

export interface BikeControl {
  resistance: number;
  targetPower: number;
  requestControl: FTMSControlOpCode;
}

class BikeInterface extends EventEmitter {
  constructor() {
    super();
  }

  async start(): Promise<void> {
    throw new Error("Not implemented");
  }

  async stop(): Promise<void> {
    throw new Error("Not implemented");
  }

  isRunning(): boolean {
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async sendControl(_: keyof BikeControl, ...__: number[]): Promise<void> {
    throw new Error("Not implemented");
  }
}

export default BikeInterface;
