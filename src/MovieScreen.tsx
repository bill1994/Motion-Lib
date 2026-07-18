import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

// ================================================================
// MovieScreen — 百叶窗 (Venetian Blind) Track Matte Architecture
//
// Layer stack (bottom to top):
//   z=0  beforeContent (Scene A)    full-screen, always rendered, never clipped
//   z=5  movie screen box           21 leaves clip-rendering children (Scene B)
//
// Animation timeline:
//   0–12   HOLD        box not visible
//   12–72  SWING-IN    leaves swing -100°→0° around box center, staggered left→right
//   72–132 EXPAND      scale screenInitialScale → fillScale, gaps max → 0, curve flattens
//   132+   DONE        fillScale, no gaps
//
// Each leaf uses a nested double-layer Track Matte:
//   OUTER div — mask/clipper with overflow:hidden
//   INNER div — holds full Scene B content at correct per-leaf offset
// ================================================================

interface MovieScreenProps {
  /** 幕布列数 (default 21, odd for symmetry) */
  columnCount?: number;
  /** 幕布边框颜色 */
  curtainColor?: string;
  /** 电影屏幕宽度（占视口百分比） */
  screenWidth?: number;
  /** 电影屏幕高度（占视口百分比） */
  screenHeight?: number;
  /** 电影屏幕初始缩放 (default 0.65) */
  screenInitialScale?: number;
  /** 幕布打开后露出的内容 (Scene B) */
  children?: React.ReactNode;
  /** 转场前显示的全屏内容 (Scene A) */
  beforeContent?: React.ReactNode;
}

// ================================================================
// Timeline constants
// ================================================================

const POP_FRAME = 12;
const HOLD_END = 72;
const ZOOM_END = 132;
const GAP_FRACTION_MAX = 0.45; // 45% of raw leaf width as gap at max
const CURVED_SCREEN_CLIP = 96; // ellipse(100%, 96%) — slight CRT curve
const CURVE_MAX_PCT = 5; // max % clipped from top/bottom at center leaf
const ROTATE_LENGTH = 35; // frames each leaf takes to swing in
const PERSPECTIVE_PX = 1200; // CSS perspective for 3D rotateY effect
const ROTATE_START_ANGLE = -100; // degrees - start angle (edge-on left)
const ROTATE_END_ANGLE = 0; // degrees - final angle (facing forward)
const OVERLAP_PX = 5; // per-leaf overlap px on each side — prevents sub-pixel gaps at Phase 4

// ================================================================
// Easing curves
// ================================================================

const SMOOTH_EASING = Easing.bezier(0.16, 1, 0.3, 1);
const SWING_EASING = Easing.out(Easing.cubic); // ease-out — decelerates as leaf approaches 0°

// ================================================================
// Default placeholder when children not provided
// ================================================================

const DefaultPlaceholder: React.FC<{ bgColor: string }> = ({ bgColor }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundColor: bgColor,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: '"MapleMono-NF-CN", sans-serif',
    }}
  >
    <span
      style={{
        fontSize: "3rem",
        fontWeight: "bold",
        color: "#1D1B20",
        letterSpacing: "0.1em",
        opacity: 0.4,
      }}
    >
      VIDEO
    </span>
  </div>
);

// ================================================================
// MovieScreen
// ================================================================

