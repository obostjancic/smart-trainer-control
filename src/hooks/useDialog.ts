import { useState, useCallback } from "react";
import type { RootProps } from "../components/ui/styled/dialog";

interface UseDialogProps {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface UseDialogReturn {
  isOpen: boolean;
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  openDialog: () => void;
  closeDialog: () => void;
  dialogProps: RootProps;
}

export function useDialog({
  defaultOpen = false,
  onOpenChange,
}: UseDialogProps = {}): UseDialogReturn {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleOpenChange = useCallback(
    (details: { open: boolean }) => {
      setIsOpen(details.open);
      onOpenChange?.(details.open);
    },
    [onOpenChange]
  );

  const openDialog = useCallback(
    () => handleOpenChange({ open: true }),
    [handleOpenChange]
  );
  const closeDialog = useCallback(
    () => handleOpenChange({ open: false }),
    [handleOpenChange]
  );

  return {
    isOpen,
    open: isOpen,
    onOpenChange: handleOpenChange,
    openDialog,
    closeDialog,
    dialogProps: {
      open: isOpen,
      onOpenChange: handleOpenChange,
    },
  };
}
