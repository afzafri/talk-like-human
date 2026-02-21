import Anthropic from "@anthropic-ai/sdk";
import type { LLMConfig, LLMProvider } from "@/types/llm";

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async generate(systemPrompt: string, userInput: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.config.model,
      max_tokens: 4096,
      temperature: this.config.temperature,
      system: systemPrompt,
      messages: [{ role: "user", content: userInput }],
    });

    const block = response.content[0];
    if (!block || block.type !== "text") {
      throw new Error("Empty response from Anthropic");
    }

    return block.text;
  }

  async generateStream(systemPrompt: string, userInput: string): Promise<ReadableStream<Uint8Array>> {
    const stream = await this.client.messages.create({
      model: this.config.model,
      max_tokens: 4096,
      temperature: this.config.temperature,
      system: systemPrompt,
      messages: [{ role: "user", content: userInput }],
      stream: true,
    });

    const encoder = new TextEncoder();
    return new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      },
    });
  }
}
