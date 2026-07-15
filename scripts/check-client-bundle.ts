import fs from 'node:fs'
import path from 'node:path'

type Match = {
  file: string
  line: number
  column: number
  check: string
  value: string
}

const projectRoot = process.cwd()
const nextDir = path.join(projectRoot, '.next')
const staticDir = path.join(nextDir, 'static')

const textExtensions = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.mjs',
  '.map',
  '.svg',
  '.txt',
  '.webmanifest',
])

const denylist: Array<{ name: string; pattern: RegExp; redact?: boolean }> = [
  {
    name: 'Anthropic API key-shaped value',
    pattern: /sk-ant-[A-Za-z0-9_-]+/g,
    redact: true,
  },
  {
    name: 'sentinel Anthropic API key value',
    pattern: /sentinel[-_]?anthropic[-_]?api[-_]?key/gi,
    redact: true,
  },
  {
    name: 'ANTHROPIC_API_KEY environment variable name',
    pattern: /ANTHROPIC_API_KEY/g,
  },
  {
    name: '@anthropic-ai/sdk module specifier',
    pattern: /@anthropic-ai\/sdk/g,
  },
  {
    name: 'anthropic-ai-sdk package binary/module string',
    pattern: /anthropic-ai-sdk/g,
  },
]

function fail(message: string): never {
  console.error(`\nClient bundle security smoke check failed:\n${message}`)
  process.exit(1)
}

function assertDirectory(dir: string): void {
  try {
    if (!fs.statSync(dir).isDirectory()) {
      fail(`Expected ${relative(dir)} to be a directory.`)
    }
  } catch (error) {
    if (isMissingPathError(error)) {
      fail(
        [
          `Expected ${relative(dir)} to exist.`,
          'Run `next build` before this smoke check; the script scans an existing .next output only.',
        ].join('\n'),
      )
    }

    throw error
  }
}

function isMissingPathError(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT'
}

function collectFiles(dir: string): string[] {
  const files: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...collectFiles(entryPath))
      continue
    }

    if (entry.isFile() && shouldScanFile(entryPath)) {
      files.push(entryPath)
    }
  }

  return files
}

function collectOptionalClientReferenceManifests(): string[] {
  const serverDir = path.join(nextDir, 'server')

  if (!fs.existsSync(serverDir)) {
    return []
  }

  return collectFiles(serverDir).filter((file) => {
    const basename = path.basename(file)
    return basename.includes('client-reference-manifest')
  })
}

function shouldScanFile(file: string): boolean {
  return textExtensions.has(path.extname(file))
}

function scanFile(file: string): Match[] {
  const content = fs.readFileSync(file, 'utf8')
  const matches: Match[] = []

  for (const check of denylist) {
    check.pattern.lastIndex = 0

    for (const match of content.matchAll(check.pattern)) {
      if (match.index === undefined) {
        continue
      }

      const position = lineAndColumn(content, match.index)
      matches.push({
        file,
        line: position.line,
        column: position.column,
        check: check.name,
        value: check.redact ? redact(match[0]) : match[0],
      })
    }
  }

  return matches
}

function lineAndColumn(content: string, index: number): { line: number; column: number } {
  let line = 1
  let lineStart = 0

  for (let i = 0; i < index; i++) {
    if (content.charCodeAt(i) === 10) {
      line++
      lineStart = i + 1
    }
  }

  return { line, column: index - lineStart + 1 }
}

function redact(value: string): string {
  if (value.length <= 12) {
    return '[redacted]'
  }

  return `${value.slice(0, 8)}...[redacted]`
}

function relative(file: string): string {
  return path.relative(projectRoot, file) || '.'
}

assertDirectory(staticDir)

const staticFiles = collectFiles(staticDir)
const clientReferenceManifests = collectOptionalClientReferenceManifests()
const files = [...staticFiles, ...clientReferenceManifests]

const findings = files.flatMap(scanFile)

if (findings.length > 0) {
  const details = findings
    .map(
      (finding) =>
        `- ${relative(finding.file)}:${finding.line}:${finding.column} matched ${finding.check} (${finding.value})`,
    )
    .join('\n')

  fail(
    [
      'Found Anthropic secret or server-only SDK strings in client-facing build artifacts.',
      details,
      '',
      'Keep Anthropic calls and `process.env.ANTHROPIC_API_KEY` references in server-only modules/routes.',
    ].join('\n'),
  )
}

const manifestSummary =
  clientReferenceManifests.length > 0
    ? ` and ${clientReferenceManifests.length} client reference manifest(s)`
    : ''

console.log(
  `Client bundle security smoke check passed: scanned ${staticFiles.length} text artifact(s) under ${relative(
    staticDir,
  )}${manifestSummary}.`,
)
