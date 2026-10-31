/**
 * @file src/components/TitleScreen.tsx
 * @description Oni-Q ポータル・タイトル画面（ローカル完結型アーキテクチャ）
 * - Firebase/Google認証UIを完全排除し、端末内localStorageで安全に稼働
 * - 「START MY LIFE」ボタンによる新規人生創成モーダルフロー（人生名 -> 最初の決断テーマ -> 初期ノード創成 -> 量子空間遷移）
 * - 過去の人生一覧表示＆ワンクリック再開（Resume）
 * - 端末内の「全データを初期化（リセット）」機能と確認モーダル
 */

import React, { useState } from 'react';
import { Life } from '../services/storageService';
import {
  Sparkles,
  Play,
  Clock,
  Trash2,
  AlertTriangle,
  RotateCcw,
  ChevronRight,
  Layers,
  ArrowRight,
  HardDrive,
  CheckCircle2,
  X,
} from 'lucide-react';

interface TitleScreenProps {
  lives: Life[];
  onOpenNewLife: () => void;
  onResumeLife: (lifeId: string) => void;
  onDeleteLife: (lifeId: string, title: string) => void;
  onClearAllData: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  lives,
  onOpenNewLife,
  onResumeLife,
  onDeleteLife,
  onClearAllData,
}) => {
  // 全データ消去（リセット）確認モーダルの開閉状態
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetInput, setResetInput] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);

  const handleConfirmReset = () => {
    if (resetInput.trim() !== 'リセット') {
      setResetError('確認のため「リセット」と正確に入力してください。');
      return;
    }
    setResetError(null);
    onClearAllData();
    setIsResetModalOpen(false);
    setResetInput('');
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

      {/* トップバー：ロゴ ＆ ローカル保存ステータス */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        {/* ロゴ */}
        <div className="flex items-center gap-3">
          {/* 偏光量子オーブ（2/3スケール楕円＋中央単一パルス円） */}
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

        {/* スタンドアロン・ローカルステータス表示 */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300 backdrop-blur-md shadow-inner">
          <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline text-slate-400">保存先:</span>
          <span className="font-mono text-cyan-300 text-[11px]">端末内ローカル保存</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
        </div>
      </header>

      {/* メインヒーローセクション */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-6 py-6 flex flex-col items-center text-center">
        {/* サブタイトルバッジ */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/80 text-cyan-300 text-xs mb-6 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
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
          外部通信を行わず、あなた自身の端末内で安全かつ自由に人生の分岐を可視化・観測します。
        </p>

        {/* コールトゥアクション（START MY LIFE） */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
          <button
            onClick={onOpenNewLife}
            className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-[0_0_35px_rgba(6,182,212,0.5)] transition duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="w-5 h-5 fill-slate-950 stroke-[2.5]" />
            <span className="tracking-wide">START MY LIFE</span>
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* 過去の人生一覧（localStorageから読み出し） */}
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
              <span>＋ 新しい世界線を創成</span>
            </button>
          </div>

          {lives.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs">
              <p className="mb-2">まだ記録された人生の世界線がありません。</p>
              <p className="text-slate-400">
                上の「START MY LIFE」をクリックして、最初の決断を観測しましょう。
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {lives.map((life) => (
                <div
                  key={life.id}
                  className="group relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/90 hover:border-cyan-500/50 transition duration-200 gap-3"
                >
                  <div
                    onClick={() => onResumeLife(life.id)}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-sm text-white group-hover:text-cyan-300 transition">
                        {life.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800 font-mono">
                        {life.totalQuanta} quantum
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mb-1.5">
                      原点テーマ: {life.initialTheme}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        更新: {new Date(life.updatedAt).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                    <button
                      onClick={() => onResumeLife(life.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-lg text-xs font-semibold bg-cyan-950 hover:bg-cyan-900 active:bg-cyan-800 border border-cyan-800/80 text-cyan-300 transition"
                    >
                      <span>世界線を再開</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteLife(life.id, life.title)}
                      className="p-2 text-slate-500 hover:text-red-400 active:text-red-300 rounded-lg hover:bg-red-950/40 transition"
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
      </main>

      {/* フッター：全データ初期化（リセット） ＆ コピーライト */}
      <footer className="relative z-10 w-full max-w-4xl mx-auto px-6 py-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div className="flex items-center gap-2">
          <span>© 2026 Onigiri Quantum (Oni-Q) • Local Storage Standalone Architecture</span>
        </div>

        <button
          onClick={() => {
            setResetError(null);
            setResetInput('');
            setIsResetModalOpen(true);
          }}
          className="flex items-center gap-1.5 text-slate-500 hover:text-red-400 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>全データを初期化（リセット）</span>
        </button>
      </footer>

      {/* 全データ初期化（リセット）確認モーダル */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-red-500/40 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(239,68,68,0.25)] text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsResetModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 警告ヘッダー */}
            <div className="flex items-center gap-3 mb-4 text-red-400">
              <div className="w-12 h-12 rounded-xl bg-red-950/80 border border-red-500/50 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-red-200">
                  端末内全データの完全消去
                </h2>
                <span className="text-[10px] text-red-400 uppercase tracking-widest font-mono">
                  LOCAL DATA RESET
                </span>
              </div>
            </div>

            {/* 説明文 */}
            <div className="space-y-3 mb-6 text-xs text-slate-300 leading-relaxed bg-red-950/30 border border-red-900/60 p-4 rounded-xl">
              <p className="font-semibold text-red-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                この操作は取り消すことができません。
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                <li>ブラウザの localStorage に保存されたすべての人生の世界線が削除されます。</li>
                <li>記録されたすべての量子ノード・決断ログが初期状態にリセットされます。</li>
              </ul>
            </div>

            {resetError && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs">
                {resetError}
              </div>
            )}

            {/* 確認入力 */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-slate-400 mb-2">
                確認のため、下に <span className="font-bold text-red-300">リセット</span> と入力してください：
              </label>
              <input
                type="text"
                value={resetInput}
                onChange={(e) => {
                  setResetInput(e.target.value);
                  setResetError(null);
                }}
                placeholder="リセット"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-red-900/60 focus:border-red-500 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500 transition"
              />
            </div>

            {/* ボタン群 */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={resetInput.trim() !== 'リセット'}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>全データを初期化する</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
