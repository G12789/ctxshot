#!/usr/bin/env node
import { parseArgs } from "node:util";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import pc from "picocolors";
import { packContext } from "./core/pack.js";

const VERSION = "0.2.1";

function help(): void {
  console.log(`
${pc.bold("ctxshot")} — 开 AI 编程会话前，3 秒打包项目上下文（结构 / 脚本 / 最近改动）。

用法:
  ctxshot [选项]              输出到 stdout
  ctxshot -o .ai/context.md   写入文件

选项:
  -o, --out <path>      写入文件（自动创建目录）
      --compact         更短输出（浅树、截断 README）
      --diff            包含 git diff 统计与改动文件
      --depth <n>       目录树深度（默认 compact=2，全量=3）
      --max <n>         目录树最多条目（默认 80）
  -h, --help            帮助
  -v, --version         版本

示例:
  npx ctxshot
  npx ctxshot --compact -o .ai/context.md
  npx ctxshot --diff

MCP: npx ctxshot-mcp — pack_context / session_brief tools for Claude Code & Cursor
`);
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      out: { type: "string", short: "o" },
      compact: { type: "boolean", default: false },
      diff: { type: "boolean", default: false },
      depth: { type: "string" },
      max: { type: "string" },
      help: { type: "boolean", short: "h", default: false },
      version: { type: "boolean", short: "v", default: false },
    },
    allowPositionals: false,
  });

  if (values.help) {
    help();
    return;
  }
  if (values.version) {
    console.log(VERSION);
    return;
  }

  const root = resolve(process.cwd());
  const compact = values.compact ?? false;
  const depth = values.depth ? parseInt(values.depth, 10) : undefined;
  const maxEntries = values.max ? parseInt(values.max, 10) : undefined;

  const { markdown: text, stats } = packContext({
    root,
    compact,
    diff: values.diff ?? false,
    depth,
    maxEntries,
  });

  if (values.out) {
    const outPath = resolve(root, values.out);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, text, "utf8");
    console.error(pc.green(`已写入 ${values.out}`));
    console.error(
      pc.dim(
        `${stats.lineCount} 行，约 ${stats.estimatedTokens} tokens（粗估）`,
      ),
    );
  } else {
    console.log(text);
  }
}

main().catch((err: unknown) => {
  console.error(pc.red(err instanceof Error ? err.message : String(err)));
  process.exit(1);
});
