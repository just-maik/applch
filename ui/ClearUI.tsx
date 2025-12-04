import React, { useState, useEffect } from "react";
import { render, Box } from "ink";
import { Badge, StatusMessage, ConfirmInput } from "@inkjs/ui";
import type { TaskItem, TaskStatus } from "@/ui/constants";
import { Divider } from "@/components/divider";
import { TaskLine } from "@/components/task-line";
import { Header } from "@/components/header";

// ============================================================================
// CLEAR UI COMPONENT
// ============================================================================

interface ClearUIProps {
  onComplete: () => void;
  onCancel: () => void;
  performClear: () => Promise<{ dataCleared: boolean; resultsCleared: boolean; error?: string }>;
}

function ClearUI({ onComplete, onCancel, performClear }: ClearUIProps): React.ReactElement {
  const [confirmed, setConfirmed] = useState<boolean | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: "data", label: "Clear data folder", status: "pending" },
    { id: "results", label: "Clear results folder", status: "pending" },
    { id: "reinit", label: "Reinitialize workspace", status: "pending" },
  ]);
  const [isComplete, setIsComplete] = useState(false);
  const [stats, setStats] = useState({ success: 0, error: 0 });

  useEffect(() => {
    if (confirmed === true) {
      runClear();
    } else if (confirmed === false) {
      onCancel();
    }
  }, [confirmed]);

  async function runClear(): Promise<void> {
    // Clear data folder
    setTasks((prev: TaskItem[]) =>
      prev.map((t: TaskItem) => (t.id === "data" ? { ...t, status: "running" as TaskStatus } : t))
    );

    const result = await performClear();

    // Update data task
    setTasks((prev: TaskItem[]) =>
      prev.map((t: TaskItem) =>
        t.id === "data"
          ? { ...t, status: (result.dataCleared ? "success" : "error") as TaskStatus }
          : t
      )
    );
    setStats((prev) => ({
      success: prev.success + (result.dataCleared ? 1 : 0),
      error: prev.error + (result.dataCleared ? 0 : 1),
    }));

    // Update results task
    setTasks((prev: TaskItem[]) =>
      prev.map((t: TaskItem) =>
        t.id === "results"
          ? { ...t, status: (result.resultsCleared ? "success" : "error") as TaskStatus }
          : t
      )
    );
    setStats((prev) => ({
      success: prev.success + (result.resultsCleared ? 1 : 0),
      error: prev.error + (result.resultsCleared ? 0 : 1),
    }));

    // Reinitialize
    setTasks((prev: TaskItem[]) =>
      prev.map((t: TaskItem) => (t.id === "reinit" ? { ...t, status: "running" as TaskStatus } : t))
    );

    // Small delay to show the reinit step
    await new Promise((resolve) => setTimeout(resolve, 100));

    setTasks((prev: TaskItem[]) =>
      prev.map((t: TaskItem) =>
        t.id === "reinit" ? { ...t, status: "success" as TaskStatus } : t
      )
    );
    setStats((prev) => ({ ...prev, success: prev.success + 1 }));

    setIsComplete(true);
  }

  useEffect(() => {
    if (isComplete) {
      setTimeout(onComplete, 100);
    }
  }, [isComplete, onComplete]);

  return (
    <Box flexDirection="column" padding={1}>
      <Header title="Clear Workspace" subtitle="Remove all data and results (keeps .env)" />

      {confirmed === null && (
        <Box flexDirection="column" marginBottom={1}>
          <Box gap={1}>
            <StatusMessage variant="warning">
              This will delete all applicant folders and results!
            </StatusMessage>
          </Box>
          <Box marginTop={1} gap={1}>
            <ConfirmInput
              onConfirm={() => setConfirmed(true)}
              onCancel={() => setConfirmed(false)}
            />
          </Box>
        </Box>
      )}

      {confirmed === true && (
        <>
          <Box flexDirection="column" marginBottom={1}>
            {tasks.map((task) => (
              <TaskLine key={task.id} task={task} />
            ))}
          </Box>

          {isComplete && (
            <Box flexDirection="column" marginTop={1}>
              <Divider />
              <Box gap={2} marginBottom={1}>
                <Badge color="green">{stats.success} Completed</Badge>
                {stats.error > 0 && <Badge color="red">{stats.error} Failed</Badge>}
              </Box>
              <StatusMessage variant="success">Workspace cleared and reinitialized!</StatusMessage>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

// ============================================================================
// RENDER FUNCTION
// ============================================================================

export async function renderClear(
  performClear: () => Promise<{ dataCleared: boolean; resultsCleared: boolean; error?: string }>
): Promise<boolean> {
  return new Promise((resolve) => {
    const { unmount } = render(
      <ClearUI
        performClear={performClear}
        onComplete={() => {
          unmount();
          resolve(true);
        }}
        onCancel={() => {
          unmount();
          resolve(false);
        }}
      />
    );
  });
}
