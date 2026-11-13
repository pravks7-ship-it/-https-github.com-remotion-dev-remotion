import React from 'react';
import {Easing, interpolate} from 'remotion';
import {BODY, Border, C, DISPLAY, DrawPath, Full, Motes, Parchment, Pill, SceneFade, Title, pop, ramp, useT} from './lib';

type P = {dur: number; lead: number};
const useLocal = (lead: number) => useT() - lead;

// ------------------------------------------------------------ shared art
// Stylised outline of Bihar inside a 900 x 560 box (north up).
export const BIHAR =
  'M40 120 L180 60 L330 72 L470 40 L620 70 L760 50 L860 110 L880 200 L840 262 L870 330 L820 400 L760 380 L700 452 L600 430 L520 500 L420 470 L330 522 L240 470 L170 500 L110 420 L60 330 L92 250 L30 190 Z';
const GANGA = 'M40 238 C 160 250, 260 300, 340 282 S 520 300, 600 316 S 780 330, 870 330';
const GANDAK = 'M222 62 C 250 140, 300 200, 330 280';
const BAGMATI = 'M470 42 C 480 120, 500 200, 520 296';
const KOSI = 'M720 54 C 690 140, 720 220, 705 322';
const SON = 'M170 498 C 220 420, 270 340, 336 284';

export const Stupa: React.FC<{x: number; y: number; s?: number; build?: number; glow?: number}> = ({x, y, s = 1, build = 1, glow = 0}) => {
  const b = Math.max(0, Math.min(1, build));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {glow > 0 && <circle cx={0} cy={-120} r={200} fill={C.gold} opacity={0.25 * glow} />}
      <rect x={-150} y={-24} width={300} height={24} fill={C.ink2} opacity={b > 0.05 ? 1 : 0} />
      <rect x={-125} y={-48} width={250} height={26} fill="#e9d2a6" stroke={C.ink2} strokeWidth={4} opacity={b > 0.15 ? 1 : 0} />
      <clipPath id={`dome${x}${y}`}>
        <rect x={-130} y={-48 - 140 * ramp(b, 0.15, 0.6)} width={260} height={140 * ramp(b, 0.15, 0.6) + 1} />
      </clipPath>
      <path d="M-110 -48 A110 120 0 0 1 110 -48 Z" fill="#fbf3e2" stroke={C.ink2} strokeWidth={5} clipPath={`url(#dome${x}${y})`} />
      <g opacity={ramp(b, 0.6, 0.8)}>
        <rect x={-26} y={-196} width={52} height={30} fill="#e9d2a6" stroke={C.ink2} strokeWidth={4} />
        <line x1={0} y1={-196} x2={0} y2={-262} stroke={C.ink2} strokeWidth={6} />
      </g>
      <g opacity={ramp(b, 0.8, 1)} fill={C.saffron} stroke={C.ink2} strokeWidth={3}>
        <ellipse cx={0} cy={-212} rx={34} ry={7} />
        <ellipse cx={0} cy={-230} rx={26} ry={6} />
        <ellipse cx={0} cy={-246} rx={18} ry={5} />
        <path d="M2 -262 L40 -252 L2 -242 Z" fill={C.terra} />
      </g>
    </g>
  );
};

const MiniStupa: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-22} y={-6} width={44} height={6} fill={C.ink2} />
    <path d="M-17 -6 A17 19 0 0 1 17 -6 Z" fill="#fbf3e2" stroke={C.ink2} strokeWidth={2.5} />
    <line x1={0} y1={-25} x2={0} y2={-38} stroke={C.ink2} strokeWidth={2.5} />
    <path d="M1 -38 L11 -35 L1 -32 Z" fill={C.terra} />
  </g>
);

const Hut: React.FC<{x: number; y: number; s?: number; fill?: string}> = ({x, y, s = 1, fill = '#2a1a2e'}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
    <rect x={-30} y={-40} width={60} height={40} />
    <path d="M-42 -38 Q0 -90 42 -38 Z" />
  </g>
);

const Palm: React.FC<{x: number; y: number; s?: number; sway?: number; fill?: string}> = ({x, y, s = 1, sway = 0, fill = '#2a1a2e'}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
    <path d={`M-4 0 Q ${6 + sway} -60 ${10 + sway * 2} -120 L ${16 + sway * 2} -120 Q ${10 + sway} -60 4 0 Z`} />
    {[-60, -25, 15, 50, 85, 130].map((a, i) => (
      <path
        key={i}
        transform={`translate(${13 + sway * 2} -120) rotate(${a + sway * 3})`}
        d="M0 0 Q 30 -14 62 6 Q 30 -4 0 4 Z"
      />
    ))}
  </g>
);

const Wave: React.FC<{y: number; t: number; amp?: number; len?: number; color: string; speed?: number; width?: number; o?: number}> = ({
  y,
  t,
  amp = 8,
  len = 160,
  color,
  speed = 40,
  width = 4,
  o = 1,
}) => {
  let d = '';
  for (let x = -40; x <= 1960; x += 20) {
    const yy = y + Math.sin((x + t * speed) / len * Math.PI * 2) * amp;
    d += (x === -40 ? 'M' : 'L') + x + ' ' + yy.toFixed(1) + ' ';
  }
  return <path d={d} stroke={color} strokeWidth={width} fill="none" opacity={o} strokeLinecap="round" />;
};

// ------------------------------------------------------------ 1. Dawn on the Ganga
export const Dawn: React.FC<P> = ({dur, lead}) => {
  const t = useLocal(lead);
  const sunY = interpolate(t, [0, 5.5], [820, 470], {extrapolateRight: 'clamp', easing: Easing.out(Easing.quad)});
  const sky = ramp(t, 0, 5, 0, 1, Easing.linear);
  const zoom = 1 + t * 0.012;
  const boatX = 1500 - t * 70;
  return (
    <SceneFade dur={dur} fadeIn={0}>
      <Full style={{transform: `scale(${zoom})`, transformOrigin: '50% 60%'}}>
        <defs>
          <linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={interpolate(sky, [0, 1], [0, 1]) > 0.5 ? '#3b2a5a' : C.night} />
            <stop offset="55%" stopColor="#c4572e" stopOpacity={0.4 + 0.6 * sky} />
            <stop offset="100%" stopColor="#f5c451" stopOpacity={0.3 + 0.7 * sky} />
          </linearGradient>
          <radialGradient id="sunglow">
            <stop offset="0%" stopColor="#fff2c2" />
            <stop offset="35%" stopColor="#f5c451" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#f29a2e" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="river1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8a050" />
            <stop offset="100%" stopColor="#5a3a5e" />
          </linearGradient>
        </defs>
        <rect width="1920" height="1080" fill={C.night} />
        <rect width="1920" height="1080" fill="url(#sky1)" />
        <circle cx={1180} cy={sunY} r={420} fill="url(#sunglow)" opacity={0.9} />
        <circle cx={1180} cy={sunY} r={110} fill="#fff0c0" />
        {/* far bank */}
        <path d="M0 640 Q 300 610 600 630 T 1200 625 T 1920 630 L1920 700 L0 700 Z" fill="#6a3a4a" />
        {/* the small kingdom */}
        <g>
          {[
            [330, 640, 0.9],
            [420, 646, 1.1],
            [520, 640, 0.95],
            [610, 648, 1.2],
            [700, 642, 0.9],
          ].map(([x, y, s], i) => (
            <g key={i} opacity={ramp(t, 1.2 + i * 0.25, 1.6 + i * 0.25)} transform={`translate(0 ${(1 - pop(t, 1.2 + i * 0.25)) * 20})`}>
              <Hut x={x} y={y} s={s} fill="#3a2036" />
            </g>
          ))}
          <g opacity={ramp(t, 2.4, 2.9)}>
            <rect x={760} y={560} width={70} height={90} fill="#3a2036" />
            <path d="M752 562 L795 520 L838 562 Z" fill="#3a2036" />
            <line x1={795} y1={520} x2={795} y2={470} stroke="#3a2036" strokeWidth={5} />
            <path d={`M797 472 Q ${825 + Math.sin(t * 6) * 6} 480 850 476 Q ${825} 490 797 496 Z`} fill={C.saffron} />
          </g>
          <Palm x={250} y={645} s={1.1} sway={Math.sin(t * 1.3) * 3} fill="#3a2036" />
          <Palm x={890} y={645} s={0.9} sway={Math.sin(t * 1.1 + 1) * 3} fill="#3a2036" />
        </g>
        {/* river Ganga */}
        <rect x={0} y={680} width={1920} height={400} fill="url(#river1)" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Wave key={i} y={720 + i * 55} t={t} amp={4 + i} len={180 + i * 30} speed={30 + i * 10} color="#ffd9a0" o={0.35 - i * 0.04} width={3} />
        ))}
        {/* sun reflection */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect key={i} x={1180 - (90 - i * 10) + Math.sin(t * 2 + i) * 12} y={700 + i * 34} width={180 - i * 20} height={6} rx={3} fill="#fff0c0" opacity={0.5 - i * 0.05} />
        ))}
        {/* boat */}
        <g transform={`translate(${boatX} ${790 + Math.sin(t * 2) * 4})`}>
          <path d="M-90 0 Q0 40 90 0 Z" fill="#2a1a2e" />
          <line x1={0} y1={0} x2={0} y2={-110} stroke="#2a1a2e" strokeWidth={5} />
          <path d="M3 -105 Q 60 -60 3 -12 Z" fill="#f1d3a1" opacity={0.9} />
        </g>
        <Motes t={t} n={24} />
        <Border color={C.gold} opacity={0.25} />
        <Title y={210} size={118} color={C.cream} o={ramp(t, 0.2, 1.0)} dy={(1 - ramp(t, 0.2, 1.2)) * 30} stroke="rgba(30,20,40,0.5)">
          ढाई हज़ार साल पहले
        </Title>
        <Title y={290} size={46} color={C.gold} font={BODY} weight={600} o={ramp(t, 0.9, 1.6)}>
          लगभग 500 ईसा पूर्व · गंगा का किनारा
        </Title>
      </Full>
    </SceneFade>
  );
};

