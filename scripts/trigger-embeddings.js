require("dotenv").config({ path: ".env.local" });
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, updateDoc, doc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function triggerCollection(collectionName) {
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    console.log(`Found ${snap.size} documents in ${collectionName}`);

    for (const d of snap.docs) {
      const data = d.data();
      if (!data.embedding) {
        console.log(`Triggering update for ${collectionName}/${d.id} (No embedding found)`);
        await updateDoc(doc(db, collectionName, d.id), {
          _forceUpdate: Date.now()
        });
      } else {
        console.log(`Skipping ${collectionName}/${d.id} (Embedding already exists)`);
      }
    }
  } catch (err) {
    console.error(`Error processing ${collectionName}:`, err);
  }
}

async function main() {
  console.log("Starting trigger...");
  await triggerCollection("projects");
  await triggerCollection("expertise");
  await triggerCollection("testimonials");
  console.log("Done.");
  process.exit(0);
}

main();
