import { Activity } from "@/hooks/useActivity";
import { mergeTCX } from "@/utils/file";
import { avg } from "@/utils/math";
import { formatTime } from "@/utils/time";
import { DownloadIcon, UploadIcon, WatchIcon } from "lucide-react";
import { Stack } from "styled-system/jsx";
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";
import type { RootProps } from "./ui/styled/dialog";
import { Text } from "./ui/text";

type ActivityEndDialogProps = RootProps & { activity: Activity | null };

function ActivityStats({ activity }: { activity: Activity }) {
  const avgPower = avg(activity.points.map((point) => point.power ?? 0));
  const avgSpeed = avg(activity.points.map((point) => point.speed ?? 0));

  return (
    <Stack gap="4" p="4" bg="gray.100" rounded="md">
      <Stack direction="row" justify="space-between">
        <Text>Duration</Text>
        <Text fontWeight="bold">{formatTime(activity.duration)}</Text>
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
  const handleMerge = async () => {
    await mergeTCX(props.activity?.points ?? []);
  };

  if (!props.activity) return null;

  return (
    <Dialog.Root {...props}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Stack gap="8" p="6">
            <Stack gap="1">
              <Dialog.Title>Activity Complete</Dialog.Title>
              <Dialog.Description>
                Here's a summary of your activity
              </Dialog.Description>
            </Stack>
            <ActivityStats activity={props.activity} />
            <ActivityActions onMerge={handleMerge} />
          </Stack>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
