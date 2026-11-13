"""Procedurally synthesises the background score and sound effects for
"Bihar ki Kahani". Everything is generated from scratch with numpy, so there
are no licensing issues. Outputs public/music.wav and public/sfx.wav, both
aligned to the narration timeline (t=0 is the start of the video).

Run:  python3 scripts/make_audio.py
"""
import os
import subprocess
import wave

import numpy as np

SR = 44100
TOTAL = 94.5  # seconds, must match the composition length
N = int(TOTAL * SR)
rng = np.random.default_rng(7)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "public")


# ---------------------------------------------------------------- helpers
def t_arr(dur):
    return np.arange(int(dur * SR)) / SR


def env_ad(n, attack, decay_tau):
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-np.maximum(t - attack, 0) / decay_tau)


def fft_filter(x, lo=None, hi=None, slope=4):
    """Smooth band-pass in the frequency domain."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.ones_like(f)
    if lo:
        g *= 1 / (1 + (lo / np.maximum(f, 1e-3)) ** slope)
    if hi:
        g *= 1 / (1 + (f / hi) ** slope)
    return np.fft.irfft(X * g, len(x))


def fft_conv(x, h):
    n = len(x) + len(h) - 1
    nfft = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(h, nfft), nfft)[:n]


def make_ir(dur=2.6, tau=0.7, damp=5000):
    h = rng.standard_normal(int(dur * SR)) * np.exp(-t_arr(dur) / tau)
    h = fft_filter(h, lo=120, hi=damp, slope=2)
    h[0] = 0
    return h / np.sqrt(np.sum(h ** 2))


IR = make_ir()
IR_L = make_ir(3.2, 0.9)
IR_R = make_ir(3.2, 0.9)


def reverb(x, wet=0.3, ir=IR):
    y = fft_conv(x, ir)[: len(x) + len(ir) - 1]
    out = np.zeros(len(y))
    out[: len(x)] += x * (1 - wet)
    out += y * wet
    return out


def place(buf, sig, at, gain=1.0, pan=0.0):
    """Mix a mono signal into a stereo buffer with constant-power pan."""
    i = int(at * SR)
    if i >= buf.shape[1]:
        return
    sig = sig[: buf.shape[1] - i]
    lg = np.cos((pan + 1) * np.pi / 4)
    rg = np.sin((pan + 1) * np.pi / 4)
    buf[0, i : i + len(sig)] += sig * gain * lg * np.sqrt(2)
    buf[1, i : i + len(sig)] += sig * gain * rg * np.sqrt(2)


def norm(x, peak=1.0):
    m = np.max(np.abs(x))
    return x / m * peak if m > 0 else x


# ---------------------------------------------------------------- SFX
def whoosh(dur=1.0, lo=300, hi=4000, rise=True):
    n = int(dur * SR)
    noise = rng.standard_normal(n)
    bands = np.geomspace(lo, hi, 8)
    t = np.linspace(0, 1, n)
    pos = t if rise else 1 - t
    out = np.zeros(n)
    for k, fc in enumerate(bands):
        b = fft_filter(noise, lo=fc * 0.7, hi=fc * 1.4, slope=4)
        centre = k / (len(bands) - 1)
        out += b * np.exp(-((pos - centre) ** 2) / 0.04)
    shape = np.sin(np.pi * t) ** 1.5
    return norm(reverb(out * shape, 0.25)) * 0.8


def boom(dur=3.0, f0=70, f1=32):
    t = t_arr(dur)
    f = f1 + (f0 - f1) * np.exp(-t / 0.25)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.9)
    thud = fft_filter(rng.standard_normal(len(t)), hi=400) * np.exp(-t / 0.08) * 3
    click = fft_filter(rng.standard_normal(len(t)), lo=2000) * np.exp(-t / 0.01) * 0.5
    return norm(reverb(body + thud + click, 0.35, IR_L))


def riser(dur=2.5):
    t = t_arr(dur)
    p = t / dur
    noise = rng.standard_normal(len(t))
    hp = np.zeros(len(t))
    for k, fc in enumerate(np.geomspace(400, 6000, 10)):
        c = k / 9
        hp += fft_filter(noise, lo=fc * 0.7, hi=fc * 1.4) * np.exp(-((p - c) ** 2) / 0.05)
    tone = np.sin(2 * np.pi * np.cumsum(110 + 330 * p ** 2) / SR) * 0.3
    return norm((hp + tone) * p ** 2.2)


def bell(f=440, dur=5.0, ratios=(1, 2.0, 2.76, 4.07, 5.4, 6.8), bright=1.0):
    t = t_arr(dur)
    out = np.zeros(len(t))
    for k, r in enumerate(ratios):
        amp = (0.8 ** k) * (bright if k > 1 else 1)
        beat = 1 + 0.002 * np.sin(2 * np.pi * 0.7 * t)
        out += amp * np.sin(2 * np.pi * f * r * beat * t + k) * np.exp(-t / (dur / (1 + k * 0.6)))
    out *= np.clip(t / 0.003, 0, 1)
    return norm(reverb(out, 0.3))


def chime(f=1400, dur=2.0):
    return bell(f, dur, ratios=(1, 2.4, 3.9, 5.6), bright=0.6)


def clang(f=520, dur=2.2):
    t = t_arr(dur)
    ratios = (1, 1.48, 2.31, 2.97, 3.84, 4.73, 6.1)
    out = sum(np.sin(2 * np.pi * f * r * t) * np.exp(-t / (0.9 / (1 + i * 0.4))) * (0.85 ** i)
              for i, r in enumerate(ratios))
    hit = fft_filter(rng.standard_normal(len(t)), lo=1500) * np.exp(-t / 0.015) * 2
    return norm(reverb(out + hit, 0.3))


def sword_ring(dur=1.8):
    t = t_arr(dur)
    scrape = fft_filter(rng.standard_normal(len(t)), lo=3000, hi=9000) * np.exp(-t / 0.25) * np.clip(t / 0.05, 0, 1)
    ring = sum(np.sin(2 * np.pi * f * t) * np.exp(-t / 0.8) for f in (2900, 4130, 5370)) * 0.4
    return norm(reverb(scrape * 0.6 + ring, 0.25))


def pop(f=600, dur=0.35):
    t = t_arr(dur)
    fr = f * (1 + 1.2 * np.exp(-t / 0.02))
    s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.07)
    return norm(reverb(s, 0.15)) * 0.8


def thump(f=60, dur=0.8):
    t = t_arr(dur)
    fr = f * (1 + 1.5 * np.exp(-t / 0.03))
    s = np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t / 0.18)
    dirt = fft_filter(rng.standard_normal(len(t)), lo=80, hi=900) * np.exp(-t / 0.05) * 0.8
    return norm(reverb(s + dirt, 0.2, IR_L))


def elephant(dur=1.9):
    t = t_arr(dur)
    p = t / dur
    f = 330 + 380 * np.sin(np.pi * np.clip(p * 1.3, 0, 1)) ** 0.7 + 18 * np.sin(2 * np.pi * 9 * t)
    f *= 1 + 0.02 * rng.standard_normal(len(t)).cumsum() / np.sqrt(len(t))
    ph = 2 * np.pi * np.cumsum(f) / SR
    saw = sum(np.sin(k * ph) / k for k in range(1, 18))
    rough = 1 + 0.5 * np.sin(2 * np.pi * 37 * t)
    sig = saw * rough
    sig = fft_filter(sig, lo=500, hi=3500, slope=2)
    breath = fft_filter(rng.standard_normal(len(t)), lo=1000, hi=5000) * 0.25
    envl = np.clip(t / 0.08, 0, 1) * np.clip((dur - t) / 0.5, 0, 1)
    return norm(reverb((sig + breath) * envl, 0.35, IR_L))


def water(dur, level=1.0, rush=False):
    n = int(dur * SR)
    base = fft_filter(rng.standard_normal(n), lo=150, hi=2500 if not rush else 5000, slope=2)
    lfo = 0.7 + 0.3 * np.sin(2 * np.pi * 0.23 * t_arr(dur)) * np.sin(2 * np.pi * 0.61 * t_arr(dur) + 1)
    out = base * lfo
    # bubbles
    for _ in range(int(dur * (14 if not rush else 30))):
        bd = rng.uniform(0.02, 0.07)
        bt = t_arr(bd)
        f0 = rng.uniform(600, 2400)
        b = np.sin(2 * np.pi * np.cumsum(f0 * (1 + 2.5 * bt / bd)) / SR) * np.exp(-bt / (bd / 3))
        i = rng.integers(0, max(1, n - len(b)))
        out[i : i + len(b)] += b * rng.uniform(0.2, 0.8) * np.std(base) * 3
    fade = np.minimum(np.clip(t_arr(dur) / 1.2, 0, 1), np.clip((dur - t_arr(dur)) / 1.5, 0, 1))
    return norm(out * fade) * level


def wind(dur):
    n = int(dur * SR)
    t = t_arr(dur)
    out = np.zeros(n)
    noise = rng.standard_normal(n)
    for fc, sp in ((300, 0.13), (700, 0.21), (1500, 0.17)):
        out += fft_filter(noise, lo=fc * 0.6, hi=fc * 1.6) * (0.6 + 0.4 * np.sin(2 * np.pi * sp * t + fc))
    fade = np.minimum(np.clip(t / 1.5, 0, 1), np.clip((dur - t) / 1.5, 0, 1))
    return norm(out * fade)


def marching(dur, bpm=120):
    out = np.zeros(int(dur * SR))
    step = 60 / bpm
    k = 0
    while k * step < dur - 0.3:
        s = thump(90 if k % 2 else 75, 0.4) * (0.7 + 0.3 * (k % 2))
        i = int(k * step * SR)
        out[i : i + len(s)] += s[: len(out) - i]
        k += 1
    return norm(out)


def shimmer(dur=3.0):
    t = t_arr(dur)
    out = np.zeros(len(t))
    for _ in range(26):
        f = rng.choice([1174.7, 1318.5, 1568.0, 1760.0, 2349.3, 2637.0])
        st = rng.uniform(0, dur * 0.6)
        c = chime(f, 1.4) * rng.uniform(0.2, 0.6)
        i = int(st * SR)
        out[i : i + len(c)] += c[: len(out) - i]
    return norm(out * np.clip((dur - t) / 0.8, 0, 1))


def crowd(dur):
    n = int(dur * SR)
    t = t_arr(dur)
    out = np.zeros(n)
    for _ in range(40):
        f = rng.uniform(140, 320)
        voice = np.sin(2 * np.pi * np.cumsum(f * (1 + 0.08 * np.sin(2 * np.pi * rng.uniform(1, 4) * t))) / SR)
        voice *= np.clip(np.sin(2 * np.pi * rng.uniform(0.2, 0.7) * t + rng.uniform(0, 6)), 0, 1)
        out += voice
    out = fft_filter(out, lo=200, hi=1200) + fft_filter(rng.standard_normal(n), lo=300, hi=2000) * 0.5 * np.std(out)
    fade = np.minimum(np.clip(t / 1.5, 0, 1), np.clip((dur - t) / 1.5, 0, 1))
    return norm(out * fade)


def build_sfx():
    S = np.zeros((2, N + SR * 4))
    # 1. Dawn on the Ganga
    place(S, wind(6.0), 0.0, 0.10)
    place(S, water(6.5, 1.0), 0.0, 0.16)
    # 2. no sea, no mountains
    place(S, pop(300), 5.35, 0.35, -0.3)
    place(S, pop(260), 6.15, 0.35, 0.3)
    place(S, riser(2.6), 7.6, 0.22)
    place(S, boom(), 10.15, 0.55)
    # 3. Magadh title
    place(S, whoosh(0.9), 11.5, 0.3)
    place(S, boom(3.5, 80, 30), 12.45, 0.6)
    place(S, shimmer(3.0), 12.5, 0.18)
    place(S, whoosh(1.0, 500, 6000), 13.9, 0.25)
    place(S, chime(1046.5, 3.0), 15.75, 0.25)
    # 4. Vihara
    place(S, whoosh(1.0), 17.5, 0.3, -0.2)
    place(S, bell(220, 6.0), 18.6, 0.32)
    for k, tt in enumerate((21.9, 22.5, 23.0, 23.5, 23.9, 24.3, 24.6)):
        place(S, chime(880 * (1.0, 1.125, 1.25, 1.5, 1.6875, 2.0, 2.25)[k], 1.5), tt, 0.14, rng.uniform(-0.7, 0.7))
    place(S, chime(1318.5, 3.0), 25.3, 0.2)
    # 5. Rivers
    place(S, whoosh(0.9), 26.9, 0.28)
    place(S, water(12.4, 1.0), 27.0, 0.16)
    place(S, whoosh(1.6, 200, 2000), 29.3, 0.25)
    for tt, pan in ((31.6, -0.5), (32.6, -0.1), (33.6, 0.4), (34.5, 0.0)):
        place(S, whoosh(0.9, 400, 3000), tt, 0.18, pan)
    place(S, water(4.0, 1.0, rush=True), 36.0, 0.28)
    place(S, boom(2.0, 60, 35), 36.4, 0.2)
    # 6. paddy, granary, army
    place(S, pop(700), 39.6, 0.35, -0.4)
    place(S, pop(520), 41.0, 0.35, 0.0)
    place(S, marching(2.2, 140), 42.4, 0.35, 0.3)
    # 7. iron
    place(S, whoosh(0.9), 44.1, 0.28)
    place(S, clang(480), 45.7, 0.3, -0.3)
    place(S, clang(560), 46.6, 0.26, 0.2)
    place(S, sword_ring(), 47.6, 0.3, 0.4)
    # 8. elephants
    place(S, whoosh(0.8), 49.1, 0.25)
    place(S, elephant(), 49.5, 0.42)
    for k in range(6):
        place(S, thump(48, 1.0), 50.9 + k * 0.42, 0.42, 0.3 * np.sin(k))
    # 9. Rajgir — five hills
    place(S, whoosh(0.9), 53.0, 0.28)
    for k in range(5):
        place(S, thump(70 - k * 4, 0.9), 55.0 + k * 0.35, 0.4, -0.6 + k * 0.3)
    place(S, boom(2.5, 70, 32), 57.6, 0.4)
    # 10. 16 mahajanapadas & conquest
    place(S, whoosh(0.9), 59.4, 0.28)
    for k in range(16):
        place(S, pop(500 + 40 * k, 0.25), 59.9 + k * 0.11, 0.17, -0.8 + k * 0.1)
    for k, tt in enumerate((63.1, 64.0, 64.9, 65.6, 66.2, 66.8)):
        place(S, thump(70, 0.6), tt, 0.4)
        place(S, sword_ring(1.2), tt + 0.05, 0.12, (-1) ** k * 0.5)
    # 11. Pataliputra -> Patna
    place(S, whoosh(1.1), 67.6, 0.3)
    place(S, crowd(6.0), 68.2, 0.07)
    place(S, shimmer(2.5), 69.2, 0.12)
    place(S, whoosh(0.9, 500, 6000), 72.8, 0.25)
    place(S, chime(1174.7, 3.0), 73.3, 0.25)
    # 12. Buddha & Mahavira
    place(S, whoosh(1.2, 200, 2000, rise=False), 74.7, 0.22)
    place(S, bell(196, 7.0), 76.3, 0.32)
    place(S, wind(5.0), 75.0, 0.05)
    place(S, bell(293.7, 6.0, bright=0.7), 78.9, 0.26)
    place(S, chime(1567.98, 3.0), 81.6, 0.2, -0.4)
    place(S, chime(1174.7, 3.0), 82.6, 0.2, 0.4)
    # 13. finale
    place(S, boom(3.5, 85, 30), 84.35, 0.55)
    place(S, riser(2.8), 86.9, 0.25)
    place(S, boom(4.0, 90, 28), 89.85, 0.65)
    place(S, shimmer(3.5), 89.9, 0.18)
    S = S[:, :N]
    return S


# ---------------------------------------------------------------- MUSIC
SA = 146.83  # D


def tanpura_pluck(f, dur=2.6):
    t = t_arr(dur)
    out = np.zeros(len(t))
    for k in range(1, 22):
        # jawari: upper partials bloom slightly after the pluck
        bloom = 1 - np.exp(-t / (0.05 + 0.02 * k))
        amp = (1 / k ** 0.9) * (0.5 + 0.5 * bloom)
        out += amp * np.sin(2 * np.pi * f * k * t * (1 + 0.0004 * k)) * np.exp(-t / (1.8 / (1 + 0.08 * k)))
    out *= np.clip(t / 0.01, 0, 1)
    return out


def tanpura(start, end, gain):
    pattern = [SA * 0.75 * 0.5 * 2, SA, SA, SA * 0.5]  # Pa(low) Sa Sa Sa(low)
    step = 0.62
    out = np.zeros((2, N + SR * 3))
    k = 0
    tt = start
    while tt < end:
        p = tanpura_pluck(pattern[k % 4]) * gain
        place(out, p, tt, 1.0, -0.4 + 0.8 * ((k // 4) % 2))
        tt += step + (0.2 if k % 4 == 3 else 0)
        k += 1
    return out[:, :N]


def pad(freqs, start, dur, gain, attack=2.0, release=2.5, bright=2400):
    t = t_arr(dur)
    out = np.zeros(len(t))
    for f in freqs:
        for det in (-0.004, 0, 0.0045):
            ph = 2 * np.pi * f * (1 + det) * t + rng.uniform(0, 6)
            out += sum(np.sin(k * ph) / k for k in range(1, 9))
    out = fft_filter(out, hi=bright, slope=2)
    e = np.minimum(np.clip(t / attack, 0, 1), np.clip((dur - t) / release, 0, 1))
    return start, norm(out * e) * gain


def flute(notes, start, gain=0.2):
    """notes: list of (semitone offset from Sa, duration in seconds)."""
    pieces = []
    for semi, d in notes:
        t = t_arr(d)
        if semi is None:
            pieces.append(np.zeros(len(t)))
            continue
        f = SA * 2 * 2 ** (semi / 12)
        vib = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * t) * np.clip(t / 0.4, 0, 1)
        ph = 2 * np.pi * np.cumsum(f * vib) / SR
        tone = np.sin(ph) + 0.25 * np.sin(2 * ph) + 0.08 * np.sin(3 * ph)
        breath = fft_filter(rng.standard_normal(len(t)), lo=f, hi=f * 4) * 0.12
        e = np.clip(t / 0.08, 0, 1) * np.clip((d - t) / 0.12, 0, 1)
        pieces.append((tone + breath) * e)
    sig = np.concatenate(pieces)
    return start, norm(reverb(sig, 0.45, IR_R)) * gain


def tabla_dha(f=95):
    t = t_arr(0.6)
    bayan = np.sin(2 * np.pi * np.cumsum(f * (1 + 0.8 * np.exp(-t / 0.04))) / SR) * np.exp(-t / 0.25)
    dayan = sum(np.sin(2 * np.pi * 330 * r * t) * np.exp(-t / 0.12) * a for r, a in ((1, 1), (2.02, 0.5), (3.01, 0.3)))
    slap = fft_filter(rng.standard_normal(len(t)), lo=1500) * np.exp(-t / 0.01) * 0.6
    return bayan + dayan * 0.5 + slap


def tabla_na():
    t = t_arr(0.4)
    ring = sum(np.sin(2 * np.pi * 660 * r * t) * np.exp(-t / 0.08) * a for r, a in ((1, 1), (2.0, 0.6), (2.98, 0.35)))
    slap = fft_filter(rng.standard_normal(len(t)), lo=2000) * np.exp(-t / 0.008)
    return ring * 0.5 + slap * 0.5


def tabla_ge():
    t = t_arr(0.5)
    return np.sin(2 * np.pi * np.cumsum(85 * (1 + 0.5 * np.exp(-t / 0.05))) / SR) * np.exp(-t / 0.3)


def percussion(buf, start, end, bpm, gain, dense=False):
    beat = 60 / bpm
    # keherwa: dha ge na ti | na ka dhi na
    pattern = ["dha", "ge", "na", "ti", "na", "ke", "dhi", "na"]
    if dense:
        pattern = ["dha", "na", "ge", "na", "dha", "ge", "dhi", "na"]
    k = 0
    tt = start
    D, G, Na = tabla_dha(), tabla_ge(), tabla_na()
    while tt < end:
        s = pattern[k % 8]
        sig = {"dha": D, "dhi": D * 0.8, "ge": G * 0.8, "na": Na, "ti": Na * 0.6, "ke": Na * 0.4}[s]
        acc = 1.0 if k % 8 == 0 else 0.75
        place(buf, sig, tt, gain * acc, 0.15 * np.sin(k))
        tt += beat / 2
        k += 1


def build_music():
    M = np.zeros((2, N + SR * 8))
    M[:, :N] += tanpura(0.3, 92.0, 0.05)
    # chord pads (D: Sa=D). Scene-aligned.
    for st, dur, fr, g in (
        (0.0, 11.6, (SA / 2, SA * 1.5 / 2, SA), 0.11),
        (10.1, 7.6, (SA / 2 * 4 / 3, SA * 4 / 3 / 2 * 1.5, SA * 4 / 3), 0.12),  # G-ish lift
        (17.3, 9.8, (SA / 2, SA * 1.5 / 2, SA * 1.25), 0.10),
        (26.8, 17.6, (SA / 2 * 1.125, SA * 1.125 * 0.75, SA * 1.5), 0.09),
        (44.0, 15.6, (SA / 2 * 0.89, SA * 0.89 * 0.75, SA), 0.11),
        (59.3, 15.6, (SA / 2, SA * 0.75, SA * 1.5, SA * 2), 0.12),
        (74.6, 9.8, (SA / 2, SA * 1.5 / 2, SA * 1.25), 0.09),
        (84.2, 10.3, (SA / 2, SA * 0.75, SA, SA * 1.5), 0.14),
    ):
        s, p = pad(fr, st, dur, g)
        place(M, p, s, 1.0)
    # bansuri phrases (Bhupali: S R G P D)
    R, G, P, D, S2 = 2, 4, 7, 9, 12
    s, f = flute([(0, 0.8), (R, 0.4), (G, 1.2), (P, 0.5), (G, 0.5), (R, 0.6), (0, 1.6)], 0.8, 0.12)
    place(M, f, s, 1.0, 0.2)
    s, f = flute([(G, 0.6), (P, 0.6), (D, 1.0), (S2, 1.6), (D, 0.5), (P, 1.5)], 18.0, 0.10)
    place(M, f, s, 1.0, -0.2)
    s, f = flute([(P, 1.0), (G, 0.6), (R, 0.6), (G, 1.0), (0, 2.0), (None, 0.6), (-3, 0.6), (0, 2.2)], 75.2, 0.12)
    place(M, f, s, 1.0, 0.15)
    s, f = flute([(G, 0.5), (P, 0.5), (D, 0.5), (S2, 1.2), (D, 0.4), (S2, 2.6)], 86.8, 0.10)
    place(M, f, s, 1.0)
    # percussion arrangement
    percussion(M, 27.0, 44.0, 84, 0.05)
    percussion(M, 44.2, 59.3, 92, 0.065)
    percussion(M, 59.5, 74.6, 104, 0.08, dense=True)
    percussion(M, 84.4, 89.7, 104, 0.08, dense=True)
    # final sustained low Sa
    s, p = pad((SA / 4, SA / 2, SA * 0.75), 89.8, 4.7, 0.16, attack=0.05, release=3.5, bright=1500)
    place(M, p, s, 1.0)
    M = M[:, :N]
    # stereo width: tiny reverb on whole bed
    M[0] = reverb(M[0], 0.2, IR_L)[:N]
    M[1] = reverb(M[1], 0.2, IR_R)[:N]
    return M


def narration_envelope():
    raw = subprocess.run(
        ["ffmpeg", "-v", "quiet", "-i", os.path.join(PUB, "narration.mp3"), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
        capture_output=True,
        check=True,
    ).stdout
    v = np.frombuffer(raw, dtype=np.float32)
    v = np.pad(v, (0, max(0, N - len(v))))[:N]
    win = int(0.05 * SR)
    rms = np.sqrt(np.convolve(v ** 2, np.ones(win) / win, mode="same"))
    speaking = (rms > 0.02).astype(float)
    sm = int(0.35 * SR)
    return np.clip(np.convolve(speaking, np.ones(sm) / sm, mode="same"), 0, 1)


def write_wav(path, stereo):
    stereo = np.clip(stereo, -1, 1)
    data = (stereo.T * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


if __name__ == "__main__":
    duck = 1 - 0.45 * narration_envelope()
    music = build_music() * duck
    fade_out = np.clip((TOTAL - np.arange(N) / SR) / 2.5, 0, 1)
    music *= fade_out
    sfx = build_sfx()
    write_wav(os.path.join(PUB, "music.wav"), norm(music, 0.5))
    write_wav(os.path.join(PUB, "sfx.wav"), np.clip(sfx, -0.95, 0.95))
    print("music peak", np.max(np.abs(music)), "sfx peak", np.max(np.abs(sfx)))
