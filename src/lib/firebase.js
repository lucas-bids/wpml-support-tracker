// src/lib/firebase.js
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  connectAuthEmulator,
} from 'firebase/auth'
import { getFirestore, serverTimestamp, connectFirestoreEmulator } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

if (import.meta.env.VITE_USE_EMULATORS === '1') {
  // Auth emulator (use Anonymous sign-in while emulating)
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
  // Firestore emulator
  connectFirestoreEmulator(db, 'localhost', 8080)
}

export const googleProvider = new GoogleAuthProvider()

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider)
export const signInAnon = () => signInAnonymously(auth)
export const signOutUser = () => signOut(auth)

export const nowTs = () => serverTimestamp()