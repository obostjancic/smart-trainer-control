import { EventEmitter } from "events";
import BikeInterface, { BikeControl } from "./bike-interface";
import MockBike from "./mock-bike";
import BluetoothBike from "./bluetooth-bike";
import type { BikeData } from "./types";

class BikeBridge extends EventEmitter {
  private static instance: BikeBridge;
  private bike: BikeInterface | null = null;

  private constructor() {
    super();
  }

  static getInstance(): BikeBridge {
    if (!BikeBridge.instance) {
      BikeBridge.instance = new BikeBridge();
    }
    return BikeBridge.instance;
  }

  private emitToFrontend(type: string, payload?: unknown) {
    window.postMessage({ type, payload }, "*");
  }

  async connect(useMock: boolean = false) {
    try {
      await this.disconnect();

      this.bike = useMock ? new MockBike() : new BluetoothBike();

      this.bike.on("data", (data: BikeData) => {
        this.emitToFrontend("bike-data", data);
      });

      this.bike.on("error", (error: Error) => {
        this.emitToFrontend("bike-error", error.message);
      });

      await this.bike.start();
      this.emitToFrontend("bike-connect");
    } catch (error) {
      this.emitToFrontend(
        "bike-error",
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async sendControl(control: keyof BikeControl, value: number) {
    if (this.bike) {
      await this.bike.sendControl(control, value);
    }
  }

  async disconnect() {
    if (this.bike) {
      await this.bike.stop();
      this.bike = null;
      this.emitToFrontend("bike-disconnect");
    }
  }
}

// Export the singleton instance
export const bikeBridge = BikeBridge.getInstance();

// Export a function to initialize the bridge
export function initializeBike(useMock: boolean = false) {
  return bikeBridge.connect(useMock);
}

// Export types
export type { BikeData };
