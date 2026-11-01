/**
 * @file src/components/NewSuperpositionModal.tsx
 * @description 「量子の追加 / 事実の追加 (New Quantum / Fact)」および「未来の揺らぎの世界線接続」モーダル
 * - 通常モード（New Quantum）:
 *   - 接続元・接続先が共に空白かつ揺らぎなし → 「未来の揺らぎ」
 *   - 接続元・接続先のいずれかを選択かつ揺らぎなし → 「事実 (Fact)」
 *   - 揺らぎを追加（1〜4個） → 「新しい量子 (New Quantum)」
 *   - 接続元・接続先の選択リストにはメインマップのノードのみ表示（「未来の揺らぎ」は表示しない）
 * - 未来の揺らぎ接続モード（connectingFutureNode 指定時）:
 *   - 接続フローの中央に選択した「未来の揺らぎ」を「事実 (Fact)」として配置
 *   - 自由に接続元・接続先を選択してメインマップに挿入可能
 *   - 事実の内容入力はオプション（未入力時は未来の揺らぎの内容がそのまま反映される）
 *   - 事実の配置のため、可能性（揺らぎ）の追加フィールドは非表示
 */

import React, { useState } from 'react';
import { OnigiriNode } from '../types/quantum';
import {
  Sparkles,
  Plus,
  Trash2,
  X,
  ArrowRight,
  Check,
  CircleDashed,
  Compass,
  FileCheck,
} from 'lucide-react';

export interface ConnectionConfig {
  sourceNodeId: string | null;
  targetNodeId: string | null;
  originBranchId?: string | null;
}

interface NewSuperpositionModalProps {
  existingNodes: OnigiriNode[];
  initialSourceNodeId?: string | null;
  initialTargetNodeId?: string | null;
  initialOriginBranchId?: string | null;
  connectingFutureNode?: OnigiriNode | null;
  onClose: () => void;
  onCreateSuperposition: (
    title: string,
    category: OnigiriNode['category'],
    branches: { label: string; description: string; probability: number }[],
    tags: string[],
    connections: ConnectionConfig
  ) => void;
  onConnectFutureNodeAsFact?: (
    futureNodeId: string,
    customTitle: string,
    category: OnigiriNode['category'],
    tags: string[],
    connections: ConnectionConfig
  ) => void;
}

