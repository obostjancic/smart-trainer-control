import { bikeBridge, initializeBike } from "@/lib/bike";
import { BikeControl } from "@/lib/bike/bike-interface";
import { Bluetooth, Minus, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Stack } from "styled-system/jsx";
import { useBike } from "./BikeProvider";
import { Checkbox } from "./ui/checkbox";
import { Text } from "./ui/text";
import { css } from "styled-system/css";

const isDev = process.env.NODE_ENV === "development";

const controlBtnStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "1",
  border: "1px solid var(--color-btn-border)",
  background: "var(--color-btn-bg)",
  color: "var(--color-text)",
  borderRadius: "lg",
  cursor: "pointer",
  fontFamily: "var(--font-body)",
  fontWeight: "600",
  transition: "all 0.15s ease",
  _hover: {
    background: "var(--color-btn-hover)",
  },
  _active: {
    transform: "scale(0.95)",
  },
  _disabled: {
    opacity: 0.3,
    cursor: "not-allowed",
    transform: "none",
  },
});

export const BikeControls = () => {
  const { isConnected } = useBike();
  const [useMock, setUseMock] = useState(false);
  const [resistance, setResistance] = useState(0);
  const [targetPower, setTargetPower] = useState(100);

  const controlTimeoutRef = useRef<number | null>(null);

  const handleConnect = async () => {
    await initializeBike(useMock);
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

  if (!isConnected) {
    return (
      <Stack gap={4} align="center" justify="center" py={12} className="animate-scale-in">
        <Stack gap={1} align="center" mb={2}>
          <Text fontSize="2xl" fontWeight="bold">
            Smart Trainer Control
          </Text>
          <Text size="sm" style={{ color: "var(--color-text-muted)" }}>
            Connect your bike to get started
          </Text>
        </Stack>
        <button
          onClick={handleConnect}
          className={css({
            display: "flex",
            alignItems: "center",
            gap: "3",
            padding: "16px 40px",
            fontSize: "xl",
            fontWeight: "600",
            fontFamily: "var(--font-body)",
            background: "var(--color-power)",
            color: "#0a0a0f",
            border: "none",
            borderRadius: "lg",
            cursor: "pointer",
            transition: "all 0.2s ease",
            _hover: {
              opacity: 0.9,
              transform: "translateY(-1px)",
            },
          })}
        >
          <Bluetooth size={22} />
          Connect Bike
        </button>
        {isDev && (
          <Checkbox
            checked={useMock}
            onCheckedChange={(details) => setUseMock(!!details.checked)}
          >
            Use Mock Bike (dev)
          </Checkbox>
        )}
      </Stack>
    );
  }

  return (
    <Stack gap={6} width="100%">
      {/* Target Power - Primary control */}
      <Stack gap={3} align="center" className="animate-fade-in-up animate-delay-1">
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
        <Stack direction="row" gap={2} width="100%">
          <button
            onClick={() => adjustTargetPower(-50)}
            disabled={targetPower <= 100}
            className={controlBtnStyle}
            style={{ flex: 0.7, height: 48, fontSize: 16 }}
          >
            <Minus size={16} />
            50
          </button>
          <button
            onClick={() => adjustTargetPower(-10)}
            disabled={targetPower <= 100}
            className={controlBtnStyle}
            style={{ flex: 1, height: 72, fontSize: 24 }}
          >
            <Minus size={28} />
            10
          </button>
          <button
            onClick={() => adjustTargetPower(10)}
            disabled={targetPower >= 600}
            className={controlBtnStyle}
            style={{ flex: 1, height: 72, fontSize: 24 }}
          >
            <Plus size={28} />
            10
          </button>
          <button
            onClick={() => adjustTargetPower(50)}
            disabled={targetPower >= 600}
            className={controlBtnStyle}
            style={{ flex: 0.7, height: 48, fontSize: 16 }}
          >
            <Plus size={16} />
            50
          </button>
        </Stack>
      </Stack>

      {/* Resistance - Secondary control */}
      <Stack gap={2} align="center" className="animate-fade-in-up animate-delay-2">
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
        <Stack direction="row" gap={2} width="100%">
          <button
            onClick={() => adjustResistance(-50)}
            disabled={resistance <= 0}
            className={controlBtnStyle}
            style={{ flex: 0.7, height: 40, fontSize: 14 }}
          >
            <Minus size={14} />
            50
          </button>
          <button
            onClick={() => adjustResistance(-10)}
            disabled={resistance <= 0}
            className={controlBtnStyle}
            style={{ flex: 1, height: 52, fontSize: 18 }}
          >
            <Minus size={20} />
            10
          </button>
          <button
            onClick={() => adjustResistance(10)}
            disabled={resistance >= 100}
            className={controlBtnStyle}
            style={{ flex: 1, height: 52, fontSize: 18 }}
          >
            <Plus size={20} />
            10
          </button>
          <button
            onClick={() => adjustResistance(50)}
            disabled={resistance >= 100}
            className={controlBtnStyle}
            style={{ flex: 0.7, height: 40, fontSize: 14 }}
          >
            <Plus size={14} />
            50
          </button>
        </Stack>
      </Stack>

    </Stack>
  );
};
