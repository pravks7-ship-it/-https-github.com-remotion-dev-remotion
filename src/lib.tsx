import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

loadFont({family: 'Rozha', url: staticFile('fonts/rozha.woff2'), weight: '400'});
loadFont({family: 'Rozha', url: staticFile('fonts/rozha-latin.woff2'), weight: '400'});
loadFont({family: 'Hind', url: staticFile('fonts/hind-devanagari-400-normal.woff2'), weight: '400'});
loadFont({family: 'Hind', url: staticFile('fonts/hind-devanagari-600-normal.woff2'), weight: '600'});
loadFont({family: 'Hind', url: staticFile('fonts/hind-devanagari-700-normal.woff2'), weight: '700'});
loadFont({family: 'Hind', url: staticFile('fonts/hind-latin-600-normal.woff2'), weight: '600'});

export const C = {
  ink: '#2b1a12',
  ink2: '#5a3a26',
  saffron: '#f29a2e',
  gold: '#f5c451',
  terra: '#c4572e',
  red: '#b8322a',
  cream: '#fbefd9',
  paper: '#f4e2c0',
  river: '#3f8fbf',
  riverLight: '#8cc7e6',
  green: '#6f9b3a',
  greenDark: '#3f6b2a',
  night: '#1d1b3a',
  night2: '#3b2a5a',
};

export const DISPLAY = 'Rozha, serif';
export const BODY = 'Hind, sans-serif';

/** Seconds elapsed inside the current <Sequence>. */
export const useT = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return f / fps;
};

export const ramp = (
  t: number,
  a: number,
  b: number,
  from = 0,
  to = 1,
  easing: (n: number) => number = Easing.out(Easing.cubic),
) => interpolate(t, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

export const pop = (t: number, at: number, damping = 11) =>
  t < at ? 0 : spring({frame: (t - at) * 30, fps: 30, config: {damping, stiffness: 140, mass: 0.8}});

/** Fade a scene in and out at its edges. */
export const SceneFade: React.FC<{dur: number; children: React.ReactNode; fadeIn?: number; fadeOut?: number}> = ({
  dur,
  children,
  fadeIn = 0.4,
  fadeOut = 0.4,
}) => {
  const t = useT();
  const o = Math.min(fadeIn > 0 ? ramp(t, 0, fadeIn) : 1, 1 - ramp(t, dur - fadeOut, dur, 0, 1, Easing.in(Easing.quad)));
  return <div style={{position: 'absolute', inset: 0, opacity: o}}>{children}</div>;
};

export const Full: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0, ...style}}>
    {children}
  </svg>
);

/** Parchment background with subtle vignette + ornament border. */
export const Parchment: React.FC<{tint?: string}> = ({tint = C.paper}) => (
  <Full>
    <defs>
      <radialGradient id="pg" cx="50%" cy="45%" r="75%">
        <stop offset="0%" stopColor="#fff6e4" />
        <stop offset="60%" stopColor={tint} />
        <stop offset="100%" stopColor="#d9b98a" />
      </radialGradient>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
        <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.22  0 0 0 0 0.1  0 0 0 0.09 0" />
      </filter>
    </defs>
    <rect width="1920" height="1080" fill="url(#pg)" />
    <rect width="1920" height="1080" filter="url(#grain)" />
    <Border color={C.terra} />
  </Full>
);

export const Border: React.FC<{color: string; opacity?: number}> = ({color, opacity = 0.55}) => {
  const dots = [];
  for (let x = 60; x <= 1860; x += 40) {
    dots.push(<circle key={'t' + x} cx={x} cy={34} r={4} />);
    dots.push(<circle key={'b' + x} cx={x} cy={1046} r={4} />);
  }
  for (let y = 74; y <= 1006; y += 40) {
    dots.push(<circle key={'l' + y} cx={34} cy={y} r={4} />);
    dots.push(<circle key={'r' + y} cx={1886} cy={y} r={4} />);
  }
  return (
    <g fill={color} stroke={color} opacity={opacity}>
      <rect x={18} y={18} width={1884} height={1044} fill="none" strokeWidth={3} />
      <rect x={50} y={50} width={1820} height={980} fill="none" strokeWidth={1.5} />
      {dots}
    </g>
  );
};

/** Reveal an SVG path by stroke drawing; progress 0..1. */
export const DrawPath: React.FC<
  {d: string; p: number} & React.SVGProps<SVGPathElement>
> = ({d, p, ...rest}) => (
  <path d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} fill="none" {...rest} />
);

export const Title: React.FC<{
  children: React.ReactNode;
  y: number;
  size?: number;
  color?: string;
  o?: number;
  dy?: number;
  stroke?: string;
  font?: string;
  weight?: number;
  x?: number;
  anchor?: 'middle' | 'start' | 'end';
}> = ({children, y, size = 96, color = C.ink, o = 1, dy = 0, stroke, font = DISPLAY, weight = 400, x = 960, anchor = 'middle'}) => (
  <text
    x={x}
    y={y + dy}
    textAnchor={anchor}
    fontFamily={font}
    fontWeight={weight}
    fontSize={size}
    fill={color}
    opacity={o}
    stroke={stroke}
    strokeWidth={stroke ? size / 14 : 0}
    paintOrder="stroke"
    strokeLinejoin="round"
  >
    {children}
  </text>
);

/** Label in a rounded pill. */
export const Pill: React.FC<{x: number; y: number; text: string; o?: number; s?: number; bg?: string; fg?: string; size?: number}> = ({
  x,
  y,
  text,
  o = 1,
  s = 1,
  bg = C.ink,
  fg = C.cream,
  size = 40,
}) => {
  const w = text.length * size * 0.55 + size * 1.4;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <rect x={-w / 2} y={-size * 0.95} width={w} height={size * 1.7} rx={size * 0.85} fill={bg} />
      <text y={size * 0.25} textAnchor="middle" fontFamily={BODY} fontWeight={600} fontSize={size} fill={fg}>
        {text}
      </text>
    </g>
  );
};

/** Floating dust / light motes. */
export const Motes: React.FC<{t: number; color?: string; n?: number; seed?: number}> = ({t, color = C.gold, n = 30, seed = 1}) => {
  const items = [];
  for (let i = 0; i < n; i++) {
    const r = Math.sin(i * 91.7 + seed * 13.1) * 0.5 + 0.5;
    const r2 = Math.sin(i * 47.3 + seed * 7.7) * 0.5 + 0.5;
    const x = (r * 1920 + t * (10 + r2 * 25)) % 1920;
    const y = (r2 * 1080 - t * (12 + r * 20) + 1080 * 4) % 1080;
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * (1 + r) + i));
    items.push(<circle key={i} cx={x} cy={y} r={2 + r * 4} fill={color} opacity={0.25 * tw} />);
  }
  return <g>{items}</g>;
};
