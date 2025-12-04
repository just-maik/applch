import { readFile, mkdir, writeFile } from "fs/promises";
import { join } from "path";
import {
    getResultsDir,
    getArenaResultsDir,
} from "@/lib/paths";

import { getClient } from "@/lib/client"
import { getDateStamp, nameToFolderName, stripThinkingSection } from "@/lib/utils";
import { loadNames, loadRequirements, loadResults } from "@/lib/files";
import { buildArenaPrompt } from "@/prompts/arena";
import type { CandidateResult } from "@/types/candidateResult";
import { config } from "@/lib/config";
import { printError, printInfo, printWarning } from "@/ui/console";
import { createArenaRenderer } from "@/ui/ArenaUI";

async function runArenaAnalysis(
    candidates: CandidateResult[],
    requirements?: string | null
): Promise<string | null> {
    const client = getClient();
    const prompt = buildArenaPrompt(candidates, requirements);

    try {
        const completion = await client.chat.completions.create({
            model: config.arenaModel,
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            web_search_options:{
                search_type: config.arenaProSearch ? "pro" : "fast"
            }
        });

        const message = completion.choices?.[0]?.message;
        let responseText = "";

        if (message?.content) {
            if (typeof message.content === "string") {
                responseText = message.content;
            } else if (Array.isArray(message.content)) {
                responseText = message.content
                    .filter(
                        (chunk): chunk is { type: "text"; text: string } =>
                            chunk.type === "text"
                    )
                    .map((chunk) => chunk.text)
                    .join("\n");
            }
        }

        return responseText;
    } catch (error) {
        console.error("Error running arena analysis:", error);
        return null;
    }
}

export async function arena(names?: string[]): Promise<void> {
    // Ensure arena results directory exists
    await mkdir(getArenaResultsDir(), { recursive: true });

    // Load requirements if available
    const requirements = await loadRequirements();
    if (requirements) {
        printInfo("Loaded job requirements from REQUIREMENTS.md");
    }

    // If no names provided via CLI, load from names.json
    if (!names || names.length === 0) {
        try {
            names = await loadNames();
            printInfo(`Loaded ${names.length} name(s) from names.json`);
        } catch {
            printError("No names provided and could not read names.json");
            return;
        }
    }

    if (!names || names.length === 0) {
        printWarning("No names provided. Please specify names or populate names.json");
        return;
    }

    if (names.length < 1) {
        printWarning("Arena requires at least 1 candidate to analyze.");
        return;
    }

    // Create candidates list for UI
    const candidatesList = names.map((name) => ({
        name,
        folderName: nameToFolderName(name),
    }));

    // Start the UI renderer
    const ui = createArenaRenderer();
    ui.start(candidatesList, !!requirements);

    // Load results
    const { results: candidates, missing } = await loadResults(names);
    ui.updateLoaded(candidates.length, missing);

    if (candidates.length === 0) {
        ui.complete(undefined, "No results found. Run 'applch check' first.");
        return;
    }

    // Start analysis
    ui.startAnalysis();

    const result = await runArenaAnalysis(candidates, requirements);

    if (!result) {
        ui.complete(undefined, "Failed to generate arena analysis.");
        return;
    }

    // Generate output filename
    const outputFilename = `arena-${getDateStamp()}.md`;
    const outputPath = join(getArenaResultsDir(), outputFilename);

    const cleanedResult = stripThinkingSection(result);
    await writeFile(outputPath, cleanedResult);
    ui.complete(outputPath);
}
