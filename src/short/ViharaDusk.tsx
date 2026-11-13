import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, interpolateColors, staticFile, useCurrentFrame} from 'remotion';
import {BODY, DISPLAY} from '../lib';

/**
 * 10-second cinematic short in a flat 2D anime style: a lone young monk walks
 * through the fields at dusk toward a vihara. Muted palette warms to gold.
 */
export const VIHARA_SECONDS = 10;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const r = (t: number, a: number, b: number, from = 0, to = 1, e = Easing.inOut(Easing.sin)) =>
  interpolate(t, [a, b], [from, to], {...clamp, easing: e});
const col = (w: number, a: string, b: string) => interpolateColors(w, [0, 1], [a, b]);
const LINE = '#3a2a26';

const Cloud: React.FC<{x: number; y: number; s: number; warm: number; puffs: [number, number, number][]}> = ({x, y, s, warm, puffs}) => {
  const body = col(warm, '#b7b6bd', '#f6c9a0');
  const shade = col(warm, '#8e8d9c', '#b9768a');
  const rim = col(warm, '#d6d4d4', '#fff0c8');
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* cel-shaded underside */}
      <clipPath id={`cc${x}${y}`}>
        {puffs.map(([px, py, pr], i) => (
          <circle key={i} cx={px} cy={py} r={pr} />
        ))}
      </clipPath>
      <g clipPath={`url(#cc${x}${y})`}>
        <rect x={-700} y={-500} width={1400} height={900} fill={rim} />
        {puffs.map(([px, py, pr], i) => (
          <circle key={'b' + i} cx={px + pr * 0.07} cy={py + pr * 0.12} r={pr} fill={body} />
        ))}
        <ellipse cx={0} cy={150} rx={560} ry={110} fill={shade} />
      </g>
    </g>
  );
};

