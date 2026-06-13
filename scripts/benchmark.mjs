/**
 * Benchmark: ctxshot vs README paste token estimate on the same repo.
 * Repomix: run manually when installed (npx repomix) — optional row.
 *
 * Usage: node scripts/benchmark.mjs [repo-path]
 */
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { performance } from "node:perf_hooks";

const root = resolve(process.argv[2] ?? join(import.meta.dirname, ".."));
const ctxshotCli = join(import.meta.dirname, "..", "dist", "cli.js");

function estTokens(text) {
  return Math.round(text.length / 4);
}

function timeCtxshot() {
  const t0 = performance.now();
  const r = spawnSync(
    process.execPath,
    [ctxshotCli, "--compact", "--diff"],
    { cwd: root, encoding: "utf8" },
  );
  const ms = Math.round(performance.now() - t0);
  if (r.status !== 0) throw new Error(r.stderr || "ctxshot failed");
  return { ms, tokens: estTokens(r.stdout), tool: "ctxshot --compact --diff" };
}

function timeReadme() {
  const readme = join(root, "README.md");
  if (!existsSync(readme)) return null;
  const t0 = performance.now();
  const text = readFileSync(readme, "utf8");
  const ms = Math.round(performance.now() - t0);
  return { ms, tokens: estTokens(text), tool: "README.md only" };
}

function timeRepomix() {
  const t0 = performance.now();
  const r = spawnSync("npx", ["--yes", "repomix", "--stdout"], {
    cwd: root,
    encoding: "utf8",
    shell: process.platform === "win32",
    timeout: 120000,
  });
  if (r.status !== 0) return null;
  const ms = Math.round(performance.now() - t0);
  return { ms, tokens: estTokens(r.stdout), tool: "repomix --stdout" };
}

async function main() {
  spawnSync(process.execPath, [ctxshotCli, "--version"], { cwd: root });

  const rows = [timeCtxshot(), timeReadme()];
  try {
    const rep = timeRepomix();
    if (rep) rows.push(rep);
  } catch {
    /* repomix optional */
  }

  console.log(`\nBenchmark repo: ${root}\n`);
  console.log("| Tool | ms | est. tokens |");
  console.log("|------|---:|------------:|");
  for (const row of rows) {
    if (!row) continue;
    console.log(`| ${row.tool} | ${row.ms} | ${row.tokens.toLocaleString()} |`);
  }
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
