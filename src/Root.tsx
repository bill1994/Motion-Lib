import "./index.css";
import { Composition, CalculateMetadataFunction } from "remotion";
import { MyComposition } from "./Composition";
import { HeroReveal } from "./HeroReveal";
import { TextIntro } from "./TextIntro";
import { LiquidGlass } from "./LiquidGlass";
import { WaterOrb } from "./WaterOrb";
import { TextScramble } from "./TextScramble";
import { GridReveal } from "./GridReveal";
import { CurtainReveal } from "./CurtainReveal";
import { MediaTitle } from "./MediaTitle";
import { MovieScreen } from "./MovieScreen";
import { ClawdDrop } from "./ClawdDrop";
import { ClawdAction } from "./ClawdAction";
import { CardFlyUp } from "./CardFlyUp";
import { AnimatedCardScene } from "./AnimatedCardScene/AnimatedCardScene";
import { WordReveal } from "./WordReveal";
import { GlassTitleCard } from "./GlassCard/GlassTitleCard";
import { GlassShowcaseStack } from "./GlassCard/GlassShowcaseStack";

/**
 * 为输出 ProRes 4444 透明视频预置默认编码参数
 */
const calculateMetadata: CalculateMetadataFunction<Record<string, unknown>> = async () => {
  return {
    defaultCodec: "prores",
    defaultVideoImageFormat: "png",
    defaultPixelFormat: "yuva444p10le",
    defaultProResProfile: "4444",
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ================================================================ */}
      {/* Typography — 文字动画                                               */}
      {/* ================================================================ */}
      <Composition
        id="TextIntro"
        component={TextIntro}
        durationInFrames={180}
        fps={60}
        width={1920}
        height={1080}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="TextScramble"
        component={TextScramble}
        durationInFrames={180}
        fps={60}
        width={1920}
        height={1080}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="WordReveal"
        component={WordReveal as unknown as React.FC<Record<string, unknown>>}
        durationInFrames={180}
        fps={60}
        width={1920}
        height={1080}
        calculateMetadata={calculateMetadata}
        defaultProps={{
          text: "Crafting Motion",
        }}
      />
      <Composition
        id="MediaTitle"
        component={MediaTitle}
        durationInFrames={180}
        fps={60}
        width={1920}
        height={1080}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="GlassTitleCard"
        component={GlassTitleCard as unknown as React.FC<Record<string, unknown>>}
        durationInFrames={180}
        fps={60}
        width={1920}
        height={1080}
        calculateMetadata={calculateMetadata}
      />
      {/* ================================================================ */}
      {/* Card — 卡片动画                                                   */}
      {/* ================================================================ */}
      <Composition
        id="CardFlyUp"
        component={CardFlyUp}
        durationInFrames={120}
        fps={60}
        width={1920}
        height={1080}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="AnimatedCardScene"
        component={AnimatedCardScene as unknown as React.FC<Record<string, unknown>>}
        durationInFrames={180}
        fps={60}
        width={1920}
        height={1080}
        calculateMetadata={calculateMetadata}
        defaultProps={{
          title: "Card Title",
          subtitle: "Subtitle",
          description: "A beautifully animated card scene with particle burst effects.",
          seed: "default",
        }}
      />
      <Composition
        id="GlassShowcaseStack"
        component={GlassShowcaseStack as unknown as React.FC<Record<string, unknown>>}
        durationInFrames={240}
        fps={60}
        width={1920}
        height={1080}
        calculateMetadata={calculateMetadata}
      />
      {/* ================================================================ */}
      {/* Entrance — 入场展示                                               */}
      {/* ================================================================ */}
      <Composition
        id="AnimeDrop"
        component={MyComposition}
        durationInFrames={180}
        fps={60}
        width={1920}
        height={1080}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="HeroReveal"
        component={HeroReveal}
        durationInFrames={180}
        fps={60}
        width={1920}
        height={1080}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="GridReveal"
        component={GridReveal}
        durationInFrames={180}
        fps={60}
        width={1920}
        height={1080}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="CurtainReveal"
        component={CurtainReveal}
        durationInFrames={180}
        fps={60}
        width={1920}
        height={1080}
        calculateMetadata={calculateMetadata}
      />
      {/* ================================================================ */}
      {/* Transition — 场景转场                                             */}
      {/* ================================================================ */}
      <Composition
        id="MovieScreen"
        component={MovieScreen}
        durationInFrames={180}
        fps={60}
        width={1920}
        height={1080}
        calculateMetadata={calculateMetadata}
      />
      {/* ================================================================ */}
      {/* VFX — 视觉特效                                                    */}
      {/* ================================================================ */}
      <Composition
        id="LiquidGlass"
        component={LiquidGlass}
        durationInFrames={300}
        fps={60}
        width={1920}
        height={1080}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="WaterOrb"
        component={WaterOrb}
        durationInFrames={180}
        fps={60}
        width={1920}
        height={1080}
        calculateMetadata={calculateMetadata}
      />
      {/* ================================================================ */}
      {/* Character — 角色动画                                              */}
      {/* ================================================================ */}
      <Composition
        id="ClawdDrop"
        component={ClawdDrop}
        durationInFrames={180}
        fps={60}
        width={1920}
        height={1080}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="ClawdAction"
        component={ClawdAction}
        durationInFrames={180}
        fps={60}
        width={1920}
        height={1080}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};
