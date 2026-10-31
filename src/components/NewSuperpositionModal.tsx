/**
 * @file src/components/NewSuperpositionModal.tsx
 * @description 「量子の追加 (New Quantum)」モーダル
 * - 接続元・接続先の明確化：[ 接続元 ] → [ 新しい量子 ] → [ 接続先 ] の視覚的接続フロー
 * - 空白ボックス選択時の接続先・接続元選択ピッカー（先頭に「空白」オプション）
 * - 「未来の揺らぎ」モード（接続元・接続先が共に空白の場合の浮遊量子創成）
 * - 名称の「New Quantum」への完全統一
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
  onClose: () => void;
  onCreateSuperposition: (
    title: string,
    category: OnigiriNode['category'],
    branches: { label: string; description: string; probability: number }[],
    tags: string[],
    connections: ConnectionConfig
  ) => void;
}

export const NewSuperpositionModal: React.FC<NewSuperpositionModalProps> = ({
  existingNodes,
  initialSourceNodeId = null,
  initialTargetNodeId = null,
  initialOriginBranchId = null,
  onClose,
  onCreateSuperposition,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<OnigiriNode['category']>('career');
  const [branches, setBranches] = useState<
    { label: string; description: string; probability: number }[]
  >([
    { label: '', description: '', probability: 0.5 },
    { label: '', description: '', probability: 0.5 },
  ]);
  const [tagInput, setTagInput] = useState('');

  // 接続元・接続先の選択状態
  const [sourceNodeId, setSourceNodeId] = useState<string | null>(initialSourceNodeId);
  const [targetNodeId, setTargetNodeId] = useState<string | null>(initialTargetNodeId);
  const [originBranchId, setOriginBranchId] = useState<string | null>(initialOriginBranchId);

  // ピッカーモーダル表示状態 ('source' | 'target' | null)
  const [pickerTarget, setPickerTarget] = useState<'source' | 'target' | null>(null);

  const sourceNode = existingNodes.find((n) => n.id === sourceNodeId) || null;
  const targetNode = existingNodes.find((n) => n.id === targetNodeId) || null;

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
    if (branches.length > 2) {
      setBranches(branches.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const validBranches = branches.filter((b) => b.label.trim().length > 0);
    if (validBranches.length < 2) return;

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onCreateSuperposition(title.trim(), category, validBranches, tags, {
      sourceNodeId,
      targetNodeId,
      originBranchId,
    });
  };

  const isFutureFluctuation = !sourceNodeId && !targetNodeId;
  const isInsertingBetween = !!sourceNodeId && !!targetNodeId;
  const isTipAddition = !!sourceNodeId && !targetNodeId;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          {/* ヘッダー：要件に基づき「量子の追加」に統一 */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 via-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">量子の追加</h3>
                <p className="text-[11px] text-slate-400">
                  {isFutureFluctuation
                    ? '未来の揺らぎ（未接続の浮遊量子）として配置します'
                    : isInsertingBetween
                    ? '接続元と接続先の間に量子を挿入します'
                    : '世界線の先端に新しい量子を追加します'}
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
            {/* 要件1 & 要件4: 接続元 → 新しい量子 → 接続先の視覚的表示 ＆ クリック選択 */}
            {/* ------------------------------------------------------------- */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>量子の接続フロー（タップして変更）</span>
                </span>
                {isFutureFluctuation && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/90 text-purple-300 border border-purple-700/60 font-mono animate-pulse">
                    未来の揺らぎ
                  </span>
                )}
              </div>

              {/* 接続元 → 新しい量子 → 接続先 のボックス並び */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 items-center">
                {/* 1. 接続元ボックス */}
                <button
                  type="button"
                  onClick={() => setPickerTarget('source')}
                  className={`text-left p-3 rounded-xl border transition flex flex-col justify-between h-[74px] group relative ${
                    sourceNode
                      ? 'bg-cyan-950/30 border-cyan-500/60 hover:border-cyan-400 hover:bg-cyan-950/50 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-900/60 border-dashed border-slate-700 hover:border-slate-500 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-mono text-cyan-400 font-semibold">
                      接続元 (Source)
                    </span>
                    <span className="text-[9px] text-slate-500 group-hover:text-cyan-300 underline font-sans">
                      変更
                    </span>
                  </div>
                  <div className="truncate text-xs font-bold text-white mt-1">
                    {sourceNode ? (
                      <span className="text-cyan-200">{sourceNode.title}</span>
                    ) : (
                      <span className="text-slate-500 font-normal italic flex items-center gap-1">
                        <CircleDashed className="w-3 h-3 text-slate-600" />
                        空白（接続元なし）
                      </span>
                    )}
                  </div>
                  {sourceNode && (
                    <span className="text-[9px] text-slate-400 font-mono truncate">
                      {sourceNode.state === 'observed' ? '✓ 確定世界線' : '重ね合わせ'}
                    </span>
                  )}
                </button>

                {/* 矢印 (スマホ時は下向き、PC時は右向き) */}
                <div className="hidden sm:flex items-center justify-center">
                  <div className="flex items-center gap-1 text-slate-600">
                    <div className="w-4 h-[1.5px] bg-gradient-to-r from-cyan-500/80 to-purple-500/80" />
                    <ArrowRight className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  </div>
                </div>

                {/* 2. 新しい量子（中央） */}
                <div className="p-3 rounded-xl border border-purple-500/60 bg-gradient-to-br from-purple-950/50 to-indigo-950/40 shadow-[0_0_15px_rgba(168,85,247,0.25)] flex flex-col justify-between h-[74px]">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-mono text-purple-300 font-semibold">
                      新しい量子 (New)
                    </span>
                    <Sparkles className="w-3 h-3 text-purple-400" />
                  </div>
                  <div className="truncate text-xs font-bold text-white mt-1">
                    {title.trim() ? title : <span className="text-purple-300/60">（決断テーマ）</span>}
                  </div>
                  <span className="text-[9px] text-purple-300/80 font-mono capitalize">
                    {category}
                  </span>
                </div>

                {/* 矢印 (スマホ時は非表示、PC時は右向き) */}
                <div className="hidden sm:flex items-center justify-center">
                  <div className="flex items-center gap-1 text-slate-600">
                    <div className="w-4 h-[1.5px] bg-gradient-to-r from-purple-500/80 to-emerald-500/80" />
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  </div>
                </div>

                {/* 3. 接続先ボックス */}
                <button
                  type="button"
                  onClick={() => setPickerTarget('target')}
                  className={`text-left p-3 rounded-xl border transition flex flex-col justify-between h-[74px] group relative ${
                    targetNode
                      ? 'bg-emerald-950/30 border-emerald-500/60 hover:border-emerald-400 hover:bg-emerald-950/50 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                      : 'bg-slate-900/60 border-dashed border-slate-700 hover:border-slate-500 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                      接続先 (Target)
                    </span>
                    <span className="text-[9px] text-slate-500 group-hover:text-emerald-300 underline font-sans">
                      変更
                    </span>
                  </div>
                  <div className="truncate text-xs font-bold text-white mt-1">
                    {targetNode ? (
                      <span className="text-emerald-200">{targetNode.title}</span>
                    ) : (
                      <span className="text-slate-500 font-normal italic flex items-center gap-1">
                        <CircleDashed className="w-3 h-3 text-slate-600" />
                        空白（接続先なし）
                      </span>
                    )}
                  </div>
                  {targetNode && (
                    <span className="text-[9px] text-slate-400 font-mono truncate">
                      {targetNode.state === 'observed' ? '✓ 確定世界線' : '重ね合わせ'}
                    </span>
                  )}
                </button>
              </div>

              {/* 接続ステータス解説 */}
              <div className="text-[11px] text-slate-400 leading-relaxed pt-1">
                {isFutureFluctuation ? (
                  <p className="text-purple-300/90 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>
                      接続元・先が空白のため、作成した量子は画面の<strong>「未来の揺らぎ」エリア</strong>に浮遊表示されます。後から自由に接続できます。
                    </span>
                  </p>
                ) : isTipAddition ? (
                  <p className="text-cyan-300/90 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>
                      「{sourceNode?.title}」の先端に新しい量子を接続します（接続先は空白）。
                    </span>
                  </p>
                ) : (
                  <p className="text-emerald-300/90 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      「{sourceNode?.title}」と「{targetNode?.title}」の間に未確定量子を挿入します。
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* 決断タイトル */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                決断のテーマ・問い:
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: 次のキャリア選択、海外留学の挑戦、住まいの選択など..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
              />
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

            {/* 悩んでいる選択肢（重ね合わせる枝） */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300">
                  重なり合っている選択肢（2〜4個）:
                </label>
                {branches.length < 4 && (
                  <button
                    type="button"
                    onClick={addBranch}
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>選択肢を追加</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {branches.map((branch, index) => (
                  <div
                    key={index}
                    className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-purple-400 font-bold">
                        可能性 {String.fromCharCode(65 + index)}
                      </span>
                      {branches.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeBranch(index)}
                          className="text-slate-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      placeholder={`選択肢 ${String.fromCharCode(65 + index)} の概要`}
                      value={branch.label}
                      onChange={(e) => handleBranchChange(index, 'label', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-400"
                    />
                    <input
                      type="text"
                      placeholder="補足や期待・懸念（任意）"
                      value={branch.description}
                      onChange={(e) => handleBranchChange(index, 'description', e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-purple-400"
                    />
                  </div>
                ))}
              </div>
            </div>

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

          {/* フッター：要件に基づき「New Quantum」に統一 */}
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 hover:text-white font-bold text-xs shadow-[0_0_15px_rgba(56,189,248,0.35)] transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Quantum を配置</span>
            </button>
          </div>
        </form>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 要件4: 接続元・接続先選択ポップアップピッカー */}
      {/* 先頭に「空白（接続元、接続先なし）」を配置 */}
      {/* ----------------------------------------------------------------- */}
      {pickerTarget && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white">
                  {pickerTarget === 'source' ? '接続元の量子を選択' : '接続先の量子を選択'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {pickerTarget === 'source'
                    ? '新しい量子の直前となる決断を選択してください'
                    : '新しい量子の直後となる決断を選択してください'}
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
                    ? 'bg-purple-950/40 border-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.2)]'
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
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-purple-300 font-mono">
                        なし
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      {pickerTarget === 'source'
                        ? '接続元を指定せず、未来の揺らぎ（または根量子）とします'
                        : '接続先を指定せず、先端（末尾）とします'}
                    </p>
                  </div>
                </div>
                {((pickerTarget === 'source' && !sourceNodeId) ||
                  (pickerTarget === 'target' && !targetNodeId)) && (
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                )}
              </button>

              <div className="pt-2 pb-1 px-1 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                既存の量子一覧 ({existingNodes.length}件)
              </div>

              {/* 2. 既存の量子ノードリスト */}
              {existingNodes.map((n) => {
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
                        setSourceNodeId(n.id);
                        // もし同じノードがtargetなら解除
                        if (targetNodeId === n.id) setTargetNodeId(null);
                      } else {
                        setTargetNodeId(n.id);
                        // もし同じノードがsourceなら解除
                        if (sourceNodeId === n.id) setSourceNodeId(null);
                      }
                      setPickerTarget(null);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950/50 border-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          n.state === 'observed'
                            ? 'bg-cyan-950 border border-cyan-700 text-cyan-400'
                            : 'bg-purple-950 border border-purple-700 text-purple-300'
                        }`}
                      >
                        {n.state === 'observed' ? '✓' : 'ψ'}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                          <span className="truncate">{n.title}</span>
                          {n.isFutureFluctuation && (
                            <span className="text-[9px] px-1 rounded bg-purple-900/60 text-purple-300">
                              未来の揺らぎ
                            </span>
                          )}
                          {isOtherSelected && (
                            <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400">
                              {pickerTarget === 'source' ? '※現在接続先' : '※現在接続元'}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 font-mono">
                          <span className="capitalize">{n.category}</span>
                          <span>•</span>
                          <span>{n.state === 'observed' ? '確定' : '重ね合わせ'}</span>
                          <span>•</span>
                          <span>{n.branches.length}選択肢</span>
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0 ml-2" />}
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