const Monk: React.FC<{t: number; walk: number; look: number; wind: number}> = ({t, walk, look, wind}) => {
  const ph = t * 7.5;
  const stride = walk;
  const lFoot = Math.sin(ph) * 22 * stride;
  const rFoot = -Math.sin(ph) * 22 * stride;
  const bob = Math.abs(Math.cos(ph)) * -5 * stride;
  const sway = Math.sin(t * 3.1) * wind;
  const robe = '#c9783a';
  const robeShade = '#9a5230';
  const skin = '#e9b892';
  const skinShade = '#c98f72';
  return (
    <g transform={`translate(0 ${bob})`}>
      {/* feet */}
      <path d={`M${-14 + lFoot} 0 l26 0 l-4 -10 l-18 0 Z`} fill="#6a4a3a" stroke={LINE} strokeWidth={2.5} strokeLinejoin="round" />
      <path d={`M${2 + rFoot} 0 l26 0 l-4 -10 l-18 0 Z`} fill="#5a3a2c" stroke={LINE} strokeWidth={2.5} strokeLinejoin="round" />
      <path d={`M${-6 + lFoot} -10 L-10 -60`} stroke={skinShade} strokeWidth={9} strokeLinecap="round" />
      <path d={`M${10 + rFoot} -10 L8 -60`} stroke={skinShade} strokeWidth={9} strokeLinecap="round" />
      {/* scarf end fluttering behind */}
      <path
        d={`M-24 -178 Q${-50 - sway * 14} ${-178 + Math.sin(t * 6) * 6} ${-70 - sway * 26} ${-160 + Math.sin(t * 5 + 1) * 10} Q${-52 - sway * 10} -150 -24 -140 Z`}
        fill={robeShade}
        stroke={LINE}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      {/* robe, hem blown by wind */}
      <path
        d={`M-30 -180 Q-44 -110 ${-42 - sway * 10} -40 Q0 ${-30 + sway * 4} ${44 - sway * 18} -46 Q36 -120 30 -180 Z`}
        fill={robe}
        stroke={LINE}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <path d={`M-30 -180 Q-44 -110 ${-42 - sway * 10} -40 Q-20 -36 -8 -38 Q-20 -110 -10 -180 Z`} fill={robeShade} />
      {/* shoulder drape + fluttering end */}
      <path d="M-34 -184 Q0 -200 34 -182 L20 -120 Q-6 -150 -34 -184 Z" fill="#d98a48" stroke={LINE} strokeWidth={3} strokeLinejoin="round" />
      {/* bag strap + bag */}
      <path d="M22 -182 L-26 -96" stroke="#7a5a3a" strokeWidth={5} />
      <path d="M-46 -104 l34 0 l2 34 q-19 8 -38 0 Z" fill="#a8865a" stroke={LINE} strokeWidth={3} strokeLinejoin="round" />
      {/* arm */}
      <path d={`M22 -170 Q${34 + look * 4} -130 ${26 + look * 6} -${100 + look * 10}`} stroke={robe} strokeWidth={18} strokeLinecap="round" fill="none" />
      <circle cx={26 + look * 6} cy={-(98 + look * 10)} r={8} fill={skin} stroke={LINE} strokeWidth={2.5} />
      {/* head, tilts up as he notices the vihara */}
      <g transform={`translate(4 -206) rotate(${-14 * look + Math.sin(t * 1.3) * 1.5})`}>
        <path d="M-4 18 L8 18 L8 4 L-4 4 Z" fill={skinShade} />
        <ellipse cx={2} cy={-12} rx={23} ry={26} fill={skin} stroke={LINE} strokeWidth={3} />
        <path d="M-21 -14 Q-20 -38 4 -38 Q20 -36 24 -22 Q6 -30 -21 -14 Z" fill="#a98a86" opacity={0.55} />
        <path d="M-21 -6 Q-14 12 6 14 Q-12 4 -21 -6 Z" fill={skinShade} />
        <ellipse cx={-14} cy={-10} rx={5} ry={7} fill={skinShade} stroke={LINE} strokeWidth={2} />
        {/* eye: soft, slightly downcast then lifting */}
        <ellipse cx={14} cy={-14 - look * 2} rx={3.4} ry={4.6} fill={LINE} />
        <circle cx={15.2} cy={-15.6 - look * 2} r={1.2} fill="#fff" />
        <path d={`M8 ${-22 - look * 3} Q14 ${-25 - look * 3} 20 ${-23 - look * 3}`} stroke={LINE} strokeWidth={2} fill="none" strokeLinecap="round" />
        <path d="M24 -8 l3 5 l-4 1" stroke={LINE} strokeWidth={2} fill="none" strokeLinecap="round" />
        <path d="M12 6 Q16 7 19 5" stroke={LINE} strokeWidth={2} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
};

const Vihara: React.FC<{lit: (i: number) => number; warm: number}> = ({lit, warm}) => {
  const wall = col(warm, '#8d8592', '#e8b98e');
  const wallShade = col(warm, '#6c6474', '#b77a6a');
  const roof = col(warm, '#5d5464', '#8a4a44');
  return (
    <g>
      {/* stupa */}
      <path d="M-40 -60 A70 78 0 0 1 100 -60 Z" fill={wall} stroke={LINE} strokeWidth={2.5} />
      <path d="M30 -138 A70 78 0 0 1 100 -60 L50 -60 Q60 -110 30 -138 Z" fill={wallShade} />
      <rect x={18} y={-156} width={24} height={16} fill={wall} stroke={LINE} strokeWidth={2} />
      <path d="M30 -156 L30 -196" stroke={LINE} strokeWidth={3} />
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx={30} cy={-166 - i * 10} rx={16 - i * 4} ry={3.5} fill={roof} />
      ))}
      {/* monastery hall */}
      <rect x={-210} y={-70} width={170} height={70} fill={wall} stroke={LINE} strokeWidth={2.5} />
      <rect x={-120} y={-70} width={80} height={70} fill={wallShade} />
      <path d="M-226 -68 L-180 -110 L-60 -110 L-24 -68 Z" fill={roof} stroke={LINE} strokeWidth={2.5} strokeLinejoin="round" />
      <rect x={-50} y={-60} width={170} height={60} fill={wall} stroke={LINE} strokeWidth={2.5} />
      {[-190, -150, -110, -75].map((x, i) => (
        <g key={x}>
          <circle cx={x + 10} cy={-34} r={22} fill="#ffc861" opacity={0.35 * lit(i)} />
          <rect x={x} y={-48} width={20} height={26} rx={10} fill={interpolateColors(lit(i), [0, 1], ['#3a3440', '#ffd27a'])} stroke={LINE} strokeWidth={2} />
        </g>
      ))}
      {[-30, 10, 50, 90].map((x, i) => (
        <g key={x}>
          <circle cx={x + 8} cy={-28} r={18} fill="#ffc861" opacity={0.35 * lit(i + 4)} />
          <rect x={x} y={-40} width={16} height={22} rx={8} fill={interpolateColors(lit(i + 4), [0, 1], ['#3a3440', '#ffd27a'])} stroke={LINE} strokeWidth={2} />
        </g>
      ))}
      <path d="M-20 -110 L-20 -150" stroke={LINE} strokeWidth={2.5} />
      <path d="M-18 -150 L14 -142 L-18 -134 Z" fill="#d9783a" />
    </g>
  );
};

