#!/usr/bin/env node
/**
 * migrate-deploy.mjs
 *
 * Wraps `prisma migrate deploy` with automatic baselining (P3005 handling).
 *
 * When a database was bootstrapped via `prisma db push` (no migration history),
 * `migrate deploy` fails with P3005. This script detects that, marks all
 * existing migrations as already applied, then re-runs migrate deploy so only
 * genuinely new migrations are executed.
 */
import { execSync, spawnSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const schemaPath = resolve(__dirname, '../prisma/schema.prisma')
const migrationsDir = resolve(__dirname, '../prisma/migrations')

function run(args) {
  console.log(`> prisma ${args.join(' ')}`)
  const r = spawnSync('prisma', args, { stdio: 'inherit', encoding: 'utf8' })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

// First attempt
const first = spawnSync('prisma', ['migrate', 'deploy', `--schema=${schemaPath}`], {
  stdio: ['inherit', 'inherit', 'pipe'],
  encoding: 'utf8',
})

if (first.status === 0) {
  console.log('Migrations applied successfully.')
  process.exit(0)
}

const stderr = first.stderr || ''

if (!stderr.includes('P3005')) {
  // Unknown error — print and exit
  process.stderr.write(stderr)
  process.exit(first.status ?? 1)
}

// P3005: database not empty but no migration history → baseline
console.log('\nP3005 detected: database exists without migration history.')
console.log('Baselining — marking all existing migrations as applied...\n')

const migrations = readdirSync(migrationsDir)
  .filter(f => !f.endsWith('.toml'))
  .sort()

for (const migration of migrations) {
  console.log(`  Resolving: ${migration}`)
  const r = spawnSync(
    'prisma',
    ['migrate', 'resolve', '--applied', migration, `--schema=${schemaPath}`],
    { stdio: 'pipe', encoding: 'utf8' }
  )
  if (r.status !== 0) {
    // "Already recorded" is fine — skip silently
    const out = (r.stdout || '') + (r.stderr || '')
    if (!out.includes('already been applied') && !out.includes('already recorded')) {
      process.stderr.write(out)
    }
  }
}

console.log('\nBaseline complete. Running migrate deploy for any new migrations...\n')
run(['migrate', 'deploy', `--schema=${schemaPath}`])
