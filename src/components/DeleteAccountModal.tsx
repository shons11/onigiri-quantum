/**
 * @file src/components/DeleteAccountModal.tsx
 * @description アカウント連携解除・全データ物理削除（退会）確認モーダル
 */

import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (confirmText.trim() !== '退会') {
      setError('確認のため「退会」と正確に入力してください。');
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      await onConfirmDelete();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'アカウント削除処理中にエラーが発生しました。');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-red-500/40 rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(239,68,68,0.25)] text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 警告ヘッダー */}
        <div className="flex items-center gap-3 mb-4 text-red-400">
          <div className="w-12 h-12 rounded-xl bg-red-950/80 border border-red-500/50 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-red-200">
              アカウント連携解除・全データ削除
            </h2>
            <span className="text-[10px] text-red-400 uppercase tracking-widest font-mono">
              IRREVERSIBLE PURGE
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
            <li>Google アカウントとの連携を完全に解除します。</li>
            <li>Cloud Firestore 上に保存された、あなたのすべての人生の世界線・量子ノード・決断ログが完全に消去されます。</li>
            <li>Firebase Authentication アカウント自体が削除されます。</li>
          </ul>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs">
            {error}
          </div>
        )}

        {/* 確認入力 */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-slate-400 mb-2">
            確認のため、下に <span className="font-bold text-red-300">退会</span> と入力してください：
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => {
              setConfirmText(e.target.value);
              setError(null);
            }}
            placeholder="退会"
            disabled={isDeleting}
            className="w-full px-3.5 py-2.5 bg-slate-950 border border-red-900/60 focus:border-red-500 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500 transition"
          />
        </div>

        {/* ボタン群 */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={confirmText.trim() !== '退会' || isDeleting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? '削除処理中...' : '完全に削除して退会する'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
