import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';


const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIRESTORE_API_KEY,
    authDomain: import.meta.env.VITE_FIRESTORE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIRESTORE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIRESTORE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIRESTORE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIRESTORE_APP_ID,
    measurementId: import.meta.env.VITE_FIRESTORE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });


