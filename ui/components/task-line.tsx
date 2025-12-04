import { Box, Text } from "ink";
import { colors } from "@/ui/colors";
import type { TaskItem } from "@/ui/constants";
import { TaskStatusIcon } from "./task-status-icon";

interface TaskLineProps {
  task: TaskItem;
}

export function TaskLine({ task }: TaskLineProps): React.ReactElement {
  const statusColor = {
    pending: colors.muted,
    running: colors.info,
    success: colors.success,
    error: colors.error,
    warning: colors.warning,
  }[task.status];

  return (
    <Box gap={1}>
      <TaskStatusIcon status={task.status} />
      <Text color={statusColor}>{task.label}</Text>
      {task.message && (
        <Text color={colors.muted} dimColor>
          {task.message}
        </Text>
      )}
    </Box>
  );
}
