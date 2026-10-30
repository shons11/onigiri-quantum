/**
 * @file src/lib/firebase.ts
 * @description Onigiri Quantum (Oni-Q) Firebase SDK 初期化およびクライアントエクスポート
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// ユーザー指定の Firebase Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBbC207BNcf1tAuxChAD1_TUEBSrGfGRZ4",
  authDomain: "onigiri-quantum.firebaseapp.com",
  projectId: "onigiri-quantum",
  storageBucket: "onigiri-quantum.firebasestorage.app",
  messagingSenderId: "318858076180",
  appId: "1:318858076180:web:bd0ab867a9aaf84527c701"
};

// 二重初期化防止
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Firebase Authentication インスタンス
export const auth: Auth = getAuth(app);

// Google Auth Provider (Googleログイン)
export const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Cloud Firestore インスタンス
export const db: Firestore = getFirestore(app);
