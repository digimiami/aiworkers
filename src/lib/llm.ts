import axios from 'axios';

export type LLMProvider = 'deepseek' | 'manus' | 'kimi' | 'gemini' | 'openai';

interface LLMConfig {
  name: string;
  url: string;
  model: string;
  keyEnv: string;
}

const LLM_CONFIGS: Record<LLMProvider, LLMConfig> = {
  deepseek: {
    name: 'DeepSeek',
    url: 'https://api.deepseek.com/chat/completions',
    model: 'deepseek-chat',
    keyEnv: 'DEEPSEEK_API_KEY',
  },
  manus: {
    name: 'Manus (GPT-4.1-mini)',
    url: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4.1-mini',
    keyEnv: 'MANUS_API_KEY',
  },
  kimi: {
    name: 'Kimi',
    url: 'https://api.moonshot.cn/v1/chat/completions',
    model: 'moonshot-v1-8k',
    keyEnv: 'KIMI_API',
  },
  gemini: {
    name: 'Gemini',
    url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    model: 'gemini-2.5-flash',
    keyEnv: 'GEMINI_API',
  },
  openai: {
    name: 'OpenAI',
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4.1-mini',
    keyEnv: 'OPENAI_KEY',
  },
};

export function getAvailableLLMs(): { id: LLMProvider; name: string }[] {
  return Object.entries(LLM_CONFIGS).map(([id, config]) => ({
    id: id as LLMProvider,
    name: config.name,
  }));
}

export async function callLLM(
  provider: LLMProvider,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 4000
): Promise<string> {
  const config = LLM_CONFIGS[provider];
  if (!config) throw new Error(`Unknown LLM provider: ${provider}`);

  const apiKey = process.env[config.keyEnv];
  if (!apiKey) throw new Error(`API key not configured for ${config.name}. Set ${config.keyEnv} env variable.`);

  try {
    const response = await axios.post(
      config.url,
      {
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 60000,
      }
    );

    return response.data.choices?.[0]?.message?.content || '';
  } catch (error: any) {
    console.error(`LLM error (${config.name}):`, error.response?.data || error.message);
    throw new Error(`Failed to generate with ${config.name}: ${error.response?.data?.error?.message || error.message}`);
  }
}
