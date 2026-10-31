/**
 * @file src/components/CosmicCanvas.tsx
 * @description 高解像度（HiDPI/Retina）宇宙空間キャンバス
 * ノードデザイン：美麗な「偏光量子オーブ（Polarized Quantum Orb）」
 * 複屈折偏光リング、多層ガラスシェル、生きた発光エネルギーコア、干渉縞
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { OnigiriNode, QuantumBranch, OnigiriFlavor } from '../types/quantum';

interface CosmicCanvasProps {
  nodes: OnigiriNode[];
  selectedNodeId: string | null;
  selectedBranchId: string | null;
  onSelectNode: (node: OnigiriNode) => void;
  onSelectBranch: (node: OnigiriNode, branch: QuantumBranch) => void;
  showCounterfactual: boolean;
  onOpenObservationModal: (node: OnigiriNode) => void;
}

// 偏光量子オーブの波長スペクトル・光学設定
export const ORB_SPECTRUM_CONFIG: Record<
  OnigiriFlavor,
  {
    name: string;
    coreColor: string;
    outerRingColor: string;
    innerRingColor: string;
    auraColor: string;
    highlightColor: string;
  }
> = {
  'classic-salt': {
    name: 'Pure Cyan（原点波長）',
    coreColor: '#38bdf8',
    outerRingColor: 'rgba(56, 189, 248, 0.85)',
    innerRingColor: 'rgba(125, 211, 252, 0.7)',
    auraColor: 'rgba(56, 189, 248, 0.5)',
    highlightColor: '#e0f2fe',
  },
  'salmon': {
    name: 'Crimson Shift（挑戦波長）',
    coreColor: '#fb7185',
    outerRingColor: 'rgba(251, 113, 133, 0.85)',
    innerRingColor: 'rgba(254, 205, 211, 0.7)',
    auraColor: 'rgba(251, 113, 133, 0.55)',
    highlightColor: '#ffe4e6',
  },
  'ume': {
    name: 'Ruby Singularity（核心意志）',
    coreColor: '#f43f5e',
    outerRingColor: 'rgba(244, 63, 94, 0.85)',
    innerRingColor: 'rgba(253, 164, 175, 0.7)',
    auraColor: 'rgba(244, 63, 94, 0.6)',
    highlightColor: '#fff1f2',
  },
  'tuna-mayo': {
    name: 'Solar Amber（好奇心波長）',
    coreColor: '#fbbf24',
    outerRingColor: 'rgba(251, 191, 36, 0.85)',
    innerRingColor: 'rgba(254, 240, 138, 0.7)',
    auraColor: 'rgba(251, 191, 36, 0.5)',
    highlightColor: '#fefce8',
  },
  'kombu': {
    name: 'Emerald Resonance（思索共鳴）',
    coreColor: '#10b981',
    outerRingColor: 'rgba(16, 185, 129, 0.85)',
    innerRingColor: 'rgba(167, 243, 208, 0.7)',
    auraColor: 'rgba(16, 185, 129, 0.5)',
    highlightColor: '#ecfdf5',
  },
  'ikura-gilded': {
    name: 'Auric Gold（祝祭転換）',
    coreColor: '#f59e0b',
    outerRingColor: 'rgba(245, 158, 11, 0.9)',
    innerRingColor: 'rgba(253, 224, 71, 0.75)',
    auraColor: 'rgba(245, 158, 11, 0.65)',
    highlightColor: '#fffbeb',
  },
  'cosmic-nori': {
    name: 'Void Violet（量子特異点）',
    coreColor: '#a855f7',
    outerRingColor: 'rgba(168, 85, 247, 0.9)',
    innerRingColor: 'rgba(216, 180, 254, 0.75)',
    auraColor: 'rgba(168, 85, 247, 0.6)',
    highlightColor: '#faf5ff',
  },
};

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  baseAlpha: number;
  color: string;
  isGlitter: boolean;
}

/**
 * 各量子のブランチ配置計算
 * - 選択肢が1つの場合：X軸方向に平行（offsetY = 0）
 * - 選択肢が複数（n個）の場合：その分岐の右側を n+1 等分する方向
 * - 作成順（branchIndex: 0 ~ totalBranches - 1）に上から配置
 */
export function getBranchLayout(
  nodeX: number,
  nodeY: number,
  branchIndex: number,
  totalBranches: number
) {
  const stepY = 80;
  const branchDistX = 180;

  if (totalBranches <= 1) {
    return {
      x: nodeX + branchDistX,
      y: nodeY,
      offsetY: 0,
    };
  }

  // (branchIndex - (totalBranches - 1) / 2) * stepY により、
  // branchIndex = 0 が最も上、totalBranches - 1 が最も下に配置される
  const offsetY = (branchIndex - (totalBranches - 1) / 2) * stepY;
  return {
    x: nodeX + branchDistX,
    y: nodeY + offsetY,
    offsetY,
  };
}

/**
 * 選択肢カード（一つの枠）のレイアウト計算
 * - 1行目：DECIDED または IF（または未確定確率）
 * - 2行目以降：選択詳細（1行12文字まで）
 * - 2行に収まらない場合は「…」で省略、クリック（展開）時は全文表示
 */
export function getBranchCardLayout(branch: QuantumBranch, isExpanded: boolean) {
  const maxChars = 12;
  const rawText = branch.label || '';
  const allLines: string[] = [];
  for (let i = 0; i < rawText.length; i += maxChars) {
    allLines.push(rawText.slice(i, i + maxChars));
  }

  let displayLines: string[] = [];
  let isTruncated = false;

  if (isExpanded) {
    displayLines = allLines.length > 0 ? allLines : [''];
  } else {
    if (allLines.length <= 2) {
      displayLines = allLines.length > 0 ? allLines : [''];
    } else {
      isTruncated = true;
      const line1 = allLines[0];
      let line2 = allLines[1];
      if (line2.length >= 10) {
        line2 = line2.slice(0, 9) + '…';
      } else {
        line2 = line2 + '…';
      }
      displayLines = [line1, line2];
    }
  }

  const cardW = 164;
  const padTop = 7;
  const headerH = 16;
  const gap = 5;
  const lineH = 15;
  const padBot = 7;
  const cardH = padTop + headerH + gap + displayLines.length * lineH + padBot;

  return {
    allLines,
    displayLines,
    isTruncated,
    cardW,
    cardH,
    padTop,
    headerH,
    gap,
    lineH,
  };
}

