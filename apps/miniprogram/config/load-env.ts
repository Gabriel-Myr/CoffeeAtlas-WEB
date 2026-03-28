import fs from 'node:fs'
import path from 'node:path'

type EnvMode = 'development' | 'production'

function resolveWorkspaceRoot(): string {
  let currentDirectory = process.cwd()

  while (true) {
    if (fs.existsSync(path.join(currentDirectory, 'pnpm-workspace.yaml'))) {
      return currentDirectory
    }

    const parentDirectory = path.dirname(currentDirectory)

    if (parentDirectory === currentDirectory) {
      return process.cwd()
    }

    currentDirectory = parentDirectory
  }
}

function resolveWorkspaceEnvPath(filename: string): string {
  return path.resolve(resolveWorkspaceRoot(), filename)
}

function shouldPopulateEnv(key: string): boolean {
  const currentValue = process.env[key]
  return typeof currentValue === 'undefined' || currentValue === ''
}

function normalizeEnvValue(rawValue: string): string {
  const trimmedValue = rawValue.trim()

  if (
    trimmedValue.length >= 2 &&
    ((trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) ||
      (trimmedValue.startsWith("'") && trimmedValue.endsWith("'")))
  ) {
    const unquotedValue = trimmedValue.slice(1, -1)
    return trimmedValue.startsWith('"')
      ? unquotedValue
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\"/g, '"')
      : unquotedValue
  }

  return trimmedValue.replace(/\s+#.*$/, '').trim()
}

export function parseEnvFile(content: string): Record<string, string> {
  const result: Record<string, string> = {}
  const lines = content.split(/\r?\n/)

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue
    }

    const match = trimmedLine.match(
      /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/
    )

    if (!match) {
      continue
    }

    const [, key, rawValue] = match
    result[key] = normalizeEnvValue(rawValue)
  }

  return result
}

function loadEnvFile(envPath: string) {
  if (!fs.existsSync(envPath)) {
    return
  }

  const envValues = parseEnvFile(fs.readFileSync(envPath, 'utf8'))

  Object.entries(envValues).forEach(([key, value]) => {
    if (shouldPopulateEnv(key)) {
      process.env[key] = value
    }
  })
}

export function loadWorkspaceEnv(mode: EnvMode) {
  const candidates = [
    `.env.${mode}.local`,
    '.env.local',
    `.env.${mode}`,
    '.env',
  ]

  candidates.forEach((filename) => {
    loadEnvFile(resolveWorkspaceEnvPath(filename))
  })
}
