/**
 * @file src/components/GuideModal.tsx
 * @description Oni-Qのコンセプト（量子力学的世界線・おにぎりメタファー）解説モーダル
 */

import React from 'react';
import { X, Sparkles, CircleDot, GitBranch, ShieldCheck } from 'lucide-react';

interface GuideModalProps {
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-base">Onigiri Quantum (Oni-Q) の思想</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs text-slate-300 leading-relaxed">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-cyan-300 text-sm">
              「人生は決断の連続であり、観測によって可能性が収縮する」
            </h4>
            <p className="text-slate-400">
              量子力学の世界では、状態は観測されるまで複数の可能性が重なり合った「重ね合わせ（Superposition）」のままです。
              人間もまた、悩み葛藤している時は重ね合わせ状態にあります。そして、決断し行動を起こす（観測する）ことで、無数の可能性から1つの世界線へと確定（Collapse）します。
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 shrink-0">
                <CircleDot className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-white text-sm">1. 偏光量子オーブ（Polarized Quantum Orb）🔮</h5>
                <p className="text-slate-400 mt-0.5">
                  決断の瞬間を象徴する光のノードです。回転する複屈折の偏光軌道リングと、決断テーマに応じた固有波長で脈動するエネルギーコアを持ち、観測（決断）によって確固たる世界線として確定します。
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-950 border border-purple-800 text-purple-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-white text-sm">2. ログ単位「1quantum」</h5>
                <p className="text-slate-400 mt-0.5">
                  1回の決断・観測につき1単位の「1quantum」が確定ログとして蓄積されます。あなたの人生の歩みが、確定した量子単位として刻まれます。
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-950 border border-rose-800 text-rose-400 shrink-0">
                <GitBranch className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-white text-sm">3. 選ばれなかった道（IFの世界線）</h5>
                <p className="text-slate-400 mt-0.5">
                  選ばなかった選択肢は消滅するのではなく、半透明の枝線（Counterfactual Branch）として宇宙空間に残ります。数年後に「あの時選ばなかった道」を振り返り、現在の視点から後悔度や教訓を再評価できます。
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>データはすべてお使いのブラウザ（LocalStorage）に安全に保存されます。</span>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition"
          >
            量子空間へ戻る
          </button>
        </div>
      </div>
    </div>
  );
};
