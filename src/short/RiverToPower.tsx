import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {BODY, DISPLAY} from '../lib';

/**
 * 10-second explainer in a flat, geometric, paper-grain illustration style:
 * rivers -> fertile soil -> paddy -> the strength of Magadh.
 */
export const SHORT_SECONDS = 10;

const K = {
  paper: '#efe8d8',
  sky: '#93d0d1',
  sun: '#f2c53d',
  sunLight: '#f6d977',
  cloud: '#c9dbe6',
  green: '#4f8a35',
  greenDark: '#2f5d27',
  greenLight: '#9fc54a',
  greenPale: '#c5dc6e',
  river: '#4f9cc4',
  riverLight: '#9fd3e6',
  soil: '#a8743f',
  brown: '#6b3e22',
  brownLight: '#8d5a33',
  orange: '#e0662a',
  orangeDark: '#b84d1c',
  skin: '#e58a68',
  skinDark: '#c96a4c',
  cream: '#e8d9b8',
  creamDark: '#cdb990',
  grey: '#8b8794',
  greyDark: '#6e6a78',
  ink: '#3a2a20',
  red: '#c8442c',
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const r = (t: number, a: number, b: number, from = 0, to = 1, e = Easing.out(Easing.cubic)) =>
  interpolate(t, [a, b], [from, to], {...clamp, easing: e});
const sp = (t: number, at: number, damping = 12) =>
  t < at ? 0 : spring({frame: (t - at) * 30, fps: 30, config: {damping, stiffness: 130, mass: 0.8}});

// Cloud-shaped "window" made of overlapping circles.
const BLOB: [number, number, number][] = [
  [790, 330, 240],
  [560, 520, 220],
  [1020, 560, 240],
  [720, 730, 300],
  [1030, 820, 220],
  [470, 860, 170],
];

const Paper: React.FC = () => (
  <>
    <rect width="1920" height="1080" fill={K.paper} />
    <rect width="1920" height="1080" filter="url(#grain)" opacity={0.9} />
  </>
);

/** Tilted geometric tree: thin trunk and a leaf blob with a flat shadow half. */
const Tree: React.FC<{x: number; y: number; s?: number; sway: number; flip?: boolean}> = ({x, y, s = 1, sway, flip}) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s}) rotate(${sway})`}>
    <path d="M0 0 L8 0 L40 -150 L34 -152 Z" fill={K.brown} />
    <path d="M30 -110 L90 -132 L92 -126 L34 -102 Z" fill={K.brown} />
    <circle cx={98} cy={-128} r={32} fill={K.green} />
    <path d="M-80 -150 Q-90 -260 10 -280 Q120 -300 130 -200 Q130 -150 60 -150 Z" fill={K.green} />
    <path d="M10 -280 Q120 -300 130 -200 Q130 -150 60 -150 Q90 -210 10 -280 Z" fill={K.greenDark} />
  </g>
);

const Pine: React.FC<{x: number; y: number; h: number; s: number}> = ({x, y, h, s}) => (
  <g transform={`translate(${x} ${y}) scale(1 ${s})`}>
    <path d={`M0 ${-h} L-18 0 L18 0 Z`} fill={K.greenDark} />
    <path d={`M0 ${-h} L0 0 L18 0 Z`} fill="#1f4420" />
  </g>
);

const Bird: React.FC<{x: number; y: number; flap: number; color?: string; s?: number}> = ({x, y, flap, color = K.grey, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
    <path d={`M0 0 Q-16 ${-10 - flap * 10} -34 ${-4 - flap * 14} Q-14 ${-2} 0 8 Q14 -2 34 ${-4 - flap * 14} Q16 ${-10 - flap * 10} 0 0 Z`} />
  </g>
);

const Farmer: React.FC<{t: number}> = ({t}) => {
  const swing = Math.sin(Math.max(0, t - 4.1) * 5) * 14 * r(t, 4.0, 4.4) * (1 - r(t, 6.3, 6.8));
  return (
    <g>
      {/* legs + dhoti */}
      <path d="M-40 -170 L40 -170 L52 -40 L-48 -40 Z" fill="#f3ead6" />
      <path d="M0 -170 L40 -170 L52 -40 L6 -40 Z" fill={K.creamDark} />
      <path d="M-34 -40 L-14 -40 L-14 0 L-34 0 Z" fill={K.skinDark} />
      <path d="M14 -40 L34 -40 L34 0 L14 0 Z" fill={K.skinDark} />
      <path d="M-44 0 L-8 0 L-8 -8 L-40 -10 Z" fill={K.brown} />
      <path d="M10 0 L50 0 L48 -10 L12 -8 Z" fill={K.brown} />
      {/* torso */}
      <path d="M-46 -300 L46 -300 L42 -165 L-42 -165 Z" fill={K.cream} />
      <path d="M8 -300 L46 -300 L42 -165 L4 -165 Z" fill={K.creamDark} />
      {/* gamchha */}
      <path d="M-46 -300 L-8 -300 L40 -200 L22 -192 Z" fill={K.red} />
      <path d="M-30 -300 L-20 -300 L32 -196 L26 -194 Z" fill="#f0e2c4" />
      {/* arm with sickle */}
      <g transform={`translate(30 -280) rotate(${-30 + swing})`}>
        <path d="M0 0 L22 0 L70 70 L54 80 Z" fill={K.cream} />
        <path d="M54 80 L70 70 L120 70 L118 86 Z" fill={K.skin} />
        <path d="M118 78 L150 78" stroke={K.brown} strokeWidth={10} strokeLinecap="round" />
        <path d="M148 78 Q200 40 170 -10 Q190 40 146 70 Z" fill="#cfd6dc" />
      </g>
      {/* head */}
      <path d="M-28 -360 L22 -360 L30 -312 L-10 -300 L-30 -320 Z" fill={K.skin} />
      <path d="M22 -350 L40 -336 L24 -330 Z" fill={K.skinDark} />
      <path d="M2 -318 Q14 -310 22 -320" stroke={K.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M4 -346 L16 -344" stroke={K.ink} strokeWidth={4} strokeLinecap="round" />
      {/* conical hat */}
      <path d="M-90 -350 L0 -420 L90 -350 Q0 -336 -90 -350 Z" fill="#e2c27a" />
      <path d="M0 -420 L90 -350 Q40 -342 0 -340 Z" fill="#c9a45a" />
      <path d="M-60 -362 Q0 -352 60 -362" stroke={K.brownLight} strokeWidth={4} fill="none" />
    </g>
  );
};

const Elephant: React.FC<{t: number}> = ({t}) => {
  const trunk = r(t, 7.6, 8.1) * (1 - r(t, 9.1, 9.6)) * 130;
  const step = t < 7.6 ? Math.sin(t * 9) : 0;
  return (
    <g>
      {/* back legs */}
      <rect x={150} y={-150} width={62} height={150} fill={K.greyDark} transform={`rotate(${-step * 5} 180 -150)`} />
      <rect x={-120} y={-150} width={62} height={150} fill={K.greyDark} transform={`rotate(${step * 5} -90 -150)`} />
      {/* body */}
      <path d="M-170 -150 Q-180 -330 0 -340 L190 -330 Q260 -300 250 -150 Z" fill={K.grey} />
      <path d="M40 -338 L190 -330 Q260 -300 250 -150 L120 -150 Q170 -260 40 -338 Z" fill={K.greyDark} opacity={0.6} />
      <path d="M250 -230 Q290 -200 280 -150" stroke={K.greyDark} strokeWidth={10} fill="none" strokeLinecap="round" />
      {/* saddle cloth */}
      <path d="M-40 -336 L130 -334 L120 -190 L-30 -190 Z" fill={K.orange} />
      <path d="M50 -335 L130 -334 L120 -190 L52 -190 Z" fill={K.orangeDark} />
      <path d="M-30 -210 L120 -210" stroke={K.sun} strokeWidth={8} />
      <path d="M40 -336 L40 -430" stroke={K.brown} strokeWidth={8} />
      <path d={`M44 -430 L${110 + Math.sin(t * 7) * 8} -414 L44 -396 Z`} fill={K.red} />
      {/* front legs */}
      <rect x={-150} y={-160} width={64} height={160} fill={K.grey} transform={`rotate(${-step * 5} -118 -160)`} />
      <rect x={110} y={-160} width={64} height={160} fill={K.grey} transform={`rotate(${step * 5} 142 -160)`} />
      {[-150, 110].map((x) => (
        <path key={x} d={`M${x + 8} -6 h14 v6 h-14 Z M${x + 28} -6 h14 v6 h-14 Z M${x + 48} -6 h10 v6 h-10 Z`} fill={K.cream} />
      ))}
      {/* head */}
      <path d="M-170 -150 Q-290 -170 -290 -280 Q-280 -370 -170 -360 Q-120 -340 -130 -250 Z" fill={K.grey} />
      <path d="M-200 -350 Q-90 -380 -80 -280 Q-90 -210 -170 -200 Q-130 -280 -200 -350 Z" fill={K.greyDark} />
      <circle cx={-235} cy={-290} r={8} fill={K.ink} />
      <path d="M-262 -205 Q-300 -195 -312 -215" stroke="#f7f1e2" strokeWidth={12} fill="none" strokeLinecap="round" />
      {/* trunk */}
      <g transform={`rotate(${trunk} -270 -230)`}>
        <path d="M-290 -250 Q-330 -150 -300 -40 L-270 -40 Q-290 -150 -250 -220 Z" fill={K.grey} />
        <path d="M-300 -40 L-268 -40 L-262 -24 L-306 -24 Z" fill={K.greyDark} />
      </g>
    </g>
  );
};

const Icon: React.FC<{x: number; on: number; kind: 'drop' | 'paddy' | 'elephant'}> = ({x, on, kind}) => (
  <g transform={`translate(${x} 900) scale(${0.85 + 0.15 * on})`} opacity={0.35 + 0.65 * on}>
    <circle r={58} fill={on > 0.5 ? K.sun : K.cream} />
    {kind === 'drop' && (
      <>
        <path d="M0 -36 Q30 4 22 18 Q14 36 0 36 Q-14 36 -22 18 Q-30 4 0 -36 Z" fill={K.river} />
        <path d="M0 -36 Q30 4 22 18 Q14 36 0 36 Z" fill="#3a7fa6" />
      </>
    )}
    {kind === 'paddy' && (
      <>
        {[-18, 0, 18].map((dx) => (
          <path key={dx} d={`M${dx} 34 L${dx + 3} -30`} stroke={K.green} strokeWidth={5} />
        ))}
        {[-18, 0, 18].map((dx) => (
          <ellipse key={'e' + dx} cx={dx + 8} cy={-24} rx={6} ry={14} fill="#d9a42a" transform={`rotate(20 ${dx + 8} -24)`} />
        ))}
      </>
    )}
    {kind === 'elephant' && (
      <g transform="scale(0.17) translate(40 170)">
        <path d="M-170 -150 Q-180 -330 0 -340 L190 -330 Q260 -300 250 -150 Z" fill={K.grey} />
        <path d="M-170 -150 Q-290 -170 -290 -280 Q-280 -370 -170 -360 Q-120 -340 -130 -250 Z" fill={K.greyDark} />
        <path d="M-290 -250 Q-330 -150 -300 -40 L-270 -40 Q-290 -150 -250 -220 Z" fill={K.greyDark} />
        <rect x={-150} y={-160} width={64} height={160} fill={K.grey} />
        <rect x={110} y={-160} width={64} height={160} fill={K.grey} />
        <path d="M-40 -336 L130 -334 L120 -190 L-30 -190 Z" fill={K.orange} />
      </g>
    )}
  </g>
);

const BEATS: [number, number, string, string][] = [
  [0.6, 3.4, '1', 'नदियाँ लाईं उपजाऊ मिट्टी'],
  [3.4, 6.7, '2', 'मिट्टी से उपजा भरपूर धान'],
  [6.7, 10.5, '3', 'और धान से बनी मगध की ताक़त'],
];

export const RiverToPower: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const open = r(t, 0, 0.9, 0, 1, Easing.out(Easing.back(1.3)));
  const sunY = interpolate(t, [0.3, 3], [420, 250], {...clamp, easing: Easing.out(Easing.quad)});
  const river = r(t, 0.8, 2.4, 0, 1, Easing.inOut(Easing.quad));
  const soil = r(t, 2.2, 3.0);
  const paddy = (i: number) => sp(t, 3.6 + i * 0.07, 10);
  const golden = r(t, 5.2, 6.2);
  const elX = interpolate(t, [6.6, 8.0], [1200, 1010], {...clamp, easing: Easing.out(Easing.cubic)});
  const farmerIn = sp(t, 3.4, 12);
  const end = r(t, 9.4, 10, 0, 1, Easing.in(Easing.quad));
  const beat = BEATS.findIndex(([a, b]) => t >= a && t < b);

  return (
    <AbsoluteFill style={{background: K.paper}}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <defs>
          <filter id="grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="4" />
            <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0.16 0" />
          </filter>
          <filter id="fibers" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02 0.6" numOctaves="2" seed="9" />
            <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.25  0 0 0 0 0.2  0 0 0 0.12 0" />
          </filter>
          <clipPath id="blob">
            {BLOB.map(([x, y, rr], i) => (
              <circle key={i} cx={x} cy={y} r={rr * open} />
            ))}
          </clipPath>
        </defs>
        <Paper />

        {/* ---------- inside the window ---------- */}
        <g clipPath="url(#blob)">
          <rect width="1920" height="1080" fill={K.sky} />
          {/* sun with overlapping light half */}
          <g>
            <circle cx={980} cy={sunY} r={105} fill={K.sun} />
            <clipPath id="sunclip">
              <circle cx={980} cy={sunY} r={105} />
            </clipPath>
            <circle cx={980} cy={sunY + 150} r={140} fill={K.sunLight} clipPath="url(#sunclip)" />
          </g>
          {/* angular clouds */}
          <g transform={`translate(${t * 14} 0)`}>
            <path d="M780 470 L980 380 Q1010 360 1050 370 L1120 350 L1010 430 Q980 450 940 440 Z" fill={K.cloud} />
            <path d="M840 530 L1040 460 Q1080 440 1110 460 L1190 440 L1060 520 Z" fill="#dfe9ee" />
          </g>
          <Bird x={620 + t * 30} y={330 - Math.sin(t) * 10} flap={Math.sin(t * 9)} color="#3f97a3" />
          <Bird x={700 + t * 24} y={260} flap={Math.sin(t * 8 + 1)} s={0.8} />

          {/* back hill with field stripes */}
          <path d="M880 760 Q1020 600 1300 640 L1300 1080 L880 1080 Z" fill={golden > 0 ? K.greenLight : K.greenLight} />
          {Array.from({length: 9}).map((_, i) => (
            <path key={i} d={`M${960 + i * 40} ${700 + i * 4} L${1080 + i * 40} ${900}`} stroke={K.greenPale} strokeWidth={4} opacity={0.7} />
          ))}
          <Tree x={1110} y={680} s={0.7} sway={Math.sin(t * 1.2) * 2} flip />
          {/* left hill + big tree */}
          <path d="M260 640 Q420 520 640 600 L640 700 Q450 720 260 700 Z" fill={K.green} />
          <path d="M260 700 Q450 720 640 700 L600 740 Q430 760 300 740 Z" fill="#c9a77a" />
          <Tree x={430} y={610} s={0.9} sway={Math.sin(t * 1.4) * 2} />

          {/* river with fertile soil banks */}
          <path
            d="M640 420 C 700 560, 900 600, 860 760 S 700 980, 760 1080"
            stroke={K.soil}
            strokeWidth={60 + 120 * soil}
            fill="none"
            opacity={0.9 * soil}
            strokeLinecap="round"
          />
          <path
            d="M640 420 C 700 560, 900 600, 860 760 S 700 980, 760 1080"
            stroke={K.river}
            strokeWidth={70}
            fill="none"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - river}
          />
          <path
            d="M640 420 C 700 560, 900 600, 860 760 S 700 980, 760 1080"
            stroke={K.riverLight}
            strokeWidth={8}
            fill="none"
            pathLength={1}
            strokeDasharray="0.03 0.06"
            strokeDashoffset={-t * 0.12}
            opacity={river >= 1 ? 0.9 : 0}
            strokeLinecap="round"
          />

          {/* paddy rows growing on the soil */}
          {Array.from({length: 22}).map((_, i) => {
            const x = 560 + (i % 11) * 52 + (i >= 11 ? 26 : 0);
            const y = (i >= 11 ? 1000 : 900) + Math.sin(i) * 6;
            const g = paddy(i);
            const sway = Math.sin(t * 2.4 + i * 0.5) * 4;
            return (
              <g key={i} transform={`translate(${x} ${y}) scale(${g}) rotate(${sway})`}>
                <path d="M0 0 L-8 -90 L4 -90 Z" fill={K.green} />
                <path d="M2 0 L18 -70 L8 -70 Z" fill={K.greenDark} />
                <path d="M-2 -2 L-24 -64 L-16 -66 Z" fill={K.green} />
                <ellipse cx={-2} cy={-102} rx={9} ry={20} fill="#d9a42a" opacity={golden} />
              </g>
            );
          })}

          {/* foreground hill with pines */}
          <path d="M240 900 Q380 780 560 860 L560 1080 L240 1080 Z" fill={K.green} />
          <path d="M1060 1080 Q1160 860 1320 900 L1320 1080 Z" fill={K.greenDark} />
          {[300, 360, 420].map((x, i) => (
            <Pine key={x} x={x} y={900 - i * 14} h={120 - i * 20} s={sp(t, 0.6 + i * 0.12)} />
          ))}
          {/* pale bush with leaf lines */}
          <g transform={`translate(1150 1040) scale(${sp(t, 0.9)})`}>
            <path d="M-120 0 A120 120 0 0 1 120 0 Z" fill={K.greenPale} />
            {[-60, -20, 20, 60].map((a) => (
              <path key={a} d={`M0 0 Q${a} -60 ${a * 1.6} -100`} stroke="#f2f0c8" strokeWidth={4} fill="none" />
            ))}
          </g>
        </g>

        {/* ---------- figures breaking out of the frame ---------- */}
        <g transform={`translate(${interpolate(farmerIn, [0, 1], [240, 470])} 1000)`} opacity={Math.min(1, farmerIn * 2)}>
          <Farmer t={t} />
        </g>
        <g transform={`translate(${elX} ${1000 + (t < 7.6 ? Math.abs(Math.sin(t * 9)) * -6 : 0)}) scale(0.92)`} opacity={r(t, 6.6, 6.9)}>
          <Elephant t={t} />
        </g>
        <rect width="1920" height="1080" filter="url(#fibers)" />

        {/* ---------- explainer text ---------- */}
        <g opacity={r(t, 0.3, 0.8) * (1 - end * 0.0)}>
          <text x={1400} y={250} fontFamily={BODY} fontWeight={700} fontSize={38} fill={K.orange} letterSpacing={2}>
            बिहार की कहानी
          </text>
          <rect x={1400} y={272} width={120} height={8} fill={K.orange} />
        </g>
        {BEATS.map(([a, b, n, txt], i) => {
          const o = r(t, a, a + 0.35) * (1 - (i < 2 ? r(t, b - 0.2, b + 0.1) : 0));
          const dy = (1 - r(t, a, a + 0.5)) * 30;
          const words = txt.split(' ');
          const mid = Math.ceil(words.length / 2);
          return (
            <g key={n} opacity={o} transform={`translate(0 ${dy})`}>
              <text x={1400} y={400} fontFamily={DISPLAY} fontSize={150} fill={K.sun} stroke={K.ink} strokeWidth={4} paintOrder="stroke">
                {n}
              </text>
              <text x={1400} y={530} fontFamily={BODY} fontWeight={700} fontSize={74} fill={K.ink}>
                {words.slice(0, mid).join(' ')}
              </text>
              <text x={1400} y={620} fontFamily={BODY} fontWeight={700} fontSize={74} fill={i === 2 ? K.orangeDark : K.ink}>
                {words.slice(mid).join(' ')}
              </text>
            </g>
          );
        })}
        {/* chain of icons */}
        <g opacity={r(t, 0.5, 1.0)}>
          <path d="M1490 900 L1540 900 M1528 888 L1542 900 L1528 912" stroke={K.brown} strokeWidth={6} fill="none" opacity={0.6} strokeLinecap="round" />
          <path d="M1650 900 L1700 900 M1688 888 L1702 900 L1688 912" stroke={K.brown} strokeWidth={6} fill="none" opacity={0.6} strokeLinecap="round" />
          <Icon x={1430} on={beat >= 0 ? r(t, 0.6, 1.0) : 0} kind="drop" />
          <Icon x={1595} on={r(t, 3.4, 3.8)} kind="paddy" />
          <Icon x={1760} on={r(t, 6.7, 7.1)} kind="elephant" />
        </g>
        <rect width="1920" height="1080" fill={K.paper} opacity={end} />
        <text x={960} y={560} textAnchor="middle" fontFamily={DISPLAY} fontSize={120} fill={K.ink} opacity={r(t, 9.55, 9.9)}>
          मगध
        </text>
      </svg>
      <Audio src={staticFile('short/music.wav')} volume={0.7} />
      <Audio src={staticFile('short/sfx.wav')} volume={0.8} />
    </AbsoluteFill>
  );
};
