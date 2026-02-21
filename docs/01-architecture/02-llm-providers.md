# LLM Providers

The LLM layer uses a provider abstraction pattern so the API route never needs to know which AI service is being used.

## Interface

All providers implement the `LLMProvider` interface defined in `types/llm.ts`:

```typescript
export interface LLMConfig {
  model: string;
  temperature: number;
}

export interface LLMProvider {
  generate(systemPrompt: string, userInput: string): Promise<string>;
}
```

## Provider Factory

`lib/llm/index.ts` reads the environment and returns the correct provider:

```typescript
export function createProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER;
  const model = process.env.LLM_MODEL!;
  const temperature = Number(process.env.LLM_TEMPERATURE ?? 0.8);

  switch (provider) {
    case "openai":
      return new OpenAIProvider({ model, temperature });
    case "anthropic":
      return new AnthropicProvider({ model, temperature });
    default:
      throw new Error(`Unsupported LLM provider: "${provider}"`);
  }
}
```

## Switching Providers

Change the `LLM_PROVIDER` and `LLM_MODEL` values in `.env.local`:

| Provider  | `LLM_PROVIDER` | Example `LLM_MODEL`          |
| --------- | -------------- | ---------------------------- |
| OpenAI    | `openai`       | `gpt-4o-mini`                |
| Anthropic | `anthropic`    | `claude-haiku-4-5-20251001`  |

No code changes required — only environment config.

## Next Steps

- [Skill Loader](03-skill-loader.md)
- [API Reference](../03-api/01-humanize-endpoint.md)
