import { printError } from "@/ui/console";
import type { PrintResult } from "@/types/file";
import { getAllResults, getLatestArenaResult, getResultForName } from "@/lib/files";
import { marked } from "marked";
import { markedTerminal } from 'marked-terminal';

// Configure marked with terminal renderer
// @ts-expect-error Invalid Plguin type, but works correctly
marked.use(markedTerminal());

function printResult(result: PrintResult): void {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📄 ${result.title}`);
    console.log('='.repeat(60));
    console.log(marked.parse(result.content));
}

export async function print(target?: string): Promise<void> {
    if (!target) {
        // Print all results followed by arena
        const allResults = await getAllResults();
        const arenaResult = await getLatestArenaResult();
        
        if (allResults.length === 0 && !arenaResult) {
            printError("No results found. Run 'applch check' and 'applch arena' first.");
            return;
        }
        
        for (const result of allResults) {
            printResult(result);
        }
        if (arenaResult) {
            printResult(arenaResult);
        }
    } else if (target.toLowerCase() === "arena") {
        const result = await getLatestArenaResult();
        if (!result) {
            printError("No arena results found. Run 'applch arena' first.");
            return;
        }
        printResult(result);
    } else {
        const result = await getResultForName(target);
        if (!result) {
            printError(`No results found for "${target}". Run 'applch check "${target}"' first.`);
            return;
        }
        printResult(result);
    }
}
