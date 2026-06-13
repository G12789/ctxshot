# ctxshot

[![CI](https://github.com/G12789/ctxshot/actions/workflows/ci.yml/badge.svg)](https://github.com/G12789/ctxshot/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/ctxshot?color=cb3837&logo=npm)](https://www.npmjs.com/package/ctxshot)
[![node](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

> **开 AI 编程会话前，3 秒打包项目上下文。**
> 目录结构、npm/pnpm 脚本、AGENTS.md / README 摘要、最近 git 改动——一条命令给 Claude / Cursor / Codex。

```bash
npx ctxshot
npx ctxshot --compact -o .ai/context.md
npx ctxshot --diff
```

### MCP（Claude Code / Cursor）

```bash
npx ctxshot-mcp   # stdio MCP server — https://github.com/G12789/ctxshot-mcp
```

```json
{
  "mcpServers": {
    "ctxshot": {
      "command": "npx",
      "args": ["-y", "ctxshot-mcp@latest"]
    }
  }
}
```

Tools: `session_brief`（每日写 `.ai/context.md`）· `pack_context` · `context_stats`

每次新开 Claude Code / Cursor 会话都要重新解释项目？复制整份 README 又费 token。`ctxshot` 把「项目全貌」压成一份 **AI-ready brief**，成为你每天的固定起手式。

---

## 为什么每天用

| 场景 | 没有 ctxshot | 有 ctxshot |
|---|---|---|
| 新开会话 | 反复 glob、贴 README | `npx ctxshot -o .ai/context.md` 一次搞定 |
| 换模型/换工具 | 重新交代结构 | brief 文件直接 @ 引用 |
| 大仓库 | AI 乱搜、烧 token | 尊重 `.gitignore` 的浅层树 + 脚本摘要 |

和 [fff.nvim](https://github.com/Ffftdtd5dtff/fff.nvim) 不冲突：它解决**搜文件省 token**；ctxshot 解决**会话开头交代项目全貌**。

### 和 Repomix 怎么选？

| | **ctxshot** | **Repomix** |
|---|---|---|
| 输出 | 浅层树 + 脚本 + 摘要（~几百～几千 token） | 整个仓库文件内容（可达数十万 token） |
| 速度 | 3 秒 | 大仓库较慢 |
| 适合 | **每天**开新会话、快速交代结构 | 深度审计、全库 refactor、离线分析 |
| Agent Skill | [@glinks/ai-ship session-start](https://github.com/G12789/ai-ship) | [repomix-explorer](https://repomix.com/guide/repomix-explorer-skill) |

**结论：不是替代关系。** 日常用 ctxshot，要啃全库再用 Repomix。

---

## 快速开始

```bash
# 输出到终端，复制进 AI
npx ctxshot

# 更短（浅树、截断 README）
npx ctxshot --compact

# 写入文件，会话里 @.ai/context.md
npx ctxshot -o .ai/context.md

# 附带未提交改动（diff stat + 文件列表）
npx ctxshot --diff
```

---

## 打包内容

- 项目目录树（尊重 `.gitignore`，可限深度）
- `package.json` / `pyproject.toml` / `go.mod` 脚本与依赖摘要
- 若存在：`AGENTS.md`、`CLAUDE.md`、`README.md`（自动截断）
- `--diff`：当前分支、最近 5 条 commit、未提交 diff

---

## AI Ship Kit 三件套

| 频率 | 工具 | 做什么 |
|---|---|---|
| **每天** | **ctxshot**（本仓库） | 会话前打包上下文 |
| 改 prompt 时 | [evaldrift](https://github.com/G12789/evaldrift) | prompt 快照回归测试 |
| 接 API 时 | [mcp-quickstart](https://github.com/G12789/mcp-quickstart) | 30 秒生成 MCP Server |

三个独立 npm 包，按需安装；组合起来覆盖「用 AI 写代码」的主流程。

---

## 开发

```bash
git clone https://github.com/G12789/ctxshot
cd ctxshot && npm install
npm run dev -- --help
npm run test:smoke
```

---

## License

MIT
