'use client';

import { useState, useEffect, useRef } from 'react';
import './MicrogreenGrow.css';

export default function MicrogreenGrow() {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollFraction = Math.min(scrollTop / docHeight, 1);
        setProgress(scrollFraction);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Growth stages from progress (0 → 1)
  const seedOpacity = Math.min(progress * 8, 1);
  const rootLength = Math.min(Math.max((progress - 0.03) * 6, 0), 1);
  const stemHeight = Math.min(Math.max((progress - 0.08) * 1.8, 0), 1);

  // Generate 16 leaves dynamically
  const numLeaves = 16;
  const leafProgresses = Array.from({ length: numLeaves }).map((_, i) => {
    const startProgress = 0.2 + (i * 0.035);
    return Math.min(Math.max((progress - startProgress) * 5, 0), 1);
  });

  const flowerBloom = Math.min(Math.max((progress - 0.8) * 5, 0), 1);
  const sparkle = Math.min(Math.max((progress - 0.9) * 10, 0), 1);

  // Stem endpoints: grows from bottom (y=920) toward top (y=60)
  const stemStartY = 880;
  const stemEndTarget = 60;
  const stemCurrentEndY = stemStartY - (stemStartY - stemEndTarget) * stemHeight;

  const leafPositions = Array.from({ length: numLeaves }).map((_, i) => {
    const yFraction = 0.1 + (i * 0.05);
    return {
      y: stemStartY - (stemStartY - stemEndTarget) * yFraction,
      side: i % 2 === 0 ? 'right' : 'left'
    };
  });

  return (
    <div className="microgreen-container">
      {/* Glow behind the plant */}
      <div
        className="microgreen-glow"
        style={{ opacity: stemHeight * 0.5, height: `${stemHeight * 80}%` }}
      />

      <svg
        viewBox="0 0 200 960"
        className="microgreen-svg"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMax meet"
      >
        {/* Gradients & Defs */}
        <defs>
          <linearGradient id="stemGradient" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#1a6b4a" />
            <stop offset="50%" stopColor="#2ecc71" />
            <stop offset="100%" stopColor="#58d68d" />
          </linearGradient>
          <linearGradient id="leafGradientR" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2ecc71" />
            <stop offset="100%" stopColor="#27ae60" />
          </linearGradient>
          <linearGradient id="leafGradientL" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#58d68d" />
            <stop offset="100%" stopColor="#2ecc71" />
          </linearGradient>
          <radialGradient id="flowerGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f9e866" />
            <stop offset="70%" stopColor="#f7dc6f" />
            <stop offset="100%" stopColor="#f0c040" />
          </radialGradient>
        </defs>

        {/* === SOIL BASE === */}
        <ellipse
          cx="100" cy="930" rx="40" ry="10"
          fill="rgba(101, 67, 33, 0.25)"
          style={{ opacity: seedOpacity }}
        />

        {/* Small glass pot */}
        <path
          d="M65 895 Q62 935 78 940 L122 940 Q138 935 135 895 Z"
          fill="rgba(255, 255, 255, 0.1)"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1"
          style={{ opacity: seedOpacity }}
        />
        <ellipse
          cx="100" cy="895" rx="35" ry="7"
          fill="rgba(101, 67, 33, 0.4)"
          style={{ opacity: seedOpacity }}
        />

        {/* === SEED === */}
        <ellipse
          cx="100" cy="890" rx="5" ry="3.5"
          fill="#8B6914"
          style={{ opacity: seedOpacity, filter: 'drop-shadow(0 0 3px rgba(139, 105, 20, 0.5))' }}
        />

        {/* === ROOTS === */}
        <g style={{ opacity: rootLength }}>
          <path
            d={`M100 893 Q94 ${893 + 18 * rootLength} 88 ${893 + 30 * rootLength}`}
            stroke="rgba(139, 105, 20, 0.45)" strokeWidth="1.5" fill="none" strokeLinecap="round"
            strokeDasharray="50" strokeDashoffset={50 * (1 - rootLength)}
          />
          <path
            d={`M100 893 Q106 ${893 + 14 * rootLength} 114 ${893 + 26 * rootLength}`}
            stroke="rgba(139, 105, 20, 0.35)" strokeWidth="1" fill="none" strokeLinecap="round"
            strokeDasharray="40" strokeDashoffset={40 * (1 - rootLength)}
          />
          <path
            d={`M100 893 Q100 ${893 + 20 * rootLength} 99 ${893 + 35 * rootLength}`}
            stroke="rgba(139, 105, 20, 0.3)" strokeWidth="1" fill="none" strokeLinecap="round"
            strokeDasharray="40" strokeDashoffset={40 * (1 - rootLength)}
          />
        </g>

        {/* === MAIN STEM — Grows from bottom to top of screen === */}
        <path
          d={`M100 ${stemStartY} C98 ${stemStartY - 200} 102 ${stemStartY - 500} 100 ${stemEndTarget}`}
          stroke="url(#stemGradient)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="900"
          strokeDashoffset={900 * (1 - stemHeight)}
          style={{ filter: 'drop-shadow(0 0 6px rgba(46, 204, 113, 0.25))' }}
        />

        {/* === BRANCH === */}
        {stemHeight > 0.25 && (
          <>
            <path
              d={`M100 ${stemStartY - 200} Q160 ${stemStartY - 250} 170 ${stemStartY - 380}`}
              stroke="url(#stemGradient)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="400"
              strokeDashoffset={400 * (1 - Math.min((stemHeight - 0.25) * 2, 1))}
              style={{ filter: 'drop-shadow(0 0 6px rgba(46, 204, 113, 0.25))' }}
            />
            {/* Dense leaves on the branch */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
              const branchProgress = Math.min(Math.max(((stemHeight - 0.25) * 2) - (i * 0.1), 0), 1);
              if (branchProgress <= 0) return null;
              
              // Points along the branch curve (rough approximation)
              const bx = 100 + (70 * (i/7));
              const by = (stemStartY - 200) - (180 * Math.pow(i/7, 1.5));
              const isRight = i % 2 === 0;
              const leafSize = 20 + (i % 3) * 4;
              const leafAngle = isRight ? 40 + i * 5 : -40 - i * 5;
              
              return (
                <g key={`branch-leaf-${i}`} style={{
                  opacity: branchProgress,
                  transform: `scale(${0.5 + branchProgress * 0.5}) rotate(${leafAngle * branchProgress}deg)`,
                  transformOrigin: `${bx}px ${by}px`,
                  transition: 'transform 0.4s ease, opacity 0.3s ease',
                }}>
                  {isRight ? (
                    <path
                      d={`M${bx} ${by} Q${bx + leafSize * 0.7} ${by - leafSize * 0.5} ${bx + leafSize} ${by - leafSize * 0.7} Q${bx + leafSize * 0.6} ${by + leafSize * 0.1} ${bx} ${by}`}
                      fill="url(#leafGradientR)"
                    />
                  ) : (
                    <path
                      d={`M${bx} ${by} Q${bx - leafSize * 0.7} ${by - leafSize * 0.5} ${bx - leafSize} ${by - leafSize * 0.7} Q${bx - leafSize * 0.6} ${by + leafSize * 0.1} ${bx} ${by}`}
                      fill="url(#leafGradientL)"
                    />
                  )}
                </g>
              );
            })}
          </>
        )}

        {/* === LEAVES along the stem === */}
        {leafPositions.map((pos, i) => {
          const lp = leafProgresses[i];
          if (lp <= 0) return null;

          const isRight = pos.side === 'right';
          const leafSize = 28 + (i % 3) * 6; // Vary leaf sizes
          const leafAngle = isRight ? (-20 - i * 3) : (20 + i * 3);

          // Stem X at this Y (approximately 100 due to slight curve)
          const stemX = 100;

          // Only show leaf if stem has grown past this point
          if (pos.y < stemCurrentEndY) return null;

          return (
            <g
              key={i}
              style={{
                opacity: lp,
                transform: `scale(${0.5 + lp * 0.5}) rotate(${leafAngle * lp}deg)`,
                transformOrigin: `${stemX}px ${pos.y}px`,
                transition: 'transform 0.4s ease, opacity 0.3s ease',
              }}
            >
              {isRight ? (
                <>
                  <path
                    d={`M${stemX} ${pos.y} Q${stemX + leafSize * 0.7} ${pos.y - leafSize * 0.5} ${stemX + leafSize} ${pos.y - leafSize * 0.7} Q${stemX + leafSize * 0.6} ${pos.y + leafSize * 0.1} ${stemX} ${pos.y}`}
                    fill="url(#leafGradientR)"
                    style={{ filter: 'drop-shadow(0 2px 6px rgba(46, 204, 113, 0.25))' }}
                  />
                  <path
                    d={`M${stemX} ${pos.y} Q${stemX + leafSize * 0.5} ${pos.y - leafSize * 0.35} ${stemX + leafSize * 0.85} ${pos.y - leafSize * 0.6}`}
                    stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" fill="none"
                  />
                </>
              ) : (
                <>
                  <path
                    d={`M${stemX} ${pos.y} Q${stemX - leafSize * 0.7} ${pos.y - leafSize * 0.5} ${stemX - leafSize} ${pos.y - leafSize * 0.7} Q${stemX - leafSize * 0.6} ${pos.y + leafSize * 0.1} ${stemX} ${pos.y}`}
                    fill="url(#leafGradientL)"
                    style={{ filter: 'drop-shadow(0 2px 6px rgba(46, 204, 113, 0.25))' }}
                  />
                  <path
                    d={`M${stemX} ${pos.y} Q${stemX - leafSize * 0.5} ${pos.y - leafSize * 0.35} ${stemX - leafSize * 0.85} ${pos.y - leafSize * 0.6}`}
                    stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" fill="none"
                  />
                </>
              )}
            </g>
          );
        })}

        {/* === FLOWER at the TOP === */}
        <g
          style={{
            opacity: flowerBloom,
            transform: `scale(${flowerBloom * 0.7 + 0.3})`,
            transformOrigin: `100px ${stemEndTarget}px`,
          }}
        >
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <ellipse
              key={i}
              cx="100"
              cy={stemEndTarget - 12 * flowerBloom}
              rx={5 * flowerBloom}
              ry={12 * flowerBloom}
              fill="url(#flowerGradient)"
              style={{
                transform: `rotate(${angle}deg)`,
                transformOrigin: `100px ${stemEndTarget - 12 * flowerBloom}px`,
                filter: 'drop-shadow(0 0 8px rgba(249, 232, 102, 0.4))',
                opacity: 0.85,
              }}
            />
          ))}
          <circle
            cx="100"
            cy={stemEndTarget - 12 * flowerBloom}
            r={4 * flowerBloom}
            fill="#f39c12"
            style={{ filter: 'drop-shadow(0 0 4px rgba(243, 156, 18, 0.5))' }}
          />
        </g>

        {/* === SPARKLES along the full height === */}
        {sparkle > 0 && (
          <g style={{ opacity: sparkle }}>
            {[
              { x: 65, y: 120, delay: 0 },
              { x: 140, y: 200, delay: 0.2 },
              { x: 55, y: 350, delay: 0.4 },
              { x: 145, y: 450, delay: 0.6 },
              { x: 60, y: 580, delay: 0.1 },
              { x: 150, y: 680, delay: 0.3 },
              { x: 70, y: 760, delay: 0.5 },
              { x: 135, y: 280, delay: 0.7 },
              { x: 50, y: 500, delay: 0.15 },
              { x: 155, y: 150, delay: 0.45 },
            ].map((p, i) => (
              <circle
                key={i}
                cx={p.x} cy={p.y}
                r={2 * sparkle}
                fill="#2ecc71"
                className="sparkle-particle"
                style={{
                  animationDelay: `${p.delay}s`,
                  filter: 'drop-shadow(0 0 5px rgba(46, 204, 113, 0.6))',
                }}
              />
            ))}
          </g>
        )}
      </svg>

      {/* Growth progress label */}
      <div
        className="microgreen-label"
        style={{ opacity: Math.min(progress * 4, 1) }}
      >
        <span className="microgreen-label-dot" />
        <span className="microgreen-label-text">
          {progress < 0.08 ? 'Seed' :
           progress < 0.2 ? 'Sprouting' :
           progress < 0.4 ? 'Growing' :
           progress < 0.6 ? 'Leafing' :
           progress < 0.8 ? 'Reaching' :
           progress < 0.95 ? 'Blooming' : 'Flourished!'}
        </span>
      </div>
    </div>
  );
}
