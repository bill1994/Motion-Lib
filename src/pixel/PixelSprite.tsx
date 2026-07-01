import React from "react";
import type { PixelSpriteDef, FacialExpression } from "./PixelSpriteDef";

const PX_SIZE = 20;

/**
 * Renders a pixel-art sprite as a grid of colored divs, with facial-expression overlay support.
 *
 * The sprite is positioned using GPU-accelerated CSS transforms (translate, scale, rotate)
 * and maintains a transparent background for alpha compositing in ProRes 4444 renders.
 *
 * @param props.sprite - The sprite definition (palette, grid, anchors)
 * @param props.expression - Current facial expression to render
 * @param props.x - Horizontal position in pixels (used in CSS transform, not CSS `left`)
 * @param props.y - Vertical position in pixels (used in CSS transform, not CSS `top`)
 * @param props.scale - Uniform scale factor (default: 1)
 * @param props.rotation - Rotation in degrees (default: 0)
 * @param props.opacity - Opacity (default: 1)
 * @param props.children - Optional overlay content rendered between grid pixels and expression features
 * @param ref - Forwarded ref for GSAP targeting by parent compositions
 */
const PixelSprite = React.forwardRef<
  HTMLDivElement,
  {
    sprite: PixelSpriteDef;
    expression: FacialExpression;
    x: number;
    y: number;
    scale?: number;
    rotation?: number;
    opacity?: number;
    children?: React.ReactNode;
  }
>(({ sprite, expression, x, y, scale = 1, rotation = 0, opacity = 1, children }, ref) => {
  const { width, height, palette, grid, anchors } = sprite;
  const containerWidth = width * PX_SIZE;
  const containerHeight = height * PX_SIZE;

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotation}deg)`,
        opacity,
        imageRendering: "pixelated",
        width: containerWidth,
        height: containerHeight,
      }}
    >
      {/* Pixel grid — only non-zero cells are rendered */}
      {grid.map((row, rowIndex) =>
        row.map((cellValue, colIndex) => {
          if (cellValue === 0) return null;
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              style={{
                position: "absolute",
                left: colIndex * PX_SIZE,
                top: rowIndex * PX_SIZE,
                width: PX_SIZE,
                height: PX_SIZE,
                backgroundColor: palette[cellValue],
              }}
            />
          );
        }),
      )}

      {/* Children overlay (rendered between grid and expression features) */}
      {children}

      {/* Facial expression overlays — pupils placed at anchor positions */}
      {expression.features
        .filter((feature) => !feature.hidden)
        .map((feature, index) => {
          const anchor = anchors?.[feature.anchor];
          if (!anchor) return null;
          return (
            <div
              key={`expr-${index}`}
              style={{
                position: "absolute",
                left: (anchor.x + (feature.offset?.dx ?? 0)) * PX_SIZE,
                top: (anchor.y + (feature.offset?.dy ?? 0)) * PX_SIZE,
                width: PX_SIZE,
                height: PX_SIZE,
                backgroundColor: palette[2],
              }}
            />
          );
        })}
    </div>
  );
});

PixelSprite.displayName = "PixelSprite";

export { PixelSprite };
