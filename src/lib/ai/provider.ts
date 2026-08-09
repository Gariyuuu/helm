export interface AiProvider {
  name: string;
  summarize(input: { title: string; context: string }): Promise<string>;
  breakdown(input: { title: string; description?: string }): Promise<string[]>;
  parseQuickCapture(input: { text: string }): Promise<Record<string, unknown>>;
}

class NoopAiProvider implements AiProvider {
  name = "none";
  async summarize() {
    return "AI is not configured yet — set AI_PROVIDER in Settings.";
  }
  async breakdown() {
    return [];
  }
  async parseQuickCapture() {
    return {};
  }
}

/**
 * Swap providers here (OpenAI / Anthropic / OpenRouter / self-hosted) without
 * touching call sites — every AI-assisted feature goes through this module.
 */
export function getAiProvider(): AiProvider {
  return new NoopAiProvider();
}
