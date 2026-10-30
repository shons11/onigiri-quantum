/**
 * @file src/components/TitleScreen.tsx
 * @description Oni-Q ポータル・タイトル画面
 * - START MY LIFE ボタンによる新規人生創成フロー
 * - Google アカウント認証連携
 * - 過去の人生一覧からの世界線再開（Resume）
 * - アカウント連携解除・全データ削除（退会）モーダル
 */

import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { UserProfile } from '../services/authService';
import { LifeRecord } from '../types/quantum';
import {
  Sparkles,
  Play,
  Clock,
  Trash2,
  LogOut,
  ShieldAlert,
  ChevronRight,
  GitBranch,
  Layers,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

interface TitleScreenProps {
  user: User | null;
  profile: UserProfile | null;
  lives: LifeRecord[];
  isLoadingLives: boolean;
  onSignInGoogle: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onOpenNewLife: () => void;
  onResumeLife: (lifeId: string) => void;
  onDeleteLife: (lifeId: string, title: string) => void;
  onOpenDeleteAccount: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  user,
  profile,
  lives,
  isLoadingLives,
  onSignInGoogle,
  onSignOut,
  onOpenNewLife,
  onResumeLife,
  onDeleteLife,
  onOpenDeleteAccount,
}) => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setAuthError(null);
      await onSignInGoogle();
    } catch (err: any) {
      console.error(err);
      setAuthError('Googleログインに失敗しました。もう一度お試しください。');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#020307] text-slate-100 flex flex-col justify-between overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 背景の量子星雲・グリッドエフェクト */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-cyan-600/15 via-blue-600/10 to-transparent blur-3xl rounded-full" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-purple-600/10 blur-3xl rounded-full" />
        <div className="absolute bottom-10 -right-40 w-96 h-96 bg-cyan-600/10 blur-3xl rounded-full" />
        {/* 微細グリッド */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* トップバー：認証ステータス */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        {/* ロゴ */}
        <div className="flex items-center gap-3">
          {/* 偏光量子オーブ */}
          <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
            <div className="absolute w-6 h-[9px] rounded-full border border-cyan-400/80 -rotate-30 shadow-[0_0_8px_rgba(56,189,248,0.6)] animate-[spin_10s_linear_infinite]" />
            <div className="absolute w-[21px] h-[7px] rounded-full border border-purple-400/60 rotate-45 shadow-[0_0_6px_rgba(192,132,252,0.4)] animate-[spin_8s_linear_infinite_reverse]" />
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-cyan-300 via-sky-100 to-white shadow-[0_0_10px_#38bdf8] animate-pulse" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-white text-base">
              Onigiri Quantum
            </span>
            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
              Oni-Q
            </span>
          </div>
        </div>

        {/* ユーザー情報 or ログインボタン */}
        <div>
          {user ? (
            <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-md">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-7 h-7 rounded-full border border-cyan-400/60 object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 text-xs font-bold">
                  {user.displayName?.[0] || 'U'}
                </div>
              )}
              <div className="hidden sm:block text-left text-xs">
                <p className="font-medium text-slate-200 leading-tight">
                  {user.displayName || '量子観測者'}
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                  {user.email}
                </p>
              </div>
              <button
                onClick={onSignOut}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-full hover:bg-slate-800 transition"
                title="ログアウト"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-white text-slate-900 hover:bg-slate-100 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition disabled:opacity-50"
            >
              {/* Google G アイコン */}
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isSigningIn ? '接続中...' : 'Googleでログイン'}</span>
            </button>
          )}
        </div>
      </header>

      {/* メインヒーローセクション */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-6 py-8 flex flex-col items-center text-center">
        {/* サブタイトルバッジ */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/80 text-cyan-300 text-xs mb-6 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>人生の決断と行動、それは量子観測</span>
        </div>

        {/* メインタイトル */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          あなたが選んだ道、<br />
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            選ばなかったIFの世界線
          </span>
        </h1>

        <p className="max-w-xl text-slate-400 text-sm md:text-base leading-relaxed mb-8">
          すべての岐路は、おにぎりの具材のように固有のエネルギーを宿しています。<br className="hidden sm:inline" />
          量子状態の重ね合わせから主世界線への収束を、美しく可視化・観測しましょう。
        </p>

        {authError && (
          <div className="mb-6 p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs max-w-md">
            {authError}
          </div>
        )}

        {/* コールトゥアクション（START MY LIFE） */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-14">
          {user ? (
            <button
              onClick={onOpenNewLife}
              className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-[0_0_35px_rgba(6,182,212,0.5)] transition duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-5 h-5 fill-slate-950 stroke-[2.5]" />
              <span className="tracking-wide">START MY LIFE</span>
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-[0_0_35px_rgba(6,182,212,0.5)] transition duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-5 h-5 fill-slate-950 stroke-[2.5]" />
              <span className="tracking-wide">Googleでログインして START</span>
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          )}
        </div>

        {/* 過去の人生一覧（ログイン時のみ表示） */}
        {user && (
          <div className="w-full max-w-3xl text-left bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-200">過去の人生の世界線</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 font-mono">
                  {lives.length}
                </span>
              </div>
              <button
                onClick={onOpenNewLife}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1"
              >
                <span>＋ 新規作成</span>
              </button>
            </div>

            {isLoadingLives ? (
              <div className="py-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span>世界線データを読み込み中...</span>
              </div>
            ) : lives.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-xs">
                <p className="mb-2">まだ記録された人生の世界線がありません。</p>
                <p className="text-slate-400">
                  「START MY LIFE」をクリックして、あなたの最初の決断を観測しましょう。
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {lives.map((life) => (
                  <div
                    key={life.id}
                    className="group relative flex items-center justify-between p-4 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/90 hover:border-cyan-500/50 transition duration-200"
                  >
                    <div
                      onClick={() => onResumeLife(life.id)}
                      className="flex-1 cursor-pointer pr-4"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-white group-hover:text-cyan-300 transition">
                          {life.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800 font-mono">
                          {life.totalQuanta} quantum
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mb-1.5">
                        原点: {life.initialTheme}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          更新: {new Date(life.updatedAt).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onResumeLife(life.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-950 hover:bg-cyan-900 border border-cyan-800/80 text-cyan-300 transition"
                      >
                        <span>世界線を再開</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteLife(life.id, life.title)}
                        className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-950/40 transition"
                        title="この世界線を削除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* フッター：退会・データ削除アクション & コピーライト */}
      <footer className="relative z-10 w-full max-w-4xl mx-auto px-6 py-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>
          <span>© 2026 Onigiri Quantum (Oni-Q) • Powered by Firebase</span>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenDeleteAccount}
              className="flex items-center gap-1.5 text-slate-500 hover:text-red-400 transition"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>アカウント連携解除・データ全削除（退会）</span>
            </button>
          </div>
        )}
      </footer>
    </div>
  );
};
