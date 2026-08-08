import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

const databaseId = firebaseConfigJson.firestoreDatabaseId || '(default)';

// Initialize Firebase App lazily
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID if provided
let firestoreDb: Firestore | null = null;
try {
  firestoreDb = databaseId && databaseId !== '(default)'
    ? getFirestore(app, databaseId)
    : getFirestore(app);
} catch (e) {
  console.warn('Failed to initialize specific Firestore database, falling back to default:', e);
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;
