import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAwEzQFWdJtd-TogzqlMrTW1MXFucX3I_U",
  authDomain: "smartscan-e87cb.firebaseapp.com",
  projectId: "smartscan-e87cb",
  storageBucket: "smartscan-e87cb.firebasestorage.app",
  messagingSenderId: "452423249947",
  appId: "1:452423249947:web:eaab39e2e7143837b448be",
  measurementId: "G-HKQZG56FJL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app; 