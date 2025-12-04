import { Box, Text } from "ink";
import { colors } from "@/ui/colors";

export function Divider(): React.ReactElement {
  return (
    <Box marginY={1}>
      <Text color={colors.muted}>{"─".repeat(50)}</Text>
    </Box>
  );
}
