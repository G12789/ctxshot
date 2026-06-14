# ctxshot

[![CI](https://github.com/G12789/ctxshot/actions/workflows/ci.yml/badge.svg)](https://github.com/G12789/ctxshot/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/ctxshot?color=cb3837&logo=npm)](https://www.npmjs.com/package/ctxshot)
[![node](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

> **开 AI 编程会话前，3 秒打包项目上下文。**
> 目录结构、脚本摘要、AGENTS.md / README 片段、最近 git 改动——压成一份 **~400 token** 的 AI-ready brief。
>
> 不是 Repomix 全库打包。是**每天开会话的固定起手式**。

每天用 Cursor / Claude Code 写代码，最烦的是每个新会话都要重新交代项目。贴 README 不完整，glob 目录费口舌，上 Repomix 又慢又胖。`ctxshot` 把「项目全貌」压成一份 Markdown，写入 `.ai/context.md`，会话里 `@` 引用即可。

```bash
npx ctxshot --compact -o .ai/context.md
```

<p align="center">
  <img src="docs/benchmark-chart.svg" alt="ctxshot vs Repomix benchmark" width="860" />
</p>

---

## 为什么用它

| 痛点 | 没有 ctxshot | 有 ctxshot |
|---|---|---|
| 新开会话 | 反复解释结构、贴 README | 一条命令生成 `.ai/context.md` |
| 换模型 / 换工具 | 重新交代一遍 | brief 文件直接 `@` 引用 |
| 大仓库 | AI 乱搜、烧 token | 尊重 `.gitignore` 的浅层树 + 脚本摘要 |
| 要读全库代码 | — | 仍用 Repomix，**不冲突** |

和 [fff.nvim](https://github.com/Ffftdtd5dtff/fff.nvim) 也不冲突：它解决**搜文件省 token**；ctxshot 解决**会话开头交代项目全貌**。

---

## 实测对比（同仓库）

仓库：`ctxshot` 自身 · 命令：`npm run benchmark`

| 工具 | 耗时 | 估 token | 适合 |
|---|---:|---:|---|
| `ctxshot --compact --diff` | **356ms** | **423** | 每天新会话 |
| `README.md` 手贴 | <1ms | 685 | 不完整 |
| `repomix --stdout` | **3.6s** | **7,023** | 全库深度分析 |

大仓库上 Repomix 可达 **10 万+ token、数十秒**；ctxshot 仍保持几百 token。

<details>
<summary>复现 benchmark</summary>

```bash
git clone https://github.com/G12789/ctxshot
cd ctxshot && npm install
npm run benchmark
npm run benchmark -- /path/to/your/repo
```

详见 [docs/benchmark.md](docs/benchmark.md)。

</details>

---

## 会话记忆工作流（配合 ship-skills）

单独 `ctxshot` 只解决「项目结构快照」。**重启不丢、记得上次在干啥** 需要三层文件 + Hook：

| 文件 | 命令 / 机制 |
|------|-------------|
| `.ai/focus.md` | 你维护「正在做什么」 |
| `.ai/handoff.md` | SessionEnd 自动写 |
| `.ai/context.md` | `npx ctxshot --compact --diff --depth 3 --max 120 -o .ai/context.md` |

一键：`npx ship-skills init` — 见 [ai-ship/docs/STACK.md](https://github.com/G12789/ai-ship/blob/master/docs/STACK.md)。

---

## 快速开始

```bash
# 输出到终端
npx ctxshot

# 推荐：写入文件，会话里 @.ai/context.md
npx ctxshot --compact -o .ai/context.md

# 附带 git 分支、最近 commit、未提交改动
npx ctxshot --compact --diff -o .ai/context.md
```

### 推荐工作流

```
1. 打开项目
2. npx ctxshot --compact -o .ai/context.md   （或 MCP session_brief）
3. 新会话里 @.ai/context.md
4. 需要读具体实现 → @单文件 或 Repomix
```

---

## 输出示例

```markdown
# Project context (ctxshot)

Root: `/your/project`
Mode: compact · daily session brief · ~365 tokens (estimate)

## Scripts & stack
### package.json
- `dev`: tsx src/cli.ts
- `build`: tsc -p tsconfig.json

## Existing instructions
### AGENTS.md
…（自动截断）

## Project tree
```
.
├── src/
├── package.json
└── README.md
```

## Git (when --diff)
- Branch: main
- Recent commits: …
- Uncommitted: 2 files changed
```

---

## CLI 参数

| 选项 | 说明 |
|---|---|
| `-o, --out <path>` | 写入文件（自动创建目录） |
| `--compact` | 更短输出：浅树（深度 2）、截断 README |
| `--diff` | 包含 git 分支、最近 5 commit、未提交 diff |
| `--depth <n>` | 目录树深度（默认 compact=2，全量=3） |
| `--max <n>` | 目录树最多条目（默认 compact=50，全量=80） |
| `-h, --help` | 帮助 |
| `-v, --version` | 版本 |

---

## 打包内容

| 包含 | 不包含 |
|---|---|
| 目录树（尊重 `.gitignore`） | 源码全文 |
| `package.json` / `pyproject.toml` / `go.mod` 脚本与依赖 | `.env`、密钥 |
| `AGENTS.md` / `CLAUDE.md` / `README.md` 截断片段 | `node_modules` 内容 |
| `--diff`：分支、commit、未提交变更 | 任何网络上传 |

**零配置**：在任意 repo 根目录 `npx ctxshot` 即可，数据不出本机。

---

## MCP 集成（Cursor / Claude Code）

推荐用 MCP 让 Agent **自动**在会话开头调用 `session_brief`：

- 仓库：[ctxshot-mcp](https://github.com/G12789/ctxshot-mcp)
- npm：`npx ctxshot-mcp`

```json
{
  "mcpServers": {
    "ctxshot": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "ctxshot-mcp@latest"]
    }
  }
}
```

| MCP Tool | 作用 |
|---|---|
| `session_brief` | 写 `.ai/context.md` + 返回简报（**每日起手**） |
| `pack_context` | 返回 Markdown，不落盘 |
| `context_stats` | 只看 token 估算 |

---

## 和 Repomix 怎么选

| | **ctxshot** | **Repomix** |
|---|---|---|
| 输出 | 浅层树 + 脚本 + 摘要（~400–2k token） | 整个仓库文件内容（可达数十万 token） |
| 速度 | <1s | 大仓库较慢 |
| 适合 | **每天**开新会话 | 深度审计、全库 refactor |
| 关系 | **互补，不是替代** | 互补 |

---

## 架构

```
CLI (npx ctxshot)
       │
       ▼
ctxshot/core  —  packContext()
  ├── scan.ts    目录树、manifest、README/AGENTS 片段
  ├── git.ts     分支、commit、未提交 diff
  ├── ignore.ts  .gitignore 过滤
  └── format.ts  Markdown 输出 + token 估算
       │
       ▼
输出：stdout 或 .ai/context.md
```

### 编程式调用

```ts
import { packContext } from "ctxshot/core";

const { markdown, stats } = packContext({
  root: "/path/to/project",
  compact: true,
  diff: true,
});

console.log(stats.estimatedTokens); // ~423
```

---

## AI Ship Kit

| 频率 | 工具 | 做什么 |
|---|---|---|
| **每天** | **ctxshot** + [ctxshot-mcp](https://github.com/G12789/ctxshot-mcp) | 会话前打包上下文 |
| 改 prompt | [evaldrift](https://github.com/G12789/evaldrift) | prompt 快照回归测试 |
| 接 API | [mcp-quickstart](https://github.com/G12789/mcp-quickstart) | 30 秒生成 MCP Server |
| 工作流 | [ship-skills](https://www.npmjs.com/package/ship-skills) | 4 个 Agent Skill + CLI |

三个独立 npm 包，按需安装。

---

## 常见问题

**Q: 能替代 Repomix 吗？**  
不能，也不打算。ctxshot 是每日简报；要 AI 读每一行代码请用 Repomix。

**Q: 大 monorepo 够用吗？**  
够用「交代结构」；深度读子包源码仍需 `@` 文件或 Repomix。可用 `--depth` / `--max` 调树大小。

**Q: MCP 扫错目录？**  
全局 MCP 的 cwd 可能是用户主目录。把项目作为工作区打开，或调用时传 `root` 参数。

**Q: 会读 `.env` 吗？**  
不会。遵循 `.gitignore`，不读取密钥文件。

---

## 开发

```bash
git clone https://github.com/G12789/ctxshot
cd ctxshot && npm install
npm run dev -- --help
npm run build
npm run test:smoke
npm run benchmark
```

贡献指南见 [CONTRIBUTING.md](CONTRIBUTING.md)。

---

## License

MIT · [ctxshot-mcp](https://github.com/G12789/ctxshot-mcp) · [npm](https://www.npmjs.com/package/ctxshot)
