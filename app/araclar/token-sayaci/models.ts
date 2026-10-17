// OpenAI model catalogue for the token counter. Prices are standard-tier USD per 1M tokens from
// developers.openai.com/api/docs/pricing; input limits come from gpt-tokenizer's model table and the
// embeddings guide.
export const PRICES_CHECKED = '17 Ekim 2026';

type Pricing = {
  input: number;
  /** null for models without output tokens (embeddings) */
  output: number | null;
};

export type ModelInfo = {
  id: string;
  name: string;
  kind: 'chat' | 'embedding';
  /** Largest prompt the model accepts, in tokens (the context window when no separate input cap is published) */
  inputLimit: number;
  price: Pricing;
  /** Higher rates once the prompt passes `threshold` input tokens */
  longContext?: Pricing & { threshold: number };
  encoding: 'o200k_base' | 'cl100k_base';
};

export const MODELS: ModelInfo[] = [
  {
    id: 'gpt-5.6-terra',
    name: 'GPT-5.6 Terra',
    kind: 'chat',
    inputLimit: 922_000,
    price: { input: 2, output: 12 },
    longContext: { threshold: 272_000, input: 4, output: 18 },
    encoding: 'o200k_base',
  },
  {
    id: 'gpt-5.6-luna',
    name: 'GPT-5.6 Luna',
    kind: 'chat',
    inputLimit: 922_000,
    price: { input: 0.2, output: 1.2 },
    longContext: { threshold: 272_000, input: 0.4, output: 1.8 },
    encoding: 'o200k_base',
  },
  {
    id: 'gpt-5.5',
    name: 'GPT-5.5',
    kind: 'chat',
    inputLimit: 1_050_000,
    price: { input: 5, output: 30 },
    longContext: { threshold: 272_000, input: 10, output: 45 },
    encoding: 'o200k_base',
  },
  {
    id: 'gpt-5.4',
    name: 'GPT-5.4',
    kind: 'chat',
    inputLimit: 1_050_000,
    price: { input: 2.5, output: 15 },
    longContext: { threshold: 272_000, input: 5, output: 22.5 },
    encoding: 'o200k_base',
  },
  {
    id: 'gpt-5.4-mini',
    name: 'GPT-5.4 mini',
    kind: 'chat',
    inputLimit: 272_000,
    price: { input: 0.75, output: 4.5 },
    encoding: 'o200k_base',
  },
  {
    id: 'gpt-5.4-nano',
    name: 'GPT-5.4 nano',
    kind: 'chat',
    inputLimit: 272_000,
    price: { input: 0.2, output: 1.25 },
    encoding: 'o200k_base',
  },
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    kind: 'chat',
    inputLimit: 1_047_576,
    price: { input: 2, output: 8 },
    encoding: 'o200k_base',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    kind: 'chat',
    inputLimit: 128_000,
    price: { input: 2.5, output: 10 },
    encoding: 'o200k_base',
  },
  {
    id: 'text-embedding-3-small',
    name: 'text-embedding-3-small',
    kind: 'embedding',
    inputLimit: 8_192,
    price: { input: 0.02, output: null },
    encoding: 'cl100k_base',
  },
  {
    id: 'text-embedding-3-large',
    name: 'text-embedding-3-large',
    kind: 'embedding',
    inputLimit: 8_192,
    price: { input: 0.13, output: null },
    encoding: 'cl100k_base',
  },
];

/** Cost of `requests` calls that each send `inputTokens` and get `outputTokens` back */
export function estimateCost(model: ModelInfo, inputTokens: number, outputTokens: number, requests: number) {
  const rates = model.longContext && inputTokens > model.longContext.threshold ? model.longContext : model.price;
  const output = rates.output === null ? 0 : outputTokens * rates.output;
  return ((inputTokens * rates.input + output) / 1_000_000) * requests;
}
