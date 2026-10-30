/**
 * @file src/App.tsx
 * @description Onigiri Quantum (Oni-Q) メインアプリケーション
 * - Firebase Authentication / Google サインイン連携
 * - Cloud Firestore による「人生（Life）」と世界線の永続化
 * - ダミーデータを排除し、START MY LIFE からユーザー自身の最初の決断テーマで世界線を創成
 * - 過去の人生一覧からの世界線再開（Resume）
 * - アカウント連携解除・全データ物理削除（退会）
 */

import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import {
  QuantumWorldLine,
  OnigiriNode,
  QuantumBranch,
  QuantumLog,
  QuantumEntanglement,
  LifeRecord,
} from './types/quantum';
import {
  subscribeAuthState,
  signInWithGoogle,
  signOutUser,
  deleteAccountAndData,
  incrementUserQuantums,
  UserProfile,
} from './services/authService';
import {
  getUserLives,
  createNewLife,
  loadLifeWorldLine,
  saveLifeWorldLine,
  deleteUserLife,
} from './services/lifeService';
import { Header } from './components/Header';
import { CosmicCanvas, getBranchLayout } from './components/CosmicCanvas';
import { ObservationModal } from './components/ObservationModal';
import { NewSuperpositionModal, TargetInsertion } from './components/NewSuperpositionModal';
import { NodeDetailDrawer } from './components/NodeDetailDrawer';
import { EntanglementModal } from './components/EntanglementModal';
import { GuideModal } from './components/GuideModal';
import { TitleScreen } from './components/TitleScreen';
import { NewLifeModal } from './components/NewLifeModal';
import { DeleteAccountModal } from './components/DeleteAccountModal';

