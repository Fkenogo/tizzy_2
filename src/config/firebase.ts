// Firebase configuration for Tiizi
// This file contains the Firebase project credentials for backend access

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
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

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Only initialize analytics in browser environment
let analytics;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics not available in this environment:', error.message);
  }
}

// Export analytics for optional use
export { analytics };

// Export the app instance if needed
export default app;