// ------------------------------------------------------------ 2. No sea, no mountains -> first great empire
const Cross: React.FC<{x: number; y: number; p: number}> = ({x, y, p}) => (
  <g stroke={C.red} strokeWidth={22} strokeLinecap="round">
    <DrawPath d={`M${x - 120} ${y - 120} L${x + 120} ${y + 120}`} p={ramp(p, 0, 0.5)} stroke={C.red} />
    <DrawPath d={`M${x + 120} ${y - 120} L${x - 120} ${y + 120}`} p={ramp(p, 0.5, 1)} stroke={C.red} />
  </g>
);

export const NoSea: React.FC<P> = ({dur, lead}) => {
  const t = useLocal(lead);
  const out = ramp(t, 2.0, 2.6, 0, 1, Easing.in(Easing.cubic));
  const crown = pop(t, 2.5, 9);
  const slam = pop(t, 4.9, 7);
  const rays = ramp(t, 4.9, 6.0);
  return (
    <SceneFade dur={dur}>
      <Parchment />
      <Full>
        {/* sea card */}
        <g transform={`translate(${560 - out * 900} 470)`} opacity={1 - out}>
          <g transform={`scale(${pop(t, 0)})`}>
            <circle r={200} fill="#dcecf3" stroke={C.ink2} strokeWidth={6} />
            <clipPath id="seaclip">
              <circle r={196} />
            </clipPath>
            <g clipPath="url(#seaclip)">
              {[0, 1, 2, 3, 4].map((i) => (
                <g key={i} transform={`translate(-960 ${-60 + i * 50})`}>
                  <Wave y={0} t={t + i} amp={14} len={120} speed={60} color={C.river} width={10} />
                </g>
              ))}
            </g>
            <Cross x={0} y={0} p={ramp(t, 0.15, 0.55)} />
          </g>
          <Title x={0} y={300} size={70} color={C.ink}>
            न समुद्र
          </Title>
        </g>
        {/* mountain card */}
        <g transform={`translate(${1360 + out * 900} 470)`} opacity={1 - out}>
          <g transform={`scale(${pop(t, 0.6)})`}>
            <circle r={200} fill="#efe0c8" stroke={C.ink2} strokeWidth={6} />
            <path d="M-170 110 L-60 -110 L10 10 L70 -60 L170 110 Z" fill="#8a6a5a" stroke={C.ink2} strokeWidth={6} strokeLinejoin="round" />
            <path d="M-60 -110 L-92 -46 L-70 -56 L-50 -40 L-30 -50 Z" fill="#fff" />
            <Cross x={0} y={0} p={ramp(t, 0.9, 1.3)} />
          </g>
          <Title x={0} y={300} size={70} color={C.ink}>
            न ऊँचे पहाड़
          </Title>
        </g>
        {/* empire */}
        <g opacity={ramp(t, 2.3, 2.7)}>
          <g transform={`translate(960 ${470}) scale(${(0.6 + 0.4 * crown) * (1 + 0.06 * Math.sin(slam * Math.PI))})`}>
            {Array.from({length: 24}).map((_, i) => (
              <rect key={i} x={-6} y={-470} width={12} height={180} fill={C.saffron} opacity={0.45 * rays} transform={`rotate(${i * 15 + t * 6})`} />
            ))}
            <circle r={260} fill={C.gold} opacity={0.18 + 0.2 * rays} />
            <path
              d="M-200 90 L-230 -120 L-110 -10 L0 -170 L110 -10 L230 -120 L200 90 Z"
              fill={C.gold}
              stroke={C.ink}
              strokeWidth={10}
              strokeLinejoin="round"
            />
            <rect x={-205} y={90} width={410} height={60} rx={10} fill={C.saffron} stroke={C.ink} strokeWidth={10} />
            {[-230, 0, 230].map((x, i) => (
              <circle key={i} cx={x} cy={i === 1 ? -175 : -125} r={22} fill={C.terra} stroke={C.ink} strokeWidth={8} />
            ))}
            {[-120, 0, 120].map((x, i) => (
              <circle key={i} cx={x} cy={120} r={14} fill={C.red} />
            ))}
          </g>
          <Title y={830} size={80} color={C.ink} o={ramp(t, 3.0, 3.6)} dy={(1 - ramp(t, 3.0, 3.8)) * 30}>
            भारत का पहला महान साम्राज्य
          </Title>
        </g>
      </Full>
    </SceneFade>
  );
};

// ------------------------------------------------------------ 3. Magadh -> Bihar
export const Magadh: React.FC<P> = ({dur, lead}) => {
  const t = useLocal(lead);
  const slam = pop(t, 0.95, 8);
  const toTop = ramp(t, 2.3, 3.1, 0, 1, Easing.inOut(Easing.cubic));
  const draw = ramp(t, 2.5, 4.2, 0, 1, Easing.inOut(Easing.quad));
  const fill = ramp(t, 3.8, 4.6);
  const shake = t > 0.95 && t < 1.4 ? Math.sin(t * 90) * (1.4 - t) * 22 : 0;
  return (
    <SceneFade dur={dur}>
      <Full>
        <defs>
          <radialGradient id="mgbg" cx="50%" cy="45%" r="70%">
            <stop offset="0%" stopColor="#4a2a3a" />
            <stop offset="100%" stopColor={C.night} />
          </radialGradient>
          <linearGradient id="goldtxt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff1b8" />
            <stop offset="50%" stopColor={C.gold} />
            <stop offset="100%" stopColor="#c27a1a" />
          </linearGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#mgbg)" />
        <Motes t={t} n={40} seed={3} />
        <g transform={`translate(${shake} 0)`}>
          {Array.from({length: 36}).map((_, i) => (
            <rect
              key={i}
              x={958}
              y={0}
              width={4}
              height={900}
              fill={C.gold}
              opacity={0.12 * slam * (1 - toTop)}
              transform={`rotate(${i * 10 + t * 4} 960 470)`}
            />
          ))}
          <g transform={`translate(960 ${interpolate(toTop, [0, 1], [560, 220])}) scale(${interpolate(toTop, [0, 1], [1, 0.45]) * (2.2 - 1.2 * slam)})`} opacity={Math.min(1, slam * 1.5)}>
            <text textAnchor="middle" fontFamily={DISPLAY} fontSize={330} fill="url(#goldtxt)" stroke="#5a2a10" strokeWidth={6} paintOrder="stroke">
              मगध
            </text>
          </g>
          <text x={960} y={720} textAnchor="middle" fontFamily={BODY} fontWeight={600} fontSize={48} fill={C.cream} opacity={ramp(t, 1.4, 2.0) * (1 - toTop)}>
            उस राज्य का नाम था…
          </text>
        </g>
        {/* Bihar map */}
        <g transform="translate(510 300)" opacity={ramp(t, 2.4, 2.8)}>
          <path d={BIHAR} fill={C.saffron} opacity={0.85 * fill} />
          <DrawPath d={BIHAR} p={draw} stroke={C.gold} strokeWidth={8} strokeLinejoin="round" />
          <g opacity={fill}>
            <DrawPath d={GANGA} p={fill} stroke={C.riverLight} strokeWidth={10} strokeLinecap="round" />
          </g>
        </g>
        <g opacity={ramp(t, 4.2, 4.6)} transform={`translate(960 680) scale(${pop(t, 4.2)})`}>
          <text textAnchor="middle" fontFamily={DISPLAY} fontSize={140} fill={C.cream} stroke={C.night} strokeWidth={14} paintOrder="stroke">
            बिहार
          </text>
        </g>
        <Pill x={1450} y={330} text="आज" o={ramp(t, 4.5, 4.9)} s={pop(t, 4.5)} bg={C.terra} />
      </Full>
    </SceneFade>
  );
};

