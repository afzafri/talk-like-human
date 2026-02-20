export interface LLMConfig {
  model: string;
  temperature: number;
}

export interface LLMProvider {
  generate(systemPrompt: string, userInput: string): Promise<string>;
}
