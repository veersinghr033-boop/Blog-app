import { initializeApp, cert, getApps } from "firebase-admin/app";
import serviceAccount from "./firebase-service-account.json" with { type: "json" };

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as any),
  });
}
