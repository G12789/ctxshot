# ctxshot vs Repomix（实测）

> 仓库：`ctxshot` 自身 · 2026-06-13 · `node scripts/benchmark.mjs`  
> 配图：`../../ctxshot推广物料/assets/benchmark-chart.svg`

| Tool | 耗时 | 估 token | 适合 |
|---|---:|---:|---|
| `ctxshot --compact --diff` | **~356ms** | **~423** | ✅ 每天新会话 |
| `README.md` 手贴 | <1ms | ~685 | 不完整 |
| `repomix --stdout` | **~3.6s** | **~7,023** | 全库深度分析 |

**结论：** 开会话用 ctxshot；要啃全库再用 Repomix。不是替代关系。

> 注：Repomix 在大仓库上 token 可达 10 万+、耗时数十秒；上表为小仓库（ctxshot 自身）实测。

复现：

```bash
npm run benchmark
npm run benchmark -- /path/to/other/repo
```
