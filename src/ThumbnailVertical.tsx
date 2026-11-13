import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BODY, C, DISPLAY} from './lib';
import {BIHAR, Elephant, Stupa} from './scenes';

const GANGA = 'M40 238 C 160 250, 260 300, 340 282 S 520 300, 600 316 S 780 330, 870 330';

/** 1080x1920 vertical cover for Shorts / Reels. */
export const ThumbnailVertical: React.FC = () => (
  <AbsoluteFill style={{background: C.night}}>
    <svg viewBox="0 0 1080 1920" width="100%" height="100%">
      <defs>
        <radialGradient id="vbg" cx="50%" cy="58%" r="80%">
          <stop offset="0%" stopColor="#b8462a" />
          <stop offset="45%" stopColor="#5a1f2e" />
          <stop offset="100%" stopColor="#140f26" />
        </radialGradient>
        <linearGradient id="vgold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff4c4" />
          <stop offset="45%" stopColor="#f5c451" />
          <stop offset="100%" stopColor="#d07a12" />
        </linearGradient>
        <linearGradient id="vmap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffc35a" />
          <stop offset="100%" stopColor="#e2741e" />
        </linearGradient>
        <filter id="vglow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="28" />
        </filter>
        <filter id="vshadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000" floodOpacity="0.6" />
        </filter>
      </defs>
      <rect width="1080" height="1920" fill="url(#vbg)" />
      {Array.from({length: 28}).map((_, i) => (
        <rect key={i} x={-9} y={-2200} width={18} height={2200} fill="#ffcf6a" opacity={0.08} transform={`translate(540 1120) rotate(${i * 12.857})`} />
      ))}
      <circle cx={540} cy={1120} r={360} fill="#ffb347" opacity={0.35} filter="url(#vglow)" />

      {/* title block, kept in the upper-middle safe area */}
      <text x={540} y={250} textAnchor="middle" fontFamily={BODY} fontWeight={700} fontSize={78} fill={C.cream} filter="url(#vshadow)">
        बिहार की कहानी
      </text>
      <text
        x={540}
        y={570}
        textAnchor="middle"
        fontFamily={DISPLAY}
        fontSize={330}
        fill="url(#vgold)"
        stroke="#2a0d08"
        strokeWidth={20}
        paintOrder="stroke"
        strokeLinejoin="round"
        filter="url(#vshadow)"
      >
        मगध
      </text>
      <g transform="translate(540 730) rotate(-2)" filter="url(#vshadow)">
        <rect x={-470} y={-74} width={940} height={124} rx={18} fill={C.red} stroke="#fff1c0" strokeWidth={6} />
        <text y={20} textAnchor="middle" fontFamily={BODY} fontWeight={700} fontSize={64} fill="#fff6e0">
          भारत का पहला महान साम्राज्य
        </text>
      </g>
      <text x={540} y={880} textAnchor="middle" fontFamily={BODY} fontWeight={700} fontSize={56} fill={C.gold} filter="url(#vshadow)">
        ढाई हज़ार साल पहले…
      </text>

      {/* glowing Bihar map with crown */}
      <g transform="translate(108 900) scale(0.96)">
        <path d={BIHAR} fill="#ffcf6a" filter="url(#vglow)" opacity={0.7} />
        <path d={BIHAR} fill="url(#vmap)" stroke="#fff1c0" strokeWidth={10} strokeLinejoin="round" />
        <path d={GANGA} stroke="#7cc4ec" strokeWidth={16} fill="none" strokeLinecap="round" />
        <g transform="translate(450 200) scale(0.55)" filter="url(#vshadow)">
          <path d="M-200 90 L-230 -120 L-110 -10 L0 -170 L110 -10 L230 -120 L200 90 Z" fill="url(#vgold)" stroke={C.ink} strokeWidth={14} strokeLinejoin="round" />
          <rect x={-205} y={90} width={410} height={60} rx={10} fill={C.saffron} stroke={C.ink} strokeWidth={14} />
          {[-120, 0, 120].map((x) => (
            <circle key={x} cx={x} cy={120} r={16} fill={C.red} />
          ))}
        </g>
      </g>

      <g opacity={0.95} filter="url(#vshadow)">
        <Stupa x={900} y={1920} s={0.95} />
      </g>
      <g transform="translate(330 1700) scale(0.95)" filter="url(#vshadow)">
        <Elephant trunk={1} leg={0.4} />
      </g>
      <rect x={14} y={14} width={1052} height={1892} rx={10} fill="none" stroke={C.gold} strokeWidth={8} opacity={0.6} />
    </svg>
  </AbsoluteFill>
);