/**
 * 線が折り曲がりながら進むパスを描画
 * - Y変化がほぼ0（選択肢が1つ等）の場合は完全な水平直線（X軸に平行）
 * - Y変化がある場合は、ノードから水平に出た後に折り曲がり、目的の高さへ到達して水平に入る
 */
export function drawBendingPath(
  ctx: CanvasRenderingContext2D,
  xs: number,
  ys: number,
  xe: number,
  ye: number
) {
  ctx.beginPath();
  ctx.moveTo(xs, ys);
  const dy = ye - ys;
  const dx = xe - xs;

  if (Math.abs(dy) < 0.5) {
    ctx.lineTo(xe, ye);
  } else {
    const trunk = Math.min(45, dx * 0.25);
    const bendLen = Math.min(65, dx * 0.35);
    const x1 = xs + trunk;
    const x2 = x1 + bendLen;
    ctx.lineTo(x1, ys);
    ctx.bezierCurveTo(x1 + bendLen * 0.5, ys, x2 - bendLen * 0.5, ye, x2, ye);
    ctx.lineTo(xe, ye);
  }
}

/**
 * 折り曲がり線上の指定進行度 t (0.0 ~ 1.0) の座標を算出（光子アニメーション用）
 */
function getBendingPoint(
  xs: number,
  ys: number,
  xe: number,
  ye: number,
  t: number
): { x: number; y: number } {
  const dy = ye - ys;
  const dx = xe - xs;

  if (Math.abs(dy) < 0.5) {
    return { x: xs + t * dx, y: ys };
  }

  const trunk = Math.min(45, dx * 0.25);
  const bendLen = Math.min(65, dx * 0.35);
  const x1 = xs + trunk;
  const x2 = x1 + bendLen;

  const l1 = trunk;
  const l2 = Math.hypot(bendLen, dy);
  const l3 = Math.max(10, dx - trunk - bendLen);
  const totalL = l1 + l2 + l3;

  const t1 = l1 / totalL;
  const t2 = (l1 + l2) / totalL;

  if (t < t1) {
    const u = t / t1;
    return { x: xs + u * trunk, y: ys };
  } else if (t < t2) {
    const u = (t - t1) / (t2 - t1);
    const cx1 = x1 + bendLen * 0.5;
    const cy1 = ys;
    const cx2 = x2 - bendLen * 0.5;
    const cy2 = ye;
    const px =
      (1 - u) ** 3 * x1 +
      3 * (1 - u) ** 2 * u * cx1 +
      3 * (1 - u) * u ** 2 * cx2 +
      u ** 3 * x2;
    const py =
      (1 - u) ** 3 * ys +
      3 * (1 - u) ** 2 * u * cy1 +
      3 * (1 - u) * u ** 2 * cy2 +
      u ** 3 * ye;
    return { x: px, y: py };
  } else {
    const u = (t - t2) / (1 - t2);
    return { x: x2 + u * (xe - x2), y: ye };
  }
}