// ------------------------------------------------------------ 4. Vihara -> Bihar
export const Vihara: React.FC<P> = ({dur, lead}) => {
  const t = useLocal(lead);
  const mapIn = ramp(t, 3.6, 4.3, 0, 1, Easing.inOut(Easing.cubic));
  const stupaTimes: number[] = [];
  for (let i = 0; i < 42; i++) stupaTimes.push(4.3 + i * 0.075);
  const pts: [number, number][] = [];
  // deterministic pseudo-random points inside the map's rough interior
  for (let i = 0; i < 42; i++) {
    const a = Math.sin(i * 12.9898) * 43758.5453;
    const b = Math.sin(i * 78.233) * 12345.6789;
    const x = 110 + (a - Math.floor(a)) * 700;
    const y = 120 + (b - Math.floor(b)) * 320;
    pts.push([x, y]);
  }
  const final = ramp(t, 7.6, 8.2);
  return (
    <SceneFade dur={dur}>
      <Parchment />
      <Full>
        {/* part A: word origin + stupa */}
        <g opacity={1 - mapIn}>
          <g transform={`translate(${-mapIn * 300} 0)`}>
            <Stupa x={560} y={800} s={1.5} build={ramp(t, 0.1, 1.4, 0, 1, Easing.linear)} glow={ramp(t, 1.0, 1.4) * (0.6 + 0.4 * Math.sin(t * 3))} />
            {/* monks */}
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${240 + i * 70 + Math.min(t, 3) * 25} 800)`} opacity={ramp(t, 1.2 + i * 0.2, 1.6 + i * 0.2)}>
                <circle cx={0} cy={-92} r={14} fill="#7a4a2a" />
                <path d="M-22 0 L-16 -76 Q0 -86 16 -76 L22 0 Z" fill={C.saffron} stroke={C.ink2} strokeWidth={3} />
              </g>
            ))}
          </g>
          <g transform="translate(1340 0)">
            <Title x={0} y={330} size={130} o={ramp(t, 0.2, 0.7)} color={C.ink} dy={(1 - ramp(t, 0.2, 0.9)) * 20}>
              बिहार
            </Title>
            <path d="M0 360 L0 440 M-24 416 L0 444 L24 416" stroke={C.terra} strokeWidth={8} fill="none" opacity={ramp(t, 0.9, 1.3)} strokeLinecap="round" />
            <Title x={0} y={570} size={130} o={ramp(t, 1.0, 1.5)} color={C.terra}>
              विहार
            </Title>
            <g opacity={ramp(t, 2.4, 2.9)}>
              <Title x={0} y={680} size={56} font={BODY} weight={600} color={C.ink2}>
                = बौद्ध मठ
              </Title>
              <text x={0} y={740} textAnchor="middle" fontFamily={BODY} fontSize={34} fill={C.ink2} opacity={0.8}>
                भिक्षुओं के रहने और ध्यान का स्थान
              </text>
            </g>
          </g>
        </g>
        {/* part B: land full of viharas */}
        <g opacity={mapIn} transform={`translate(510 ${200 + (1 - mapIn) * 40}) scale(1)`}>
          <path d={BIHAR} fill="#efd7a8" stroke={C.ink2} strokeWidth={6} strokeLinejoin="round" />
          <path d={GANGA} stroke={C.river} strokeWidth={9} fill="none" opacity={0.7} strokeLinecap="round" />
          {pts.map(([x, y], i) => (
            <MiniStupa key={i} x={x} y={y + 30} s={pop(t, stupaTimes[i], 10) * 1.1} />
          ))}
        </g>
        <g opacity={mapIn}>
          <Title y={150} size={84} color={C.ink} o={ramp(t, 4.0, 4.6)}>
            विहारों की भूमि
          </Title>
          <g opacity={final} transform={`translate(960 ${900 - 70}) scale(${0.8 + 0.2 * pop(t, 7.6)})`}>
            <rect x={-360} y={-80} width={720} height={110} rx={55} fill={C.ink} />
            <text x={-170} y={2} textAnchor="middle" fontFamily={DISPLAY} fontSize={74} fill={C.gold}>
              विहार
            </text>
            <text x={0} y={0} textAnchor="middle" fontFamily={BODY} fontSize={70} fill={C.cream}>
              →
            </text>
            <text x={170} y={2} textAnchor="middle" fontFamily={DISPLAY} fontSize={74} fill={C.saffron}>
              बिहार
            </text>
          </g>
        </g>
      </Full>
    </SceneFade>
  );
};

// ------------------------------------------------------------ 5. Rivers + floods
const Flow: React.FC<{d: string; t: number; p: number; w: number}> = ({d, t, p, w}) => (
  <g>
    <DrawPath d={d} p={p} stroke={C.river} strokeWidth={w} strokeLinecap="round" />
    <path
      d={d}
      fill="none"
      stroke="#d8f0ff"
      strokeWidth={w * 0.3}
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray="0.02 0.05"
      strokeDashoffset={-t * 0.08}
      opacity={p >= 1 ? 0.9 : 0}
    />
  </g>
);

export const Rivers: React.FC<P> = ({dur, lead}) => {
  const t = useLocal(lead);
  const ganga = ramp(t, 2.4, 4.0, 0, 1, Easing.inOut(Easing.quad));
  const gandak = ramp(t, 4.6, 5.5, 0, 1, Easing.inOut(Easing.quad));
  const bagmati = ramp(t, 5.6, 6.5, 0, 1, Easing.inOut(Easing.quad));
  const kosi = ramp(t, 6.6, 7.5, 0, 1, Easing.inOut(Easing.quad));
  const son = ramp(t, 7.5, 8.4, 0, 1, Easing.inOut(Easing.quad));
  const flood = ramp(t, 9.2, 10.6, 0, 1, Easing.out(Easing.quad));
  const recede = ramp(t, 10.8, 12.0, 0, 1, Easing.inOut(Easing.quad));
  const camS = interpolate(t, [0, 12.5], [1.0, 1.05]);
  const label = (txt: string, x: number, y: number, at: number, color = C.ink) => (
    <g opacity={ramp(t, at, at + 0.4)} transform={`translate(${x} ${y}) scale(${pop(t, at)})`}>
      <rect x={-txt.length * 14 - 20} y={-38} width={txt.length * 28 + 40} height={56} rx={28} fill={C.cream} stroke={color} strokeWidth={4} />
      <text y={6} textAnchor="middle" fontFamily={BODY} fontWeight={700} fontSize={36} fill={color}>
        {txt}
      </text>
    </g>
  );
  return (
    <SceneFade dur={dur}>
      <Parchment />
      <Full style={{transform: `scale(${camS})`, transformOrigin: '50% 50%'}}>
        <defs>
          <clipPath id="biharclip">
            <path d={BIHAR} />
          </clipPath>
          <radialGradient id="floodg">
            <stop offset="0%" stopColor={C.river} stopOpacity={0.75} />
            <stop offset="100%" stopColor={C.river} stopOpacity={0.35} />
          </radialGradient>
        </defs>
        <g transform="translate(510 230)">
          <path d={BIHAR} fill="#f1dcae" stroke={C.ink2} strokeWidth={6} strokeLinejoin="round" />
          <g clipPath="url(#biharclip)">
            {/* fertile soil left after the flood */}
            <g opacity={recede}>
              {Array.from({length: 26}).map((_, i) => {
                const x = 60 + ((i * 137) % 800);
                const y = 200 + ((i * 89) % 180);
                return <ellipse key={i} cx={x} cy={y} rx={60} ry={26} fill={i % 2 ? C.green : '#8a6a3a'} opacity={0.55} />;
              })}
            </g>
            <path d={GANGA} stroke="url(#floodg)" strokeWidth={10 + flood * 260 * (1 - recede * 0.92)} fill="none" strokeLinecap="round" opacity={flood > 0 ? 0.85 : 0} />
          </g>
          <Flow d={GANDAK} t={t} p={gandak} w={9} />
          <Flow d={BAGMATI} t={t} p={bagmati} w={9} />
          <Flow d={KOSI} t={t} p={kosi} w={11} />
          <Flow d={SON} t={t} p={son} w={10} />
          <Flow d={GANGA} t={t} p={ganga} w={18} />
          {label('गंगा', 600, 380, 2.8, C.river)}
          {label('गंडक', 190, 120, 4.8, C.river)}
          {label('बागमती', 410, 140, 5.8, C.river)}
          {label('कोसी', 800, 170, 6.8, C.river)}
          {label('सोन', 170, 430, 7.7, C.river)}
          {/* compass */}
          <g transform="translate(-260 80)" opacity={ramp(t, 4.4, 4.9)}>
            <circle r={52} fill={C.cream} stroke={C.ink2} strokeWidth={4} />
            <path d="M0 -42 L12 0 L0 42 L-12 0 Z" fill={C.terra} />
            <text y={-62} textAnchor="middle" fontFamily={BODY} fontWeight={700} fontSize={30} fill={C.ink2}>
              उत्तर
            </text>
            <text y={92} textAnchor="middle" fontFamily={BODY} fontWeight={700} fontSize={30} fill={C.ink2}>
              दक्षिण
            </text>
          </g>
        </g>
        <Title y={165} size={80} color={C.ink} o={ramp(t, 0.2, 0.8)}>
          असली ताक़त: नदियाँ
        </Title>
        <g opacity={ramp(t, 9.4, 9.9) * (1 - ramp(t, 10.8, 11.2))}>
          <Pill x={960} y={820} text="बाढ़" bg={C.river} size={50} s={pop(t, 9.4)} />
        </g>
        <g opacity={ramp(t, 11.2, 11.6)}>
          <Pill x={960} y={820} text="उपजाऊ मिट्टी" bg={C.greenDark} size={50} s={pop(t, 11.2)} />
        </g>
      </Full>
    </SceneFade>
  );
};

// ------------------------------------------------------------ 6. Paddy, granaries, armies
const Card: React.FC<{x: number; at: number; t: number; title: string; children: React.ReactNode; color: string}> = ({x, at, t, title, children, color}) => {
  const s = pop(t, at, 12);
  return (
    <g transform={`translate(${x} 500) scale(${s}) rotate(${(1 - s) * -8})`} opacity={Math.min(1, s * 2)}>
      <rect x={-260} y={-300} width={520} height={600} rx={36} fill={C.cream} stroke={C.ink2} strokeWidth={6} />
      <rect x={-236} y={-276} width={472} height={420} rx={24} fill={color} />
      <g>{children}</g>
      <text y={240} textAnchor="middle" fontFamily={DISPLAY} fontSize={64} fill={C.ink}>
        {title}
      </text>
    </g>
  );
};

export const Plenty: React.FC<P> = ({dur, lead}) => {
  const t = useLocal(lead);
  return (
    <SceneFade dur={dur}>
      <Parchment />
      <Full>
        <Card x={400} at={0.1} t={t} title="भरपूर धान" color="#cfe3a6">
          <rect x={-236} y={60} width={472} height={84} fill="#7fb0c9" />
          {Array.from({length: 13}).map((_, i) => {
            const x = -210 + i * 35;
            const sw = Math.sin(t * 2 + i * 0.6) * 8;
            return (
              <g key={i}>
                <path d={`M${x} 110 Q ${x + sw / 2} 20 ${x + sw} -80`} stroke={C.greenDark} strokeWidth={5} fill="none" />
                <path d={`M${x + sw} -80 Q ${x + sw + 26} -60 ${x + sw + 22} -10`} stroke="#d9a520" strokeWidth={9} fill="none" strokeLinecap="round" />
                <path d={`M${x} 110 Q ${x - 20} 40 ${x - 30} 0`} stroke={C.green} strokeWidth={4} fill="none" />
              </g>
            );
          })}
          <circle cx={170} cy={-200} r={40} fill="#ffe08a" />
        </Card>
        <path d="M680 500 L740 500 M720 480 L742 500 L720 520" stroke={C.terra} strokeWidth={8} fill="none" opacity={ramp(t, 1.3, 1.6)} strokeLinecap="round" />
        <Card x={960} at={1.5} t={t} title="अन्न-भंडार" color="#f0cf96">
          {/* granary kothi */}
          <path d="M-150 120 L-150 -60 Q0 -150 150 -60 L150 120 Z" fill="#c98b4a" stroke={C.ink2} strokeWidth={6} />
          <path d="M-175 -50 Q0 -200 175 -50 L150 -60 Q0 -150 -150 -60 Z" fill="#8a5a2a" stroke={C.ink2} strokeWidth={6} />
          <rect x={-40} y={20} width={80} height={100} fill="#5a3a1a" />
          {[[-190, 100], [-120, 120], [120, 120], [190, 100], [-155, 50], [155, 50]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y - (1 - pop(t, 1.8 + i * 0.12)) * 120})`} opacity={ramp(t, 1.8 + i * 0.12, 1.9 + i * 0.12)}>
              <path d="M-34 20 Q-40 -30 -16 -36 L16 -36 Q40 -30 34 20 Z" fill="#e8d3a8" stroke={C.ink2} strokeWidth={4} />
              <path d="M-14 -36 L0 -48 L14 -36" stroke={C.ink2} strokeWidth={4} fill="none" />
            </g>
          ))}
        </Card>
        <path d="M1240 500 L1300 500 M1280 480 L1302 500 L1280 520" stroke={C.terra} strokeWidth={8} fill="none" opacity={ramp(t, 2.7, 3.0)} strokeLinecap="round" />
        <Card x={1520} at={2.9} t={t} title="सेनाएँ" color="#e6b8a0">
          <clipPath id="armyclip">
            <rect x={-236} y={-276} width={472} height={420} rx={24} />
          </clipPath>
          <g clipPath="url(#armyclip)">
            {[0, 1, 2].map((row) =>
              Array.from({length: 8}).map((_, i) => {
                const x = -300 + i * 80 + ((t - 2.9) * 60) % 80 + row * 20;
                const y = -40 + row * 70;
                const step = Math.sin(t * 10 + i) * 4;
                return (
                  <g key={row + '-' + i} transform={`translate(${x} ${y + step}) scale(${0.8 + row * 0.15})`}>
                    <circle cx={0} cy={-62} r={12} fill={C.ink} />
                    <path d="M-14 -48 L14 -48 L18 0 L-18 0 Z" fill={C.terra} />
                    <line x1={22} y1={20} x2={22} y2={-110} stroke={C.ink} strokeWidth={4} />
                    <path d="M22 -122 L28 -108 L16 -108 Z" fill="#999" />
                    <ellipse cx={-14} cy={-28} rx={12} ry={20} fill="#8a5a2a" stroke={C.ink} strokeWidth={3} />
                  </g>
                );
              }),
            )}
          </g>
        </Card>
      </Full>
    </SceneFade>
  );
};

