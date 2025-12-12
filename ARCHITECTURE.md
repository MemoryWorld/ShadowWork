# ShadowWork 架构说明

## 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browser                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     Next.js Frontend                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │  │
│  │  │   Landing   │  │  Challenge  │  │     Success     │  │  │
│  │  │    Page     │─▶│  Workspace  │─▶│      Page       │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │  │
│  │                           │                                │  │
│  │                           ▼                                │  │
│  │         ┌──────────────────────────────────┐              │  │
│  │         │   Monaco Editor + WebContainer   │              │  │
│  │         │   (Browser-based Node.js)        │              │  │
│  │         └──────────────────────────────────┘              │  │
│  │                           │                                │  │
│  │                           ▼                                │  │
│  │         ┌──────────────────────────────────┐              │  │
│  │         │    rrweb Recorder (Optimized)    │              │  │
│  │         │    - Sampling                     │              │  │
│  │         │    - Checkpointing                │              │  │
│  │         │    - Hard Limit (5000 events)    │              │  │
│  │         └──────────────────────────────────┘              │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  Global Middleware                         │  │
│  │  Cross-Origin-Embedder-Policy: require-corp               │  │
│  │  Cross-Origin-Opener-Policy: same-origin                  │  │
│  │  (Enables SharedArrayBuffer for WebContainer)             │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js API Routes                          │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ /api/generate-   │  │  /api/submit     │  │ /api/auth/   │  │
│  │     task         │  │                  │  │   github     │  │
│  │                  │  │                  │  │              │  │
│  │  • Mock Mode     │  │  • Upload        │  │  • OAuth     │  │
│  │    Switch        │  │    Recording     │  │    Flow      │  │
│  │  • OpenAI        │  │  • Save to DB    │  │    (TODO)    │  │
│  │    Generator     │  │  • Slack Alert   │  │              │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│           │                      │                               │
└───────────┼──────────────────────┼───────────────────────────────┘
            │                      │
            ▼                      ▼
┌─────────────────────┐  ┌─────────────────────┐
│      OpenAI API     │  │     Supabase        │
│                     │  │                     │
│  • GPT-4o Model     │  │  • PostgreSQL DB    │
│  • Scenario Swap    │  │  • Storage Bucket   │
│  • Exact Versions   │  │  • Auth (GitHub)    │
│  • Privacy-Safe     │  │                     │
└─────────────────────┘  └─────────────────────┘
                                  │
                                  ▼
                         ┌─────────────────────┐
                         │   Slack Webhook     │
                         │                     │
                         │  • Anonymized       │
                         │  • No PR/Repo IDs   │
                         │  • Replay Link      │
                         └─────────────────────┘
```

---

## 数据流图

### 用户挑战流程

```
1. User Lands on Homepage
         ↓
2. Click "Start Challenge"
         ↓
3. API: /api/generate-task?mock=true
         ↓
         ┌─────────────────┐
         │  Mock Mode?     │
         └─────────────────┘
           Yes ↓        ↓ No
               ↓        ↓
       Read mock.json   Call Apify + OpenAI
               ↓        ↓
         ┌─────────────────┐
         │  Return Task    │
         │  - Files        │
         │  - Metadata     │
         │  - Tests        │
         └─────────────────┘
                 ↓
4. WebContainer Boots
         ↓
5. Mount Virtual Filesystem
         ↓
6. npm install (with exact versions = fast!)
         ↓
7. rrweb Starts Recording
         ↓
8. User Codes...
   • Edit files in Monaco
   • Run tests
   • Debug output
         ↓
9. User Clicks "Submit"
         ↓
10. rrweb Stops & Returns Events Array
         ↓
11. API: POST /api/submit
    • Upload events.json to Supabase Storage
    • Save metadata to PostgreSQL
    • Send Slack notification
         ↓
