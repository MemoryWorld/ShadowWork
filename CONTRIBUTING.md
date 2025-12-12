# 开发指南

## 开发环境设置

### 必需工具

- Node.js 18+ 
- npm 或 yarn
- Chrome/Edge 浏览器（用于测试 WebContainer）

### 编辑器推荐

- VS Code + 推荐扩展:
  - ESLint
  - Tailwind CSS IntelliSense
  - TypeScript

---

## 项目架构理解

### 关键概念

#### 1. WebContainer API

**什么是 WebContainer?**
- 在浏览器中运行完整的 Node.js 环境
- 无需服务器，代码在客户端执行
- 需要 SharedArrayBuffer 支持

**为什么需要 COOP/COEP 头部?**
- SharedArrayBuffer 是跨线程共享内存的机制
- 浏览器出于安全考虑，需要特定的 headers 才能启用
- 这就是为什么 `middleware.ts` 如此关键

#### 2. rrweb 录制

**工作原理:**
1. 监听 DOM 变更事件
2. 序列化为 JSON 数组
3. 支持回放重现整个会话

**优化策略:**
- 采样 (sampling): 减少事件频率
- 检查点 (checkpoint): 定期创建快照
- 硬限制: 防止内存溢出

#### 3. Mock vs Production Mode

**Mock 模式** (`?mock=true`):
- 使用本地 `mock-task.json`
- 无需 API 密钥
- 适合开发和演示

**Production 模式**:
- 调用 Apify 抓取真实 PR
- 使用 OpenAI 生成任务
- 需要配置环境变量

---

## 开发工作流

### 1. 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 Mock 模式
http://localhost:3000/challenge?mock=true
```

### 2. 添加新功能

#### 示例: 添加新的编程语言支持

1. **更新类型定义** (`src/types/index.ts`):
```typescript
export type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'rust';
```

2. **修改 CodeEditor.tsx**:
```typescript
function getLanguageFromFilename(filename: string): string {
  // 添加新的语言映射
  if (filename.endsWith('.py')) return 'python';
  if (filename.endsWith('.rs')) return 'rust';
  // ...
}
```

3. **更新 Mock 数据** (`src/data/mock-task.json`):
```json
{
  "techStack": ["Python", "FastAPI"],
  "files": {
    "main.py": {
      "content": "# Python code here"
    }
  }
}
```

### 3. 测试

#### 手动测试清单

- [ ] WebContainer 正常启动
- [ ] 编辑器可以编辑代码
- [ ] 录制功能正常工作
- [ ] 提交流程完整
- [ ] 错误处理友好

#### 自动化测试 (未来)

```bash
# TODO: 添加单元测试
npm test

# TODO: 添加 E2E 测试
npm run test:e2e
```

---

## 代码规范

### TypeScript

- 使用 `interface` 定义数据结构
- 避免使用 `any`，尽量使用具体类型
- 导出的函数必须有 JSDoc 注释

### React

- 优先使用函数组件 + Hooks
- Client Components 必须添加 `'use client'` 指令
- 使用 `useEffect` 时明确依赖数组

### 命名约定

- 组件: `PascalCase` (e.g., `CodeEditor.tsx`)
- Hooks: `camelCase` 以 `use` 开头 (e.g., `useRecorder.ts`)
- 工具函数: `camelCase` (e.g., `sendSlackNotification`)
- 常量: `UPPER_SNAKE_CASE` (e.g., `MAX_EVENTS`)

---

## 常见开发任务

### 修改着陆页

**文件**: `src/app/page.tsx`

```typescript
// 修改 Hero 标题
<h1 className="text-6xl font-bold">
  Your New Title
</h1>
```

### 添加新的 API 路由

**步骤**:
1. 创建 `src/app/api/your-route/route.ts`
2. 导出 `GET` 或 `POST` 函数
3. 返回 `NextResponse.json()`

**示例**:
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Hello' });
}
```

### 修改编辑器主题

**文件**: `src/components/CodeEditor.tsx`

```typescript
<Editor
  theme="vs-dark"  // 改为 "vs-light" 或自定义主题
  // ...
/>
```

### 调整 rrweb 采样率

**文件**: `src/hooks/useRecorder.ts`

```typescript
sampling: {
  mouseInteraction: { MouseMove: 200 },  // 增加到 500 减少数据
  scroll: 150,                           // 减少到 50 增加数据
}
```

---

## 调试技巧

### WebContainer 问题

```javascript
// 在浏览器控制台运行
console.log('SharedArrayBuffer' in window);  // 应该为 true
```

### 查看 rrweb 事件

```typescript
// 在 ChallengeWorkspace.tsx 中添加
console.log('Event count:', getEventCount());
console.log('Data size:', getDataSize(), 'bytes');
```

### API 调试

```bash
# 使用 curl 测试 API
curl http://localhost:3000/api/generate-task?mock=true

# 查看完整响应头
curl -I http://localhost:3000
```

---

## 性能分析

### 使用 React DevTools

1. 安装 React DevTools 浏览器扩展
2. 打开 Profiler 标签
3. 记录会话并分析重渲染

### 使用 Chrome DevTools

1. Performance 面板记录会话
2. 查找 Long Tasks (> 50ms)
3. 优化慢速函数

---

## Git 工作流

### 分支命名

- `feature/xxx` - 新功能
- `fix/xxx` - Bug 修复
- `refactor/xxx` - 代码重构
- `docs/xxx` - 文档更新

### Commit Message

遵循 Conventional Commits:

```
feat: 添加 Python 语言支持
fix: 修复 WebContainer 启动失败
docs: 更新 README 部署说明
refactor: 优化 rrweb 采样逻辑
```

---

## 发布检查清单

准备发布新版本前，确保:

- [ ] 所有功能在 Mock 模式下测试通过
- [ ] 在 Chrome 和 Edge 中测试
- [ ] 检查控制台无错误
- [ ] README 更新到最新
- [ ] 环境变量文档完整
- [ ] 部署指南准确

---

## 获取帮助

### 问题排查顺序

1. 查看浏览器控制台
2. 查看 README 的故障排除部分
3. 检查相关文档链接
4. 搜索 GitHub Issues (如果项目开源)

### 有用的资源

- [WebContainer 官方文档](https://webcontainers.io/guides/introduction)
- [Next.js 14 文档](https://nextjs.org/docs)
- [rrweb 指南](https://www.rrweb.io/docs)
- [Supabase 快速入门](https://supabase.com/docs/guides/getting-started)

---

## 未来路线图

### 短期 (1-2 周)

- [ ] 完整的 GitHub OAuth 实现
- [ ] Apify 集成
- [ ] 单元测试覆盖
- [ ] E2E 测试

### 中期 (1-3 个月)

- [ ] 专用回放播放器
- [ ] 管理后台
- [ ] 多语言支持 (Python, Go, Rust)
- [ ] AI 代码审查

### 长期 (3+ 个月)

- [ ] 实时协作
- [ ] 移动端支持
- [ ] 难度自适应算法
- [ ] 企业版功能

---

感谢你对 ShadowWork 的贡献！🚀