// ------------------------------------------------------------ 7. Iron
export const Iron: React.FC<P> = ({dur, lead}) => {
  const t = useLocal(lead);
  const plough = pop(t, 1.5, 10);
  const sword = pop(t, 3.4, 9);
  const sparks = (at: number, cx: number, cy: number) => {
    const k = t - at;
    if (k < 0 || k > 1) return null;
    return Array.from({length: 18}).map((_, i) => {
      const a = (i / 18) * Math.PI * 2 + i;
      const r = k * (160 + (i % 5) * 30);
      return <circle key={i} cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r + k * k * 120} r={6 * (1 - k)} fill={i % 2 ? C.gold : '#fff2c2'} />;
    });
  };
  return (
    <SceneFade dur={dur}>
      <Full>
        <defs>
          <linearGradient id="ironsky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2f2440" />
            <stop offset="100%" stopColor="#8a4a3a" />
          </linearGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#ironsky)" />
        <path d="M0 760 L220 520 L380 650 L560 450 L760 640 L900 560 L1100 700 L1300 500 L1500 660 L1700 540 L1920 700 L1920 1080 L0 1080 Z" fill="#4a3030" />
        <path d="M0 860 L300 680 L520 800 L760 660 L1000 820 L1280 690 L1560 820 L1920 720 L1920 1080 L0 1080 Z" fill="#33222a" />
        {/* ore glints */}
        {Array.from({length: 22}).map((_, i) => {
          const x = 100 + ((i * 263) % 1720);
          const y = 760 + ((i * 97) % 240);
          return <circle key={i} cx={x} cy={y} r={7 + (i % 3) * 3} fill="#d07a4a" opacity={ramp(t, 0.6 + i * 0.03, 1.0 + i * 0.03) * (0.5 + 0.5 * Math.sin(t * 4 + i))} />;
        })}
        <Title y={200} size={110} color={C.cream} o={ramp(t, 0.2, 0.7)}>
          लोहा
        </Title>
        <text x={960} y={270} textAnchor="middle" fontFamily={BODY} fontWeight={600} fontSize={42} fill={C.gold} opacity={ramp(t, 0.5, 1.0)}>
          दक्षिण की पहाड़ियों में
        </text>
        {/* plough */}
        <g transform={`translate(640 600) scale(${plough}) rotate(${(1 - plough) * -40})`}>
          <circle r={190} fill={C.cream} opacity={0.12} />
          <path d="M-160 -60 L80 40" stroke="#8a5a2a" strokeWidth={22} strokeLinecap="round" />
          <path d="M40 20 L60 110" stroke="#8a5a2a" strokeWidth={18} strokeLinecap="round" />
          <path d="M40 100 L150 140 L60 150 Z" fill="#b8c0c8" stroke="#3a3a44" strokeWidth={6} strokeLinejoin="round" />
          <path d="M-160 -60 L-190 -110" stroke="#8a5a2a" strokeWidth={14} strokeLinecap="round" />
          <text y={250} textAnchor="middle" fontFamily={DISPLAY} fontSize={64} fill={C.cream}>
            मज़बूत हल
          </text>
        </g>
        {sparks(1.5, 740, 740)}
        {/* sword */}
        <g transform={`translate(1280 600) scale(${sword}) rotate(${(1 - sword) * 60 - 25})`}>
          <circle r={190} fill={C.cream} opacity={0.12} />
          <path d="M-10 -170 L10 -170 L16 70 L0 100 L-16 70 Z" fill="#d6dde4" stroke="#3a3a44" strokeWidth={5} />
          <line x1={0} y1={-150} x2={0} y2={70} stroke="#fff" strokeWidth={3} opacity={0.7} />
          <rect x={-70} y={-186} width={140} height={22} rx={8} fill={C.gold} stroke={C.ink} strokeWidth={5} />
          <rect x={-12} y={-250} width={24} height={66} fill="#5a3a26" />
          <circle cy={-262} r={16} fill={C.gold} stroke={C.ink} strokeWidth={4} />
          <text y={250} textAnchor="middle" fontFamily={DISPLAY} fontSize={64} fill={C.cream} transform="rotate(25)">
            मज़बूत हथियार
          </text>
        </g>
        {sparks(3.4, 1280, 560)}
        {sparks(2.4, 960, 620)}
        <Border color={C.gold} opacity={0.25} />
      </Full>
    </SceneFade>
  );
};

