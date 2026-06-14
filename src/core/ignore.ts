import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DEFAULT_IGNORE = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  ".nuxt",
  "coverage",
  ".turbo",
  ".cache",
  "__pycache__",
  ".venv",
  "venv",
  ".idea",
  ".vscode",
  "target",
  "vendor",
  ".ai",
]);

export function loadGitignore(root: string): Set<string> {
  const patterns = new Set<string>();
  const file = join(root, ".gitignore");
  if (!existsSync(file)) return patterns;
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    patterns.add(line.replace(/\/$/, ""));
  }
  return patterns;
}

function globToRegExp(pattern: string): RegExp {
  let body = "";
  for (const ch of pattern) {
    if (ch === "*") body += ".*";
    else if (/[+?^${}()|[\]\\.]/.test(ch)) body += `\\${ch}`;
    else body += ch;
  }
  return new RegExp(`^${body}$`);
}

function matchPattern(name: string, pattern: string): boolean {
  if (pattern.startsWith("*.")) {
    return name.endsWith(pattern.slice(1));
  }
  if (pattern.includes("*")) {
    return globToRegExp(pattern).test(name);
  }
  return (
    name === pattern ||
    name.endsWith("/" + pattern) ||
    name.startsWith(pattern + "/")
  );
}

export function shouldIgnore(
  relPath: string,
  name: string,
  gitignore: Set<string>,
  extra: Set<string> = DEFAULT_IGNORE,
): boolean {
  if (extra.has(name)) return true;
  const parts = relPath.split(/[/\\]/);
  for (const part of parts) {
    if (extra.has(part)) return true;
    for (const p of gitignore) {
      if (matchPattern(part, p) || matchPattern(relPath, p)) return true;
    }
  }
  return false;
}

export { DEFAULT_IGNORE };
