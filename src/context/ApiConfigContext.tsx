import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY_STORAGE = '@global_opencode_api_key';
const GEMINI_API_KEY_STORAGE = '@global_gemini_api_key';
const MODEL_STORAGE = '@global_opencode_model';
const PROVIDER_STORAGE = '@global_active_provider';
const BASE_URL_STORAGE = '@global_opencode_base_url';

export const DEFAULT_OPENCODE_BASE_URL = 'https://opencode.ai/zen/v1';

export type AIProvider = 'gemini' | 'opencode';

export interface OpenCodeModelItem {
  id: string;
  name: string;
  apiModelId: string;
  provider: 'Google Gemini' | 'OpenCode Zen' | 'OpenCode' | 'OpenAI' | 'Anthropic';
  badge: string;
  isFree?: boolean;
}

export const ALL_AI_MODELS: OpenCodeModelItem[] = [
  // Google Gemini Latest 3.x & 2.x Models
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro Low',
    apiModelId: 'gemini-3.1-pro-preview',
    provider: 'Google Gemini',
    badge: 'Latest Pro',
    isFree: false,
  },
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash Medium',
    apiModelId: 'gemini-3.7-flash',
    provider: 'Google Gemini',
    badge: 'Fast Flagship',
    isFree: false,
  },
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash Medium',
    apiModelId: 'gemini-3.6-flash',
    provider: 'Google Gemini',
    badge: 'Fast Medium',
    isFree: false,
  },
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash Medium',
    apiModelId: 'gemini-3.5-flash',
    provider: 'Google Gemini',
    badge: 'Fast Medium',
    isFree: false,
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    apiModelId: 'gemini-2.5-pro',
    provider: 'Google Gemini',
    badge: 'Flagship Reasoning',
    isFree: false,
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    apiModelId: 'gemini-2.5-flash',
    provider: 'Google Gemini',
    badge: 'Next-Gen Fast',
    isFree: false,
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    apiModelId: 'gemini-2.0-flash',
    provider: 'Google Gemini',
    badge: 'Fast & Smart',
    isFree: true,
  },
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
    apiModelId: 'gemini-2.0-flash-lite',
    provider: 'Google Gemini',
    badge: 'Ultra Fast',
    isFree: true,
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    apiModelId: 'gemini-1.5-pro',
    provider: 'Google Gemini',
    badge: '2M Context',
    isFree: false,
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    apiModelId: 'gemini-1.5-flash',
    provider: 'Google Gemini',
    badge: 'Balanced',
    isFree: true,
  },

  // Anthropic & Other Advanced Models (via OpenCode / Direct)
  {
    id: 'claude-sonnet-4.6',
    name: 'Claude Sonnet 4.6 (Thinking)',
    apiModelId: 'claude-sonnet-4.6',
    provider: 'Anthropic',
    badge: 'Thinking',
    isFree: false,
  },
  {
    id: 'claude-opus-4.6',
    name: 'Claude Opus 4.6 (Thinking)',
    apiModelId: 'claude-opus-4.6',
    provider: 'Anthropic',
    badge: 'Thinking',
    isFree: false,
  },
  {
    id: 'gpt-oss-120b',
    name: 'GPT-OSS 120B (Medium)',
    apiModelId: 'gpt-oss-120b',
    provider: 'OpenCode Zen',
    badge: 'Medium',
    isFree: true,
  },

  // OpenCode Zen Free Models
  {
    id: 'ox-alpha-free',
    name: 'Ox Alpha Free (Unlimited)',
    apiModelId: 'ox-alpha-free',
    provider: 'OpenCode Zen',
    badge: 'Unlimited Free',
    isFree: true,
  },
  {
    id: 'nemotron-3.5-lightning-free',
    name: 'Nemotron 3.5 Lightning Free',
    apiModelId: 'nemotron-3.5-lightning-free',
    provider: 'OpenCode Zen',
    badge: 'Free',
    isFree: true,
  },
  {
    id: 'mimo-v2.5-free',
    name: 'MiMo V2.5 Free',
    apiModelId: 'mimo-v2.5-free',
    provider: 'OpenCode Zen',
    badge: 'Free',
    isFree: true,
  },
  {
    id: 'muse-spark-1.2-free',
    name: 'Muse Spark 1.2 Free',
    apiModelId: 'muse-spark-1.2-free',
    provider: 'OpenCode Zen',
    badge: 'Free',
    isFree: true,
  },
  {
    id: 'hy3-free',
    name: 'Hy3 Free',
    apiModelId: 'hy3-free',
    provider: 'OpenCode Zen',
    badge: 'Free',
    isFree: true,
  },
  {
    id: 'nemotron-3-ultra-free',
    name: 'Nemotron 3 Ultra Free',
    apiModelId: 'nemotron-3-ultra-free',
    provider: 'OpenCode Zen',
    badge: 'Free',
    isFree: true,
  },
  {
    id: 'big-pickle',
    name: 'Big Pickle',
    apiModelId: 'big-pickle',
    provider: 'OpenCode Zen',
    badge: 'Free',
    isFree: true,
  },
  {
    id: 'deepseek-v4-flash-free',
    name: 'DeepSeek V4 Flash Free',
    apiModelId: 'deepseek-v4-flash-free',
    provider: 'OpenCode Zen',
    badge: 'Free',
    isFree: true,
  },
  {
    id: 'qwen3.6-plus-free',
    name: 'Qwen 3.6 Plus Free',
    apiModelId: 'qwen3.6-plus-free',
    provider: 'OpenCode Zen',
    badge: 'Free',
    isFree: true,
  },
  {
    id: 'glm-4',
    name: 'OpenCode GLM-4',
    apiModelId: 'glm-4',
    provider: 'OpenCode',
    badge: 'Standard',
    isFree: false,
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    apiModelId: 'deepseek-v3',
    provider: 'OpenCode',
    badge: 'Fast',
    isFree: false,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    apiModelId: 'gpt-4o',
    provider: 'OpenAI',
    badge: 'Premium',
    isFree: false,
  },
];

