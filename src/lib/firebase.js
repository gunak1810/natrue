import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";


import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAqAy3G2K4iSaTfQqGL96-GLNvt-w8FI_I",
  authDomain: "craftszone-324b1.firebaseapp.com",
  projectId: "craftszone-324b1",
  storageBucket: "craftszone-324b1.firebasestorage.app",
  messagingSenderId: "383656257732",
  appId: "1:383656257732:web:1e37892b58e417a12ec191",
  measurementId: "G-1Y8N1MBSZE"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const analytics = typeof window !== 'undefined' ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null;


export const db = typeof window !== 'undefined' 
  ? initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })
  : initializeFirestore(app, {});

export const auth = getAuth(app);

export const storage = getStorage(app);

export default app;

