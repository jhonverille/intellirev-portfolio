/**
 * One-time backfill script: generates embeddings for all existing Firestore documents.
 *
 * Prerequisites:
 *   1. Install deps: npm install -g ts-node  (or use npx ts-node)
 *   2. Auth: run `firebase login` AND download a service account key:
 *      Firebase Console → Project Settings → Service Accounts → Generate new private key
 *      Save as `service-account.json` in the project root (it's in .gitignore via .env*)
 *   3. Run:
 *      GOOGLE_APPLICATION_CREDENTIALS=./service-account.json npx ts-node --project tsconfig.backfill.json scripts/backfill-embeddings.ts
 *
 * This script is safe to re-run — it skips docs that already have an `embedding` field.
 */

import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import OpenAI from "openai";

// ─── Init ─────────────────────────────────────────────────────────────────────
initializeApp({ credential: applicationDefault() });
const db = getFirestore();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

// ─── Serializers (mirrors functions/src/prompts.ts) ──────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeProject(d: any): string {
  const parts: string[] = [];
  if (d.title) parts.push(`Project: ${d.title}`);
  if (d.description) parts.push(`Description: ${d.description}`);
  if (d.overview) parts.push(`Overview: ${d.overview}`);
  if (d.challenge) parts.push(`Challenge: ${d.challenge}`);
  if (d.solution) parts.push(`Solution: ${d.solution}`);
  if (d.tags?.length) parts.push(`Tags: ${d.tags.join(", ")}`);
  if (d.techStack?.length) parts.push(`Tech Stack: ${d.techStack.join(", ")}`);
  return parts.join("\n");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeExpertise(d: any): string {
  const parts: string[] = [];
  if (d.name) parts.push(`Skill: ${d.name}`);
  if (d.category) parts.push(`Category: ${d.category}`);
  if (d.level) parts.push(`Level: ${d.level}`);
  if (d.description) parts.push(`Description: ${d.description}`);
  return parts.join("\n");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeTestimonial(d: any): string {
  const parts: string[] = [];
  if (d.name) parts.push(`From: ${d.name}`);
  if (d.role) parts.push(`Role: ${d.role}`);
  if (d.company) parts.push(`Company: ${d.company}`);
  if (d.text) parts.push(`Quote: ${d.text}`);
  return parts.join("\n");
}

// ─── Embedding helper ─────────────────────────────────────────────────────────
async function embed(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.trim(),
    dimensions: EMBEDDING_DIMENSIONS,
  });
  return res.data[0].embedding;
}

// ─── Process a collection ─────────────────────────────────────────────────────
async function backfillCollection(
  collection: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  serializer: (d: any) => string
): Promise<void> {
  const snap = await db.collection(collection).get();
  const docs = snap.docs;
  console.log(`\n📂 ${collection}: ${docs.length} documents found.`);

  let skipped = 0;
  let processed = 0;
  let failed = 0;

  for (const doc of docs) {
    const data = doc.data();

    // Skip if already embedded (idempotent)
    if (data.embedding) {
      skipped++;
      console.log(`  ⏭  [${doc.id}] Already embedded — skipping.`);
      continue;
    }

    const text = serializer(data);
    if (!text.trim()) {
      skipped++;
      console.log(`  ⚠️  [${doc.id}] No text content — skipping.`);
      continue;
    }

    try {
      console.log(`  ⏳ [${doc.id}] Embedding "${text.slice(0, 50)}..."`);
      const vector = await embed(text);

      await db.collection(collection).doc(doc.id).update({
        embedding: FieldValue.vector(vector),
        embeddedAt: FieldValue.serverTimestamp(),
        embeddedText: text,
      });

      processed++;
      console.log(`  ✅ [${doc.id}] Done (${vector.length} dims).`);

      // Small delay to respect OpenAI rate limits
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      failed++;
      console.error(`  ❌ [${doc.id}] Failed:`, err);
    }
  }

  console.log(
    `  → ${collection}: ${processed} embedded, ${skipped} skipped, ${failed} failed.`
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY is not set. Aborting.");
    process.exit(1);
  }

  console.log("🚀 Starting embedding backfill...");
  console.log(`   Model: ${EMBEDDING_MODEL} (${EMBEDDING_DIMENSIONS} dims)`);

  await backfillCollection("projects", serializeProject);
  await backfillCollection("expertise", serializeExpertise);
  await backfillCollection("testimonials", serializeTestimonial);

  console.log("\n🎉 Backfill complete! All existing documents now have embeddings.");
  console.log(
    "   The Cloud Function triggers will handle all future updates automatically."
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
