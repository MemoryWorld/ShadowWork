/**
 * 统一的 LLM 客户端，支持 OpenAI 和 Ollama
 */

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMCompletionOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' };
}

interface LLMCompletionResult {
  content: string | null;
}

// 获取环境变量（兼容 Next.js 环境）
// 在 Next.js 中，process.env 是全局可用的
declare const process: {
  env: Record<string, string | undefined>;
};

function getEnv(key: string, defaultValue: string = ''): string {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  return defaultValue;
}

/**
 * 使用 Ollama API 进行对话完成
 */
async function callOllama(
  messages: LLMMessage[],
  options: LLMCompletionOptions
): Promise<LLMCompletionResult> {
  const baseURL = getEnv('OLLAMA_BASE_URL', 'http://localhost:11434');
  const model = options.model || getEnv('OLLAMA_MODEL', 'qwen2.5:14b');

  // 分离 system 消息和用户消息
  const systemMessages = messages.filter(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');
  
  const systemPrompt = systemMessages.map(m => m.content).join('\n\n');
  
  // 构建消息数组，Ollama 最新版本支持 system 角色
  const ollamaMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
  
  // 如果有 system prompt，添加为 system 消息（Ollama 支持 system 角色）
  if (systemPrompt) {
    ollamaMessages.push({
      role: 'system',
      content: systemPrompt,
    });
  }
  
  // 添加用户消息和助手消息
  userMessages.forEach(m => {
    ollamaMessages.push({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    });
  });

  const requestBody: any = {
    model,
    messages: ollamaMessages,
    stream: false,
    options: {
      temperature: options.temperature ?? 0.7,
    },
  };

  // 如果设置了 max_tokens，使用 num_predict
  if (options.max_tokens) {
    requestBody.options.num_predict = options.max_tokens;
  }

  // 如果要求 JSON 格式
  if (options.response_format?.type === 'json_object') {
    requestBody.format = 'json';
  }

  const response = await fetch(`${baseURL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return {
    content: data.message?.content || null,
  };
}

/**
 * 使用 OpenAI API 进行对话完成
 */
async function callOpenAI(
  messages: LLMMessage[],
  options: LLMCompletionOptions
): Promise<LLMCompletionResult> {
  // 动态导入 OpenAI（仅在使用时导入）
  // @ts-ignore - openai 包已安装，但 TypeScript 可能无法解析动态导入
  const { default: OpenAI } = await import('openai');
  
  const openai = new OpenAI({
    apiKey: getEnv('OPENAI_API_KEY', ''),
    baseURL: getEnv('OPENAI_BASE_URL') || undefined,
  });

  const completion = await openai.chat.completions.create({
    model: options.model || getEnv('OPENAI_MODEL', 'gpt-4o'),
    messages: messages as any,
    temperature: options.temperature,
    max_tokens: options.max_tokens,
    response_format: options.response_format,
  });

  return {
    content: completion.choices[0]?.message?.content || null,
  };
}

/**
 * 统一的 LLM 调用接口
 */
export async function createChatCompletion(
  messages: LLMMessage[],
  options: LLMCompletionOptions = {}
): Promise<LLMCompletionResult> {
  const provider = getEnv('LLM_PROVIDER', 'ollama'); // 默认使用 ollama

  if (provider === 'ollama') {
    return callOllama(messages, options);
  } else if (provider === 'openai') {
    return callOpenAI(messages, options);
  } else {
    throw new Error(`Unknown LLM provider: ${provider}`);
  }
}
