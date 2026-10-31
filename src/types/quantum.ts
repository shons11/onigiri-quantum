/**
 * @file src/types/quantum.ts
 * @description Onigiri Quantum (Oni-Q) コアデータモデル定義
 * 人生の決断（1quantum）を量子状態の重ね合わせ・観測・収束としてモデル化
 */

/**
 * 量子状態ステータス
 * - superposition: 重ね合わせ状態（未確定・葛藤中）
 * - observed: 観測・決断確定（Collapsed / 主世界線へ移行）
 * - entangled: 他者世界線との量子もつれ・合流（Convergence）
 */
export type QuantumState = 'superposition' | 'observed' | 'entangled';

/**
 * おにぎりノードのビジュアルタイプ・トッピング
 * 人生の節目や属性を象徴するメタファー
 */
export type OnigiriFlavor = 
  | 'classic-salt'     // 基本・素朴な決断（塩むすび）
  | 'salmon'           // キャリア・挑戦（紅鮭）
  | 'ume'              // 忍耐・健康・価値観（紀州梅）
  | 'tuna-mayo'        // 冒険・好奇心（ツナマヨ）
  | 'kombu'            // 深い思索・家族・ルーツ（昆布）
  | 'ikura-gilded'     // 大きな転換点・祝祭（金箔いくら）
  | 'cosmic-nori';     // 量子特異点（深宇宙の海苔）

/**
 * 選択肢のステータス
 */
export type BranchStatus = 
  | 'superposed'   // 未確定（ゆらめき）
  | 'actualized'   // 観測・採択（光る主世界線）
  | 'counterfactual'; // 棄却・選ばれなかった道（IFの透明枝線）

/**
 * 選択肢（枝 / Branch）の定義
 */
export interface QuantumBranch {
  /** 選択肢固有ID */
  id: string;
  /** 選択肢ラベル（例:「転職する」「現職に留まる」） */
  label: string;
  /** 詳細な意図・背景・葛藤 */
  description?: string;
  /** 枝の状態（採択 / 棄却 / 未確定） */
  status: BranchStatus;
  /** 重ね合わせ時の推定確率振幅 / 期待度 (0.0 ~ 1.0) */
  probabilityAmplitude: number;
  /** 
   * 選ばれなかった場合（IFの世界線）の追跡メタデータ
   * 将来の振り返り（Counterfactual Reflection）用
   */
  counterfactualInsight?: {
    hypotheticalRegretScore?: number; // 0~10の後悔・未練度
    revisitedNotes?: string;          // 後日の振り返りメモ
    abandonedAt: string;              // ISO8601
  };
}

/**
 * 1回のおにぎりノード（決断イベント点）
 */
export interface OnigiriNode {
  /** ノードID */
  id: string;
  /** ユーザーフレンドリーなタイトル（例:「キャリアの分岐点 2026」） */
  title: string;
  /** 決断のカテゴリ */
  category: 'career' | 'relationship' | 'lifestyle' | 'creative' | 'existential';
  /** 現在の量子状態 */
  state: QuantumState;
  /** おにぎりフレーバー（ビジュアル表現） */
  flavor: OnigiriFlavor;
  /** 空間上の座標（2D/3D空間） */
  position: {
    x: number;
    y: number;
    z?: number;
  };
  /** 親ノードID（前の決断おにぎり） - ルートの場合は null */
  parentId: string | null;
  /** 親ノードのどの枝から分岐したか（過去の枝からの分岐・挿入時に指定） */
  originBranchId?: string;
  /** 過去の決断間にレトロアクティブに挿入されたノードかどうか */
  isInsertedRetroactive?: boolean;
  /** 未来の揺らぎ（接続元・接続先のない未接続の浮遊量子ノード） */
  isFutureFluctuation?: boolean;
  /** ノード種別: 'quantum'（重ね合わせ/決断量子）または 'fact'（確定した事実） */
  nodeType?: 'quantum' | 'fact';
  /** 事実ノードかどうか（揺らぎを持たずに作成されたノード） */
  isFact?: boolean;
  /** 静止描画用の固定表示角度（ノード固有のランダム角） */
  fixedAngle?: number;
  /** この決断ノードにおける選択肢群 */
  branches: QuantumBranch[];
  /** 採択された選択肢ID（state === 'observed' のとき確定） */
  actualizedBranchId?: string;
  /** 1quantumログへの参照ID */
  quantumLogId?: string;
  /** ノード作成日時 */
  createdAt: string;
  /** 観測（決断）完了日時 */
  observedAt?: string;
  /** 関連するタグ */
  tags: string[];
}

/**
 * 1quantumログ単位（観測記録）
 * 1回の観測・決断につき生成されるイミュータブルな確定ログ
 */
export interface QuantumLog {
  /** ログ一意ID */
  quantumId: string; // 例: "1q-20261028-0914"
  /** 観測者（ユーザー）ID */
  observerId: string;
  /** 対象おにぎりノードID */
  nodeId: string;
  /** 採択された世界線 */
  selectedBranch: QuantumBranch;
  /** 棄却されたIFの世界線リスト */
  counterfactualBranches: QuantumBranch[];
  /** 観測時の確信度 (0.0: 直感・賭け ~ 1.0: 確信) */
  certainty: number;
  /** 決断時の感情エネルギー（-1.0: 不安・苦渋 ~ +1.0: 希望・情熱） */
  valence?: number;
  /** 決断宣言文（Observation Declaration） */
  declarationText?: string;
  /** タイムスタンプ (ISO8601) */
  timestamp: string;
}

/**
 * 将来構想：他者世界線との量子もつれ（Entanglement / Convergence）
 */
export interface QuantumEntanglement {
  id: string;
  sourceNodeId: string;
  targetUserId: string;
  targetNodeId: string;
  eventType: 'encounter' | 'collaboration' | 'partnership' | 'divergence';
  convergenceLabel: string;
  entangledAt: string;
}

/**
 * 人生の世界線レコード（LifeRecord）
 * 1ユーザーが複数の人生（例: 挑戦の人生, キャリア編など）を保有・管理
 */
export interface LifeRecord {
  id: string;
  title: string;
  initialTheme: string;
  totalQuanta: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 全体世界線グラフデータ
 */
export interface QuantumWorldLine {
  id?: string;
  lifeTitle?: string;
  userId: string;
  userName: string;
  totalQuanta: number; // 累積観測数（例: 42 quantum）
  nodes: OnigiriNode[];
  logs: QuantumLog[];
  entanglements: QuantumEntanglement[];
}

