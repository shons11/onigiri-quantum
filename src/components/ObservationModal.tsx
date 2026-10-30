/**
 * @file src/components/ObservationModal.tsx
 * @description 観測モーダル：重ね合わせ（Superposition）から1つの選択肢を選び、決断を確定（Collapse）する
 */

import React, { useState } from 'react';
import { OnigiriNode, OnigiriFlavor } from '../types/quantum';
import { Sparkles, X, CheckCircle2 } from 'lucide-react';

interface ObservationModalProps {
  node: OnigiriNode;
  onClose: () => void;
  onConfirmObservation: (
    nodeId: string,
    selectedBranchId: string,
    certainty: number
  ) => void;
}

export const ObservationModal: React.FC<ObservationModalProps> = ({
  node,
  onClose,
  onConfirmObservation,
}) => {
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    node.branches[0]?.id || ''
  );
  const [certainty, setCertainty] = useState<number>(0.8);
  const [isCollapsing, setIsCollapsing] = useState(false);

  const handleObserve = () => {
    if (!selectedBranchId) return;

    setIsCollapsing(true);
    setTimeout(() => {
      onConfirmObservation(node.id, selectedBranchId, certainty);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className={`bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-y-auto shadow-2xl transition-all duration-500 ${
          isCollapsing ? 'scale-95 opacity-50 blur-[1px]' : 'scale-100 opacity-100'
        }`}
      >
        {/* ヘッダー */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-slate-950 font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">観測を実行（Observation）</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800">
                  State Collapse
                </span>
              </div>
              <p className="text-xs text-slate-400">
                重ね合わせ状態の選択肢から1つを確定し、世界線を確定します
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-5 space-y-5">
          {/* 対象ノード */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">
              テーマ
            </span>
            <div className="text-base font-semibold text-white">{node.title}</div>
            <div className="text-xs text-slate-400 mt-0.5">カテゴリ: {node.category}</div>
          </div>

          {/* 決断 */}
          <div>
            <label className="text-xs font-semibold text-slate-200 block mb-2">
              決断
            </label>
            <div className="space-y-2">
              {node.branches.map((branch) => {
                const isChosen = branch.id === selectedBranchId;
                return (
                  <div
                    key={branch.id}
                    onClick={() => setSelectedBranchId(branch.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      isChosen
                        ? 'bg-cyan-950/50 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                        : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isChosen
                              ? 'border-cyan-400 bg-cyan-400'
                              : 'border-slate-500 bg-transparent'
                          }`}
                        >
                          {isChosen && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                        </div>
                        <span className="font-semibold text-sm text-slate-100">
                          {branch.label}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-cyan-400/90">
                        振幅: {Math.round(branch.probabilityAmplitude * 100)}%
                      </span>
                    </div>
                    {branch.description && (
                      <p className="text-xs text-slate-400 mt-1.5 ml-6 pl-0.5">
                        {branch.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 確信度 */}
          <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">観測時の確信度</span>
              <span className="text-cyan-400 font-mono font-bold">
                {Math.round(certainty * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={certainty}
              onChange={(e) => setCertainty(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>直感・賭け</span>
              <span>確信</span>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
          >
            キャンセル
          </button>
          <button
            onClick={handleObserve}
            disabled={!selectedBranchId || isCollapsing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(56,189,248,0.5)] transition disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>{isCollapsing ? '波動関数を収縮中...' : '観測して確定'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
