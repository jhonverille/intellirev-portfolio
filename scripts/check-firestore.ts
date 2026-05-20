import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

async function checkProjects() {
  try {
    const snap = await db.collection("projects").get();
    console.log(`Projects count: ${snap.size}`);
    snap.docs.forEach(doc => {
      const data = doc.data();
      console.log(`- ${doc.id}: ${data.title} (Has embedding: ${!!data.embedding})`);
    });
  } catch (err) {
    console.error("Error fetching projects:", err);
  }
}

checkProjects();
