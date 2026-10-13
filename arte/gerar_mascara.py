# -*- coding: utf-8 -*-
"""
gerar_mascara.py — esculpe OFFLINE o relevo da "Máscara de Argos" (a máscara
funerária micênica, "de Agamêmnon") e grava duas texturas pequenas que o
abismo.js usa para RE-ILUMINAR o relevo com a lanterna (o cursor).

Por que offline: esculpir um rosto em GLSL, por célula, com diferenças finitas
custaria dezenas de SDFs × 3 amostras por célula a cada quadro. Aqui o rosto é
somado uma vez (numpy), as normais saem da altura em alta resolução (sem degrau
de quantização de 8 bits) e o shader só faz 2 leituras de textura por célula.

Saída (na raiz da oficina, ao lado do index.html — img-src 'self'):
  mascara-n.png  RGB = normal.x, normal.y (0,5 ± n/2) e altura (0..1)
  mascara-m.png  RGB = distância à borda (0,5 = contorno; <0,5 dentro),
                       classe de traço (0 nada · 1 ─ · 2 ╲ · 3 │ · 4 ╱, ×40; lida com
                       texelFetch, sem filtro) e cavidade (0,5 neutro; <0,5 vinco)
Sem canal alfa de propósito: PNG com alfa 0 pode perder o RGB no upload WebGL
(pré-multiplicação) em alguns navegadores.

Referencial (o mesmo do shader, em "unidades da criatura", y PARA BAIXO):
  x ∈ [-1,30, 1,30], y ∈ [-1,30, 1,56]; olhos principais em (±0,40, -0,12);
  terceiro olho em (0, -0,66). Mude aqui → mude MASC_* no abismo.js.

Uso:  python gerar_mascara.py [pasta_de_saida] [--previa pasta]
Depende só de numpy + Pillow (sem scipy: o repositório não garante).
"""
import sys
import os
import math
import numpy as np
from PIL import Image

X0, X1, Y0, Y1 = -1.30, 1.30, -1.30, 1.56
TW, TH = 200, 220          # textura final (texel ≈ 0,013 un ≈ 4–5 px CSS no desktop)
SS = 3                     # superamostragem para esculpir
W, H = TW * SS, TH * SS
HMAX = 0.46                # altura máxima codificada

xs = X0 + (np.arange(W) + 0.5) / W * (X1 - X0)
ys = Y0 + (np.arange(H) + 0.5) / H * (Y1 - Y0)
X, Y = np.meshgrid(xs, ys)          # (H, W)
DU = (X1 - X0) / W                  # tamanho do pixel de escultura em unidades


# ───────────────────────────── utilitários ─────────────────────────────
def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def smin(a, b, k):
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0.0, 1.0)
    return b * (1.0 - h) + a * h - k * h * (1.0 - h)


def sd_ellipse(px, py, rx, ry):
    k0 = np.hypot(px / rx, py / ry)
    k1 = np.hypot(px / (rx * rx), py / (ry * ry))
    return k0 * (k0 - 1.0) / np.maximum(k1, 1e-5)


def sd_round_box(px, py, bx, by, r):
    qx = np.abs(px) - bx + r
    qy = np.abs(py) - by + r
    return np.hypot(np.maximum(qx, 0), np.maximum(qy, 0)) + np.minimum(np.maximum(qx, qy), 0) - r


def bump(cx, cy, sx, sy, amp, ang=0.0, px=None, py=None):
    px = X if px is None else px
    py = Y if py is None else py
    dx, dy = px - cx, py - cy
    if ang:
        c, s = math.cos(ang), math.sin(ang)
        dx, dy = c * dx + s * dy, -s * dx + c * dy
    return amp * np.exp(-0.5 * ((dx / sx) ** 2 + (dy / sy) ** 2))


def curva(pts, n=14):
    """Catmull-Rom pelos pontos de controle → polilinha densa (lista de (x, y))."""
    P = [pts[0]] + list(pts) + [pts[-1]]
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = map(np.array, (P[i - 1], P[i], P[i + 1], P[i + 2]))
        for k in range(n):
            t = k / n
            t2, t3 = t * t, t * t * t
            q = 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
            out.append(q)
    out.append(np.array(pts[-1]))
    return np.array(out)


