import OpenAI from "openai";

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set.");
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

/**
 * Generates a 1536-dimension embedding vector for the given text string.
 * Uses OpenAI text-embedding-3-small (~$0.02 / 1M tokens).
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error("Cannot embed empty text.");
  }

  const client = getOpenAIClient();
  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.trim(),
    dimensions: EMBEDDING_DIMENSIONS,
  });

  return response.data[0].embedding;
}

export { EMBEDDING_DIMENSIONS };
