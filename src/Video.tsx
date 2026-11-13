import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {BODY, C, ramp} from './lib';
import * as S from './scenes';

export const TOTAL_SECONDS = 94.5;
const FPS = 30;

// Sentence timings measured from the narration's pauses (seconds).
export const CAPTIONS: [number, number, string][] = [
  [0.0, 4.59, 'ढाई हज़ार साल पहले, गंगा के किनारे एक छोटा-सा राज्य पनप रहा था।'],
  [5.22, 6.94, 'न समुद्र, न ऊँचे पहाड़।'],
  [7.46, 10.85, 'फिर भी इसी राज्य ने भारत का पहला महान साम्राज्य खड़ा किया।'],
  [11.47, 13.3, 'उस राज्य का नाम था, मगध।'],
  [13.89, 16.77, 'और वो धरती, जिसे आज हम कहते हैं, बिहार।'],
  [17.56, 20.74, '"बिहार" नाम आया है "विहार" से, यानी बौद्ध मठ।'],
  [21.39, 26.24, 'कभी यह धरती इतने विहारों से भरी थी कि पूरी भूमि का नाम ही बिहार पड़ गया।'],
  [26.96, 28.91, 'बिहार की असली ताक़त थी उसकी नदियाँ।'],
  [29.37, 30.83, 'गंगा बीचों-बीच बहती है।'],
  [31.3, 35.59, 'उत्तर से गंडक, बागमती और कोसी आती हैं, दक्षिण से सोन।'],
  [36.21, 38.86, 'हर बाढ़ अपने पीछे उपजाऊ मिट्टी छोड़ जाती।'],
  [39.49, 43.56, 'भरपूर धान, भरे हुए अन्न-भंडार, और उनसे बनती सेनाएँ।'],
  [44.21, 48.5, 'दक्षिण की पहाड़ियों में था लोहा, यानी मज़बूत हल और मज़बूत हथियार।'],
  [49.21, 52.47, 'जंगलों में थे हाथी, जो युद्ध में आज के टैंकों जैसे थे।'],
  [53.01, 58.7, 'और राजधानी राजगृह, यानी आज का राजगीर, पाँच पहाड़ियों से घिरा एक प्राकृतिक किला था।'],
  [59.45, 62.1, 'उस दौर में उत्तर भारत में सोलह महाजनपद थे।'],
  [62.65, 67.08, 'राजा बिंबिसार और फिर अजातशत्रु ने एक-एक कर पड़ोसी राज्यों को जीता।'],
  [67.78, 72.31, 'राजधानी बनी पाटलिपुत्र, जो प्राचीन दुनिया के सबसे बड़े शहरों में से एक थी।'],
  [72.91, 74.29, 'आज वही धरती है पटना।'],
  [74.83, 80.82, 'और यही वो धरती है जहाँ बोधगया में बुद्ध को ज्ञान मिला, और पावापुरी में महावीर को निर्वाण।'],
  [81.51, 83.81, 'सत्ता और विचार, दोनों साथ-साथ पले।'],
  [84.31, 86.94, 'मगध अब भारत का सबसे शक्तिशाली राज्य था।'],
  [87.66, 89.47, 'लेकिन असली कहानी तो अभी बाक़ी थी।'],
  [89.93, 91.87, 'देखते रहिए, बिहार की कहानी।'],
];

// [start, end, component]
const SCENES: [number, number, React.FC<{dur: number; lead: number}>][] = [
  [0.0, 5.22, S.Dawn],
  [5.22, 11.47, S.NoSea],
  [11.47, 17.56, S.Magadh],
  [17.56, 26.96, S.Vihara],
  [26.96, 39.49, S.Rivers],
  [39.49, 44.21, S.Plenty],
  [44.21, 49.21, S.Iron],
  [49.21, 53.01, S.Elephants],
  [53.01, 59.45, S.Rajgir],
  [59.45, 67.78, S.Janapadas],
  [67.78, 74.83, S.Pataliputra],
  [74.83, 84.31, S.Wisdom],
  [84.31, TOTAL_SECONDS, S.Finale],
];

const OVERLAP = 0.35;

const Captions: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const cur = CAPTIONS.find(([a, b]) => t >= a - 0.1 && t <= b + 0.35);
  if (!cur || t > 90.4) return null;
  const [a, b, text] = cur;
  const o = Math.min(ramp(t, a - 0.1, a + 0.15), 1 - ramp(t, b + 0.1, b + 0.35));
  const dy = (1 - ramp(t, a - 0.1, a + 0.25)) * 14;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 74,
        display: 'flex',
        justifyContent: 'center',
        opacity: o,
        transform: `translateY(${dy}px)`,
      }}
    >
      <div
        style={{
          maxWidth: 1500,
          padding: '14px 36px 10px',
          borderRadius: 18,
          background: 'rgba(28,18,12,0.72)',
          color: C.cream,
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 44,
          lineHeight: 1.35,
          textAlign: 'center',
          boxShadow: '0 6px 24px rgba(0,0,0,0.25)',
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const BiharKiKahani: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: C.night}}>
    {SCENES.map(([a, b, Comp], i) => {
      const start = i === 0 ? 0 : a - OVERLAP;
      const dur = b - start + (i === SCENES.length - 1 ? 0 : OVERLAP);
      return (
        <Sequence key={i} from={Math.round(start * FPS)} durationInFrames={Math.round(dur * FPS)} name={Comp.name}>
          <Comp dur={dur} lead={a - start} />
        </Sequence>
      );
    })}
    <Captions />
    <Audio src={staticFile('narration.mp3')} volume={0.9} />
    <Audio src={staticFile('music.wav')} volume={0.56} />
    <Audio src={staticFile('sfx.wav')} volume={0.75} />
  </AbsoluteFill>
);
