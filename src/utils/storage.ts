/**
 * @file src/utils/storage.ts
 * @description LocalStorage永続化および初期量子世界線シードデータ
 */

import { QuantumWorldLine, OnigiriNode, QuantumLog } from '../types/quantum';

const STORAGE_KEY = 'oni_q_quantum_world_line_v4';

/**
 * 初期シードデータ：ある人物の決断の軌跡（現実味のある人生の分岐点）
 */
export const DEFAULT_INITIAL_WORLDLINE: QuantumWorldLine = {
  userId: 'observer-001',
  userName: '量子観測者 (Seeker)',
  totalQuanta: 4,
  nodes: [
    {
      id: 'node-origin',
      title: '大学卒業後の進路決定',
      category: 'career',
      state: 'observed',
      flavor: 'classic-salt',
      position: { x: 150, y: 350 },
      parentId: null,
      branches: [
        {
          id: 'b-origin-1',
          label: '安定した大手IT企業に就職',
          description: '技術の基礎とビジネス作法を組織で徹底的に学ぶ道',
          status: 'actualized',
          probabilityAmplitude: 0.65,
        },
        {
          id: 'b-origin-2',
          label: '大学院へ進学しAI研究継続',
          description: '学術の世界に残り先端理論を追究する道',
          status: 'counterfactual',
          probabilityAmplitude: 0.35,
          counterfactualInsight: {
            hypotheticalRegretScore: 2,
            revisitedNotes: '現場での実務経験が今の血肉になっているため、この決断は正解だったと確信。',
            abandonedAt: '2022-03-25T10:00:00Z',
          },
        },
      ],
      actualizedBranchId: 'b-origin-1',
      quantumLogId: '1q-20220325-01',
      createdAt: '2022-03-20T00:00:00Z',
      observedAt: '2022-03-25T10:00:00Z',
      tags: ['進路', 'ファーストキャリア', '出発点'],
    },
    {
      id: 'node-career-shift',
      title: '3年目のキャリア選択',
      category: 'career',
      state: 'observed',
      flavor: 'salmon',
      position: { x: 590, y: 310 },
      parentId: 'node-origin',
      branches: [
        {
          id: 'b-cs-2',
          label: '大手企業でプロジェクトリーダー昇格',
          description: '盤石な体制の中で順調に出世街道を歩む道',
          status: 'counterfactual',
          probabilityAmplitude: 0.45,
          counterfactualInsight: {
            hypotheticalRegretScore: 4,
            revisitedNotes: '時々大企業の安定とリソースが恋しくなるが、裁量の大きさは何物にも代えがたい。',
            abandonedAt: '2024-04-01T09:30:00Z',
          },
        },
        {
          id: 'b-cs-1',
          label: 'スタートアップの創業期CTOとして参画',
          description: '未知の荒波へ飛び込み、ゼロからプロダクトを立ち上げる挑戦',
          status: 'actualized',
          probabilityAmplitude: 0.55,
        },
      ],
      actualizedBranchId: 'b-cs-1',
      quantumLogId: '1q-20240401-02',
      createdAt: '2024-03-15T00:00:00Z',
      observedAt: '2024-04-01T09:30:00Z',
      tags: ['挑戦', 'スタートアップ', 'CTO'],
    },
    {
      id: 'node-lifestyle',
      title: '住環境と働き方の再定義',
      category: 'lifestyle',
      state: 'observed',
      flavor: 'ume',
      position: { x: 1030, y: 350 },
      parentId: 'node-career-shift',
      branches: [
        {
          id: 'b-life-1',
          label: '地方拠点へ二拠点生活を開始',
          description: '自然豊かな環境で精神の平穏を保ちながらリモートワーク',
          status: 'actualized',
          probabilityAmplitude: 0.7,
        },
        {
          id: 'b-life-2',
          label: '都心タワーマンションへ移住',
          description: '人脈と最新カルチャーの中心地に居座る道',
          status: 'counterfactual',
          probabilityAmplitude: 0.3,
          counterfactualInsight: {
            hypotheticalRegretScore: 1,
            revisitedNotes: '朝の静けさと星空で思考のクリアさが劇的に改善された。',
            abandonedAt: '2025-06-15T14:00:00Z',
          },
        },
      ],
      actualizedBranchId: 'b-life-1',
      quantumLogId: '1q-20250615-03',
      createdAt: '2025-05-10T00:00:00Z',
      observedAt: '2025-06-15T14:00:00Z',
      tags: ['移住', 'ウェルビーイング', '二拠点'],
    },
    {
      id: 'node-creative',
      title: 'オリジナルプロダクトの一般公開',
      category: 'creative',
      state: 'observed',
      flavor: 'cosmic-nori',
      position: { x: 1470, y: 310 },
      parentId: 'node-lifestyle',
      branches: [
        {
          id: 'b-cr-1',
          label: '全世界に向けてオープンソース＆個人ローンチ',
          description: '個人の名前で世界へプロダクトを問う確固たる決断',
          status: 'actualized',
          probabilityAmplitude: 1.0,
        },
      ],
      actualizedBranchId: 'b-cr-1',
      quantumLogId: '1q-20260210-04',
      createdAt: '2026-01-20T00:00:00Z',
      observedAt: '2026-02-10T11:00:00Z',
      tags: ['創作', 'ローンチ', '独立'],
    },
    {
      id: 'node-current-superposition',
      title: '次なる世界線の観測：海外移住か国内特化か',
      category: 'existential',
      state: 'superposition',
      flavor: 'ikura-gilded',
      position: { x: 1910, y: 310 },
      parentId: 'node-creative',
      branches: [
        {
          id: 'b-curr-1',
          label: '北欧へ移住しグローバルなオープンイノベーションコミュニティを形成',
          description: '異なる文化圏に身を投じ、未知のシナジーを追求する',
          status: 'superposed',
          probabilityAmplitude: 0.52,
        },
        {
          id: 'b-curr-2',
          label: '国内に量子研究所を設立し後進を育成',
          description: '自国のエコシステムに深く貢献し、世代をつなぐ',
          status: 'superposed',
          probabilityAmplitude: 0.48,
        },
      ],
      createdAt: '2026-10-25T12:00:00Z',
      tags: ['現在進行中', '重ね合わせ', '未来の分岐点'],
    },
  ],
  logs: [
    {
      quantumId: '1q-20220325-01',
      observerId: 'observer-001',
      nodeId: 'node-origin',
      selectedBranch: {
        id: 'b-origin-1',
        label: '安定した大手IT企業に就職',
        description: '技術の基礎とビジネス作法を組織で徹底的に学ぶ道',
        status: 'actualized',
        probabilityAmplitude: 0.65,
      },
      counterfactualBranches: [
        {
          id: 'b-origin-2',
          label: '大学院へ進学しAI研究継続',
          description: '学術の世界に残り先端理論を追究する道',
          status: 'counterfactual',
          probabilityAmplitude: 0.35,
        },
      ],
      certainty: 0.82,
      valence: 0.6,
      declarationText: 'まずは社会の大きな波を内側から知り、盤石な基盤を築くことを観測した。',
      timestamp: '2022-03-25T10:00:00Z',
    },
    {
      quantumId: '1q-20240401-02',
      observerId: 'observer-001',
      nodeId: 'node-career-shift',
      selectedBranch: {
        id: 'b-cs-1',
        label: 'スタートアップの創業期CTOとして参画',
        description: '未知の荒波へ飛び込み、ゼロからプロダクトを立ち上げる挑戦',
        status: 'actualized',
        probabilityAmplitude: 0.55,
      },
      counterfactualBranches: [
        {
          id: 'b-cs-2',
          label: '大手企業でプロジェクトリーダー昇格',
          description: '盤石な体制の中で順調に出世街道を歩む道',
          status: 'counterfactual',
          probabilityAmplitude: 0.45,
        },
      ],
      certainty: 0.75,
      valence: 0.85,
      declarationText: '心地よい安定を脱ぎ捨て、我が手で不確定性を切り開くことを観測・確定。',
      timestamp: '2024-04-01T09:30:00Z',
    },
    {
      quantumId: '1q-20250615-03',
      observerId: 'observer-001',
      nodeId: 'node-lifestyle',
      selectedBranch: {
        id: 'b-life-1',
        label: '地方拠点へ二拠点生活を開始',
        description: '自然豊かな環境で精神の平穏を保ちながらリモートワーク',
        status: 'actualized',
        probabilityAmplitude: 0.7,
      },
      counterfactualBranches: [
        {
          id: 'b-life-2',
          label: '都心タワーマンションへ移住',
          description: '人脈と最新カルチャーの中心地に居座る道',
          status: 'counterfactual',
          probabilityAmplitude: 0.3,
        },
      ],
      certainty: 0.9,
      valence: 0.95,
      declarationText: '外的ノイズを減衰させ、本質的な思索の波長を最大化する世界線を選択。',
      timestamp: '2025-06-15T14:00:00Z',
    },
    {
      quantumId: '1q-20260210-04',
      observerId: 'observer-001',
      nodeId: 'node-creative',
      selectedBranch: {
        id: 'b-cr-1',
        label: '全世界に向けてオープンソース＆個人ローンチ',
        description: '個人の名前で世界へプロダクトを問う決断',
        status: 'actualized',
        probabilityAmplitude: 0.8,
      },
      counterfactualBranches: [
        {
          id: 'b-cr-2',
          label: 'VC調達を行い大規模会社化',
          description: '外部資金を入れて急拡大を狙う道',
          status: 'counterfactual',
          probabilityAmplitude: 0.2,
        },
      ],
      certainty: 0.88,
      valence: 0.9,
      declarationText: '自身の魂を込めた作品を、直接世界へ放流し観測者たちに届ける。',
      timestamp: '2026-02-10T11:00:00Z',
    },
  ],
  entanglements: [
    {
      id: 'entangle-001',
      sourceNodeId: 'node-career-shift',
      targetUserId: 'observer-042 (共同創業者)',
      targetNodeId: 'node-ext-77',
      eventType: 'collaboration',
      convergenceLabel: 'スタートアップ共同創業による世界線の交差',
      entangledAt: '2024-04-01T10:00:00Z',
    },
  ],
};

export function loadWorldLine(): QuantumWorldLine {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_INITIAL_WORLDLINE;
    }
    return JSON.parse(raw) as QuantumWorldLine;
  } catch (e) {
    console.error('Failed to load worldline from storage', e);
    return DEFAULT_INITIAL_WORLDLINE;
  }
}

export function saveWorldLine(data: QuantumWorldLine): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save worldline to storage', e);
  }
}

export function resetToDefaultWorldLine(): QuantumWorldLine {
  saveWorldLine(DEFAULT_INITIAL_WORLDLINE);
  return DEFAULT_INITIAL_WORLDLINE;
}
