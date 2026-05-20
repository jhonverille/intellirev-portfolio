import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { generateEmbedding } from "./embeddings";
import {
  serializeProject,
  serializeExpertise,
  serializeTestimonial,
  buildSystemPrompt,
} from "./prompts";

// ─── Firebase Admin Init ──────────────────────────────────────────────────────
initializeApp();
const db = getFirestore();

// ─── Shared: generate & write embedding for any document ─────────────────────
async function processEmbedding(
  collection: "projects" | "expertise" | "testimonials",
  docId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
): Promise<void> {
  // Skip if data has no meaningful text (e.g. it's just an embedding update)
  let text = "";
  if (collection === "projects") text = serializeProject(data);
  else if (collection === "expertise") text = serializeExpertise(data);
  else if (collection === "testimonials") text = serializeTestimonial(data);

  if (!text.trim()) {
    console.log(`[${collection}/${docId}] No text to embed, skipping.`);
    return;
  }

  console.log(`[${collection}/${docId}] Generating embedding...`);
  const vector = await generateEmbedding(text);

  await db.collection(collection).doc(docId).update({
    embedding: FieldValue.vector(vector),
    embeddedAt: FieldValue.serverTimestamp(),
    embeddedText: text, // store for debugging
  });

  console.log(`[${collection}/${docId}] Embedding saved (${vector.length} dims).`);
}

// ─── Trigger: projects ────────────────────────────────────────────────────────
export const embedProject = onDocumentWritten(
  { document: "projects/{docId}", region: "us-central1" },
  async (event) => {
    const after = event.data?.after;
    if (!after?.exists) return; // doc was deleted

    const data = after.data() ?? {};
    // Avoid infinite loop: skip if only embedding-related fields changed
    if (event.data?.before?.exists) {
      const before = event.data.before.data() ?? {};
      const contentChanged =
        before.title !== data.title ||
        before.description !== data.description ||
        before.overview !== data.overview ||
        before.challenge !== data.challenge ||
        before.solution !== data.solution ||
        JSON.stringify(before.tags) !== JSON.stringify(data.tags) ||
        JSON.stringify(before.techStack) !== JSON.stringify(data.techStack);
      if (!contentChanged) {
        console.log(`[projects/${event.params.docId}] No content change, skipping.`);
        return;
      }
    }

    await processEmbedding("projects", event.params.docId, data);
  }
);

// ─── Trigger: expertise ───────────────────────────────────────────────────────
export const embedExpertise = onDocumentWritten(
  { document: "expertise/{docId}", region: "us-central1" },
  async (event) => {
    const after = event.data?.after;
    if (!after?.exists) return;

    const data = after.data() ?? {};
    if (event.data?.before?.exists) {
      const before = event.data.before.data() ?? {};
      const contentChanged =
        before.name !== data.name ||
        before.category !== data.category ||
        before.description !== data.description ||
        before.level !== data.level;
      if (!contentChanged) return;
    }

    await processEmbedding("expertise", event.params.docId, data);
  }
);

// ─── Trigger: testimonials ────────────────────────────────────────────────────
export const embedTestimonial = onDocumentWritten(
  { document: "testimonials/{docId}", region: "us-central1" },
  async (event) => {
    const after = event.data?.after;
    if (!after?.exists) return;

    const data = after.data() ?? {};
    if (event.data?.before?.exists) {
      const before = event.data.before.data() ?? {};
      const contentChanged =
        before.name !== data.name ||
        before.role !== data.role ||
        before.company !== data.company ||
        before.text !== data.text;
      if (!contentChanged) return;
    }

    await processEmbedding("testimonials", event.params.docId, data);
  }
);

// ─── Callable: chatWithRAG ────────────────────────────────────────────────────
interface ChatRequest {
  message: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  model?: string;
  debug?: boolean;
}

interface ContextChunk {
  collection: string;
  text: string;
  score?: number;
}