def dist_polilinha(poly, px=None, py=None):
    """Distância de cada pixel à polilinha + parâmetro t (0..1, por comprimento) + tangente."""
    px = X if px is None else px
    py = Y if py is None else py
    seg = poly[1:] - poly[:-1]
    comp = np.hypot(seg[:, 0], seg[:, 1])
    acum = np.concatenate([[0.0], np.cumsum(comp)])
    total = acum[-1]
    dmin = np.full(px.shape, 1e9)
    tmin = np.zeros(px.shape)
    tgx = np.zeros(px.shape)
    tgy = np.zeros(px.shape)
    for i in range(len(seg)):
        ax, ay = poly[i]
        bx, by = seg[i]
        L2 = bx * bx + by * by
        if L2 < 1e-12:
            continue
        h = np.clip(((px - ax) * bx + (py - ay) * by) / L2, 0.0, 1.0)
        d = np.hypot(px - ax - bx * h, py - ay - by * h)
        m = d < dmin
        dmin = np.where(m, d, dmin)
        tmin = np.where(m, (acum[i] + h * comp[i]) / total, tmin)
        tgx = np.where(m, bx / math.sqrt(L2), tgx)
        tgy = np.where(m, by / math.sqrt(L2), tgy)
    return dmin, tmin, tgx, tgy


def crista(pts, sig0, sig1, amp0, amp1, px=None, py=None):
    """Relevo ao longo de uma curva: perfil gaussiano com largura/altura variando de 0 a 1."""
    d, t, tx, ty = dist_polilinha(curva(pts), px, py)
    sig = sig0 + (sig1 - sig0) * t
    amp = amp0 + (amp1 - amp0) * t
    return amp * np.exp(-0.5 * (d / sig) ** 2), d, t, tx, ty


def espelho(fn):
    """Aplica uma feição nos dois lados do rosto (x e -x)."""
    return fn(X, Y) + fn(-X, Y)


def borrar(a, sx, sy=None):
    """Gaussiana aproximada por 3 caixas (cumsum) — sem scipy."""
    sy = sx if sy is None else sy

    def caixa1d(arr, r, eixo):
        if r < 1:
            return arr
        pad = [(0, 0), (0, 0)]
        pad[eixo] = (r + 1, r)
        a = np.pad(arr, pad, mode='edge')
        c = np.cumsum(a, axis=eixo)
        if eixo == 0:
            return (c[2 * r + 1:, :] - c[:-2 * r - 1, :]) / (2 * r + 1)
        return (c[:, 2 * r + 1:] - c[:, :-2 * r - 1]) / (2 * r + 1)

    out = a
    for eixo, s in ((1, sx), (0, sy)):
        r = int(round((math.sqrt(4 * (s / DU) ** 2 + 1) - 1) / 2))  # 3 caixas de 2r+1 ≈ gaussiana σ
        for _ in range(3):
            out = caixa1d(out, r, eixo)
    return out


