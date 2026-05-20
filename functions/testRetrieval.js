const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const OpenAI = require("openai");

// Hardcoded for testing since we are in a safe env
const OPENAI_API_KEY = "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";

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
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