// ------------------------------------------------------------ 8. Elephants = tanks
export const Elephant: React.FC<{trunk: number; leg: number}> = ({trunk, leg}) => (
  <g>
    {/* legs */}
    {[-150, -70, 70, 150].map((x, i) => (
      <rect key={i} x={x - 32} y={60} width={64} height={170} rx={20} fill="#6e6a78" transform={`rotate(${(i % 2 ? 1 : -1) * leg * 6} ${x} 60)`} />
    ))}
    <ellipse cx={0} cy={20} rx={250} ry={150} fill="#7d7988" />
    {/* armour cloth */}
    <path d="M-150 -90 L150 -90 L170 90 L-170 90 Z" fill={C.red} />
    <path d="M-150 -90 L150 -90 L160 -30 L-160 -30 Z" fill={C.gold} />
    {Array.from({length: 7}).map((_, i) => (
      <circle key={i} cx={-140 + i * 47} cy={90} r={12} fill={C.gold} />
    ))}
    {/* howdah */}
    <rect x={-110} y={-180} width={220} height={90} rx={10} fill={C.saffron} stroke={C.ink} strokeWidth={6} />
    <path d="M-130 -180 Q0 -260 130 -180 Z" fill={C.terra} stroke={C.ink} strokeWidth={6} />
    <line x1={60} y1={-250} x2={60} y2={-320} stroke={C.ink} strokeWidth={5} />
    <path d="M62 -320 L110 -306 L62 -292 Z" fill={C.saffron} />
    {/* head */}
    <circle cx={260} cy={-20} r={120} fill="#7d7988" />
    <path d="M200 -100 Q120 -10 200 90 Q260 60 250 -10 Z" fill="#6e6a78" />
    <circle cx={300} cy={-50} r={10} fill={C.ink} />
    <path d="M330 30 Q380 50 400 30" stroke="#f5f0e6" strokeWidth={14} fill="none" strokeLinecap="round" />
    {/* trunk: from down to raised */}
    <path
      d={`M350 0 Q ${420 + trunk * 20} ${120 - trunk * 200} ${400 + trunk * 60} ${230 - trunk * 420}`}
      stroke="#7d7988"
      strokeWidth={46 - trunk * 6}
      fill="none"
      strokeLinecap="round"
    />
    <circle cx={260} cy={-60} r={64} fill={C.red} opacity={0.0} />
  </g>
);

export const Elephants: React.FC<P> = ({dur, lead}) => {
  const t = useLocal(lead);
  const x = interpolate(t, [0, 1.4], [-400, 560], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)}) + Math.max(0, t - 1.4) * 15;
  const trunk = ramp(t, 0.3, 0.8) * (1 - ramp(t, 2.0, 2.6)) ;
  const walking = t < 1.6 ? Math.sin(t * 9) : Math.sin(t * 3) * 0.3;
  const tank = ramp(t, 2.2, 2.8);
  return (
    <SceneFade dur={dur}>
      <Full>
        <defs>
          <linearGradient id="junglesky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f5d58a" />
            <stop offset="100%" stopColor="#e08a4a" />
          </linearGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#junglesky)" />
        {/* jungle */}
        {Array.from({length: 16}).map((_, i) => (
          <g key={i} transform={`translate(${i * 130 - 40} 760)`}>
            <rect x={-8} y={-160} width={16} height={160} fill="#3a4a2a" />
            <circle cx={0} cy={-190} r={80 + (i % 3) * 20} fill={i % 2 ? C.greenDark : '#55803a'} />
          </g>
        ))}
        <rect x={0} y={760} width={1920} height={320} fill="#b07a40" />
        {/* tank ghost on the right */}
        <g opacity={tank * 0.9} transform={`translate(1500 ${560 + (1 - tank) * 40})`}>
          <rect x={-200} y={60} width={400} height={80} rx={40} fill="none" stroke={C.ink} strokeWidth={8} strokeDasharray="20 12" />
          <path d="M-160 60 L-120 0 L120 0 L160 60 Z" fill="none" stroke={C.ink} strokeWidth={8} strokeDasharray="20 12" />
          <rect x={-70} y={-50} width={140} height={50} rx={12} fill="none" stroke={C.ink} strokeWidth={8} strokeDasharray="20 12" />
          <line x1={70} y1={-30} x2={240} y2={-60} stroke={C.ink} strokeWidth={14} strokeDasharray="20 12" />
          {[-150, -75, 0, 75, 150].map((cx) => (
            <circle key={cx} cx={cx} cy={100} r={22} fill="none" stroke={C.ink} strokeWidth={6} />
          ))}
          <text y={250} textAnchor="middle" fontFamily={BODY} fontWeight={700} fontSize={44} fill={C.ink}>
            आज का टैंक
          </text>
        </g>
        <text x={1180} y={600} textAnchor="middle" fontFamily={DISPLAY} fontSize={110} fill={C.ink} opacity={tank}>
          =
        </text>
        <g transform={`translate(${x} ${580 + Math.abs(walking) * -8}) scale(0.85)`}>
          <Elephant trunk={trunk} leg={walking} />
        </g>
        {/* dust */}
        {Array.from({length: 10}).map((_, i) => {
          const k = (t * 1.5 + i * 0.13) % 1;
          return <circle key={i} cx={x - 200 - k * 200 + i * 30} cy={800 - k * 60} r={20 + k * 40} fill="#e8c890" opacity={(1 - k) * 0.5 * ramp(t, 0, 0.5) * (1 - ramp(t, 1.6, 2.2))} />;
        })}
        <Title y={190} size={100} color={C.ink} o={ramp(t, 0.1, 0.6)}>
          युद्ध के हाथी
        </Title>
        <Border color={C.ink2} opacity={0.3} />
      </Full>
    </SceneFade>
  );
};

