import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BODY, C, DISPLAY} from './lib';
import {BIHAR, Elephant, Stupa} from './scenes';

const GANGA = 'M40 238 C 160 250, 260 300, 340 282 S 520 300, 600 316 S 780 330, 870 330';

/** 1280x720 YouTube thumbnail, drawn on a 1920x1080 canvas. */
export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{background: C.night}}>
    <svg viewBox="0 0 1920 1080" width="100%" height="100%">
      <defs>
        <radialGradient id="tbg" cx="30%" cy="55%" r="85%">
          <stop offset="0%" stopColor="#b8462a" />
          <stop offset="45%" stopColor="#5a1f2e" />
          <stop offset="100%" stopColor="#140f26" />
        </radialGradient>
        <linearGradient id="tgold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff4c4" />
          <stop offset="45%" stopColor="#f5c451" />
          <stop offset="100%" stopColor="#d07a12" />
        </linearGradient>
        <linearGradient id="tmap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffc35a" />
          <stop offset="100%" stopColor="#e2741e" />
        </linearGradient>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="28" />
        </filter>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#000" floodOpacity="0.6" />
        </filter>
      </defs>
      <rect width="1920" height="1080" fill="url(#tbg)" />
      {/* sun rays from behind the map */}
      {Array.from({length: 28}).map((_, i) => (
        <rect key={i} x={-9} y={-1400} width={18} height={1400} fill="#ffcf6a" opacity={0.08} transform={`translate(560 560) rotate(${i * 12.857})`} />
      ))}
      <circle cx={560} cy={560} r={330} fill="#ffb347" opacity={0.35} filter="url(#glow)" />

      {/* glowing Bihar map */}
      <g transform="translate(130 330) scale(0.95)">
        <path d={BIHAR} fill="#ffcf6a" filter="url(#glow)" opacity={0.7} />
        <path d={BIHAR} fill="url(#tmap)" stroke="#fff1c0" strokeWidth={10} strokeLinejoin="round" />
        <path d={GANGA} stroke="#7cc4ec" strokeWidth={16} fill="none" strokeLinecap="round" />
        {/* crown over Magadh / Patna */}
        <g transform="translate(420 190) scale(0.55)" filter="url(#shadow)">
          <path d="M-200 90 L-230 -120 L-110 -10 L0 -170 L110 -10 L230 -120 L200 90 Z" fill="url(#tgold)" stroke={C.ink} strokeWidth={14} strokeLinejoin="round" />
          <rect x={-205} y={90} width={410} height={60} rx={10} fill={C.saffron} stroke={C.ink} strokeWidth={14} />
          {[-120, 0, 120].map((x) => (
            <circle key={x} cx={x} cy={120} r={16} fill={C.red} />
          ))}
        </g>
      </g>

      {/* stupa behind the title */}
      <g opacity={0.9} filter="url(#shadow)">
        <Stupa x={1700} y={1080} s={1.05} />
      </g>

      {/* war elephant, foreground */}
      <g transform="translate(330 905) scale(0.95)" filter="url(#shadow)">
        <Elephant trunk={1} leg={0.4} />
      </g>
      <rect x={0} y={1040} width={1920} height={40} fill="#140f26" opacity={0.6} />

      {/* title block */}
      <text x={1360} y={180} textAnchor="middle" fontFamily={BODY} fontWeight={700} fontSize={64} fill={C.cream} letterSpacing={2} filter="url(#shadow)">
        बिहार की कहानी
      </text>
      <text
        x={1360}
        y={530}
        textAnchor="middle"
        fontFamily={DISPLAY}
        fontSize={380}
        fill="url(#tgold)"
        stroke="#2a0d08"
        strokeWidth={22}
        paintOrder="stroke"
        strokeLinejoin="round"
        filter="url(#shadow)"
      >
        मगध
      </text>
      <g transform="translate(1360 690) rotate(-2)" filter="url(#shadow)">
        <rect x={-500} y={-78} width={1000} height={130} rx={18} fill={C.red} stroke="#fff1c0" strokeWidth={6} />
        <text y={20} textAnchor="middle" fontFamily={BODY} fontWeight={700} fontSize={70} fill="#fff6e0">
          भारत का पहला महान साम्राज्य
        </text>
      </g>
      <text x={1360} y={860} textAnchor="middle" fontFamily={BODY} fontWeight={700} fontSize={56} fill={C.gold} filter="url(#shadow)">
        ढाई हज़ार साल पहले…
      </text>
      <rect x={14} y={14} width={1892} height={1052} rx={10} fill="none" stroke={C.gold} strokeWidth={8} opacity={0.6} />
    </svg>
  </AbsoluteFill>
);
