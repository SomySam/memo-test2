
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDHVJlQkuCdwlqqugy1zzLqGFx98LWjvzE",
  authDomain: "memo-somy.firebaseapp.com",
  projectId: "memo-somy",
  storageBucket: "memo-somy.firebasestorage.app",
  messagingSenderId: "207441416768",
  appId: "1:207441416768:web:8fa2d6ca2e64b32d8945a5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
