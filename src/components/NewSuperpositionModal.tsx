/**
 * @file src/components/NewSuperpositionModal.tsx
 * @description 新しい決断（重ね合わせ / Superposition）の作成モーダル
 */

import React, { useState } from 'react';
import { OnigiriNode, QuantumBranch, OnigiriFlavor } from '../types/quantum';
import { Sparkles, Plus, Trash2, X } from 'lucide-react';

export interface TargetInsertion {
  parentNode: OnigiriNode;
  branch: QuantumBranch;
  nextNode: OnigiriNode | null;
}

interface NewSuperpositionModalProps {
  parentNode: OnigiriNode | null;
  targetInsertion?: TargetInsertion | null;
  onClose: () => void;
  onClearTargetInsertion?: () => void;
  onCreateSuperposition: (
    title: string,
    category: OnigiriNode['category'],
    branches: { label: string; description: string; probability: number }[],
    tags: string[],
    targetInsertion?: TargetInsertion | null
  ) => void;
}

export const NewSuperpositionModal: React.FC<NewSuperpositionModalProps> = ({
  parentNode,
  targetInsertion,
  onClose,
  onClearTargetInsertion,
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

    onCreateSuperposition(title.trim(), category, validBranches, tags, targetInsertion);
  };

  const isInserting = !!targetInsertion;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <form onSubmit={handleSubmit}>
          {/* ヘッダー */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  {isInserting
                    ? '過去世界線への量子揺らぎ挿入 (Retroactive Quantum)'
                    : '新しい決断の重ね合わせ（Superposition）'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isInserting
                    ? '選択した確定世界線と次の量子の間に、未確定の量子状態を挿入します'
                    : '未確定の可能性をゆらめく量子ノードとして配置します'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* 挿入モードまたは親ノードの接続情報 */}
            {isInserting && targetInsertion ? (
              <div className="bg-purple-950/40 border border-purple-500/50 p-3.5 rounded-xl text-xs space-y-2 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-purple-300">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>過去世界線の間に挿入</span>
                  </div>
                  {onClearTargetInsertion && (
                    <button
                      type="button"
                      onClick={onClearTargetInsertion}
                      className="text-[10px] text-slate-400 hover:text-cyan-300 underline"
                    >
                      末尾への通常作成に変更
                    </button>
                  )}
                </div>
                <div className="text-slate-300 font-mono text-[11px] flex flex-wrap items-center gap-1.5 bg-slate-950/60 p-2.5 rounded-lg border border-purple-900/60">
                  <span className="text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                    {targetInsertion.parentNode.title} [{targetInsertion.branch.label}]
                  </span>
                  <span className="text-purple-400 font-bold">⇄ (点線接続) ⇄</span>
                  <span className="text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    {targetInsertion.nextNode ? targetInsertion.nextNode.title : '未来世界線'}
                  </span>
                </div>
                <p className="text-[10.5px] text-purple-200/80 leading-relaxed">
                  ※ 挿入時は点線で接続されます。後からこの量子の選択肢を決断（確定）すると、選ばれた枝が実線に変化し、選ばれなかった枝の点線は消滅します。
                </p>
              </div>
            ) : (
              parentNode && (
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-500 block">接続元（直前の世界線）:</span>
                  <span className="text-cyan-300 font-semibold">{parentNode.title}</span>
                </div>
              )
            )}

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
                placeholder="例: 次のプロジェクトの方向性、住まいの選択など..."
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

          {/* フッター */}
          <div className="p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(168,85,247,0.4)] transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isInserting ? '過去の量子揺らぎを挿入する' : '重ね合わせノードを配置'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
