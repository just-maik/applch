import React, { useState, useEffect } from "react";
import { render, Box, Text } from "ink";
import { Badge, StatusMessage, ProgressBar } from "@inkjs/ui";
import { colors } from "@/ui/colors";
import type { CheckProgress, TaskStatus } from "@/ui/constants";
import { config } from "@/lib/config";
import { Header } from "@/components/header";
import { Divider } from "@/components/divider";
import { TaskStatusIcon } from "@/components/task-status-icon";

// ============================================================================
// CHECK UI COMPONENT (with progress bars)
// ============================================================================

interface CheckUIProps {
  applicants: CheckProgress[];
  onComplete: () => void;
  runCheck: (
    folderName: string
  ) => Promise<{ success: boolean; filesCount: number; error?: string }>;
  hasRequirements: boolean;
}

function CheckUI({ applicants, onComplete, runCheck, hasRequirements }: CheckUIProps): React.ReactElement {
  const [checks, setChecks] = useState<CheckProgress[]>(
    applicants.map((a) => ({ ...a, status: "pending" as TaskStatus }))
  );
  const [completedCount, setCompletedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [stats, setStats] = useState({ success: 0, error: 0, skipped: 0 });

  const progress = applicants.length > 0 ? completedCount / applicants.length : 0;

  useEffect(() => {
    async function runAllChecks(): Promise<void> {
      // Run all checks in parallel
      const promises = applicants.map(async (applicant) => {
        setChecks((prev: CheckProgress[]) =>
          prev.map((c: CheckProgress) =>
            c.folderName === applicant.folderName ? { ...c, status: "running" as TaskStatus } : c
          )
        );

        const result = await runCheck(applicant.folderName);

        setChecks((prev: CheckProgress[]) =>
          prev.map((c: CheckProgress) =>
            c.folderName === applicant.folderName
              ? {
                  ...c,
                  status: (result.success
                    ? "success"
                    : result.filesCount === 0
                    ? "warning"
                    : "error") as TaskStatus,
                  filesCount: result.filesCount,
                  message: result.error,
                }
              : c
          )
        );

        setCompletedCount((prev: number) => prev + 1);

        if (result.success) {
          setStats((prev: { success: number; error: number; skipped: number }) => ({ ...prev, success: prev.success + 1 }));
        } else if (result.filesCount === 0) {
          setStats((prev: { success: number; error: number; skipped: number }) => ({ ...prev, skipped: prev.skipped + 1 }));
        } else {
          setStats((prev: { success: number; error: number; skipped: number }) => ({ ...prev, error: prev.error + 1 }));
        }
      });

      await Promise.allSettled(promises);
      setIsComplete(true);
    }

    runAllChecks();
  }, [applicants, runCheck]);

  useEffect(() => {
    if (isComplete) {
      setTimeout(onComplete, 100);
    }
  }, [isComplete, onComplete]);

  return (
    <Box flexDirection="column" padding={1}>
      <Header
        title="Background Checks"
        subtitle={`Model: ${config.checkModel} | Pro Search: ${config.checkProSearch ? "on" : "off"} | Requirements: ${hasRequirements ? "loaded" : "none"}`}
      />

      {/* Progress Bar */}
      <Box marginBottom={1} flexDirection="column">
        <Box gap={1} marginBottom={1}>
          <Text color={colors.info}>Progress:</Text>
          <Text color={colors.muted}>
            {completedCount}/{applicants.length}
          </Text>
        </Box>
        <Box width={50}>
          <ProgressBar value={Math.round(progress * 100)} />
        </Box>
      </Box>

      <Divider />

      {/* Task List */}
      <Box flexDirection="column" marginBottom={1}>
        {checks.map((check) => (
          <Box key={check.folderName} gap={1}>
            <TaskStatusIcon status={check.status} />
            <Text
              color={
                check.status === "success"
                  ? colors.success
                  : check.status === "error"
                  ? colors.error
                  : check.status === "warning"
                  ? colors.warning
                  : check.status === "running"
                  ? colors.info
                  : colors.muted
              }
            >
              {check.name}
            </Text>
            {check.filesCount !== undefined && check.status !== "pending" && (
              <Text color={colors.muted} dimColor>
                ({check.filesCount} file{check.filesCount !== 1 ? "s" : ""})
              </Text>
            )}
            {check.message && (
              <Text color={colors.muted} dimColor>
                - {check.message}
              </Text>
            )}
          </Box>
        ))}
      </Box>

      {/* Completion Summary */}
      {isComplete && (
        <Box flexDirection="column" marginTop={1}>
          <Divider />
          <Box gap={2} marginBottom={1}>
            <Badge color="green">{stats.success} Completed</Badge>
            {stats.skipped > 0 && <Badge color="yellow">{stats.skipped} Skipped</Badge>}
            {stats.error > 0 && <Badge color="red">{stats.error} Failed</Badge>}
          </Box>
          {stats.error > 0 || stats.skipped > 0 ? (
            <StatusMessage variant="warning">
              Check complete with {stats.error + stats.skipped} issue(s)
            </StatusMessage>
          ) : (
            <StatusMessage variant="success">
              All background checks completed successfully!
            </StatusMessage>
          )}
        </Box>
      )}
    </Box>
  );
}

// ============================================================================
// RENDER FUNCTION
// ============================================================================

export async function renderCheck(
  applicants: { name: string; folderName: string }[],
  runCheck: (
    folderName: string
  ) => Promise<{ success: boolean; filesCount: number; error?: string }>,
  hasRequirements: boolean
): Promise<void> {
  return new Promise((resolve) => {
    const checkProgress: CheckProgress[] = applicants.map((a) => ({
      name: a.name,
      folderName: a.folderName,
      status: "pending",
    }));

    const { unmount } = render(
      <CheckUI
        applicants={checkProgress}
        runCheck={runCheck}
        hasRequirements={hasRequirements}
        onComplete={() => {
          unmount();
          resolve();
        }}
      />
    );
  });
}
