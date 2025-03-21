import { Stack } from "styled-system/jsx";
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";

interface StopActivityModalProps extends Dialog.RootProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StopActivityModal({ isOpen, onClose }: StopActivityModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content>
        <Dialog.Title>Stop Activity</Dialog.Title>

        <Stack direction="row" gap={4} justify="flex-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="solid">Stop Without Upload</Button>
          <Button variant="solid" colorPalette="green">
            Stop & Upload
          </Button>
        </Stack>
      </Dialog.Content>
    </Dialog.Root>
  );
}
