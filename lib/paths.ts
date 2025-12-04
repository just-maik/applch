import { join } from "path";

// Base directories
export const getDataDir = () => join(process.cwd(), "data");
export const getResultsDir = () => join(process.cwd(), "results");
export const getArenaResultsDir = () => join(process.cwd(), "results", "arena");

// Specific files
export const getNamesPath = () => join(getDataDir(), "names.json");
export const getRequirementsPath = () => join(process.cwd(), "REQUIREMENTS.md");
export const getEnvPath = () => join(process.cwd(), ".env");
export const getConfigPath = () => join(process.cwd(), "config.json");