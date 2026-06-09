const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const OpenAI = require("openai");
require("dotenv").config({ path: "./.env" });

const openaiKey = process.env.OPENAI_API_KEY;
if (!openaiKey) {
  console.error("OpenAI API key not found in environment.");
  process.exit(1);
}

const openai = new OpenAI({ apiKey: openaiKey });
initializeApp({ credential: applicationDefault() });
const db = getFirestore();

async function testRetrieval() {
    const query = "tell me about the interview scheduling project";
    console.log(`Query: ${query}`);
    
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: query,
    });
    const queryVector = response.data[0].embedding;

    const snap = await db
        .collection("projects")
        .findNearest({
            vectorField: "embedding",
            queryVector: FieldValue.vector(queryVector),
            limit: 5,
            distanceMeasure: "COSINE",
        })
        .get();

    console.log(`Results found: ${snap.size}`);
    snap.docs.forEach((doc, i) => {
        const data = doc.data();
        const score = doc.distance; // findNearest adds this
        console.log(`[${i+1}] ${data.title} (Score: ${score})`);
    });
    process.exit(0);
}

testRetrieval().catch(console.error);
