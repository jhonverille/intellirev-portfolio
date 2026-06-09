const OpenAI = require("openai");
require("dotenv").config({ path: "./.env" });

const openaiKey = process.env.OPENAI_API_KEY;
const openRouterKey = process.env.OPENROUTER_API_KEY;

console.log("Testing API keys from .env file...");
console.log("OpenAI Key exists:", !!openaiKey);
console.log("OpenRouter Key exists:", !!openRouterKey);

async function testOpenAI() {
  if (!openaiKey) {
    console.error("OpenAI API key not found in environment.");
    return false;
  }
  try {
    const openai = new OpenAI({ apiKey: openaiKey });
    console.log("Calling OpenAI Embeddings API...");
    const res = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: "test connection",
    });
    console.log("✅ OpenAI Embeddings API call succeeded! Dims:", res.data[0].embedding.length);
    return true;
  } catch (err) {
    console.error("❌ OpenAI Embeddings API call failed:", err.message);
    return false;
  }
}

async function testOpenRouter() {
  if (!openRouterKey) {
    console.error("OpenRouter API key not found in environment.");
    return false;
  }
  try {
    console.log("Calling OpenRouter Chat Completions API...");
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openRouterKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: "hi" }],
      }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }
    const data = await response.json();
    console.log("✅ OpenRouter API call succeeded! Reply:", data.choices[0].message.content);
    return true;
  } catch (err) {
    console.error("❌ OpenRouter API call failed:", err.message);
    return false;
  }
}

async function run() {
  await testOpenAI();
  await testOpenRouter();
}

run();
