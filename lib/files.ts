import { readFile, readdir } from "fs/promises";
import { join } from "path";
import { getArenaResultsDir, getConfigPath, getNamesPath, getRequirementsPath, getResultsDir } from "@/lib/paths";
import { PDF_EXTENSIONS, IMAGE_EXTENSIONS, TEXT_EXTENSIONS} from "@/lib/constants";
import type { CandidateResult } from "@/types/candidateResult";
import type { FileInfo, PrintResult } from "@/types/file";
import type { Config } from "@/types/config";
import { folderNameToDisplayName, nameToFolderName } from "@/lib/utils";

// Helper to load names from names.json
export async function loadNames(): Promise<string[]> {
    const namesData = await readFile(getNamesPath(), "utf-8");
    return JSON.parse(namesData) as string[];
}

// Helper to load requirements (returns null if not found)
export async function loadRequirements(): Promise<string | null> {
    try {
        const content = await readFile(getRequirementsPath(), "utf-8");
        return content;
    } catch {
        return null;
    }
}

// File info type

// Get files from a folder with type detection
export async function getFilesFromFolder(folderPath: string): Promise<FileInfo[]> {
    const files: FileInfo[] = [];

    try {
        const entries = await readdir(folderPath);

        for (const entry of entries) {
            const filePath = join(folderPath, entry);
            const lowerName = entry.toLowerCase();

            const isPdf = PDF_EXTENSIONS.some(ext => lowerName.endsWith(ext));
            const isImage = IMAGE_EXTENSIONS.some(ext => lowerName.endsWith(ext));
            const isText = TEXT_EXTENSIONS.some(ext => lowerName.endsWith(ext));

            if (isPdf) {
                const data = await readFile(filePath);
                files.push({ type: "pdf", path: filePath, name: entry, data });
            } else if (isImage) {
                const data = await readFile(filePath);
                files.push({ type: "image", path: filePath, name: entry, data });
            } else if (isText) {
                const data = await readFile(filePath);
                files.push({ type: "text", path: filePath, name: entry, data });
            }
        }
    } catch (error) {
        console.error(`Error reading folder ${folderPath}:`, error);
    }

    return files;
}

export async function loadResults(names: string[]): Promise<{ results: CandidateResult[]; missing: string[] }> {
    const resultsDir = getResultsDir();
    const results: CandidateResult[] = [];
    const missing: string[] = [];

    for (const name of names) {
        const folderName = name.toLowerCase().replace(/\s+/g, "-");
        const resultPath = join(resultsDir, `${folderName}.md`);

        try {
            const content = await readFile(resultPath, "utf-8");
            results.push({
                name,
                folderName,
                content,
            });
        } catch {
            missing.push(name);
        }
    }

    return { results, missing };
}

// Helper to load config from a JSON file
export async function loadConfig(): Promise<Partial<Config>> {
    try {
        const content = await readFile(getConfigPath(), "utf-8");
        return JSON.parse(content) as Config;
    } catch {
        return {};
    }
}

export async function getLatestArenaResult(): Promise<PrintResult | null> {
    try {
        const arenaDir = getArenaResultsDir();
        const files = await readdir(arenaDir);
        const arenaFiles = files.filter(f => f.startsWith("arena-") && f.endsWith(".md"));
        
        if (arenaFiles.length === 0) {
            return null;
        }
        
        // Sort by name (which includes date) to get the latest
        arenaFiles.sort().reverse();
        const latestFile = arenaFiles[0]!;
        const content = await readFile(join(arenaDir, latestFile), "utf-8");
        return { content, filename: latestFile, title: "Arena Results" };
    } catch {
        return null;
    }
}

export async function getResultForName(name: string): Promise<PrintResult | null> {
    try {
        const folderName = nameToFolderName(name);
        const resultPath = join(getResultsDir(), `${folderName}.md`);
        const content = await readFile(resultPath, "utf-8");
        return { content, filename: `${folderName}.md`, title: name };
    } catch {
        return null;
    }
}

export async function getAllResults(): Promise<PrintResult[]> {
    const results: PrintResult[] = [];
    
    try {
        const resultsDir = getResultsDir();
        const files = await readdir(resultsDir);
        const resultFiles = files.filter(f => f.endsWith(".md") && !f.startsWith("arena"));
        
        for (const file of resultFiles) {
            const content = await readFile(join(resultsDir, file), "utf-8");
            const folderName = file.replace(".md", "");
            const displayName = folderNameToDisplayName(folderName);
            results.push({ content, filename: file, title: displayName });
        }
    } catch {
        // No results directory
    }
    
    return results;
}