export const CosmicCanvas: React.FC<CosmicCanvasProps> = ({
  nodes,
  selectedNodeId,
  selectedBranchId,
  onSelectNode,
  onSelectBranch,
  showCounterfactual,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [camera, setCamera] = useState({ x: 120, y: 140, zoom: 0.95 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  const starsRef = useRef<Star[]>([]);

  useEffect(() => {
    const starColors = ['#ffffff', '#bae6fd', '#fbcfe8', '#e9d5ff', '#fed7aa', '#99f6e4'];
    const stars: Star[] = [];
    for (let i = 0; i < 550; i++) {
      const isGlitter = i % 16 === 0;
      stars.push({
        x: Math.random() * 4500 - 500,
        y: Math.random() * 3200 - 500,
        size: isGlitter ? Math.random() * 2.2 + 2.0 : Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.03 + 0.01,
        baseAlpha: Math.random() * 0.7 + 0.3,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        isGlitter,
      });
    }
    starsRef.current = stars;
  }, []);

  const nodeMap = useRef(new Map<string, OnigiriNode>());
  useEffect(() => {
    nodeMap.current.clear();
    nodes.forEach((n) => nodeMap.current.set(n.id, n));
  }, [nodes]);

  // 最新のカメラ状態を即時参照するRef
  const cameraRef = useRef(camera);
  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);

  // ノード・ブランチカードのヒットテスト共通処理（タッチ時は判定領域を拡大）
  const performHitTest = useCallback(
    (screenX: number, screenY: number, isTouch = false) => {
      const currentCam = cameraRef.current;
      const worldX = (screenX - currentCam.x) / currentCam.zoom;
      const worldY = (screenY - currentCam.y) / currentCam.zoom;

      // 1. ノード判定 (事実ボックスまたは量子オーブ)
      for (const node of nodes) {
        if (node.isFact) {
          const cardW = 164;
          const cardH = 56;
          const boxX = node.position.x - cardW / 2;
          const boxY = node.position.y - cardH / 2;
          const margin = isTouch ? 12 : 6;
          if (
            worldX >= boxX - margin &&
            worldX <= boxX + cardW + margin &&
            worldY >= boxY - margin &&
            worldY <= boxY + cardH + margin
          ) {
            onSelectNode(node);
            return true;
          }
        } else {
          const nodeTolerance = isTouch ? 50 : 38;
          const dx = worldX - node.position.x;
          const dy = worldY - node.position.y;
          if (Math.hypot(dx, dy) <= nodeTolerance) {
            onSelectNode(node);
            return true;
          }
        }
      }

      // 2. ブランチ（選択肢枠）判定 (タッチ時はマージンを広げる)
      const cardMargin = isTouch ? 10 : 6;
      for (const node of nodes) {
        const numBranches = node.branches.length;
        for (let k = 0; k < numBranches; k++) {
          const branch = node.branches[k];
          const branchPos = getBranchLayout(node.position.x, node.position.y, k, numBranches);
          const isBranchSelected = selectedBranchId === branch.id;
          const { cardW, cardH } = getBranchCardLayout(branch, isBranchSelected);
          const cardX = branchPos.x;
          const cardY = branchPos.y - cardH / 2;

          if (
            worldX >= cardX - cardMargin &&
            worldX <= cardX + cardW + cardMargin &&
            worldY >= cardY - cardMargin &&
            worldY <= cardY + cardH + cardMargin
          ) {
            onSelectBranch(node, branch);
            return true;
          }
        }
      }
      return false;
    },
    [nodes, onSelectNode, onSelectBranch, selectedBranchId]
  );

  // マウスドラッグ判定
  const hasMouseMovedRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) {
      stopMomentum();
      isDraggingRef.current = true;
      hasMouseMovedRef.current = false;
      dragStartRef.current = { x: e.clientX - camera.x, y: e.clientY - camera.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) {
      hasMouseMovedRef.current = true;
      const nextX = e.clientX - dragStartRef.current.x;
      const nextY = e.clientY - dragStartRef.current.y;
      setCamera((prev) => {
        const next = { ...prev, x: nextX, y: nextY };
        cameraRef.current = next;
        return next;
      });
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (hasMouseMovedRef.current) {
        hasMouseMovedRef.current = false;
        return;
      }
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const clickScreenX = e.clientX - rect.left;
      const clickScreenY = e.clientY - rect.top;
      performHitTest(clickScreenX, clickScreenY, false);
    },
    [performHitTest]
  );

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    stopMomentum();
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newZoom = Math.min(Math.max(camera.zoom * zoomFactor, 0.35), 2.5);

    const newX = mouseX - (mouseX - camera.x) * (newZoom / camera.zoom);
    const newY = mouseY - (mouseY - camera.y) * (newZoom / camera.zoom);

    const nextCamera = { x: newX, y: newY, zoom: newZoom };
    cameraRef.current = nextCamera;
    setCamera(nextCamera);
  };

  // -------------------------------------------------------------------------
  // スマートフォン・タブレット向けタッチ＆スワイプ＆ピンチズーム処理
  // -------------------------------------------------------------------------
  const touchStateRef = useRef<{
    mode: 'none' | 'pan' | 'pinch';
    startTime: number;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    hasMoved: boolean;
    // 慣性スワイプ速度
    vx: number;
    vy: number;
    lastTime: number;
    // ピンチズーム
    pinchStartDist: number;
    pinchStartZoom: number;
    pinchStartCenter: { x: number; y: number };
    pinchStartCamera: { x: number; y: number };
  }>({
    mode: 'none',
    startTime: 0,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    hasMoved: false,
    vx: 0,
    vy: 0,
    lastTime: 0,
    pinchStartDist: 0,
    pinchStartZoom: 1,
    pinchStartCenter: { x: 0, y: 0 },
    pinchStartCamera: { x: 0, y: 0 },
  });

  const momentumAnimRef = useRef<number | null>(null);

  const stopMomentum = useCallback(() => {
    if (momentumAnimRef.current !== null) {
      cancelAnimationFrame(momentumAnimRef.current);
      momentumAnimRef.current = null;
    }
  }, []);

  // ネイティブタッチイベント（iOS/Androidのページスクロール抑止＆高レスポンススワイプ）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onTouchStart = (e: TouchEvent) => {
      stopMomentum();

      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const clientX = touch.clientX - rect.left;
        const clientY = touch.clientY - rect.top;

        touchStateRef.current = {
          mode: 'pan',
          startTime: Date.now(),
          startX: clientX,
          startY: clientY,
          lastX: clientX,
          lastY: clientY,
          hasMoved: false,
          vx: 0,
          vy: 0,
          lastTime: performance.now(),
          pinchStartDist: 0,
          pinchStartZoom: cameraRef.current.zoom,
          pinchStartCenter: { x: 0, y: 0 },
          pinchStartCamera: { x: cameraRef.current.x, y: cameraRef.current.y },
        };
      } else if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const rect = canvas.getBoundingClientRect();
        const x1 = t1.clientX - rect.left;
        const y1 = t1.clientY - rect.top;
        const x2 = t2.clientX - rect.left;
        const y2 = t2.clientY - rect.top;

        const dist = Math.hypot(x2 - x1, y2 - y1);
        const center = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };

        touchStateRef.current = {
          mode: 'pinch',
          startTime: Date.now(),
          startX: center.x,
          startY: center.y,
          lastX: center.x,
          lastY: center.y,
          hasMoved: true,
          vx: 0,
          vy: 0,
          lastTime: performance.now(),
          pinchStartDist: Math.max(dist, 10),
          pinchStartZoom: cameraRef.current.zoom,
          pinchStartCenter: center,
          pinchStartCamera: { x: cameraRef.current.x, y: cameraRef.current.y },
        };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.cancelable) {
        e.preventDefault();
      }

      const state = touchStateRef.current;
      const now = performance.now();
      const dt = Math.max(now - state.lastTime, 1);

      if (e.touches.length === 1 && state.mode === 'pan') {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const clientX = touch.clientX - rect.left;
        const clientY = touch.clientY - rect.top;

        const dx = clientX - state.lastX;
        const dy = clientY - state.lastY;

        const totalDist = Math.hypot(clientX - state.startX, clientY - state.startY);
        if (totalDist > 6) {
          state.hasMoved = true;
        }

        const instantVx = dx / dt;
        const instantVy = dy / dt;
        state.vx = state.vx * 0.4 + instantVx * 0.6;
        state.vy = state.vy * 0.4 + instantVy * 0.6;

        state.lastX = clientX;
        state.lastY = clientY;
        state.lastTime = now;

        setCamera((prev) => {
          const next = { ...prev, x: prev.x + dx, y: prev.y + dy };
          cameraRef.current = next;
          return next;
        });
      } else if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const rect = canvas.getBoundingClientRect();
        const x1 = t1.clientX - rect.left;
        const y1 = t1.clientY - rect.top;
        const x2 = t2.clientX - rect.left;
        const y2 = t2.clientY - rect.top;

        const currentDist = Math.hypot(x2 - x1, y2 - y1);
        const currentCenter = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };

        if (state.mode !== 'pinch') {
          state.mode = 'pinch';
          state.pinchStartDist = Math.max(currentDist, 10);
          state.pinchStartZoom = cameraRef.current.zoom;
          state.pinchStartCenter = currentCenter;
          state.pinchStartCamera = { x: cameraRef.current.x, y: cameraRef.current.y };
          state.lastTime = now;
          return;
        }

        const scale = currentDist / state.pinchStartDist;
        const targetZoom = Math.min(Math.max(state.pinchStartZoom * scale, 0.35), 2.5);

        const worldCenterX = (state.pinchStartCenter.x - state.pinchStartCamera.x) / state.pinchStartZoom;
        const worldCenterY = (state.pinchStartCenter.y - state.pinchStartCamera.y) / state.pinchStartZoom;

        const newCameraX = currentCenter.x - worldCenterX * targetZoom;
        const newCameraY = currentCenter.y - worldCenterY * targetZoom;

        setCamera(() => {
          const next = { x: newCameraX, y: newCameraY, zoom: targetZoom };
          cameraRef.current = next;
          return next;
        });

        state.lastTime = now;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      const state = touchStateRef.current;

      if (e.touches.length === 0) {
        if (state.mode === 'pan' && !state.hasMoved && Date.now() - state.startTime < 350) {
          // タップ確定：ノードまたはブランチの選択
          performHitTest(state.startX, state.startY, true);
        } else if (state.mode === 'pan' && state.hasMoved) {
          // スワイプ終了：慣性スクロール（Momentum Glide）
          const speed = Math.hypot(state.vx, state.vy);
          if (speed > 0.12) {
            let curVx = Math.max(Math.min(state.vx * 15, 38), -38);
            let curVy = Math.max(Math.min(state.vy * 15, 38), -38);

            const step = () => {
              curVx *= 0.92;
              curVy *= 0.92;

              if (Math.hypot(curVx, curVy) < 0.2) {
                momentumAnimRef.current = null;
                return;
              }

              setCamera((prev) => {
                const next = {
                  ...prev,
                  x: prev.x + curVx,
                  y: prev.y + curVy,
                };
                cameraRef.current = next;
                return next;
              });

              momentumAnimRef.current = requestAnimationFrame(step);
            };

            momentumAnimRef.current = requestAnimationFrame(step);
          }
        }

        state.mode = 'none';
        state.hasMoved = false;
      } else if (e.touches.length === 1) {
        // 2本指から1本指に切り替わった場合
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const clientX = touch.clientX - rect.left;
        const clientY = touch.clientY - rect.top;

        state.mode = 'pan';
        state.lastX = clientX;
        state.lastY = clientY;
        state.startX = clientX;
        state.startY = clientY;
        state.hasMoved = true;
        state.vx = 0;
        state.vy = 0;
        state.lastTime = performance.now();
      }
    };

    const onTouchCancel = () => {
      touchStateRef.current.mode = 'none';
      touchStateRef.current.hasMoved = false;
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', onTouchCancel, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchCancel);
      stopMomentum();
    };
  }, [performHitTest, stopMomentum]);

  // 特定のノードまたは最新のノードへカメラを中心配置
  const focusOnNode = (targetNode?: OnigiriNode) => {
    const nodeToFocus =
      targetNode ||
      (selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : nodes[nodes.length - 1]);
    if (!nodeToFocus || !canvasRef.current) return;
    stopMomentum();
    const parentW = canvasRef.current.parentElement?.clientWidth || window.innerWidth;
    const parentH = canvasRef.current.parentElement?.clientHeight || window.innerHeight;
    const targetZoom = 1.0;
    const targetX = parentW / 2 - nodeToFocus.position.x * targetZoom;
    const targetY = parentH / 2 - nodeToFocus.position.y * targetZoom;
    const nextCam = { x: targetX, y: targetY, zoom: targetZoom };
    cameraRef.current = nextCam;
    setCamera(nextCam);
  };

  const drawSparkleCross = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    alpha: number,
    color: string
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.globalAlpha = alpha;

    ctx.beginPath();
    ctx.moveTo(-size * 3.5, 0);
    ctx.lineTo(size * 3.5, 0);
    ctx.moveTo(0, -size * 3.5);
    ctx.lineTo(0, size * 3.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 0.6;
    ctx.moveTo(-size * 1.5, -size * 1.5);
    ctx.lineTo(size * 1.5, size * 1.5);
    ctx.moveTo(size * 1.5, -size * 1.5);
    ctx.lineTo(-size * 1.5, size * 1.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, size * 0.9, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.restore();
  };

  // -------------------------------------------------------------------
  // ノードごとの固定ランダム表示角度算出（アニメーションなし・固定角度）
  // -------------------------------------------------------------------
  const getNodeFixedAngle = (node: OnigiriNode): number => {
    if (node.fixedAngle !== undefined) return node.fixedAngle;
    let hash = 0;
    for (let i = 0; i < node.id.length; i++) {
      hash = (hash << 5) - hash + node.id.charCodeAt(i);
      hash |= 0;
    }
    return (Math.abs(hash) % 360) * (Math.PI / 180);
  };

  // -------------------------------------------------------------------
  // 【事実 (Fact) ノードの描画】
  // 揺らぎ（選択肢）ボックスと同じ形状のネオングリーンバージョン
  // 未来の揺らぎエリアにある場合は点線、世界線上では実線
  // -------------------------------------------------------------------
  const drawFactBox = (
    ctx: CanvasRenderingContext2D,
    node: OnigiriNode,
    isSelected: boolean
  ) => {
    const cardW = 164;
    const cardH = 56;
    const boxX = node.position.x - cardW / 2;
    const boxY = node.position.y - cardH / 2;
    const isDashed = !!node.isFutureFluctuation; // 未来の揺らぎエリアにある場合は点線！

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, cardW, cardH, 8);

    // 背景: ネオングリーンダークスレート
    ctx.fillStyle = isSelected ? 'rgba(6, 78, 59, 0.95)' : 'rgba(4, 47, 46, 0.9)';
    ctx.fill();

    // 枠線: ネオングリーン
    ctx.strokeStyle = isSelected ? '#34d399' : '#10b981';
    ctx.lineWidth = isSelected ? 2.2 : 1.5;
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = isSelected ? 16 : 8;

    if (isDashed) {
      ctx.setLineDash([5, 4]); // 未来の揺らぎエリアにある場合は点線！
    } else {
      ctx.setLineDash([]); // 世界線上にある場合は実線！
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.setLineDash([]);

    // 1行目: [ FACT ] バッジ
    const badgeX = boxX + 8;
    const badgeY = boxY + 7;
    const badgeW = 44;
    const badgeH = 15;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
    ctx.fill();
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 8.5px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FACT', badgeX + badgeW / 2, badgeY + badgeH / 2);

    // カテゴリ表示
    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 8.5px "Space Grotesk", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`[${node.category.toUpperCase()}]`, boxX + cardW - 8, badgeY + badgeH / 2);

    // 2行目: 事実のタイトル
    ctx.font = '11px "Zen Kaku Gothic New", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ecfdf5';

    const titleText = node.title.length > 13 ? node.title.slice(0, 12) + '…' : node.title;
    ctx.fillText(titleText, boxX + 9, boxY + 38);

    ctx.restore();
  };

  // -------------------------------------------------------------------
  // 【偏光量子オーブ（Polarized Quantum Orb）の静止レンダリング】
  // - アニメーション完全撤廃（動く光子・粒子の削除）
  // - 楕円の軸が60度の角度で交わる状態で固定
  // - 二つの楕円の表示角度は量子ごとにランダムに固定変異
  // -------------------------------------------------------------------
  const drawPolarizedQuantumOrb = (
    ctx: CanvasRenderingContext2D,
    node: OnigiriNode,
    radius: number,
    isSelected: boolean,
    quantumMilestoneText?: string
  ) => {
    const config = ORB_SPECTRUM_CONFIG[node.flavor] || ORB_SPECTRUM_CONFIG['classic-salt'];
    const isSuperposed = node.state === 'superposition';
    const baseAngle = getNodeFixedAngle(node);

    ctx.save();
    ctx.translate(node.position.x, node.position.y);

    // 未確定（重ね合わせ）時の量子静止波動ハロー（アニメーションなし）
    if (isSuperposed) {
      const haloGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, radius * 1.55);
      haloGrad.addColorStop(0, 'rgba(168, 85, 247, 0.22)');
      haloGrad.addColorStop(0.7, 'rgba(236, 72, 153, 0.1)');
      haloGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.55, 0, Math.PI * 2);
      ctx.fill();

      // 確率干渉の静止点線リング（動かない）
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.25, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 選択ハイライト（ノード全体の選択表示）
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.45, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // ----------------------------------------------------
    // 1. 偏光軌道楕円 1（固定角度 baseAngle）
    // ----------------------------------------------------
    ctx.save();
    ctx.rotate(baseAngle);

    const ellipse1Rx = radius * 1.0;
    const ellipse1Ry = radius * (1 / 3);

    ctx.beginPath();
    ctx.ellipse(0, 0, ellipse1Rx, ellipse1Ry, 0, 0, Math.PI * 2);

    const prismGrad1 = ctx.createLinearGradient(-ellipse1Rx, -ellipse1Ry, ellipse1Rx, ellipse1Ry);
    if (isSuperposed) {
      prismGrad1.addColorStop(0, 'rgba(192, 132, 252, 0.85)');
      prismGrad1.addColorStop(0.5, 'rgba(244, 114, 182, 0.75)');
      prismGrad1.addColorStop(1, 'rgba(129, 140, 248, 0.85)');
    } else {
      prismGrad1.addColorStop(0, config.outerRingColor);
      prismGrad1.addColorStop(0.5, '#ffffff');
      prismGrad1.addColorStop(1, config.outerRingColor);
    }
    ctx.strokeStyle = prismGrad1;
    ctx.lineWidth = isSelected ? 2.0 : 1.5;
    ctx.shadowColor = config.coreColor;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.restore();

    // ----------------------------------------------------
    // 2. 偏光軌道楕円 2（60度の角度で固定交差 baseAngle + Math.PI / 3）
    // ----------------------------------------------------
    ctx.save();
    ctx.rotate(baseAngle + Math.PI / 3); // 60度の固定交差角

    const ellipse2Rx = radius * 0.9;
    const ellipse2Ry = radius * 0.28;

    ctx.beginPath();
    ctx.ellipse(0, 0, ellipse2Rx, ellipse2Ry, 0, 0, Math.PI * 2);

    const prismGrad2 = ctx.createLinearGradient(ellipse2Rx, -ellipse2Ry, -ellipse2Rx, ellipse2Ry);
    if (isSuperposed) {
      prismGrad2.addColorStop(0, 'rgba(244, 114, 182, 0.75)');
      prismGrad2.addColorStop(0.5, 'rgba(192, 132, 252, 0.85)');
      prismGrad2.addColorStop(1, 'rgba(56, 189, 248, 0.75)');
    } else {
      prismGrad2.addColorStop(0, config.innerRingColor);
      prismGrad2.addColorStop(0.5, '#ffffff');
      prismGrad2.addColorStop(1, config.innerRingColor);
    }
    ctx.strokeStyle = prismGrad2;
    ctx.lineWidth = isSelected ? 1.8 : 1.3;
    ctx.stroke();
    ctx.restore();

    // ----------------------------------------------------
    // 3. 中心に固定された単一の円（脈動アニメーションなし）
    // ----------------------------------------------------
    ctx.save();
    const coreR = 7.5; // 固定サイズ

    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.5, isSuperposed ? '#fbcfe8' : config.highlightColor);
    coreGrad.addColorStop(0.9, isSuperposed ? '#c084fc' : config.coreColor);
    coreGrad.addColorStop(1, isSuperposed ? '#9333ea' : config.coreColor);

    ctx.beginPath();
    ctx.arc(0, 0, coreR, 0, Math.PI * 2);
    ctx.fillStyle = coreGrad;
    ctx.shadowColor = isSuperposed ? '#c084fc' : config.coreColor;
    ctx.shadowBlur = isSelected ? 14 : 8;
    ctx.fill();
    ctx.restore();

    // ----------------------------------------------------
    // 4. 10quantumごとのマイルストーンバッジ表示
    // ----------------------------------------------------
    if (quantumMilestoneText) {
      ctx.beginPath();
      ctx.roundRect(-30, radius * 1.15, 60, 18, 9);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(quantumMilestoneText, 0, radius * 1.15 + 9);
    }

    ctx.restore();
  };

  // メイン描画ループ
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    const render = () => {
      if (!isMounted) return;
      timeRef.current += 0.016;
      const time = timeRef.current;

      const parentW = canvas.parentElement?.clientWidth || window.innerWidth;
      const parentH = canvas.parentElement?.clientHeight || window.innerHeight;

      const dpr = window.devicePixelRatio || 1;
      const targetW = Math.floor(parentW * dpr);
      const targetH = Math.floor(parentH * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, parentW, parentH);

      // 1. 深宇宙・多層ネビュラ背景（静止描画）
      const baseGrad = ctx.createLinearGradient(0, 0, parentW, parentH);
      baseGrad.addColorStop(0, '#060814');
      baseGrad.addColorStop(0.5, '#03050c');
      baseGrad.addColorStop(1, '#010206');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, parentW, parentH);

      const neb1 = ctx.createRadialGradient(
        parentW * 0.25,
        parentH * 0.35,
        40,
        parentW * 0.25,
        parentH * 0.35,
        parentW * 0.7
      );
      neb1.addColorStop(0, 'rgba(88, 28, 135, 0.22)');
      neb1.addColorStop(0.5, 'rgba(126, 34, 206, 0.08)');
      neb1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = neb1;
      ctx.fillRect(0, 0, parentW, parentH);

      const neb2 = ctx.createRadialGradient(
        parentW * 0.75,
        parentH * 0.65,
        60,
        parentW * 0.75,
        parentH * 0.65,
        parentW * 0.65
      );
      neb2.addColorStop(0, 'rgba(6, 182, 212, 0.2)');
      neb2.addColorStop(0.6, 'rgba(14, 116, 144, 0.06)');
      neb2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = neb2;
      ctx.fillRect(0, 0, parentW, parentH);

      // カメラ適用
      ctx.save();
      ctx.translate(camera.x, camera.y);
      ctx.scale(camera.zoom, camera.zoom);

      // 量子時空グリッド
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.28)';
      ctx.lineWidth = 0.8;
      const gridSize = 140;
      const startX = -camera.x / camera.zoom - 300;
      const endX = (parentW - camera.x) / camera.zoom + 300;
      const startY = -camera.y / camera.zoom - 300;
      const endY = (parentH - camera.y) / camera.zoom + 300;

      for (let gx = Math.floor(startX / gridSize) * gridSize; gx <= endX; gx += gridSize) {
        ctx.beginPath();
        ctx.moveTo(gx, startY);
        ctx.lineTo(gx, endY);
        ctx.stroke();
      }
      for (let gy = Math.floor(startY / gridSize) * gridSize; gy <= endY; gy += gridSize) {
        ctx.beginPath();
        ctx.moveTo(startX, gy);
        ctx.lineTo(endX, gy);
        ctx.stroke();
      }

      // 静止星屑＆十字光条（アニメーションなし）
      for (const star of starsRef.current) {
        const currentAlpha = star.baseAlpha * 0.85;

        if (star.isGlitter) {
          drawSparkleCross(ctx, star.x, star.y, star.size, currentAlpha, star.color);
        } else {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.globalAlpha = currentAlpha;
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      }

      // 1.5. 未来の揺らぎ（未接続量子/事実）エリアの描画
      const futureNodes = nodes.filter((n) => n.isFutureFluctuation);
      if (futureNodes.length > 0) {
        ctx.save();
        const minX = Math.min(...futureNodes.map((n) => n.position.x)) - 60;
        const maxX = Math.max(...futureNodes.map((n) => n.position.x + 360)) + 60;
        const areaY = Math.min(...futureNodes.map((n) => n.position.y)) - 65;
        const areaH = 220;

        ctx.beginPath();
        ctx.roundRect(minX, areaY, Math.max(maxX - minX, 480), areaH, 18);
        ctx.fillStyle = 'rgba(88, 28, 135, 0.12)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([6, 6]);
        ctx.stroke();

        ctx.font = 'bold 11px "Space Grotesk", sans-serif';
        ctx.fillStyle = 'rgba(216, 180, 254, 0.85)';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('✦ 未来の揺らぎ（未接続の浮遊量子・事実プール）', minX + 16, areaY + 12);
        ctx.restore();
      }

      // 2. 世界線（エッジ：親ノードから子ノードへの接続、量子・事実両対応、光子アニメーションなし）
      for (const node of nodes) {
        if (!node.parentId) continue;
        const parent = nodeMap.current.get(node.parentId);
        if (!parent) continue;

        const cardW = 164;
        const isChildSuperposed = node.state === 'superposition' && !node.isFact;
        const isParentSuperposed = parent.state === 'superposition' && !parent.isFact;

        // 始点リスト (startPoints)
        const startPoints: { x: number; y: number }[] = [];

        if (parent.isFact) {
          // 事実ノードからは右端中央から接続が出る
          startPoints.push({ x: parent.position.x + cardW / 2, y: parent.position.y });
        } else if (isParentSuperposed) {
          // 親が重ね合わせ状態の場合：すべての枝から出る
          const numBranches = parent.branches.length;
          if (numBranches === 0) {
            startPoints.push({ x: parent.position.x, y: parent.position.y });
          } else {
            for (let k = 0; k < numBranches; k++) {
              const bPos = getBranchLayout(parent.position.x, parent.position.y, k, numBranches);
              startPoints.push({ x: bPos.x + cardW, y: bPos.y });
            }
          }
        } else {
          // 親が確定状態の場合：採択された DECIDED 枝から出る
          const numBranches = parent.branches.length;
          let actualizedIdx = parent.branches.findIndex((b) => b.id === parent.actualizedBranchId);
          if (actualizedIdx === -1) actualizedIdx = 0;
          if (numBranches > 0) {
            const branchPos = getBranchLayout(parent.position.x, parent.position.y, actualizedIdx, numBranches);
            startPoints.push({ x: branchPos.x + cardW, y: branchPos.y });
          } else {
            startPoints.push({ x: parent.position.x, y: parent.position.y });
          }
        }

        // 終点 (endX, endY)
        const endX = node.isFact ? node.position.x - cardW / 2 : node.position.x;
        const endY = node.position.y;

        for (const sp of startPoints) {
          ctx.save();
          ctx.beginPath();
          drawBendingPath(ctx, sp.x, sp.y, endX, endY);

          if (isParentSuperposed || isChildSuperposed) {
            // 未確定の点線（アニメーションなし・静止した点線）
            ctx.strokeStyle = 'rgba(192, 132, 252, 0.8)';
            ctx.lineWidth = 2.2;
            ctx.setLineDash([6, 5]);
            ctx.shadowColor = '#c084fc';
            ctx.shadowBlur = 6;
            ctx.stroke();
          } else {
            // 確定実線（事実関連はネオングリーン、その他はシアン。動く白い球なし）
            const isGreenLine = parent.isFact || node.isFact;
            ctx.strokeStyle = isGreenLine ? 'rgba(16, 185, 129, 0.25)' : 'rgba(56, 189, 248, 0.25)';
            ctx.lineWidth = 8;
            ctx.shadowColor = isGreenLine ? '#10b981' : '#0284c7';
            ctx.shadowBlur = 12;
            ctx.stroke();

            ctx.strokeStyle = isGreenLine ? '#10b981' : '#38bdf8';
            ctx.lineWidth = 3.2;
            ctx.shadowBlur = 4;
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      // 3. 各量子の選択肢（ブランチ）の描画：一つの枠内に一行目DECIDED/IF、二行目に選択詳細（1行12文字まで）
      for (const node of nodes) {
        if (node.isFact) continue; // 事実ノードは独自のボックス描画を行うためブランチなし
        const numBranches = node.branches.length;

        node.branches.forEach((branch, k) => {
          const branchPos = getBranchLayout(node.position.x, node.position.y, k, numBranches);
          const isBranchSelected = selectedBranchId === branch.id;
          const isCounterfactual = branch.status === 'counterfactual';
          const isActualized = branch.status === 'actualized';

          const layout = getBranchCardLayout(branch, isBranchSelected);
          const { cardW, cardH, displayLines, isTruncated, padTop, headerH, gap, lineH } = layout;
          const cardX = branchPos.x;
          const cardY = branchPos.y - cardH / 2;

          // 親ノードからこの枠の左端への屈曲接続線を描画（アニメーションなし、静止描画）
          ctx.save();
          drawBendingPath(ctx, node.position.x, node.position.y, cardX, branchPos.y);

          if (isCounterfactual) {
            ctx.strokeStyle = isBranchSelected
              ? 'rgba(244, 63, 94, 0.9)'
              : 'rgba(148, 163, 184, 0.4)';
            ctx.lineWidth = isBranchSelected ? 2.5 : 1.5;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
          } else if (isActualized) {
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 3.2;
            ctx.shadowColor = '#0284c7';
            ctx.shadowBlur = 10;
            ctx.stroke();
          } else {
            ctx.strokeStyle = isBranchSelected
              ? 'rgba(192, 132, 252, 0.95)'
              : 'rgba(168, 85, 247, 0.6)';
            ctx.lineWidth = isBranchSelected ? 2.5 : 1.6;
            ctx.setLineDash([6, 5]);
            ctx.shadowColor = '#a855f7';
            ctx.shadowBlur = 8;
            ctx.stroke();
          }
          ctx.restore();

          // -----------------------------------------------------------------
          // 一つの枠（カード）本体の描画
          // -----------------------------------------------------------------
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(cardX, cardY, cardW, cardH, 8);

          if (isActualized) {
            // DECIDED枠
            ctx.fillStyle = isBranchSelected ? 'rgba(8, 47, 73, 0.95)' : 'rgba(8, 30, 50, 0.88)';
            ctx.fill();
            ctx.strokeStyle = isBranchSelected ? '#38bdf8' : 'rgba(56, 189, 248, 0.75)';
            ctx.lineWidth = isBranchSelected ? 2 : 1.2;
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = isBranchSelected ? 16 : 8;
            ctx.stroke();
          } else if (isCounterfactual) {
            // IF枠
            ctx.fillStyle = isBranchSelected ? 'rgba(76, 5, 25, 0.95)' : 'rgba(30, 20, 30, 0.85)';
            ctx.fill();
            ctx.strokeStyle = isBranchSelected ? '#fb7185' : 'rgba(244, 63, 94, 0.55)';
            ctx.lineWidth = isBranchSelected ? 2 : 1.2;
            ctx.shadowColor = '#f43f5e';
            ctx.shadowBlur = isBranchSelected ? 14 : 6;
            ctx.stroke();
          } else {
            // 重ね合わせ枠
            ctx.fillStyle = isBranchSelected ? 'rgba(59, 7, 100, 0.95)' : 'rgba(25, 15, 45, 0.85)';
            ctx.fill();
            ctx.strokeStyle = isBranchSelected ? '#c084fc' : 'rgba(168, 85, 247, 0.55)';
            ctx.lineWidth = isBranchSelected ? 2 : 1.2;
            ctx.shadowColor = '#a855f7';
            ctx.shadowBlur = isBranchSelected ? 14 : 6;
            ctx.stroke();
          }

          // 1行目：DECIDED / IF / 可能性 の表示
          const headerCenterY = cardY + padTop + headerH / 2;
          const badgeX = cardX + 8;
          const badgeW = isActualized ? 60 : isCounterfactual ? 28 : 42;
          const badgeH = 15;

          ctx.beginPath();
          ctx.roundRect(badgeX, cardY + padTop, badgeW, badgeH, 4);

          if (isActualized) {
            ctx.fillStyle = 'rgba(6, 182, 212, 0.35)';
            ctx.fill();
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 8.5px "Space Grotesk", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('DECIDED', badgeX + badgeW / 2, headerCenterY);
          } else if (isCounterfactual) {
            ctx.fillStyle = 'rgba(244, 63, 94, 0.3)';
            ctx.fill();
            ctx.strokeStyle = '#fb7185';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = '#fecdd3';
            ctx.font = 'bold 8.5px "Space Grotesk", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('IF', badgeX + badgeW / 2, headerCenterY);
          } else {
            ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
            ctx.fill();
            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 1;
            ctx.stroke();

            const pct = Math.round(branch.probabilityAmplitude * 100);
            ctx.fillStyle = '#e9d5ff';
            ctx.font = 'bold 8px "Space Grotesk", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${pct}%`, badgeX + badgeW / 2, headerCenterY);
          }

          // クリック展開時のステータス表示
          if (isBranchSelected && layout.allLines.length > 2) {
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 8px "Space Grotesk", sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText('全文表示中', cardX + cardW - 8, headerCenterY);
          } else if (isTruncated) {
            ctx.fillStyle = '#64748b';
            ctx.font = 'bold 8px "Space Grotesk", sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText('クリックで全文', cardX + cardW - 8, headerCenterY);
          }

          // 2行目以降：選択の詳細（1行12文字まで）
          ctx.font = '11px "Zen Kaku Gothic New", sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = isActualized ? '#f0f9ff' : isCounterfactual ? '#cbd5e1' : '#f5f3ff';

          const textStartY = cardY + padTop + headerH + gap + lineH / 2;
          displayLines.forEach((line, idx) => {
            ctx.fillText(line, cardX + 9, textStartY + idx * lineH);
          });

          ctx.restore();
        });
      }

      // 4. ノード本体の描画（偏光量子オーブ or 事実ネオングリーンボックス）
      let observedCounter = 0;
      for (const node of nodes) {
        const isSelected = selectedNodeId === node.id;
        const radius = 28; // コアオーブ半径

        if (node.isFact) {
          // 事実（FACT）ノードの描画
          drawFactBox(ctx, node, isSelected);

          if (node.isFutureFluctuation) {
            ctx.save();
            ctx.font = 'bold 9.5px "Space Grotesk", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillStyle = '#34d399';
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 8;
            ctx.fillText('✦ 未来の揺らぎ（事実）', node.position.x, node.position.y - 34);
            ctx.restore();
          }
        } else {
          // 量子（QUANTUM）オーブの描画
          let milestoneText: string | undefined = undefined;
          if (node.state === 'observed') {
            observedCounter++;
            if (observedCounter % 10 === 0) {
              milestoneText = `${observedCounter}quantum`;
            }
          }

          drawPolarizedQuantumOrb(
            ctx,
            node,
            radius,
            isSelected,
            milestoneText
          );

          // 未来の揺らぎノードの頭上バッジ
          if (node.isFutureFluctuation) {
            ctx.save();
            ctx.font = 'bold 9.5px "Space Grotesk", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillStyle = '#c084fc';
            ctx.shadowColor = '#a855f7';
            ctx.shadowBlur = 8;
            ctx.fillText('✦ 未来の揺らぎ', node.position.x, node.position.y - 34);
            ctx.restore();
          }

          // ノード名ラベル
          ctx.save();
          ctx.font = 'bold 12.5px "Zen Kaku Gothic New", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillStyle = isSelected ? '#38bdf8' : '#f8fafc';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
          ctx.shadowBlur = 8;
          ctx.fillText(node.title, node.position.x, node.position.y + 46);

          // カテゴリバッジ
          ctx.font = 'bold 10px "Space Grotesk", sans-serif';
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(`[${node.category.toUpperCase()}]`, node.position.x, node.position.y + 64);

          ctx.restore();
        }
      }

      ctx.restore();
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isMounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [nodes, camera, selectedNodeId, selectedBranchId, showCounterfactual]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#020307] touch-none">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ touchAction: 'none' }}
        className="w-full h-full cursor-grab active:cursor-grabbing block touch-none"
      />

      {/* スマホ・タブレット向けタッチ操作ヒントバッジ */}
      <div className="absolute top-4 left-4 flex md:hidden items-center gap-1.5 px-3 py-1.5 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-full text-[11px] font-mono text-cyan-300 pointer-events-none z-10 shadow-lg animate-in fade-in duration-300">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span>1本指スワイプ: 移動</span>
        <span className="text-slate-600">|</span>
        <span>2本指: 拡大縮小</span>
      </div>

      {/* 画面内クイック操作コントローラー（スマホ・タブレットのタッチに最適化） */}
      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex items-center gap-1 sm:gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-700/60 shadow-[0_0_25px_rgba(0,0,0,0.7)] text-xs text-slate-300 z-10 touch-auto">
        <button
          onClick={() => {
            stopMomentum();
            setCamera((c) => {
              const next = { ...c, zoom: Math.min(c.zoom * 1.2, 2.5) };
              cameraRef.current = next;
              return next;
            });
          }}
          className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center hover:bg-slate-800 active:bg-slate-700 rounded-lg transition font-mono font-bold text-slate-200 text-sm"
          title="拡大"
          aria-label="拡大"
        >
          ＋
        </button>
        <span className="font-mono text-cyan-400 min-w-[2.8rem] sm:min-w-[3.2rem] text-center font-bold text-xs">
          {Math.round(camera.zoom * 100)}%
        </span>
        <button
          onClick={() => {
            stopMomentum();
            setCamera((c) => {
              const next = { ...c, zoom: Math.max(c.zoom * 0.8, 0.35) };
              cameraRef.current = next;
              return next;
            });
          }}
          className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center hover:bg-slate-800 active:bg-slate-700 rounded-lg transition font-mono font-bold text-slate-200 text-sm"
          title="縮小"
          aria-label="縮小"
        >
          −
        </button>
        <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />
        <button
          onClick={() => {
            stopMomentum();
            const resetCam = { x: 120, y: 140, zoom: 0.95 };
            cameraRef.current = resetCam;
            setCamera(resetCam);
          }}
          className="px-2.5 py-1.5 hover:bg-slate-800 active:bg-slate-700 rounded-lg transition text-slate-300 hover:text-white text-xs whitespace-nowrap"
        >
          全体
        </button>
        {nodes.length > 0 && (
          <button
            onClick={() => focusOnNode()}
            className="px-2.5 py-1.5 hover:bg-cyan-950/70 active:bg-cyan-900 rounded-lg transition text-cyan-300 border border-cyan-800/60 text-xs whitespace-nowrap font-medium"
            title="選択中または最新の量子へジャンプ"
          >
            現在地
          </button>
        )}
      </div>

      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-950/70 backdrop-blur-md border border-slate-800 rounded-xl text-[11px] font-mono text-slate-400">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span>Quantum Node: Polarized Quantum Orb</span>
      </div>
    </div>
  );
};
