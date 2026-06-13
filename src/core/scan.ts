import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { shouldIgnore, loadGitignore } from "./ignore.js";

export interface TreeOptions {
  root: string;
  maxDepth: number;
  maxEntries: number;
}

export function buildTree(opts: TreeOptions): string[] {
  const gitignore = loadGitignore(opts.root);
  const lines: string[] = [];
  let count = 0;

  function walk(dir: string, depth: number, prefix: string): void {
    if (depth > opts.maxDepth || count >= opts.maxEntries) return;
    let entries: string[];
    try {
      entries = readdirSync(dir).sort((a, b) => a.localeCompare(b));
    } catch {
      return;
    }
    const visible = entries.filter((name) => {
      const rel = relative(opts.root, join(dir, name)).replace(/\\/g, "/");
      return !shouldIgnore(rel, name, gitignore);
    });
    for (let i = 0; i < visible.length; i++) {
      if (count >= opts.maxEntries) {
        lines.push(`${prefix}… (${opts.maxEntries} entries max)`);
        return;
      }
      const name = visible[i];
      const full = join(dir, name);
      const last = i === visible.length - 1;
      const branch = last ? "└── " : "├── ";
      const childPrefix = prefix + (last ? "    " : "│   ");
      let label = name;
      try {
        if (statSync(full).isDirectory()) {
          label += "/";
          lines.push(prefix + branch + label);
          count++;
          walk(full, depth + 1, childPrefix);
        } else {
          lines.push(prefix + branch + label);
          count++;
        }
      } catch {
        lines.push(prefix + branch + label);
        count++;
      }
    }
  }

  lines.push(".");
  walk(opts.root, 1, "");
  return lines;
}

export interface ManifestSummary {
  kind: string;
  scripts?: Record<string, string>;
  deps?: string[];
  extra?: string[];
}

export function readManifests(root: string): ManifestSummary[] {
  const out: ManifestSummary[] = [];
  const pkg = join(root, "package.json");
  if (existsSync(pkg)) {
    try {
      const j = JSON.parse(readFileSync(pkg, "utf8")) as {
        name?: string;
        scripts?: Record<string, string>;
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const deps = [
        ...Object.keys(j.dependencies ?? {}),
        ...Object.keys(j.devDependencies ?? {}),
      ].slice(0, 12);
      out.push({
        kind: `package.json${j.name ? ` (${j.name})` : ""}`,
        scripts: j.scripts,
        deps,
      });
    } catch {
      out.push({ kind: "package.json (parse error)" });
    }
  }
  const py = join(root, "pyproject.toml");
  if (existsSync(py)) {
    const text = readFileSync(py, "utf8");
    const scripts: Record<string, string> = {};
    const match = text.match(/\[project\.scripts\]([\s\S]*?)(?:\[|$)/);
    if (match) {
      for (const line of match[1].split("\n")) {
        const m = line.match(/^(\w[\w-]*)\s*=\s*"(.+)"\s*$/);
        if (m) scripts[m[1]] = m[2];
      }
    }
    out.push({
      kind: "pyproject.toml",
      scripts: Object.keys(scripts).length ? scripts : undefined,
    });
  }
  const go = join(root, "go.mod");
  if (existsSync(go)) {
    const first = readFileSync(go, "utf8").split("\n")[0];
    out.push({ kind: "go.mod", extra: [first.trim()] });
  }
  return out;
}

const CONTEXT_FILES = ["AGENTS.md", "CLAUDE.md", ".cursor/rules", "README.md"];

export function readContextSnippets(root: string, compact: boolean): string[] {
  const snippets: string[] = [];
  const limit = compact ? 400 : 1200;
  for (const rel of CONTEXT_FILES) {
    const full = join(root, rel);
    if (!existsSync(full)) continue;
    try {
      const st = statSync(full);
      if (st.isDirectory()) continue;
      const text = readFileSync(full, "utf8").trim();
      if (!text) continue;
      const body =
        text.length > limit ? text.slice(0, limit) + "\n…(truncated)" : text;
      snippets.push(`### ${rel}\n\n${body}`);
    } catch {
      /* skip */
    }
  }
  return snippets;
}
