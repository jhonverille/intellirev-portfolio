const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyDQkUhdd5-dnQw4K86NptTHHT6ogoWnQyQ",
    authDomain: "jhonverille-portfolio-web.firebaseapp.com",
    projectId: "jhonverille-portfolio-web"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkProjects() {
    console.log("Checking projects...");
    const snap = await getDocs(collection(db, "projects"));
    snap.docs.forEach(doc => {
        const data = doc.data();
        console.log(`- ${doc.id}: ${data.title} (Has embedding: ${!!data.embedding})`);
    });
    console.log("Done");
    process.exit(0);
}

checkProjects().catch(console.error);
