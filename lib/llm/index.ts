import type { LLMProvider } from "@/types/llm";
import { OpenAIProvider } from "./openai";
import { AnthropicProvider } from "./anthropic";

export function createProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER;
  const model = process.env.LLM_MODEL!;
  const temperature = Number(process.env.LLM_TEMPERATURE ?? 0.8);

  const config = { model, temperature };

  switch (provider) {
    case "openai":
      return new OpenAIProvider(config);
    case "anthropic":
      return new AnthropicProvider(config);
    default:
      throw new Error(`Unsupported LLM provider: "${provider}"`);
  }
}
