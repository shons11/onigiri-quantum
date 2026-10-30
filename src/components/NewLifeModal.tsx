/**
 * @file src/components/NewLifeModal.tsx
 * @description 新しい人生の世界線を開始するモーダル
 * 「人生の名前」と「最初の決断のテーマ」を入力して初期量子ノードを創成
 */

import React, { useState } from 'react';
import { Sparkles, X, Compass, ChevronRight, Lightbulb } from 'lucide-react';

interface NewLifeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (
    title: string,
    initialTheme: string,
    branches: { label: string; description: string }[]
  ) => Promise<void>;
}

const PRESET_THEMES = [
  { title: 'キャリアの躍進編', theme: '大学卒業・ファーストキャリアの分岐点' },
  { title: '独立と挑戦の世界線', theme: '安定企業に留まるか、起業・独立へ踏み出すか' },
  { title: 'ライフスタイル再定義', theme: '都市定住か、地方移住・二拠点生活か' },
  { title: '創作と探求の人生', theme: '自身の作品を世界へ問うか、技術の蓄積を優先するか' },
];

export const NewLifeModal: React.FC<NewLifeModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [initialTheme, setInitialTheme] = useState('');
  const [branch1, setBranch1] = useState('未知の可能性へ踏み出す道');
  const [branch2, setBranch2] = useState('盤石な基盤を深める道');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('人生の名前を入力してください。');
      return;
    }
    if (!initialTheme.trim()) {
      setError('最初の決断のテーマを入力してください。');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onCreate(title.trim(), initialTheme.trim(), [
        { label: branch1.trim() || '選択肢 A', description: '' },
        { label: branch2.trim() || '選択肢 B', description: '' },
      ]);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('人生の作成に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyPreset = (presetTitle: string, presetTheme: string) => {
    setTitle(presetTitle);
    setInitialTheme(presetTheme);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* クローズボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ヘッダー */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>新しい人生の世界線を創成</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                NEW LIFE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              あなたの決断の軌跡を記録する新たな世界線を立ち上げます
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. 人生の名前 */}
          <div>
            <label className="block text-xs font-semibold text-cyan-300 mb-1.5">
              1. 人生の名前 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 挑戦の人生、キャリア編、第二の青春"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              required
              autoFocus
            />
          </div>

          {/* 2. 最初の決断のテーマ */}
          <div>
            <label className="block text-xs font-semibold text-cyan-300 mb-1.5">
              2. 最初の決断のテーマ（原点となる問い） <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={initialTheme}
              onChange={(e) => setInitialTheme(e.target.value)}
              placeholder="例: 大学卒業後の進路決定、転職か独立か"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              required
            />
          </div>

          {/* プリセット選択肢 */}
          <div>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              テーマのヒント・プリセットから選ぶ:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {PRESET_THEMES.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p.title, p.theme)}
                  className="text-left px-2.5 py-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-cyan-700/60 text-slate-300 text-[11px] truncate transition"
                >
                  <span className="font-semibold text-cyan-300">{p.title}</span>
                  <span className="block text-slate-400 truncate">{p.theme}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. 最初の選択肢 (2つ) */}
          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              最初の重ね合わせ選択肢（後から追加・変更可能）
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-400 px-2 py-1 bg-slate-950 border border-slate-800 rounded">
                  A
                </span>
                <input
                  type="text"
                  value={branch1}
                  onChange={(e) => setBranch1(e.target.value)}
                  placeholder="選択肢 A"
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyan-400 px-2 py-1 bg-slate-950 border border-slate-800 rounded">
                  B
                </span>
                <input
                  type="text"
                  value={branch2}
                  onChange={(e) => setBranch2(e.target.value)}
                  placeholder="選択肢 B"
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 transition"
            >
              {isSubmitting ? (
                <span>世界線を創成中...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>世界線を創成する (START)</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
