import type { ManifestSummary } from "./scan.js";
import type { GitSummary } from "./git.js";

export interface FormatOptions {
  root: string;
  tree: string[];
  manifests: ManifestSummary[];
  snippets: string[];
  git: GitSummary | null;
  compact: boolean;
}

export function estimateTokens(text: string): number {
  return Math.round(text.length / 4);
}

export function formatBrief(opts: FormatOptions): string {
  const lines: string[] = [];
  lines.push("# Project context (ctxshot)");
  lines.push("");
  lines.push(`Root: \`${opts.root}\``);
  const bodyPreview = [
    ...opts.tree,
    ...opts.snippets,
    JSON.stringify(opts.manifests),
  ].join("\n");
  const estTokens = estimateTokens(bodyPreview);
  lines.push(
    `Mode: ${opts.compact ? "compact · daily session brief" : "full"} · ~${estTokens} tokens (estimate)`,
  );
  lines.push(
    `Note: lightweight overview only — for full file contents use [Repomix](https://repomix.com).`,
  );
  lines.push("");

  if (opts.git) {
    lines.push("## Git");
    if (opts.git.branch) lines.push(`- Branch: \`${opts.git.branch}\``);
    if (opts.git.recentCommits.length) {
      lines.push("- Recent commits:");
      for (const c of opts.git.recentCommits) lines.push(`  - ${c}`);
    }
    if (opts.git.diffStat) {
      lines.push("- Uncommitted diff stat:");
      lines.push("```");
      lines.push(opts.git.diffStat);
      lines.push("```");
    }
    if (opts.git.changedFiles.length) {
      lines.push("- Changed / untracked files:");
      for (const f of opts.git.changedFiles) lines.push(`  - ${f}`);
    }
    lines.push("");
  }

  if (opts.manifests.length) {
    lines.push("## Scripts & stack");
    for (const m of opts.manifests) {
      lines.push(`### ${m.kind}`);
      if (m.extra?.length) {
        for (const e of m.extra) lines.push(`- ${e}`);
      }
      if (m.scripts && Object.keys(m.scripts).length) {
        const keys = opts.compact
          ? ["dev", "build", "test", "start", "lint"].filter((k) => m.scripts![k])
          : Object.keys(m.scripts);
        for (const k of keys) {
          lines.push(`- \`${k}\`: ${m.scripts[k]}`);
        }
      }
      if (m.deps?.length) {
        lines.push(`- Key deps: ${m.deps.join(", ")}`);
      }
      lines.push("");
    }
  }

  if (opts.snippets.length) {
    lines.push("## Existing instructions");
    lines.push(...opts.snippets);
    lines.push("");
  }

  lines.push("## Project tree");
  lines.push("```");
  lines.push(...opts.tree);
  lines.push("```");
  lines.push("");
  lines.push("---");
  lines.push("Tip: re-run `pack_context` / `npx ctxshot` after major refactors.");
  return lines.join("\n");
}
