"use client";

interface PixelHeartProps {
  color: string;
  size?: number;
}

export function PixelHeart({ color, size = 14 }: PixelHeartProps) {
  // 7x6 pixel art heart grid (1 = filled, 0 = empty)
  const grid = [
    [0,1,1,0,1,1,0],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [0,1,1,1,1,1,0],
    [0,0,1,1,1,0,0],
    [0,0,0,1,0,0,0],
  ];

  const cols = 7;
  const rows = 6;
  const px = size / cols;

  return (
    <svg
      width={size}
      height={size * rows / cols}
      viewBox={`0 0 ${cols} ${rows}`}
      style={{ imageRendering: "pixelated", display: "block" }}
    >
      {grid.flatMap((row, y) =>
        row.map((on, x) =>
          on ? (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} />
          ) : null
        )
      )}
    </svg>
  );
}

export function PixelThumbsUp({ color, size = 14 }: PixelHeartProps) {
  // 7x7 pixel art thumbs up grid
  const grid = [
    [0,0,0,1,0,0,0],
    [0,0,1,1,0,0,0],
    [0,1,1,1,1,1,0],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [0,1,1,1,1,1,0],
    [0,1,0,0,0,1,0],
  ];

  const cols = 7;
  const rows = 7;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${cols} ${rows}`}
      style={{ imageRendering: "pixelated", display: "block" }}
    >
      {grid.flatMap((row, y) =>
        row.map((on, x) =>
          on ? (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} />
          ) : null
        )
      )}
    </svg>
  );
}
