"""Music + ambience for the 10-second 'ViharaDusk' anime short.
Melancholic piano over string pads (A minor) resolving to C major as the
light warms. Run: python3 scripts/make_vihara_audio.py
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
rng = np.random.default_rng(11)


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def piano(f, dur=3.5, vel=1.0):
    t = A.t_arr(dur)
    out = np.zeros(len(t))
    for k, amp in enumerate((1, 0.5, 0.28, 0.16, 0.09, 0.05), start=1):
        inh = 1 + 0.0004 * k * k
        out += amp * np.sin(2 * np.pi * f * k * inh * t) * np.exp(-t / (1.6 / k ** 0.6))
    ham = A.fft_filter(rng.standard_normal(len(t)), lo=800, hi=4000) * np.exp(-t / 0.01) * 0.05
    return (out + ham) * np.clip(t / 0.004, 0, 1) * vel


def strings(midis, start, dur, gain):
    s, p = A.pad([hz(m) for m in midis], start, dur, gain, attack=1.6, release=1.8, bright=1800)
    return s, p


def music():
    M = np.zeros((2, N + SR * 5))
    # harmony: Am (0-3.3)  F (3.3-6.6)  C/G -> C (6.6-10)
    for midis, st, d, g in (
        ([45, 52, 57, 60, 64], 0.0, 4.0, 0.16),
        ([41, 48, 53, 57, 60], 3.2, 4.0, 0.17),
        ([43, 48, 55, 60, 64, 67], 6.4, 3.6, 0.2),
    ):
        s, p = strings(midis, st, d, g)
        A.place(M, A.reverb(p, 0.35, A.IR_L)[: len(p) + SR], s, 1.0)
    # piano melody (sparse, breathing)
    mel = [
        (0.6, 76, 0.8), (1.4, 74, 0.6), (2.0, 72, 0.7), (2.9, 69, 0.8),
        (3.7, 72, 0.7), (4.4, 74, 0.6), (5.0, 77, 0.8), (5.9, 76, 0.7),
        (6.7, 79, 0.9), (7.4, 76, 0.7), (8.0, 84, 0.8),
    ]
    for st, m, v in mel:
        A.place(M, A.reverb(piano(hz(m), 3.0, v), 0.4, A.IR_R), st, 0.16, 0.2)
    # left hand: soft low notes
    for st, m in ((0.0, 45), (1.7, 52), (3.3, 41), (5.0, 48), (6.6, 43), (8.0, 48)):
        A.place(M, A.reverb(piano(hz(m), 3.5, 0.7), 0.3, A.IR_L), st, 0.14, -0.2)
    M = M[:, :N]
    fade = np.clip((DUR - np.arange(N) / SR) / 0.9, 0, 1)
    return M * fade


def sfx():
    S = np.zeros((2, N + SR * 8))
    w = A.wind(10.0)
    gust = 0.5 + 0.5 * np.clip((A.t_arr(10.0) - 4.8) / 1.0, 0, 1) * np.clip((9.0 - A.t_arr(10.0)) / 2.0, 0, 1)
    A.place(S, w * gust, 0.0, 0.12)
    # soft footsteps on dirt while walking
    for k in range(7):
        st = 0.25 + k * 0.42
        step = A.fft_filter(rng.standard_normal(int(0.12 * SR)), lo=300, hi=2500) * np.exp(-A.t_arr(0.12) / 0.03)
        A.place(S, step, st, 0.05, -0.2 + 0.05 * k)
    # leaves rustle with the gust
    A.place(S, A.whoosh(2.0, 1500, 7000), 4.9, 0.08, 0.3)
    # distant temple bell as the windows light up, and a chime at the reveal
    A.place(S, A.bell(174.6, 6.0), 4.7, 0.16, 0.5)
    A.place(S, A.shimmer(2.5), 7.5, 0.08)
    A.place(S, A.chime(1046.5, 3.0), 7.7, 0.12)
    S = S[:, :N]
    fade = np.clip((DUR - np.arange(N) / SR) / 0.9, 0, 1)
    return S * fade


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    A.write_wav(os.path.join(OUT, "vihara-music.wav"), A.norm(music(), 0.55))
    A.write_wav(os.path.join(OUT, "vihara-sfx.wav"), np.clip(sfx(), -0.95, 0.95))
    print("ok")
