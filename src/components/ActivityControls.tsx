import { Stack } from "styled-system/jsx";
import { PlayIcon, Square, PauseIcon, BluetoothOff } from "lucide-react";
import { formatDuration } from "../utils/time";
import { Text } from "./ui/text";
import { ActivityStatus } from "@/hooks/useActivity";
import { SportButton } from "./SportButton";

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

const smallBtnStyle = { padding: "0 12px", height: 36, fontSize: 14 };

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
      <SportButton
        variant="primary"
        onClick={onStartActivity}
        disabled={disabled}
        style={{ width: "100%", height: 56, fontSize: 20, gap: 12 }}
      >
        <PlayIcon size={24} />
        Start Activity
      </SportButton>
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
      py={2}
      pb={2}
      px={{ base: 0, md: 0 }}
      style={{
        backgroundColor: "var(--color-bg)",
        borderBottom: "1px solid var(--color-border)",
      }}
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
        <SportButton
          variant="secondary"
          onClick={
            status === ActivityStatus.Running
              ? onPauseActivity
              : onResumeActivity
          }
          disabled={disabled}
          style={smallBtnStyle}
        >
          {status === ActivityStatus.Running ? (
            <PauseIcon size={16} />
          ) : (
            <PlayIcon size={16} />
          )}
          {status === ActivityStatus.Running ? "Pause" : "Resume"}
        </SportButton>
        <SportButton
          variant="danger"
          onClick={onStopActivity}
          disabled={disabled}
          style={smallBtnStyle}
        >
          <Square size={16} />
          Stop
        </SportButton>
        {onDisconnect && (
          <SportButton
            variant="danger"
            onClick={onDisconnect}
            style={smallBtnStyle}
          >
            <BluetoothOff size={14} />
          </SportButton>
        )}
      </Stack>
    </Stack>
  );
}