export const MovieScreen: React.FC<MovieScreenProps> = ({
  beforeContent,
  columnCount = 21,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  curtainColor = "#1D1B20",
  screenWidth = 85,
  screenHeight = 75,
  screenInitialScale = 0.65,
  children,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Movie screen box dimensions (pixels)
  const sw = (width * screenWidth) / 100;
  const sh = (height * screenHeight) / 100;

  // Raw column width percentage (relative to box)
  const rawWidth = 100 / columnCount;

  // Scale needed to fill the full screen at the end of EXPAND
  const fillScale = Math.max(width / sw, height / sh);

  // ------------------------------------
  // Screen scale per frame
  // ------------------------------------
  let currentScale: number;
  if (frame < POP_FRAME) {
    currentScale = 0;
  } else if (frame <= HOLD_END) {
    currentScale = screenInitialScale;
  } else {
    currentScale = interpolate(
      frame,
      [HOLD_END, ZOOM_END],
      [screenInitialScale, fillScale],
      {
        easing: SMOOTH_EASING,
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    );
  }

  // ------------------------------------
  // Box opacity fade-in
  // ------------------------------------
  const boxOpacity = interpolate(
    frame,
    [POP_FRAME, POP_FRAME + 6],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ------------------------------------
  // Gap fraction per frame
  // ------------------------------------
  let gapFraction: number;
  if (frame < HOLD_END) {
    gapFraction = GAP_FRACTION_MAX;
  } else {
    gapFraction = interpolate(
      frame,
      [HOLD_END, ZOOM_END],
      [GAP_FRACTION_MAX, 0],
      {
        easing: SMOOTH_EASING,
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    );
  }

  const curveIntensity = interpolate(
    frame,
    [HOLD_END, ZOOM_END],
    [1, 0],
    {
      easing: SMOOTH_EASING,
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  // ------------------------------------
  // Leaf layout values
  //
  // gapMargin: extra left offset per leaf to create visual gaps (%)
  // leafWidthPct: visible width of each leaf (%)
  //
  //   overlapPct: shift leaf left by 5px each to create overlap with adjacent leaf,
  //   preventing sub-pixel rendering gaps. The inner content offset is unchanged
  //   — overlap merely widens the clip window slightly on each side.
  // ------------------------------------
  const gapMargin = (rawWidth * gapFraction) / 2; // percent
  const overlapPct = (OVERLAP_PX / sw) * 100; // percent — leaf overlap on each side
  const leafWidthPct = rawWidth * (1 - gapFraction) + overlapPct * 2; // percent

  const childrenNode =
    children ?? <DefaultPlaceholder bgColor="#CBC0D3" />;

  // ------------------------------------
  // Build 21 venetian blind leaves
  //
  // Each leaf i:
  //   OUTER div at leafLeft% with overflow:hidden — masks to leafWidthPct%
  //   INNER div at innerLeftPx px — full Scene B content, shifted so
  //     Scene B pixel at i*rawWidth% aligns with outer's left edge.
  //
  // innerLeftPx:
  //   -(i * rawWidth * sw / 100)     per-leaf base offset (column-aligned)
  //   No gap compensation needed — gapMargin in leafLeft is naturally
  //   handled via the outer clip boundary.
  // ------------------------------------
  const leaves: React.ReactNode[] = [];
  for (let i = 0; i < columnCount; i++) {
    const centerIdx = (columnCount - 1) / 2;
    const distFromCenter = Math.abs(i - centerIdx) / centerIdx;
    const curveAmount = CURVE_MAX_PCT * (1 - distFromCenter * distFromCenter) * curveIntensity;

    // Outer div absolute position (% of box width)
    const leafLeft = i * rawWidth + gapMargin - overlapPct;

    // Inner div offset (px):
    //   -(i * rawWidth * sw) / 100  (shift Scene B so column i aligns)
    //   No gap compensation — the outer clip boundary handles gapMargin.
    const innerLeftPx = -(i * rawWidth * sw) / 100;

    // 3D swing-in: leaves rotate around box center (not their own center)
    // from -100° (edge-on left) to 0° (facing forward), staggered left→right
    // Each leaf takes ROTATE_LENGTH frames; stagger fits within POP_FRAME→HOLD_END
    const totalPhaseFrames = HOLD_END - POP_FRAME;
    const staggerMax = Math.max(0, totalPhaseFrames - ROTATE_LENGTH);
    const staggerForLeaf =
      columnCount > 1 ? (i / (columnCount - 1)) * staggerMax : 0;

    const rotateAngle = interpolate(
      frame,
      [
        POP_FRAME + staggerForLeaf,
        POP_FRAME + staggerForLeaf + ROTATE_LENGTH,
      ],
        [ROTATE_START_ANGLE, ROTATE_END_ANGLE],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: SWING_EASING,
      },
    );

    // transform-origin X: percentage of leaf's own width that lands on box center
    // Box center is at 50% of box. In leaf coords: (50% - leafLeft%) of box width.
    // As % of leaf's own width: (50 - leafLeft) / leafWidthPct * 100
    const originX = (50 - leafLeft) / leafWidthPct * 100;

    leaves.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: `${leafLeft}%`,
          width: `${leafWidthPct}%`,
          height: "100%",
          overflow: "hidden",
          clipPath: `inset(${curveAmount}% 0 ${curveAmount}% 0)`,
          transform: `rotateY(${rotateAngle}deg)`,
          transformOrigin: `${originX}% center`,
          backfaceVisibility: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: `${innerLeftPx}px`,
            width: sw,
            height: sh,
          }}
        >
          {childrenNode}
        </div>
      </div>
    );
  }

  // ------------------------------------
  // Render
  // ------------------------------------
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
      }}
    >
      {/* ===== z=0: Scene A (beforeContent) — full screen, always rendered, never clipped ===== */}
      {beforeContent !== undefined && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
          }}
        >
          {beforeContent}
        </div>
      )}

      {/* ===== z=5: movie screen box with 21 venetian blind leaves ===== */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 5,
          pointerEvents: "none",
          opacity: boxOpacity,
        }}
      >
        <div
          style={{
            position: "relative",
            width: sw,
            height: sh,
            perspective: `${PERSPECTIVE_PX}px`,
            transformStyle: "preserve-3d",
            transform: `scale(${currentScale})`,
            transformOrigin: "center center",
            clipPath: `ellipse(100% ${CURVED_SCREEN_CLIP}% at 50% 50%)`,
            backgroundColor: "transparent",
            overflow: "hidden",
          }}
        >
          {leaves}
        </div>
      </div>
    </div>
  );
};

// ================================================================
// Catalog entry
// ================================================================

export const catalogEntry = {
  name: "MovieScreen",
  description:
    "百叶窗 (Venetian Blind) Track Matte 转场 — 21列纵向叶片 + CRT弧面屏幕 + zoom in 至全屏",
  params: {
    columnCount: { type: "number", default: "21", desc: "叶片列数（奇数）" },
    curtainColor: { type: "string", default: '"#1D1B20"', desc: "屏幕边框颜色" },
    screenWidth: { type: "number", default: "85", desc: "电影屏幕宽度（视口百分比）" },
    screenHeight: { type: "number", default: "75", desc: "电影屏幕高度（视口百分比）" },
    screenInitialScale: { type: "number", default: "0.65", desc: "屏幕初始缩放" },
  },
};
