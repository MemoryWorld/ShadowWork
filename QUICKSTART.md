# 快速启动指南 (5 分钟)

## ⚡ 超快开始（无需配置）

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 打开浏览器
# http://localhost:3000
```

点击 "Start Challenge" → 自动使用 Mock 模式 → 立即开始编码！

✅ 无需任何环境变量  
✅ 无需 API 密钥  
✅ 无需数据库  

---

## 🎯 第一次使用？

### 步骤 1: 测试着陆页

访问 [http://localhost:3000](http://localhost:3000)

你应该看到一个现代化的着陆页：
- 渐变背景
- "Zero-Resume, Proof-of-Work" 标题
- "Start Challenge" 按钮

### 步骤 2: 进入挑战模式

点击 "Start Challenge" 按钮

浏览器会导航到 `/challenge?mock=true`

**等待加载**:
1. "Loading challenge..." (1秒)
2. "Booting WebContainer..." (3-5秒)
3. 编辑器出现！

### 步骤 3: 开始编码

**界面说明**:
- 左侧: 文件列表
- 中间: Monaco 编辑器（类似 VS Code）
- 右侧: 输出面板

**操作**:
1. 点击左侧文件（如 `server.js`）
2. 在编辑器中修改代码
3. 点击 "Run" 运行代码
4. 查看右侧输出

### 步骤 4: 观察录制

顶部会显示:
```
🔴 Recording (234 events)
```

这表示 rrweb 正在记录你的操作！

### 步骤 5: 提交（可选）

点击 "Submit" 按钮

**如果未配置 Supabase**:
- 会显示成功消息（模拟提交）
- 不会实际上传文件

**如果已配置 Supabase**:
- 录像上传到云端
- 保存到数据库
- 发送 Slack 通知
- 跳转到成功页面

---

## 🔧 常见问题

### Q: WebContainer 无法启动

**症状**: 一直显示 "Booting WebContainer..."

**解决方案**:
1. 确保使用 Chrome 或 Edge 浏览器（最新版）
2. 打开浏览器控制台 (F12)
3. 查看是否有错误信息
4. 检查是否看到:
   ```
   Cross-Origin-Embedder-Policy: require-corp
   Cross-Origin-Opener-Policy: same-origin
   ```

### Q: 找不到 Mock 数据

**症状**: 显示 "Failed to load task"

**解决方案**:
```bash
# 检查文件是否存在
ls src/data/mock-task.json

# 如果不存在，项目结构可能有问题
# 重新克隆项目
```

### Q: 编辑器显示空白

**症状**: Monaco Editor 区域是白色的

**解决方案**:
1. 等待 2-3 秒（Monaco 需要加载）
2. 刷新页面 (F5)
3. 清除浏览器缓存

### Q: npm install 很慢

**症状**: 安装依赖超过 5 分钟

**解决方案**:
```bash
# 清除 npm 缓存
npm cache clean --force

# 使用淘宝镜像（中国用户）
npm install --registry=https://registry.npmmirror.com

# 或使用 cnpm
npm install -g cnpm --registry=https://registry.npmmirror.com
cnpm install
```

---

## 📋 功能检查清单

启动后，依次测试以下功能：

- [ ] 着陆页加载正常
- [ ] 点击 "Start Challenge" 跳转成功
- [ ] WebContainer 启动成功（3-5秒）
- [ ] 可以看到文件列表（左侧）
- [ ] 可以切换文件
- [ ] 可以在编辑器中输入代码
- [ ] 顶部显示 "Recording" 红点
- [ ] 点击 "Run" 按钮有响应
- [ ] 右侧输出面板显示内容
- [ ] 点击 "Submit" 按钮可以提交
- [ ] 跳转到成功页面

如果所有项都通过，恭喜！项目运行完美 🎉

---

## 🚀 下一步

### 选项 1: 继续使用 Mock 模式

适合：演示、开发 UI、学习代码

**优点**:
- 无需任何配置
- 立即可用
- 完全离线工作

### 选项 2: 配置完整功能

适合：生产部署、真实使用

**步骤**:
1. 复制 `.env.example` 到 `.env.local`
2. 配置 Supabase（见 README）
3. 配置 OpenAI API Key（可选）
4. 配置 Slack Webhook（可选）
5. 重启服务器

### 选项 3: 部署到生产

适合：分享给他人、正式使用

**推荐**: Vercel 一键部署

```bash
# 安装 Vercel CLI
npm install -g vercel

# 部署
vercel
```

详见 `DEPLOYMENT.md`

---

## 💡 提示

### 快捷键

- `Ctrl/Cmd + S`: 保存文件（自动）
- `Ctrl/Cmd + /`: 切换注释
- `Ctrl/Cmd + F`: 查找
- `F12`: 打开浏览器开发者工具

### 开发技巧

1. **查看日志**: 打开浏览器控制台，所有操作都有详细日志
   ```
   [WebContainer] Boot successful
   [useRecorder] Starting recording
   [Workspace] Task loaded successfully
   ```

2. **修改 Mock 数据**: 编辑 `src/data/mock-task.json` 自定义挑战内容

3. **调整录制参数**: 编辑 `src/hooks/useRecorder.ts` 修改采样率

4. **自定义主题**: 修改 `src/app/globals.css` 和 Tailwind 配置

---

## 📚 学习资源

**理解项目**:
- `README.md` - 完整文档
- `ARCHITECTURE.md` - 架构说明
- `CONTRIBUTING.md` - 开发指南

**技术文档**:
- [WebContainer 官方文档](https://webcontainers.io/)
- [Next.js 快速入门](https://nextjs.org/learn)
- [rrweb 使用指南](https://www.rrweb.io/docs)

**视频教程** (推荐):
- WebContainer 介绍: [YouTube](https://www.youtube.com/watch?v=xxx)
- Next.js 14 新特性: [YouTube](https://www.youtube.com/watch?v=xxx)

---

## 🎊 完成！

如果你已经成功运行项目，你现在拥有：

✅ 一个完整的浏览器内编码平台  
✅ 支持真实 Node.js 代码执行  
✅ 自动会话录制功能  
✅ 现代化的 UI/UX  
✅ 生产级代码架构  

继续探索，祝你编码愉快！🚀