const SUBS: [number, number, string][] = [
  [0.5, 3.2, 'कभी यह धरती विहारों से भरी थी…'],
  [3.6, 6.4, 'हर पगडंडी किसी विहार तक जाती थी।'],
  [6.9, 9.7, 'इसीलिए इस भूमि का नाम पड़ा —'],
];

export const ViharaDusk: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const warm = r(t, 0.5, 8.5, 0, 1, Easing.inOut(Easing.quad));
  const walk = 1 - r(t, 3.6, 4.4);
  const look = r(t, 4.2, 5.4, 0, 1, Easing.out(Easing.cubic));
  const monkX = 560 + interpolate(t, [0, 4.4], [0, 330], {...clamp, easing: Easing.out(Easing.quad)});
  const wind = 0.4 + 0.6 * r(t, 5.0, 5.8) * (1 - r(t, 7.5, 8.6) * 0.5);
  const zoom = interpolate(t, [0, 10], [1.0, 1.16], {...clamp, easing: Easing.inOut(Easing.quad)});
  const sunY = interpolate(t, [0, 10], [610, 560]);
  const burst = r(t, 6.6, 8.0, 0, 1, Easing.out(Easing.cubic));
  const lit = (i: number) => r(t, 4.6 + i * 0.22, 5.0 + i * 0.22);
  const sat = interpolate(warm, [0, 1], [0.5, 1.08]);
  const fadeIn = r(t, 0, 0.8);
  const fadeOut = r(t, 9.55, 10);

  const skyTop = col(warm, '#5d6676', '#3b4878');
  const skyMid = col(warm, '#8c8f98', '#c9787a');
  const skyLow = col(warm, '#c3b7a8', '#ffc27a');
  const hillFar = col(warm, '#7c8090', '#9a6f86');
  const hillMid = col(warm, '#5f6a62', '#7a6a4a');
  const field = col(warm, '#6f7556', '#b48a3e');
  const fieldShade = col(warm, '#545a44', '#8a5e30');
  const tree = col(warm, '#3f4a40', '#4a4a2e');
  const treeLight = col(warm, '#58665a', '#8a7a3a');

  return (
    <AbsoluteFill style={{background: '#0d0b10'}}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        <defs>
          <linearGradient id="vsky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skyTop} />
            <stop offset="55%" stopColor={skyMid} />
            <stop offset="100%" stopColor={skyLow} />
          </linearGradient>
          <radialGradient id="vsun">
            <stop offset="0%" stopColor="#fff6dc" />
            <stop offset="25%" stopColor="#ffd88a" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#ff9a5a" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="vray" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffe2a8" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#ffe2a8" stopOpacity={0} />
          </linearGradient>
          <radialGradient id="vrim">
            <stop offset="0%" stopColor="#ffd690" stopOpacity={1} />
            <stop offset="100%" stopColor="#ffd690" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="vvig" cx="50%" cy="50%" r="75%">
            <stop offset="55%" stopColor="#000" stopOpacity={0} />
            <stop offset="100%" stopColor="#000" stopOpacity={0.55} />
          </radialGradient>
          <filter id="grade">
            <feColorMatrix type="saturate" values={String(sat)} />
          </filter>
          <filter id="soft">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="vgrain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={Math.floor(t * 12)} />
            <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 0.07 0" />
          </filter>
        </defs>

        <g filter="url(#grade)" transform={`translate(960 600) scale(${zoom}) translate(-960 -600)`}>
          <rect width="1920" height="1080" fill="url(#vsky)" />
          {/* sun behind clouds */}
          <circle cx={1300} cy={sunY} r={360 + burst * 120} fill="url(#vsun)" opacity={0.25 + 0.75 * warm} />
          <circle cx={1300} cy={sunY} r={46} fill="#fff4d6" opacity={0.4 + 0.6 * warm} />
          {/* towering clouds */}
          <Cloud x={1250 + t * 6} y={330} s={1.15} warm={warm} puffs={[[-260, 40, 120], [-130, -40, 160], [40, -110, 190], [210, -30, 150], [340, 50, 110], [-40, 60, 140], [150, 70, 130]]} />
          <Cloud x={430 + t * 10} y={260} s={0.75} warm={warm} puffs={[[-200, 30, 90], [-80, -30, 120], [60, -50, 110], [180, 20, 90], [0, 40, 100]]} />
          <Cloud x={1700 + t * 8} y={520} s={0.5} warm={warm} puffs={[[-160, 20, 80], [-50, -20, 100], [80, -10, 90], [180, 30, 70]]} />
          {/* light rays breaking through */}
          <g opacity={burst * 0.9} style={{mixBlendMode: 'screen'}}>
            {[-28, -14, -2, 10, 22, 34].map((a, i) => (
              <path key={i} d="M0 -14 L1400 -90 L1400 90 L0 14 Z" fill="url(#vray)" transform={`translate(1300 ${sunY}) rotate(${150 + a + Math.sin(t + i) * 1.2})`} />
            ))}
          </g>
          {/* far hills */}
          <path d="M0 640 Q240 560 520 610 T 1100 590 T 1920 600 L1920 760 L0 760 Z" fill={hillFar} />
          {/* vihara hill */}
          <path d="M1100 700 Q1350 560 1700 640 L1920 650 L1920 800 L1100 800 Z" fill={hillMid} />
          <g transform="translate(1440 628) scale(0.95)">
            <Vihara lit={lit} warm={warm} />
          </g>
          {/* distant birds */}
          {[0, 1, 2].map((i) => {
            const bx = 700 + t * (50 + i * 8) + i * 50;
            const by = 380 + i * 22 + Math.sin(t * 2 + i) * 6;
            const f = Math.sin(t * 10 + i * 2) * 6;
            return <path key={i} d={`M${bx - 12} ${by - f} Q${bx - 4} ${by - 4} ${bx} ${by} Q${bx + 4} ${by - 4} ${bx + 12} ${by - f}`} stroke={LINE} strokeWidth={2.5} fill="none" opacity={0.7} />;
          })}

          {/* fields */}
          <path d="M0 740 Q600 700 1100 730 T 1920 760 L1920 1080 L0 1080 Z" fill={field} />
          <path d="M0 860 Q500 820 1000 880 T 1920 900 L1920 1080 L0 1080 Z" fill={fieldShade} opacity={0.6} />
          {/* path toward the vihara */}
          <path d="M300 1080 Q620 900 900 830 Q1150 770 1360 690 L1380 696 Q1170 790 940 850 Q700 930 520 1080 Z" fill={col(warm, '#a59c88', '#e7c08a')} />
          {/* grass blades with travelling wind wave */}
          {Array.from({length: 140}).map((_, i) => {
            const x = (i * 137.5) % 1920;
            const y = 800 + ((i * 53) % 280);
            const h = 18 + ((i * 7) % 26) * (y / 1000);
            const wave = Math.sin(t * 2.4 - x / 220) * (6 + 10 * wind);
            return (
              <path key={i} d={`M${x} ${y} Q${x + wave * 0.4} ${y - h * 0.6} ${x + wave} ${y - h}`} stroke={i % 3 ? fieldShade : col(warm, '#8d8f6a', '#e3b45a')} strokeWidth={2.5} fill="none" strokeLinecap="round" />
            );
          })}

          {/* monk */}
          <g transform={`translate(${monkX} 935) scale(1.55)`}>
            <ellipse cx={4} cy={2} rx={46} ry={8} fill="#000" opacity={0.18} />
            <Monk t={t} walk={walk} look={look} wind={wind} />
          </g>
          {/* rim light on monk when the sun breaks */}
          <circle cx={monkX + 10} cy={720} r={260} fill="url(#vrim)" opacity={0.3 * burst} style={{mixBlendMode: 'screen'}} />

          {/* big foreground tree, left */}
          <g transform={`rotate(${Math.sin(t * 1.1) * 0.8 * wind} 160 1080)`}>
            <path d="M120 1080 Q150 820 110 640 Q90 540 150 460 L190 470 Q150 560 180 660 Q220 840 220 1080 Z" fill={col(warm, '#3a3236', '#4a3226')} stroke={LINE} strokeWidth={3} />
            <path d="M150 600 Q260 520 360 520" stroke={col(warm, '#3a3236', '#4a3226')} strokeWidth={18} fill="none" strokeLinecap="round" />
            {[[90, 400, 170], [250, 380, 150], [380, 470, 120], [20, 520, 140], [180, 280, 130], [-40, 340, 120]].map(([x, y, rr], i) => (
              <g key={i}>
                <clipPath id={`leaf${i}`}>
                  <circle cx={x} cy={y} r={rr} />
                </clipPath>
                <circle cx={x} cy={y} r={rr} fill={treeLight} />
                <circle cx={x + rr * 0.16} cy={y + rr * 0.22} r={rr} fill={tree} clipPath={`url(#leaf${i})`} />
                <circle cx={x} cy={y} r={rr} fill="none" stroke={LINE} strokeWidth={3} />
              </g>
            ))}
          </g>
          {/* drifting leaves / petals */}
          {Array.from({length: 22}).map((_, i) => {
            const speed = 60 + (i % 5) * 25;
            const x = (i * 211 + t * speed * (0.6 + wind)) % 2100 - 90;
            const y = 300 + ((i * 97) % 600) + Math.sin(t * 2 + i) * 30;
            const rot = t * 120 + i * 40;
            return (
              <ellipse key={i} cx={x} cy={y} rx={7} ry={3.5} fill={i % 2 ? col(warm, '#8c8a6a', '#f3b25a') : col(warm, '#a09a90', '#ffd9a0')} transform={`rotate(${rot} ${x} ${y})`} opacity={0.8} />
            );
          })}
          {/* fireflies of light at the end */}
          {Array.from({length: 26}).map((_, i) => {
            const x = 900 + ((i * 173) % 900) + Math.sin(t * 0.8 + i) * 20;
            const y = 620 + ((i * 59) % 300) - t * 6;
            return <circle key={'f' + i} cx={x} cy={y} r={3 + (i % 3)} fill="#fff1b8" opacity={r(t, 6.8, 8.0) * (0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i)))} />;
          })}
        </g>

        {/* warm grade overlay */}
        <rect width="1920" height="1080" fill="#ff9a4a" opacity={0.22 * warm} style={{mixBlendMode: 'soft-light'}} />
        <rect width="1920" height="1080" fill="#3a4a6a" opacity={0.25 * (1 - warm)} style={{mixBlendMode: 'multiply'}} />
        <rect width="1920" height="1080" fill="url(#vvig)" />
        <rect width="1920" height="1080" filter="url(#vgrain)" />

        {/* cinematic letterbox */}
        <rect width="1920" height="112" fill="#0d0b10" />
        <rect y={968} width="1920" height="112" fill="#0d0b10" />
        {SUBS.map(([a, b, s]) => {
          const o = r(t, a, a + 0.5) * (1 - r(t, b - 0.4, b));
          return (
            <text key={s} x={960} y={1036} textAnchor="middle" fontFamily={BODY} fontWeight={400} fontSize={42} fill="#efe6d6" opacity={o} letterSpacing={1}>
              {s}
            </text>
          );
        })}
        {/* title reveal */}
        <g opacity={r(t, 7.6, 8.4) * (1 - fadeOut)}>
          <text x={960} y={250} textAnchor="middle" fontFamily={BODY} fontWeight={600} fontSize={52} fill="#fff6e2" letterSpacing={4} style={{filter: 'drop-shadow(0 2px 10px rgba(90,40,30,0.9))'}}>
            विहार  →
          </text>
          <text x={960} y={395} textAnchor="middle" fontFamily={DISPLAY} fontSize={150} fill="#fff6e2" stroke="#7a3a24" strokeWidth={3} paintOrder="stroke" style={{filter: 'drop-shadow(0 0 24px rgba(255,190,110,0.8))'}}>
            बिहार
          </text>
        </g>
        <rect width="1920" height="1080" fill="#0d0b10" opacity={(1 - fadeIn) + fadeOut} />
      </svg>
      <Audio src={staticFile('short/vihara-music.wav')} volume={0.8} />
      <Audio src={staticFile('short/vihara-sfx.wav')} volume={0.8} />
    </AbsoluteFill>
  );
};
