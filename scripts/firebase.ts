import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/**
 * Tiizi Firebase Configuration
 */
const firebaseConfig = {
  apiKey: "AIzaSyDHO0AL8CbQr95Yp2OqiHM64JfF8eIZaqs",
  authDomain: "tiizi-new.firebaseapp.com",
  projectId: "tiizi-new",
  storageBucket: "tiizi-new.firebasestorage.app",
  messagingSenderId: "613554602922",
  appId: "1:613554602922:web:58257ab06b94194e6261d3",
  measurementId: "G-HR6FBN6BWX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;