import React, { useState, useEffect } from "react";
import { render, Box } from "ink";
import { Badge, StatusMessage } from "@inkjs/ui";
import type { TaskItem, TaskStatus } from "@/ui/constants";
import { Header } from "@/components/header";
import { TaskLine } from "@/components/task-line";
import { Divider } from "@/components/divider";

// ============================================================================
// BOOTSTRAP UI COMPONENT
// ============================================================================

interface BootstrapUIProps {
  applicants: string[];
  onComplete: () => void;
  createFolder: (name: string) => Promise<{ success: boolean; path: string; error?: Error }>;
}

function BootstrapUI({ applicants, onComplete, createFolder }: BootstrapUIProps): React.ReactElement {
  const [tasks, setTasks] = useState<TaskItem[]>(
    applicants.map((name) => ({
      id: name,
      label: name,
      status: "pending" as TaskStatus,
    }))
  );
  const [completed, setCompleted] = useState(false);
  const [stats, setStats] = useState({ success: 0, error: 0 });

  useEffect(() => {
    async function run(): Promise<void> {
      for (let i = 0; i < applicants.length; i++) {
        const name = applicants[i]!;
        setTasks((prev: TaskItem[]) =>
          prev.map((t: TaskItem) => (t.id === name ? { ...t, status: "running" as TaskStatus } : t))
        );

        const result = await createFolder(name);

        setTasks((prev: TaskItem[]) =>
          prev.map((t: TaskItem) =>
            t.id === name
              ? {
                  ...t,
                  status: (result.success ? "success" : "error") as TaskStatus,
                  message: result.success ? result.path : result.error?.message,
                }
              : t
          )
        );

        setStats((prev: { success: number; error: number }) => ({
          success: prev.success + (result.success ? 1 : 0),
          error: prev.error + (result.success ? 0 : 1),
        }));
      }
      setCompleted(true);
    }
    run();
  }, [applicants, createFolder]);

  useEffect(() => {
    if (completed) {
      setTimeout(onComplete, 100);
    }
  }, [completed, onComplete]);

  return (
    <Box flexDirection="column" padding={1}>
      <Header title="Bootstrap" subtitle="Creating folders for applicants" />

      <Box flexDirection="column" marginBottom={1}>
        {tasks.map((task) => (
          <TaskLine key={task.id} task={task} />
        ))}
      </Box>

      {completed && (
        <Box flexDirection="column" marginTop={1}>
          <Divider />
          <Box gap={2}>
            <Badge color="green">{stats.success} Created</Badge>
            {stats.error > 0 && <Badge color="red">{stats.error} Failed</Badge>}
          </Box>
          <Box marginTop={1}>
            <StatusMessage variant="success">Bootstrap complete!</StatusMessage>
          </Box>
        </Box>
      )}
    </Box>
  );
}

// ============================================================================
// RENDER FUNCTION
// ============================================================================

export async function renderBootstrap(
  applicants: string[],
  createFolder: (name: string) => Promise<{ success: boolean; path: string; error?: Error }>
): Promise<void> {
  return new Promise((resolve) => {
    const { unmount } = render(
      <BootstrapUI
        applicants={applicants}
        createFolder={createFolder}
        onComplete={() => {
          unmount();
          resolve();
        }}
      />
    );
  });
}
