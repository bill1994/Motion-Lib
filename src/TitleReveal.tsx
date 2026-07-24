import React, { useRef, useEffect } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import gsap from "gsap";

const C = {
  su: { cd: 0.6, sg: 0.05, es: "back.out(1.7)", sd: 0.5, se: "power4.out", sp: "-=0.3" },
  f3: { cd: 0.5, sg: 0.04, es: "back.out(1.7)", spd: 0.25, spe: "power2.out", per: 800 },
  pn: { bd: 0.6, be: "power3.inOut", cd: 0.5, sg: 0.06, ce: "power4.out", cs: 0.15 },
  py: 40, px: 60, gap: 20, fs: 5,
} as const;

interface TitleRevealProps {
  text?: string;
  subText?: string;
  children?: React.ReactNode;
  mode: "slideUp" | "flip3d" | "panel";
  staggerMode?: "sequential" | "random" | "center" | "edges";
  bgColor?: string;
  textColor?: string;
}

interface W { type: "w"; chars: string[] }
interface S { type: "s" }
type T = W | S;

function tokenize(t: string): T[] {
  const r: T[] = [];
  let cur = "";
  for (const ch of t) {
    if (ch === " ") {
      if (cur) { r.push({ type: "w", chars: [...cur] }); cur = ""; }
      r.push({ type: "s" });
    } else { cur += ch; }
  }
  if (cur) r.push({ type: "w", chars: [...cur] });
  return r;
}

