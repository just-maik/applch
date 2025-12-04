import { mkdir, writeFile, exists } from "fs/promises";
import { getDataDir, getResultsDir, getArenaResultsDir, getNamesPath, getEnvPath, getConfigPath } from "@/lib/paths";
// @ts-expect-error doesnt know Markdown
import README from "@/README.md" assert { type: "text" };

export async function ensureSetup() {
  const directories = [getDataDir(), getResultsDir(), getArenaResultsDir()];

  // Create directories
  for (const dirPath of directories) {
    if (!(await exists(dirPath))) {
      await mkdir(dirPath, { recursive: true });
    }
  }

  // Create data/names.json with empty array
  const namesJsonPath = getNamesPath();
  if (!(await exists(namesJsonPath))) {
    await writeFile(namesJsonPath, JSON.stringify([], null, 2));
  }

  // Create .env file
  const envPath = getEnvPath();
  if (!(await exists(envPath))) {
    const envContent = `# Add your environment variables here
PERPLEXITY_API_KEY=your_key_here
`;
    await writeFile(envPath, envContent);
  }

  // Create config file
  const configPath = getConfigPath();
  if (!(await exists(configPath))) {
    await writeFile(configPath, "{}", { encoding: "utf-8" });
  }

  // Copy README.md to root if not exists
  if (!(await exists("README.md"))) {
    await writeFile("README.md", README); 
  }
}