export const DEFAULT_OPENCODE_MODELS = ALL_AI_MODELS;

interface ApiConfigContextType {
  activeProvider: AIProvider;
  apiKey: string;
  geminiApiKey: string;
  model: string;
  baseUrl: string;
  hasApiKey: boolean;
  hasGeminiApiKey: boolean;
  isCurrentProviderConfigured: boolean;
  loading: boolean;
  availableModels: OpenCodeModelItem[];
  setActiveProvider: (provider: AIProvider) => void;
  saveApiConfig: (
    newApiKey: string,
    newModel: string,
    newBaseUrl?: string,
    newGeminiApiKey?: string,
    newProvider?: AIProvider,
  ) => Promise<void>;
  fetchLiveModels: (keyToTest?: string, urlToTest?: string) => Promise<OpenCodeModelItem[]>;
  fetchLiveGeminiModels: (keyToTest?: string) => Promise<OpenCodeModelItem[]>;
  sendMessageToAI: (
    history: Array<{role: 'user' | 'assistant' | 'system'; content: string}>,
    prompt: string,
  ) => Promise<string>;
}

const ApiConfigContext = createContext<ApiConfigContextType | undefined>(
  undefined,
);

export function ApiConfigProvider({children}: {children: React.ReactNode}) {
  const [activeProvider, setActiveProviderState] = useState<AIProvider>('gemini');
  const [apiKey, setApiKey] = useState<string>('');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [model, setModel] = useState<string>('gemini-3.1-pro-preview');
  const [baseUrl, setBaseUrl] = useState<string>(DEFAULT_OPENCODE_BASE_URL);
  const [availableModels, setAvailableModels] = useState<OpenCodeModelItem[]>(
    ALL_AI_MODELS,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const savedProvider = (await AsyncStorage.getItem(PROVIDER_STORAGE)) as AIProvider;
        const savedKey = await AsyncStorage.getItem(API_KEY_STORAGE);
        const savedGeminiKey = await AsyncStorage.getItem(GEMINI_API_KEY_STORAGE);
        const savedModel = await AsyncStorage.getItem(MODEL_STORAGE);
        const savedUrl = await AsyncStorage.getItem(BASE_URL_STORAGE);

        if (savedKey) setApiKey(savedKey);
        if (savedGeminiKey) setGeminiApiKey(savedGeminiKey);
        if (savedModel) setModel(savedModel);

        if (savedProvider === 'gemini' || savedProvider === 'opencode') {
          setActiveProviderState(savedProvider);
        } else if (savedModel && savedModel.toLowerCase().startsWith('gemini')) {
          setActiveProviderState('gemini');
        } else if (savedGeminiKey && !savedKey) {
          setActiveProviderState('gemini');
        }

        if (savedUrl && !savedUrl.includes('api.opencode.ai')) {
          setBaseUrl(savedUrl);
        } else {
          setBaseUrl(DEFAULT_OPENCODE_BASE_URL);
          await AsyncStorage.setItem(BASE_URL_STORAGE, DEFAULT_OPENCODE_BASE_URL);
        }
      } catch (err) {
        console.warn('Failed to load global API config:', err);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const setActiveProvider = useCallback((provider: AIProvider) => {
    setActiveProviderState(provider);
    AsyncStorage.setItem(PROVIDER_STORAGE, provider).catch(() => {});
    if (provider === 'gemini' && !model.toLowerCase().startsWith('gemini')) {
      setModel('gemini-3.1-pro-preview');
      AsyncStorage.setItem(MODEL_STORAGE, 'gemini-3.1-pro-preview').catch(() => {});
    } else if (provider === 'opencode' && model.toLowerCase().startsWith('gemini')) {
      setModel('ox-alpha-free');
      AsyncStorage.setItem(MODEL_STORAGE, 'ox-alpha-free').catch(() => {});
    }
  }, [model]);

  // Fetch Live Models from Google Gemini
  const fetchLiveGeminiModels = useCallback(
    async (keyToTest?: string): Promise<OpenCodeModelItem[]> => {
      const activeKey = keyToTest || geminiApiKey;
      if (!activeKey.trim()) return ALL_AI_MODELS;

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${activeKey.trim()}`;
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          const list = data.models || [];
          if (Array.isArray(list) && list.length > 0) {
            const mappedGemini: OpenCodeModelItem[] = list
              .filter((m: any) =>
                m.supportedGenerationMethods?.includes('generateContent'),
              )
              .map((m: any) => {
                const cleanId = m.name.replace(/^models\//, '');
                return {
                  id: cleanId,
                  name: m.displayName || cleanId,
                  apiModelId: cleanId,
                  provider: 'Google Gemini' as const,
                  badge: cleanId.includes('flash') ? 'Flash' : 'Pro',
                  isFree: false,
                };
              });

            const nonGemini = ALL_AI_MODELS.filter(
              m => m.provider !== 'Google Gemini',
            );
            const combined = [...mappedGemini, ...nonGemini];
            setAvailableModels(combined);
            return combined;
          }
        }
      } catch (err) {
        console.warn('Failed to fetch live Gemini models:', err);
      }
      return ALL_AI_MODELS;
    },
    [geminiApiKey],
  );

  const fetchLiveModels = useCallback(
    async (
      keyToTest?: string,
      urlToTest?: string,
    ): Promise<OpenCodeModelItem[]> => {
      const activeKey = keyToTest || apiKey;
      const activeUrl = urlToTest || baseUrl || DEFAULT_OPENCODE_BASE_URL;

      const cleanBase = activeUrl.replace(/\/+$/, '');
      const modelsEndpoint = cleanBase.endsWith('/models')
        ? cleanBase
        : `${cleanBase}/models`;

      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (activeKey.trim()) {
          headers.Authorization = `Bearer ${activeKey.trim()}`;
        }

        const response = await fetch(modelsEndpoint, {
          method: 'GET',
          headers,
        });

        if (response.ok) {
          const data = await response.json();
          const list = Array.isArray(data) ? data : data.data || [];
          if (Array.isArray(list) && list.length > 0) {
            const mapped: OpenCodeModelItem[] = list.map((item: any) => {
              const modelId = typeof item === 'string' ? item : item.id || item.name;
              const isFree =
                modelId.toLowerCase().includes('free') ||
                modelId.toLowerCase().includes('spark') ||
                modelId.toLowerCase().includes('alpha') ||
                modelId.toLowerCase().includes('pickle');

              return {
                id: modelId,
                name: modelId,
                apiModelId: modelId,
                provider: 'OpenCode Zen' as const,
                badge: isFree ? 'Free' : 'Model',
                isFree,
              };
            });

            const geminiModels = ALL_AI_MODELS.filter(
              m => m.provider === 'Google Gemini',
            );
            const combined = [...geminiModels, ...mapped];

            setAvailableModels(combined);
            return combined;
          }
        }
      } catch (err) {
        console.warn('Could not fetch live models:', err);
      }
      return ALL_AI_MODELS;
    },
    [apiKey, baseUrl],
  );

  const saveApiConfig = useCallback(
    async (
      newApiKey: string,
      newModel: string,
      newBaseUrl?: string,
      newGeminiApiKey?: string,
      newProvider?: AIProvider,
    ) => {
      const cleanKey = newApiKey.trim();
      const cleanGeminiKey =
        newGeminiApiKey !== undefined ? newGeminiApiKey.trim() : geminiApiKey;
      const cleanModel =
        newModel.trim() ||
        (newProvider === 'opencode' ? 'ox-alpha-free' : 'gemini-3.1-pro-preview');
      const cleanUrl =
        newBaseUrl?.trim() || DEFAULT_OPENCODE_BASE_URL;

      const determinedProvider: AIProvider =
        newProvider ||
        (cleanModel.toLowerCase().startsWith('gemini') ? 'gemini' : 'opencode');

      setActiveProviderState(determinedProvider);
      setApiKey(cleanKey);
      setGeminiApiKey(cleanGeminiKey);
      setModel(cleanModel);
      setBaseUrl(cleanUrl);

      try {
        await AsyncStorage.setItem(PROVIDER_STORAGE, determinedProvider);
        await AsyncStorage.setItem(API_KEY_STORAGE, cleanKey);
        await AsyncStorage.setItem(GEMINI_API_KEY_STORAGE, cleanGeminiKey);
        await AsyncStorage.setItem(MODEL_STORAGE, cleanModel);
        await AsyncStorage.setItem(BASE_URL_STORAGE, cleanUrl);
      } catch (err) {
        console.warn('Failed to save global API config:', err);
      }
    },
    [geminiApiKey],
  );

  const callChatApi = async (
    endpoint: string,
    targetModel: string,
    messages: Array<{role: string; content: string}>,
    key: string,
  ): Promise<string> => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key.trim()}`,
      },
      body: JSON.stringify({
        model: targetModel,
        messages,
      }),
    });

    const rawText = await response.text();

    let data: any = null;
    try {
      data = JSON.parse(rawText);
    } catch {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${rawText.slice(0, 150)}`);
      }
      if (rawText && rawText.trim()) {
        return rawText.trim();
      }
      throw new Error('Non-JSON response received from server.');
    }

    if (!response.ok) {
      const errMsg =
        data?.error?.message ||
        data?.message ||
        `HTTP ${response.status} Error`;
      throw new Error(errMsg);
    }

    const aiResponse =
      data?.choices?.[0]?.message?.content ||
      data?.message?.content ||
      data?.response ||
      '';

    if (!aiResponse && typeof data === 'string') {
      return data;
    }

    return aiResponse || 'No response generated.';
  };

  const callGeminiApi = async (
    targetModel: string,
    systemPrompt: string,
    history: Array<{role: 'user' | 'assistant' | 'system'; content: string}>,
    prompt: string,
    key: string,
  ): Promise<string> => {
    const cleanModel = targetModel.replace(/^models\//, '');
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${key.trim()}`;

    const formattedContents: Array<{role: string; parts: Array<{text: string}>}> = [];

    // System instruction formatted for broad compatibility
    formattedContents.push({
      role: 'user',
      parts: [{text: `[System Instruction: ${systemPrompt}]`}],
    });
    formattedContents.push({
      role: 'model',
      parts: [{text: 'Understood. I will follow these instructions.'}],
    });

    // History
    for (const h of history) {
      formattedContents.push({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{text: h.content}],
      });
    }

    // Current prompt
    formattedContents.push({
      role: 'user',
      parts: [{text: prompt}],
    });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: formattedContents,
        generationConfig: {
          temperature: 0.7,
        },
      }),
    });

    const rawText = await response.text();
    let data: any = null;
    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error(`Gemini API Error: ${rawText.slice(0, 150)}`);
    }

    if (!response.ok) {
      const errMsg =
        data?.error?.message ||
        data?.message ||
        `Google Gemini Error (${response.status})`;
      throw new Error(errMsg);
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return reply || 'No response generated by Gemini.';
  };

  const isCurrentProviderConfigured =
    activeProvider === 'gemini' ? !!geminiApiKey.trim() : !!apiKey.trim();

  const sendMessageToAI = useCallback(
    async (
      history: Array<{role: 'user' | 'assistant' | 'system'; content: string}>,
      prompt: string,
    ): Promise<string> => {
      const systemInstruction =
        'You are an AI assistant in VibeCode for video scripting and asset generation. When suggesting visual scenes or prompts, wrap each in <Image>description</Image> tags. When suggesting voiceover or dialogue lines, wrap each in <Audio>dialogue</Audio> tags.';

      const isGemini =
        activeProvider === 'gemini' || model.toLowerCase().startsWith('gemini');

      // 1. Google Gemini API Call
      if (isGemini) {
        if (!geminiApiKey.trim()) {
          throw new Error('MISSING_GEMINI_KEY');
        }
        return await callGeminiApi(
          model,
          systemInstruction,
          history,
          prompt,
          geminiApiKey,
        );
      }

      // 2. OpenCode Zen / OpenAI API Call
      if (!apiKey.trim()) {
        throw new Error('MISSING_API_KEY');
      }

      const formattedMessages = [
        {
          role: 'system',
          content: systemInstruction,
        },
        ...history.map(m => ({role: m.role, content: m.content})),
        {role: 'user', content: prompt},
      ];

      const cleanBase = (baseUrl || DEFAULT_OPENCODE_BASE_URL).replace(
        /\/+$/,
        '',
      );
      const endpoint = cleanBase.endsWith('/chat/completions')
        ? cleanBase
        : `${cleanBase}/chat/completions`;

      const matched =
        availableModels.find(
          m => m.id === model || m.name === model || m.apiModelId === model,
        ) ||
        ALL_AI_MODELS.find(
          m => m.id === model || m.name === model || m.apiModelId === model,
        );

      let cleanModelId = matched?.apiModelId || model;
      if (cleanModelId.startsWith('opencode/')) {
        cleanModelId = cleanModelId.replace(/^opencode\//, '');
      }

      try {
        return await callChatApi(
          endpoint,
          cleanModelId,
          formattedMessages,
          apiKey,
        );
      } catch (err: any) {
        const errorStr = (err.message || '').toLowerCase();
        const isRateLimit =
          errorStr.includes('rate limit') ||
          errorStr.includes('429') ||
          errorStr.includes('limit exceeds') ||
          errorStr.includes('exceeded');

        if (isRateLimit && cleanModelId !== 'ox-alpha-free') {
          try {
            console.log(`Rate limit on ${cleanModelId}. Falling back to ox-alpha-free...`);
            const fallbackResponse = await callChatApi(
              endpoint,
              'ox-alpha-free',
              formattedMessages,
              apiKey,
            );
            return fallbackResponse;
          } catch {
            throw new Error(
              `Rate limit reached on ${cleanModelId}. Try switching to "Ox Alpha Free (Unlimited)" or "Gemini 3.1 Pro Low / 3.7 Flash".`,
            );
          }
        }

        if (err.message === 'MISSING_API_KEY') throw err;
        throw new Error(err.message || 'Failed to communicate with AI API');
      }
    },
    [activeProvider, apiKey, geminiApiKey, model, baseUrl, availableModels],
  );

  return (
    <ApiConfigContext.Provider
      value={{
        activeProvider,
        apiKey,
        geminiApiKey,
        model,
        baseUrl,
        hasApiKey: !!apiKey.trim(),
        hasGeminiApiKey: !!geminiApiKey.trim(),
        isCurrentProviderConfigured,
        loading,
        availableModels,
        setActiveProvider,
        saveApiConfig,
        fetchLiveModels,
        fetchLiveGeminiModels,
        sendMessageToAI,
      }}>
      {children}
    </ApiConfigContext.Provider>
  );
}

export function useApiConfig(): ApiConfigContextType {
  const context = useContext(ApiConfigContext);
  if (!context) {
    throw new Error('useApiConfig must be used within an ApiConfigProvider');
  }
  return context;
}
