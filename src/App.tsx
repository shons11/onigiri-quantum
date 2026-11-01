/**
 * @file src/App.tsx
 * @description Onigiri Quantum (Oni-Q) メインアプリケーション（ローカル完結型アーキテクチャ）
 * - 外部サーバー/Firebase依存を完全排除し、端末内 localStorage で安全に稼働
 * - 画面ルーティング管理（currentView: 'title' | 'space', currentLifeId: string | null）
 * - START MY LIFE からの初期量子創成 ＆ 過去の世界線再開（Resume）
 * - 量子観測（決断の確定）、IF世界線の追跡、多重世界線シミュレーション
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  QuantumWorldLine,
  OnigiriNode,
  QuantumBranch,
  QuantumLog,
  QuantumEntanglement,
} from './types/quantum';
import {
  Life,
  loadLives,
  saveLife,
  getLifeById,
  deleteLife,
  clearAllData,
  createNewLifeRecord,
  getActiveLifeId,
  setActiveLifeId,
} from './services/storageService';
import { Header } from './components/Header';
import { CosmicCanvas, getBranchLayout } from './components/CosmicCanvas';
import { ObservationModal } from './components/ObservationModal';
import { NewSuperpositionModal, ConnectionConfig } from './components/NewSuperpositionModal';
import { Sparkles, Plus, ChevronDown, Trash2 } from 'lucide-react';
import { NodeDetailDrawer } from './components/NodeDetailDrawer';
import { EntanglementModal } from './components/EntanglementModal';
import { GuideModal } from './components/GuideModal';
import { TitleScreen } from './components/TitleScreen';
import { NewLifeModal } from './components/NewLifeModal';

export default function App() {
  // 画面ルーティング状態
  const [currentView, setCurrentView] = useState<'title' | 'space'>('title');
  const [currentLifeId, setCurrentLifeId] = useState<string | null>(null);
  const [currentLifeTitle, setCurrentLifeTitle] = useState<string>('');

  // 人生（Life）データリスト
  const [lives, setLives] = useState<Life[]>([]);

  // 現在表示中の世界線
  const [worldLine, setWorldLine] = useState<QuantumWorldLine>({
    userId: 'local-observer',
    userName: 'ローカル観測者',
    totalQuanta: 0,
    nodes: [],
    logs: [],
    entanglements: [],
  });

  // キャンバス選択状態
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [showCounterfactual, setShowCounterfactual] = useState<boolean>(true);

  // 未来の揺らぎプルダウン開閉状態
  const [isFutureDropdownOpen, setIsFutureDropdownOpen] = useState(false);

  // モーダル表示状態
  const [isNewLifeModalOpen, setIsNewLifeModalOpen] = useState(false);
  const [observationNode, setObservationNode] = useState<OnigiriNode | null>(null);
  const [superpositionModalConfig, setSuperpositionModalConfig] = useState<{
    isOpen: boolean;
    sourceNodeId: string | null;
    targetNodeId: string | null;
    originBranchId?: string | null;
    connectingFutureNodeId?: string | null;
  }>({
    isOpen: false,
    sourceNodeId: null,
    targetNodeId: null,
    originBranchId: null,
    connectingFutureNodeId: null,
  });
  const [isEntanglementOpen, setIsEntanglementOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // 1. 初回ロード：localStorage から人生一覧を読み出し
  useEffect(() => {
    const loadedLives = loadLives();
    setLives(loadedLives);

    // 直近に作業していた人生があれば復元可能（初期画面はタイトル）
    const lastActiveId = getActiveLifeId();
    if (lastActiveId) {
      const activeLife = loadedLives.find((l) => l.id === lastActiveId);
      if (activeLife) {
        // オプション: 以前の人生情報のみ保持し、ユーザーがタイトル画面から選べるようにする
        setCurrentLifeTitle(activeLife.title);
      }
    }
  }, []);

  // 2. 世界線データのローカル自動保存（localStorage）
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (currentLifeId && currentView === 'space' && worldLine.nodes.length > 0) {
      const existingLife = getLifeById(currentLifeId);
      if (existingLife) {
        const updatedLife: Life = {
          ...existingLife,
          title: currentLifeTitle || existingLife.title,
          totalQuanta: worldLine.totalQuanta,
          worldLine,
        };
        saveLife(updatedLife);
        setLives(loadLives());
      }
    }
  }, [worldLine, currentLifeId, currentLifeTitle, currentView]);

  // 新規人生の創成（START MY LIFE）
  const handleCreateNewLife = async (
    title: string,
    initialTheme: string,
    branches: { label: string; description: string }[]
  ) => {
    const newLife = createNewLifeRecord(title, initialTheme, branches);
    setLives(loadLives());
    setCurrentLifeId(newLife.id);
    setCurrentLifeTitle(newLife.title);
    setWorldLine(newLife.worldLine);
    setSelectedNodeId(newLife.worldLine.nodes[0]?.id || null);
    setSelectedBranchId(null);
    setActiveLifeId(newLife.id);
    setCurrentView('space');
    setIsNewLifeModalOpen(false);
  };

  // 過去の人生を再開（Resume: 全体キャンバスを表示）
  const handleResumeLife = (lifeId: string) => {
    const life = getLifeById(lifeId);
    if (life) {
      setCurrentLifeId(life.id);
      setCurrentLifeTitle(life.title);
      setWorldLine(life.worldLine);
      setSelectedNodeId(null); // 全体キャンバスをまず表示（ドロワーや作成画面を開かない）
      setSelectedBranchId(null);
      setSuperpositionModalConfig({
        isOpen: false,
        sourceNodeId: null,
        targetNodeId: null,
        originBranchId: null,
      });
      setActiveLifeId(life.id);
      setCurrentView('space');
    }
  };

  // 人生（Life）の個別削除
  const handleDeleteLife = (lifeId: string, _title: string) => {
    deleteLife(lifeId);
    setLives(loadLives());

    if (currentLifeId === lifeId) {
      setCurrentLifeId(null);
      setCurrentView('title');
    }
  };

  // 端末内全データ完全リセット
  const handleClearAllData = () => {
    clearAllData();
    setLives([]);
    setCurrentLifeId(null);
    setCurrentView('title');
    setWorldLine({
      userId: 'local-observer',
      userName: 'ローカル観測者',
      totalQuanta: 0,
      nodes: [],
      logs: [],
      entanglements: [],
    });
  };

  // タイトル画面へ戻る
  const handleReturnToTitle = () => {
    setCurrentView('title');
    setCurrentLifeId(null);
    setActiveLifeId(null);
    setSelectedNodeId(null);
    setSelectedBranchId(null);
    setLives(loadLives());
  };

  // 観測（決断）の確定処理
  const handleConfirmObservation = (
    nodeId: string,
    chosenBranchId: string,
    certainty: number
  ) => {
    setWorldLine((prev) => {
      const nodeIndex = prev.nodes.findIndex((n) => n.id === nodeId);
      if (nodeIndex === -1) return prev;

      const targetNode = prev.nodes[nodeIndex];
      const now = new Date().toISOString();
      const quantumId = `1q-${now.slice(0, 10).replace(/-/g, '')}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

      const updatedBranches: QuantumBranch[] = targetNode.branches.map((b) => {
        if (b.id === chosenBranchId) {
          return { ...b, status: 'actualized' };
        }
        return {
          ...b,
          status: 'counterfactual',
          counterfactualInsight: {
            hypotheticalRegretScore: 3,
            revisitedNotes: '',
            abandonedAt: now,
          },
        };
      });

      const actualizedBranch = updatedBranches.find((b) => b.id === chosenBranchId)!;
      const counterfactualBranches = updatedBranches.filter((b) => b.id !== chosenBranchId);

      const newLog: QuantumLog = {
        quantumId,
        observerId: prev.userId,
        nodeId,
        selectedBranch: actualizedBranch,
        counterfactualBranches,
        certainty,
        timestamp: now,
      };

      const updatedNode: OnigiriNode = {
        ...targetNode,
        state: 'observed',
        branches: updatedBranches,
        actualizedBranchId: chosenBranchId,
        quantumLogId: quantumId,
        observedAt: now,
      };

      const updatedNodes = [...prev.nodes];
      updatedNodes[nodeIndex] = updatedNode;

      const nextQuanta = prev.totalQuanta + 1;

      return {
        ...prev,
        totalQuanta: nextQuanta,
        nodes: updatedNodes,
        logs: [newLog, ...prev.logs],
      };
    });

    setObservationNode(null);
  };

  // 作成済みの量子を揺らぎ状態（重ね合わせ）に戻す機能
  // 実線が点線状態に戻り、再度観測・確定が可能になる
  const handleRevertToSuperposition = (nodeId: string) => {
    setWorldLine((prev) => {
      const nodeIndex = prev.nodes.findIndex((n) => n.id === nodeId);
      if (nodeIndex === -1) return prev;

      const targetNode = prev.nodes[nodeIndex];
      // 揺らぎ（ブランチ）のステータスをすべて 'superposed' に戻す
      const updatedBranches: QuantumBranch[] = targetNode.branches.map((b) => ({
        ...b,
        status: 'superposed',
        counterfactualInsight: undefined,
      }));

      const updatedNode: OnigiriNode = {
        ...targetNode,
        state: 'superposition',
        branches: updatedBranches,
        actualizedBranchId: undefined,
        quantumLogId: undefined,
        observedAt: undefined,
      };

      const updatedNodes = [...prev.nodes];
      updatedNodes[nodeIndex] = updatedNode;

      // 該当ノードのログを削除
      const updatedLogs = prev.logs.filter((l) => l.nodeId !== nodeId);
      const nextQuanta = Math.max(0, prev.totalQuanta - 1);

      return {
        ...prev,
        totalQuanta: nextQuanta,
        nodes: updatedNodes,
        logs: updatedLogs,
      };
    });
  };

  // 過去に作成した量子・事実の削除機能
  // 削除すると、該当の事実や量子（紐づいている可能性含む）が消去され、接続元と接続先が直接再接続される
  // 消す量子の接続先がない場合は単純に削除する
  const handleDeleteNode = (nodeId: string) => {
    setWorldLine((prev) => {
      const targetNode = prev.nodes.find((n) => n.id === nodeId);
      if (!targetNode) return prev;

      const parentId = targetNode.parentId;
      const parentNode = parentId ? prev.nodes.find((n) => n.id === parentId) || null : null;
      const inheritedBranchId =
        targetNode.originBranchId ||
        parentNode?.actualizedBranchId ||
        parentNode?.branches[0]?.id ||
        undefined;

      // 削除対象ノードを親としていた子ノード（接続先）とその子孫ノードを特定
      const directChildren = prev.nodes.filter((n) => n.parentId === nodeId);
      const descendantIds = new Set<string>();
      const queue = directChildren.map((c) => c.id);
      for (const cid of queue) {
        descendantIds.add(cid);
      }
      while (queue.length > 0) {
        const currId = queue.shift()!;
        for (const n of prev.nodes) {
          if (n.parentId === currId && !descendantIds.has(n.id)) {
            descendantIds.add(n.id);
            queue.push(n.id);
          }
        }
      }

      // 接続元がある場合のY座標計算（直接の子ノードのY座標を接続元の選択肢または事実に合わせる）
      let reconnectedY: number | null = null;
      if (parentNode) {
        if (parentNode.branches.length > 0) {
          let branchIdx = inheritedBranchId
            ? parentNode.branches.findIndex((b) => b.id === inheritedBranchId)
            : parentNode.branches.findIndex((b) => b.id === parentNode.actualizedBranchId);
          if (branchIdx < 0) branchIdx = 0;
          const branchPos = getBranchLayout(
            parentNode.position.x,
            parentNode.position.y,
            branchIdx,
            parentNode.branches.length
          );
          reconnectedY = branchPos.y;
        } else {
          reconnectedY = parentNode.position.y;
        }
      }

      const deltaX = directChildren.length > 0
        ? parentNode
          ? (parentNode.position.x + 440) - directChildren[0].position.x
          : targetNode.position.x - directChildren[0].position.x
        : 0;

      // 接続先がある場合は接続元と直接接続し、接続先がない場合は単純に削除する
      const updatedNodes = prev.nodes
        .filter((n) => n.id !== nodeId)
        .map((n) => {
          if (n.parentId === nodeId) {
            return {
              ...n,
              parentId: parentId,
              // 削除されたノードの選択肢IDではなく、接続元（parentNode）の選択肢IDを引き継ぐ
              originBranchId: parentId ? inheritedBranchId : undefined,
              position: {
                x: n.position.x + deltaX,
                y: reconnectedY !== null ? reconnectedY : n.position.y,
              },
            };
          }
          if (descendantIds.has(n.id)) {
            return {
              ...n,
              position: {
                ...n.position,
                x: n.position.x + deltaX,
              },
            };
          }
          return n;
        });

      const updatedLogs = prev.logs.filter(
        (l) => l.nodeId !== nodeId && l.quantumId !== targetNode.quantumLogId
      );

      const wasObservedQuantum = targetNode.state === 'observed' && !targetNode.isFact;
      const nextQuanta = wasObservedQuantum ? Math.max(0, prev.totalQuanta - 1) : prev.totalQuanta;

      return {
        ...prev,
        totalQuanta: nextQuanta,
        nodes: updatedNodes,
        logs: updatedLogs,
      };
    });

    setSelectedNodeId(null);
    setSelectedBranchId(null);
  };

  // 決定（Decided）または量子ノードからのレトロアクティブ量子揺らぎ挿入またはNew Quantum
  const handleOpenInsertRetroactive = (parentNode: OnigiriNode, branch?: QuantumBranch) => {
    const nextNode =
      worldLine.nodes.find(
        (n) =>
          n.parentId === parentNode.id &&
          (!branch || n.originBranchId === branch.id || !n.originBranchId)
      ) || null;

    setSuperpositionModalConfig({
      isOpen: true,
      sourceNodeId: parentNode.id,
      targetNodeId: nextNode ? nextNode.id : null,
      originBranchId: branch ? branch.id : null,
      connectingFutureNodeId: null,
    });
  };

  // 「未来の揺らぎ」を「事実 (Fact)」としてメインマップの選択された接続元・接続先の間に挿入・配置する
  const handleConnectFutureNodeAsFact = (
    futureNodeId: string,
    customTitle: string,
    category: OnigiriNode['category'],
    tags: string[],
    connections: ConnectionConfig
  ) => {
    setWorldLine((prev) => {
      const futureNode = prev.nodes.find((n) => n.id === futureNodeId);
      if (!futureNode) return prev;

      const { sourceNodeId, targetNodeId, originBranchId } = connections;
      const mainSource = sourceNodeId
        ? prev.nodes.find((n) => !n.isFutureFluctuation && n.id === sourceNodeId) || null
        : null;
      const explicitTarget = targetNodeId
        ? prev.nodes.find((n) => !n.isFutureFluctuation && n.id === targetNodeId) || null
        : null;

      if (!mainSource && !explicitTarget) return prev;

      const mainBranchId = mainSource
        ? originBranchId ||
          mainSource.actualizedBranchId ||
          mainSource.branches[0]?.id ||
          undefined
        : undefined;

      // 接続先が明示されている場合はそのノード、未指定でも接続元の該当選択肢に既存の子ノードがあればその間に挿入する
      const mainTarget =
        explicitTarget ||
        (mainSource
          ? prev.nodes.find(
              (n) =>
                !n.isFutureFluctuation &&
                n.id !== futureNodeId &&
                n.parentId === mainSource.id &&
                (!mainBranchId || n.originBranchId === mainBranchId || !n.originBranchId)
            ) || null
          : null);

      let newX = 280;
      let newY = 340;

      if (mainSource) {
        newX = mainSource.position.x + 440;
        const numBranches = mainSource.branches.length;
        if (numBranches > 0) {
          let branchIdx = mainBranchId
            ? mainSource.branches.findIndex((b) => b.id === mainBranchId)
            : mainSource.branches.findIndex((b) => b.id === mainSource.actualizedBranchId);
          if (branchIdx < 0) branchIdx = 0;
          const branchPos = getBranchLayout(
            mainSource.position.x,
            mainSource.position.y,
            branchIdx,
            numBranches
          );
          newY = branchPos.y;
        } else {
          newY = mainSource.position.y;
        }
      } else if (mainTarget) {
        newX = mainTarget.position.x;
        newY = mainTarget.position.y;
      }

      // 入力がなければ未来の揺らぎの内容をそのまま反映する
      const finalTitle = customTitle.trim() ? customTitle.trim() : futureNode.title;
      const filteredExistingTags = futureNode.tags.filter((t) => t !== '未来の揺らぎ');
      const finalTags =
        tags.length > 0
          ? tags
          : filteredExistingTags.length > 0
          ? filteredExistingTags
          : ['事実', '世界線接続'];

      const descendantIds = new Set<string>();
      let deltaX = 0;

      if (mainTarget) {
        const desiredTargetX = newX + 440;
        deltaX = Math.max(440, desiredTargetX - mainTarget.position.x);

        const queue = [mainTarget.id];
        descendantIds.add(mainTarget.id);
        while (queue.length > 0) {
          const currId = queue.shift()!;
          for (const n of prev.nodes) {
            if (
              n.parentId === currId &&
              !descendantIds.has(n.id) &&
              n.id !== futureNodeId
            ) {
              descendantIds.add(n.id);
              queue.push(n.id);
            }
          }
        }
      }

      const updatedNodes = prev.nodes.map((n) => {
        if (n.id === futureNodeId) {
          return {
            ...n,
            title: finalTitle,
            category,
            isFutureFluctuation: false,
            isFact: true,
            nodeType: 'fact' as const,
            state: 'observed' as const,
            branches: [],
            position: { x: newX, y: newY },
            parentId: mainSource ? mainSource.id : null,
            originBranchId: mainSource ? mainBranchId : undefined,
            isInsertedRetroactive: Boolean(mainSource && mainTarget),
            tags: finalTags,
          };
        }
        if (mainTarget && n.id === mainTarget.id) {
          return {
            ...n,
            parentId: futureNodeId,
            originBranchId: undefined,
            isFutureFluctuation: false,
            position: { ...n.position, x: n.position.x + deltaX },
          };
        }
        if (descendantIds.has(n.id)) {
          return {
            ...n,
            position: { ...n.position, x: n.position.x + deltaX },
          };
        }
        return n;
      });

      return {
        ...prev,
        nodes: updatedNodes,
      };
    });

    setSelectedNodeId(futureNodeId);
    setSelectedBranchId(null);
    setSuperpositionModalConfig({
      isOpen: false,
      sourceNodeId: null,
      targetNodeId: null,
      originBranchId: null,
      connectingFutureNodeId: null,
    });
  };

  // メインマップの「可能性（選択肢）」または「事実」から直接「未来の揺らぎ」を事実として接続する
  const handleConnectFutureNodeHere = (
    futureNodeId: string,
    parentNode: OnigiriNode,
    branch?: QuantumBranch
  ) => {
    const futureNode = worldLine.nodes.find((n) => n.id === futureNodeId);
    if (!futureNode) return;

    const resolvedBranchId = branch
      ? branch.id
      : parentNode.actualizedBranchId || parentNode.branches[0]?.id || null;

    const nextNode =
      worldLine.nodes.find(
        (n) =>
          !n.isFutureFluctuation &&
          n.parentId === parentNode.id &&
          (!resolvedBranchId || n.originBranchId === resolvedBranchId || !n.originBranchId)
      ) || null;

    handleConnectFutureNodeAsFact(futureNodeId, '', futureNode.category, [], {
      sourceNodeId: parentNode.id,
      targetNodeId: nextNode ? nextNode.id : null,
      originBranchId: resolvedBranchId,
    });
  };

  // 新規重ね合わせ（New Quantum）または事実（Fact）の作成
  const handleCreateSuperposition = (
    title: string,
    category: OnigiriNode['category'],
    branchInputs: { label: string; description: string; probability: number }[],
    tags: string[],
    connections: ConnectionConfig
  ) => {
    setWorldLine((prev) => {
      const { sourceNodeId, targetNodeId, originBranchId } = connections;
      const newNodeId = `node-${Date.now()}`;
      const isFact = branchInputs.length === 0;

      const branches: QuantumBranch[] = isFact
        ? []
        : branchInputs.map((b, i) => ({
            id: `b-${newNodeId}-${i + 1}`,
            label: b.label,
            description: b.description,
            status: 'superposed',
            probabilityAmplitude: b.probability,
          }));

      // Case 1: 接続元・接続先が共に空白 -> 「未来の揺らぎ」 (Future Fluctuation)
      // 接続先・元がないものは「事実」ではなく「未来の揺らぎ」とする
      if (!sourceNodeId && !targetNodeId) {
        const existingFuture = prev.nodes.filter((n) => n.isFutureFluctuation);
        const count = existingFuture.length;
        const newX = 280 + count * 440;
        const newY = 80;

        const newFutureNode: OnigiriNode = {
          id: newNodeId,
          title,
          category,
          state: 'superposition',
          flavor: 'classic-salt',
          nodeType: 'quantum',
          isFact: false, // 接続先・元がないものは「事実」ではなく「未来の揺らぎ」
          position: { x: newX, y: newY },
          parentId: null,
          isFutureFluctuation: true,
          branches,
          createdAt: new Date().toISOString(),
          tags: tags.length > 0 ? tags : ['未来の揺らぎ'],
        };

        return {
          ...prev,
          nodes: [...prev.nodes, newFutureNode],
        };
      }

      // 接続元または接続先が指定されている場合（メインマップへの配置・挿入）
      const sourceNode = sourceNodeId ? prev.nodes.find((n) => n.id === sourceNodeId) || null : null;
      const targetNode = targetNodeId ? prev.nodes.find((n) => n.id === targetNodeId) || null : null;

      // 1. メインマップ側の既存の接続元 (mainSource) と分岐枝 (mainBranchId) を特定
      let mainSource: OnigiriNode | null = null;
      let mainBranchId: string | undefined = originBranchId || undefined;

      if (sourceNode && !sourceNode.isFutureFluctuation) {
        mainSource = sourceNode;
        mainBranchId =
          originBranchId ||
          sourceNode.actualizedBranchId ||
          sourceNode.branches[0]?.id ||
          undefined;
      } else if (targetNode && !targetNode.isFutureFluctuation && targetNode.parentId) {
        // 接続元に「未来の揺らぎ」が指定され、接続先にメインマップのノードが指定された場合、
        // その接続先ノードが元々繋がっていた親ノード（および選択肢）との間に挿入する
        mainSource =
          prev.nodes.find((n) => !n.isFutureFluctuation && n.id === targetNode.parentId) || null;
        mainBranchId =
          targetNode.originBranchId ||
          superpositionModalConfig.originBranchId ||
          mainSource?.actualizedBranchId ||
          mainSource?.branches[0]?.id ||
          undefined;
      } else if (superpositionModalConfig.sourceNodeId) {
        const cfgSource = prev.nodes.find(
          (n) =>
            !n.isFutureFluctuation &&
            n.id === superpositionModalConfig.sourceNodeId &&
            n.id !== targetNode?.id
        );
        if (cfgSource) {
          mainSource = cfgSource;
          mainBranchId =
            originBranchId ||
            superpositionModalConfig.originBranchId ||
            cfgSource.actualizedBranchId ||
            cfgSource.branches[0]?.id ||
            undefined;
        }
      }

      // 2. メインマップ側の既存の接続先 (mainTarget) を特定
      let mainTarget: OnigiriNode | null = null;
      if (targetNode && !targetNode.isFutureFluctuation) {
        mainTarget = targetNode;
      } else if (mainSource && (targetNode?.isFutureFluctuation || sourceNode?.isFutureFluctuation)) {
        // 接続先に「未来の揺らぎ」が指定された場合、mainSource の該当選択肢に既に繋がっている子ノードがあればその間に挿入する
        mainTarget =
          prev.nodes.find(
            (n) =>
              !n.isFutureFluctuation &&
              n.parentId === mainSource!.id &&
              (!mainBranchId || n.originBranchId === mainBranchId || !n.originBranchId)
          ) ||
          (superpositionModalConfig.targetNodeId
            ? prev.nodes.find(
                (n) =>
                  !n.isFutureFluctuation &&
                  n.id === superpositionModalConfig.targetNodeId &&
                  n.id !== mainSource!.id
              ) || null
            : null);
      }

      // 3. 新規作成ノードの基本定義
      const newNodeBase: OnigiriNode = {
        id: newNodeId,
        title,
        category,
        state: isFact ? 'observed' : 'superposition',
        flavor: 'classic-salt',
        nodeType: isFact ? 'fact' : 'quantum',
        isFact,
        position: { x: 280, y: 340 },
        parentId: null,
        isFutureFluctuation: false,
        branches,
        createdAt: new Date().toISOString(),
        tags:
          tags.length > 0
            ? tags
            : isFact
            ? ['事実', '世界線記録']
            : ['新規量子'],
      };

      // 4. 今回メインマップに直列配置・挿入するノード列 (chain) を構築
      // [接続元に指定された未来の揺らぎ] -> [新規作成ノード] -> [接続先に指定された未来の揺らぎ]
      const rawChain: OnigiriNode[] = [];
      if (sourceNode && sourceNode.isFutureFluctuation) {
        rawChain.push(sourceNode);
      }
      rawChain.push(newNodeBase);
      if (
        targetNode &&
        targetNode.isFutureFluctuation &&
        targetNode.id !== sourceNode?.id
      ) {
        rawChain.push(targetNode);
      }

      // 5. 配置開始座標 (startX, startY) の算出
      let startX = 280;
      let startY = 340;

      if (mainSource) {
        startX = mainSource.position.x + 440;
        const numBranches = mainSource.branches.length;
        if (numBranches > 0) {
          let branchIdx = mainBranchId
            ? mainSource.branches.findIndex((b) => b.id === mainBranchId)
            : mainSource.branches.findIndex((b) => b.id === mainSource!.actualizedBranchId);
          if (branchIdx < 0) branchIdx = 0;
          const branchPos = getBranchLayout(
            mainSource.position.x,
            mainSource.position.y,
            branchIdx,
            numBranches
          );
          startY = branchPos.y;
        } else {
          startY = mainSource.position.y;
        }
      } else if (mainTarget) {
        startX = mainTarget.position.x;
        startY = mainTarget.position.y;
      }

      // 6. chain 内の各ノードの座標・親子関係・事実/量子属性を確定
      const positionedChain: OnigiriNode[] = [];
      for (let i = 0; i < rawChain.length; i++) {
        const item = rawChain[i];
        const prevInChain = i === 0 ? mainSource : positionedChain[i - 1];
        const itemBranchId =
          i === 0
            ? mainSource
              ? mainBranchId
              : undefined
            : prevInChain
            ? prevInChain.actualizedBranchId || prevInChain.branches[0]?.id || undefined
            : undefined;

        const itemIsFact = item.branches.length === 0;
        const filteredTags = item.tags.filter((t) => t !== '未来の揺らぎ');

        positionedChain.push({
          ...item,
          isFutureFluctuation: false,
          isFact: itemIsFact,
          nodeType: itemIsFact ? 'fact' : 'quantum',
          state: itemIsFact ? 'observed' : item.state,
          position: {
            x: startX + i * 440,
            y: startY,
          },
          parentId: prevInChain ? prevInChain.id : null,
          originBranchId: itemBranchId,
          isInsertedRetroactive: Boolean(mainSource && mainTarget),
          tags:
            filteredTags.length > 0
              ? filteredTags
              : itemIsFact
              ? ['事実', '世界線接続']
              : ['世界線接続'],
        });
      }

      const chainMap = new Map<string, OnigiriNode>(
        positionedChain.map((c) => [c.id, c])
      );
      const lastChainNode = positionedChain[positionedChain.length - 1];

      // 7. mainTarget とその子孫ノードのシフト量を計算
      const descendantIds = new Set<string>();
      let deltaX = 0;

      if (mainTarget) {
        const desiredTargetX = startX + positionedChain.length * 440;
        deltaX = Math.max(440, desiredTargetX - mainTarget.position.x);

        const queue = [mainTarget.id];
        descendantIds.add(mainTarget.id);
        while (queue.length > 0) {
          const currId = queue.shift()!;
          for (const n of prev.nodes) {
            if (
              n.parentId === currId &&
              !descendantIds.has(n.id) &&
              !chainMap.has(n.id)
            ) {
              descendantIds.add(n.id);
              queue.push(n.id);
            }
          }
        }
      }

      // 8. 既存ノードの更新と新規ノードの追加
      const updatedNodes = prev.nodes.map((n) => {
        if (chainMap.has(n.id)) {
          return chainMap.get(n.id)!;
        }
        if (mainTarget && n.id === mainTarget.id) {
          return {
            ...n,
            parentId: lastChainNode.id,
            originBranchId:
              lastChainNode.actualizedBranchId ||
              lastChainNode.branches[0]?.id ||
              undefined,
            isFutureFluctuation: false,
            position: { ...n.position, x: n.position.x + deltaX },
          };
        }
        if (descendantIds.has(n.id)) {
          return {
            ...n,
            position: { ...n.position, x: n.position.x + deltaX },
          };
        }
        return n;
      });

      const finalNewNode = chainMap.get(newNodeId)!;

      return {
        ...prev,
        nodes: [...updatedNodes, finalNewNode],
      };
    });

    setSuperpositionModalConfig({
      isOpen: false,
      sourceNodeId: null,
      targetNodeId: null,
      originBranchId: null,
      connectingFutureNodeId: null,
    });
  };

  const handleAddBranchToNode = (nodeId: string, label: string, description: string) => {
    setWorldLine((prev) => {
      const updatedNodes = prev.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const newBranchId = `b-${n.id}-${Date.now()}`;
        const isObserved = n.state === 'observed';
        const newBranch: QuantumBranch = {
          id: newBranchId,
          label,
          description: description || undefined,
          status: isObserved ? 'counterfactual' : 'superposed',
          probabilityAmplitude: 0.5,
          ...(isObserved
            ? {
                counterfactualInsight: {
                  hypotheticalRegretScore: 3,
                  revisitedNotes: '',
                  abandonedAt: new Date().toISOString(),
                },
              }
            : {}),
        };
        return {
          ...n,
          branches: [...n.branches, newBranch],
        };
      });

      return { ...prev, nodes: updatedNodes };
    });
  };

  const handleSaveCounterfactualInsight = (
    nodeId: string,
    branchId: string,
    regretScore: number,
    notes: string
  ) => {
    setWorldLine((prev) => {
      const updatedNodes = prev.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const updatedBranches = n.branches.map((b) => {
          if (b.id !== branchId) return b;
          return {
            ...b,
            counterfactualInsight: {
              ...(b.counterfactualInsight || { abandonedAt: new Date().toISOString() }),
              hypotheticalRegretScore: regretScore,
              revisitedNotes: notes,
            },
          };
        });
        return { ...n, branches: updatedBranches };
      });

      return { ...prev, nodes: updatedNodes };
    });
  };

  const handleAddEntanglement = (
    targetUser: string,
    eventType: any,
    label: string
  ) => {
    const newEntanglement: QuantumEntanglement = {
      id: `entangle-${Date.now()}`,
      sourceNodeId: selectedNodeId || worldLine.nodes[0]?.id || 'node-origin',
      targetUserId: targetUser,
      targetNodeId: `ext-${Date.now()}`,
      eventType,
      convergenceLabel: label,
      entangledAt: new Date().toISOString(),
    };

    setWorldLine((prev) => ({
      ...prev,
      entanglements: [newEntanglement, ...prev.entanglements],
    }));
  };

  const selectedNode = worldLine.nodes.find((n) => n.id === selectedNodeId) || null;
  const selectedBranch = selectedNode?.branches.find((b) => b.id === selectedBranchId) || null;
  const currentQuantumLog = worldLine.logs.find((l) => l.nodeId === selectedNodeId) || null;
  const futureNodes = worldLine.nodes.filter((n) => n.isFutureFluctuation);

  // 画面表示判定：タイトル画面または量子空間
  if (currentView === 'title' || !currentLifeId) {
    return (
      <>
        <TitleScreen
          lives={lives}
          onOpenNewLife={() => setIsNewLifeModalOpen(true)}
          onResumeLife={handleResumeLife}
          onDeleteLife={handleDeleteLife}
          onClearAllData={handleClearAllData}
        />

        <NewLifeModal
          isOpen={isNewLifeModalOpen}
          onClose={() => setIsNewLifeModalOpen(false)}
          onCreate={handleCreateNewLife}
        />
      </>
    );
  }

  // 量子世界線キャンバス表示（space）
  const isQuantumNodeSelected = Boolean(selectedNode && !selectedNode.isFact && !selectedBranch);

  return (
    <div className="w-screen h-screen flex flex-col bg-[#020307] text-slate-100 font-sans overflow-hidden">
      {/* 1. Oni-Q ヘッダー（量子ノード選択時はNew Quantum非表示、ブランチ選択時または未選択時に表示） */}
      <Header
        lifeTitle={currentLifeTitle}
        totalQuanta={worldLine.totalQuanta}
        onReturnToTitle={handleReturnToTitle}
        showNewQuantum={!isQuantumNodeSelected}
        onOpenNewSuperposition={() => {
          if (selectedBranch) {
            // ブランチが選択されている場合、そのブランチの直後に新しい量子を配置
            const nextNode =
              worldLine.nodes.find(
                (n) =>
                  selectedNode &&
                  n.parentId === selectedNode.id &&
                  (n.originBranchId === selectedBranch.id || !n.originBranchId)
              ) || null;

            setSuperpositionModalConfig({
              isOpen: true,
              sourceNodeId: selectedNode?.id || null,
              targetNodeId: nextNode ? nextNode.id : null,
              originBranchId: selectedBranch.id,
              connectingFutureNodeId: null,
            });
          } else if (selectedNode?.isFact) {
            // 事実ノードから続く場合
            const nextNode =
              worldLine.nodes.find((n) => n.parentId === selectedNode.id) || null;
            setSuperpositionModalConfig({
              isOpen: true,
              sourceNodeId: selectedNode.id,
              targetNodeId: nextNode ? nextNode.id : null,
              originBranchId: null,
              connectingFutureNodeId: null,
            });
          } else {
            // ホームまたは未選択時のNew Quantum：デフォルトで接続元・接続先を空白にして未来の揺らぎへ
            setSuperpositionModalConfig({
              isOpen: true,
              sourceNodeId: null,
              targetNodeId: null,
              originBranchId: null,
              connectingFutureNodeId: null,
            });
          }
        }}
        onOpenEntanglementDemo={() => setIsEntanglementOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* 2. メイン量子空間キャンバス */}
      <main className="flex-1 relative w-full h-full overflow-hidden">
        {/* 統一された「未来の揺らぎ」エリア（ネオングリーンの点線・固定表示・プルダウンリスト） */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[92vw] max-w-sm sm:max-w-md z-20 pointer-events-auto">
          <div className="bg-slate-950/92 border-2 border-dashed border-emerald-500/80 backdrop-blur-xl rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.25)] p-3 flex flex-col gap-2 transition-all">
            {/* 上段：タイトル「未来の揺らぎ」と件数「～件」（「揺らぎを追加」ボタンは削除） */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-400 flex items-center justify-center text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                </div>
                <span className="text-xs font-bold text-emerald-100 tracking-wide">
                  未来の揺らぎ
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-mono border border-emerald-500/60 font-bold shadow-[0_0_6px_rgba(16,185,129,0.2)]">
                  {futureNodes.length}件
                </span>
              </div>
            </div>

            {/* 下段：プルダウンリスト（クリックで作成済みの未来の揺らぎをスクロール表示） */}
            <div className="relative w-full">
              <button
                type="button"
                onClick={() => setIsFutureDropdownOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/90 border border-emerald-500/50 hover:border-emerald-400 text-xs text-emerald-200 transition shadow-inner group"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-semibold text-emerald-300">未来の揺らぎ</span>
                  <span className="text-[11px] text-slate-400 truncate">
                    {futureNodes.length > 0 ? `（${futureNodes.length}件をスクロール確認）` : '（未作成）'}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-emerald-400 transition-transform duration-200 ${
                    isFutureDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* ドロップダウンメニュー（スクロール可能） */}
              {isFutureDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-950/98 border border-emerald-500/70 rounded-xl shadow-2xl p-2 z-30 max-h-64 overflow-y-auto space-y-1.5 scrollbar-thin animate-in fade-in zoom-in-95 duration-150">
                  {futureNodes.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 space-y-1">
                      <p className="font-medium text-emerald-300">未来の揺らぎはありません</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        ヘッダーの「New Quantum」から接続元・接続先を空白のまま作成するとここに追加されます
                      </p>
                    </div>
                  ) : (
                    futureNodes.map((fn) => (
                      <div
                        key={fn.id}
                        onClick={() => {
                          setSelectedNodeId(fn.id);
                          setSelectedBranchId(null);
                          setIsFutureDropdownOpen(false);
                        }}
                        className="p-2.5 rounded-lg bg-slate-900/90 border border-emerald-900/60 hover:border-emerald-500/80 hover:bg-emerald-950/30 cursor-pointer transition flex items-center justify-between gap-2 group/item"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] shrink-0" />
                          <div className="truncate">
                            <div className="text-xs font-bold text-slate-200 group-hover/item:text-emerald-200 truncate">
                              {fn.title}
                            </div>
                            <div className="text-[10px] text-emerald-400/80 font-mono">
                              {fn.branches.length === 0 ? '揺らぎなし' : `${fn.branches.length}個の揺らぎ`} • {fn.category}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsFutureDropdownOpen(false);
                              // 要件: 未来の揺らぎエリアで「世界線へ接続」を押した場合は、
                              // 接続フローの中心に選択した未来の揺らぎを事実として配置し、自由に接続元と先を選択できるようにする
                              setSuperpositionModalConfig({
                                isOpen: true,
                                sourceNodeId: null,
                                targetNodeId: null,
                                originBranchId: null,
                                connectingFutureNodeId: fn.id,
                              });
                            }}
                            className="text-[10px] px-2.5 py-1 rounded-md bg-emerald-900/80 hover:bg-emerald-700 text-emerald-100 border border-emerald-500/60 font-semibold transition"
                            title="この未来の揺らぎを事実として世界線に接続"
                          >
                            世界線へ接続
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNode(fn.id);
                            }}
                            className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                            title="削除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <CosmicCanvas
          nodes={worldLine.nodes}
          selectedNodeId={selectedNodeId}
          selectedBranchId={selectedBranchId}
          onSelectNode={(node) => {
            setSelectedNodeId(node.id);
            setSelectedBranchId(null);
          }}
          onSelectBranch={(node, branch) => {
            setSelectedNodeId(node.id);
            setSelectedBranchId((prev) => (prev === branch.id ? null : branch.id));
          }}
          showCounterfactual={showCounterfactual}
          onOpenObservationModal={(node) => setObservationNode(node)}
        />

        {/* 3. ノード/IF枝 詳細ドロワー */}
        <NodeDetailDrawer
          node={selectedNode}
          selectedBranch={selectedBranch}
          quantumLog={currentQuantumLog}
          futureNodes={futureNodes}
          onClose={() => {
            setSelectedNodeId(null);
            setSelectedBranchId(null);
          }}
          onOpenObservation={(node) => setObservationNode(node)}
          onSaveCounterfactualInsight={handleSaveCounterfactualInsight}
          onAddBranchToNode={handleAddBranchToNode}
          onOpenInsertRetroactive={handleOpenInsertRetroactive}
          onRevertToSuperposition={handleRevertToSuperposition}
          onDeleteNode={handleDeleteNode}
          onSelectBranch={(node, branch) => {
            setSelectedNodeId(node.id);
            setSelectedBranchId(branch.id);
          }}
          onConnectFutureNodeHere={handleConnectFutureNodeHere}
          onOpenConnectFutureModal={(futureNode, parentNode, branch) => {
            const resolvedBranchId = branch
              ? branch.id
              : parentNode?.actualizedBranchId || parentNode?.branches[0]?.id || null;
            const nextNode = parentNode
              ? worldLine.nodes.find(
                  (n) =>
                    !n.isFutureFluctuation &&
                    n.parentId === parentNode.id &&
                    (!resolvedBranchId ||
                      n.originBranchId === resolvedBranchId ||
                      !n.originBranchId)
                ) || null
              : null;

            setSuperpositionModalConfig({
              isOpen: true,
              sourceNodeId: parentNode ? parentNode.id : null,
              targetNodeId: nextNode ? nextNode.id : null,
              originBranchId: resolvedBranchId,
              connectingFutureNodeId: futureNode.id,
            });
          }}
        />
      </main>

      {/* 4. モーダル群 */}
      {observationNode && (
        <ObservationModal
          node={observationNode}
          onClose={() => setObservationNode(null)}
          onConfirmObservation={handleConfirmObservation}
        />
      )}

      {superpositionModalConfig.isOpen && (
        <NewSuperpositionModal
          existingNodes={worldLine.nodes}
          initialSourceNodeId={superpositionModalConfig.sourceNodeId}
          initialTargetNodeId={superpositionModalConfig.targetNodeId}
          initialOriginBranchId={superpositionModalConfig.originBranchId}
          connectingFutureNode={
            superpositionModalConfig.connectingFutureNodeId
              ? worldLine.nodes.find(
                  (n) => n.id === superpositionModalConfig.connectingFutureNodeId
                ) || null
              : null
          }
          onClose={() => {
            setSuperpositionModalConfig({
              isOpen: false,
              sourceNodeId: null,
              targetNodeId: null,
              originBranchId: null,
              connectingFutureNodeId: null,
            });
          }}
          onCreateSuperposition={handleCreateSuperposition}
          onConnectFutureNodeAsFact={handleConnectFutureNodeAsFact}
        />
      )}

      {isEntanglementOpen && (
        <EntanglementModal
          entanglements={worldLine.entanglements}
          onClose={() => setIsEntanglementOpen(false)}
          onAddEntanglement={handleAddEntanglement}
        />
      )}

      {isGuideOpen && <GuideModal onClose={() => setIsGuideOpen(false)} />}
    </div>
  );
}