export const TitleReveal: React.FC<TitleRevealProps> = ({
  text = "ZhanWeiFu",
  subText = "",
  children,
  mode,
  staggerMode = "sequential",
  bgColor = "#00d3ff",
  textColor = "#ffffff",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cr = useRef<HTMLDivElement>(null);
  const tr = useRef<gsap.core.Timeline | null>(null);
  const br = useRef<HTMLDivElement>(null);
  const chrs = useRef<(HTMLSpanElement | null)[]>([]);
  const sprs = useRef<(HTMLSpanElement | null)[]>([]);
  const sir = useRef<HTMLDivElement>(null);

  const mref = useRef(mode);
  const sref = useRef(staggerMode);
  const suref = useRef(subText);
  mref.current = mode;
  sref.current = staggerMode;
  suref.current = subText;

  const isFlip = mode === "flip3d";
  const chars = isFlip ? [] : [...text];
  const tokens = isFlip ? tokenize(text) : [];
  let cc = isFlip ? 0 : chars.length;
  let sc = 0;
  if (isFlip) {
    for (const t of tokens) {
      if (t.type === "w") cc += t.chars.length;
      else sc++;
    }
  }
  chrs.current = chrs.current.slice(0, cc);
  if (isFlip) sprs.current = sprs.current.slice(0, sc);

  useEffect(() => {
    const m = mref.current;
    const sm = sref.current;
    const st = suref.current;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });
      if (m === "panel" && br.current) {
        tl.fromTo(br.current, { scaleX: 0 }, { scaleX: 1, duration: C.pn.bd, ease: C.pn.be }, 0);
      }
      const vc = chrs.current.filter((e): e is HTMLSpanElement => e !== null);
      if (m === "flip3d") {
        if (vc.length > 0) {
          const scfg = sm === "sequential" ? C.f3.sg : { each: C.f3.sg, from: sm };
          tl.fromTo(vc, { rotationX: 90, opacity: 0 }, { rotationX: 0, opacity: 1, duration: C.f3.cd, stagger: scfg, ease: C.f3.es }, 0);
        }
        const vs = sprs.current.filter((e): e is HTMLSpanElement => e !== null);
        if (vs.length > 0) {
          tl.fromTo(vs, { opacity: 0 }, { opacity: 1, duration: C.f3.spd, stagger: C.f3.sg, ease: C.f3.spe }, 0);
        }
      } else {
        const cd = m === "slideUp" ? C.su.cd : C.pn.cd;
        const sg = m === "slideUp" ? C.su.sg : C.pn.sg;
        const es = m === "slideUp" ? C.su.es : C.pn.ce;
        const off = m === "slideUp" ? 0 : C.pn.cs;
        if (vc.length > 0) {
          const scfg = sm === "sequential" ? sg : { each: sg, from: sm };
          tl.fromTo(vc, { y: "100%", opacity: 0 }, { y: 0, opacity: 1, duration: cd, stagger: scfg, ease: es }, off);
        }
        if (m === "slideUp" && st && sir.current) {
          tl.fromTo(sir.current, { y: "100%", opacity: 0 }, { y: 0, opacity: 1, duration: C.su.sd, ease: C.su.se }, C.su.sp);
        }
      }
      tr.current = tl;
    }, cr);
    return () => {
      if (tr.current) { tr.current.kill(); tr.current = null; }
      ctx.revert();
    };
  }, [mode, staggerMode, text, subText]);

  useEffect(() => {
    if (tr.current) tr.current.seek(frame / fps);
  }, [frame, fps]);

  if (mode === "flip3d") {
    let ci = 0, si = 0;
    return (
      <div ref={cr} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "transparent", fontFamily: '"MapleMono-NF-CN", sans-serif', color: textColor, perspective: C.f3.per }}>
        <span aria-hidden="true" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", fontSize: `${C.fs}rem`, lineHeight: 1.2, fontWeight: "bold" }}>
          {tokens.map((t, ti) => {
            if (t.type === "s") {
              const idx = si++;
              return <span key={`s-${ti}`} ref={(el) => { sprs.current[idx] = el; }} style={{ display: "inline-block", width: "0.3em" }}>{"\u00A0"}</span>;
            }
            const li = ci;
            ci += t.chars.length;
            return (
              <span key={`w-${ti}`} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
                {t.chars.map((ch, i) => {
                  const gi = li + i;
                  return <span key={`c-${gi}`} ref={(el) => { chrs.current[gi] = el; }} style={{ display: "inline-block", transformOrigin: "bottom center" }}>{ch}</span>;
                })}
              </span>
            );
          })}
        </span>
      </div>
    );
  }

  if (mode === "panel") {
    return (
      <div ref={cr} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "transparent", overflow: "hidden" }}>
        <div ref={br} style={{ position: "absolute", inset: 0, backgroundColor: bgColor, transformOrigin: "left center", transform: "scaleX(0)" }} />
        <div style={{ position: "relative", zIndex: 1, padding: "0 2rem" }}>
          <div style={{ overflow: "hidden", padding: "0.05em 0" }}>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", fontSize: "13vw", lineHeight: 1.15, fontWeight: 700, color: textColor, fontFamily: '"MapleMono-NF-CN", sans-serif' }}>
              {[...text].map((ch, i) => (
                <span key={`${i}-${ch}`} ref={(el) => { chrs.current[i] = el; }} style={{ display: "inline-block", willChange: "transform, opacity" }}>{ch === " " ? "\u00A0" : ch}</span>
              ))}
            </div>
          </div>
          {children && <div style={{ marginTop: "1.5rem", textAlign: "center", color: textColor, fontSize: "1.8rem", opacity: 0.8 }}>{children}</div>}
        </div>
      </div>
    );
  }

  return (
    <div ref={cr} style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "transparent", fontFamily: '"MapleMono-NF-CN", sans-serif', color: textColor }}>
      <div style={{ overflow: "hidden", padding: `${C.py}px ${C.px}px` }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", fontSize: `${C.fs}rem`, lineHeight: 1.2, fontWeight: "bold" }}>
          {[...text].map((ch, i) => (
            <span key={`${i}-${ch}`} ref={(el) => { chrs.current[i] = el; }} style={{ display: "inline-block" }}>{ch === " " ? "\u00A0" : ch}</span>
          ))}
        </div>
      </div>
      {subText && (
        <div style={{ overflow: "hidden", padding: `0 ${C.px}px`, marginTop: C.gap }}>
          <div ref={sir} style={{ fontSize: "1.5rem", lineHeight: 1.4, fontWeight: "normal", whiteSpace: "nowrap" }}>{subText}</div>
        </div>
      )}
    </div>
  );
};

export const catalogEntry = {
  name: "TitleReveal",
  category: "typography" as const,
  description: "统一文字揭示动画 — 支持 slideUp / flip3d / panel 三种模式",
  compositions: [
    {
      id: "TitleRevealSlideUp",
      props: { mode: "slideUp" },
      desc: "字符逐字弹性弹入（y:100%→0, back.out）",
    },
    {
      id: "TitleRevealPanel",
      props: { mode: "panel", bgColor: "#00d3ff", textColor: "#ffffff" },
      desc: "背景面板从左展开 + 字符从底部滑入",
    },
    {
      id: "TitleRevealFlip3d",
      props: { mode: "flip3d", staggerMode: "sequential" },
      desc: "字符从底部 3D 翻转显现（rotationX:90→0）",
    },
  ],
  params: {
    text: { type: "string", default: '"ZhanWeiFu"', desc: "显示文字" },
    subText: { type: "string", default: '""', desc: "副标题（仅 slideUp 模式）" },
    mode: { type: "enum", default: '"slideUp"', desc: "动画模式: slideUp | flip3d | panel" },
    staggerMode: { type: "enum", default: '"sequential"', desc: "字符出场顺序（仅 flip3d 模式）" },
    bgColor: { type: "string", default: '"#00d3ff"', desc: "背景面板颜色（仅 panel 模式）" },
    textColor: { type: "string", default: '"#ffffff"', desc: "文字颜色" },
  },
};
