const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc } = require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyDQkUhdd5-dnQw4K86NptTHHT6ogoWnQyQ",
    authDomain: "jhonverille-portfolio-web.firebaseapp.com",
    projectId: "jhonverille-portfolio-web"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkSettings() {
    const docRef = doc(db, "site_settings", "general");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        console.log("Settings:", JSON.stringify(docSnap.data(), null, 2));
    } else {
        console.log("No settings found.");
    }
    process.exit(0);
}

checkSettings().catch(console.error);
