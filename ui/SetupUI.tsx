import React, { useState, useEffect } from "react";
import { render, Box } from "ink";
import { StatusMessage } from "@inkjs/ui";
import type { TaskItem } from "@/ui/constants";
import { Header } from "@/components/header";
import { TaskLine } from "@/components/task-line";

// ============================================================================
// SETUP UI COMPONENT
// ============================================================================

interface SetupUIProps {
  tasks: TaskItem[];
  isComplete: boolean;
}

function SetupUI({ tasks, isComplete }: SetupUIProps): React.ReactElement {
  return (
    <Box flexDirection="column" padding={1}>
      <Header title="Setup" subtitle="Initializing workspace" />

      <Box flexDirection="column" marginBottom={1}>
        {tasks.map((task) => (
          <TaskLine key={task.id} task={task} />
        ))}
      </Box>

      {isComplete && (
        <Box marginTop={1}>
          <StatusMessage variant="success">Setup complete!</StatusMessage>
        </Box>
      )}
    </Box>
  );
}

// ============================================================================
// SETUP RENDERER FACTORY
// ============================================================================

interface SetupRenderer {
  start: () => void;
  updateTasks: (tasks: TaskItem[]) => void;
  complete: () => void;
  unmount: () => void;
}

export function createSetupRenderer(): SetupRenderer {
  let updateTasks: ((tasks: TaskItem[]) => void) | null = null;
  let setComplete: ((complete: boolean) => void) | null = null;
  let unmountFn: (() => void) | null = null;

  function SetupWrapper(): React.ReactElement {
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
      updateTasks = setTasks;
      setComplete = setIsComplete;
      return () => {
        updateTasks = null;
        setComplete = null;
      };
    }, []);

    return <SetupUI tasks={tasks} isComplete={isComplete} />;
  }

  return {
    start() {
      const { unmount } = render(<SetupWrapper />);
      unmountFn = unmount;
    },
    updateTasks(tasks: TaskItem[]) {
      updateTasks?.(tasks);
    },
    complete() {
      setComplete?.(true);
      setTimeout(() => unmountFn?.(), 500);
    },
    unmount() {
      unmountFn?.();
    },
  };
}
