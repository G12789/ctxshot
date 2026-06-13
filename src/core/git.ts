import { execSync } from "node:child_process";

function run(cmd: string, cwd: string): string | null {
  try {
    return execSync(cmd, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

export function isGitRepo(root: string): boolean {
  return run("git rev-parse --is-inside-work-tree", root) === "true";
}

export interface GitSummary {
  branch: string | null;
  recentCommits: string[];
  diffStat: string | null;
  changedFiles: string[];
}

export function gitSummary(root: string, withDiff: boolean): GitSummary | null {
  if (!isGitRepo(root)) return null;
  const branch = run("git branch --show-current", root);
  const log = run("git log -5 --oneline", root);
  const recentCommits = log ? log.split("\n").filter(Boolean) : [];
  let diffStat: string | null = null;
  let changedFiles: string[] = [];
  if (withDiff) {
    diffStat = run("git diff --stat", root);
    const names = run("git diff --name-only", root);
    changedFiles = names ? names.split("\n").filter(Boolean).slice(0, 30) : [];
    const untracked = run("git ls-files --others --exclude-standard", root);
    if (untracked) {
      changedFiles.push(
        ...untracked.split("\n").filter(Boolean).slice(0, 10),
      );
    }
  }
  return { branch, recentCommits, diffStat, changedFiles };
}
