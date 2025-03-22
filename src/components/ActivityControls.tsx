import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Stack } from "styled-system/jsx";
import { PlayIcon, Square, PauseIcon } from "lucide-react";
import { formatDuration } from "../utils/time";
import { Text } from "./ui/text";
import { ActivityStatus } from "@/hooks/useActivity";

interface ActivityControlsProps {
  status: ActivityStatus;
  duration: number;
  disabled?: boolean;
  onStartActivity: () => void;
  onPauseActivity: () => void;
  onStopActivity: () => void;
  onResumeActivity: () => void;
}

export function ActivityControls({
  status,
  duration,
  disabled,
  onStartActivity,
  onPauseActivity,
  onStopActivity,
  onResumeActivity,
}: ActivityControlsProps) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>Activity Controls</Card.Title>
      </Card.Header>
      <Card.Body>
        <Stack direction="column" gap={5} align="center">
          <Stack direction="column" align="center">
            <Text size="5xl" fontWeight="semibold">
              {formatDuration(duration)}
            </Text>
          </Stack>
          {status === ActivityStatus.NotStarted ? (
            <Button onClick={onStartActivity} disabled={disabled} width="100%">
              <PlayIcon />
              Start Activity
            </Button>
          ) : (
            <Stack direction="row" gap={2} width="100%">
              <Button
                onClick={
                  status === ActivityStatus.Running
                    ? onPauseActivity
                    : onResumeActivity
                }
                disabled={disabled}
                variant="outline"
                width="1/2"
              >
                {status === ActivityStatus.Running ? (
                  <PauseIcon />
                ) : (
                  <PlayIcon />
                )}
                {status === ActivityStatus.Running ? "Pause" : "Resume"}
              </Button>
              <Button
                onClick={onStopActivity}
                disabled={disabled}
                colorPalette="red"
                variant="outline"
                width="1/2"
              >
                <Square />
                Stop
              </Button>
            </Stack>
          )}
        </Stack>
      </Card.Body>
    </Card.Root>
  );
}
