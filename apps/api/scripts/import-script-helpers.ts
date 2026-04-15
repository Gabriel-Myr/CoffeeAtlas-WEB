import 'dotenv/config';

import path from 'node:path';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type ImportArgs = {
  input?: string;
};

type ParseImportArgsOptions = {
  scriptName: string;
  allowInput?: boolean;
};

function readArg(args: string[], name: string) {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  return args[index + 1];
}

export function parseImportArgs(argv: string[], options: ParseImportArgsOptions): ImportArgs {
  const args = argv.filter((arg) => arg !== '--');

  if (args.includes('--help') || args.includes('-h')) {
    throw new Error(buildUsage(options));
  }

  const input = readArg(args, '--input');

  if (!options.allowInput && input) {
    throw new Error(`${options.scriptName} does not accept --input\n${buildUsage(options)}`);
  }

  if (options.allowInput && !input) {
    throw new Error(`Missing required argument: --input\n${buildUsage(options)}`);
  }

  for (const arg of args) {
    if (!arg.startsWith('-')) continue;
    if (arg === '--input' || arg === '--help' || arg === '-h') continue;
    throw new Error(`Unknown argument: ${arg}\n${buildUsage(options)}`);
  }

  return {
    input: input ? path.resolve(input) : undefined,
  };
}

export function requireEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

export function createAdminSupabaseClient(): SupabaseClient {
  return createClient(requireEnv('NEXT_PUBLIC_SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function reportScriptError(scriptName: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[${scriptName}] ${message}`);
  process.exit(1);
}

function buildUsage(options: ParseImportArgsOptions) {
  if (options.allowInput) {
    return `Usage: ${options.scriptName} --input <file>`;
  }
  return `Usage: ${options.scriptName}`;
}
