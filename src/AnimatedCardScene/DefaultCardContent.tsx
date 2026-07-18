import React from 'react';
import { Img } from 'remotion';
import type { CardContentProps } from './types';

interface DefaultCardContentProps extends CardContentProps {
  className?: string;
}

const DefaultCardContent: React.FC<DefaultCardContentProps> = ({
  title,
  subtitle,
  imageUrl,
  description,
  accentColor,
  className = '',
}) => {
  return (
    <div className={`flex flex-col p-6 gap-3 ${className}`}>
      {accentColor && (
        <div
          className="w-12 h-1 rounded-full shrink-0"
          style={{ backgroundColor: accentColor }}
        />
      )}
      {imageUrl && (
        <Img
          src={imageUrl}
          alt={title}
          className="w-full h-40 object-cover rounded-lg"
          style={{
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        />
      )}
      <h2
        className="text-2xl font-bold leading-tight m-0"
        style={{
          color: '#1D1B20',
          textShadow: '0 0 1px rgba(203,192,211,0.5), 0 0 2px rgba(203,192,211,0.3)',
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <h3
          className="text-lg font-medium leading-snug m-0"
          style={{
            color: '#4E4D5C',
            textShadow: '0 0 1px rgba(203,192,211,0.3)',
          }}
        >
          {subtitle}
        </h3>
      )}
      {description && (
        <p
          className="text-base leading-relaxed m-0"
          style={{ color: '#4E4D5C' }}
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default DefaultCardContent;
