# Ollama 配置指南

本项目已支持使用 Ollama 本地模型替代 OpenAI API，可以免费使用。

## 安装 Ollama

### Windows

1. 访问 [Ollama 官网](https://ollama.ai/download) 下载 Windows 版本
2. 或者使用 winget：
   ```bash
   winget install Ollama.Ollama
   ```

### macOS / Linux

```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

## 下载模型

安装完成后，下载 qwen2.5:14b 模型：

```bash
ollama pull qwen2.5:14b
```

> **注意**: qwen2.5:14b 是一个 14B 参数的模型，需要约 10GB 磁盘空间和 8GB+ 内存。如果资源有限，可以使用更小的模型：
> - `qwen2.5:7b` - 7B 参数，约 5GB
> - `qwen2.5:3b` - 3B 参数，约 2GB
> - `llama3.2:3b` - 3B 参数，约 2GB

## 启动 Ollama

Ollama 通常会自动启动。如果未启动，手动启动：

### Windows
Ollama 会在安装后自动启动，或在开始菜单中找到 "Ollama" 应用。

### macOS / Linux
```bash
ollama serve
```

验证 Ollama 是否运行：
```bash
curl http://localhost:11434/api/tags
```

应该返回已安装的模型列表。

## 配置环境变量

在项目根目录创建 `.env.local` 文件（如果不存在），添加以下配置：

```env
# 使用 Ollama
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:14b
```

## 切换回 OpenAI

如果需要使用 OpenAI，只需修改环境变量：

```env
# 使用 OpenAI
LLM_PROVIDER=openai
OPENAI_API_KEY=your_openai_key_here
OPENAI_MODEL=gpt-4o
```

## 测试

1. 确保 Ollama 正在运行
2. 启动开发服务器：
   ```bash
   npm run dev
   ```
3. 访问生成任务页面，应该会使用 Ollama 模型生成任务

## 常见问题

### Q: Ollama 连接失败？

**A**: 检查 Ollama 是否正在运行：
```bash
# Windows PowerShell
Test-NetConnection -ComputerName localhost -Port 11434

# macOS/Linux
curl http://localhost:11434/api/tags
```

如果连接失败，确保 Ollama 服务已启动。

### Q: 模型响应慢？

**A**: qwen2.5:14b 是较大的模型，可能需要较长时间。可以：
- 使用更小的模型（如 `qwen2.5:7b`）
- 确保有足够的系统内存
- 检查 CPU/GPU 使用情况

### Q: JSON 格式输出不正确？

**A**: Ollama 的 JSON 格式支持可能因模型而异。qwen2.5 模型对 JSON 格式支持较好。如果遇到问题：
- 确保使用 qwen2.5 系列模型
- 检查提示词是否明确要求 JSON 格式

## 支持的模型

推荐使用的模型（按性能排序）：

1. **qwen2.5:14b** - 最佳性能，需要 8GB+ 内存
2. **qwen2.5:7b** - 平衡性能与资源
3. **llama3.1:8b** - 备选方案
4. **mistral:7b** - 较小的模型

## 性能对比

| 模型 | 参数 | 内存需求 | 生成速度 | 质量 |
|------|------|---------|---------|------|
| qwen2.5:14b | 14B | ~10GB | 较慢 | 高 |
| qwen2.5:7b | 7B | ~5GB | 中等 | 中高 |
| qwen2.5:3b | 3B | ~2GB | 快 | 中 |

选择模型时，请根据您的硬件配置和需求选择合适的模型。
