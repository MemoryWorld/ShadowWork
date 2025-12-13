# 🚀 Real-World Task Generator - Complete Guide

## 概览

ShadowWork 的**真实任务生成管道**是项目的核心价值所在！它将真实的开源 bug 修复转换为匿名化的编程挑战。

### 完整流程

```
GitHub 仓库 → 抓取 Bug Fix PR → 提取 Diff → OpenAI 转换 → 可运行的编程挑战
```

---

## 技术架构

### 1️⃣ GitHub 爬虫 (`src/lib/github-scraper.ts`)

**功能**：
- 使用 GitHub REST API（无需 token）
- 查找最近合并的 PR，筛选包含 "fix", "bug", "patch" 的 PR
- 获取代码 diff（变更内容）

**核心函数**：
```typescript
getLatestBugFix(owner: string, repo: string) → BugFixData
```

**示例**：
```typescript
const bugFix = await getLatestBugFix('vercel', 'next.js');
// 返回: { prNumber, title, diffText, ... }
```

---

### 2️⃣ LLM 任务生成器 (`src/lib/task-generator.ts`)

**功能**：
- 使用 OpenAI gpt-4o 模型
- **关键转换规则**：
  - 🎭 **场景混淆**：金融 bug → 游戏 bug
  - 🔒 **隐私保护**：绝不暴露原始仓库/公司名
  - 🎯 **保留技术难度**：bug 类型和解决方案保持一致
  - 📦 **精确版本**：`"express": "4.18.2"`（不使用 `^` 或 `~`）

**System Prompt 核心逻辑**：
```
输入: Git Diff (真实代码变更)
输出: JSON 格式的挑战任务
- 改变业务场景（Payment → Gaming）
- 保持技术 bug（Race Condition → Race Condition）
- 生成可运行的代码 + 测试
```

---

### 3️⃣ API 路由 (`src/app/api/generate-task/route.ts`)

**支持模式**：

| 模式 | URL | 用途 |
|------|-----|------|
| **Mock Mode** | `?mock=true` | 离线测试，返回本地 JSON |
| **GitHub Mode** | `?source=github&repo=owner/repo` | 真实管道，从 GitHub 生成 |
| **Custom Mode** | `?source=custom` | 加载用户自定义任务 |

**降级策略**：
- ✅ GitHub API 失败 → 返回 Mock 数据
- ✅ OpenAI 失败 → 返回 Mock 数据 + 错误标记
- ✅ 所有失败 → 返回默认挑战

---

## 使用指南

### 方式 1: 通过测试页面（推荐用于 Demo）

1. 访问：`http://localhost:3000/generate`
2. 输入仓库 URL：
   - 完整 URL: `https://github.com/vercel/next.js`
   - 简短格式: `vercel/next.js`
3. 点击 **🚀 Generate**
4. 查看生成的任务
5. 点击 **▶️ Try This Challenge** 进入挑战模式

**快捷测试仓库**：
- `vercel/next.js` - Next.js 框架
- `facebook/react` - React 库
- `shadcn-ui/ui` - UI 组件库

---

### 方式 2: 直接 API 调用

#### 使用 curl 测试

```bash
# 方法 1: GET 请求
curl "http://localhost:3000/api/generate-task?source=github&repo=vercel/next.js"

# 方法 2: POST 请求
curl -X POST http://localhost:3000/api/generate-task \
  -H "Content-Type: application/json" \
  -d '{"repo": "shadcn-ui/ui"}'
```

#### 使用 Postman

1. **新建 GET 请求**
2. **URL**: `http://localhost:3000/api/generate-task`
3. **Query Params**:
   - `source` = `github`
   - `repo` = `microsoft/typescript`
4. **Send**

---

### 方式 3: 在代码中使用

```typescript
// 在任何组件中调用
const response = await fetch(
  '/api/generate-task?source=github&repo=tailwindlabs/tailwindcss'
);
const task = await response.json();

console.log(task.title);      // "Fix CSS Race Condition in Game UI"
console.log(task.difficulty);  // 75
console.log(task.files);       // { "server.js": {...}, "test.js": {...} }
```

---

## 环境配置

### 必需的环境变量

在 `.env.local` 中添加：

```bash
# OpenAI API (必需)
OPENAI_API_KEY=sk-proj-...

# Apify (可选，目前未使用)
APIFY_API_TOKEN=apify_api_...
```

