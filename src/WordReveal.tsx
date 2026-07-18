import React, { useRef, useEffect } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);

interface WordRevealProps {
  text: string;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  fontWeight?: number | string;
  textAlign?: "center" | "left" | "right";
  enterEase?: string;
  startFrame?: number;
  staggerSeconds?: number;
  wordDurationSeconds?: number;
  tiltDegrees?: number;
}

CustomEase.create("cinetica-out", "M0,0 C0.18,0.88 0.32,1 1,1");
CustomEase.create("cinetica-in", "M0,0 C0.68,0 0.82,0.12 1,1");

export const WordReveal: React.FC<WordRevealProps> = ({
  text,
  fontSize = 3.5,
  color = "#CBC0D3",
  fontFamily = '"MapleMono-NF-CN", "Instrument Serif", serif',
  fontWeight = 700,
  textAlign = "center",
  enterEase = "cinetica-out",
  startFrame = 0,
  staggerSeconds = 0.12,
  wordDurationSeconds = 0.7,
  tiltDegrees = 60,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const lines = text.split("\n");
  const words = lines.map((l) => l.split(/\s+/).filter(Boolean));
  const flatWords = words.flat();

  wordRefs.current = wordRefs.current.slice(0, flatWords.length);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      const validWords = wordRefs.current.filter(
        (el): el is HTMLSpanElement => el !== null,
      );

      if (validWords.length > 0) {
        if (tiltDegrees > 0) {
          tl.set(validWords, { y: "100%", rotationX: tiltDegrees }, 0);
          tl.to(validWords, {
            y: "0%",
            duration: wordDurationSeconds,
            stagger: staggerSeconds,
            ease: enterEase,
          }, 0);
          tl.to(validWords, {
            rotationX: 0,
            duration: wordDurationSeconds * 0.5,
            ease: "back.out(1.3)",
            stagger: { each: staggerSeconds },
            delay: wordDurationSeconds * 0.5,
          }, 0);
        } else {
          tl.set(validWords, { y: "100%" }, 0);
          tl.to(validWords, {
            y: "0%",
            duration: wordDurationSeconds,
            stagger: staggerSeconds,
            ease: enterEase,
          }, 0);
        }
      }

      tlRef.current = tl;
    }, containerRef);

    return () => {
      tlRef.current?.kill();
      tlRef.current = null;
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tlRef.current) {
      tlRef.current.seek(Math.max(0, (frame - startFrame) / fps));
    }
  }, [frame, fps, startFrame]);

  let wordIndex = 0;

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
        perspective: "1200px",
        padding: "60px 80px",
      }}
    >
      <div
        style={{
          fontSize: `${fontSize}rem`,
          fontFamily,
          fontWeight,
          color,
          textAlign,
          lineHeight: 1.3,
          maxWidth: "100%",
        }}
      >
        {lines.map((line, li) => {
          const lineWords = words[li];
          return (
            <React.Fragment key={li}>
              {li > 0 && <br />}
              {lineWords.map((word, wi) => {
                const idx = wordIndex++;
                return (
                  <span
                    key={`${li}-${wi}`}
                    style={{
                      position: "relative",
                      display: "inline-block",
                      overflow: "hidden",
                      margin: "-0.08em 0",
                      verticalAlign: "top",
                    }}
                  >
                    <span
                      ref={(el) => {
                        wordRefs.current[idx] = el;
                      }}
                      style={{
                        display: "block",
                        padding: "0.08em 0",
                        willChange: "transform",
                        transformOrigin: "50% 100%",
                        backfaceVisibility: "hidden",
                      }}
                    >
                      {word}
                    </span>
                  </span>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