const DEFAULT_MODEL = "openai/gpt-4o-mini";
const TOP_K = 5;

export const chatWithRAG = onCall(
  { region: "us-central1", cors: true, invoker: "public" },
  async (request) => {
    const { message, history = [], model = DEFAULT_MODEL } =
      request.data as ChatRequest;

    if (!message?.trim()) {
      throw new HttpsError("invalid-argument", "message is required.");
    }

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterKey) {
      throw new HttpsError(
        "internal",
        "OPENROUTER_API_KEY is not configured on the server."
      );
    }

    // 1. Embed the user's message
    console.log(`[chatWithRAG] Embedding query: "${message.slice(0, 60)}..."`);
    const queryVector = await generateEmbedding(message);

    // 2. Vector search across all 3 collections in parallel
    const collections: Array<"projects" | "expertise" | "testimonials"> = [
      "projects",
      "expertise",
      "testimonials",
    ];

    const searchResults = await Promise.all(
      collections.map(async (col) => {
        try {
          const snap = await db
            .collection(col)
            .findNearest({
              vectorField: "embedding",
              queryVector: FieldValue.vector(queryVector),
              limit: TOP_K,
              distanceMeasure: "COSINE",
            })
            .get();

          return snap.docs.map((doc) => ({
            collection: col,
            text: (doc.data().embeddedText as string) || "",
            score: (doc as any)._ref?.distanceMeasure ?? 0,
          }));
        } catch (err) {
          // Collection might have no embeddings yet — fail gracefully
          console.warn(`[chatWithRAG] Vector search failed for ${col}:`, err);
          return [];
        }
      })
    );

    // 3. Take top chunks across all collections
    // We want a mix but prioritize projects
    const contextChunks: ContextChunk[] = [
      ...searchResults[0].slice(0, 3), // Up to 3 projects
      ...searchResults[1].slice(0, 2), // Up to 2 expertise
      ...searchResults[2].slice(0, 1), // Up to 1 testimonial
    ].filter((c) => c.text.trim().length > 0);

    console.log(
      `[chatWithRAG] Retrieved ${contextChunks.length} context chunks.`
    );

    // 3.5 Fetch site and AI settings
    let siteSettings = {};
    let aiSettings = { model: DEFAULT_MODEL, systemPromptOverride: "" };

    try {
      const [settingsSnap, aiSnap] = await Promise.all([
        db.collection("site_settings").doc("general").get(),
        db.collection("site_settings").doc("ai").get(),
      ]);

      if (settingsSnap.exists) siteSettings = settingsSnap.data() || {};
      if (aiSnap.exists) aiSettings = { ...aiSettings, ...(aiSnap.data() || {}) };
    } catch (err) {
      console.warn("[chatWithRAG] Failed to fetch settings:", err);
    }

    // 4. Build the system prompt
    const systemPrompt = buildSystemPrompt(contextChunks, siteSettings, aiSettings);

    // 4. Call OpenRouter with the retrieved context
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-8), // keep last 8 turns to control token count
      { role: "user", content: message },
    ];

    const finalModel = aiSettings.model || model || DEFAULT_MODEL;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterKey}`,
          "HTTP-Referer": "https://portfolio.intellirev.space",
          "X-Title": "Jhon Verille Portfolio",
        },
        body: JSON.stringify({
          model: finalModel,
          messages,
          temperature: 0.7,
          max_tokens: 300,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error("[chatWithRAG] OpenRouter error:", errorText);

      if (response.status === 429) {
        throw new HttpsError(
          "resource-exhausted",
          "RATE_LIMIT"
        );
      }
      throw new HttpsError("internal", `OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const reply: string =
      data.choices?.[0]?.message?.content ??
      "I'm sorry, I couldn't generate a response. Please try again.";

    return { 
      reply,
      ...(request.data.debug ? { context: contextChunks } : {})
    };
  }
);
