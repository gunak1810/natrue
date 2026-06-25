import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";


import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCrKiuDVlQXIX6gPUx-b3VCdybvUIKr6y4",
  authDomain: "natrue-in.firebaseapp.com",
  projectId: "natrue-in",
  storageBucket: "natrue-in.firebasestorage.app",
  messagingSenderId: "361325449945",
  appId: "1:361325449945:web:ab63ec3c8790c936e524c8"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const analytics = typeof window !== 'undefined' ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null;


export const db = initializeFirestore(app, {}, 'default');

export const auth = getAuth(app);

export const storage = getStorage(app);

export default app;

