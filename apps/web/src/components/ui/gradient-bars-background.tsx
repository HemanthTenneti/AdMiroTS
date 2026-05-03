"use client";

import React from 'react';

interface GradientBarsProps {
  numBars?: number;
  gradientFrom?: string;
  gradientTo?: string;
  animationDuration?: number;
  flipped?: boolean;
  className?: string;
}

const GradientBars: React.FC<GradientBarsProps> = ({
  numBars = 15,
  gradientFrom = 'rgb(126, 58, 240)',
  gradientTo = 'transparent',
  animationDuration = 2,
  flipped = false,
  className = '',
}) => {
  const calculateHeight = (index: number, total: number) => {
    const position = index / (total - 1);
    const maxHeight = 100;
    const minHeight = 30;
    const center = 0.5;
    const distanceFromCenter = Math.abs(position - center);
    const heightPercentage = Math.pow(distanceFromCenter * 2, 1.2);
    return minHeight + (maxHeight - minHeight) * heightPercentage;
  };

  return (
    <>
      <style>{`
        @keyframes pulseBar {
          0% { transform: scaleY(var(--initial-scale)); }
          100% { transform: scaleY(calc(var(--initial-scale) * 0.7)); }
        }
      `}</style>
      <div className={`absolute inset-0 z-0 overflow-hidden ${className}`}>
        <div
          className="flex h-full"
          style={{
            width: '100%',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
          }}
        >
          {Array.from({ length: numBars }).map((_, index) => {
            const height = calculateHeight(index, numBars);
            return (
              <div
                key={index}
                style={{
                  flex: `1 0 calc(100% / ${numBars})`,
                  maxWidth: `calc(100% / ${numBars})`,
                  height: '100%',
                  background: `linear-gradient(${flipped ? 'to bottom' : 'to top'}, ${gradientFrom}, ${gradientTo})`,
                  transform: `scaleY(${height / 100})`,
                  transformOrigin: flipped ? 'top' : 'bottom',
                  animation: `pulseBar ${animationDuration}s ease-in-out infinite alternate`,
                  animationDelay: `${index * 0.1}s`,
                  // @ts-ignore
                  '--initial-scale': height / 100,
                }}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};

interface GradientBarsBackgroundProps {
  numBars?: number;
  gradientFrom?: string;
  gradientTo?: string;
  animationDuration?: number;
  backgroundColor?: string;
  overlayColor?: string;
  flipped?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function GradientBarsBackground({
  numBars = 20,
  gradientFrom = 'rgb(126, 58, 240)',
  gradientTo = 'transparent',
  animationDuration = 2,
  backgroundColor = 'rgb(8, 4, 16)',
  overlayColor,
  flipped = false,
  children,
  className = '',
}: GradientBarsBackgroundProps) {
  return (
    <section
      className={`relative w-full overflow-hidden ${className}`}
      style={{ backgroundColor }}
    >
      <GradientBars
        numBars={numBars}
        gradientFrom={gradientFrom}
        gradientTo={gradientTo}
        animationDuration={animationDuration}
        flipped={flipped}
      />
      {overlayColor && (
        <div className="absolute inset-0 z-[1]" style={{ background: overlayColor }} aria-hidden />
      )}
      {children && (
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      )}
    </section>
  );
}

export default GradientBarsBackground;
