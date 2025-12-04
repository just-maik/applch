import React from "react";
import { render, Box } from "ink";
import { Spinner, StatusMessage } from "@inkjs/ui";

// ============================================================================
// SIMPLE STATUS DISPLAY (for quick messages)
// ============================================================================

type StatusVariant = "info" | "success" | "warning" | "error";

interface SimpleStatusProps {
  message: string;
  variant: StatusVariant;
  showSpinner?: boolean;
}

function SimpleStatus({ message, variant, showSpinner }: SimpleStatusProps): React.ReactElement {
  return (
    <Box padding={1} gap={1}>
      {showSpinner && <Spinner type="dots" />}
      <StatusMessage variant={variant}>{message}</StatusMessage>
    </Box>
  );
}

// ============================================================================
// RENDER FUNCTION
// ============================================================================

export async function renderSimpleStatus(
  message: string,
  variant: StatusVariant,
  showSpinner = false,
  duration = 2000
): Promise<void> {
  return new Promise((resolve) => {
    const { unmount } = render(
      <SimpleStatus message={message} variant={variant} showSpinner={showSpinner} />
    );
    setTimeout(() => {
      unmount();
      resolve();
    }, duration);
  });
}
