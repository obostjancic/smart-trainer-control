import BikeInterface, { BikeControl } from "./bike-interface";
import { parseIndoorBikeData } from "./ftms";
import { FTMSControlResponseCode, getControlPointOpCode } from "./ftms-control";

// Standard Fitness Machine Characteristics names
const CHARACTERISTICS = {
  FEATURE: "fitness_machine_feature",
  STATUS: "fitness_machine_status",
  CONTROL_POINT: "fitness_machine_control_point",
  INDOOR_BIKE_DATA: "indoor_bike_data",
  TRAINING_STATUS: "training_status",
  SUPPORTED_SPEED_RANGE: "supported_speed_range",
  SUPPORTED_RESISTANCE_LEVEL_RANGE: "supported_resistance_level_range",
  SUPPORTED_POWER_RANGE: "supported_power_range",
};

const FITNESS_MACHINE_SERVICE = "fitness_machine";

class BluetoothBike extends BikeInterface {
  private _isRunning: boolean;
  private _device: BluetoothDevice | null;
  private _server?: BluetoothRemoteGATTServer;
  private _service: BluetoothRemoteGATTService | null;
  private _characteristic: BluetoothRemoteGATTCharacteristic | null;
  private _controlPointCharacteristic: BluetoothRemoteGATTCharacteristic | null;

  constructor() {
    super();
    this._isRunning = false;
    this._device = null;
    this._server = undefined;
    this._service = null;
    this._characteristic = null;
    this._controlPointCharacteristic = null;
  }

  private async _setupBikeDataNotifications() {
    if (!this._service) throw new Error("No GATT service");

    try {
      this._characteristic = await this._service.getCharacteristic(
        CHARACTERISTICS.INDOOR_BIKE_DATA
      );

      await this._characteristic.startNotifications();
      this._characteristic.addEventListener(
        "characteristicvaluechanged",
        (event: Event) => {
          const target = event.target as BluetoothRemoteGATTCharacteristic;
          if (target.value) {
            const data = parseIndoorBikeData(
              new Uint8Array(target.value.buffer)
            );
            this.emit("data", data);
          }
        }
      );

      console.log("Bike data notifications set up");
    } catch (error) {
      console.error("Error setting up bike data notifications:", error);
      throw error;
    }
  }

  private async _setupControlPoint() {
    if (!this._service) throw new Error("No GATT service");

    try {
      this._controlPointCharacteristic = await this._service.getCharacteristic(
        CHARACTERISTICS.CONTROL_POINT
      );

      // Set up notifications for control point responses
      await this._controlPointCharacteristic.startNotifications();
      this._controlPointCharacteristic.addEventListener(
        "characteristicvaluechanged",
        (event: Event) => {
          const target = event.target as BluetoothRemoteGATTCharacteristic;
          if (target.value) {
            const response = new Uint8Array(target.value.buffer);
            const responseCode = response[0];
            const requestOpCode = response[1];
            const resultCode = response[2];

            if (resultCode !== FTMSControlResponseCode.Success) {
              console.log(response);
              console.error("Control point command failed", {
                responseCode,
                requestOpCode,
                resultCode,
              });
            }
          }
        }
      );

      console.log("Control point set up");
    } catch (error) {
      console.error("Error setting up control point:", error);
      throw error;
    }
  }

  async start(): Promise<void> {
    if (this._isRunning) return;

    try {
      this._device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [FITNESS_MACHINE_SERVICE] }],
      });

      this._server = await this._device.gatt?.connect();
      if (!this._server) throw new Error("Could not connect to GATT server");

      this._service = await this._server.getPrimaryService(
        FITNESS_MACHINE_SERVICE
      );

      // Set up notifications for bike data and control point
      await this._setupBikeDataNotifications();
      await this._setupControlPoint();

      // Request control of the bike
      await this.sendControl("requestControl");

      this._isRunning = true;
      console.log("Bluetooth bike started");
    } catch (error) {
      console.error("Error starting Bluetooth bike:", error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      if (this._characteristic) {
        await this._characteristic.stopNotifications();
      }
      if (this._controlPointCharacteristic) {
        await this._controlPointCharacteristic.stopNotifications();
      }
      if (this._server) {
        this._server.disconnect();
      }
      this._device = null;
      this._server = undefined;
      this._service = null;
      this._characteristic = null;
      this._controlPointCharacteristic = null;
      this._isRunning = false;
      console.log("Bluetooth bike stopped");
    } catch (error) {
      console.error("Error stopping Bluetooth bike:", error);
      throw error;
    }
  }

  isRunning(): boolean {
    return this._isRunning;
  }

  async sendControl(
    control: keyof BikeControl,
    ...parameters: number[]
  ): Promise<void> {
    if (!this._controlPointCharacteristic) {
      throw new Error("Control point not available");
    }
    const opCode = getControlPointOpCode(control);

    const data = new Uint8Array([opCode, ...parameters]);
    await this._controlPointCharacteristic.writeValue(data);
  }
}

export default BluetoothBike;
