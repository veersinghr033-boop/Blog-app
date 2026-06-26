import { initializeApp, cert, getApps } from "firebase-admin/app";
import serviceAccount from "./firebase-service-account.json" with { type: "json" };

console.log("Firebase config loaded");

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });

  console.log("Firebase initialized");
}
