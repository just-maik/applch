import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { getDataDir, getNamesPath } from "@/lib/paths";
import { loadNames } from "@/lib/files";
import { nameToFolderName } from "@/lib/utils";
import { printInfo } from "@/ui/console";
import { renderBootstrap } from "@/ui/BootstrapUI";

export async function bootstrap(names?: string[]): Promise<void> {
  const dataDir = getDataDir();
  
  let applicants: string[];
  if (names && names.length > 0) {
    applicants = names;
    printInfo(`Using ${applicants.length} name(s) from command-line arguments`);
    await writeFile(getNamesPath(), JSON.stringify(applicants, null, 2));
    printInfo(`Saved ${applicants.length} name(s) to names.json for future runs`);
  } else {
    applicants = await loadNames();
    printInfo(`Loaded ${applicants.length} name(s) from names.json`);
  }

  if (applicants.length === 0) {
    printInfo("No applicants found. Add names to names.json or provide them as arguments.");
    return;
  }

  await renderBootstrap(applicants, async (name: string) => {
    const folderName = nameToFolderName(name);
    const folderPath = join(dataDir, folderName);

    try {
      await mkdir(folderPath, { recursive: true });
      return { success: true, path: folderPath };
    } catch (error) {
      return { success: false, path: folderPath, error: error as Error };
    }
  });
}
