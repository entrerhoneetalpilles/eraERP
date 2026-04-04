import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from "fs"
import { join, extname, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const protectedDir = join(__dirname, "..", "app", "(protected)")

const REPLACEMENTS = [
  // Text colors
  [/text-garrigue-900/g, "text-foreground"],
  [/text-garrigue-800/g, "text-foreground"],
  [/text-garrigue-700/g, "text-foreground"],
  [/text-garrigue-600/g, "text-muted-foreground"],
  [/text-garrigue-500/g, "text-muted-foreground"],
  [/text-garrigue-400/g, "text-muted-foreground"],
  [/text-garrigue-300/g, "text-slate-300"],
  // Hover text
  [/hover:text-garrigue-900/g, "hover:text-foreground"],
  [/hover:text-garrigue-700/g, "hover:text-foreground"],
  [/hover:text-olivier-600/g, "hover:text-primary"],
  [/text-olivier-600 hover:underline/g, "text-primary hover:underline"],
  [/text-olivier-600/g, "text-primary"],
  // Backgrounds
  [/bg-garrigue-50\/50/g, "bg-muted/50"],
  [/bg-garrigue-50/g, "bg-muted"],
  [/hover:bg-garrigue-50\/50/g, "hover:bg-muted/50"],
  [/hover:bg-garrigue-50/g, "hover:bg-muted/50"],
  [/bg-calcaire-100/g, "bg-muted/30"],
  [/text-calcaire-100/g, "text-white"],
  // Borders
  [/border border-garrigue-100/g, "border"],
  [/border-garrigue-100/g, "border-border"],
  [/border-garrigue-50/g, "border-border"],
  [/divide-garrigue-50/g, "divide-border"],
  // Primary buttons — remove explicit Provence color classes from Button
  [/ bg-olivier-500 hover:bg-olivier-600/g, ""],
  [/bg-olivier-500 hover:bg-olivier-600/g, ""],
  // Shadows
  [/shadow-card/g, "shadow-sm"],
  [/shadow-soft/g, "shadow-sm"],
  [/shadow-hover/g, "shadow-md"],
  // Border radius
  [/rounded-xl/g, "rounded-lg"],
  // Font
  [/font-playfair /g, ""],
  [/font-serif /g, ""],
]

function processFile(filePath) {
  let content = readFileSync(filePath, "utf-8")
  const original = content
  for (const [from, to] of REPLACEMENTS) {
    content = content.replace(from, to)
  }
  if (content !== original) {
    writeFileSync(filePath, content, "utf-8")
    console.log(`  Updated: ${filePath.split("app/(protected)/")[1] ?? filePath}`)
    return true
  }
  return false
}

function walkDir(dir) {
  let count = 0
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      count += walkDir(full)
    } else if ([".tsx", ".ts"].includes(extname(full))) {
      if (processFile(full)) count++
    }
  }
  return count
}

console.log("Migrating Provence classes to shadcn in app/(protected)...")
const updated = walkDir(protectedDir)
console.log(`Done. ${updated} file(s) updated.`)