export const NewSuperpositionModal: React.FC<NewSuperpositionModalProps> = ({
  existingNodes,
  initialSourceNodeId = null,
  initialTargetNodeId = null,
  initialOriginBranchId = null,
  connectingFutureNode = null,
  onClose,
  onCreateSuperposition,
  onConnectFutureNodeAsFact,
}) => {
  const isConnectingFutureMode = Boolean(connectingFutureNode);

  // メインマップに存在する量子・事実のみを接続元・接続先候補とする（未来の揺らぎはリストに表示しない）
  const mainMapNodes = existingNodes.filter((n) => !n.isFutureFluctuation);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<OnigiriNode['category']>(
    connectingFutureNode ? connectingFutureNode.category : 'career'
  );

  // デフォルトでは可能性を表示せず、空の状態でスタート
  const [branches, setBranches] = useState<
    { label: string; description: string; probability: number }[]
  >([]);
  const [tagInput, setTagInput] = useState(
    connectingFutureNode
      ? connectingFutureNode.tags.filter((t) => t !== '未来の揺らぎ').join(', ')
      : ''
  );

  // 接続元・接続先の選択状態
  const [sourceNodeId, setSourceNodeId] = useState<string | null>(initialSourceNodeId);
  const [targetNodeId, setTargetNodeId] = useState<string | null>(initialTargetNodeId);
  const [originBranchId, setOriginBranchId] = useState<string | null>(initialOriginBranchId);

  // ピッカーモーダル表示状態 ('source' | 'target' | null)
  const [pickerTarget, setPickerTarget] = useState<'source' | 'target' | null>(null);

  const sourceNode = mainMapNodes.find((n) => n.id === sourceNodeId) || null;
  const targetNode = mainMapNodes.find((n) => n.id === targetNodeId) || null;

  const hasConnection = Boolean(sourceNodeId || targetNodeId);
  const hasBranches = !isConnectingFutureMode && branches.length > 0;

  // モード判定:
  // - 未来の揺らぎ接続モード時は常に「事実 (Fact)」配置
  // - 通常モード時:
  //   - 接続元・先がついてない場合（かつ揺らぎなし）→「未来の揺らぎ」表示
  //   - 接続先・元どちらかでも選択されたら（かつ揺らぎなし）→「事実」表示
  //   - 揺らぎの追加をすると →「新しい量子」表示
  const isNewQuantum = !isConnectingFutureMode && hasBranches;
  const isFact = isConnectingFutureMode || (!hasBranches && hasConnection);
  const isFutureItem = !isConnectingFutureMode && !hasBranches && !hasConnection;

  const effectiveCenterTitle = isConnectingFutureMode
    ? title.trim() || connectingFutureNode?.title || ''
    : title.trim();

  const handleBranchChange = (index: number, field: string, value: any) => {
    const updated = [...branches];
    updated[index] = { ...updated[index], [field]: value };
    setBranches(updated);
  };

  const addBranch = () => {
    if (branches.length < 4) {
      setBranches([...branches, { label: '', description: '', probability: 0.5 }]);
    }
  };

  const removeBranch = (index: number) => {
    setBranches(branches.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (isConnectingFutureMode && connectingFutureNode) {
      if (!sourceNodeId && !targetNodeId) return;
      onConnectFutureNodeAsFact?.(
        connectingFutureNode.id,
        title.trim(),
        category,
        tags,
        {
          sourceNodeId,
          targetNodeId,
          originBranchId,
        }
      );
      return;
    }

    if (!title.trim()) return;

    const validBranches = branches.filter((b) => b.label.trim().length > 0);

    onCreateSuperposition(title.trim(), category, validBranches, tags, {
      sourceNodeId,
      targetNodeId,
      originBranchId,
    });
  };

  const isInsertingBetween = !!sourceNodeId && !!targetNodeId;
  const isTipAddition = !!sourceNodeId && !targetNodeId;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          {/* ヘッダー */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-20">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold transition shadow-lg ${
                  isFutureItem
                    ? 'bg-emerald-950 border-2 border-dashed border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : isFact
                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                    : 'bg-gradient-to-tr from-cyan-500 via-purple-500 to-indigo-600 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                }`}
              >
                {isFact ? (
                  <FileCheck className="w-4 h-4 text-emerald-100" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">
                    {isConnectingFutureMode ? '未来の揺らぎを世界線へ接続' : '量子の追加'}
                  </h3>
                  {isConnectingFutureMode ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/80 font-mono font-bold">
                      事実（Fact）として配置
                    </span>
                  ) : isFutureItem ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-dashed border-emerald-400/90 font-mono font-bold">
                      未来の揺らぎモード
                    </span>
                  ) : isFact ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/80 font-mono font-bold">
                      事実（Fact）モード
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/80 font-mono font-bold">
                      新しい量子（重ね合わせ）
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {isConnectingFutureMode
                    ? '選択した未来の揺らぎを事実として、メインマップの接続元・接続先の間に挿入します'
                    : isFutureItem
                    ? '未来の揺らぎエリアに追加します（接続元・先を選択すると事実としてメインマップへ配置）'
                    : isInsertingBetween
                    ? 'メインマップの接続元と接続先の間に挿入します'
                    : 'メインマップの世界線に接続します'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="閉じる"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 sm:p-5 space-y-5 flex-1">
            {/* ------------------------------------------------------------- */}
            {/* 接続元 → 未来の揺らぎ / 事実 / 新しい量子 → 接続先の視覚的表示 */}
            {/* ------------------------------------------------------------- */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>接続フロー（タップして接続元・接続先を選択）</span>
                </span>
                {isFutureItem && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-dashed border-emerald-500/80 font-mono">
                    未来の揺らぎ
                  </span>
                )}
              </div>

              {/* 接続元 → 中央ボックス → 接続先 の横並び */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {/* 1. 接続元ボックス */}
                <button
                  type="button"
                  onClick={() => setPickerTarget('source')}
                  className={`flex-1 min-w-0 text-left p-2.5 rounded-xl border transition flex flex-col justify-between h-[76px] group relative ${
                    sourceNode
                      ? sourceNode.isFact
                        ? 'bg-emerald-950/40 border-emerald-500/70 hover:border-emerald-400 hover:bg-emerald-950/60 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                        : 'bg-cyan-950/30 border-cyan-500/60 hover:border-cyan-400 hover:bg-cyan-950/50 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-900/60 border-dashed border-slate-700 hover:border-slate-500 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-[10px] font-mono font-semibold ${
                        sourceNode?.isFact ? 'text-emerald-400' : 'text-cyan-400'
                      }`}
                    >
                      接続元 (Source)
                    </span>
                    <span className="text-[9px] text-slate-500 group-hover:text-cyan-300 underline font-sans">
                      選択
                    </span>
                  </div>
                  <div className="truncate text-xs font-bold text-white mt-0.5">
                    {sourceNode ? (
                      <span className={sourceNode.isFact ? 'text-emerald-300' : 'text-cyan-200'}>
                        {sourceNode.isFact ? `[事実] ${sourceNode.title}` : sourceNode.title}
                      </span>
                    ) : (
                      <span className="text-slate-500 font-normal italic flex items-center gap-1">
                        <CircleDashed className="w-3 h-3 text-slate-600" />
                        空白（接続元なし）
                      </span>
                    )}
                  </div>
                  {sourceNode && (
                    <span className="text-[9px] text-slate-400 font-mono truncate">
                      {sourceNode.isFact
                        ? '確固たる事実'
                        : sourceNode.state === 'observed'
                        ? '✓ 確定世界線'
                        : '重ね合わせ'}
                    </span>
                  )}
                </button>

                {/* 矢印 */}
                <div className="hidden sm:flex items-center justify-center shrink-0">
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </div>

                {/* 2. 中央ボックス：未来の揺らぎ / 事実 / 新しい量子 */}
                <div
                  className={`flex-1 min-w-0 p-2.5 rounded-xl flex flex-col justify-between h-[76px] transition ${
                    isFutureItem
                      ? 'border-2 border-dashed border-emerald-400/90 bg-emerald-950/30 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                      : isFact
                      ? 'border border-emerald-400/90 bg-emerald-950/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'border border-purple-500/70 bg-gradient-to-br from-purple-950/50 to-indigo-950/40 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        isFutureItem || isFact ? 'text-emerald-300' : 'text-purple-300'
                      }`}
                    >
                      {isFutureItem
                        ? '未来の揺らぎ'
                        : isFact
                        ? '事実 (Fact)'
                        : '新しい量子 (New)'}
                    </span>
                    {isFutureItem ? (
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                    ) : isFact ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-purple-400" />
                    )}
                  </div>
                  <div className="truncate text-xs font-bold text-white mt-0.5">
                    {effectiveCenterTitle ? (
                      effectiveCenterTitle
                    ) : (
                      <span className="text-slate-500">（名称・内容）</span>
                    )}
                  </div>
                  <span
                    className={`text-[9px] font-mono capitalize truncate ${
                      isFutureItem || isFact ? 'text-emerald-300/90' : 'text-purple-300/80'
                    }`}
                  >
                    {isConnectingFutureMode
                      ? `未来の揺らぎを事実化 • ${category}`
                      : isFutureItem
                      ? `未接続 • ${category}`
                      : isFact
                      ? `確定事実 • ${category}`
                      : `${branches.length}個の揺らぎ • ${category}`}
                  </span>
                </div>

                {/* 矢印 */}
                <div className="hidden sm:flex items-center justify-center shrink-0">
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </div>

                {/* 3. 接続先ボックス */}
                <button
                  type="button"
                  onClick={() => setPickerTarget('target')}
                  className={`flex-1 min-w-0 text-left p-2.5 rounded-xl border transition flex flex-col justify-between h-[76px] group relative ${
                    targetNode
                      ? targetNode.isFact
                        ? 'bg-emerald-950/40 border-emerald-500/70 hover:border-emerald-400 hover:bg-emerald-950/60 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                        : 'bg-emerald-950/30 border-emerald-500/60 hover:border-emerald-400 hover:bg-emerald-950/50 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                      : 'bg-slate-900/60 border-dashed border-slate-700 hover:border-slate-500 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                      接続先 (Target)
                    </span>
                    <span className="text-[9px] text-slate-500 group-hover:text-emerald-300 underline font-sans">
                      選択
                    </span>
                  </div>
                  <div className="truncate text-xs font-bold text-white mt-0.5">
                    {targetNode ? (
                      <span className="text-emerald-200">
                        {targetNode.isFact ? `[事実] ${targetNode.title}` : targetNode.title}
                      </span>
                    ) : (
                      <span className="text-slate-500 font-normal italic flex items-center gap-1">
                        <CircleDashed className="w-3 h-3 text-slate-600" />
                        空白（接続先なし）
                      </span>
                    )}
                  </div>
                  {targetNode && (
                    <span className="text-[9px] text-slate-400 font-mono truncate">
                      {targetNode.isFact
                        ? '確固たる事実'
                        : targetNode.state === 'observed'
                        ? '✓ 確定世界線'
                        : '重ね合わせ'}
                    </span>
                  )}
                </button>
              </div>

              {/* 接続元に複数の揺らぎ（選択肢）がある場合のブランチ選択 */}
              {sourceNode && sourceNode.branches.length > 0 && (
                <div className="pt-1 flex items-center gap-2 text-[11px]">
                  <span className="text-slate-400 shrink-0 font-mono">接続元の選択肢:</span>
                  <select
                    value={
                      originBranchId ||
                      sourceNode.actualizedBranchId ||
                      sourceNode.branches[0]?.id ||
                      ''
                    }
                    onChange={(e) => {
                      const nextBranchId = e.target.value;
                      setOriginBranchId(nextBranchId);
                      if (isConnectingFutureMode) {
                        const existingChild = mainMapNodes.find(
                          (c) =>
                            c.parentId === sourceNode.id &&
                            (c.originBranchId === nextBranchId || !c.originBranchId)
                        );
                        setTargetNodeId(existingChild ? existingChild.id : null);
                      }
                    }}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-cyan-200 focus:outline-none focus:border-cyan-400"
                  >
                    {sourceNode.branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.label} {b.status === 'actualized' ? '(DECIDED)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 接続ステータス解説 */}
              <div className="text-[11px] text-slate-400 leading-relaxed pt-1">
                {isConnectingFutureMode ? (
                  !hasConnection ? (
                    <p className="text-amber-300/90 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        上の「接続元」または「接続先」ボックスをタップして、メインマップのどこに挿入するか選択してください。
                      </span>
                    </p>
                  ) : isInsertingBetween ? (
                    <p className="text-emerald-300/90 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>
                        「{sourceNode?.title}」と「{targetNode?.title}」の間に、事実「
                        {effectiveCenterTitle}」を挿入します。
                      </span>
                    </p>
                  ) : isTipAddition ? (
                    <p className="text-emerald-300/90 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>
                        「{sourceNode?.title}」の直後に、事実「{effectiveCenterTitle}
                        」を接続します。
                      </span>
                    </p>
                  ) : (
                    <p className="text-emerald-300/90 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>
                        「{targetNode?.title}」の直前に、事実「{effectiveCenterTitle}
                        」を挿入します。
                      </span>
                    </p>
                  )
                ) : isFutureItem ? (
                  <p className="text-emerald-300/90 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      接続元・先が空白のため、<strong>「未来の揺らぎ」エリア</strong>
                      に追加されます。接続元・先を選択すると「事実」となり、揺らぎを追加すると「新しい量子」になります。
                    </span>
                  </p>
                ) : isTipAddition ? (
                  <p className="text-cyan-300/90 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>
                      「{sourceNode?.title}」の次に
                      {isFact ? '「事実」' : '「新しい量子」'}を接続します。
                    </span>
                  </p>
                ) : (
                  <p className="text-emerald-300/90 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      「{sourceNode ? sourceNode.title : '始点'}」と「{targetNode?.title}
                      」の間に{isFact ? '「事実」' : '「新しい量子」'}を挿入します。
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* タイトル・内容入力（未来の揺らぎ接続モード時はオプション） */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  {isConnectingFutureMode
                    ? '事実の内容（オプション・未入力時は元の内容が反映されます）:'
                    : isFutureItem
                    ? '未来の揺らぎの名称・内容:'
                    : isFact
                    ? '事実の内容・出来事の名称:'
                    : '新しい量子のテーマ・問い:'}
                </label>
                {isConnectingFutureMode && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono">
                    任意入力
                  </span>
                )}
              </div>
              <input
                type="text"
                required={!isConnectingFutureMode}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  isConnectingFutureMode && connectingFutureNode
                    ? `未入力のまま配置すると「${connectingFutureNode.title}」がそのまま反映されます`
                    : isFact
                    ? '例: 大学を卒業した、創業した、結婚した、資格を取得したなど...'
                    : '例: 次のキャリア選択、海外留学の挑戦、住まいの選択など...'
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition"
              />
              {isConnectingFutureMode && connectingFutureNode && (
                <p className="text-[11px] text-emerald-400/80 mt-1.5 font-mono">
                  元の未来の揺らぎの内容: 「{connectingFutureNode.title}」
                </p>
              )}
            </div>

            {/* カテゴリ選択 */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                カテゴリ:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="career">Career（キャリア・仕事）</option>
                <option value="lifestyle">Lifestyle（生活・住まい）</option>
                <option value="relationship">Relationship（人間関係）</option>
                <option value="creative">Creative（創作・表現）</option>
                <option value="existential">Existential（人生観・実存）</option>
              </select>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* 可能性（揺らぎ）セクション */}
            {/* 要件: 未来の揺らぎを事実として配置する場合は表示しない */}
            {/* ------------------------------------------------------------- */}
            {!isConnectingFutureMode && (
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-slate-200 block">
                      可能性（揺らぎ）の追加
                    </label>
                    <p className="text-[10.5px] text-slate-400 mt-0.5">
                      {isFutureItem
                        ? '※ 接続元・先を選択すると「事実」となり、揺らぎを追加すると「新しい量子」になります。'
                        : isFact
                        ? '※ 接続先・元が選択されているため「事実」となります（揺らぎを追加すると「新しい量子」になります）。'
                        : `現在 ${branches.length} 個の揺らぎが定義されています（新しい量子）。`}
                    </p>
                  </div>
                  {branches.length < 4 && (
                    <button
                      type="button"
                      onClick={addBranch}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-600/60 shadow transition shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 text-purple-300" />
                      <span>揺らぎを追加</span>
                    </button>
                  )}
                </div>

                {/* 揺らぎリスト（追加された場合のみ表示） */}
                {branches.length > 0 && (
                  <div className="space-y-2.5 pt-1">
                    {branches.map((branch, index) => (
                      <div
                        key={index}
                        className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-purple-400 font-bold">
                            可能性 {String.fromCharCode(65 + index)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeBranch(index)}
                            className="text-slate-500 hover:text-rose-400 transition"
                            title="この揺らぎを削除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          required
                          placeholder={`揺らぎ ${String.fromCharCode(65 + index)} の選択肢`}
                          value={branch.label}
                          onChange={(e) => handleBranchChange(index, 'label', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-400"
                        />
                        <input
                          type="text"
                          placeholder="補足や期待・懸念（任意）"
                          value={branch.description}
                          onChange={(e) => handleBranchChange(index, 'description', e.target.value)}
                          className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-purple-400"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* タグ */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                タグ（カンマ区切り）:
              </label>
              <input
                type="text"
                placeholder="2026年, 重要, キャリア"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* フッター */}
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between sticky bottom-0 z-20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isConnectingFutureMode && !hasConnection}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${
                isFutureItem
                  ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border-2 border-dashed border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : isFact
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                  : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 hover:text-white shadow-[0_0_15px_rgba(56,189,248,0.35)]'
              }`}
            >
              {isFact ? (
                <FileCheck className="w-3.5 h-3.5" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>
                {isConnectingFutureMode
                  ? '「事実」としてメインマップに配置'
                  : isFutureItem
                  ? '「未来の揺らぎ」を配置'
                  : isFact
                  ? '「事実」を配置'
                  : 'New Quantum を配置'}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 接続元・接続先選択ポップアップピッカー */}
      {/* 要件: メインマップの量子・事実のみ表示し、未来の揺らぎはリストに表示しない */}
      {/* ----------------------------------------------------------------- */}
      {pickerTarget && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white">
                  {pickerTarget === 'source'
                    ? '接続元の量子・事実を選択'
                    : '接続先の量子・事実を選択'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {pickerTarget === 'source'
                    ? 'メインマップ上で直前となるノードを選択してください'
                    : 'メインマップ上で直後となるノードを選択してください'}
                </p>
              </div>
              <button
                onClick={() => setPickerTarget(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 overflow-y-auto space-y-1.5 flex-1">
              {/* 1. 先頭オプション：空白（接続元、接続先なし） */}
              <button
                type="button"
                onClick={() => {
                  if (pickerTarget === 'source') {
                    setSourceNodeId(null);
                    setOriginBranchId(null);
                  } else {
                    setTargetNodeId(null);
                  }
                  setPickerTarget(null);
                }}
                className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between ${
                  (pickerTarget === 'source' && !sourceNodeId) ||
                  (pickerTarget === 'target' && !targetNodeId)
                    ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'bg-slate-950/60 border-dashed border-slate-700/80 text-slate-300 hover:bg-slate-800/80 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                    <CircleDashed className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>空白（接続元、接続先なし）</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-emerald-300 font-mono">
                        なし
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {pickerTarget === 'source'
                        ? '接続元を指定しません'
                        : '接続先を指定せず、先端（末尾）とします'}
                    </p>
                  </div>
                </div>
                {((pickerTarget === 'source' && !sourceNodeId) ||
                  (pickerTarget === 'target' && !targetNodeId)) && (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
              </button>

              <div className="pt-2 pb-1 px-1 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                メインマップの量子・事実一覧 ({mainMapNodes.length}件)
              </div>

              {/* 2. メインマップの量子・事実ノードリスト（未来の揺らぎは除外） */}
              {mainMapNodes.map((n) => {
                const isSelected =
                  pickerTarget === 'source' ? sourceNodeId === n.id : targetNodeId === n.id;
                const isOtherSelected =
                  pickerTarget === 'source' ? targetNodeId === n.id : sourceNodeId === n.id;

                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      if (pickerTarget === 'source') {
                        const defaultBranchId =
                          n.actualizedBranchId || n.branches[0]?.id || null;
                        setSourceNodeId(n.id);
                        setOriginBranchId(defaultBranchId);
                        if (targetNodeId === n.id) {
                          setTargetNodeId(null);
                        } else if (isConnectingFutureMode && !targetNodeId) {
                          // 接続元を選択した際、その直後に繋がっている既存ノードがあれば自動的に接続先にセットして間に挿入しやすくする
                          const nextChild = mainMapNodes.find(
                            (c) =>
                              c.parentId === n.id &&
                              (!defaultBranchId ||
                                c.originBranchId === defaultBranchId ||
                                !c.originBranchId)
                          );
                          if (nextChild) {
                            setTargetNodeId(nextChild.id);
                          }
                        }
                      } else {
                        setTargetNodeId(n.id);
                        if (sourceNodeId === n.id) {
                          setSourceNodeId(null);
                        } else if (isConnectingFutureMode && !sourceNodeId && n.parentId) {
                          // 接続先を選択した際、その親ノードがメインマップにあれば自動的に接続元にセットして間に挿入しやすくする
                          const parentInMain = mainMapNodes.find((p) => p.id === n.parentId);
                          if (parentInMain) {
                            setSourceNodeId(parentInMain.id);
                            setOriginBranchId(
                              n.originBranchId ||
                                parentInMain.actualizedBranchId ||
                                parentInMain.branches[0]?.id ||
                                null
                            );
                          }
                        }
                      }
                      setPickerTarget(null);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between ${
                      isSelected
                        ? n.isFact
                          ? 'bg-emerald-950/50 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                          : 'bg-cyan-950/50 border-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          n.isFact
                            ? 'bg-emerald-950 border border-emerald-500 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                            : n.state === 'observed'
                            ? 'bg-cyan-950 border border-cyan-700 text-cyan-400'
                            : 'bg-purple-950 border border-purple-700 text-purple-300'
                        }`}
                      >
                        {n.isFact ? '事' : n.state === 'observed' ? '✓' : 'ψ'}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                          <span
                            className={`truncate ${
                              n.isFact ? 'text-emerald-300 font-bold' : ''
                            }`}
                          >
                            {n.isFact ? `[事実] ${n.title}` : n.title}
                          </span>
                          {isOtherSelected && (
                            <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400">
                              {pickerTarget === 'source' ? '※現在接続先' : '※現在接続元'}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 font-mono">
                          <span className="capitalize">{n.category}</span>
                          <span>•</span>
                          <span>
                            {n.isFact
                              ? '事実'
                              : n.state === 'observed'
                              ? '確定'
                              : '重ね合わせ'}
                          </span>
                          {!n.isFact && n.branches.length > 0 && (
                            <>
                              <span>•</span>
                              <span>{n.branches.length}揺らぎ</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check
                        className={`w-4 h-4 shrink-0 ml-2 ${
                          n.isFact ? 'text-emerald-400' : 'text-cyan-400'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
