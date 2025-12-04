import { rm, readdir } from "fs/promises";
import { join } from "path";
import { renderClear} from "@/ui/ClearUI";
import { ensureSetup } from "../lib/setup";
import { getDataDir, getResultsDir } from "@/lib/paths";
import { printWarning } from "@/ui/console";

export async function clear(): Promise<void> {
  const dataDir = getDataDir();
  const resultsDir = getResultsDir();

  const confirmed = await renderClear(async () => {
    let dataCleared = false;
    let resultsCleared = false;

    try {
      // Get all items in data folder except names.json (we'll recreate it)
      const dataItems = await readdir(dataDir).catch(() => []);
      for (const item of dataItems) {
        const itemPath = join(dataDir, item);
        await rm(itemPath, { recursive: true, force: true });
      }
      dataCleared = true;
    } catch {
      dataCleared = false;
    }

    try {
      // Clear results folder completely
      const resultsItems = await readdir(resultsDir).catch(() => []);
      for (const item of resultsItems) {
        const itemPath = join(resultsDir, item);
        await rm(itemPath, { recursive: true, force: true });
      }
      resultsCleared = true;
    } catch {
      resultsCleared = false;
    }

    // Reinitialize the workspace (recreates names.json, keeps .env)
    await ensureSetup();

    return { dataCleared, resultsCleared };
  });

  if (!confirmed) {
    printWarning("Clear cancelled.");
  }
}
