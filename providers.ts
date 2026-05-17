import { LLMProvider } from './types';

// Provider configuration
export interface ProviderConfig {
  provider: 'mock' | 'gemini' | 'minimax';
  apiKey?: string;
  model?: string;
}

// Mock provider
export class MockProvider implements LLMProvider {
  async complete(prompt: string): Promise<string> {
    await this.delay(100);
    return 'Mock response';
  }

  async generateResponse(prompt: string): Promise<string> {
    await this.delay(100);
    return this.generateSalesResponse();
  }

  async generateJSON(prompt: string): Promise<Record<string, unknown>> {
    await this.delay(100);
    return this.generateMockData();
  }

  async generateImage(prompt: string): Promise<string> {
    await this.delay(200);
    return 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1a1a2e"/><stop offset="100%" style="stop-color:#16213e"/></linearGradient></defs><rect fill="url(#g)" width="800" height="400"/><text x="400" y="200" fill="white" font-family="system-ui" font-size="14" text-anchor="middle" opacity="0.5">Sales Intelligence Visualization</text></svg>`);
  }

  private generateSalesResponse(): string {
    return "Thank you for your inquiry. Our team will prioritize this request and prepare a detailed proposal. We'll be in touch within 24 hours to discuss your requirements.";
  }

  private generateMockData(): Record<string, unknown> {
    return {
      industry: 'Manufacturing',
      use_case: 'System replacement',
      urgency: 'High',
      reasoning: 'Based on volume indicators and urgency signals',
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// MiniMax provider — uses MiniMax M2.7 model via Anthropic-compatible API
export class MiniMaxProvider implements LLMProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'MiniMax-M2.7') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async complete(prompt: string): Promise<string> {
    return this.chat([{ role: 'user', content: prompt }]);
  }

  async generateResponse(prompt: string): Promise<string> {
    return this.chat([{ role: 'user', content: prompt }]);
  }

  async generateJSON(prompt: string): Promise<Record<string, unknown>> {
    const response = await this.chat([
      {
        role: 'system',
        content: 'You are a helpful AI assistant. Always respond with valid JSON only, no markdown formatting or explanation.',
      },
      { role: 'user', content: prompt },
    ]);
    try {
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return { error: 'Parse failed', raw: response };
    }
  }

  async generateImage(prompt: string): Promise<string> {
    await this.delay(200);
    return 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1a1a2e"/><stop offset="100%" style="stop-color:#16213e"/></linearGradient></defs><rect fill="url(#g)" width="800" height="400"/><text x="400" y="200" fill="white" font-family="system-ui" font-size="14" text-anchor="middle" opacity="0.5">Sales Intelligence Visualization</text></svg>`);
  }

  private async chat(messages: Array<{ role: string; content?: string; name?: string }>): Promise<string> {
    const url = 'https://api.minimax.io/anthropic/v1/messages';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 4096,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content || '',
        })),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MiniMax API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // Anthropic-style response: content is an array of blocks
    const content = data.content;
    if (!content || !Array.isArray(content)) {
      throw new Error('No content in MiniMax response');
    }

    // Extract text from content blocks
    const textParts = content
      .filter((block: any) => block.type === 'text')
      .map((block: any) => block.text)
      .join('');

    return textParts;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Gemini provider (unchanged)
export class GeminiProvider implements LLMProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-2.0-flash-latest') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async complete(prompt: string): Promise<string> {
    return this.callGemini(prompt);
  }

  async generateResponse(prompt: string): Promise<string> {
    return this.callGemini(prompt);
  }

  async generateJSON(prompt: string): Promise<Record<string, unknown>> {
    const response = await this.callGemini(prompt);
    try {
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return { error: 'Parse failed', raw: response };
    }
  }

  async generateImage(prompt: string): Promise<string> {
    const imagePrompt = `${prompt}. Style: Professional enterprise SaaS, minimal, clean, dark blue and white color scheme, abstract visualization suitable for a B2B sales intelligence product demo. No text, no faces, no realistic images.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview:imageGeneration:generateContent`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': this.apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: imagePrompt }] }],
        generationConfig: {
          temperature: 0.8,
          topK: 32,
          topP: 0.95,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini image error: ${response.status}`);
    }

    const data = await response.json();
    const base64Image = data.image?.imageBytes || data.image?.bytes;

    if (base64Image) {
      return `data:image/png;base64,${base64Image}`;
    }

    throw new Error('No image in response');
  }

  private async callGemini(prompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': this.apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
}

// Factory function
export function createProvider(config: ProviderConfig): LLMProvider {
  switch (config.provider) {
    case 'minimax':
      if (!config.apiKey) {
        console.warn('No MiniMax API key, using mock');
        return new MockProvider();
      }
      return new MiniMaxProvider(config.apiKey, config.model);
    case 'gemini':
      if (!config.apiKey) {
        console.warn('No Gemini API key, using mock');
        return new MockProvider();
      }
      return new GeminiProvider(config.apiKey, config.model);
    default:
      return new MockProvider();
  }
}

export function getProviderConfig(): ProviderConfig {
  return {
    provider: (process.env.LLM_PROVIDER as 'mock' | 'gemini' | 'minimax') || 'mock',
    apiKey: process.env.LLM_API_KEY,
    model: process.env.LLM_MODEL || 'MiniMax-M2.7',
  };
}