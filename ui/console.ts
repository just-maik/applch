// ============================================================================
// Console-style helpers for non-interactive use
// ============================================================================

export function printSuccess(message: string): void {
  console.log(`\x1b[32m✓\x1b[0m ${message}`);
}

export function printError(message: string): void {
  console.log(`\x1b[31m✗\x1b[0m ${message}`);
}

export function printWarning(message: string): void {
  console.log(`\x1b[33m⚠\x1b[0m ${message}`);
}

export function printInfo(message: string): void {
  console.log(`\x1b[34mℹ\x1b[0m ${message}`);
}
