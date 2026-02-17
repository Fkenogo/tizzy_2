"use strict";
// Firebase configuration for Tiizi
// This file contains the Firebase project credentials for backend access
Object.defineProperty(exports, "__esModule", { value: true });
exports.analytics = exports.auth = exports.storage = exports.db = void 0;
const app_1 = require("firebase/app");
const analytics_1 = require("firebase/analytics");
const firestore_1 = require("firebase/firestore");
const storage_1 = require("firebase/storage");
const auth_1 = require("firebase/auth");
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
const app = (0, app_1.initializeApp)(firebaseConfig);
// Initialize Firebase services
exports.db = (0, firestore_1.getFirestore)(app);
exports.storage = (0, storage_1.getStorage)(app);
exports.auth = (0, auth_1.getAuth)(app);
// Only initialize analytics in browser environment
let analytics;
if (typeof window !== 'undefined') {
    try {
        exports.analytics = analytics = (0, analytics_1.getAnalytics)(app);
    }
    catch (error) {
        console.warn('Analytics not available in this environment:', error.message);
    }
}
// Export the app instance if needed
exports.default = app;