12. Redirect to /success
```

---

## 模块详解

### 1. Middleware Layer

**文件**: `middleware.ts`

**责任**:
- 在响应头中注入 COOP/COEP
- 应用到所有路由（包括主文档）
- 不做任何业务逻辑

**为什么放在根目录？**
- Next.js 13+ 要求 middleware 在项目根目录
- 自动在所有请求前执行

**关键代码**:
```typescript
response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
```

---

### 2. Task Generation Pipeline

**流程**:

```
GitHub PR (Real World Issue)
         ↓
    Apify Scraper
    (Extract: title, code, context)
         ↓
    OpenAI GPT-4o
    (Transform with constraints)
         ↓
  ┌──────────────────────────┐
  │  System Prompt:          │
  │  1. Scenario Swap        │
  │  2. Exact Versions       │
  │  3. Privacy Protection   │
  └──────────────────────────┘
         ↓
    Generated Task JSON
    {
      files: { ... },
      metadata: { ... }
    }
         ↓
    Return to Frontend
```

**关键约束**:

1. **场景交换（Scenario Swap）**:
   - 输入: "Fix payment processing race condition in banking system"
   - 输出: "Fix player inventory race condition in gaming system"

2. **精确版本（Exact Versions）**:
   - 禁止: `"express": "^4.18.0"` (范围)
   - 要求: `"express": "4.18.2"` (精确)

3. **隐私保护（Privacy Protection）**:
   - ❌ 不包含: PR #, Repo URL, Company Name
   - ✅ 只包含: 难度分数, 技术栈, 问题类别

---

### 3. WebContainer Sandbox

**技术栈**:
- `@webcontainer/api` - 浏览器中的 Node.js
- `monaco-editor` - VS Code 编辑器核心
- Virtual File System - 内存中的文件系统

**启动序列**:

```
1. WebContainer.boot()
   • 初始化 WASM 模块
   • 创建虚拟文件系统
   • 启动 Node.js runtime

2. container.mount(files)
   • 将 Task 的 files 写入虚拟 FS
   • 包括 package.json, 源代码, 测试

3. container.spawn('npm', ['install'])
   • 在浏览器中运行 npm
   • 下载依赖到虚拟 node_modules
   • 精确版本 = 快速安装

4. Ready for Coding!
   • 用户编辑 → writeFile()
   • 运行测试 → spawn('npm', ['test'])
   • 查看输出 → process.output stream
```

**性能优化**:
- 单例模式: 一个页面只 boot 一次
- 精确版本: 避免依赖解析
- 缓存: WebContainer 自动缓存 node_modules

---

### 4. rrweb Recording Engine

**工作原理**:

```
DOM Mutations → rrweb Listener → Event Queue → JSON Array
     ↓                ↓               ↓             ↓
  User Types      Serialization   Throttling   Max 5000
  Mouse Move      Delta Encoding   Sampling    FIFO Queue
  Scrolling       Compression     Checkpoints  Upload
```

**优化策略**:

| 配置项 | 默认值 | 优化值 | 说明 |
|--------|--------|--------|------|
| MouseMove | 每次 | 200ms | 节流鼠标轨迹 |
| Scroll | 每次 | 150ms | 节流滚动事件 |
| Input | 每次变化 | last | 只记录最终值 |
| Checkpoint | 无 | 每 200 事件 | 定期创建快照 |
| MaxEvents | 无限 | 5000 | 硬限制防溢出 |

**数据量对比**:

```
场景: 30分钟编码会话
├─ 未优化: ~80MB JSON
├─ 基础优化: ~20MB JSON
└─ 完全优化: ~5MB JSON ✅
```

---

### 5. Privacy-First Notification

**Slack Payload 结构**:

```json
{
  "text": "Candidate 1a2b3c4d completed a High complexity challenge",
  "blocks": [
    {
      "type": "section",
      "text": {
        "text": "*Candidate 1a2b3c4d* solved a *High Complexity* problem"
      }
    },
    {
      "type": "section",
      "fields": [
        { "text": "*Category:*\nHigh-Concurrency" },
        { "text": "*Difficulty Score:*\n94/100" },
        { "text": "*Tech Stack:*\nReact, Redis, Node.js" }
      ]
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": "▶️ View Replay",
          "url": "https://supabase.co/recordings/xxx.json"
        }
      ]
    }
  ]
}
```

**隐私保护矩阵**:

| 信息类型 | 是否包含 | 说明 |
|---------|---------|------|
| 候选人 Hash | ✅ | 用户 ID 前 8 位 |
| 难度分数 | ✅ | 1-100 数值 |
| 技术栈 | ✅ | 数组如 ["React", "Node.js"] |
| 问题类别 | ✅ | "High-Concurrency" |
| 录像链接 | ✅ | Supabase 公开 URL |
| 原始 PR ID | ❌ | 绝不泄露 |
| GitHub Repo | ❌ | 绝不泄露 |
| 公司名称 | ❌ | 绝不泄露 |
| Issue Number | ❌ | 绝不泄露 |

---

## 安全架构

### 1. Cross-Origin Isolation

```
Browser Security Model
├─ COOP (Cross-Origin-Opener-Policy)
│  └─ Prevents window.opener access
│     • 防止恶意网站访问我们的页面
├─ COEP (Cross-Origin-Embedder-Policy)
│  └─ Requires all resources to opt-in
│     • 所有资源必须明确允许跨域
└─ Result: SharedArrayBuffer Enabled
   • WebContainer 可以使用多线程
