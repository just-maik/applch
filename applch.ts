#!/usr/bin/env bun
import { defineCommand, runMain } from "citty";
import { bootstrap } from "@/commands/bootstrap";
import { check } from "@/commands/check";
import { arena } from "@/commands/arena";
import { clear } from "@/commands/clear";
import { print } from "@/commands/print";
import { ensureSetup } from "@/lib/setup";
import { parseNames } from "@/lib/utils";

await ensureSetup();

export const bootstrapCommand = defineCommand({
  meta: {
    name: "bootstrap",
    description: "Create folders for applicants",
  },
  args: {
    names: {
      type: "positional",
      description: "Applicant names (optional, comma-separated or space-separated, uses index.json if not provided)",
      required: false,
    },
  },
  async run({ args }) {
    await ensureSetup();
    const names = parseNames(args._ as string[] | undefined);
    return bootstrap(names);
  },
});

export const checkCommand = defineCommand({
  meta: {
    name: "check",
    description: "Run background checks on applicants",
  },
  args: {
    names: {
      type: "positional",
      description: "Applicant names (optional, comma-separated or space-separated, checks all if not provided)",
      required: false,
    },
  },
  async run({ args }) {
    await ensureSetup();
    const names = parseNames(args._ as string[] | undefined);
    return check(names);
  },
});

export const arenaCommand = defineCommand({
  meta: {
    name: "arena",
    description: "Compare and rank candidates using their background check results",
  },
  args: {
    names: {
      type: "positional",
      description: "Applicant names (optional, comma-separated or space-separated, uses names.json if not provided)",
      required: false,
    },
  },
  async run({ args }) {
    await ensureSetup();
    const names = parseNames(args._ as string[] | undefined);
    return arena(names);
  },
});

export const clearCommand = defineCommand({
  meta: {
    name: "clear",
    description: "Clear all data and results folders (keeps .env)",
  },
  async run() {
    return clear();
  },
});

export const printCommand = defineCommand({
  meta: {
    name: "print",
    description: "Print results in the terminal (no args for all, 'arena' for arena, or a name for individual)",
  },
  args: {
    target: {
      type: "positional",
      description: "'arena' for arena results, applicant name for individual, or omit for all",
      required: false,
    },
  },
  async run({ args }) {
    return print(args.target as string | undefined);
  },
});

export const main = defineCommand({
  meta: {
    name: "applch",
    description: "Application checker CLI",
  },
  subCommands: {
    bootstrap: bootstrapCommand,
    check: checkCommand,
    arena: arenaCommand,
    clear: clearCommand,
    print: printCommand,
  }
});

runMain(main);