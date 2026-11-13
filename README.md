# बिहार की कहानी — explainer video

Remotion project for a 94-second Hindi explainer on Magadh and the origins of Bihar.

- `public/narration.mp3`: voice-over (ElevenLabs).
- `scripts/make_audio.py`: generates `public/music.wav` (tanpura drone, pads, bansuri, tabla) and `public/sfx.wav` (whooshes, booms, bells, water, clangs, elephant, etc.) from scratch with numpy. The music is ducked under the narration.
- `src/scenes.tsx`: 13 illustrated SVG scenes timed to the narration's sentences.
- `src/Video.tsx`: timeline, subtitles and audio mix.

```bash
npm install
python3 scripts/make_audio.py   # optional, the wav files are committed
npm run studio                  # preview
npm run render                  # -> out/bihar-ki-kahani.mp4
npx remotion still Thumbnail out/thumbnail.png   # 1280x720 thumbnail
```

If Remotion cannot download its headless Chrome, set `REMOTION_BROWSER` to a local Chrome Headless Shell binary.