```

### 2. Supabase RLS (Row Level Security)

```sql
-- Policy: Users can only see their own submissions
CREATE POLICY "view_own_submissions"
ON submissions
FOR SELECT
USING (auth.uid()::text = user_id);

-- Policy: Users can only insert as themselves
CREATE POLICY "insert_own_submissions"
ON submissions
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);
```

### 3. API Key Protection

```
Environment Variables (Server-side only)
├─ OPENAI_API_KEY       → /api/generate-task 内部使用
├─ SLACK_WEBHOOK_URL    → /api/submit 内部使用
├─ APIFY_API_TOKEN      → /api/generate-task 内部使用
└─ NEXT_PUBLIC_*        → 客户端可见（仅 Supabase URL/Key）
```

---

## 性能优化策略

### 1. Next.js 优化

- **App Router**: 自动代码分割
- **Server Components**: 减少客户端 JS
- **ISR/SSG**: 静态生成（未来可用于着陆页）

### 2. 前端优化

- **Lazy Loading**: Monaco Editor 按需加载
- **Memoization**: React.memo() 关键组件
- **Debouncing**: 文件写入防抖 (200ms)

### 3. 数据传输优化

- **rrweb Compression**: 事件节流 + 采样
- **JSON Minification**: 移除空格
- **Incremental Upload**: 未来可支持流式上传

### 4. WebContainer 优化

- **Exact Versions**: 跳过依赖解析
- **Single Instance**: 页面级单例
- **Smart Caching**: 利用浏览器缓存

---

## 扩展性设计

### 水平扩展

```
Vercel Edge Network (Global)
├─ 美国: us-east-1
├─ 欧洲: eu-west-1
├─ 亚洲: ap-southeast-1
└─ 自动路由到最近节点
```

### 垂直扩展

```
Supabase (Managed)
├─ PostgreSQL: 自动扩容
├─ Storage: CDN 加速
└─ Auth: 无状态扩展
```

### 微服务化 (未来)

```
当前架构 (Monolith)
└─ Next.js API Routes

未来架构 (Microservices)
├─ Task Generator Service
│  └─ 专门处理 OpenAI 请求
├─ Recording Processor Service
│  └─ 后台处理录像分析
└─ Notification Service
   └─ 统一处理 Slack/Email/Webhook
```

---

## 监控与可观测性

### 推荐工具

1. **Vercel Analytics**:
   - Web Vitals 监控
   - 页面性能跟踪

2. **Supabase Logs**:
   - 数据库查询分析
   - 存储使用监控

3. **Sentry** (未来):
   - 错误追踪
   - 性能分析

4. **Custom Metrics**:
```typescript
// 在代码中添加自定义指标
console.log('[Metrics] WebContainer boot time:', bootTime, 'ms');
console.log('[Metrics] rrweb data size:', dataSize, 'bytes');
```

---

## 总结

ShadowWork 的架构设计围绕三大核心原则：

1. **稳定性**: 通过全局 Middleware 保证 WebContainer 100% 启动
2. **隐私性**: 所有通知和数据都经过匿名化处理
3. **性能**: 优化的 rrweb 配置 + 精确版本依赖

这是一个**面向未来**的架构，可以轻松扩展新功能，同时保持代码简洁可维护。

