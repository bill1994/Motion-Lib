import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

interface DominoCascadeProps {
  /** Number of domino blocks (default 4) */
  count?: number;
  /** Block width in px (default 20) */
  blockWidth?: number;
  /** Block height in px (default 150) */
  blockHeight?: number;
  /** Block depth in px (default 100) */
  blockDepth?: number;
  /** Entry stagger between blocks in frames (default 12 = 0.2s @60fps) */
  entryStagger?: number;
  /** Domino fall stagger between blocks in frames (default 3) */
  dominoStagger?: number;
  /** Y-axis rotation range in degrees for 3D look [min, max] (default [3, 8]) */
  yRotationRange?: [number, number];
  /** Center X of the block group (default 960) */
  xOffset?: number;
  /** Baseline Y position (default 400) */
  yOffset?: number;
  /** Primary face color (default "#CBC0D3") */
  baseColor?: string;
  /** Side face color (default "#4E4D5C") */
  accentColor?: string;
  /** Optional per-block text shown on front face */
  texts?: string[];
  /** Fallback children */
  children?: React.ReactNode;
}

const ENTRY_DURATION = 24; // frames per block entry
const SETTLE_DURATION = 12; // frames after all entries complete
const DOMINO_DURATION = 24; // frames per domino fall

// Color utilities
function darken(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `rgb(${r},${g},${b})`;
}

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}

export const DominoCascade: React.FC<DominoCascadeProps> = ({
  count = 4,
  blockWidth = 20,
  blockHeight = 150,
  blockDepth = 100,
  entryStagger = 12,
  dominoStagger = 3,
  yRotationRange = [3, 8],
  xOffset = 960,
  yOffset = 400,
  baseColor = "#CBC0D3",
  accentColor = "#4E4D5C",
  texts,
  children,
}) => {
  const frame = useCurrentFrame();

  // Derived timing
  const entryEnd = count * entryStagger + ENTRY_DURATION;
  const dominoStart = entryEnd + SETTLE_DURATION;

  // Gap between blocks
  const verticalSpacing = blockHeight + 20;
  const gap = verticalSpacing;

  // Face colors
  const frontColor = baseColor;
  const backColor = darken(accentColor, 30);
  const topColor = lighten(baseColor, 40);
  const bottomColor = darken(accentColor, 50);
  const leftColor = accentColor;
  const rightColor = lighten(accentColor, 20);

  // Y rotation per block (deterministic based on index)
  const getYRotation = (i: number) => {
    const [min, max] = yRotationRange;
    // Simple deterministic hash based on index
    const t = ((i * 7 + i * i * 3) % 100) / 100;
    return min + t * (max - min);
  };

  // Generate blocks
  const blocks: React.ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    // Horizontal position
    const blockX = xOffset + (i - (count - 1) / 2) * gap;
    const blockBottom = yOffset;

    // Entry phase
    const entryStart = i * entryStagger;
    const entryLocal = frame - entryStart;

    // Entry Y: from below baseline to final position
    let entryProgress = 0;
    if (entryLocal <= 0) {
      entryProgress = 0;
    } else if (entryLocal < ENTRY_DURATION) {
      entryProgress = entryLocal / ENTRY_DURATION;
    } else {
      entryProgress = 1;
    }

    const entryY = blockBottom + 300 - entryProgress * 300; // slides up 300px
    const entryOpacity = interpolate(entryLocal, [-6, 0, 6], [0, 0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    // Entry Y rotation (starts at 0, builds up during entry)
    const yRot = entryProgress * getYRotation(i);

    // Domino phase
    let dominoRotation = 0;
    const dominoLocal = frame - dominoStart - i * dominoStagger;
    if (dominoLocal >= 0 && dominoLocal < DOMINO_DURATION) {
      dominoRotation = interpolate(
        dominoLocal,
        [0, DOMINO_DURATION],
        [0, 85],
        { easing: Easing.in(Easing.quad), extrapolateRight: "clamp" }
      );
    } else if (dominoLocal >= DOMINO_DURATION) {
      dominoRotation = 85; // Fully fallen
    }

    // Opacity: fade out slightly after falling
    let blockOpacity = entryOpacity;
    if (dominoLocal >= DOMINO_DURATION) {
      blockOpacity = entryOpacity * 0.7; // dim slightly after falling
    }

    // Block position (final)
    const blockLeft = blockX - blockWidth / 2;
    const blockTop = blockBottom - blockHeight;

    // Full transform
    const transform = [
      `translateY(${entryY}px)`,
      `rotateY(${yRot}deg)`,
      `rotateZ(${dominoRotation}deg)`,
    ].join(" ");

    blocks.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: blockLeft,
          top: blockTop,
          width: blockWidth,
          height: blockHeight,
          transformOrigin: "center bottom",
          transform,
          willChange: "transform",
          opacity: blockOpacity,
        }}
      >
        {/* Front face */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: blockWidth,
            height: blockHeight,
            backgroundColor: frontColor,
            transform: `translateZ(${blockDepth / 2}px)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {texts?.[i] && (
            <span
              style={{
                color: "#1D1B20",
                fontFamily: '"MapleMono-NF-CN", "Helvetica Neue", sans-serif',
                fontSize: Math.min(blockWidth * 0.5, 14),
                fontWeight: 700,
                lineHeight: 1,
                textAlign: "center",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: blockWidth - 4,
              }}
            >
              {texts[i]}
            </span>
          )}
        </div>

        {/* Back face */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: blockWidth,
            height: blockHeight,
            backgroundColor: backColor,
            transform: `rotateY(180deg) translateZ(${blockDepth / 2}px)`,
          }}
        />

        {/* Right face */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: blockDepth,
            height: blockHeight,
            backgroundColor: rightColor,
            transform: `rotateY(90deg) translateZ(${blockWidth / 2}px)`,
          }}
        />

        {/* Left face */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: blockDepth,
            height: blockHeight,
            backgroundColor: leftColor,
            transform: `rotateY(-90deg) translateZ(${blockWidth / 2}px)`,
          }}
        />

        {/* Top face */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: blockWidth,
            height: blockDepth,
            backgroundColor: topColor,
            transform: `rotateX(-90deg) translateZ(${blockHeight / 2}px)`,
          }}
        />

        {/* Bottom face */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: blockWidth,
            height: blockDepth,
            backgroundColor: bottomColor,
            transform: `rotateX(90deg) translateZ(${blockHeight / 2}px)`,
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "transparent",
        perspective: "1500px",
        transformStyle: "preserve-3d",
      }}
    >
      {blocks}
      {children}
    </div>
  );
};

export const catalogEntry = {
  name: "DominoCascade",
  category: "entrance" as const,
  description:
    "3D domino cascade — six-faced CSS 3D blocks with entry + fall animation",
  params: {
    count: {
      type: "number",
      default: "4",
      desc: "Number of domino blocks",
    },
    blockWidth: {
      type: "number",
      default: "20",
      desc: "Block width (px)",
    },
    blockHeight: {
      type: "number",
      default: "150",
      desc: "Block height (px)",
    },
    blockDepth: {
      type: "number",
      default: "100",
      desc: "Block depth (px)",
    },
    entryStagger: {
      type: "number",
      default: "12",
      desc: "Entry stagger (frames = 0.2s @60fps)",
    },
    dominoStagger: {
      type: "number",
      default: "3",
      desc: "Domino fall stagger (frames)",
    },
    baseColor: {
      type: "string",
      default: '"#CBC0D3"',
      desc: "Primary face color",
    },
    accentColor: {
      type: "string",
      default: '"#4E4D5C"',
      desc: "Side face color",
    },
  },
};