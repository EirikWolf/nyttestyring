// ══════════════════════════════════════════════════════════════
// Firebase-konfigurasjon for Hemit Nyttestyringsverktøy
// ══════════════════════════════════════════════════════════════
//
// OPPSETT:
// 1. Gå til https://console.firebase.google.com
// 2. Opprett nytt prosjekt (f.eks. "hemit-nyttestyring")
// 3. Aktiver Firestore Database (europe-west1)
// 4. Aktiver Authentication → E-post/passord + Microsoft (Azure AD)
// 5. Kopier firebaseConfig fra Prosjektinnstillinger → Dine apper
// 6. Erstatt PLACEHOLDER-verdiene nedenfor
//
// For lokal utvikling kan du bruke Firebase Emulators:
//   npm run firebase:emulators
// ══════════════════════════════════════════════════════════════

import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || "PLACEHOLDER",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || "PLACEHOLDER.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || "PLACEHOLDER",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || "PLACEHOLDER.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_ID       || "PLACEHOLDER",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || "PLACEHOLDER",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Koble til emulatorer i utvikling
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === "true") {
  connectFirestoreEmulator(db, "localhost", 8080);
  connectAuthEmulator(auth, "http://localhost:9099");
  console.log("🔧 Firebase emulators tilkoblet");
}

export default app;
