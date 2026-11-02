import { useToast } from "heroui-native";
import { useMemo } from "react";

/**
 * Short, non-blocking feedback ("Saved", "Couldn't reach the server"). Use a toast for
 * outcomes the user doesn't need to act on; use `useConfirm` when they must decide.
 *
 *   const notify = useNotify();
 *   notify.success("Note saved");
 *   notify.error("Couldn't save", "Check your connection and try again.");
 */
export function useNotify() {
  const { toast } = useToast();

  return useMemo(() => {
    const show =
      (variant: "default" | "success" | "warning" | "danger") =>
      (label: string, description?: string): void => {
        toast.show({ variant, label, description });
      };

    return {
      info: show("default"),
      success: show("success"),
      warning: show("warning"),
      error: show("danger"),
    };
  }, [toast]);
}
