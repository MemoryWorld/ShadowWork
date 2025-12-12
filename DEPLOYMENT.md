# 部署指南

## Vercel 部署（推荐）

### 步骤 1: 准备工作

1. 确保项目推送到 GitHub/GitLab
2. 注册 [Vercel 账号](https://vercel.com)

### 步骤 2: 导入项目

1. 在 Vercel Dashboard 点击 "New Project"
2. 导入你的 Git 仓库
3. 选择 "Next.js" 框架（自动检测）

### 步骤 3: 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

```env
# Supabase (必需)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# OpenAI (生产模式必需)
OPENAI_API_KEY=sk-xxx

# Slack (可选)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx

# Apify (可选)
APIFY_API_TOKEN=xxx
```

### 步骤 4: 部署

点击 "Deploy"，Vercel 会自动：
- 安装依赖
- 构建项目
- 部署到全球 CDN

### 步骤 5: 验证

部署成功后，访问 `your-project.vercel.app` 检查：
1. 着陆页加载正常
2. 访问 `/challenge?mock=true` 测试 WebContainer
3. 检查浏览器控制台是否有 COOP/COEP 头部

---

## 其他平台部署

### Netlify

Netlify 当前不支持 WebContainer 所需的 COOP/COEP 头部。

### 自托管

如需自托管，使用 Nginx 添加头部：

```nginx
add_header Cross-Origin-Embedder-Policy "require-corp";
add_header Cross-Origin-Opener-Policy "same-origin";
```

---

## Supabase 生产配置

### 1. 创建生产项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 创建新项目（选择合适的区域）

### 2. 运行 Schema

在 SQL Editor 中执行 `supabase-setup.sql`

### 3. 配置 Storage

1. 创建 bucket: `recordings`
2. 设置 Public 访问（或配置 Signed URLs）
3. 配置 CORS:
   ```json
   {
     "allowedOrigins": ["https://your-domain.vercel.app"],
     "allowedMethods": ["GET", "POST", "PUT", "DELETE"],
     "allowedHeaders": ["*"],
     "maxAgeSeconds": 3600
   }
   ```

### 4. 配置认证

1. 在 Authentication → Providers 中启用 GitHub
2. 添加 GitHub OAuth App 的 Client ID 和 Secret
3. 设置回调 URL: `https://your-domain.vercel.app/api/auth/callback`

---

## 域名配置

### 在 Vercel 中添加自定义域名

1. 项目设置 → Domains
2. 添加你的域名
3. 按照提示配置 DNS

### 重要: 确保 COOP/COEP 头部生效

使用 curl 验证：

```bash
curl -I https://your-domain.com

# 应该看到:
# cross-origin-embedder-policy: require-corp
# cross-origin-opener-policy: same-origin
```

---

## 性能监控

### Vercel Analytics

1. 在项目设置中启用 Analytics
2. 监控 Web Vitals 和流量

### Supabase Logs

1. 在 Supabase Dashboard → Logs 查看数据库查询
2. 监控 Storage 使用量

---

## 安全检查清单

- [ ] 环境变量已正确设置
- [ ] Supabase RLS 已启用
- [ ] Storage bucket 权限正确
- [ ] Slack Webhook URL 保密
- [ ] OpenAI API 密钥未暴露到客户端
- [ ] CORS 配置正确

---

## 故障排除

### WebContainer 在生产环境无法启动

**检查**: Response Headers 是否包含 COOP/COEP

```bash
curl -I https://your-domain.com
```

### Supabase 连接失败

**检查**: 
1. 环境变量拼写正确
2. Supabase 项目未暂停
3. CORS 配置允许你的域名

### 录制上传失败

**检查**:
1. Storage bucket 存在且公开
2. 文件大小未超过限制（50MB）
3. 检查 Supabase Storage 日志

