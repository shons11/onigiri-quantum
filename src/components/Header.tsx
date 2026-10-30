/**
 * @file src/components/Header.tsx
 * @description Oni-Qヘッダー（ローカル完結型）
 * - ブランドロゴ、人生タイトル、Totalカウンター、New Quantumアクション、世界線一覧遷移
 */

import React from 'react';
import {
  Sparkles,
  Eye,
  Users,
  HelpCircle,
  ArrowLeft,
  HardDrive,
} from 'lucide-react';

interface HeaderProps {
  lifeTitle?: string;
  totalQuanta: number;
  onReturnToTitle: () => void;
  onOpenNewSuperposition: () => void;
  onOpenEntanglementDemo: () => void;
  onOpenGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lifeTitle,
  totalQuanta,
  onReturnToTitle,
  onOpenNewSuperposition,
  onOpenEntanglementDemo,
  onOpenGuide,
}) => {
  return (
    <header className="h-16 px-4 sm:px-6 border-b border-slate-800 bg-slate-950/85 backdrop-blur-md flex items-center justify-between z-20 shrink-0 select-none">
      {/* 左側：ブランドロゴ＆戻るボタン＆人生タイトル */}
      <div className="flex items-center gap-3">
        {/* タイトル画面へ戻る */}
        <button
          onClick={onReturnToTitle}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
          title="世界線一覧・タイトル画面へ戻る"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden md:inline">世界線一覧</span>
        </button>

        {/* 偏光量子オーブのシンボルマーク（2/3スケール楕円＋中央単一パルス円） */}
        <div className="relative w-8 h-8 flex items-center justify-center shrink-0 overflow-visible">
          <div className="absolute w-5 h-[7px] rounded-full border border-cyan-400/80 -rotate-30 shadow-[0_0_6px_rgba(56,189,248,0.6)] animate-[spin_10s_linear_infinite]" />
          <div className="absolute w-[17px] h-[6px] rounded-full border border-purple-400/60 rotate-45 shadow-[0_0_5px_rgba(192,132,252,0.4)] animate-[spin_8s_linear_infinite_reverse]" />
          <div className="w-2 h-2 rounded-full bg-gradient-to-tr from-cyan-400 via-sky-200 to-white shadow-[0_0_6px_#38bdf8] animate-pulse" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold tracking-tight text-white text-sm sm:text-base flex items-center gap-1.5">
              <span>{lifeTitle || 'Onigiri Quantum'}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/80 font-mono">
                Oni-Q
              </span>
            </h1>
          </div>
          <p className="text-[10px] text-slate-400 hidden lg:block">
            決断と行動、それは量子観測
          </p>
        </div>
      </div>

      {/* 中央：Total カウンター */}
      <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-full shadow-inner">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span className="text-xs text-slate-400">Total:</span>
        <span className="text-xs sm:text-sm font-bold font-mono text-cyan-300">
          {totalQuanta}
        </span>
        <span className="text-[10px] text-cyan-400/80 font-mono hidden sm:inline">quantum</span>
      </div>

      {/* 右側：アクションボタン群 */}
      <div className="flex items-center gap-2">
        {/* ローカル保存バッジ */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
          <HardDrive className="w-3 h-3 text-cyan-400" />
          <span>Local Storage</span>
        </div>

        {/* 量子合流（マルチパーソン構想） */}
        <button
          onClick={onOpenEntanglementDemo}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-700 text-purple-300 hover:text-purple-200 transition"
          title="他者世界線との交差・合流（量子エンタングルメント構想）"
        >
          <Users className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden lg:inline">量子合流</span>
        </button>

        {/* New Quantum ボタン */}
        <button
          onClick={onOpenNewSuperposition}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.4)] transition"
        >
          <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Quantum</span>
        </button>

        {/* ガイド */}
        <button
          onClick={onOpenGuide}
          className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
          title="Oni-Qの思想と使い方"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
