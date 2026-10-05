import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
apiKey: "AIzaSyDA1rH6d7KcfZFV9L94mu84wWczp97WaVQ",
  authDomain: "krishi-web.firebaseapp.com",
  projectId: "krishi-web",
  storageBucket: "krishi-web.appspot.com",
  messagingSenderId: "974843915253",
  appId: "1:974843915253:web:f185699421666457f14ebc",
  measurementId: "G-QQMTT4BPYY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

export default app;