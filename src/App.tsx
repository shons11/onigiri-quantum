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
import { Sparkles, Plus } from 'lucide-react';
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

  // モーダル表示状態
  const [isNewLifeModalOpen, setIsNewLifeModalOpen] = useState(false);
  const [observationNode, setObservationNode] = useState<OnigiriNode | null>(null);
  const [superpositionModalConfig, setSuperpositionModalConfig] = useState<{
    isOpen: boolean;
    sourceNodeId: string | null;
    targetNodeId: string | null;
    originBranchId?: string | null;
  }>({
    isOpen: false,
    sourceNodeId: null,
    targetNodeId: null,
    originBranchId: null,
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

  // 過去の人生を再開（Resume）
  const handleResumeLife = (lifeId: string) => {
    const life = getLifeById(lifeId);
    if (life) {
      setCurrentLifeId(life.id);
      setCurrentLifeTitle(life.title);
      setWorldLine(life.worldLine);
      setSelectedNodeId(life.worldLine.nodes[0]?.id || null);
      setSelectedBranchId(null);
      setActiveLifeId(life.id);
      setCurrentView('space');
    }
  };

  // 人生（Life）の個別削除
  const handleDeleteLife = (lifeId: string, title: string) => {
    if (!window.confirm(`世界線「${title}」を削除してもよろしいですか？この操作は取り消せません。`)) {
      return;
    }

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

  // 決定（Decided）からのレトロアクティブ量子揺らぎ挿入またはNew Quantum
  const handleOpenInsertRetroactive = (parentNode: OnigiriNode, branch: QuantumBranch) => {
    const nextNode =
      worldLine.nodes.find(
        (n) => n.parentId === parentNode.id && (n.originBranchId === branch.id || !n.originBranchId)
      ) || null;

    setSuperpositionModalConfig({
      isOpen: true,
      sourceNodeId: parentNode.id,
      targetNodeId: nextNode ? nextNode.id : null,
      originBranchId: branch.id,
    });
  };

  // 新規重ね合わせ（New Quantum）の作成
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
      const branches: QuantumBranch[] = branchInputs.map((b, i) => ({
        id: `b-${newNodeId}-${i + 1}`,
        label: b.label,
        description: b.description,
        status: 'superposed',
        probabilityAmplitude: b.probability,
      }));

      // Case 1: 接続元・接続先が共に空白 -> 「未来の揺らぎ」 (Future Fluctuation)
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
          flavor: 'cosmic-nori',
          position: { x: newX, y: newY },
          parentId: null,
          isFutureFluctuation: true,
          branches,
          createdAt: new Date().toISOString(),
          tags: tags.length > 0 ? tags : ['未来の揺らぎ', '未接続量子'],
        };

        return {
          ...prev,
          nodes: [...prev.nodes, newFutureNode],
        };
      }

      // Case 2: 接続元があり、接続先もある -> 2つの量子の間に挿入 (Insertion)
      if (sourceNodeId && targetNodeId) {
        const sourceNode = prev.nodes.find((n) => n.id === sourceNodeId);
        const targetNode = prev.nodes.find((n) => n.id === targetNodeId);

        if (sourceNode && targetNode) {
          const branchIdx = originBranchId
            ? sourceNode.branches.findIndex((b) => b.id === originBranchId)
            : 0;
          const branchPos = getBranchLayout(
            sourceNode.position.x,
            sourceNode.position.y,
            branchIdx >= 0 ? branchIdx : 0,
            sourceNode.branches.length
          );

          const newX = sourceNode.position.x + 440;
          const newY = branchPos.y;

          const newNode: OnigiriNode = {
            id: newNodeId,
            title,
            category,
            state: 'superposition',
            flavor: 'classic-salt',
            position: { x: newX, y: newY },
            parentId: sourceNode.id,
            originBranchId: originBranchId || undefined,
            isInsertedRetroactive: true,
            isFutureFluctuation: false,
            branches,
            createdAt: new Date().toISOString(),
            tags: tags.length > 0 ? tags : ['挿入量子', '世界線分岐'],
          };

          // targetNode およびその子孫ノードを X 方向へシフト (+440)
          const descendantIds = new Set<string>();
          const queue = [targetNode.id];
          descendantIds.add(targetNode.id);
          while (queue.length > 0) {
            const currId = queue.shift()!;
            for (const n of prev.nodes) {
              if (n.parentId === currId && !descendantIds.has(n.id)) {
                descendantIds.add(n.id);
                queue.push(n.id);
              }
            }
          }

          const updatedNodes = prev.nodes.map((n) => {
            if (n.id === targetNode.id) {
              return {
                ...n,
                parentId: newNodeId,
                originBranchId: undefined,
                isFutureFluctuation: false,
                position: { ...n.position, x: n.position.x + 440 },
              };
            }
            if (descendantIds.has(n.id)) {
              return {
                ...n,
                position: { ...n.position, x: n.position.x + 440 },
              };
            }
            return n;
          });

          return {
            ...prev,
            nodes: [...updatedNodes, newNode],
          };
        }
      }

      // Case 3: 接続元があり、接続先が空白 -> 先端への追加 (Tip Addition)
      if (sourceNodeId && !targetNodeId) {
        const sourceNode = prev.nodes.find((n) => n.id === sourceNodeId);
        let newX = 280;
        let newY = 340;

        if (sourceNode) {
          newX = sourceNode.position.x + 440;
          const numParentBranches = sourceNode.branches.length;
          let branchIndex = originBranchId
            ? sourceNode.branches.findIndex((b) => b.id === originBranchId)
            : sourceNode.branches.findIndex((b) => b.id === sourceNode.actualizedBranchId);
          if (branchIndex === -1) branchIndex = 0;
          const stepY = 80;
          const offsetY = (branchIndex - (numParentBranches - 1) / 2) * stepY;
          newY = sourceNode.position.y + offsetY;
        }

        const newNode: OnigiriNode = {
          id: newNodeId,
          title,
          category,
          state: 'superposition',
          flavor: 'classic-salt',
          position: { x: newX, y: newY },
          parentId: sourceNode ? sourceNode.id : null,
          originBranchId: originBranchId || undefined,
          isFutureFluctuation: false,
          branches,
          createdAt: new Date().toISOString(),
          tags: tags.length > 0 ? tags : ['新規決断'],
        };

        return {
          ...prev,
          nodes: [...prev.nodes, newNode],
        };
      }

      // Case 4: 接続元が空白で、接続先がある場合
      if (!sourceNodeId && targetNodeId) {
        const targetNode = prev.nodes.find((n) => n.id === targetNodeId);
        const newX = targetNode ? targetNode.position.x : 280;
        const newY = targetNode ? targetNode.position.y : 340;

        const newNode: OnigiriNode = {
          id: newNodeId,
          title,
          category,
          state: 'superposition',
          flavor: 'classic-salt',
          position: { x: newX, y: newY },
          parentId: null,
          isFutureFluctuation: false,
          branches,
          createdAt: new Date().toISOString(),
          tags: tags.length > 0 ? tags : ['新規根量子'],
        };

        const descendantIds = new Set<string>();
        if (targetNode) {
          const queue = [targetNode.id];
          descendantIds.add(targetNode.id);
          while (queue.length > 0) {
            const currId = queue.shift()!;
            for (const n of prev.nodes) {
              if (n.parentId === currId && !descendantIds.has(n.id)) {
                descendantIds.add(n.id);
                queue.push(n.id);
              }
            }
          }
        }

        const updatedNodes = prev.nodes.map((n) => {
          if (targetNode && n.id === targetNode.id) {
            return {
              ...n,
              parentId: newNodeId,
              isFutureFluctuation: false,
              position: { ...n.position, x: n.position.x + 440 },
            };
          }
          if (descendantIds.has(n.id)) {
            return {
              ...n,
              position: { ...n.position, x: n.position.x + 440 },
            };
          }
          return n;
        });

        return {
          ...prev,
          nodes: [...updatedNodes, newNode],
        };
      }

      return prev;
    });

    setSuperpositionModalConfig({
      isOpen: false,
      sourceNodeId: null,
      targetNodeId: null,
      originBranchId: null,
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
  return (
    <div className="w-screen h-screen flex flex-col bg-[#020307] text-slate-100 font-sans overflow-hidden">
      {/* 1. Oni-Q ヘッダー */}
      <Header
        lifeTitle={currentLifeTitle}
        totalQuanta={worldLine.totalQuanta}
        onReturnToTitle={handleReturnToTitle}
        onOpenNewSuperposition={() => {
          if (selectedNode) {
            // ノードが選択されている場合、そのノードを接続元にし、接続先は次のノード（あれば）または空白
            const actualizedBranch = selectedNode.branches.find((b) => b.status === 'actualized');
            const branchToUse =
              selectedBranch && selectedBranch.status === 'actualized'
                ? selectedBranch
                : actualizedBranch;
            const nextNode =
              worldLine.nodes.find(
                (n) =>
                  n.parentId === selectedNode.id &&
                  (!branchToUse || n.originBranchId === branchToUse.id || !n.originBranchId)
              ) || null;

            setSuperpositionModalConfig({
              isOpen: true,
              sourceNodeId: selectedNode.id,
              targetNodeId: nextNode ? nextNode.id : null,
              originBranchId: branchToUse?.id || null,
            });
          } else {
            // 要件3: すでに作成されている量子をクリックせずにホームのNew Quantumを選択した際、
            // デフォルトで接続元、接続先を空白にして表示
            setSuperpositionModalConfig({
              isOpen: true,
              sourceNodeId: null,
              targetNodeId: null,
              originBranchId: null,
            });
          }
        }}
        onOpenEntanglementDemo={() => setIsEntanglementOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* 2. メイン量子空間キャンバス */}
      <main className="flex-1 relative w-full h-full overflow-hidden">
        {/* 要件3: 「未来の揺らぎ」エリア (Future Fluctuations Area) */}
        {futureNodes.length > 0 ? (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 max-w-[94vw] sm:max-w-2xl z-20 pointer-events-auto">
            <div className="bg-slate-950/90 border border-purple-500/50 backdrop-blur-xl rounded-2xl shadow-[0_0_25px_rgba(168,85,247,0.3)] p-2.5 sm:p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_8px_rgba(168,85,247,0.5)]">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-bold text-purple-200">
                    未来の揺らぎエリア (Future Fluctuations)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/90 text-purple-300 font-mono border border-purple-700/60 font-semibold">
                    {futureNodes.length}件
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedNodeId(null);
                    setSelectedBranchId(null);
                    setSuperpositionModalConfig({
                      isOpen: true,
                      sourceNodeId: null,
                      targetNodeId: null,
                      originBranchId: null,
                    });
                  }}
                  className="text-[11px] text-purple-300 hover:text-white flex items-center gap-1 font-semibold hover:underline"
                >
                  <Plus className="w-3.5 h-3.5 text-purple-400" />
                  <span>揺らぎを追加</span>
                </button>
              </div>

              {/* 水平スクロールのカードリスト */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
                {futureNodes.map((fn) => (
                  <div
                    key={fn.id}
                    onClick={() => {
                      setSelectedNodeId(fn.id);
                      setSelectedBranchId(null);
                    }}
                    className={`shrink-0 px-3 py-2 rounded-xl border cursor-pointer transition flex items-center gap-2.5 ${
                      selectedNodeId === fn.id
                        ? 'bg-purple-950/80 border-purple-400 text-white shadow-[0_0_15px_rgba(192,132,252,0.4)]'
                        : 'bg-slate-900/80 border-slate-700/80 hover:border-purple-500/60 text-slate-200 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse shadow-[0_0_6px_#c084fc]" />
                    <div className="max-w-[120px] sm:max-w-[150px] truncate">
                      <div className="text-xs font-bold truncate">{fn.title}</div>
                      <div className="text-[9.5px] text-purple-300/80 font-mono">
                        {fn.branches.length}選択肢 • {fn.state === 'observed' ? '確定' : '重ね合わせ'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        // この未来の揺らぎノードを接続先として、既存の世界線ノードに接続
                        setSuperpositionModalConfig({
                          isOpen: true,
                          sourceNodeId: worldLine.nodes.find((n) => !n.isFutureFluctuation)?.id || null,
                          targetNodeId: fn.id,
                          originBranchId: null,
                        });
                      }}
                      className="text-[9.5px] px-2 py-1 rounded-lg bg-purple-900/70 hover:bg-purple-800 text-purple-200 border border-purple-600/60 shrink-0 ml-1 font-medium transition"
                      title="世界線へ接続"
                    >
                      接続
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
            <button
              onClick={() => {
                setSelectedNodeId(null);
                setSelectedBranchId(null);
                setSuperpositionModalConfig({
                  isOpen: true,
                  sourceNodeId: null,
                  targetNodeId: null,
                  originBranchId: null,
                });
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/70 hover:bg-slate-900/90 border border-slate-800/90 text-[11px] text-slate-400 hover:text-purple-300 transition shadow-lg backdrop-blur"
              title="接続元・先を空白にして新しい未来の揺らぎを作成"
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>未来の揺らぎ: 0件（空白New Quantumで追加）</span>
            </button>
          </div>
        )}

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
          onClose={() => {
            setSelectedNodeId(null);
            setSelectedBranchId(null);
          }}
          onOpenObservation={(node) => setObservationNode(node)}
          onSaveCounterfactualInsight={handleSaveCounterfactualInsight}
          onAddBranchToNode={handleAddBranchToNode}
          onOpenInsertRetroactive={handleOpenInsertRetroactive}
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
          onClose={() => {
            setSuperpositionModalConfig({
              isOpen: false,
              sourceNodeId: null,
              targetNodeId: null,
              originBranchId: null,
            });
          }}
          onCreateSuperposition={handleCreateSuperposition}
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
