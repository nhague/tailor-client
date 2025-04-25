import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFunctions, Functions } from 'firebase/functions';
import { getMessaging, Messaging, isSupported } from 'firebase/messaging';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let functions: Functions | null = null;
let messaging: Messaging | null = null;

// Check if Firebase config is provided via environment variables
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

if (apiKey) {
  console.log("Firebase config found, initializing Firebase...");
  const firebaseConfig = {
    apiKey: apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };

  // Initialize Firebase
  try {
    app = initializeApp(firebaseConfig);

    // Initialize services
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    functions = getFunctions(app);

    // Enable offline persistence for Firestore
    if (typeof window !== 'undefined') {
      enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.log('Persistence failed: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
          console.log('Persistence not supported by this browser');
        } else {
          console.error('Firestore persistence error:', err);
        }
      });
    }

    // Initialize messaging if supported
    if (typeof window !== 'undefined') {
      isSupported().then((supported) => {
        if (supported && app) { // Check app is initialized
          messaging = getMessaging(app);
          console.log("Firebase Messaging initialized.");
        } else {
          console.log("Firebase Messaging not supported or app not initialized.");
        }
      }).catch(err => {
        console.error("Error checking messaging support:", err);
      });
    }
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    // Reset services to null if initialization fails
    app = null;
    auth = null;
    db = null;
    storage = null;
    functions = null;
    messaging = null;
  }
} else {
  console.warn("Firebase configuration not found in environment variables. Running in demo mode without Firebase services.");
  // In demo mode, services remain null
}

export { app, auth, db, storage, functions, messaging };