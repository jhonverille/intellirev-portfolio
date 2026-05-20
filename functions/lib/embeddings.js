"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMBEDDING_DIMENSIONS = void 0;
exports.generateEmbedding = generateEmbedding;
const openai_1 = __importDefault(require("openai"));
const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;
exports.EMBEDDING_DIMENSIONS = EMBEDDING_DIMENSIONS;
let openaiClient = null;
function getOpenAIClient() {
    if (!openaiClient) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("OPENAI_API_KEY environment variable is not set.");
        }
        openaiClient = new openai_1.default({ apiKey });
    }
    return openaiClient;
}
/**
 * Generates a 1536-dimension embedding vector for the given text string.
 * Uses OpenAI text-embedding-3-small (~$0.02 / 1M tokens).
 */
async function generateEmbedding(text) {
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
//# sourceMappingURL=embeddings.js.map