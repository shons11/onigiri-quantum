/**
 * @file src/services/lifeService.ts
 * @description Firestore をバックエンドとした「人生（Life）」および世界線データの永続化サービス
 * 各ユーザーごとの独立した人生管理、初期量子ノードの生成、同期保存
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LifeRecord, QuantumWorldLine, OnigiriNode, QuantumBranch } from '../types/quantum';

/**
 * ユーザーが作成した人生の一覧を取得
 */
export async function getUserLives(uid: string): Promise<LifeRecord[]> {
  try {
    const livesRef = collection(db, 'users', uid, 'lives');
    const q = query(livesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title || '無題の世界線',
        initialTheme: data.initialTheme || '最初の決断',
        totalQuanta: data.totalQuanta ?? 0,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      };
    });
  } catch (error) {
    console.error('Failed to fetch user lives:', error);
    return [];
  }
}

/**
 * 新規人生（Life）および最初の量子ノード（重ね合わせ状態）を作成
 */
export async function createNewLife(
  uid: string,
  userName: string,
  title: string,
  initialTheme: string,
  initialBranches?: { label: string; description: string }[]
): Promise<{ life: LifeRecord; worldLine: QuantumWorldLine }> {
  const lifeId = `life-${Date.now()}`;
  const now = new Date().toISOString();

  const rootNodeId = `node-root-${Date.now()}`;

  // 最初の決断ノードの選択肢
  const branches: QuantumBranch[] = initialBranches && initialBranches.length >= 2
    ? initialBranches.map((b, i) => ({
        id: `b-${rootNodeId}-${i + 1}`,
        label: b.label.trim() || `選択肢 ${i + 1}`,
        description: b.description || '',
        status: 'superposed',
        probabilityAmplitude: 0.5,
      }))
    : [
        {
          id: `b-${rootNodeId}-1`,
          label: '未知の可能性へ踏み出す道',
          description: '不確定性を受け入れ、新たな世界線を開拓する',
          status: 'superposed',
          probabilityAmplitude: 0.5,
        },
        {
          id: `b-${rootNodeId}-2`,
          label: '盤石な基盤を深める道',
          description: '足元を固め、確実な土台の上に次なる展開を築く',
          status: 'superposed',
          probabilityAmplitude: 0.5,
        },
      ];

  const rootNode: OnigiriNode = {
    id: rootNodeId,
    title: initialTheme.trim() || '最初の決断のテーマ',
    category: 'career',
    state: 'superposition',
    flavor: 'classic-salt',
    position: { x: 280, y: 350 },
    parentId: null,
    branches,
    createdAt: now,
    tags: ['人生の原点', '最初の決断'],
  };

  const initialWorldLine: QuantumWorldLine = {
    id: lifeId,
    lifeTitle: title.trim(),
    userId: uid,
    userName: userName || '量子観測者',
    totalQuanta: 0,
    nodes: [rootNode],
    logs: [],
    entanglements: [],
  };

  const lifeRecord: LifeRecord = {
    id: lifeId,
    title: title.trim(),
    initialTheme: initialTheme.trim(),
    totalQuanta: 0,
    createdAt: now,
    updatedAt: now,
  };

  // Firestore に保存
  const lifeDocRef = doc(db, 'users', uid, 'lives', lifeId);
  await setDoc(lifeDocRef, {
    ...lifeRecord,
    worldLine: initialWorldLine,
    serverCreatedAt: serverTimestamp(),
    serverUpdatedAt: serverTimestamp(),
  });

  return { life: lifeRecord, worldLine: initialWorldLine };
}

/**
 * 人生の世界線データを読み込み
 */
export async function loadLifeWorldLine(
  uid: string,
  lifeId: string
): Promise<{ life: LifeRecord; worldLine: QuantumWorldLine } | null> {
  try {
    const lifeDocRef = doc(db, 'users', uid, 'lives', lifeId);
    const snap = await getDoc(lifeDocRef);

    if (!snap.exists()) {
      return null;
    }

    const data = snap.data();
    const life: LifeRecord = {
      id: snap.id,
      title: data.title || '無題の世界線',
      initialTheme: data.initialTheme || '',
      totalQuanta: data.totalQuanta ?? 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    const worldLine: QuantumWorldLine = data.worldLine || {
      id: snap.id,
      lifeTitle: life.title,
      userId: uid,
      userName: '量子観測者',
      totalQuanta: life.totalQuanta,
      nodes: [],
      logs: [],
      entanglements: [],
    };

    return { life, worldLine };
  } catch (error) {
    console.error('Failed to load life world line:', error);
    return null;
  }
}

/**
 * 人生の世界線データを保存・同期
 */
export async function saveLifeWorldLine(
  uid: string,
  lifeId: string,
  worldLine: QuantumWorldLine
): Promise<void> {
  try {
    const lifeDocRef = doc(db, 'users', uid, 'lives', lifeId);
    const nowIso = new Date().toISOString();

    await updateDoc(lifeDocRef, {
      title: worldLine.lifeTitle || '無題の世界線',
      totalQuanta: worldLine.totalQuanta,
      updatedAt: nowIso,
      worldLine: {
        ...worldLine,
        id: lifeId,
      },
      serverUpdatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to save life world line:', error);
    throw error;
  }
}

/**
 * 人生（Life）を個別に削除
 */
export async function deleteUserLife(uid: string, lifeId: string): Promise<void> {
  try {
    const lifeDocRef = doc(db, 'users', uid, 'lives', lifeId);
    await deleteDoc(lifeDocRef);
  } catch (error) {
    console.error('Failed to delete life:', error);
    throw error;
  }
}
