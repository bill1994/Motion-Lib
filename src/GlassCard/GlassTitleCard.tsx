import React from 'react';
import { GlassCard } from './GlassCard';

export const GlassTitleCard: React.FC = () => {
  return (
    <GlassCard
      variant="title"
      cardWidth={800}
      cardHeight={400}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 12,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 72,
            fontWeight: 800,
            color: '#CBC0D3',
            letterSpacing: '0.05em',
            lineHeight: 1.1,
            textAlign: 'center',
          }}
        >
          DIMENSIONAL<br />INTERFACE
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 400,
            color: '#4E4D5C',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          Glass · Neon · Depth
        </p>
      </div>
    </GlassCard>
  );
};

export const catalogEntry = {
  name: 'GlassTitleCard',
  category: 'typography',
  description:
    '霓虹玻璃质感片头标题卡 — Neo surface 风格，tilt 入场 + glow 脉冲',
  params: {},
};
