# AGENTS.md — ctxshot

## 结构

- `src/cli.ts` — 入口
- `src/scan.ts` — 目录树、manifest、README 片段
- `src/git.ts` — git 摘要
- `src/ignore.ts` — .gitignore 匹配
- `src/format.ts` — markdown 输出

## 验证改动

```bash
npm run build
npm run test:smoke
```

## 约定

- 保持零配置：`npx ctxshot` 在任意 repo 根目录即可跑
- 输出面向 AI 阅读，中文 help、英文 brief 标题（模型对英文标题更熟）
- 不读 `.env`、不上传任何内容
