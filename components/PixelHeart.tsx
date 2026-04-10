"use client";

interface PixelIconProps {
  color: string;
  size?: number;
}

export function PixelHeart({ color, size = 14 }: PixelIconProps) {
  const grid = [
    [0,1,1,0,1,1,0],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [0,1,1,1,1,1,0],
    [0,0,1,1,1,0,0],
    [0,0,0,1,0,0,0],
  ];
  const cols = 7, rows = 6;
  return (
    <svg width={size} height={size * rows / cols} viewBox={`0 0 ${cols} ${rows}`} style={{ imageRendering: "pixelated", display: "block" }}>
      {grid.flatMap((row, y) => row.map((on, x) => on ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} /> : null))}
    </svg>
  );
}

export function PixelThumbsUp({ color, size = 14 }: PixelIconProps) {
  const grid = [
    [0,0,0,1,0,0,0],
    [0,0,1,1,0,0,0],
    [0,1,1,1,1,1,0],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [0,1,1,1,1,1,0],
    [0,1,0,0,0,1,0],
  ];
  const cols = 7, rows = 7;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${cols} ${rows}`} style={{ imageRendering: "pixelated", display: "block" }}>
      {grid.flatMap((row, y) => row.map((on, x) => on ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} /> : null))}
    </svg>
  );
}

export function PixelReaction({ type, color, size = 14 }: { type: "heart" | "thumbsup"; color: string; size?: number }) {
  return type === "heart" ? <PixelHeart color={color} size={size} /> : <PixelThumbsUp color={color} size={size} />;
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
        <PixelHeart color={currentColor} size={18} />
      </button>
      <button
        onClick={() => { onPick("thumbsup"); onClose(); }}
        className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors active:scale-90"
        title="Thumbs up"
      >
        <PixelThumbsUp color={currentColor} size={16} />
      </button>
    </div>
  );
}