export default function App() {
  // 認証ステータス
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // 人生（Life）管理ステータス
  const [userLives, setUserLives] = useState<LifeRecord[]>([]);
  const [isLoadingLives, setIsLoadingLives] = useState(false);
  const [activeLifeId, setActiveLifeId] = useState<string | null>(null);
  const [activeLifeTitle, setActiveLifeTitle] = useState<string>('');

  // 現在表示中の世界線
  const [worldLine, setWorldLine] = useState<QuantumWorldLine>({
    userId: '',
    userName: '',
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
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [observationNode, setObservationNode] = useState<OnigiriNode | null>(null);
  const [isNewSuperpositionOpen, setIsNewSuperpositionOpen] = useState(false);
  const [targetInsertion, setTargetInsertion] = useState<TargetInsertion | null>(null);
  const [isEntanglementOpen, setIsEntanglementOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // 1. Firebase Auth 認証リスナー
  useEffect(() => {
    const unsubscribe = subscribeAuthState((user, profile) => {
      setCurrentUser(user);
      setUserProfile(profile);
      setIsAuthLoading(false);

      if (user) {
        loadUserLivesList(user.uid);
      } else {
        setUserLives([]);
        setActiveLifeId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // ユーザーの人生一覧を取得
  const loadUserLivesList = async (uid: string) => {
    setIsLoadingLives(true);
    try {
      const lives = await getUserLives(uid);
      setUserLives(lives);
    } catch (e) {
      console.error('Error fetching user lives:', e);
    } finally {
      setIsLoadingLives(false);
    }
  };

  // 2. 世界線データの自動同期保存（Firestore）
  const isFirstLoadRef = useRef(true);
  useEffect(() => {
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      return;
    }

    if (currentUser && activeLifeId && worldLine.nodes.length > 0) {
      const timer = setTimeout(() => {
        saveLifeWorldLine(currentUser.uid, activeLifeId, worldLine).catch((err) => {
          console.error('Auto save worldline error:', err);
        });
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [worldLine, currentUser, activeLifeId]);

  // 新規人生の創成（START MY LIFE）
  const handleCreateNewLife = async (
    title: string,
    initialTheme: string,
    branches: { label: string; description: string }[]
  ) => {
    if (!currentUser) {
      await signInWithGoogle();
      return;
    }

    const { life, worldLine: createdWorldLine } = await createNewLife(
      currentUser.uid,
      currentUser.displayName || '量子観測者',
      title,
      initialTheme,
      branches
    );

    setUserLives((prev) => [life, ...prev]);
    setActiveLifeId(life.id);
    setActiveLifeTitle(life.title);
    setWorldLine(createdWorldLine);
    setSelectedNodeId(createdWorldLine.nodes[0]?.id || null);
    setSelectedBranchId(null);
  };

  // 過去の人生を再開（Resume）
  const handleResumeLife = async (lifeId: string) => {
    if (!currentUser) return;

    try {
      const res = await loadLifeWorldLine(currentUser.uid, lifeId);
      if (res) {
        setActiveLifeId(res.life.id);
        setActiveLifeTitle(res.life.title);
        setWorldLine(res.worldLine);
        setSelectedNodeId(res.worldLine.nodes[0]?.id || null);
        setSelectedBranchId(null);
      }
    } catch (err) {
      console.error('Failed to resume life:', err);
    }
  };

  // 人生（Life）の個別削除
  const handleDeleteLife = async (lifeId: string, title: string) => {
    if (!currentUser) return;
    if (!window.confirm(`世界線「${title}」を削除してもよろしいですか？この操作は取り消せません。`)) {
      return;
    }

    try {
      await deleteUserLife(currentUser.uid, lifeId);
      setUserLives((prev) => prev.filter((l) => l.id !== lifeId));
      if (activeLifeId === lifeId) {
        setActiveLifeId(null);
      }
    } catch (err) {
      console.error('Failed to delete life:', err);
    }
  };

  // アカウント連携解除・全データ削除（退会）
  const handleConfirmDeleteAccount = async () => {
    try {
      await deleteAccountAndData();
      setCurrentUser(null);
      setUserProfile(null);
      setUserLives([]);
      setActiveLifeId(null);
      setWorldLine({
        userId: '',
        userName: '',
        totalQuanta: 0,
        nodes: [],
        logs: [],
        entanglements: [],
      });
    } catch (err) {
      console.error('Error during account deletion:', err);
      throw err;
    }
  };

  // タイトル画面へ戻る
  const handleReturnToTitle = () => {
    setActiveLifeId(null);
    setSelectedNodeId(null);
    setSelectedBranchId(null);
    if (currentUser) {
      loadUserLivesList(currentUser.uid);
    }
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

      // ユーザーの総観測数をFirestoreにも更新
      if (currentUser) {
        incrementUserQuantums(currentUser.uid, 1);
        setUserProfile((p) => (p ? { ...p, totalQuantums: (p.totalQuantums || 0) + 1 } : null));
      }

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
      let newY = 350;
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

  // ローディング画面
  if (isAuthLoading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#020307] text-cyan-400">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs font-mono tracking-widest uppercase">Initializing Quantum Universe...</span>
      </div>
    );
  }

  // 人生が未選択の場合：タイトル画面（START MY LIFE / 人生一覧）を表示
  if (!activeLifeId) {
    return (
      <>
        <TitleScreen
          user={currentUser}
          profile={userProfile}
          lives={userLives}
          isLoadingLives={isLoadingLives}
          onSignInGoogle={async () => {
            await signInWithGoogle();
          }}
          onSignOut={signOutUser}
          onOpenNewLife={() => {
            if (!currentUser) {
              signInWithGoogle().then(() => setIsNewLifeModalOpen(true));
            } else {
              setIsNewLifeModalOpen(true);
            }
          }}
          onResumeLife={handleResumeLife}
          onDeleteLife={handleDeleteLife}
          onOpenDeleteAccount={() => setIsDeleteAccountModalOpen(true)}
        />

        <NewLifeModal
          isOpen={isNewLifeModalOpen}
          onClose={() => setIsNewLifeModalOpen(false)}
          onCreate={handleCreateNewLife}
        />

        <DeleteAccountModal
          isOpen={isDeleteAccountModalOpen}
          onClose={() => setIsDeleteAccountModalOpen(false)}
          onConfirmDelete={handleConfirmDeleteAccount}
        />
      </>
    );
  }

  // 人生が選択されている場合：量子世界線キャンバスを表示
  return (
    <div className="w-screen h-screen flex flex-col bg-[#020307] text-slate-100 font-sans overflow-hidden">
      {/* 1. Oni-Q ヘッダー */}
      <Header
        lifeTitle={activeLifeTitle}
        totalQuanta={worldLine.totalQuanta}
        user={currentUser}
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
        onOpenDeleteAccount={() => setIsDeleteAccountModalOpen(true)}
        onSignOut={async () => {
          await signOutUser();
          handleReturnToTitle();
        }}
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

      <DeleteAccountModal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
        onConfirmDelete={handleConfirmDeleteAccount}
      />
    </div>
  );
}
