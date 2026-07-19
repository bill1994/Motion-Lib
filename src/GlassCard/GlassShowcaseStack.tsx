import React from 'react';
import { GlassCard } from './GlassCard';

const CARDS = [
  { label: '01', sub: 'Signal',    fanAngle: -6, offsetX: -220, offsetY: -30 },
  { label: '02', sub: 'Mesh',      fanAngle: -2, offsetX: -70,  offsetY: -70 },
  { label: '03', sub: 'Vault',     fanAngle: 2,  offsetX: 70,   offsetY: -70 },
  { label: '04', sub: 'Pulse',     fanAngle: 6,  offsetX: 220,  offsetY: -30 },
];

const CARD_WIDTH = 260;
const CARD_HEIGHT = 340;

export const GlassShowcaseStack: React.FC = () => {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {CARDS.map((card, i) => (
        <GlassCard
          key={card.label}
          variant="showcase"
          cardWidth={CARD_WIDTH}
          cardHeight={CARD_HEIGHT}
          durationInFrames={240}
          delay={i * 20}
          fanAngle={card.fanAngle}
          fanOffsetX={card.offsetX}
          fanOffsetY={card.offsetY}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: '#CBC0D3',
                lineHeight: 1,
              }}
            >
              {card.label}
            </span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 500,
                color: '#4E4D5C',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              {card.sub}
            </span>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};

export const catalogEntry = {
  name: 'GlassShowcaseStack',
  category: 'card',
  description: '4 张霓虹玻璃卡层叠堆叠 — 从中心扇面展开，staggered 入场',
  params: {},
};
