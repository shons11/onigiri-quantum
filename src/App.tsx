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
import { NewSuperpositionModal, TargetInsertion } from './components/NewSuperpositionModal';
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
  const [isNewSuperpositionOpen, setIsNewSuperpositionOpen] = useState(false);
  const [targetInsertion, setTargetInsertion] = useState<TargetInsertion | null>(null);
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

  // 過去の決定（Decided）からのレトロアクティブ量子揺らぎ挿入
  const handleOpenInsertRetroactive = (parentNode: OnigiriNode, branch: QuantumBranch) => {
    const nextNode =
      worldLine.nodes.find(
        (n) => n.parentId === parentNode.id && (n.originBranchId === branch.id || !n.originBranchId)
      ) || null;

    setTargetInsertion({ parentNode, branch, nextNode });
    setIsNewSuperpositionOpen(true);
  };

  // 新規重ね合わせ（New Quantum）の作成
  const handleCreateSuperposition = (
    title: string,
    category: OnigiriNode['category'],
    branchInputs: { label: string; description: string; probability: number }[],
    tags: string[],
    targetInsert?: TargetInsertion | null
  ) => {
    setWorldLine((prev) => {
      const insertion = targetInsert !== undefined ? targetInsert : targetInsertion;

      if (insertion) {
        const { parentNode, branch, nextNode } = insertion;
        const currentParent = prev.nodes.find((n) => n.id === parentNode.id) || parentNode;
        const currentNext = nextNode ? prev.nodes.find((n) => n.id === nextNode.id) || nextNode : null;

        const branchIndex = currentParent.branches.findIndex((b) => b.id === branch.id);
        const branchPos = getBranchLayout(
          currentParent.position.x,
          currentParent.position.y,
          branchIndex >= 0 ? branchIndex : 0,
          currentParent.branches.length
        );

        const newX = currentParent.position.x + 440;
        const newY = branchPos.y;

        const newNodeId = `node-${Date.now()}`;
        const branches: QuantumBranch[] = branchInputs.map((b, i) => ({
          id: `b-${newNodeId}-${i + 1}`,
          label: b.label,
          description: b.description,
          status: 'superposed',
          probabilityAmplitude: b.probability,
        }));

        const newNode: OnigiriNode = {
          id: newNodeId,
          title,
          category,
          state: 'superposition',
          flavor: 'classic-salt',
          position: { x: newX, y: newY },
          parentId: currentParent.id,
          originBranchId: branch.id,
          isInsertedRetroactive: true,
          branches,
          createdAt: new Date().toISOString(),
          tags: tags.length > 0 ? tags : ['過去量子揺らぎ', '追記決断'],
        };

        let updatedNodes = [...prev.nodes];

        if (currentNext) {
          const descendantIds = new Set<string>();
          const queue = [currentNext.id];
          descendantIds.add(currentNext.id);
          while (queue.length > 0) {
            const currId = queue.shift()!;
            for (const n of prev.nodes) {
              if (n.parentId === currId && !descendantIds.has(n.id)) {
                descendantIds.add(n.id);
                queue.push(n.id);
              }
            }
          }

          updatedNodes = updatedNodes.map((n) => {
            if (n.id === currentNext.id) {
              return {
                ...n,
                parentId: newNodeId,
                originBranchId: undefined,
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
        }

        return {
          ...prev,
          nodes: [...updatedNodes, newNode],
        };
      }

      // 末尾への新規量子ノード追加
      const parentNode = selectedNode || prev.nodes[prev.nodes.length - 1] || null;
      let newX = 280;
      let newY = 340;
      if (parentNode) {
        newX = parentNode.position.x + 440;
        const numParentBranches = parentNode.branches.length;
        if (numParentBranches <= 1) {
          newY = parentNode.position.y;
        } else {
          let branchIndex = parentNode.branches.findIndex(
            (b) => b.id === parentNode.actualizedBranchId
          );
          if (branchIndex === -1 && selectedBranchId) {
            branchIndex = parentNode.branches.findIndex((b) => b.id === selectedBranchId);
          }
          if (branchIndex === -1) branchIndex = 0;
          const stepY = 80;
          const offsetY = (branchIndex - (numParentBranches - 1) / 2) * stepY;
          newY = parentNode.position.y + offsetY;
        }
      }

      const newNodeId = `node-${Date.now()}`;
      const branches: QuantumBranch[] = branchInputs.map((b, i) => ({
        id: `b-${newNodeId}-${i + 1}`,
        label: b.label,
        description: b.description,
        status: 'superposed',
        probabilityAmplitude: b.probability,
      }));

      const newNode: OnigiriNode = {
        id: newNodeId,
        title,
        category,
        state: 'superposition',
        flavor: 'classic-salt',
        position: { x: newX, y: newY },
        parentId: parentNode ? parentNode.id : null,
        branches,
        createdAt: new Date().toISOString(),
        tags: tags.length > 0 ? tags : ['新規決断'],
      };

      return {
        ...prev,
        nodes: [...prev.nodes, newNode],
      };
    });

    setIsNewSuperpositionOpen(false);
    setTargetInsertion(null);
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
          if (selectedBranch && selectedBranch.status === 'actualized' && selectedNode) {
            handleOpenInsertRetroactive(selectedNode, selectedBranch);
          } else if (selectedNode && selectedNode.state === 'observed') {
            const decidedBranch = selectedNode.branches.find((b) => b.status === 'actualized');
            if (decidedBranch) {
              handleOpenInsertRetroactive(selectedNode, decidedBranch);
              return;
            }
            setTargetInsertion(null);
            setIsNewSuperpositionOpen(true);
          } else {
            setTargetInsertion(null);
            setIsNewSuperpositionOpen(true);
          }
        }}
        onOpenEntanglementDemo={() => setIsEntanglementOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* 2. メイン量子空間キャンバス */}
      <main className="flex-1 relative w-full h-full overflow-hidden">
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

      {isNewSuperpositionOpen && (
        <NewSuperpositionModal
          parentNode={targetInsertion?.parentNode || selectedNode}
          targetInsertion={targetInsertion}
          onClose={() => {
            setIsNewSuperpositionOpen(false);
            setTargetInsertion(null);
          }}
          onClearTargetInsertion={() => setTargetInsertion(null)}
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
