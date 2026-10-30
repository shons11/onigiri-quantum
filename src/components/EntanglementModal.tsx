/**
 * @file src/components/EntanglementModal.tsx
 * @description マルチパーソン・コンバージェンス（他者世界線との量子もつれ・合流）シミュレーション
 */

import React, { useState } from 'react';
import { QuantumEntanglement } from '../types/quantum';
import { X, Users, Sparkles, Heart, Briefcase, UserPlus, Link2 } from 'lucide-react';

interface EntanglementModalProps {
  entanglements: QuantumEntanglement[];
  onClose: () => void;
  onAddEntanglement: (targetUser: string, eventType: any, label: string) => void;
}

export const EntanglementModal: React.FC<EntanglementModalProps> = ({
  entanglements,
  onClose,
  onAddEntanglement,
}) => {
  const [targetUser, setTargetUser] = useState('');
  const [eventType, setEventType] = useState<'encounter' | 'collaboration' | 'partnership'>('collaboration');
  const [label, setLabel] = useState('');

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser.trim() || !label.trim()) return;
    onAddEntanglement(targetUser.trim(), eventType, label.trim());
    setTargetUser('');
    setLabel('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* ヘッダー */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">量子合流（Multi-person Convergence）</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  Entanglement
                </span>
              </div>
              <p className="text-xs text-slate-400">
                他者の世界線との出会い、協業、結びつきによる世界線の交差記録
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

        <div className="p-5 space-y-6">
          {/* コンセプト説明 */}
          <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-pink-950/20 border border-purple-800/40 p-4 rounded-2xl text-xs text-purple-200 leading-relaxed">
            <span className="font-bold text-white block mb-1">
              思想：人生の交差（量子エンタングルメント）
            </span>
            人間は孤立した量子系ではありません。誰かと出会い、共にプロジェクトを創り、あるいは人生を歩む決断をするとき、個別の世界線は絡み合い、一つの新たな相関状態へと突入します。
          </div>

          {/* 準備中 表示 */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs font-semibold text-slate-200">マルチパーソン・コンバージェンス機能</span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-600/50 text-amber-300 font-mono font-bold tracking-wider">
              準備中
            </span>
          </div>

          {/* 既存の合流記録 */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-2.5">
              記録されている量子合流ポイント:
            </h4>
            <div className="space-y-2.5">
              {entanglements.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-start gap-3"
                >
                  <div className="p-2 rounded-lg bg-purple-950/70 text-purple-400 border border-purple-800/60 mt-0.5">
                    {item.eventType === 'collaboration' ? (
                      <Briefcase className="w-4 h-4" />
                    ) : item.eventType === 'partnership' ? (
                      <Heart className="w-4 h-4" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{item.convergenceLabel}</span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {new Date(item.entangledAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
                      <Link2 className="w-3 h-3 text-cyan-400" />
                      <span>交差対象: {item.targetUserId}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 新たな量子合流のシミュレーション登録 */}
          <form onSubmit={handleConnect} className="bg-slate-950/40 p-4 rounded-2xl border border-slate-800 space-y-3.5">
            <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>新たな合流イベントを記録（シミュレーション）</span>
            </h4>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">交差相手（ユーザー名 / 役割）:</label>
              <input
                type="text"
                required
                placeholder="例: パートナー (佐藤), メンター (田中教授)"
                value={targetUser}
                onChange={(e) => setTargetUser(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">関係性タイプ:</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="collaboration">共同創業・協業 (Collaboration)</option>
                  <option value="partnership">生涯の伴侶・結婚 (Partnership)</option>
                  <option value="encounter">決定的な出会い (Encounter)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">合流イベント名:</label>
                <input
                  type="text"
                  required
                  placeholder="例: 新法人共同登記"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>世界線をエンタングル（合流）させる</span>
            </button>
          </form>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl transition"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
