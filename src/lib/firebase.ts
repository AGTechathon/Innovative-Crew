
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Replace these with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDvK5SU5L14tFkgJ424EPmaLl-_eHSt-Z0",
  authDomain: "factora-799be.firebaseapp.com",
  projectId: "factora-799be",
  storageBucket: "factora-799be.firebasestorage.app",
  messagingSenderId: "468131766617",
  appId: "1:468131766617:web:f2b7305b68525485792c48",
  measurementId: "G-WHVQX6XCHS"
};
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Enable emulators in development (optional)
if (import.meta.env.DEV && !auth.currentUser) {
  try {
    // Uncomment these lines if you want to use Firebase emulators in development
    // connectAuthEmulator(auth, "http://localhost:9099");
    // connectFirestoreEmulator(db, 'localhost', 8080);
    // connectStorageEmulator(storage, "localhost", 9199);
  } catch (error) {
    console.log('Emulator connection failed:', error);
  }
}

export default app;

// Collection names for consistency
export const COLLECTIONS = {
  USERS: 'users',
  WORK_ORDERS: 'workOrders',
  INVENTORY: 'inventory',
  WORKERS: 'workers',
  MACHINES: 'machines',
  PRODUCTION_METRICS: 'productionMetrics'
} as const;
