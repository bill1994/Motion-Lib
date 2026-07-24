import "./index.css";
import { Composition, CalculateMetadataFunction } from "remotion";
import { MyComposition } from "./Composition";
import { HeroReveal } from "./HeroReveal";
import { TitleReveal } from "./TitleReveal";
import { LiquidGlass } from "./LiquidGlass";
import { WaterOrb } from "./WaterOrb";
import { TextScramble } from "./TextScramble";
import { GridReveal } from "./GridReveal";
import { CurtainReveal } from "./CurtainReveal";
import { MovieScreen } from "./MovieScreen";
import { ClawdScene } from "./ClawdScene";
import { AnimatedCardScene } from "./AnimatedCardScene/AnimatedCardScene";
import { WordReveal } from "./WordReveal";
import { GlassCard } from "./GlassCard/GlassCard";
import { SceneTransition } from "./SceneTransition";
import { DominoCascade } from "./DominoCascade";

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

const GlassTitleCard: React.FC = () => (
  <GlassCard variant="title" cardWidth={800} cardHeight={400}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
      <h1 style={{ margin: 0, fontSize: 72, fontWeight: 800, color: '#CBC0D3', letterSpacing: '0.05em', lineHeight: 1.1, textAlign: 'center' }}>
        DIMENSIONAL<br />INTERFACE
      </h1>
      <p style={{ margin: 0, fontSize: 20, fontWeight: 400, color: '#4E4D5C', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
        Glass · Neon · Depth
      </p>
    </div>
  </GlassCard>
);

const GlassShowcaseStack: React.FC = () => {
  const CARDS = [
    { label: '01', sub: 'Signal',    fanAngle: -6, offsetX: -220, offsetY: -30 },
    { label: '02', sub: 'Mesh',      fanAngle: -2, offsetX: -70,  offsetY: -70 },
    { label: '03', sub: 'Vault',     fanAngle: 2,  offsetX: 70,   offsetY: -70 },
    { label: '04', sub: 'Pulse',     fanAngle: 6,  offsetX: 220,  offsetY: -30 },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {CARDS.map((card, i) => (
        <GlassCard
          key={card.label}
          variant="showcase"
          cardWidth={260}
          cardHeight={340}
          durationInFrames={240}
          delay={i * 20}
          fanAngle={card.fanAngle}
          fanOffsetX={card.offsetX}
          fanOffsetY={card.offsetY}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8 }}>
            <span style={{ fontSize: 48, fontWeight: 800, color: '#CBC0D3', lineHeight: 1 }}>{card.label}</span>
            <span style={{ fontSize: 16, fontWeight: 500, color: '#4E4D5C', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{card.sub}</span>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ================================================================ */}
      {/* Typography — 文字动画                                               */}
      {/* ================================================================ */}
      <Composition
        id="TitleRevealSlideUp"
        component={() => <TitleReveal mode="slideUp" />}
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
        id="TitleRevealPanel"
        component={() => <TitleReveal mode="panel" text="media" />}
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
      <Composition
        id="TitleRevealFlip3d"
        component={() => <TitleReveal mode="flip3d" text="ZHanWeiFU" />}
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
        component={() => (
          <AnimatedCardScene
            entranceStyle="cardFlyUp"
            startX={800}
            startY={960}
            cardWidth={320}
            cardHeight={420}
            backgroundColor="#2b2b2b"
            boxShadow="0 8px 32px rgba(0,0,0,0.3)"
            config={{
              timeline: { introDuration: 76, holdDuration: 14, outroDuration: 0 },
              card: { breathingAmplitude: 0, breathingCycle: 60, rotateYStart: 0, entranceStyle: 'cardFlyUp' },
              particle: { count: 0, gravity: 0.3, drag: 0.95, minSpeed: 0, maxSpeed: 0, minSize: 0, maxSize: 0, fadeDuration: 0 },
            }}
          />
        )}
        durationInFrames={90}
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
          cardWidth: 672,
          glowEdgeEnabled: true,
          glowEdgeColor: "#CBC0D3",
          glowEdgeIntensity: 2.0,
          glowEdgeRotationDuration: 120,

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
      <Composition
        id="DominoCascade"
        component={DominoCascade as unknown as React.FC<Record<string, unknown>>}
        durationInFrames={240}
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
      <Composition
        id="SceneTransition"
        component={SceneTransition as unknown as React.FC<Record<string, unknown>>}
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
        id="ClawdSceneDrop"
        component={() => <ClawdScene routine="drop" />}
        durationInFrames={180}
        fps={60}
        width={1920}
        height={1080}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="ClawdSceneAction"
        component={() => <ClawdScene routine="action" />}
        durationInFrames={180}
        fps={60}
        width={1920}
        height={1080}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};
