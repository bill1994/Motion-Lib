import React, { useRef, useLayoutEffect, useState } from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

interface CircleGlowProps {
  text?: string;
  fontSize?: number;
  glowColor?: string;
  strokeWidth?: number;
  backgroundColor?: string;
  children?: React.ReactNode;
}

export const CircleGlow: React.FC<CircleGlowProps> = ({
  text = "creative",
  fontSize = 80,
  glowColor = "#D3FD50",
  strokeWidth = 2,
  backgroundColor = "#1D1B20",
  children,
}) => {
  const frame = useCurrentFrame();
  const textRef = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Measure the text element after mount
  useLayoutEffect(() => {
    if (textRef.current) {
      const rect = textRef.current.getBoundingClientRect();
      setMeasured({ width: rect.width, height: rect.height });
    }
  }, []);

  // Compute ellipse radii with padding
  const PADDING = 20;
  const defaultRx = 80;
  const defaultRy = 30;

  const rx = measured ? measured.width / 2 + PADDING : defaultRx;
  const ry = measured ? measured.height / 2 + PADDING : defaultRy;

  // ---- Animation phases (180 frames @ 60fps) ----
  // 0-45:   Draw in   — offset 100→0, scaleX(1)
  // 45-60:  Pause     — offset 0, scaleX(1)
  // 60-105: Undraw    — offset 0→100, scaleX(-1) (flipped)
  // 105-120:Pause     — offset 100, scaleX(-1)
  // 120-165:Redraw    — offset 100→0, scaleX(1)
  // 165-180:Pause     — offset 0, scaleX(1)

  let strokeDashoffsetVal: number;
  let scaleX: number;

  if (frame <= 45) {
    strokeDashoffsetVal = interpolate(frame, [0, 45], [100, 0], {
      easing: Easing.inOut(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    scaleX = 1;
  } else if (frame <= 60) {
    strokeDashoffsetVal = 0;
    scaleX = 1;
  } else if (frame <= 105) {
    strokeDashoffsetVal = interpolate(frame, [60, 105], [0, 100], {
      easing: Easing.inOut(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    scaleX = -1;
  } else if (frame <= 120) {
    strokeDashoffsetVal = 100;
    scaleX = -1;
  } else if (frame <= 165) {
    strokeDashoffsetVal = interpolate(frame, [120, 165], [100, 0], {
      easing: Easing.inOut(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    scaleX = 1;
  } else {
    strokeDashoffsetVal = 0;
    scaleX = 1;
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor,
        fontFamily: '"MapleMono-NF-CN", sans-serif',
      }}
    >
      {/* Text being measured */}
      <div
        ref={textRef}
        style={{
          fontSize,
          fontWeight: "bold",
          color: "#CBC0D3",
          position: "relative",
        }}
      >
        {text || "creative"}
      </div>

      {/* SVG ellipse overlay -- centered on the text */}
      <svg
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
        width={rx * 2}
        height={ry * 2}
        viewBox={`0 0 ${rx * 2} ${ry * 2}`}
      >
        <g
          style={{
            transform: `scaleX(${scaleX})`,
            transformOrigin: "50% 50%",
          }}
        >
          <ellipse
            cx={rx}
            cy={ry}
            rx={rx - 1}
            ry={ry - 1}
            pathLength={100}
            strokeDasharray={100}
            strokeDashoffset={strokeDashoffsetVal}
            stroke={glowColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
        </g>
      </svg>

      {children}
    </div>
  );
};

export const catalogEntry = {
  name: 'CircleGlow',
  description: 'SVG 椭圆环绕文字描边绘制',
  params: {
    text: { type: 'string', default: '"✦"', desc: '中心显示文字' },
    glowColor: { type: 'string', default: '"#CBC0D3"', desc: '椭圆描边颜色' },
    fontSize: { type: 'number', default: '48', desc: '文字字号（px）' },
  },
};
