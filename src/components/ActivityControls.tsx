import { Stack } from "styled-system/jsx";
import { PlayIcon, Square, PauseIcon, BluetoothOff } from "lucide-react";
import { formatDuration } from "../utils/time";
import { Text } from "./ui/text";
import { ActivityStatus } from "@/hooks/useActivity";
import { css } from "styled-system/css";

interface ActivityControlsProps {
  status: ActivityStatus;
  duration: number;
  disabled?: boolean;
  onStartActivity: () => void;
  onPauseActivity: () => void;
  onStopActivity: () => void;
  onResumeActivity: () => void;
  onDisconnect?: () => void;
}

const actionBtnStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "1.5",
  fontFamily: "var(--font-body)",
  fontWeight: "500",
  fontSize: "sm",
  borderRadius: "lg",
  cursor: "pointer",
  transition: "all 0.15s ease",
  background: "var(--color-btn-bg)",
  border: "1px solid var(--color-btn-border)",
  padding: "0 12px",
  height: "36px",
  color: "var(--color-text-muted)",
  _hover: {
    opacity: 1,
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

export function ActivityControls({
  status,
  duration,
  disabled,
  onStartActivity,
  onPauseActivity,
  onStopActivity,
  onResumeActivity,
  onDisconnect,
}: ActivityControlsProps) {
  if (status === ActivityStatus.NotStarted) {
    return (
      <button
        onClick={onStartActivity}
        disabled={disabled}
        className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "3",
          width: "100%",
          height: "56px",
          fontSize: "xl",
          fontWeight: "600",
          fontFamily: "var(--font-body)",
          background: "var(--color-power)",
          color: "#0a0a0f",
          border: "none",
          borderRadius: "xl",
          cursor: "pointer",
          transition: "all 0.2s ease",
          _hover: {
            opacity: 0.9,
            transform: "translateY(-1px)",
          },
          _disabled: {
            opacity: 0.3,
            cursor: "not-allowed",
            transform: "none",
          },
        })}
      >
        <PlayIcon size={24} />
        Start Activity
      </button>
    );
  }

  return (
    <Stack
      direction="row"
      gap={3}
      align="center"
      width="100%"
      position={{ base: "sticky", md: "relative" }}
      top={{ base: "0", md: "auto" }}
      zIndex={{ base: 10, md: "auto" }}
      py={{ base: 1, md: 0 }}
      px={{ base: 0, md: 0 }}
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <Text
        size="3xl"
        fontWeight="bold"
        fontVariantNumeric="tabular-nums"
        flex={1}
      >
        {formatDuration(duration)}
      </Text>
      <Stack direction="row" gap={1} align="center">
        <button
          onClick={
            status === ActivityStatus.Running
              ? onPauseActivity
              : onResumeActivity
          }
          disabled={disabled}
          className={actionBtnStyle}
        >
          {status === ActivityStatus.Running ? (
            <PauseIcon size={16} />
          ) : (
            <PlayIcon size={16} />
          )}
          {status === ActivityStatus.Running ? "Pause" : "Resume"}
        </button>
        <button
          onClick={onStopActivity}
          disabled={disabled}
          className={actionBtnStyle}
          style={{ color: "var(--color-danger)", borderColor: "var(--color-danger)", opacity: 0.7 }}
        >
          <Square size={16} />
          Stop
        </button>
        {onDisconnect && (
          <button
            onClick={onDisconnect}
            className={actionBtnStyle}
            style={{ padding: "0 12px", color: "var(--color-danger)", borderColor: "var(--color-danger)", opacity: 0.7 }}
          >
            <BluetoothOff size={14} />
          </button>
        )}
      </Stack>
    </Stack>
  );
}
