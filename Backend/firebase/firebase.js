const admin = require("firebase-admin");

try {
  if (!admin.apps.length) {
    // Verify environment variable exists
    if (!process.env.FIREBASE_KEY) {
      throw new Error("FIREBASE_KEY environment variable is not defined");
    }

    // Parse Firebase configuration
    let firebaseConfig;
    try {
      firebaseConfig = JSON.parse(process.env.FIREBASE_KEY);
    } catch (parseError) {
      throw new Error(`Invalid FIREBASE_KEY format: ${parseError.message}`);
    }

    // Initialize Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
    });
    console.log("✅ Firebase Admin SDK initialized successfully");
  }
} catch (error) {
  console.error("❌ Firebase initialization error:", error.message);
}

const auth = admin.auth();
const db = admin.firestore();

module.exports = { auth, db };
