import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

interface CurtainRevealProps {
  direction?: "reveal" | "cover" | "cycle";
  columnCount?: number;
  backgroundColor?: string;
  children?: React.ReactNode;
}

const COLUMN_PROPORTIONS = [4, 6, 4, 3, 3];
const TOTAL = 20;
const STAGGER_FRAMES = [15, 13, 10, 7, 5];

export const CurtainReveal: React.FC<CurtainRevealProps> = ({
  direction = "cycle",
  columnCount = 5,
  backgroundColor = "#000000",
  children,
}) => {
  const frame = useCurrentFrame();

  // Build column layout
  const columns: { width: number; left: number }[] = [];
  let cumulative = 0;
  for (let i = 0; i < columnCount; i++) {
    const w = COLUMN_PROPORTIONS[i] / TOTAL;
    columns.push({ width: w, left: cumulative });
    cumulative += w;
  }

  // Timing constants
  const phaseDuration = 45;
  const maxStagger = Math.max(...STAGGER_FRAMES.slice(0, columnCount));
  const targetDuration = phaseDuration - maxStagger; // 30

  // Children opacity
  let childrenOpacity: number;
  if (direction === "reveal") {
    childrenOpacity = interpolate(frame, [30, 45], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else if (direction === "cover") {
    childrenOpacity = interpolate(frame, [30, 50], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else {
    // cycle
    childrenOpacity = interpolate(frame, [35, 50, 85, 100], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  const easingFn = Easing.bezier(0.215, 0.61, 0.355, 1);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "transparent",
      }}
    >
      {/* Children content — visible during hold phase */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: childrenOpacity,
          fontFamily: '"MapleMono-NF-CN", sans-serif',
          color: "#CBC0D3",
        }}
      >
        {children}
      </div>

      {/* Curtain columns */}
      {columns.map((col, i) => {
        const stagger = STAGGER_FRAMES[i];
        let scaleY: number;

        if (direction === "reveal") {
          scaleY = interpolate(
            frame,
            [stagger, stagger + targetDuration],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: easingFn,
            },
          );
        } else if (direction === "cover") {
          scaleY = interpolate(
            frame,
            [
              phaseDuration + stagger,
              phaseDuration + stagger + targetDuration,
            ],
            [1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: easingFn,
            },
          );
        } else {
          // cycle
          const revealScale = interpolate(
            frame,
            [stagger, stagger + targetDuration],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: easingFn,
            },
          );
          const coverScale = interpolate(
            frame,
            [90 + stagger, 90 + stagger + targetDuration],
            [1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: easingFn,
            },
          );
          scaleY = frame < 90 ? revealScale : coverScale;
        }

        // transformOrigin: center bottom during reveal, center top during cover
        let transformOrigin: string;
        if (direction === "cover") {
          transformOrigin = "center top";
        } else if (direction === "reveal") {
          transformOrigin = "center bottom";
        } else {
          // cycle
          transformOrigin = frame < 90 ? "center bottom" : "center top";
        }

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${col.left * 100}%`,
              top: 0,
              width: `${col.width * 100}%`,
              height: "100%",
              backgroundColor,
              transform: `scaleY(${scaleY})`,
              transformOrigin,
              willChange: "transform",
            }}
          />
        );
      })}
    </div>
  );
};

export const catalogEntry = {
  name: 'CurtainReveal',
  category: 'entrance',
  description: '竖向帘幕柱 reveal / cover / cycle',
  params: {
    direction: { type: 'enum', default: 'horizontal', values: ['horizontal', 'vertical'], desc: '帘幕方向' },
    columnCount: { type: 'number', default: '8', desc: '帘幕列数' },
    backgroundColor: { type: 'string', default: '"#1D1B20"', desc: '帘幕颜色' },
  },
};
