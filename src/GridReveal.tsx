import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface GridRevealProps {
  cols?: number;
  rows?: number;
  cellSize?: number;
  gap?: number;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const GridReveal: React.FC<GridRevealProps> = ({
  cols = 12,
  rows = 8,
  cellSize = 50,
  gap = 0,
  title = "Rebooot",
  subtitle = "Grid Reveal \u00B7 Radial Ripple",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  children,
}) => {
  const frame = useCurrentFrame();
  const cx = (cols - 1) / 2;
  const cy = (rows - 1) / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);

  const contentStart = 115;
  const contentFade = interpolate(frame, [contentStart, 140], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const contentSlide = interpolate(frame, [contentStart, 140], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cells: React.ReactNode[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const dist = Math.sqrt(
        (col - cx) * (col - cx) + (row - cy) * (row - cy),
      );
      const normDist = dist / maxDist;
      const easedDist = 1 - (1 - normDist) * (1 - normDist);
      const appearFrame = 18 + easedDist * 88;
      const opacity = interpolate(
        frame,
        [appearFrame, appearFrame + 10],
        [0, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      );
      const scale = interpolate(
        frame,
        [appearFrame, appearFrame + 14],
        [0.4, 1],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      );

      cells.push(
        <div
          key={`${row}-${col}`}
          style={{
            width: cellSize,
            height: cellSize,
            backgroundColor: "#CBC0D3",
            borderRadius: 6,
            opacity,
            transform: `scale(${scale})`,
            willChange: "transform, opacity",
          }}
        />,
      );
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1D1B20",
        fontFamily: '"MapleMono-NF-CN", sans-serif',
        overflow: "hidden",
        gap: 50,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gap: `${gap}px`,
        }}
      >
        {cells}
      </div>

      <div
        style={{
          opacity: contentFade,
          transform: `translateY(${contentSlide}px)`,
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "2.8rem",
            fontWeight: "bold",
            color: "#CBC0D3",
            margin: 0,
            letterSpacing: "0.02em",
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: "1.1rem",
            color: "#4E4D5C",
            margin: "10px 0 0",
            letterSpacing: "0.04em",
          }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export const catalogEntry = {
  name: 'GridReveal',
  category: 'entrance',
  description: '网格细胞径向波纹展开 + 标题淡入',
  params: {
    cols: { type: 'number', default: '6', desc: '网格列数' },
    rows: { type: 'number', default: '4', desc: '网格行数' },
    title: { type: 'string', default: '"Rebooot"', desc: '标题文字' },
    subtitle: { type: 'string', default: '"Grid Reveal \u00B7 Radial Ripple"', desc: '副标题文字' },
  },
};
