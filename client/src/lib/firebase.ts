import { initializeApp, getApps, type FirebaseApp } from "firebase/app";

// Firebase config is provided via Vite env variables (VITE_*)
// Make sure to set these in a .env file at the project root.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export function getFirebaseApp(): FirebaseApp | null {
  // If required fields are missing, return null (feature disabled)
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) return null;
  if (getApps().length === 0) {
    initializeApp(firebaseConfig);
  }
  return getApps()[0] || null;
}


