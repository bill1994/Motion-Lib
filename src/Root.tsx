import "./index.css";
import { Composition, CalculateMetadataFunction } from "remotion";
import { MyComposition } from "./Composition";
import { HeroReveal } from "./HeroReveal";
import { PhysicsDrop } from "./PhysicsDrop";
import { OrbitalRelaunch } from "./OrbitalRelaunch";
import { TextIntro } from "./TextIntro";
import { LiquidGlass } from "./LiquidGlass";

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
        id="PhysicsDrop"
        component={PhysicsDrop}
        durationInFrames={180}
        fps={60}
        width={1920}
        height={1080}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="OrbitalRelaunch"
        component={OrbitalRelaunch}
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
        id="TextIntro"
        component={TextIntro}
        durationInFrames={180}
        fps={60}
        width={1920}
        height={1080}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="LiquidGlass"
        component={LiquidGlass}
        durationInFrames={300}
        fps={60}
        width={1920}
        height={1080}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};
