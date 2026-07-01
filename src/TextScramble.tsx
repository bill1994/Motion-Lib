import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface TextScrambleProps {
  text?: string;
  fontSize?: number;
  children?: React.ReactNode;
}

const POOL = "!<>-_\\/[]{}—=+*^?#%";
const STAGGER = 4;
const SCRAMBLE = 28;

export const TextScramble: React.FC<TextScrambleProps> = ({
  text = "ZhanWeiFu",
  fontSize = 5,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  children,
}) => {
  const frame = useCurrentFrame();
  const chars = [...text];

  const sweep = interpolate(frame, [0, 150], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1D1B20",
        fontFamily: '"MapleMono-NF-CN", "Courier New", monospace',
        overflow: "hidden",
        fontSize: `${fontSize}rem`,
        color: "#CBC0D3",
      }}
    >
      {frame < 150 && (
        <div
          style={{
            position: "absolute",
            left: `${sweep * 100}%`,
            top: 0,
            bottom: 0,
            width: "25%",
            background:
              "linear-gradient(90deg, transparent, rgba(203,192,211,0.08), transparent)",
            transform: "translateX(-50%)",
            pointerEvents: "none",
          }}
        />
      )}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          lineHeight: 1.2,
          fontWeight: "bold",
        }}
      >
        {chars.map((char, i) => {
          const startFr = i * STAGGER;
          const settleFr = startFr + SCRAMBLE;

          let displayChar: string;
          let opacity: number;
          let scale: number;
          let textShadow: string | undefined;

          if (char === " ") {
            displayChar = "\u00A0";
            opacity = 1;
            scale = 1;
          } else if (frame < startFr) {
            const poolIdx =
              ((i * 7 + Math.floor(frame / 2)) * 13) % POOL.length;
            displayChar = POOL[poolIdx];
            opacity = 0.12;
            scale = 0.6;
          } else if (frame < settleFr) {
            const elapsed = frame - startFr;
            const freq = Math.max(1, 4 - Math.floor(elapsed / 7));
            const idx = Math.floor(elapsed / freq);
            const poolIdx = (idx * 17 + i * 31) % POOL.length;
            displayChar = POOL[poolIdx];
            const p = elapsed / SCRAMBLE;
            opacity = interpolate(
              p,
              [0, 0.15, 0.5, 1],
              [0, 0.9, 1, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            scale = interpolate(
              p,
              [0, 0.25, 0.6, 1],
              [0.2, 1.3, 1.1, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
          } else {
            displayChar = char;
            opacity = 1;
            scale = 1;
            textShadow = "0 0 12px rgba(203,192,211,0.4)";
          }

          return (
            <span
              key={`${i}-${char}`}
              style={{
                display: "inline-block",
                opacity,
                transform: `scale(${scale})`,
                textShadow,
                willChange: "transform, opacity",
              }}
            >
              {displayChar}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const catalogEntry = {
  name: 'TextScramble',
  description: '字符乱码翻滚→逐步稳定为目标文字',
  params: {
    text: { type: 'string', default: '"ZhanWeiFu"', desc: '显示的目标文字' },
    fontSize: { type: 'number', default: '48', desc: '字号（px）' },
    fontFamily: { type: 'string', desc: '字体名称' },
  },
};
