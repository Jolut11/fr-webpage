import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCS02oO4Q_WCQaWqYFUTioaHE6MrxufMSM",
    authDomain: "fr-webpage-5d512.firebaseapp.com",
    projectId: "fr-webpage-5d512",
    storageBucket: "fr-webpage-5d512.firebasestorage.app",
    messagingSenderId: "832827801804",
    appId: "1:832827801804:web:5452f46c8b6dcb12a9c269",
    measurementId: "G-5QJ5FR39MS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };