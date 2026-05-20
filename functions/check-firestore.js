const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require('fs');

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

async function checkProjects() {
  try {
    const snap = await db.collection("projects").get();
    let out = `Projects count: ${snap.size}\n`;
    snap.docs.forEach(doc => {
      const data = doc.data();
      out += `- ${doc.id}: ${data.title} (Has embedding: ${!!data.embedding})\n`;
    });
    fs.writeFileSync('projects.txt', out);
    console.log("Done");
  } catch (err) {
    fs.writeFileSync('projects.txt', "Error: " + err.toString());
  }
}

checkProjects();
