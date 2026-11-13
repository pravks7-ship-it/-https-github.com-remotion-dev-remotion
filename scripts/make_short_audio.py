"""Music + SFX for the 10-second 'RiverToPower' short.
Light plucked-string arpeggio (Karplus-Strong), shaker and soft bass,
plus effects reused from make_audio.py. Run: python3 scripts/make_short_audio.py
"""
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_audio as A  # noqa: E402

SR = A.SR
DUR = 10.0
N = int(DUR * SR)
OUT = os.path.join(A.PUB, "short")
rng = np.random.default_rng(3)


def pluck(f, dur=1.6, bright=0.5):
    """Vectorised Karplus-Strong: process one period at a time."""
    p = int(SR / f)
    n = int(dur * SR)
    buf = rng.uniform(-1, 1, p)
    buf = A.fft_filter(np.concatenate([buf, buf]), hi=3000 + 5000 * bright)[:p]
    out = np.empty(n + p)
    out[:p] = buf
    i = p
    while i < n:
        prev = out[i - p : i]
        nxt = 0.5 * (prev + np.roll(prev, 1)) * 0.996
        out[i : i + p] = nxt
        i += p
    return out[:n] * np.exp(-np.arange(n) / SR / 0.9)


def music():
    M = np.zeros((2, N + SR * 3))
    bpm = 108
    eighth = 60 / bpm / 2
    # D major, bright and playful: I - IV - V - I
    D, G, A_, = 293.66, 392.0, 440.0
    chords = [
        (D, [1, 1.25, 1.5, 2]),
        (G * 0.75, [1, 1.25, 1.5, 2]),
        (A_ * 0.75, [1, 1.26, 1.5, 2]),
        (D, [1, 1.25, 1.5, 2]),
    ]
    order = [0, 2, 1, 3, 2, 1, 3, 2]
    k = 0
    tt = 0.15
    while tt < 9.3:
        bar = int(tt / (eighth * 8)) % 4
        root, ratios = chords[bar]
        f = root * ratios[order[k % 8] % 4]
        A.place(M, pluck(f) * (0.9 if k % 8 == 0 else 0.6), tt, 0.16, -0.3 + 0.6 * ((k % 4) / 3))
        if k % 8 == 0:
            A.place(M, pluck(root / 2, 2.5, 0.2), tt, 0.22, 0)
        # shaker on off-beats once the field grows
        if tt > 3.4 and k % 2 == 1:
            sh = A.fft_filter(rng.standard_normal(int(0.08 * SR)), lo=5000) * np.exp(-np.arange(int(0.08 * SR)) / SR / 0.02)
            A.place(M, sh, tt, 0.05, 0.4)
        # soft kick with the elephant section
        if tt > 6.7 and k % 4 == 0:
            A.place(M, A.thump(55, 0.5), tt, 0.25, 0)
        tt += eighth
        k += 1
    # final chord
    for f in (D / 2, D, D * 1.25, D * 1.5, D * 2):
        A.place(M, pluck(f, 3.0), 9.3, 0.15, 0)
    M = M[:, :N]
    fade = np.clip((DUR - np.arange(N) / SR) / 0.5, 0, 1)
    return M * fade


def sfx():
    S = np.zeros((2, N + SR * 4))
    A.place(S, A.whoosh(0.9, 400, 5000), 0.0, 0.3)
    A.place(S, A.pop(500), 0.55, 0.25, -0.4)
    A.place(S, A.water(3.0, 1.0), 0.8, 0.14)
    A.place(S, A.whoosh(1.3, 200, 2000), 0.85, 0.18, -0.2)
    A.place(S, A.whoosh(0.7), 3.3, 0.22, -0.5)
    for i in range(10):
        A.place(S, A.pop(700 + i * 60, 0.2), 3.6 + i * 0.15, 0.1, -0.6 + i * 0.12)
    A.place(S, A.chime(1318.5, 2.0), 5.3, 0.16)
    A.place(S, A.whoosh(0.8), 6.5, 0.22, 0.5)
    for i in range(4):
        A.place(S, A.thump(50, 0.8), 6.75 + i * 0.33, 0.35, 0.5)
    A.place(S, A.elephant(1.6), 7.65, 0.32, 0.4)
    A.place(S, A.whoosh(0.8, 500, 6000), 9.2, 0.2)
    A.place(S, A.chime(1174.7, 2.5), 9.55, 0.22)
    S = S[:, :N]
    return S


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    A.write_wav(os.path.join(OUT, "music.wav"), A.norm(music(), 0.5))
    A.write_wav(os.path.join(OUT, "sfx.wav"), np.clip(sfx(), -0.95, 0.95))
    print("ok")
