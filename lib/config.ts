import type { Config } from "@/types/config";
import { loadConfig } from "@/lib/files";

export const defaultConfig: Config = {
    checkModel: "sonar-reasoning-pro",
    checkProSearch: false,
    arenaModel: "sonar-reasoning-pro",
    arenaProSearch: false,
}

export const config = { ...defaultConfig, ...(await loadConfig()) }
