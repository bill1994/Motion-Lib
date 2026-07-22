import React from "react";
import { useCurrentFrame } from "remotion";

interface TerminalTypewriterProps {
  children?: React.ReactNode;
}

const ALPHABET = "abcdefghijklmnopqrstuvwxyz";
const CHARS_PER_LINE = 22;
const TOTAL_LINES = 5;
const TOTAL_CHARS = CHARS_PER_LINE * TOTAL_LINES;

export const TerminalTypewriter: React.FC<TerminalTypewriterProps> = ({
  children,
}) => {
  const frame = useCurrentFrame();

  const typed = Math.min(frame, TOTAL_CHARS);
  const done = typed >= TOTAL_CHARS;
  const cursorOn = Math.floor(frame / 30) % 2 === 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0d0d1a",
        fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
        fontSize: 22,
        color: "#27c93f",
      }}
    >
      <div
        style={{
          width: 800,
          height: 480,
          border: "1px solid #1a1a2e",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          backgroundColor: "#0d0d1a",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "14px 20px",
            backgroundColor: "#1a1a2e",
            borderBottom: "1px solid #2a2a3e",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              display: "inline-block",
              backgroundColor: "#ff5f57",
            }}
          />
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              display: "inline-block",
              backgroundColor: "#febc2e",
            }}
          />
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              display: "inline-block",
              backgroundColor: "#28c840",
            }}
          />
          <span
            style={{
              marginLeft: 12,
              color: "#666",
              fontSize: 13,
            }}
          >
            bash — typewriter
          </span>
        </div>
        <div
          style={{
            flex: 1,
            padding: "24px 28px",
            lineHeight: "36px",
          }}
        >
          {Array.from({ length: TOTAL_LINES }, (_, li) => {
            const start = li * CHARS_PER_LINE;
            const count = Math.max(0, Math.min(typed - start, CHARS_PER_LINE));

            const cursorHere =
              (!done && typed >= start && typed < start + CHARS_PER_LINE) ||
              (done && li === TOTAL_LINES - 1);

            let content = "";
            for (let ci = 0; ci < count; ci++) {
              content += ALPHABET[(start + ci) % 26];
            }

            return (
              <div key={li}>
                <span style={{ color: "#27c93f" }}>$ </span>
                <span>{content}</span>
                {cursorHere && cursorOn && <span>▌</span>}
              </div>
            );
          })}
        </div>
      </div>
      {children}
    </div>
  );
};