### 获取 OpenAI API Key

1. 访问：https://platform.openai.com/api-keys
2. 创建新的 API Key
3. 复制并添加到 `.env.local`
4. **重启开发服务器**

---

## 测试流程（Demo 演示）

### 完整测试步骤

```bash
# 1. 启动服务器
npm run dev

# 2. 访问生成器页面
http://localhost:3000/generate

# 3. 输入热门仓库
vercel/next.js

# 4. 等待生成（10-30 秒）
- GitHub 抓取 PR
- OpenAI 转换任务

# 5. 查看结果
- 任务标题（已混淆）
- 难度和分类
- 生成的文件（package.json, server.js, test.js）

# 6. 尝试挑战
点击 "Try This Challenge" → 进入编码界面
```

---

## 输出示例

### 输入

```
Repo: facebook/react
PR: "Fix race condition in useEffect cleanup"
```

### 输出（混淆后）

```json
{
  "id": "uuid-12345",
  "title": "Fix Memory Leak in Game Inventory System",
  "description": "A race condition in the cleanup logic causes items to duplicate...",
  "difficulty": 70,
  "category": "Race-Condition",
  "techStack": ["Node.js", "Express"],
  "estimatedTime": 40,
  "files": {
    "package.json": {
      "dependencies": {
        "express": "4.18.2"
      }
    },
    "server.js": {
      "content": "// TODO: Fix the race condition in inventory cleanup..."
    },
    "test.js": {
      "content": "// Test: Should not duplicate items on concurrent requests..."
    }
  }
}
```

---

## 常见问题

### Q1: GitHub API 限流怎么办？

**A**: GitHub 未认证请求限制为 60 次/小时。如果超限：
- 等待 1 小时后重试
- 或在 `.env.local` 添加 `GITHUB_TOKEN`（可选功能）

### Q2: OpenAI API 错误？

**A**: 检查：
1. ✅ `.env.local` 中 `OPENAI_API_KEY` 是否正确
2. ✅ API Key 是否有余额
3. ✅ 是否重启了开发服务器（`Ctrl+C` → `npm run dev`）

### Q3: 为什么生成时间较长？

**A**: 正常流程需要：
- GitHub API: 2-5 秒
- OpenAI GPT-4: 10-25 秒
- **总计**: 15-30 秒

### Q4: 如何保证生成的代码可运行？

**A**: LLM Prompt 中要求：
- ✅ 使用精确版本号（避免依赖冲突）
- ✅ 包含完整的测试用例
- ✅ 生成 README 和使用说明

---

## 调试技巧

### 查看详细日志

在浏览器控制台（F12）和服务器终端查看：

```
[GitHub] Fetching PRs from vercel/next.js...
[GitHub] Found bug fix: PR #12345 - Fix memory leak
[LLM] Generating task from diff...
[LLM] Task generated successfully: Fix Cache Error in Game Server
[generate-task] Task generated: Fix Cache Error in Game Server
```

### 测试单独的模块

```typescript
// 测试 GitHub 爬虫
import { getLatestBugFix } from '@/lib/github-scraper';
const bugFix = await getLatestBugFix('vercel', 'next.js');

// 测试 LLM 生成
import { generateTaskFromDiff } from '@/lib/task-generator';
const task = await generateTaskFromDiff('Fix bug', diffText, { owner: 'test', repo: 'test' });
```

---

## 未来扩展

### 可优化方向

1. **多语言支持**：生成 Python、Go、Rust 挑战
2. **难度筛选**：指定只抓取高难度 PR
3. **缓存系统**：避免重复生成相同任务
4. **A/B 测试**：对比不同 Prompt 的生成质量
5. **用户反馈**：标记生成质量，持续优化

---

## 总结

这个管道证明了 ShadowWork 的核心价值：

> **将真实工程问题转化为可验证的技能证明，同时保护公司隐私。**

技术亮点：
- ✅ **零成本数据源**（GitHub Public API）
- ✅ **隐私保护**（LLM 场景混淆）
- ✅ **可运行代码**（WebContainer 友好）
- ✅ **降级策略**（多重备份方案）

---

## 联系与贡献

如有问题或改进建议，请查看：
- 📖 主 README: `README.md`
- 🔧 技术文档: `技术文档3.0.docx`

祝 Demo 成功！🚀

