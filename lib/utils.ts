import type { MimeType } from "@/types/file";

// Helper to convert name to folder name
export function nameToFolderName(name: string): string {
    return name.toLowerCase().replace(/\s+/g, "-");
}

// Helper to convert folder name back to display name
export function folderNameToDisplayName(folderName: string): string {
    return folderName
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

// Helper to strip thinking sections from AI responses
export function stripThinkingSection(text: string): string {
    // Remove <think>...</think> sections (including multiline)
    return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

// Get current date in ISO format (YYYY-MM-DD)
export function getDateStamp(): string {
    return new Date().toISOString().split("T")[0] ?? "";
}

// Get MIME type for a file path
export function getMimeType(filePath: string): MimeType {
    const lowerPath = filePath.toLowerCase();
    if (lowerPath.endsWith(".pdf")) return "application/pdf";
    if (lowerPath.endsWith(".png")) return "image/png";
    if (lowerPath.endsWith(".webp")) return "image/webp";
    return "image/jpeg";
}

export function parseNames(args: string[] | undefined): string[] | undefined {
  if (!args || args.length === 0) return undefined;
  // Support both space-separated and comma-separated names
  const names = args.flatMap((arg) =>
    arg.split(",").map((name) => name.trim()).filter(Boolean)
  );
  return names.length > 0 ? names : undefined;
}