// ------------------------------------------------------------ 9. Rajgir: five hills
export const Rajgir: React.FC<P> = ({dur, lead}) => {
  const t = useLocal(lead);
  const hills = [0, 1, 2, 3, 4].map((i) => {
    const a = -Math.PI / 2 + (i / 5) * Math.PI * 2;
    return {x: 960 + Math.cos(a) * 330, y: 560 + Math.sin(a) * 250, at: 1.95 + i * 0.35};
  });
  const names = ['वैभार', 'विपुल', 'रत्न', 'उदय', 'सोन'];
  const shield = pop(t, 4.55, 9);
  return (
    <SceneFade dur={dur}>
      <Parchment />
      <Full>
        <g transform={`translate(960 490) scale(${interpolate(t, [0, 6.5], [0.9, 0.82])}) translate(-960 -560)`}>
          <ellipse cx={960} cy={570} rx={520} ry={360} fill="#d8c08a" opacity={0.6} />
          {/* city */}
          <g opacity={ramp(t, 0.3, 0.9)} transform={`translate(960 600) scale(${0.85 + 0.15 * pop(t, 0.3)})`}>
            <ellipse cx={0} cy={20} rx={170} ry={90} fill="#e9d3a2" stroke={C.ink2} strokeWidth={6} strokeDasharray="14 8" />
            {[[-90, 10], [-30, -20], [40, 0], [100, 20], [-40, 50], [30, 50]].map(([x, y], i) => (
              <g key={i} transform={`translate(${x} ${y})`}>
                <rect x={-18} y={-30} width={36} height={30} fill={C.terra} />
                <path d="M-24 -28 L0 -52 L24 -28 Z" fill={C.ink2} />
              </g>
            ))}
            <rect x={-14} y={-90} width={28} height={70} fill={C.saffron} stroke={C.ink2} strokeWidth={4} />
            <path d="M-22 -88 L0 -120 L22 -88 Z" fill={C.red} />
          </g>
          {/* five hills */}
          {hills.map((h, i) => {
            const s = pop(t, h.at, 9);
            const drop = (1 - s) * -300;
            return (
              <g key={i} transform={`translate(${h.x} ${h.y + drop})`} opacity={t > h.at ? 1 : 0}>
                <path d="M-170 70 Q-90 -150 0 -130 Q90 -150 170 70 Z" fill="#8a7a4a" stroke={C.ink2} strokeWidth={6} />
                <path d="M-100 -40 Q -40 -110 0 -100 Q 50 -110 90 -40" fill="none" stroke="#a8986a" strokeWidth={10} strokeLinecap="round" />
                {[-90, -30, 40, 100].map((x, k) => (
                  <circle key={k} cx={x} cy={30 - Math.abs(x) * 0.2} r={18} fill={C.greenDark} />
                ))}
              </g>
            );
          })}
          {hills.map((h, i) => (
            <g key={'n' + i} transform={`translate(${h.x + (i === 4 ? -150 : i === 1 ? 150 : 0)} ${h.y + (i === 1 || i === 4 ? 40 : 110)})`} opacity={ramp(t, h.at + 0.2, h.at + 0.5)}>
              <rect x={-60} y={-34} width={120} height={48} rx={24} fill={C.cream} stroke={C.ink2} strokeWidth={3} />
              <text y={2} textAnchor="middle" fontFamily={BODY} fontWeight={700} fontSize={32} fill={C.ink2}>
                {names[i]}
              </text>
            </g>
          ))}
          {/* protective ring */}
          <circle cx={960} cy={570} r={470} fill="none" stroke={C.terra} strokeWidth={8} strokeDasharray="30 18" opacity={ramp(t, 4.4, 4.9)} transform={`rotate(${t * 6} 960 570)`} />
        </g>
        <g opacity={ramp(t, 0.1, 0.6)}>
          <Title x={330} y={190} size={86} color={C.ink}>
            राजगृह
          </Title>
          <text x={330} y={260} textAnchor="middle" fontFamily={BODY} fontWeight={600} fontSize={40} fill={C.terra} opacity={ramp(t, 0.9, 1.4)}>
            आज का राजगीर
          </text>
        </g>
        <g transform={`translate(1600 250) scale(${shield})`}>
          <path d="M0 -120 L100 -80 Q100 60 0 120 Q-100 60 -100 -80 Z" fill={C.saffron} stroke={C.ink} strokeWidth={8} />
          <path d="M-40 0 L-10 32 L50 -36" stroke={C.ink} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <text x={1600} y={430} textAnchor="middle" fontFamily={DISPLAY} fontSize={56} fill={C.ink} opacity={ramp(t, 4.8, 5.3)}>
          प्राकृतिक किला
        </text>
      </Full>
    </SceneFade>
  );
};

// ------------------------------------------------------------ 10. Sixteen Mahajanapadas
const JANAPADAS = [
  'गांधार', 'कम्बोज', 'कुरु', 'पांचाल',
  'मत्स्य', 'शूरसेन', 'कोसल', 'मल्ल',
  'अवन्ति', 'वत्स', 'काशी', 'वज्जि',
  'अश्मक', 'चेदि', 'मगध', 'अंग',
];
const CONQUEST: [string, number][] = [
  ['अंग', 3.65],
  ['काशी', 4.55],
  ['कोसल', 5.45],
  ['वज्जि', 6.15],
  ['मल्ल', 6.75],
];

const King: React.FC<{x: number; name: string; o: number; s: number}> = ({x, name, o, s}) => (
  <g transform={`translate(${x} 560) scale(${s})`} opacity={o}>
    <circle r={110} fill={C.cream} stroke={C.ink} strokeWidth={6} />
    <circle cy={-20} r={42} fill="#8a5a3a" />
    <path d="M-70 90 Q-70 20 0 20 Q70 20 70 90 Z" fill={C.saffron} />
    <path d="M-40 -60 L-46 -96 L-20 -74 L0 -108 L20 -74 L46 -96 L40 -60 Z" fill={C.gold} stroke={C.ink} strokeWidth={4} />
    <text y={170} textAnchor="middle" fontFamily={DISPLAY} fontSize={52} fill={C.ink}>
      {name}
    </text>
  </g>
);

export const Janapadas: React.FC<P> = ({dur, lead}) => {
  const t = useLocal(lead);
  const shift = ramp(t, 2.9, 3.6, 0, 1, Easing.inOut(Easing.cubic));
  const gx = interpolate(shift, [0, 1], [960, 1250]);
  const gs = interpolate(shift, [0, 1], [1, 0.9]);
  const conquered = (name: string) => {
    const c = CONQUEST.find((c) => c[0] === name);
    return c ? ramp(t, c[1], c[1] + 0.3) : 0;
  };
  const magadhPulse = pop(t, 7.35, 7);
  return (
    <SceneFade dur={dur}>
      <Parchment />
      <Full>
        <Title y={150} size={84} color={C.ink} o={ramp(t, 0.1, 0.6)} x={interpolate(shift, [0, 1], [960, 1250])}>
          सोलह महाजनपद
        </Title>
        <g transform={`translate(${gx} 570) scale(${gs})`}>
          {JANAPADAS.map((n, i) => {
            const col = i % 4;
            const row = Math.floor(i / 4);
            const x = (col - 1.5) * 230;
            const y = (row - 1.5) * 150;
            const s = pop(t, 0.45 + i * 0.11, 10);
            const isM = n === 'मगध';
            const c = conquered(n);
            const fill = isM ? C.saffron : c > 0 ? C.saffron : '#efe0c0';
            const pulse = isM ? 1 + 0.08 * magadhPulse * Math.sin(Math.min(1, (t - 7.35) * 2) * Math.PI) : 1 + 0.1 * Math.sin(c * Math.PI);
            return (
              <g key={n} transform={`translate(${x} ${y}) scale(${s * pulse})`}>
                <rect x={-105} y={-62} width={210} height={124} rx={18} fill={fill} stroke={isM ? C.red : C.ink2} strokeWidth={isM ? 8 : 4} opacity={c > 0 ? 0.6 + 0.4 * c : 1} />
                <text y={16} textAnchor="middle" fontFamily={BODY} fontWeight={700} fontSize={42} fill={C.ink}>
                  {n}
                </text>
                {(isM || c > 0.5) && (
                  <path d="M-24 -46 L-28 -72 L-10 -58 L0 -80 L10 -58 L28 -72 L24 -46 Z" fill={C.gold} stroke={C.ink} strokeWidth={3} opacity={isM ? 1 : c} />
                )}
              </g>
            );
          })}
        </g>
        {/* kings */}
        <King x={330} name="बिंबिसार" o={ramp(t, 3.2, 3.6) * (1 - ramp(t, 4.6, 5.0))} s={pop(t, 3.2)} />
        <King x={330} name="अजातशत्रु" o={ramp(t, 4.8, 5.2)} s={pop(t, 4.8)} />
        <text x={330} y={350} textAnchor="middle" fontFamily={BODY} fontWeight={600} fontSize={36} fill={C.terra} opacity={ramp(t, 3.3, 3.7)}>
          {t < 4.8 ? 'राजा' : 'फिर'}
        </text>
      </Full>
    </SceneFade>
  );
};

