import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");

function run(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8", shell: process.platform === "win32" });
  if (r.status !== 0) {
    console.error(r.stdout, r.stderr);
    process.exit(1);
  }
}

run("npm", ["run", "build"], root);

const tmp = mkdtempSync(join(tmpdir(), "ctxshot-smoke-"));
try {
  run("node", [join(root, "dist", "cli.js"), "--compact"], tmp);
  const out = join(tmp, "ctx.md");
  run("node", [join(root, "dist", "cli.js"), "-o", "ctx.md"], tmp);
  const text = readFileSync(out, "utf8");
  if (!text.includes("Project context")) throw new Error("missing header");
  console.log("ctxshot smoke OK");
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
