/**
 * @file src/components/NodeDetailDrawer.tsx
 * @description ノード＆IF枝線の詳細ドロワー
 * - 1quantumログの閲覧、後からの選択肢追加、IF世界線への振り返りメモ
 * - 作成済みの量子の編集機能（「揺らぎ状態に戻す」ボタン）：実線から点線に戻し、再確定可能にする
 * - 量子・事実の削除機能：削除すると前後の接続元と接続先が直接再接続される
 * - 「事実 (Fact)」ノードの専用表示
 * - メインマップ上の「可能性（選択肢）」または「事実」をクリックした際、「ここに未来の揺らぎを事実として接続する」から未来の揺らぎ一覧を表示して接続可能
 */

import React, { useState } from 'react';
import { OnigiriNode, QuantumBranch, QuantumLog } from '../types/quantum';
import {
  X,
  Sparkles,
  CheckCircle,
  GitFork,
  BookmarkCheck,
  Calendar,
  Activity,
  Plus,
  RotateCcw,
  Trash2,
  FileCheck,
  ChevronDown,
  Link2,
} from 'lucide-react';

interface NodeDetailDrawerProps {
  node: OnigiriNode | null;
  selectedBranch: QuantumBranch | null;
  quantumLog: QuantumLog | null;
  futureNodes?: OnigiriNode[];
  onClose: () => void;
  onOpenObservation: (node: OnigiriNode) => void;
  onSaveCounterfactualInsight: (
    nodeId: string,
    branchId: string,
    regretScore: number,
    notes: string
  ) => void;
  onAddBranchToNode: (nodeId: string, label: string, description: string) => void;
  onOpenInsertRetroactive?: (node: OnigiriNode, branch?: QuantumBranch) => void;
  onRevertToSuperposition?: (nodeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  onSelectBranch?: (node: OnigiriNode, branch: QuantumBranch) => void;
  onConnectFutureNodeHere?: (
    futureNodeId: string,
    parentNode: OnigiriNode,
    branch?: QuantumBranch
  ) => void;
  onOpenConnectFutureModal?: (
    futureNode: OnigiriNode,
    parentNode?: OnigiriNode,
    branch?: QuantumBranch
  ) => void;
}

export const NodeDetailDrawer: React.FC<NodeDetailDrawerProps> = ({
  node,
  selectedBranch,
  quantumLog,
  futureNodes = [],
  onClose,
  onOpenObservation,
  onSaveCounterfactualInsight,
  onAddBranchToNode,
  onOpenInsertRetroactive,
  onRevertToSuperposition,
  onDeleteNode,
  onSelectBranch,
  onConnectFutureNodeHere,
  onOpenConnectFutureModal,
}) => {
  if (!node) return null;

  const isSuperposition = node.state === 'superposition';
  const isCounterfactualBranch = !!selectedBranch && selectedBranch.status === 'counterfactual';
  const isDecidedBranch = !!selectedBranch && selectedBranch.status === 'actualized';
  const isSuperposedBranch = !!selectedBranch && selectedBranch.status === 'superposed';

  // IFの振り返り編集用ステート
  const [regretScore, setRegretScore] = useState<number>(
    selectedBranch?.counterfactualInsight?.hypotheticalRegretScore ?? 3
  );
  const [reflectionNotes, setReflectionNotes] = useState<string>(
    selectedBranch?.counterfactualInsight?.revisitedNotes ?? ''
  );
  const [isSavedToast, setIsSavedToast] = useState(false);

  // 後から選択肢を追加するフォーム用ステート
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [newBranchLabel, setNewBranchLabel] = useState('');
  const [newBranchDesc, setNewBranchDesc] = useState('');

  // 「ここに未来の揺らぎを事実として接続する」リストの開閉ステート
  const [isFutureConnectListOpen, setIsFutureConnectListOpen] = useState(false);

  const handleSaveInsight = () => {
    if (!selectedBranch) return;
    onSaveCounterfactualInsight(node.id, selectedBranch.id, regretScore, reflectionNotes);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2000);
  };

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchLabel.trim()) return;
    onAddBranchToNode(node.id, newBranchLabel.trim(), newBranchDesc.trim());
    setNewBranchLabel('');
    setNewBranchDesc('');
    setIsAddingBranch(false);
  };

  // スマホ向けスワイプクローズ処理
  const touchStartPos = React.useRef<{ x: number; y: number } | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);

  const handleHeaderTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartPos.current = { x: t.clientX, y: t.clientY };
  };

  const handleHeaderTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartPos.current.x;
    if (dx > 0) {
      setSwipeOffset(dx);
    }
  };

  const handleHeaderTouchEnd = () => {
    if (swipeOffset > 80) {
      onClose();
    }
    touchStartPos.current = null;
    setSwipeOffset(0);
  };

  // メインマップに存在する「可能性（選択肢）」または「事実」をクリックした際に表示する
  // 「ここに未来の揺らぎを事実として接続する」リストセクション
  const renderConnectFutureSection = (branchForConnection?: QuantumBranch) => {
    if (node.isFutureFluctuation) return null;

    return (
      <div className="pt-2 space-y-2">
        <button
          type="button"
          onClick={() => setIsFutureConnectListOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/70 border border-dashed border-emerald-500/80 text-emerald-200 font-bold text-xs shadow-[0_0_12px_rgba(16,185,129,0.2)] transition"
        >
          <div className="flex items-center gap-2">
            <Link2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>ここに未来の揺らぎを事実として接続する</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/60 font-mono">
              {futureNodes.length}件
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-emerald-400 transition-transform duration-200 shrink-0 ${
              isFutureConnectListOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isFutureConnectListOpen && (
          <div className="bg-slate-950/90 border border-dashed border-emerald-500/70 rounded-xl p-2.5 space-y-2 max-h-56 overflow-y-auto">
            {futureNodes.length === 0 ? (
              <p className="text-[11px] text-slate-400 text-center py-3">
                現在「未来の揺らぎ」エリアに項目はありません。
              </p>
            ) : (
              futureNodes.map((fn) => (
                <div
                  key={fn.id}
                  className="p-2.5 rounded-lg bg-slate-900/90 border border-emerald-900/60 hover:border-emerald-500/70 transition flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-emerald-200 truncate">
                      {fn.title}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono capitalize">
                      {fn.category}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onConnectFutureNodeHere?.(fn.id, node, branchForConnection);
                        setIsFutureConnectListOpen(false);
                      }}
                      className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px] transition shadow"
                      title="そのまま事実としてここに挿入・接続"
                    >
                      ここに接続
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onOpenConnectFutureModal?.(fn, node, branchForConnection);
                        setIsFutureConnectListOpen(false);
                      }}
                      className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 text-[10px] transition"
                      title="接続フローを開いて接続先や事実の内容を調整"
                    >
                      接続フロー
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        transform: swipeOffset > 0 ? `translateX(${swipeOffset}px)` : undefined,
        transition: swipeOffset > 0 ? 'none' : 'transform 0.25s ease',
      }}
      className="absolute top-16 right-0 bottom-0 w-full sm:w-[420px] bg-slate-950/95 border-l border-slate-800 backdrop-blur-xl shadow-2xl z-30 flex flex-col overflow-hidden text-slate-200 animate-in slide-in-from-right duration-300"
    >
      {/* スマホ用スワイプハンドル */}
      <div
        onTouchStart={handleHeaderTouchStart}
        onTouchMove={handleHeaderTouchMove}
        onTouchEnd={handleHeaderTouchEnd}
        className="sm:hidden flex items-center justify-center py-2 bg-slate-900/90 border-b border-slate-800/60 cursor-grab active:cursor-grabbing touch-none select-none"
      >
        <div className="w-12 h-1 rounded-full bg-slate-600/80 mb-0.5" />
      </div>

      {/* ドロワーヘッダー */}
      <div
        onTouchStart={handleHeaderTouchStart}
        onTouchMove={handleHeaderTouchMove}
        onTouchEnd={handleHeaderTouchEnd}
        className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60"
      >
        <div className="flex items-center gap-2">
          {node.isFact ? (
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>事実（FACT）</span>
            </div>
          ) : node.isFutureFluctuation ? (
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-dashed border-emerald-500">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>未来の揺らぎ</span>
            </div>
          ) : isCounterfactualBranch ? (
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-rose-400 bg-rose-950/70 px-2 py-0.5 rounded border border-rose-800">
              <GitFork className="w-3.5 h-3.5" />
              <span>IFの世界線（Counterfactual）</span>
            </div>
          ) : isDecidedBranch ? (
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>DECIDED（確定世界線）</span>
            </div>
          ) : isSuperposedBranch ? (
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-purple-300 bg-purple-950/70 px-2 py-0.5 rounded border border-purple-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>可能性（選択肢）</span>
            </div>
          ) : isSuperposition ? (
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-purple-400 bg-purple-950/70 px-2 py-0.5 rounded border border-purple-800">
              <Sparkles className="w-3.5 h-3.5" />
              <span>重ね合わせ（Superposition）</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>確定量子ノード</span>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ドロワー本体 */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm">
        {/* ノードの基本情報 */}
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
            <span>NODE ID: {node.id}</span>
            <span>•</span>
            <span className="capitalize">{node.category}</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">{node.title}</h2>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {node.tags.map((tag, i) => (
              <span
                key={i}
                className="text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* A. 事実 (Fact) ノードの場合の専用表示 */}
        {/* ------------------------------------------------------------- */}
        {node.isFact ? (
          <div className="space-y-3">
            <div className="bg-emerald-950/25 border border-emerald-500/40 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs text-emerald-300 font-bold">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>確固たる事実として記録されています</span>
              </div>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                未確定な揺らぎ（可能性）を持たず、世界線の中で確定した出来事です。
              </p>
            </div>

            <button
              onClick={() => onOpenInsertRetroactive?.(node)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>New Quantum（この事実に続く量子・事実を追加）</span>
            </button>

            {renderConnectFutureSection()}
          </div>
        ) : isCounterfactualBranch && selectedBranch ? (
          /* --- B. IF世界線の振り返りモード --- */
          <div className="space-y-4 bg-rose-950/15 border border-rose-900/30 p-4 rounded-2xl">
            <div>
              <span className="text-[11px] font-mono text-rose-400 uppercase tracking-wider block mb-1">
                選ばれなかった道（可能性）
              </span>
              <h3 className="text-base font-bold text-rose-100">{selectedBranch.label}</h3>
              {selectedBranch.description && (
                <p className="text-xs text-rose-300/80 mt-1">{selectedBranch.description}</p>
              )}
            </div>

            <div className="space-y-3 pt-2 border-t border-rose-900/30">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">
                    現在の視点からの「もし選んでいたら」未練・後悔度
                  </span>
                  <span className="text-rose-400 font-mono font-bold">
                    {regretScore} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={regretScore}
                  onChange={(e) => setRegretScore(parseInt(e.target.value, 10))}
                  className="w-full accent-rose-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>後悔ゼロ（今の道で正解）</span>
                  <span>強い心残り</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  後日の振り返りノート:
                </label>
                <textarea
                  rows={4}
                  value={reflectionNotes}
                  onChange={(e) => setReflectionNotes(e.target.value)}
                  placeholder="あの時選ばなかったこの道について、今の自分から振り返るとどう思えるか？学んだことは？"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-400"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={handleSaveInsight}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-lg shadow-rose-950"
                >
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>振り返りを保存</span>
                </button>
                {isSavedToast && (
                  <span className="text-xs text-emerald-400 animate-fade-in font-mono">
                    ✓ 記録しました
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-rose-900/30">
              {renderConnectFutureSection(selectedBranch)}
            </div>
          </div>
        ) : isDecidedBranch && selectedBranch ? (
          /* --- C. 採択された（DECIDED）選択肢の詳細 ＆ 量子/未来の揺らぎ接続 --- */
          <div className="space-y-4 bg-cyan-950/20 border border-cyan-800/50 p-4 rounded-2xl">
            <div>
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">
                採択された決断（可能性）
              </span>
              <h3 className="text-base font-bold text-cyan-100">{selectedBranch.label}</h3>
              {selectedBranch.description && (
                <p className="text-xs text-cyan-200/80 mt-1">{selectedBranch.description}</p>
              )}
            </div>

            <div className="pt-3 border-t border-cyan-900/50 space-y-2.5">
              <button
                onClick={() => onOpenInsertRetroactive?.(node, selectedBranch)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(168,85,247,0.4)] transition"
              >
                <Sparkles className="w-4 h-4 text-purple-200" />
                <span>New Quantum</span>
              </button>
              <p className="text-[11px] text-purple-300/80 text-center leading-relaxed">
                この決断の直後に、新しい量子を接続・配置します。
              </p>

              {renderConnectFutureSection(selectedBranch)}
            </div>
          </div>
        ) : isSuperposedBranch && selectedBranch ? (
          /* --- C2. 重ね合わせ状態の可能性（選択肢）をクリックした場合 --- */
          <div className="space-y-4 bg-purple-950/25 border border-purple-800/50 p-4 rounded-2xl">
            <div>
              <span className="text-[11px] font-mono text-purple-300 uppercase tracking-wider block mb-1">
                選択中の可能性（揺らぎ）
              </span>
              <h3 className="text-base font-bold text-purple-100">{selectedBranch.label}</h3>
              {selectedBranch.description && (
                <p className="text-xs text-purple-200/80 mt-1">{selectedBranch.description}</p>
              )}
            </div>

            <div className="pt-3 border-t border-purple-900/50 space-y-2.5">
              <button
                onClick={() => onOpenInsertRetroactive?.(node, selectedBranch)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(168,85,247,0.4)] transition"
              >
                <Sparkles className="w-4 h-4 text-purple-200" />
                <span>New Quantum</span>
              </button>

              {renderConnectFutureSection(selectedBranch)}
            </div>
          </div>
        ) : isSuperposition ? (
          /* --- D. 重ね合わせ（未確定）状態 --- */
          <div className="space-y-4">
            <div className="bg-purple-950/30 border border-purple-800/40 p-3 rounded-2xl">
              <div className="flex items-center gap-2 text-xs text-purple-300 font-bold">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>
                  {node.isFutureFluctuation
                    ? '未接続の「未来の揺らぎ」です'
                    : '可能性がゆらめいている状態です'}
                </span>
              </div>
            </div>

            {node.isFutureFluctuation && (
              <button
                type="button"
                onClick={() => onOpenConnectFutureModal?.(node)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition"
              >
                <FileCheck className="w-4 h-4 text-slate-950" />
                <span>世界線へ接続（事実としてメインマップに配置）</span>
              </button>
            )}

            {node.branches.length > 0 ? (
              <>
                <div>
                  <span className="text-xs font-semibold text-slate-300 block mb-2">
                    重なり合っている選択肢（クリックして選択）:
                  </span>
                  <div className="space-y-2">
                    {node.branches.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => onSelectBranch?.(node, b)}
                        className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/60 cursor-pointer transition text-xs"
                      >
                        <div className="font-semibold text-purple-200">{b.label}</div>
                        {b.description && (
                          <p className="text-slate-400 mt-1 text-[11px]">{b.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 未確定状態での「今すぐ観測・決断を確定する」ボタン */}
                {!node.isFutureFluctuation && (
                  <button
                    onClick={() => onOpenObservation(node)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(56,189,248,0.4)] transition"
                  >
                    <CheckCircle className="w-4 h-4 stroke-[2.5]" />
                    <span>今すぐ観測・決断を確定する</span>
                  </button>
                )}
              </>
            ) : (
              <div className="text-xs text-emerald-300/80 bg-emerald-950/20 border border-dashed border-emerald-500/40 rounded-xl p-3">
                接続元・接続先が未設定の「未来の揺らぎ」です。世界線に接続すると「事実」としてメインマップに挿入・配置されます。
              </div>
            )}
          </div>
        ) : (
          /* --- E. 確定済みノード（Observed） --- */
          <div className="space-y-5">
            {quantumLog && (
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      {quantumLog.quantumId}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(quantumLog.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400 text-[11px]">観測時の確信度</span>
                  <span className="font-mono font-bold text-cyan-300">
                    {Math.round(quantumLog.certainty * 100)}%
                  </span>
                </div>
              </div>
            )}

            {/* 採択された世界線 */}
            <div>
              <span className="text-xs font-semibold text-slate-300 block mb-1.5">
                採択された主世界線:
              </span>
              {node.branches
                .filter((b) => b.status === 'actualized')
                .map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/60 text-xs"
                  >
                    <div className="font-bold text-cyan-200 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{b.label}</span>
                    </div>
                    {b.description && (
                      <p className="text-slate-300 mt-1 text-[11px] pl-5">{b.description}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => onSelectBranch?.(node, b)}
                      className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-700/60 text-[11px] font-semibold text-cyan-200 transition"
                      title="この選択肢（可能性）を選択して量子または未来の揺らぎを接続"
                    >
                      <span>この可能性を選択する（量子・未来の揺らぎの接続へ）</span>
                    </button>
                  </div>
                ))}
            </div>

            {/* 棄却されたIFの枝 */}
            {node.branches.some((b) => b.status === 'counterfactual') && (
              <div>
                <span className="text-xs font-semibold text-slate-300 block mb-1.5">
                  選ばれなかった道（IFの世界線）:
                </span>
                <div className="space-y-2">
                  {node.branches
                    .filter((b) => b.status === 'counterfactual')
                    .map((b) => (
                      <div
                        key={b.id}
                        onClick={() => onSelectBranch?.(node, b)}
                        className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-rose-500/50 cursor-pointer transition text-xs"
                      >
                        <div className="font-medium text-slate-300">{b.label}</div>
                        {b.counterfactualInsight?.revisitedNotes && (
                          <p className="text-[11px] text-rose-300/80 mt-1 italic">
                            メモ: {b.counterfactualInsight.revisitedNotes}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* 要件: 作成済みの量子の編集機能（「揺らぎ状態に戻す」ボタン） */}
            {/* ------------------------------------------------------------- */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => onRevertToSuperposition?.(node.id)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-600/70 text-purple-200 font-bold text-xs shadow-md transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-purple-300" />
                <span>揺らぎ状態に戻す</span>
              </button>
              <p className="text-[10.5px] text-purple-300/70 text-center leading-relaxed">
                ※ 確定を取り消し、実線を点線の未確定（重ね合わせ）状態に戻します。
              </p>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* 後からでも「他の選択肢を追加」できる共通セクション（事実以外） */}
        {/* ---------------------------------------------------------------- */}
        {!node.isFact && !node.isFutureFluctuation && !selectedBranch && (
          <div className="pt-3 border-t border-slate-800/80">
            {!isAddingBranch ? (
              <button
                onClick={() => setIsAddingBranch(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-slate-700 hover:border-cyan-400/70 hover:bg-slate-900 text-xs text-slate-300 hover:text-cyan-300 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>他の選択肢を追加</span>
              </button>
            ) : (
              <form
                onSubmit={handleCreateBranch}
                className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700 space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                  <span>他の選択肢を追加</span>
                  <button
                    type="button"
                    onClick={() => setIsAddingBranch(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="追加する選択肢（道）の名称"
                  value={newBranchLabel}
                  onChange={(e) => setNewBranchLabel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <input
                  type="text"
                  placeholder="補足や背景（任意）"
                  value={newBranchDesc}
                  onChange={(e) => setNewBranchDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingBranch(false)}
                    className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition"
                  >
                    追加する
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* 要件: 過去に作成した量子・事実の削除機能 */}
        {/* 削除すると接続元と接続先が直接再接続される */}
        {/* ---------------------------------------------------------------- */}
        <div className="pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => {
              onDeleteNode?.(node.id);
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-700/60 text-xs font-bold text-rose-200 hover:text-white transition shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>
              {node.isFact
                ? 'この事実を削除'
                : node.isFutureFluctuation
                ? 'この未来の揺らぎを削除'
                : 'この量子を削除'}
            </span>
          </button>
        </div>
      </div>

      {/* フッター */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 flex justify-between items-center text-xs">
        <span className="text-slate-500 font-mono text-[11px]">
          {node.isFact
            ? 'Fact Entity'
            : node.isFutureFluctuation
            ? 'Future Fluctuation'
            : 'Polarized Quantum Node'}
        </span>
        <button
          onClick={onClose}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};
