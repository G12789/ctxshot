import { resolve } from "node:path";
import { buildTree, readManifests, readContextSnippets } from "./scan.js";
import { gitSummary } from "./git.js";
import { formatBrief, estimateTokens } from "./format.js";

export interface PackOptions {
  /** Project root (default: process.cwd()) */
  root?: string;
  compact?: boolean;
  diff?: boolean;
  depth?: number;
  maxEntries?: number;
}

export interface ContextStats {
  estimatedTokens: number;
  lineCount: number;
  treeLineCount: number;
  compact: boolean;
  hasGit: boolean;
  manifestCount: number;
}

export interface PackResult {
  markdown: string;
  stats: ContextStats;
  root: string;
}

export function packContext(opts: PackOptions = {}): PackResult {
  const root = resolve(opts.root ?? process.cwd());
  const compact = opts.compact ?? false;
  const diff = opts.diff ?? false;
  const depth = opts.depth ?? (compact ? 2 : 3);
  const maxEntries = opts.maxEntries ?? (compact ? 50 : 80);

  const tree = buildTree({ root, maxDepth: depth, maxEntries });
  const manifests = readManifests(root);
  const snippets = readContextSnippets(root, compact);
  const git = gitSummary(root, diff);

  const markdown = formatBrief({
    root,
    tree,
    manifests,
    snippets,
    git,
    compact,
  });

  return {
    markdown,
    root,
    stats: {
      estimatedTokens: estimateTokens(markdown),
      lineCount: markdown.split("\n").length,
      treeLineCount: tree.length,
      compact,
      hasGit: git !== null,
      manifestCount: manifests.length,
    },
  };
}
