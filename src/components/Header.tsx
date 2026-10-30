/**
 * @file src/components/Header.tsx
 * @description Oni-Qヘッダー：ブランドロゴ、人生タイトル、Totalカウンター、New Quantumアクション、ユーザーメニュー
 */

import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  Sparkles,
  Eye,
  Users,
  HelpCircle,
  ArrowLeft,
  LogOut,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  lifeTitle?: string;
  totalQuanta: number;
  user?: User | null;
  onReturnToTitle: () => void;
  onOpenNewSuperposition: () => void;
  onOpenEntanglementDemo: () => void;
  onOpenGuide: () => void;
  onOpenDeleteAccount: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lifeTitle,
  totalQuanta,
  user,
  onReturnToTitle,
  onOpenNewSuperposition,
  onOpenEntanglementDemo,
  onOpenGuide,
  onOpenDeleteAccount,
  onSignOut,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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

        {/* 偏光量子オーブのシンボルマーク */}
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

      {/* 右側：アクションボタン群 & ユーザーメニュー */}
      <div className="flex items-center gap-2">
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

        {/* ユーザーアバター＆ドロップダウン */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-800 transition"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-7 h-7 rounded-full border border-cyan-400/50 object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 text-xs font-bold">
                  {user.displayName?.[0] || 'U'}
                </div>
              )}
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-40 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="font-semibold text-white truncate">
                      {user.displayName || '量子観測者'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate font-mono">
                      {user.email}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onReturnToTitle();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800 transition flex items-center gap-2"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
                      <span>世界線一覧に戻る</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenDeleteAccount();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-red-950/40 text-red-400 transition flex items-center gap-2"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                      <span>退会・データ全削除</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onSignOut();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800 transition flex items-center gap-2 text-slate-400 hover:text-white"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>ログアウト</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
