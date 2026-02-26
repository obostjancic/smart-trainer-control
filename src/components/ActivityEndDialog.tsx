import { Activity } from "@/hooks/useActivity";
import { mergeTCX } from "@/utils/file";
import { avg } from "@/utils/math";
import { formatDuration } from "@/utils/time";
import { DownloadIcon, UploadIcon, WatchIcon, XIcon } from "lucide-react";
import { Stack } from "styled-system/jsx";
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";
import type { RootProps } from "./ui/styled/dialog";
import { Text } from "./ui/text";
import { ActivityStatus } from "@/hooks/useActivity";
import { useActivity } from "@/contexts/ActivityContext";

type ActivityEndDialogProps = RootProps;

function ActivityStats({ activity }: { activity: Activity }) {
  const avgPower = avg(activity.points.map((point) => point.power ?? 0));
  const avgSpeed = avg(activity.points.map((point) => point.speed ?? 0));

  return (
    <Stack
      gap="4"
      p="4"
      rounded="md"
      style={{
        backgroundColor: "var(--color-btn-bg)",
        border: "1px solid var(--color-border)",
      }}
    >
      <Stack direction="row" justify="space-between">
        <Text>Duration</Text>
        <Text fontWeight="bold">{formatDuration(activity.duration)}</Text>
      </Stack>
      <Stack direction="row" justify="space-between">
        <Text>Average Power</Text>
        <Text fontWeight="bold">{Math.round(avgPower)}W</Text>
      </Stack>
      <Stack direction="row" justify="space-between">
        <Text>Average Speed</Text>
        <Text fontWeight="bold">{avgSpeed.toFixed(1)} km/h</Text>
      </Stack>
    </Stack>
  );
}

function ActivityActions({ onMerge }: { onMerge: () => void }) {
  return (
    <Stack gap="3" direction="column" width="full">
      <Button width="full" disabled>
        <DownloadIcon />
        Download TCX (Coming Soon)
      </Button>
      <Button width="full" variant="outline" onClick={onMerge}>
        <UploadIcon />
        Merge with existing activity
      </Button>
      <Button width="full" variant="outline" disabled>
        <WatchIcon />
        Sync to Garmin (Coming Soon)
      </Button>
    </Stack>
  );
}

export function ActivityEndDialog(props: ActivityEndDialogProps) {
  const { resetActivity, activity } = useActivity();
  const handleMerge = async () => {
    await mergeTCX(activity.points);
  };

  const handleOpenChange = (details: { open: boolean }) => {
    if (!details.open) {
      resetActivity();
    }
    props.onOpenChange?.(details);
  };

  if (!activity.points.length) return null;

  return (
    <Dialog.Root
      {...props}
      open={
        activity.status === ActivityStatus.NotStarted &&
        activity.points.length > 0
      }
      onOpenChange={handleOpenChange}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Stack gap="8" p="6">
            <Stack gap="1" position="relative">
              <Dialog.Title>Activity Complete</Dialog.Title>
              <Button
                position="absolute"
                top="0"
                right="0"
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleOpenChange({ open: false });
                }}
              >
                <XIcon />
              </Button>
            </Stack>
            <ActivityStats activity={activity} />
            <ActivityActions onMerge={handleMerge} />
          </Stack>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
