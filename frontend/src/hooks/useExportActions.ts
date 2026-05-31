import { useCallback, useState } from "react";
import { getExportErrorMessage } from "../lib/export-reports";

export function useFlashNotice() {
  const [message, setMessage] = useState<string | null>(null);
  const [severity, setSeverity] = useState<"success" | "error">("success");

  const showSuccess = useCallback((text: string) => {
    setSeverity("success");
    setMessage(text);
  }, []);

  const showError = useCallback((text: string) => {
    setSeverity("error");
    setMessage(text);
  }, []);

  const dismiss = useCallback(() => {
    setMessage(null);
  }, []);

  return { message, severity, showSuccess, showError, dismiss };
}

export function useExportActions(showError: (message: string) => void) {
  const run = useCallback(
    (action: () => void) => {
      try {
        action();
      } catch (error) {
        showError(getExportErrorMessage(error));
      }
    },
    [showError],
  );

  return run;
}
