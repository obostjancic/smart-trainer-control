import { bikeBridge, initializeBike } from "@/lib/bike";
import { BikeControl } from "@/lib/bike/bike-interface";
import { Bluetooth, BluetoothOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Stack } from "styled-system/jsx";
import { useBike } from "./BikeProvider";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Slider } from "./ui/slider";

const isDev = process.env.NODE_ENV === "development";

export const BikeControls = () => {
  const { isConnected } = useBike();
  const [useMock, setUseMock] = useState(true);
  const [resistance, setResistance] = useState(0);
  const [targetPower, setTargetPower] = useState(100);

  const controlTimeoutRef = useRef<number | null>(null);

  const handleConnect = async () => {
    await initializeBike(useMock);
  };

  const handleDisconnect = async () => {
    await bikeBridge.disconnect();
  };

  const handleControlChange = useCallback(
    async (control: keyof BikeControl, value: number) => {
      if (controlTimeoutRef.current) {
        window.clearTimeout(controlTimeoutRef.current);
      }

      controlTimeoutRef.current = window.setTimeout(async () => {
        await bikeBridge.sendControl(control, value);
      }, 100);
    },
    []
  );

  useEffect(() => {
    return () => {
      if (controlTimeoutRef.current) {
        window.clearTimeout(controlTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Stack direction="row" gap={4} width="100%">
      <Card.Root flex={1}>
        <Card.Header>
          <Card.Title>Bike Controls</Card.Title>
        </Card.Header>
        <Card.Body>
          <Stack direction="row" gap={16}>
            <Stack direction="column" gap={8}>
              <Button
                onClick={isConnected ? handleDisconnect : handleConnect}
                colorPalette={isConnected ? "red" : undefined}
                variant={isConnected ? "outline" : "solid"}
              >
                {isConnected ? <BluetoothOff /> : <Bluetooth />}
                {isConnected ? "Disconnect" : "Connect"}
              </Button>
              {isDev && (
                <Checkbox
                  checked={useMock}
                  onCheckedChange={(details) => setUseMock(!!details.checked)}
                >
                  Use Mock Bike
                </Checkbox>
              )}
            </Stack>

            <Stack direction="column" gap={8} pb={4} width="100%">
              <Slider
                min={0}
                max={100}
                value={[resistance]}
                onValueChange={(details) => {
                  const value = details.value[0] ?? 0;
                  setResistance(value);
                  handleControlChange("resistance", value);
                }}
                marks={[
                  { value: 0, label: "0" },
                  { value: 10, label: "10" },
                  { value: 20, label: "20" },
                  { value: 30, label: "30" },
                  { value: 40, label: "40" },
                  { value: 50, label: "50" },
                  { value: 60, label: "60" },
                  { value: 70, label: "70" },
                  { value: 80, label: "80" },
                  { value: 90, label: "90" },
                  { value: 100, label: "100" },
                ]}
              >
                Resistance level: {resistance} %
              </Slider>
              <Slider
                min={100}
                max={600}
                value={[targetPower]}
                onValueChange={(details) => {
                  const value = details.value[0] ?? 100;
                  setTargetPower(value);
                  handleControlChange("targetPower", value);
                }}
                marks={[
                  { value: 100, label: "100" },
                  { value: 200, label: "200" },
                  { value: 300, label: "300" },
                  { value: 400, label: "400" },
                  { value: 500, label: "500" },
                  { value: 600, label: "600" },
                ]}
              >
                Target Power: {targetPower} W
              </Slider>
            </Stack>
          </Stack>
        </Card.Body>
      </Card.Root>
    </Stack>
  );
};
