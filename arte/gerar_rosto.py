# -*- coding: utf-8 -*-
"""
gerar_rosto.py — esculpe OFFLINE o relevo de alta definição dos rostos do Limbo (a
Camada I da descida) e do Andarilho do Ermo, e grava duas texturas que o abismo.js
grava em GRAVURA de cédula, pixel a pixel (não em células ASCII).

Por que outro relevo: a máscara de Argos é ouro batido, lisa e estilizada; os rostos do
Limbo são CARNE — pálpebras costuradas pelo sono, vinco dos cílios, arcada, maçãs,
sulcos nasolabiais, filtro, lábios, queixo, rugas da testa, pés de galinha e o poro da
pele. É esse micro-relevo que a gravura (linhas que contornam a forma) revela.

Saída (raiz do site — img-src 'self'):
  rosto-n.png  RGB = normal.x, normal.y (0,5 ± n/2) e altura (0..1; 0 = fora do rosto)
  rosto-m.png  RGB = cavidade (0,5 neutro; <0,5 vinco, >0,5 crista), oclusão (1 = aberto) e
                     "fio" (1 = aresta viva: pálpebra, lábio, sulco — onde o buril corta)
Sem canal alfa: PNG com alfa 0 pode perder o RGB no upload WebGL (pré-multiplicação).

Referencial (o mesmo do shader, y PARA BAIXO): x ∈ [-1, 1], y ∈ [-1,15, 1,15];
olhos fechados em (±0,31, -0,10). Mude aqui → mude ROSTO_* no abismo.js.

Uso:  python gerar_rosto.py [pasta_de_saida] [--previa pasta]
Depende só de numpy + Pillow.
"""
import sys
import os
import numpy as np
from PIL import Image

X0, X1, Y0, Y1 = -1.0, 1.0, -1.15, 1.15
TW, TH = 320, 368          # textura final (rosto da frente ≈ 500 px: ~1,5 px CSS por texel)
SS = 2
W, H = TW * SS, TH * SS
HMAX = 0.62

xs = X0 + (np.arange(W) + 0.5) / W * (X1 - X0)
ys = Y0 + (np.arange(H) + 0.5) / H * (Y1 - Y0)
X, Y = np.meshgrid(xs, ys)
rng = np.random.default_rng(7)


def g(cx, cy, sx, sy, a, rot=0.0):
    """bossa/vinco gaussiano elíptico (a < 0 escava)"""
    c, s = np.cos(rot), np.sin(rot)
    dx, dy = X - cx, Y - cy
    u, v = c * dx + s * dy, -s * dx + c * dy
    return a * np.exp(-(u * u) / (2 * sx * sx) - (v * v) / (2 * sy * sy))


def sulco_curva(pts, larg, a):
    """vinco fino ao longo de uma polilinha (distância ao segmento mais próximo)"""
    d = np.full(X.shape, 9.0)
    for (x0, y0), (x1, y1) in zip(pts[:-1], pts[1:]):
        bx, by = x1 - x0, y1 - y0
        t = np.clip(((X - x0) * bx + (Y - y0) * by) / (bx * bx + by * by), 0, 1)
        d = np.minimum(d, np.hypot(X - x0 - bx * t, Y - y0 - by * t))
    return a * np.exp(-(d * d) / (2 * larg * larg))


def arco(cx, cy, rx, ry, t0, t1, n=14):
    t = np.linspace(t0, t1, n)
    return list(zip(cx + rx * np.cos(t), cy + ry * np.sin(t)))


def suave(a, r):
    """borrão separável barato (média móvel repetida ≈ gaussiano)"""
    k = 2 * r + 1
    for _ in range(3):
        a = np.cumsum(np.pad(a, ((0, 0), (r + 1, r)), mode='edge'), axis=1)
        a = (a[:, k:] - a[:, :-k]) / k
        a = np.cumsum(np.pad(a, ((r + 1, r), (0, 0)), mode='edge'), axis=0)
        a = (a[k:, :] - a[:-k, :]) / k
    return a


# ── volume: oval do rosto, mais largo na têmpora, estreitando no queixo
ry = 1.04
rx = 0.80 - 0.10 * np.clip((Y - 0.2) / 0.9, 0, 1) ** 1.4 + 0.03 * np.clip(-(Y + 0.2) / 0.9, 0, 1)
r2 = (X / rx) ** 2 + (Y / ry) ** 2
dentro = r2 < 1.0
h = 0.42 * np.sqrt(np.clip(1.0 - r2, 0, 1)) ** 0.8

# testa e têmporas
h += g(0, -0.62, 0.42, 0.25, 0.04)
h += g(-0.66, -0.32, 0.12, 0.2, -0.05) + g(0.66, -0.32, 0.12, 0.2, -0.05)
# arcada das sobrancelhas
for s in (-1, 1):
    h += g(s * 0.30, -0.30, 0.22, 0.065, 0.075, rot=s * 0.12)
    # órbita funda, sob a arcada
    h += g(s * 0.31, -0.11, 0.17, 0.11, -0.10)
    # pálpebra fechada: bossa do globo coberto + vinco da pálpebra superior + linha dos cílios
    h += g(s * 0.31, -0.105, 0.135, 0.068, 0.07)
    h += sulco_curva(arco(s * 0.31, -0.06, 0.15, 0.085, np.pi + 0.25, 2 * np.pi - 0.25), 0.012, -0.03)
    h += sulco_curva(arco(s * 0.31, -0.16, 0.14, 0.07, 0.35, np.pi - 0.35), 0.006, -0.04)
    # pés de galinha no canto de fora do olho
    for k in range(4):
        ang = -0.55 + 0.35 * k
        x0, y0 = s * 0.47, -0.09
        h += sulco_curva([(x0, y0), (x0 + s * 0.13 * np.cos(ang), y0 + 0.13 * np.sin(ang))], 0.005, -0.008)
    # bolsa sob o olho
    h += g(s * 0.31, 0.02, 0.13, 0.04, 0.02)
    h += sulco_curva(arco(s * 0.31, -0.02, 0.15, 0.07, 0.3, np.pi - 0.3), 0.007, -0.012)
    # maçã do rosto e a cava abaixo dela
    h += g(s * 0.44, 0.12, 0.16, 0.12, 0.06)
    h += g(s * 0.42, 0.40, 0.13, 0.13, -0.035)
    # sulco nasolabial
    h += sulco_curva([(s * 0.13, 0.21), (s * 0.19, 0.31), (s * 0.235, 0.42), (s * 0.255, 0.53), (s * 0.25, 0.6)], 0.026, -0.02)
    # asa do nariz e narina
    h += g(s * 0.08, 0.215, 0.045, 0.035, 0.045)
    h += g(s * 0.045, 0.245, 0.022, 0.014, -0.04)