def reduzir(a, f=SS):
    h, w = a.shape[:2]
    return a.reshape(h // f, f, w // f, f, *a.shape[2:]).mean(axis=(1, 3))


# ───────────────────────────── silhueta ─────────────────────────────
# cabeça: abóbada larga (superelipse — nem caixa nem ovo) + mandíbula/barba (elipse) + orelhas
cabeca = (np.abs(X / 0.95) ** 2.6 + np.abs((Y + 0.22) / 0.90) ** 2.6) ** (1 / 2.6) - 1.0
cabeca = cabeca * 0.9                       # ~distância em unidades perto da borda
mandibula = sd_ellipse(X, Y - 0.40, 0.84, 1.02)
sil = smin(cabeca, mandibula, 0.25)
orelhas = sd_ellipse(np.abs(X) - 0.985, Y - 0.04, 0.15, 0.29)
sil = smin(sil, orelhas, 0.06)
dentro = -sil                                  # > 0 dentro

# ───────────────────────────── relevo ─────────────────────────────
h = np.zeros_like(X)
# casco: a máscara é uma concha curva (o rosto "abaulado" da folha de ouro)
h += 0.19 * np.sqrt(np.clip(1 - (X / 1.08) ** 2 - ((Y - 0.05) / 1.55) ** 2, 0, 1))
# testa: bossas frontais + glabela
h += espelho(lambda x, y: bump(0.30, -0.74, 0.26, 0.20, 0.028, px=x, py=y))
h += bump(0.0, -0.37, 0.09, 0.06, 0.022)
# órbitas: depressão larga sob a sobrancelha (faz a sobrancelha "projetar sombra")
h += espelho(lambda x, y: bump(0.40, -0.11, 0.24, 0.15, -0.065, px=x, py=y))
# pálpebras FECHADAS (o globo sob a pálpebra) + vinco de fechamento + dobra superior
h += espelho(lambda x, y: bump(0.40, -0.115, 0.155, 0.066, 0.075, px=x, py=y))
vinco_olho = espelho(lambda x, y: crista([(0.20, -0.112), (0.40, -0.094), (0.60, -0.114)], 0.016, 0.016, -0.030, -0.030, x, y)[0])
dobra = espelho(lambda x, y: crista([(0.22, -0.155), (0.40, -0.188), (0.59, -0.152)], 0.014, 0.014, -0.014, -0.014, x, y)[0])
h += vinco_olho + dobra
# sobrancelhas: arcos em relevo, mais grossos junto ao nariz
sobr_pts = [(0.06, -0.285), (0.24, -0.372), (0.44, -0.402), (0.62, -0.372), (0.76, -0.300)]
h += espelho(lambda x, y: crista(sobr_pts, 0.060, 0.034, 0.062, 0.040, x, y)[0])
# nariz: crista longa e estreita, cresce até a ponta; asas e narinas
h += crista([(0.0, -0.30), (0.0, -0.05), (0.0, 0.20), (0.0, 0.33)], 0.048, 0.090, 0.040, 0.245)[0]
h += bump(0.0, 0.335, 0.075, 0.058, 0.040)
h += espelho(lambda x, y: bump(0.092, 0.372, 0.046, 0.040, 0.050, px=x, py=y))
h += espelho(lambda x, y: bump(0.052, 0.418, 0.026, 0.016, -0.050, px=x, py=y))
# maçãs e bochechas
h += espelho(lambda x, y: bump(0.50, 0.10, 0.21, 0.15, 0.060, px=x, py=y))
h += espelho(lambda x, y: bump(0.38, 0.37, 0.23, 0.20, 0.035, px=x, py=y))
# sulcos nasolabiais
h += espelho(lambda x, y: crista([(0.13, 0.37), (0.20, 0.47), (0.27, 0.58)], 0.020, 0.024, -0.016, -0.012, x, y)[0])
# boca: lábios finos e fechados (a boca da máscara micênica é uma linha severa)
h += crista([(-0.25, 0.622), (0.0, 0.604), (0.25, 0.622)], 0.022, 0.022, 0.030, 0.030)[0]
h += crista([(-0.20, 0.682), (0.0, 0.696), (0.20, 0.682)], 0.026, 0.026, 0.034, 0.034)[0]
h += crista([(-0.27, 0.643), (0.0, 0.641), (0.27, 0.643)], 0.022, 0.022, -0.050, -0.050)[0]
# queixo sob a barba
h += bump(0.0, 0.93, 0.30, 0.22, 0.050)
# orelhas: hélice em anel + concha funda
dx_or = np.abs(X) - 0.985
anel = sd_ellipse(dx_or, Y - 0.04, 0.105, 0.225)
h += 0.040 * np.exp(-0.5 * (anel / 0.024) ** 2) * (np.abs(X) > 0.85)
h += espelho(lambda x, y: bump(0.985, 0.05, 0.050, 0.12, -0.030, px=x, py=y))
# terceiro olho: pálpebra vertical fechada + vinco + selo (anel) em volta
h += bump(0.0, -0.665, 0.050, 0.105, 0.046)
h += crista([(0.0, -0.775), (0.0, -0.665), (0.0, -0.555)], 0.012, 0.012, -0.024, -0.024)[0]
anel3 = sd_ellipse(X, Y + 0.665, 0.135, 0.205)
h += 0.016 * np.exp(-0.5 * (anel3 / 0.016) ** 2)

# bigode: dois traços que saem do centro e se enrolam para cima nas pontas
bigode_pts = [(0.02, 0.548), (0.15, 0.556), (0.28, 0.566), (0.37, 0.532), (0.41, 0.468)]
hb_d, hb_t = [], []
big_h = np.zeros_like(X)
big_mask = np.zeros_like(X)
big_tx = np.zeros_like(X)
big_ty = np.zeros_like(X)
for sx in (1.0, -1.0):
    val, d, t, tx, ty = crista(bigode_pts, 0.046, 0.030, 0.052, 0.036, X * sx, Y)
    big_h += val
    m = d < (0.046 + (0.030 - 0.046) * t) * 1.5
    big_mask = np.maximum(big_mask, m.astype(float))
    big_tx = np.where(m, tx * sx, big_tx)
    big_ty = np.where(m, ty, big_ty)
h += big_h

# barba: faixa junto ao contorno da mandíbula + queixo, fios em leque a partir da boca
perto_borda = smoothstep(0.34, 0.24, dentro)
barba = np.maximum(perto_borda * smoothstep(0.22, 0.42, Y), smoothstep(0.71, 0.79, Y))
barba *= (dentro > 0.035)
barba *= 1.0 - np.clip(big_mask, 0, 1)
fio_ang = np.arctan2(Y - 0.10, X)                  # fios radiais (descem e abrem)
estrias = 0.006 * np.sin(fio_ang * 70.0)          # estrias finas no relevo
h += barba * (0.024 + estrias)

# sobrancelhas: máscara + direção dos traços (inclinados, "espinha de peixe" do original)
sob_mask = np.zeros_like(X)
sob_ang = np.zeros_like(X)
for sx in (1.0, -1.0):
    _, d, t, tx, ty = crista(sobr_pts, 0.060, 0.034, 0.062, 0.040, X * sx, Y)
    m = d < (0.060 + (0.034 - 0.060) * t) * 1.30
    a = np.arctan2(ty, tx * sx) + sx * 0.95          # traço inclinado em relação ao arco
    sob_mask = np.maximum(sob_mask, m.astype(float))
    sob_ang = np.where(m, a, sob_ang)

# borda: o relevo morre na aba plana; um lábio fino levantado no contorno
borda = smoothstep(0.0, 0.13, dentro)
aba = 0.012 * np.exp(-0.5 * ((dentro - 0.030) / 0.014) ** 2)
h = h * borda + aba
h = np.where(dentro > -0.004, h, 0.0)
h = np.clip(h, 0.0, HMAX)

# ───────────────────────────── derivados ─────────────────────────────
gy, gx = np.gradient(h, DU)          # derivadas em unidades
nz = 1.0 / np.sqrt(1.0 + gx * gx + gy * gy)
nx, ny = -gx * nz, -gy * nz

# cavidade: altura menos a média local → negativo nos vincos (boca, pálpebra, narina)
cav = (h - borrar(h, 0.030, 0.030)) + 0.8 * (h - borrar(h, 0.085, 0.085))
cav = borrar(cav, 0.008, 0.018)      # alarga vincos na vertical: a célula tem 14 px de altura

# classes de traço (0 nada · 1 ─ · 2 ╲ · 3 │ · 4 ╱) — mesma regra da hachura() do shader
def classe(ang):
    a = np.mod(ang + math.pi / 8, math.pi)
    k = np.floor(a / (math.pi / 4)).astype(int)
    return np.array([1, 2, 3, 4])[np.clip(k, 0, 3)]

cls = np.zeros(X.shape, dtype=int)
cls = np.where(barba > 0.5, classe(fio_ang), cls)
cls = np.where(big_mask > 0.5, classe(np.arctan2(big_ty, big_tx)), cls)
cls = np.where(sob_mask > 0.5, classe(sob_ang), cls)
cls = np.where(dentro > 0.03, cls, 0)

# ───────────────────────────── redução e gravação ─────────────────────────────
nxr, nyr, nzr = reduzir(nx), reduzir(ny), reduzir(nz)
nn = np.sqrt(nxr ** 2 + nyr ** 2 + nzr ** 2) + 1e-9
nxr, nyr = nxr / nn, nyr / nn
hr = reduzir(h)
sdf = reduzir(np.clip(sil, -0.25, 0.25))
cavr = reduzir(cav)
# classe: amostra central (sem média — é rótulo)
clsr = cls[SS // 2::SS, SS // 2::SS]


def u8(a):
    return np.clip(np.round(a * 255.0), 0, 255).astype(np.uint8)


tex_n = np.dstack([u8(nxr * 0.5 + 0.5), u8(nyr * 0.5 + 0.5), u8(hr / HMAX)])
tex_m = np.dstack([u8(0.5 + sdf * 2.0), (clsr * 40).astype(np.uint8), u8(0.5 + cavr * 9.0)])

saida = '.'
previa = None
args = sys.argv[1:]
i = 0
while i < len(args):
    if args[i] == '--previa':
        previa = args[i + 1]
        i += 2
        continue
    saida = args[i]
    i += 1

os.makedirs(saida, exist_ok=True)
Image.fromarray(tex_n, 'RGB').save(os.path.join(saida, 'mascara-n.png'), optimize=True)
Image.fromarray(tex_m, 'RGB').save(os.path.join(saida, 'mascara-m.png'), optimize=True)
for nome in ('mascara-n.png', 'mascara-m.png'):
    print(nome, os.path.getsize(os.path.join(saida, nome)), 'bytes')

if previa:
    # prévia: luz rasante de cima + contraluz, para julgar a escultura sem abrir o navegador
    os.makedirs(previa, exist_ok=True)
    L = np.array([0.25, -0.75, 0.62])
    L = L / np.linalg.norm(L)
    lam = np.clip(nx * L[0] + ny * L[1] + nz * L[2], 0, 1)
    img = (lam * 0.85 + (cav * 6.0)) * (dentro > 0)
    img = np.clip(img, 0, 1)
    rgb = np.dstack([img, img * 0.35, img * 0.3])
    rgb[cls > 0] = rgb[cls > 0] * 0.6 + np.array([0.0, 0.0, 0.35])
    Image.fromarray(u8(rgb), 'RGB').resize((W // 2, H // 2), Image.LANCZOS).save(os.path.join(previa, 'previa-relevo.png'))
    Image.fromarray(u8(np.dstack([hr / HMAX] * 3)), 'RGB').resize((TW * 2, TH * 2), Image.NEAREST).save(os.path.join(previa, 'previa-altura.png'))
    print('prévia em', previa)
