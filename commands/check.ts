import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { folderNameToDisplayName, nameToFolderName, stripThinkingSection, getMimeType } from "@/lib/utils";
import { getDataDir, getResultsDir } from "@/lib/paths";
import { getClient } from "@/lib/client";
import { getFilesFromFolder, loadNames, loadRequirements } from "@/lib/files";
import { buildBackgroundCheckPrompt } from "@/prompts/check";
import { config } from "@/lib/config";
import { printError, printInfo, printWarning } from "@/ui/console";
import { renderCheck } from "@/ui/CheckUI";

async function runBackgroundCheck(applicantFolder: string, requirements?: string | null): Promise<{ success: boolean; filesCount: number; error?: string }> {
    const client = getClient();
    const folderPath = join(getDataDir(), applicantFolder);
    const files = await getFilesFromFolder(folderPath);

    if (files.length === 0) {
        return { success: false, filesCount: 0, error: "No PDF, image, or text files found" };
    }

    const applicantName = folderNameToDisplayName(applicantFolder);

    const fileNames = files.map((f) => f.name);
    
    // Build text content from .txt and .md files to include in the prompt
    const textFiles = files.filter((f) => f.type === "text");
    let textContent = "";
    if (textFiles.length > 0) {
        textContent = "\n\n## Text Documents Content:\n";
        for (const textFile of textFiles) {
            textContent += `\n### ${textFile.name}:\n\`\`\`\n${textFile.data.toString("utf-8")}\n\`\`\`\n`;
        }
    }
    
    const prompt = buildBackgroundCheckPrompt(applicantName, fileNames, requirements) + textContent;

    const content: Array<
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
        | { type: "file_url"; file_url: { url: string }; file_name?: string }
    > = [
            {
                type: "text",
                text: prompt,
            },
        ];

    // Only add non-text files as attachments
    for (const file of files) {
        if (file.type === "image") {
            // Images use data URI format: data:image/png;base64,<BASE64_ENCODED_IMAGE>
            const mimeType = getMimeType(file.path);
            const base64Data = file.data.toString("base64");
            content.push({
                type: "image_url",
                image_url: {
                    url: `data:${mimeType};base64,${base64Data}`,
                },
            });
        } else if (file.type === "pdf") {
            // Documents (PDF, DOC, etc.) use base64 bytes without prefix
            const base64Data = file.data.toString("base64");
            content.push({
                type: "file_url",
                file_url: {
                    url: base64Data,
                },
                file_name: file.name,
            });
        }
        // Text files are already included in the prompt, so skip them here
    }

    try {
        const completion = await client.chat.completions.create({
            model: config.checkModel,
            messages: [
                {
                    role: "user",
                    content: content as any,
                },
            ],
            web_search_options:{
                search_type: config.checkProSearch ? "pro" : "fast"
            }
        });

        const message = completion.choices?.[0]?.message;
        let responseText = "";

        if (message?.content) {
            if (typeof message.content === "string") {
                responseText = message.content;
            } else if (Array.isArray(message.content)) {
                // Extract text from content array
                responseText = message.content
                    .filter((chunk): chunk is { type: "text"; text: string } => chunk.type === "text")
                    .map((chunk) => chunk.text)
                    .join("\n");
            }
        }

        const resultsDir = getResultsDir();
        await mkdir(resultsDir, { recursive: true });

        const outputPath = join(resultsDir, `${applicantFolder}.md`);
        const cleanedResponse = stripThinkingSection(responseText);
        await writeFile(outputPath, cleanedResponse);

        return { success: true, filesCount: files.length };
    } catch (error) {
        return { success: false, filesCount: files.length, error: String(error) };
    }
}

export async function check(names?: string[]): Promise<void> {
    // Ensure results directory exists before parallel processing
    await mkdir(getResultsDir(), { recursive: true });

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
        } catch (error) {
            printError("Error reading names.json");
            return;
        }
    }

    if (!names || names.length === 0) {
        printWarning("No names provided via CLI and names.json is empty.");
        return;
    }

    // Process applicants from names list - create array of {name, folderName}
    const applicants = names.map((name) => ({
        name,
        folderName: nameToFolderName(name),
    }));

    await renderCheck(applicants, async (folderName: string) => {
        return await runBackgroundCheck(folderName, requirements);
    }, !!requirements);
}
