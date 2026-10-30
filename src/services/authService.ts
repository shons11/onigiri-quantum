/**
 * @file src/services/authService.ts
 * @description Firebase Authentication 連携、Google ログイン・ログアウト、
 * 新規プロファイル自動作成、および退会・データ全削除（deleteAccountAndData）
 */

import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  deleteUser,
  User,
  reauthenticateWithPopup,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';

/**
 * ユーザープロファイル型定義
 */
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
  lastLoginAt?: string;
  totalQuantums: number;
}

/**
 * Googleアカウントでサインイン
 * ログイン後、Firestoreの users/{uid} を確認し新規なら初期プロファイルを自動生成
 */
export async function signInWithGoogle(): Promise<{ user: User; profile: UserProfile }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const profile = await syncUserProfile(user);
    return { user, profile };
  } catch (error: any) {
    console.error('Google Sign-in Error:', error);
    throw error;
  }
}

/**
 * Firestore上の users/{uid} をチェックし、
 * 新規ユーザーなら初期プロファイルを作成、既存なら最終ログイン日時を更新
 */
export async function syncUserProfile(user: User): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);

  const nowIso = new Date().toISOString();

  if (!snap.exists()) {
    // 新規ユーザー初期プロファイル作成
    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || '量子観測者',
      photoURL: user.photoURL || null,
      createdAt: nowIso,
      lastLoginAt: nowIso,
      totalQuantums: 0,
    };

    await setDoc(userRef, {
      ...newProfile,
      serverCreatedAt: serverTimestamp(),
      serverLastLoginAt: serverTimestamp(),
    });

    return newProfile;
  } else {
    // 既存ユーザーの最終ログイン日時同期
    const data = snap.data();
    await updateDoc(userRef, {
      serverLastLoginAt: serverTimestamp(),
      displayName: user.displayName || data.displayName || '量子観測者',
      photoURL: user.photoURL || data.photoURL || null,
    });

    return {
      uid: user.uid,
      email: data.email ?? user.email,
      displayName: user.displayName ?? data.displayName,
      photoURL: user.photoURL ?? data.photoURL,
      createdAt: data.createdAt ?? nowIso,
      lastLoginAt: nowIso,
      totalQuantums: data.totalQuantums ?? 0,
    };
  }
}

/**
 * サインアウト処理
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-out Error:', error);
    throw error;
  }
}

/**
 * 認証状態リスナーの購読
 */
export function subscribeAuthState(
  callback: (user: User | null, profile: UserProfile | null) => void
): () => void {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          callback(user, {
            uid: user.uid,
            email: data.email ?? user.email,
            displayName: data.displayName ?? user.displayName,
            photoURL: data.photoURL ?? user.photoURL,
            createdAt: data.createdAt ?? new Date().toISOString(),
            lastLoginAt: data.lastLoginAt,
            totalQuantums: data.totalQuantums ?? 0,
          });
        } else {
          const profile = await syncUserProfile(user);
          callback(user, profile);
        }
      } catch (err) {
        console.error('Error fetching user profile in observer:', err);
        callback(user, null);
      }
    } else {
      callback(null, null);
    }
  });
}

/**
 * ユーザーのトータル量子（観測数）を加算・更新
 */
export async function incrementUserQuantums(uid: string, delta: number = 1): Promise<number> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    const current = snap.exists() ? (snap.data().totalQuantums ?? 0) : 0;
    const updated = Math.max(0, current + delta);
    await updateDoc(userRef, {
      totalQuantums: updated,
      updatedAt: serverTimestamp(),
    });
    return updated;
  } catch (e) {
    console.error('Failed to increment user quantums:', e);
    return 0;
  }
}

/**
 * 退会・データ全削除（deleteAccountAndData）
 * 1. ユーザーの全サブコレクション（lives, nodes, logs等）を完全に物理削除
 * 2. users/{uid} ルートドキュメントを削除
 * 3. Firebase Auth のアカウント自体を削除（deleteUser）
 */
export async function deleteAccountAndData(): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('ログイン中のユーザーが存在しません。');
  }

  const uid = currentUser.uid;

  try {
    // 1. users/{uid}/lives 以下の全ドキュメントを探索して削除
    const livesRef = collection(db, 'users', uid, 'lives');
    const livesSnap = await getDocs(livesRef);

    for (const lifeDoc of livesSnap.docs) {
      // 各人生のサブコレクション（もし存在する場合）も削除
      const nodesRef = collection(db, 'users', uid, 'lives', lifeDoc.id, 'nodes');
      const nodesSnap = await getDocs(nodesRef);
      for (const nodeDoc of nodesSnap.docs) {
        await deleteDoc(nodeDoc.ref);
      }

      const logsRef = collection(db, 'users', uid, 'lives', lifeDoc.id, 'logs');
      const logsSnap = await getDocs(logsRef);
      for (const logDoc of logsSnap.docs) {
        await deleteDoc(logDoc.ref);
      }

      // 人生ドキュメント自体を削除
      await deleteDoc(lifeDoc.ref);
    }

    // 2. users/{uid} ルートドキュメントを削除
    const userDocRef = doc(db, 'users', uid);
    await deleteDoc(userDocRef);

    // 3. Firebase Auth アカウントを削除
    try {
      await deleteUser(currentUser);
    } catch (authError: any) {
      // セキュリティ上の再認証要求が発生した場合の対応
      if (authError.code === 'auth/requires-recent-login') {
        await reauthenticateWithPopup(currentUser, googleProvider);
        await deleteUser(currentUser);
      } else {
        throw authError;
      }
    }
  } catch (error) {
    console.error('Delete account and data error:', error);
    throw error;
  }
}
