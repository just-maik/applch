import React, { useState, useEffect } from "react";
import { render, Box, Text } from "ink";
import { Spinner, StatusMessage, Alert } from "@inkjs/ui";
import { colors } from "@/ui/colors";
import { config } from "@/lib/config";
import { Divider } from "@/components/divider";
import { Header } from "@/components/header";

// ============================================================================
// ARENA UI COMPONENT
// ============================================================================

interface ArenaUIProps {
  candidates: { name: string; folderName: string }[];
  loadedCount: number;
  missingCandidates: string[];
  isAnalyzing: boolean;
  isComplete: boolean;
  outputPath?: string;
  error?: string;
  hasRequirements: boolean;
}

function ArenaUI({
  candidates,
  loadedCount,
  missingCandidates,
  isAnalyzing,
  isComplete,
  outputPath,
  error,
  hasRequirements,
}: ArenaUIProps): React.ReactElement {
  return (
    <Box flexDirection="column" padding={1}>
      <Header
        title="Candidate Arena"
        subtitle={`Model: ${config.arenaModel} | Pro Search: ${config.arenaProSearch ? "on" : "off"} | Requirements: ${hasRequirements ? "loaded" : "none"}`}
      />

      {/* Loading Results Phase */}
      <Box marginBottom={1} flexDirection="column">
        <Box gap={1}>
          {loadedCount < candidates.length && !isAnalyzing && !isComplete ? (
            <Spinner type="dots" />
          ) : (
            <Text color={colors.success}>✓</Text>
          )}
          <Text color={colors.info}>
            Loading results: {loadedCount}/{candidates.length}
          </Text>
        </Box>

        {missingCandidates.length > 0 && (
          <Box marginTop={1} flexDirection="column">
            <Alert variant="warning">
              Missing results for: {missingCandidates.join(", ")}
            </Alert>
          </Box>
        )}
      </Box>

      {/* Analysis Phase */}
      {(isAnalyzing || isComplete) && (
        <>
          <Divider />
          <Box gap={1} marginBottom={1}>
            {isAnalyzing && !isComplete ? (
              <>
                <Spinner type="dots" />
                <Text color={colors.info}>Running arena analysis...</Text>
              </>
            ) : isComplete && !error ? (
              <>
                <Text color={colors.success}>✓</Text>
                <Text color={colors.success}>Analysis complete</Text>
              </>
            ) : (
              <>
                <Text color={colors.error}>✗</Text>
                <Text color={colors.error}>Analysis failed</Text>
              </>
            )}
          </Box>
        </>
      )}

      {/* Completion */}
      {isComplete && (
        <Box flexDirection="column" marginTop={1}>
          <Divider />
          {error ? (
            <StatusMessage variant="error">{error}</StatusMessage>
          ) : outputPath ? (
            <Box flexDirection="column" gap={1}>
              <StatusMessage variant="success">Arena analysis saved!</StatusMessage>
              <Box marginTop={1}>
                <Text color={colors.muted}>Output: </Text>
                <Text color={colors.accent}>{outputPath}</Text>
              </Box>
            </Box>
          ) : null}
        </Box>
      )}
    </Box>
  );
}

// ============================================================================
// ARENA RENDERER FACTORY
// ============================================================================

interface ArenaRenderer {
  start: (candidates: { name: string; folderName: string }[], hasRequirements: boolean) => void;
  updateLoaded: (count: number, missing: string[]) => void;
  startAnalysis: () => void;
  complete: (outputPath?: string, error?: string) => void;
  unmount: () => void;
}

export function createArenaRenderer(): ArenaRenderer {
  let updateState: ((state: Partial<ArenaUIProps>) => void) | null = null;
  let unmountFn: (() => void) | null = null;

  const state: ArenaUIProps = {
    candidates: [],
    loadedCount: 0,
    missingCandidates: [],
    isAnalyzing: false,
    isComplete: false,
    hasRequirements: false,
  };

  function ArenaWrapper(): React.ReactElement {
    const [localState, setLocalState] = useState(state);

    useEffect(() => {
      updateState = (newState: Partial<ArenaUIProps>) => {
        Object.assign(state, newState);
        setLocalState({ ...state });
      };
      return () => {
        updateState = null;
      };
    }, []);

    return <ArenaUI {...localState} />;
  }

  return {
    start(candidates: { name: string; folderName: string }[], hasRequirements: boolean) {
      state.candidates = candidates;
      state.hasRequirements = hasRequirements;
      const { unmount } = render(<ArenaWrapper />);
      unmountFn = unmount;
    },
    updateLoaded(count: number, missing: string[]) {
      updateState?.({ loadedCount: count, missingCandidates: missing });
    },
    startAnalysis() {
      updateState?.({ isAnalyzing: true });
    },
    complete(outputPath?: string, error?: string) {
      updateState?.({ isComplete: true, isAnalyzing: false, outputPath, error });
      setTimeout(() => unmountFn?.(), 100);
    },
    unmount() {
      unmountFn?.();
    },
  };
}