// ------------------------------------------------------------ 11. Pataliputra -> Patna
export const Pataliputra: React.FC<P> = ({dur, lead}) => {
  const t = useLocal(lead);
  const modern = ramp(t, 5.0, 5.7, 0, 1, Easing.inOut(Easing.cubic));
  const build = (i: number) => pop(t, 0.2 + i * 0.12, 11);
  return (
    <SceneFade dur={dur}>
      <Full>
        <defs>
          <linearGradient id="ptsky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f7c86a" />
            <stop offset="100%" stopColor="#f39a4a" />
          </linearGradient>
          <linearGradient id="ptsky2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7ab8e0" />
            <stop offset="100%" stopColor="#d9eef7" />
          </linearGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#ptsky)" />
        <rect width="1920" height="1080" fill="url(#ptsky2)" opacity={modern} />
        <circle cx={1500} cy={260} r={90} fill="#fff0c0" opacity={1 - modern * 0.5} />
        {/* ancient city */}
        <g opacity={1 - modern} transform={`translate(0 ${modern * 60})`}>
          {Array.from({length: 14}).map((_, i) => {
            const x = 120 + i * 130;
            const h = 160 + ((i * 53) % 120);
            const s = build(i);
            return (
              <g key={i} transform={`translate(${x} 760) scale(1 ${s})`}>
                <rect x={-50} y={-h} width={100} height={h} fill={i % 2 ? '#a0522d' : '#b8683a'} stroke={C.ink2} strokeWidth={4} />
                <path d={`M-62 ${-h} L0 ${-h - 70} L62 ${-h} Z`} fill={i % 3 ? C.terra : C.ink2} stroke={C.ink2} strokeWidth={4} />
                {[0, 1].map((w) => (
                  <rect key={w} x={-30 + w * 36} y={-h + 40} width={24} height={34} rx={12} fill="#4a2a1a" />
                ))}
                {i % 4 === 1 && <path d={`M0 ${-h - 70} L0 ${-h - 120} L40 ${-h - 108} L0 ${-h - 96}`} stroke={C.ink2} strokeWidth={4} fill={C.saffron} />}
              </g>
            );
          })}
          {/* wooden palisade */}
          <g opacity={ramp(t, 1.6, 2.2)}>
            {Array.from({length: 96}).map((_, i) => (
              <path key={i} d={`M${i * 20} 800 L${i * 20} 740 L${i * 20 + 9} 726 L${i * 20 + 18} 740 L${i * 20 + 18} 800 Z`} fill="#6a3a1a" stroke={C.ink} strokeWidth={2} />
            ))}
          </g>
        </g>
        {/* modern Patna skyline */}
        <g opacity={modern} transform={`translate(0 ${(1 - modern) * 60})`}>
          {[[150, 300], [280, 420], [420, 260], [560, 380], [1080, 330], [1220, 460], [1370, 300], [1520, 400], [1680, 340], [1800, 260]].map(([x, h], i) => (
            <g key={i}>
              <rect x={x - 55} y={800 - h} width={110} height={h} fill={i % 2 ? '#5a6a80' : '#6f7f96'} />
              {Array.from({length: Math.floor(h / 50)}).map((_, k) => (
                <rect key={k} x={x - 40} y={800 - h + 20 + k * 50} width={80} height={14} fill="#cfe3f0" opacity={0.6} />
              ))}
            </g>
          ))}
          {/* Golghar-style dome */}
          <path d="M680 800 Q680 520 830 500 Q980 520 980 800 Z" fill="#e8d0a0" stroke={C.ink2} strokeWidth={6} />
          <path d="M720 800 L720 760 L940 760 L940 800" fill="none" stroke={C.ink2} strokeWidth={5} />
          <rect x={815} y={480} width={30} height={30} fill="#e8d0a0" stroke={C.ink2} strokeWidth={5} />
        </g>
        {/* Ganga */}
        <rect x={0} y={800} width={1920} height={280} fill={C.river} />
        {[0, 1, 2, 3].map((i) => (
          <Wave key={i} y={840 + i * 55} t={t} amp={5} len={200} speed={30 + i * 10} color="#d8f0ff" o={0.4} width={3} />
        ))}
        {[300, 1100].map((bx, i) => (
          <g key={i} transform={`translate(${bx + t * 40} ${880 + i * 60 + Math.sin(t * 2 + i) * 4})`}>
            <path d="M-70 0 Q0 30 70 0 Z" fill="#3a2a1a" />
            <line x1={0} y1={0} x2={0} y2={-80} stroke="#3a2a1a" strokeWidth={4} />
            <path d="M3 -76 Q 46 -44 3 -10 Z" fill={C.cream} />
          </g>
        ))}
        <g opacity={1 - modern}>
          <Title y={200} size={120} color={C.ink} o={ramp(t, 0.8, 1.4)} stroke="rgba(255,240,200,0.7)" dy={(1 - ramp(t, 0.8, 1.5)) * 30}>
            पाटलिपुत्र
          </Title>
          <Pill x={960} y={310} text="प्राचीन दुनिया के सबसे बड़े शहरों में से एक" o={ramp(t, 2.4, 2.9)} s={pop(t, 2.4)} bg={C.terra} size={38} />
        </g>
        <g opacity={modern}>
          <Title y={220} size={130} color={C.ink} stroke="rgba(255,255,255,0.8)" dy={(1 - modern) * 30}>
            पटना
          </Title>
          <Pill x={960} y={320} text="आज" bg={C.ink} size={40} />
        </g>
        <Border color={C.ink2} opacity={0.3} />
      </Full>
    </SceneFade>
  );
};

// ------------------------------------------------------------ 12. Bodh Gaya + Pawapuri
const BodhiTree: React.FC<{t: number; glow: number}> = ({t, glow}) => (
  <g>
    <circle cx={0} cy={-60} r={260} fill={C.gold} opacity={0.18 * glow} />
    <path d="M-30 120 Q-20 0 -60 -80 M30 120 Q20 0 70 -90 M0 120 L0 -40" stroke="#5a3a26" strokeWidth={30} fill="none" strokeLinecap="round" />
    {Array.from({length: 26}).map((_, i) => {
      const a = (i / 26) * Math.PI * 2;
      const r = 150 + (i % 4) * 25;
      const x = Math.cos(a) * r * 1.2;
      const y = -170 + Math.sin(a) * r * 0.65;
      return (
        <path
          key={i}
          transform={`translate(${x} ${y}) rotate(${(a * 180) / Math.PI + Math.sin(t * 1.5 + i) * 6})`}
          d="M0 0 Q 40 -36 90 0 Q 40 36 0 0 Z"
          fill={i % 2 ? C.greenDark : C.green}
        />
      );
    })}
    <ellipse cx={0} cy={-170} rx={200} ry={120} fill={C.green} />
    <ellipse cx={-60} cy={-200} rx={110} ry={70} fill="#7fb04a" />
    {/* seated Buddha silhouette */}
    <g transform="translate(0 120)">
      <circle cy={-200} r={70 + glow * 10} fill="#fff2c2" opacity={0.6 * glow} />
      <circle cy={-200} r={44} fill="none" stroke={C.gold} strokeWidth={6} opacity={glow} />
      <circle cy={-200} r={30} fill="#f0b060" />
      <circle cy={-232} r={12} fill="#3a2a1a" />
      <path d="M-46 -160 Q0 -180 46 -160 L60 -40 L-60 -40 Z" fill={C.saffron} />
      <ellipse cx={0} cy={-30} rx={110} ry={34} fill={C.terra} />
    </g>
  </g>
);

const JalMandir: React.FC<{t: number}> = ({t}) => (
  <g>
    <ellipse cx={0} cy={60} rx={300} ry={90} fill={C.river} />
    {[0, 1, 2].map((i) => (
      <ellipse key={i} cx={0} cy={60} rx={120 + ((t * 60 + i * 60) % 180)} ry={(120 + ((t * 60 + i * 60) % 180)) * 0.3} fill="none" stroke="#d8f0ff" strokeWidth={3} opacity={1 - ((t * 60 + i * 60) % 180) / 180} />
    ))}
    {[[-200, 70], [180, 50], [-120, 100], [230, 90]].map(([x, y], i) => (
      <g key={i} transform={`translate(${x} ${y})`}>
        <ellipse rx={30} ry={10} fill={C.green} />
        <path d="M0 -4 Q-14 -24 0 -36 Q14 -24 0 -4" fill="#f4a0b0" />
      </g>
    ))}
    <rect x={-6} y={40} width={12} height={40} fill="#f5efe0" />
    <rect x={-110} y={-60} width={220} height={100} fill="#fbf7ee" stroke={C.ink2} strokeWidth={5} />
    {[-70, -25, 25, 70].map((x) => (
      <rect key={x} x={x - 10} y={-40} width={20} height={80} rx={10} fill="#e8dcc4" />
    ))}
    <path d="M-60 -60 Q0 -190 60 -60 Z" fill="#fbf7ee" stroke={C.ink2} strokeWidth={5} />
    <path d="M-120 -60 Q-95 -120 -70 -60 Z M70 -60 Q95 -120 120 -60 Z" fill="#fbf7ee" stroke={C.ink2} strokeWidth={4} />
    <line x1={0} y1={-150} x2={0} y2={-200} stroke={C.ink2} strokeWidth={4} />
    <path d="M2 -200 L36 -190 L2 -180 Z" fill={C.saffron} />
  </g>
);

