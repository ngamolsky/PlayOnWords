import admin from "firebase-admin";
import { config } from "dotenv";

if (!admin.apps.length) {
  config();
  admin.initializeApp({
    credential: admin.credential.cert({
      clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
      privateKey: process.env.GOOGLE_PRIVATE_KEY,
      projectId: process.env.GOOGLE_PROJECT_ID,
    }),
  });
}

export default admin.firestore();
