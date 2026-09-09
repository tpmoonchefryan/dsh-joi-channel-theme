#!/usr/bin/env node

import { existsSync, readFileSync, statSync } from 'node:fs'
import { isAbsolute, relative, resolve } from 'node:path'

const manifest = process.argv[2] ?? 'screenshots.json'
const root = process.cwd()
const manifestPath = resolve(root, manifest)

if (!existsSync(manifestPath)) {
  throw new Error(`screenshot manifest does not exist: ${manifest}`)
}

const parsed = JSON.parse(readFileSync(manifestPath, 'utf8'))
const entries = Array.isArray(parsed) ? parsed : parsed?.screenshots

if (!Array.isArray(entries) || entries.length < 1 || entries.length > 8) {
  throw new Error('screenshots manifest must contain 1-8 paths')
}

const seen = new Set()
for (const [index, entry] of entries.entries()) {
  if (typeof entry !== 'string' || entry.length === 0) {
    throw new Error(`screenshots[${index}] must be a non-empty string`)
  }
  const normalized = entry.replaceAll('\\', '/')
  if (isAbsolute(normalized) || normalized.split('/').includes('..')) {
    throw new Error(`screenshots[${index}] must stay inside the repository: ${entry}`)
  }
  if (seen.has(normalized)) {
    throw new Error(`duplicate screenshot path: ${entry}`)
  }
  seen.add(normalized)
  const filePath = resolve(root, normalized)
  const repoRelative = relative(root, filePath)
  if (repoRelative.startsWith('..') || isAbsolute(repoRelative)) {
    throw new Error(`screenshot path escapes the repository: ${entry}`)
  }
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    throw new Error(`screenshot file is missing or not a regular file: ${entry}`)
  }
}

console.log(JSON.stringify({ manifest, count: entries.length, paths: [...seen] }, null, 2))
