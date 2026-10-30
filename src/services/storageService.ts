/**
 * @file src/services/storageService.ts
 * @description Onigiri Quantum (Oni-Q) ローカルストレージ管理サービス
 * - バックエンド/Firebase依存を全廃した完全スタンドアロンのローカル完結型アーキテクチャ
 * - ブラウザの localStorage を利用した人生（Life）および量子世界線のCRUD操作
 * - 端末内全データ完全消去（clearAllData）機能
 */

import {
  QuantumWorldLine,
  OnigiriNode,
  QuantumBranch,
  QuantumLog,
  QuantumEntanglement,
} from '../types/quantum';

// 要求された厳格な型定義のエクスポート
export type Option = QuantumBranch;
export type Node = OnigiriNode;

export interface Life {
  /** 人生の一意ID */
  id: string;
  /** 人生の名前（例:「挑戦の人生」「キャリア編」） */
  title: string;
  /** 最初の決断の原点テーマ（例:「大学卒業・ファーストキャリアの分岐点」） */
  initialTheme: string;
  /** 累積観測数（quantumカウント） */
  totalQuanta: number;
  /** 作成日時 (ISO8601) */
  createdAt: string;
  /** 最終更新日時 (ISO8601) */
  updatedAt: string;
  /** この人生に紐づく量子世界線グラフデータ */
  worldLine: QuantumWorldLine;
}

const STORAGE_KEYS = {
  LIVES: 'oni_q_local_lives_v1',
  ACTIVE_LIFE_ID: 'oni_q_active_life_id_v1',
} as const;

/**
 * 安全に localStorage から JSON を取得するヘルパー
 */
function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[storageService] Failed to read key: ${key}`, error);
    return fallback;
  }
}

/**
 * 安全に localStorage に JSON を書き込むヘルパー
 */
function safeSetItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[storageService] Failed to write key: ${key}`, error);
  }
}

/**
 * 1. 人生一覧の取得（loadLives）
 * 更新日時の降順でソートして返却
 */
export function loadLives(): Life[] {
  const lives = safeGetItem<Life[]>(STORAGE_KEYS.LIVES, []);
  return lives.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/**
 * 2. 特定の人生の取得（getLifeById）
 */
export function getLifeById(id: string): Life | null {
  const lives = loadLives();
  const life = lives.find((l) => l.id === id);
  return life || null;
}

/**
 * 3. 人生の保存・更新（saveLife）
 * 新規作成時は先頭に追加、既存更新時は内容を置換
 */
export function saveLife(lifeToSave: Life): void {
  const lives = loadLives();
  const now = new Date().toISOString();
  const index = lives.findIndex((l) => l.id === lifeToSave.id);

  const updatedLife: Life = {
    ...lifeToSave,
    updatedAt: now,
  };

  if (index >= 0) {
    lives[index] = updatedLife;
  } else {
    lives.unshift(updatedLife);
  }

  safeSetItem(STORAGE_KEYS.LIVES, lives);
}

/**
 * 4. 人生の削除（deleteLife）
 */
export function deleteLife(id: string): void {
  const lives = loadLives();
  const filtered = lives.filter((l) => l.id !== id);
  safeSetItem(STORAGE_KEYS.LIVES, filtered);

  // アクティブなIDが削除対象ならクリア
  const activeId = getActiveLifeId();
  if (activeId === id) {
    setActiveLifeId(null);
  }
}

/**
 * 5. 全データ消去機能（clearAllData）
 * 端末内の Onigiri Quantum 関連データを完全削除し、初期状態へリセット
 */
export function clearAllData(): void {
  try {
    // 関連するすべてのキーを削除
    localStorage.removeItem(STORAGE_KEYS.LIVES);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_LIFE_ID);

    // 接頭辞 oni_q_ で始まる他のキーも包括的にクリーンアップ
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('oni_q_')) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (error) {
    console.error('[storageService] Failed to clear all data:', error);
  }
}

/**
 * 最後に開いていたアクティブな人生IDの取得
 */
export function getActiveLifeId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_LIFE_ID);
  } catch {
    return null;
  }
}

/**
 * アクティブな人生IDの保存
 */
export function setActiveLifeId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_LIFE_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_LIFE_ID);
    }
  } catch (error) {
    console.error('[storageService] Failed to set active life id:', error);
  }
}

/**
 * 新規人生の創成ヘルパー（初期量子ノードを含むオブジェクト生成）
 */
export function createNewLifeRecord(
  title: string,
  initialTheme: string,
  initialBranches: { label: string; description: string }[]
): Life {
  const lifeId = `life_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const rootNodeId = `node_root_${Date.now()}`;

  const branches: Option[] = initialBranches.map((b, i) => ({
    id: `b-${rootNodeId}-${i + 1}`,
    label: b.label || `選択肢 ${i + 1}`,
    description: b.description || '',
    status: 'superposed',
    probabilityAmplitude: 0.5,
  }));

  const rootNode: Node = {
    id: rootNodeId,
    title: initialTheme,
    category: 'career',
    state: 'superposition',
    flavor: 'salmon',
    position: { x: 280, y: 340 },
    parentId: null,
    branches,
    createdAt: now,
    tags: ['人生の原点', '最初の決断'],
  };

  const worldLine: QuantumWorldLine = {
    id: lifeId,
    lifeTitle: title,
    userId: 'local-observer',
    userName: 'ローカル観測者',
    totalQuanta: 0,
    nodes: [rootNode],
    logs: [],
    entanglements: [],
  };

  const newLife: Life = {
    id: lifeId,
    title,
    initialTheme,
    totalQuanta: 0,
    createdAt: now,
    updatedAt: now,
    worldLine,
  };

  saveLife(newLife);
  return newLife;
}
