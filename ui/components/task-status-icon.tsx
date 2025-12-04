import { Text } from "ink";
import { Spinner } from "@inkjs/ui";
import { colors } from "@/ui/colors";
import type { TaskStatus } from "@/ui/constants";

interface TaskStatusIconProps {
  status: TaskStatus;
}

export function TaskStatusIcon({ status }: TaskStatusIconProps): React.ReactElement {
  switch (status) {
    case "pending":
      return <Text color={colors.muted}>○</Text>;
    case "running":
      return <Spinner type="dots" />;
    case "success":
      return <Text color={colors.success}>✓</Text>;
    case "error":
      return <Text color={colors.error}>✗</Text>;
    case "warning":
      return <Text color={colors.warning}>⚠</Text>;
  }
}
