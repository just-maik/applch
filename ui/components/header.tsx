import { Box, Text } from "ink";
import { colors } from "@/ui/colors";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps): React.ReactElement {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text bold color={colors.primary}>
          ◆ {title}
        </Text>
      </Box>
      {subtitle && (
        <Text color={colors.muted} dimColor>
          {subtitle}
        </Text>
      )}
    </Box>
  );
}