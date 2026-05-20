"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithRAG = exports.embedTestimonial = exports.embedExpertise = exports.embedProject = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const firestore_2 = require("firebase-functions/v2/firestore");
const embeddings_1 = require("./embeddings");
const prompts_1 = require("./prompts");
// ─── Firebase Admin Init ──────────────────────────────────────────────────────
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
// ─── Shared: generate & write embedding for any document ─────────────────────
async function processEmbedding(collection, docId, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
data) {
    // Skip if data has no meaningful text (e.g. it's just an embedding update)
    let text = "";
    if (collection === "projects")
        text = (0, prompts_1.serializeProject)(data);
    else if (collection === "expertise")
        text = (0, prompts_1.serializeExpertise)(data);
    else if (collection === "testimonials")
        text = (0, prompts_1.serializeTestimonial)(data);
    if (!text.trim()) {
        console.log(`[${collection}/${docId}] No text to embed, skipping.`);
        return;
    }
    console.log(`[${collection}/${docId}] Generating embedding...`);
    const vector = await (0, embeddings_1.generateEmbedding)(text);
    await db.collection(collection).doc(docId).update({
        embedding: firestore_1.FieldValue.vector(vector),
        embeddedAt: firestore_1.FieldValue.serverTimestamp(),
        embeddedText: text, // store for debugging
    });
    console.log(`[${collection}/${docId}] Embedding saved (${vector.length} dims).`);
}
// ─── Trigger: projects ────────────────────────────────────────────────────────
exports.embedProject = (0, firestore_2.onDocumentWritten)({ document: "projects/{docId}", region: "us-central1" }, async (event) => {
    var _a, _b, _c, _d, _e;
    const after = (_a = event.data) === null || _a === void 0 ? void 0 : _a.after;
    if (!(after === null || after === void 0 ? void 0 : after.exists))
        return; // doc was deleted
    const data = (_b = after.data()) !== null && _b !== void 0 ? _b : {};
    // Avoid infinite loop: skip if only embedding-related fields changed
    if ((_d = (_c = event.data) === null || _c === void 0 ? void 0 : _c.before) === null || _d === void 0 ? void 0 : _d.exists) {
        const before = (_e = event.data.before.data()) !== null && _e !== void 0 ? _e : {};
        const contentChanged = before.title !== data.title ||
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
});
// ─── Trigger: expertise ───────────────────────────────────────────────────────
exports.embedExpertise = (0, firestore_2.onDocumentWritten)({ document: "expertise/{docId}", region: "us-central1" }, async (event) => {
    var _a, _b, _c, _d, _e;
    const after = (_a = event.data) === null || _a === void 0 ? void 0 : _a.after;
    if (!(after === null || after === void 0 ? void 0 : after.exists))
        return;
    const data = (_b = after.data()) !== null && _b !== void 0 ? _b : {};
    if ((_d = (_c = event.data) === null || _c === void 0 ? void 0 : _c.before) === null || _d === void 0 ? void 0 : _d.exists) {
        const before = (_e = event.data.before.data()) !== null && _e !== void 0 ? _e : {};
        const contentChanged = before.name !== data.name ||
            before.category !== data.category ||
            before.description !== data.description ||
            before.level !== data.level;
        if (!contentChanged)
            return;
    }
    await processEmbedding("expertise", event.params.docId, data);
});
// ─── Trigger: testimonials ────────────────────────────────────────────────────
exports.embedTestimonial = (0, firestore_2.onDocumentWritten)({ document: "testimonials/{docId}", region: "us-central1" }, async (event) => {
    var _a, _b, _c, _d, _e;
    const after = (_a = event.data) === null || _a === void 0 ? void 0 : _a.after;
    if (!(after === null || after === void 0 ? void 0 : after.exists))
        return;
    const data = (_b = after.data()) !== null && _b !== void 0 ? _b : {};
    if ((_d = (_c = event.data) === null || _c === void 0 ? void 0 : _c.before) === null || _d === void 0 ? void 0 : _d.exists) {
        const before = (_e = event.data.before.data()) !== null && _e !== void 0 ? _e : {};
        const contentChanged = before.name !== data.name ||
            before.role !== data.role ||
            before.company !== data.company ||
            before.text !== data.text;
        if (!contentChanged)
            return;
    }
    await processEmbedding("testimonials", event.params.docId, data);
});
const DEFAULT_MODEL = "openai/gpt-4o-mini";
const TOP_K = 5;
exports.chatWithRAG = (0, https_1.onCall)({ region: "us-central1", cors: true, invoker: "public" }, async (request) => {
    var _a, _b, _c, _d;
    const { message, history = [], model = DEFAULT_MODEL } = request.data;
    if (!(message === null || message === void 0 ? void 0 : message.trim())) {
        throw new https_1.HttpsError("invalid-argument", "message is required.");
    }
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterKey) {
        throw new https_1.HttpsError("internal", "OPENROUTER_API_KEY is not configured on the server.");
    }
    // 1. Embed the user's message
    console.log(`[chatWithRAG] Embedding query: "${message.slice(0, 60)}..."`);
    const queryVector = await (0, embeddings_1.generateEmbedding)(message);
    // 2. Vector search across all 3 collections in parallel
    const collections = [
        "projects",
        "expertise",
        "testimonials",
    ];
    const searchResults = await Promise.all(collections.map(async (col) => {
        try {
            const snap = await db
                .collection(col)
                .findNearest({
                vectorField: "embedding",
                queryVector: firestore_1.FieldValue.vector(queryVector),
                limit: TOP_K,
                distanceMeasure: "COSINE",
            })
                .get();
            return snap.docs.map((doc) => {
                var _a, _b;
                return ({
                    collection: col,
                    text: doc.data().embeddedText || "",
                    score: (_b = (_a = doc._ref) === null || _a === void 0 ? void 0 : _a.distanceMeasure) !== null && _b !== void 0 ? _b : 0,
                });
            });
        }
        catch (err) {
            // Collection might have no embeddings yet — fail gracefully
            console.warn(`[chatWithRAG] Vector search failed for ${col}:`, err);
            return [];
        }
    }));
    // 3. Take top chunks across all collections
    // We want a mix but prioritize projects
    const contextChunks = [
        ...searchResults[0].slice(0, 3), // Up to 3 projects
        ...searchResults[1].slice(0, 2), // Up to 2 expertise
        ...searchResults[2].slice(0, 1), // Up to 1 testimonial
    ].filter((c) => c.text.trim().length > 0);
    console.log(`[chatWithRAG] Retrieved ${contextChunks.length} context chunks.`);
    // 3.5 Fetch site and AI settings
    let siteSettings = {};
    let aiSettings = { model: DEFAULT_MODEL, systemPromptOverride: "" };
    try {
        const [settingsSnap, aiSnap] = await Promise.all([
            db.collection("site_settings").doc("general").get(),
            db.collection("site_settings").doc("ai").get(),
        ]);
        if (settingsSnap.exists)
            siteSettings = settingsSnap.data() || {};
        if (aiSnap.exists)
            aiSettings = { ...aiSettings, ...(aiSnap.data() || {}) };
    }
    catch (err) {
        console.warn("[chatWithRAG] Failed to fetch settings:", err);
    }
    // 4. Build the system prompt
    const systemPrompt = (0, prompts_1.buildSystemPrompt)(contextChunks, siteSettings, aiSettings);
    // 4. Call OpenRouter with the retrieved context
    const messages = [
        { role: "system", content: systemPrompt },
        ...history.slice(-8), // keep last 8 turns to control token count
        { role: "user", content: message },
    ];
    const finalModel = aiSettings.model || model || DEFAULT_MODEL;
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
    });
    if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        console.error("[chatWithRAG] OpenRouter error:", errorText);
        if (response.status === 429) {
            throw new https_1.HttpsError("resource-exhausted", "RATE_LIMIT");
        }
        throw new https_1.HttpsError("internal", `OpenRouter API error: ${response.status}`);
    }
    const data = await response.json();
    const reply = (_d = (_c = (_b = (_a = data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) !== null && _d !== void 0 ? _d : "I'm sorry, I couldn't generate a response. Please try again.";
    return {
        reply,
        ...(request.data.debug ? { context: contextChunks } : {})
    };
});
//# sourceMappingURL=index.js.map