"use client";

import { useEffect, useState } from "react";

interface PixelIconProps {
  color: string;
  size?: number;
}

export function PixelHeart({ color, size = 14 }: PixelIconProps) {
  // Chunkier 5x4 grid — reads better at small sizes
  const grid = [
    [0,1,0,1,0],
    [1,1,1,1,1],
    [0,1,1,1,0],
    [0,0,1,0,0],
  ];
  const cols = 5, rows = 4;
  return (
    <svg width={size} height={size * rows / cols} viewBox={`0 0 ${cols} ${rows}`} style={{ imageRendering: "pixelated", display: "block" }}>
      {grid.flatMap((row, y) => row.map((on, x) => on ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} /> : null))}
    </svg>
  );
}

export function PixelThumbsUp({ color, size = 14 }: PixelIconProps) {
  // Thumb: 2 wide x 3 tall (top right), Fist: 4 wide x 5 tall (bottom)
  const grid = [
    [0,0,1,1],  // thumb row 1
    [0,0,1,1],  // thumb row 2
    [0,0,1,1],  // thumb row 3
    [1,1,1,1],  // fist row 1
    [1,1,1,1],  // fist row 2
    [1,1,1,1],  // fist row 3
    [1,1,1,1],  // fist row 4
    [1,1,1,1],  // fist row 5
  ];
  const cols = 4, rows = 8;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${cols} ${rows}`} style={{ imageRendering: "pixelated", display: "block" }}>
      {grid.flatMap((row, y) => row.map((on, x) => on ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} /> : null))}
    </svg>
  );
}

export function PixelReaction({ type, color, size = 14 }: { type: "heart" | "thumbsup"; color: string; size?: number }) {
  return type === "heart" ? <PixelHeart color={color} size={size} /> : <PixelThumbsUp color={color} size={size} />;
}

// Animated build-up version — pixels appear one at a time
export function PixelReactionAnimated({ type, color, size = 40 }: { type: "heart" | "thumbsup"; color: string; size?: number }) {
  const heartGrid = [
    [0,1,1,0,1,1,0],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [0,1,1,1,1,1,0],
    [0,0,1,1,1,0,0],
    [0,0,0,1,0,0,0],
  ];
  const thumbGrid = [
    [0,0,1,1],
    [0,0,1,1],
    [0,0,1,1],
    [1,1,1,1],
    [1,1,1,1],
    [1,1,1,1],
    [1,1,1,1],
    [1,1,1,1],
  ];

  const grid = type === "heart" ? heartGrid : thumbGrid;
  const cols = 7;
  const rows = grid.length;

  // Collect all pixel positions in a random order
  const allPixels: { x: number; y: number }[] = [];
  grid.forEach((row, y) => row.forEach((on, x) => { if (on) allPixels.push({ x, y }); }));

  // Shuffle for random build-up order
  const shuffled = [...allPixels].sort(() => Math.random() - 0.5);

  const [visibleCount, setVisibleCount] = useState(0);
  const visibleSet = new Set(shuffled.slice(0, visibleCount).map(p => `${p.x}-${p.y}`));

  useEffect(() => {
    if (visibleCount >= shuffled.length) return;
    const delay = visibleCount === 0 ? 0 : 35;
    const t = setTimeout(() => setVisibleCount(v => v + 1), delay);
    return () => clearTimeout(t);
  }, [visibleCount, shuffled.length]);

  return (
    <svg
      width={size}
      height={size * rows / cols}
      viewBox={`0 0 ${cols} ${rows}`}
      style={{ imageRendering: "pixelated", display: "block" }}
    >
      {grid.flatMap((row, y) =>
        row.map((on, x) =>
          on && visibleSet.has(`${x}-${y}`) ? (
            <rect
              key={`${x}-${y}`}
              x={x} y={y} width={1} height={1}
              fill={color}
              opacity={1}
            />
          ) : null
        )
      )}
    </svg>
  );
}

interface ReactionPickerProps {
  onPick: (type: "heart" | "thumbsup") => void;
  onClose: () => void;
  currentColor: string;
}

export function ReactionPicker({ onPick, onClose, currentColor }: ReactionPickerProps) {
  return (
    <div
      className="absolute bottom-full right-0 mb-2 flex gap-2 p-2 rounded-xl bg-white dark:bg-stone-800 shadow-xl border border-stone-200 dark:border-stone-700 z-50 animate-fade-in"
      onClick={e => e.stopPropagation()}
    >
      <button
        onClick={() => { onPick("heart"); onClose(); }}
        className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors active:scale-90"
        title="Heart"
      >
        <PixelHeart color={currentColor} size={20} />
      </button>
      <button
        onClick={() => { onPick("thumbsup"); onClose(); }}
        className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors active:scale-90"
        title="Thumbs up"
      >
        <PixelThumbsUp color={currentColor} size={20} />
      </button>
    </div>
  );
}