# o nariz (a base; o cone espetado é desenhado à parte, em perspectiva)
h += sulco_curva([(0, -0.22), (0, 0.12)], 0.042, 0.09)
h += g(0, 0.165, 0.065, 0.055, 0.07)
h += g(0, -0.24, 0.07, 0.04, -0.02)
# filtro (o sulco entre nariz e boca)
h += g(0, 0.36, 0.022, 0.06, -0.008) + g(-0.035, 0.36, 0.012, 0.06, 0.004) + g(0.035, 0.36, 0.012, 0.06, 0.004)
# lábios: superior em arco de cupido, inferior mais cheio, rima da boca e cantos fundos
h += g(0, 0.465, 0.16, 0.032, 0.04) + g(-0.06, 0.455, 0.06, 0.025, 0.01) + g(0.06, 0.455, 0.06, 0.025, 0.01)
h += g(0, 0.555, 0.14, 0.038, 0.05)
h += sulco_curva([(-0.15, 0.452), (-0.06, 0.44), (0, 0.448), (0.06, 0.44), (0.15, 0.452)], 0.006, 0.012)
h += sulco_curva([(-0.17, 0.51), (-0.08, 0.505), (0, 0.512), (0.08, 0.505), (0.17, 0.51)], 0.008, -0.05)
h += g(-0.19, 0.515, 0.025, 0.025, -0.02) + g(0.19, 0.515, 0.025, 0.025, -0.02)
# queixo e o vinco sob o lábio
h += sulco_curva([(-0.1, 0.665), (0, 0.675), (0.1, 0.665)], 0.016, -0.02)
h += g(0, 0.82, 0.18, 0.11, 0.06)
# rugas da testa
for k, yk in enumerate((-0.52, -0.62, -0.72)):
    xs_ = np.linspace(-0.42, 0.42, 12)
    pts = [(x, yk + 0.02 * np.sin(x * 6 + k)) for x in xs_]
    h += sulco_curva(pts, 0.011, -0.0045 * (1.0 - 0.25 * k))
h += sulco_curva([(-0.02, -0.42), (-0.015, -0.34)], 0.008, -0.006)    # vinco entre as sobrancelhas
# pele: poro e grão (micro-relevo que a gravura pega de raspão)
h += suave(rng.standard_normal(X.shape), 2) * 0.0035 + suave(rng.standard_normal(X.shape), 6) * 0.006

h = np.where(dentro, h, 0.0)
h = suave(h, 1)
borda = suave(dentro.astype(float), 3)
h *= np.clip(borda * 1.6, 0, 1)

# normais em alta resolução
px = (X1 - X0) / W
dhx = np.gradient(h, px, axis=1)
dhy = np.gradient(h, px, axis=0)
n = np.dstack([-dhx, -dhy, np.ones_like(h)])
n /= np.linalg.norm(n, axis=2, keepdims=True)

# cavidade (laplaciano) e oclusão (altura menos a vizinhança)
lap = (np.roll(h, 1, 0) + np.roll(h, -1, 0) + np.roll(h, 1, 1) + np.roll(h, -1, 1) - 4 * h) / (px * px)
cav = np.clip(0.5 - lap * 0.004, 0, 1)
ao = np.clip(1.0 - (suave(h, 10) - h) * 9.0, 0, 1)
fio = np.clip(np.abs(lap) * 0.006 - 0.25, 0, 1)


def reduz(a):
    return a.reshape(TH, SS, TW, SS).mean(axis=(1, 3))


hn = reduz(h) / HMAX
dn = reduz(dentro.astype(float))
alt = np.where(dn > 0.5, np.clip(0.02 + hn * 0.98, 0.02, 1), 0.0)
img_n = np.dstack([reduz(n[..., 0]) * 0.5 + 0.5, reduz(n[..., 1]) * 0.5 + 0.5, alt])
img_m = np.dstack([reduz(cav), reduz(ao), reduz(fio)])

saida = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('--') else os.path.dirname(os.path.abspath(__file__)) + '/..'
Image.fromarray((np.clip(img_n, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGB').save(os.path.join(saida, 'rosto-n.png'), optimize=True)
Image.fromarray((np.clip(img_m, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGB').save(os.path.join(saida, 'rosto-m.png'), optimize=True)
if '--previa' in sys.argv:
    pv = sys.argv[sys.argv.index('--previa') + 1]
    luz = np.clip(n[..., 0] * -0.6 + n[..., 1] * -0.55 + n[..., 2] * 0.6, 0, 1) * ao * np.clip(cav * 2.0, 0, 1)
    Image.fromarray((np.clip(luz, 0, 1) * 255).astype(np.uint8)).save(os.path.join(pv, 'rosto-previa.png'))
print('ok', TW, 'x', TH)
