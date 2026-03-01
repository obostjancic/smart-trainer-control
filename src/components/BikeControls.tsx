import { bikeBridge, initializeBike } from "@/lib/bike";
import { BikeControl } from "@/lib/bike/bike-interface";
import { Bluetooth, Loader2, Minus, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Stack } from "styled-system/jsx";
import { useBike } from "./BikeProvider";
import { Checkbox } from "./ui/checkbox";
import { Text } from "./ui/text";
import { css } from "styled-system/css";
import { SportButton } from "./SportButton";

const isDev = process.env.NODE_ENV === "development";

export const BikeControls = () => {
  const { isConnected } = useBike();
  const [useMock, setUseMock] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [resistance, setResistance] = useState(0);
  const [targetPower, setTargetPower] = useState(100);

  const controlTimeoutRef = useRef<number | null>(null);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await initializeBike(useMock);
    } finally {
      setConnecting(false);
    }
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

  const adjustTargetPower = (delta: number) => {
    const newValue = Math.min(600, Math.max(100, targetPower + delta));
    setTargetPower(newValue);
    handleControlChange("targetPower", newValue);
  };

  const adjustResistance = (delta: number) => {
    const newValue = Math.min(100, Math.max(0, resistance + delta));
    setResistance(newValue);
    handleControlChange("resistance", newValue);
  };

  const state = isConnected ? "connected" : connecting ? "connecting" : "disconnected";

  return (
    <div className="bike-controls" data-state={state} style={{ width: "100%" }}>
      {/* Connect section — fades out when connected */}
      <Stack gap={4} align="center" justify="center" py={12} className="connect-section">
        <Stack gap={1} align="center" mb={2}>
          <Text fontSize="2xl" fontWeight="bold">
            Smart Trainer Control
          </Text>
          <Text size="sm" style={{ color: "var(--color-text-muted)" }}>
            Connect your bike to get started
          </Text>
        </Stack>
        <SportButton
          variant="primary"
          onClick={handleConnect}
          disabled={connecting}
          className="connect-btn"
          style={{ padding: "16px 40px", fontSize: 20, gap: 12 }}
        >
          {connecting ? (
            <Loader2 size={22} className={css({ animation: "spin 1s linear infinite" })} />
          ) : (
            <Bluetooth size={22} />
          )}
          {connecting ? "Connecting..." : "Connect Bike"}
        </SportButton>
        {isDev && (
          <Checkbox
            checked={useMock}
            onCheckedChange={(details) => setUseMock(!!details.checked)}
          >
            Use Mock Bike (dev)
          </Checkbox>
        )}
        {!("bluetooth" in navigator) && (
          <Text size="xs" style={{ color: "var(--color-text-muted)", opacity: 0.6 }}>
            Requires Chrome, Edge, or Opera (Web Bluetooth)
          </Text>
        )}
      </Stack>

      {/* Controls section — powers up when connected */}
      <Stack gap={6} width="100%" className="controls-section">
        {/* Target Power - Primary control */}
        <Stack gap={3} align="center">
          <Text
            size="lg"
            fontWeight="medium"
            style={{ color: "var(--color-text-muted)" }}
          >
            Target Power
          </Text>
          <Text
            size="4xl"
            fontWeight="bold"
            fontVariantNumeric="tabular-nums"
            style={{
              color: "var(--color-power)",
              textShadow: "var(--glow-power)",
            }}
          >
            {targetPower} W
          </Text>
        </Stack>
        <Stack direction="row" gap={2} width="100%">
          <SportButton
            variant="control"
            onClick={() => adjustTargetPower(-50)}
            disabled={targetPower <= 100}
            style={{ flex: 0.7, height: 48, fontSize: 16 }}
          >
            <Minus size={16} />
            50
          </SportButton>
          <SportButton
            variant="control"
            onClick={() => adjustTargetPower(-10)}
            disabled={targetPower <= 100}
            style={{ flex: 1, height: 72, fontSize: 24 }}
          >
            <Minus size={28} />
            10
          </SportButton>
          <SportButton
            variant="control"
            onClick={() => adjustTargetPower(10)}
            disabled={targetPower >= 600}
            style={{ flex: 1, height: 72, fontSize: 24 }}
          >
            <Plus size={28} />
            10
          </SportButton>
          <SportButton
            variant="control"
            onClick={() => adjustTargetPower(50)}
            disabled={targetPower >= 600}
            style={{ flex: 0.7, height: 48, fontSize: 16 }}
          >
            <Plus size={16} />
            50
          </SportButton>
        </Stack>

        {/* Resistance - Secondary control */}
        <Stack gap={2} align="center">
          <Text
            size="md"
            fontWeight="medium"
            style={{ color: "var(--color-text-muted)" }}
          >
            Resistance
          </Text>
          <Text size="2xl" fontWeight="bold" fontVariantNumeric="tabular-nums">
            {resistance}%
          </Text>
        </Stack>
        <Stack direction="row" gap={2} width="100%">
          <SportButton
            variant="control"
            onClick={() => adjustResistance(-50)}
            disabled={resistance <= 0}
            style={{ flex: 0.7, height: 40, fontSize: 14 }}
          >
            <Minus size={14} />
            50
          </SportButton>
          <SportButton
            variant="control"
            onClick={() => adjustResistance(-10)}
            disabled={resistance <= 0}
            style={{ flex: 1, height: 52, fontSize: 18 }}
          >
            <Minus size={20} />
            10
          </SportButton>
          <SportButton
            variant="control"
            onClick={() => adjustResistance(10)}
            disabled={resistance >= 100}
            style={{ flex: 1, height: 52, fontSize: 18 }}
          >
            <Plus size={20} />
            10
          </SportButton>
          <SportButton
            variant="control"
            onClick={() => adjustResistance(50)}
            disabled={resistance >= 100}
            style={{ flex: 0.7, height: 40, fontSize: 14 }}
          >
            <Plus size={14} />
            50
          </SportButton>
        </Stack>
      </Stack>
    </div>
  );
};
