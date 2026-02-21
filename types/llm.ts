export interface LLMConfig {
  model: string;
  temperature: number;
}

export interface LLMProvider {
  generate(systemPrompt: string, userInput: string): Promise<string>;
  generateStream(systemPrompt: string, userInput: string): Promise<ReadableStream<Uint8Array>>;
}