export const Wisdom: React.FC<P> = ({dur, lead}) => {
  const t = useLocal(lead);
  const glow = ramp(t, 1.4, 2.4) * (0.85 + 0.15 * Math.sin(t * 2));
  const right = pop(t, 4.0, 12);
  const merge = ramp(t, 6.5, 7.3, 0, 1, Easing.inOut(Easing.cubic));
  return (
    <SceneFade dur={dur}>
      <Full>
        <defs>
          <linearGradient id="wsky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2a2350" />
            <stop offset="100%" stopColor="#9a5a6a" />
          </linearGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#wsky)" />
        <Motes t={t} n={50} seed={9} color="#fff2c2" />
        <rect x={0} y={700} width={1920} height={380} fill="#3a2a40" />
        <g opacity={1 - merge * 0.85} transform={`translate(${interpolate(right, [0, 1], [960, 560])} 520) scale(${1 - merge * 0.2})`}>
          <BodhiTree t={t} glow={glow} />
          <text y={240} textAnchor="middle" fontFamily={DISPLAY} fontSize={64} fill={C.cream} opacity={ramp(t, 0.6, 1.2)}>
            बोधगया
          </text>
          <text y={295} textAnchor="middle" fontFamily={BODY} fontWeight={600} fontSize={36} fill={C.gold} opacity={ramp(t, 1.6, 2.2)}>
            बुद्ध को ज्ञान
          </text>
        </g>
        <g opacity={(t > 4.0 ? Math.min(1, right * 1.5) : 0) * (1 - merge * 0.85)} transform={`translate(1360 ${560 + (1 - right) * 60}) scale(${1 - merge * 0.2})`}>
          <JalMandir t={t} />
          <text y={200} textAnchor="middle" fontFamily={DISPLAY} fontSize={64} fill={C.cream}>
            पावापुरी
          </text>
          <text y={255} textAnchor="middle" fontFamily={BODY} fontWeight={600} fontSize={36} fill={C.gold}>
            महावीर का निर्वाण
          </text>
        </g>
        {/* power + thought */}
        <g opacity={merge}>
          <rect x={0} y={0} width={1920} height={1080} fill={C.night} opacity={0.45} />
          <g transform={`translate(${interpolate(merge, [0, 1], [560, 720])} 480) scale(${pop(t, 6.6)})`}>
            <circle r={130} fill={C.red} opacity={0.9} />
            <path d="M-4 -90 L4 -90 L8 40 L0 56 L-8 40 Z" fill="#e8edf2" />
            <rect x={-40} y={40} width={80} height={14} rx={6} fill={C.gold} />
            <rect x={-8} y={54} width={16} height={34} fill="#5a3a26" />
            <text y={210} textAnchor="middle" fontFamily={BODY} fontWeight={700} fontSize={72} fill={C.cream}>
              सत्ता
            </text>
          </g>
          <text x={960} y={500} textAnchor="middle" fontFamily={DISPLAY} fontSize={110} fill={C.gold} opacity={ramp(t, 7.0, 7.4)}>
            +
          </text>
          <g transform={`translate(${interpolate(merge, [0, 1], [1360, 1200])} 480) scale(${pop(t, 6.9)})`}>
            <circle r={130} fill={C.saffron} opacity={0.9} />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <path key={i} d="M0 0 Q -22 -50 0 -86 Q 22 -50 0 0" fill="#fbe0e6" stroke="#c05070" strokeWidth={3} transform={`rotate(${i * 45 - 90 + 22.5})`} />
            ))}
            <circle r={20} fill={C.gold} />
            <text y={210} textAnchor="middle" fontFamily={BODY} fontWeight={700} fontSize={72} fill={C.cream}>
              विचार
            </text>
          </g>
          <text x={960} y={860} textAnchor="middle" fontFamily={BODY} fontWeight={600} fontSize={46} fill={C.cream} opacity={ramp(t, 7.6, 8.1)}>
            दोनों साथ-साथ पले
          </text>
        </g>
        <Border color={C.gold} opacity={0.25} />
      </Full>
    </SceneFade>
  );
};

// ------------------------------------------------------------ 13. Finale
export const Finale: React.FC<P> = ({dur, lead}) => {
  const t = useLocal(lead);
  const crown = pop(t, 0.05, 8);
  const dark = ramp(t, 3.3, 4.0);
  const end = ramp(t, 5.5, 6.2);
  const endPop = pop(t, 5.5, 9);
  const fadeOut = 1 - ramp(t, dur - lead - 1.4, dur - lead);
  return (
    <SceneFade dur={dur} fadeOut={0.01}>
      <Full style={{opacity: fadeOut}}>
        <defs>
          <radialGradient id="finbg" cx="50%" cy="45%" r="70%">
            <stop offset="0%" stopColor="#7a3a2a" />
            <stop offset="100%" stopColor={C.night} />
          </radialGradient>
          <linearGradient id="goldtxt2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff1b8" />
            <stop offset="50%" stopColor={C.gold} />
            <stop offset="100%" stopColor="#c27a1a" />
          </linearGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#finbg)" />
        <Motes t={t} n={50} seed={5} />
        {/* part A: mightiest kingdom */}
        <g opacity={1 - end}>
          <g transform={`translate(960 430) scale(${0.5 + 0.5 * crown})`} opacity={1 - dark * 0.6}>
            {Array.from({length: 30}).map((_, i) => (
              <rect key={i} x={-5} y={-520} width={10} height={230} fill={C.gold} opacity={0.3} transform={`rotate(${i * 12 + t * 8})`} />
            ))}
            <path d="M-200 90 L-230 -120 L-110 -10 L0 -170 L110 -10 L230 -120 L200 90 Z" fill="url(#goldtxt2)" stroke={C.ink} strokeWidth={10} strokeLinejoin="round" />
            <rect x={-205} y={90} width={410} height={60} rx={10} fill={C.saffron} stroke={C.ink} strokeWidth={10} />
            <text y={140} textAnchor="middle" fontFamily={DISPLAY} fontSize={56} fill={C.ink}>
              मगध
            </text>
          </g>
          <Title y={800} size={72} color={C.cream} o={ramp(t, 0.4, 1.0) * (1 - dark)}>
            भारत का सबसे शक्तिशाली राज्य
          </Title>
          <rect width="1920" height="1080" fill="#000" opacity={dark * 0.55} />
          <Title y={800} size={76} color={C.gold} o={dark} dy={(1 - dark) * 20}>
            लेकिन असली कहानी तो अभी बाक़ी थी…
          </Title>
        </g>
        {/* part B: end card */}
        <g opacity={end}>
          <rect x={360} y={250} width={1200} height={580} rx={30} fill="none" stroke={C.gold} strokeWidth={6} />
          <rect x={385} y={275} width={1150} height={530} rx={20} fill="none" stroke={C.gold} strokeWidth={2} opacity={0.6} />
          {[[360, 250], [1560, 250], [360, 830], [1560, 830]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${t * 20})`}>
              {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
                <path key={k} d="M0 0 Q -10 -22 0 -40 Q 10 -22 0 0" fill={C.saffron} transform={`rotate(${k * 45})`} />
              ))}
              <circle r={10} fill={C.gold} />
            </g>
          ))}
          <text x={960} y={420} textAnchor="middle" fontFamily={BODY} fontWeight={600} fontSize={52} fill={C.cream} opacity={ramp(t, 5.7, 6.2)}>
            देखते रहिए
          </text>
          <g transform={`translate(960 640) scale(${0.85 + 0.15 * endPop})`}>
            <text textAnchor="middle" fontFamily={DISPLAY} fontSize={170} fill="url(#goldtxt2)" stroke="#3a1a10" strokeWidth={8} paintOrder="stroke">
              बिहार की कहानी
            </text>
          </g>
        </g>
        <Border color={C.gold} opacity={0.3} />
      </Full>
    </SceneFade>
  );
};
