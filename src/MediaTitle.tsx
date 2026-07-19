import React, { useRef, useEffect } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import gsap from "gsap";

const CONFIG = {
  bgRevealDuration: 0.6,
  bgEase: "power3.inOut",
  charRevealDuration: 0.5,
  charStagger: 0.06,
  charEase: "power4.out",
  charStartOffset: 0.15,
};

interface MediaTitleProps {
  text?: string;
  children?: React.ReactNode;
  bgColor?: string;
  textColor?: string;
  fontSizeVw?: number;
}

export const MediaTitle: React.FC<MediaTitleProps> = ({
  text = "media",
  children,
  bgColor = "#00d3ff",
  textColor = "#1D1B20",
  fontSizeVw = 13,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const chars = [...text];
  charRefs.current = charRefs.current.slice(0, chars.length);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      tl.fromTo(
        bgRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: CONFIG.bgRevealDuration,
          ease: CONFIG.bgEase,
        },
        0,
      );

      const validChars = charRefs.current.filter(
        (el): el is HTMLSpanElement => el !== null,
      );

      if (validChars.length > 0) {
        tl.fromTo(
          validChars,
          { y: "100%", opacity: 0 },
          {
            y: "0%",
            opacity: 1,
            duration: CONFIG.charRevealDuration,
            stagger: CONFIG.charStagger,
            ease: CONFIG.charEase,
          },
          CONFIG.charStartOffset,
        );
      }

      tlRef.current = tl;
    }, containerRef);

    return () => {
      if (tlRef.current) {
        tlRef.current.kill();
        tlRef.current = null;
      }
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    if (tlRef.current) {
      tlRef.current.seek(frame / fps);
    }
  }, [frame, fps]);

  const fontSize = `${fontSizeVw}vw`;

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        overflow: "hidden",
      }}
    >
      <div
        ref={bgRef}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: bgColor,
          transformOrigin: "left center",
          transform: "scaleX(0)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "0 2rem",
        }}
      >
        <div
          style={{
            overflow: "hidden",
            padding: "0.05em 0",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              fontSize,
              lineHeight: 1.15,
              fontWeight: 700,
              color: textColor,
              fontFamily: '"MapleMono-NF-CN", sans-serif',
            }}
          >
            {chars.map((char, i) => {
              const isSpace = char === " ";
              const displayChar = isSpace ? "\u00A0" : char;

              return (
                <span
                  key={`${i}-${char}`}
                  ref={(el) => {
                    charRefs.current[i] = el;
                  }}
                  style={{
                    display: "inline-block",
                    willChange: "transform, opacity",
                  }}
                >
                  {displayChar}
                </span>
              );
            })}
          </div>
        </div>

        {children && (
          <div
            style={{
              marginTop: "1.5rem",
              textAlign: "center",
              color: textColor,
              fontSize: "1.8rem",
              opacity: 0.8,
            }}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export const catalogEntry = {
  name: 'MediaTitle',
  category: 'typography',
  description: '背景面板从左展开 + 字符从底部滑入',
  params: {
    text: { type: 'string', default: '"media"', desc: '标题文字' },
    bgColor: { type: 'string', default: '"#1D1B20"', desc: '背景面板颜色' },
    textColor: { type: 'string', default: '"#CBC0D3"', desc: '文字颜色' },
    fontSizeVw: { type: 'number', default: '3.5', desc: '字号（vw 单位）' },
  },
};
