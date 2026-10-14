# -*- coding: utf-8 -*-
"""
gerar_andarilho.py — pinta OFFLINE o rosto do Andarilho do Ermo (a figura parada sob os
meteoros, na descida do site) e grava a textura RGBA que o abismo.js usa como PINTURA
por baixo do grão da gravura. Não é relevo (como gerar_rosto.py): é uma pintura a carvão
e cera, lisa, que o shader só tinge, granula e acende.

Referência (o que tem que parecer): abismo-build/refs/14-andarilho-rosto-ref.png e o zoom
14b. Um rosto pálido, liso e achatado que EMERGE do escuro: oval de cera; cabelo preto em
massa esfumada de carvão, com franja pesada em dentes irregulares que cobre a testa e só
deixa o terço de baixo aparecer; olhos = duas CAVIDADES de sombra sob a franja (sem globo,
sem íris, sem cílio); nariz = um vinco fino, quase nada; boca = traço mínimo, fechado,
curvado para baixo; o queixo some na sombra do pescoço. Expressão morta. Luz suave de
cima/frente, levemente da direita do observador, sem nenhum brilho.

Saída (raiz do site — img-src 'self'): andarilho.png, RGBA 8 bits, 512 × 614 px.
Referencial (unidades da criatura, y PARA BAIXO): x ∈ [-1, 1], y ∈ [-1,1, 1,3]
(256 px/unidade). Geometria do contrato (o abismo.js põe a brasa e as lágrimas aqui):
  cabeça (cabelo inteiro) = elipse centro (0, -0,08), raios (0,50, 0,62);
  pele visível dentro de x ∈ [-0,34, 0,34], y ∈ [-0,45, 0,45] (a franja cobre o alto);
  cavidades dos olhos em (±0,13, +0,02) ≈ 0,10 × 0,06; boca em (0, +0,29); queixo y ≈ +0,45.
Canais (0..255):
  R = luminância da pintura (0 = carvão, ~0,8 = pele de cera; nunca 1,0 chapado)
  G = material: 0 fora · 90 cabelo e sombra do pescoço · 180 pele · 255 feição escura
      (cavidades, boca, sombra do nariz) — máscaras suaves
  B = brasa das órbitas: dois blobs gaussianos (raio ~0,07) centrados nas cavidades
  A = cobertura: 255 dentro da figura; esfuma na borda do cabelo (0,05–0,10, irregular
      como carvão) e cai suave a 0 no pescoço em y ≈ +1,2 (o motor desenha a capa)

Uso:  python -X utf8 gerar_andarilho.py [pasta_de_saida] [--previa pasta]
      --previa grava andarilho-previa.png = [zoom da referência | pintura em sépia, mesmo
      enquadramento | figura inteira] e andarilho-canais.png (R, G, B, A lado a lado).
Depende só de numpy + Pillow. Determinístico (sementes fixas).
"""
import os
import sys
import numpy as np
from PIL import Image

X0, X1, Y0, Y1 = -1.0, 1.0, -1.1, 1.3
TW, TH = 512, 614
SS = 2
W, H = TW * SS, TH * SS

xs = X0 + (np.arange(W) + 0.5) / W * (X1 - X0)
ys = Y0 + (np.arange(H) + 0.5) / H * (Y1 - Y0)
X, Y = np.meshgrid(xs, ys)


# ── ferramentas ──────────────────────────────────────────────────────────────────────
def smooth(e0, e1, v):
    """smoothstep; aceita e0 > e1 (inverte)"""
    t = np.clip((v - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def lerp(a, b, t):
    return a * (1 - t) + b * t


def ruido(nx, ny, semente):
    """ruído de valor suave: grade aleatória nx×ny ampliada (bicúbico) para a tela inteira"""
    r = np.random.default_rng(semente).random((ny, nx)).astype(np.float32)
    return np.asarray(Image.fromarray(r, 'F').resize((W, H), Image.BICUBIC), dtype=np.float64)


def fbm(celulas, semente, oitavas=3, ganho=0.5):
    """soma de oitavas de ruído suave, ≈ [-0,5, 0,5]; `celulas` = células na 1ª oitava ao longo da largura"""
    tot = np.zeros((H, W))
    amp, soma = 1.0, 0.0
    for i in range(oitavas):
        nx = int(celulas * 2 ** i) + 1
        ny = int(nx * H / W) + 1
        tot += amp * (ruido(nx, ny, semente * 100 + i) - 0.5)
        soma += amp
        amp *= ganho
    return tot / soma


def g(cx, cy, sx, sy, a=1.0):
    """mancha gaussiana elíptica"""
    return a * np.exp(-((X - cx) ** 2) / (2 * sx * sx) - ((Y - cy) ** 2) / (2 * sy * sy))


def traco(pts, larg, a=1.0):
    """traço borrado ao longo de uma polilinha (distância ao segmento mais próximo)"""
    d = np.full(X.shape, 9.0)
    for (x0, y0), (x1, y1) in zip(pts[:-1], pts[1:]):
        bx, by = x1 - x0, y1 - y0
        t = np.clip(((X - x0) * bx + (Y - y0) * by) / (bx * bx + by * by), 0, 1)
        d = np.minimum(d, np.hypot(X - x0 - bx * t, Y - y0 - by * t))
    return a * np.exp(-(d * d) / (2 * larg * larg))


def suave(a, r):
    """borrão separável barato (média móvel repetida ≈ gaussiano), r em texels supersampled"""
    k = 2 * r + 1
    for _ in range(3):
        a = np.cumsum(np.pad(a, ((0, 0), (r + 1, r)), mode='edge'), axis=1)
        a = (a[:, k:] - a[:, :-k]) / k
        a = np.cumsum(np.pad(a, ((r + 1, r), (0, 0)), mode='edge'), axis=0)
        a = (a[k:, :] - a[:-k, :]) / k
    return a


def ruido1d(v, m, semente, periodo=2 * np.pi):
    """ruído periódico 1D (interpolação linear entre m valores), para as mechas angulares"""
    vals = np.random.default_rng(semente).random(m + 1)
    vals[-1] = vals[0]
    return np.interp((v % periodo) / periodo * m, np.arange(m + 1), vals)


# ── 1. cabelo: massa de carvão na elipse da cabeça, cortinas mais retas embaixo ──────
HCX, HCY, HRX, HRY = 0.0, -0.08, 0.50, 0.62
n_exp = np.where(Y < HCY, 2.0, 2.7)                      # superelipse embaixo = cortinas
r_cab = ((np.abs(X - HCX) / HRX) ** n_exp + (np.abs(Y - HCY) / HRY) ** n_exp) ** (1.0 / n_exp)
d_cab = (r_cab - 1.0) * 0.56                              # ≈ distância à borda (negativa dentro)
d_cab = d_cab + 0.05 * fbm(3, 1, 3) + 0.03 * fbm(9, 2, 2) + 0.012 * fbm(28, 6, 2)   # borda de carvão
cab = 1.0 - smooth(-0.065, 0.035, d_cab)                  # cobertura: transição ~0,10 unidades

# luminância do cabelo: quase preto, mechas angulares em baixa frequência, clareia na borda
phi = np.arctan2(X, Y + 0.50)                             # ângulo em torno do alto da cabeça
rad = np.hypot(X, Y + 0.50)
mechas = (ruido1d(phi, 56, 21) - 0.5) + 0.5 * (ruido1d(phi + 0.35 * rad, 130, 22) - 0.5)
mechas = suave(mechas * smooth(0.08, 0.30, rad), 3)
cabelo = 0.035 + 0.07 * mechas + 0.035 * fbm(5, 4, 2) + 0.03 * fbm(12, 9, 2) + 0.10 * smooth(-0.26, 0.03, d_cab)
cabelo = np.clip(cabelo, 0.015, 0.30)

# ── 2. pescoço / ombros: sombra da capa (estreita; a capa de verdade é do motor) ─────
wn = np.interp(Y, [0.30, 0.55, 0.75, 0.95, 1.30], [0.20, 0.23, 0.40, 0.58, 0.66])
pesc = smooth(0.07, -0.07, np.abs(X) - wn + 0.03 * fbm(6, 8, 2)) * smooth(0.25, 0.45, Y)
pesc = pesc * (1.0 - smooth(0.80, 1.20, Y))               # alfa cai suave até 0 em y ≈ 1,2
pescoco_lum = 0.04 + 0.05 * np.exp(-(X / 0.11) ** 2) * smooth(0.75, 0.45, Y) + 0.02 * fbm(4, 5, 2)

# ── 3. pele: oval de cera, estreito e comprido, queixo pontudo, afundando nas bordas ─
ky = [-0.50, -0.44, -0.34, -0.20, -0.05, 0.08, 0.18, 0.28, 0.36, 0.42, 0.47, 0.50]
kw = [0.00, 0.12, 0.20, 0.235, 0.245, 0.245, 0.23, 0.19, 0.14, 0.09, 0.04, 0.00]
wr = np.interp(Y, ky, kw)
dr = np.abs(X) - wr                                       # < 0 dentro do oval
rosto = smooth(0.012, -0.018, dr) * smooth(0.005, 0.03, wr)   # zera onde o oval fecha (sem fio no eixo)

u = np.abs(X) / np.maximum(wr, 1e-3)
pele = 0.78 - 0.26 * u ** 2.5                             # mais clara no centro, afunda nos lados
pele = pele - 0.05 * smooth(-0.10, 0.45, Y)               # queixo um pouco mais escuro que a testa
pele = pele * (1.0 - 0.45 * smooth(0.10, -0.22, X))       # lado esquerdo (do observador) na sombra
pele = pele * (1.0 - 0.45 * g(-0.17, 0.11, 0.10, 0.19))   # bochecha esquerda funda
pele = pele + 0.03 * g(0.12, 0.12, 0.12, 0.20)            # maçã direita recebe a luz
pele = pele * (1.0 - 0.85 * smooth(0.34, 0.56, Y))        # a pele afunda no escuro do pescoço
pele = pele * (1.0 - 0.55 * smooth(0.07, 0.0, -dr))       # sombra do cabelo roendo a borda
pele = pele + 0.025 * fbm(6, 3, 2)                        # manchado leve de cera

# feições escuras (tudo borrão; nada desenhado)
cav = g(-0.14, 0.02, 0.07, 0.024, 1.0) + 0.55 * g(-0.14, 0.03, 0.10, 0.05)
cav = cav + g(0.13, 0.02, 0.062, 0.022, 0.9) + 0.45 * g(0.13, 0.03, 0.09, 0.045)
cav = np.clip(cav * (0.85 + 0.3 * fbm(14, 7, 2)), 0, 1)   # quebra o oval perfeito
# a sombra da franja desce e engole as órbitas: faixa das sobrancelhas + fios de sombra subindo
faixa = 0.5 * g(0.0, -0.03, 0.21, 0.032)
faixa = faixa + 0.45 * traco([(-0.13, 0.02), (-0.125, -0.09)], 0.025) + 0.35 * traco([(0.13, 0.02), (0.135, -0.09)], 0.022)
nar = traco([(-0.010, 0.07), (-0.024, 0.20)], 0.005, 0.2) + g(-0.014, 0.212, 0.016, 0.007, 0.32)
boca = traco([(-0.055, 0.301), (-0.03, 0.292), (0.0, 0.289), (0.025, 0.289), (0.048, 0.291)], 0.009, 0.6)
boca = boca + g(-0.035, 0.306, 0.02, 0.009, 0.25)         # o canto esquerdo pesa mais (sombra)
sob_labio = g(0.0, 0.332, 0.045, 0.012, 0.15)
pele = pele * (1 - 0.93 * cav) * (1 - np.clip(faixa, 0, 0.8)) * (1 - nar) * (1 - boca) * (1 - sob_labio)
pele = pele + 0.03 * g(0.0, 0.311, 0.035, 0.008)          # lábio de baixo, só um fio mais claro
feicao = smooth(0.12, 0.6, np.clip(cav + nar + boca, 0, 1))

# ── 4. franja: massa cheia até a linha-base, dentes irregulares descendo sobre as órbitas
rng = np.random.default_rng(14)
kx = np.linspace(-0.5, 0.5, 9)
kb = -0.16 + rng.uniform(-0.03, 0.03, 9)
ybase = np.interp(X, kx, kb)
massa = smooth(0.012, -0.012, Y - ybase)
nd = 26
xd = np.sort(rng.uniform(-0.27, 0.27, nd))
pd = rng.uniform(0.06, 0.17, nd)                          # quanto cada dente desce da base (pontas entre -0,10 e 0,0)
ld = rng.uniform(0.012, 0.030, nd)                        # meia-largura na raiz
sd = rng.uniform(-0.05, 0.05, nd)                         # inclinação (desvio em x na ponta)
dentes = np.zeros_like(X)
for i in range(nd):
    yb = float(np.interp(xd[i], kx, kb))
    x0, y0, x1, y1 = xd[i], yb - 0.06, xd[i] + sd[i], yb + pd[i]
    bx, by = x1 - x0, y1 - y0
    t = np.clip(((X - x0) * bx + (Y - y0) * by) / (bx * bx + by * by), 0, 1)
    dist = np.hypot(X - x0 - bx * t, Y - y0 - by * t)
    wt = ld[i] * (1 - t) ** 0.75 + 0.003
    dentes = np.maximum(dentes, smooth(wt + 0.006, wt - 0.006, dist) * (1.0 - 0.5 * t))
franja = np.clip(suave(np.maximum(massa, dentes), 3), 0, 1)   # pontas esfumadas; assada na camada do rosto
sombra_fr = suave(franja, 8)                              # a sombra da franja desce pela testa
pele = pele * (1 - 0.22 * sombra_fr * (1 - franja))

# ── 5. composição em camadas ────────────────────────────────────────────────────────
lum = np.zeros_like(X)
lum = lerp(lum, pescoco_lum, pesc)
cab_lum = cabelo * (1 - 0.40 * suave(rosto, 24))          # cabelo mais fundo junto ao rosto
lum = lerp(lum, cab_lum, cab)
lum = lerp(lum, lerp(pele, cab_lum, franja), rosto)      # franja = o mesmo carvão, dentro do rosto
lum = np.clip(lum, 0, 0.86)

mat = np.zeros_like(X)
mat = lerp(mat, 90.0, pesc)
mat = lerp(mat, 90.0, cab)
mat_pele = lerp(90.0, 180.0, smooth(0.08, 0.25, pele))    # pele em sombra funda vira massa escura
mat_face = lerp(lerp(mat_pele, 255.0, feicao), 90.0, franja)
mat = lerp(mat, mat_face, rosto)

brasa = np.exp(-((X + 0.13) ** 2 + (Y - 0.02) ** 2) / (2 * 0.04 ** 2)) + np.exp(-((X - 0.13) ** 2 + (Y - 0.02) ** 2) / (2 * 0.04 ** 2))
alfa = np.clip(np.maximum(cab, pesc), 0, 1)


def reduz(a):
    return a.reshape(TH, SS, TW, SS).mean(axis=(1, 3))


R = reduz(lum)
G = reduz(mat) / 255.0
B = reduz(np.clip(brasa, 0, 1))
A = reduz(alfa)
dentro = A > 0.002
R = np.where(dentro, R, 0.0)
G = np.where(dentro, G, 0.0)
B = np.where(dentro, B, 0.0)
rgba = np.dstack([R, G, B, A])
img = Image.fromarray((np.clip(rgba, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGBA')

saida = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('--') else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
destino = os.path.join(saida, 'andarilho.png')
img.save(destino, optimize=True)
print('ok', TW, 'x', TH, os.path.getsize(destino), 'bytes')

if '--previa' in sys.argv:
    pv = sys.argv[sys.argv.index('--previa') + 1]
    tinta = np.array([0.72, 0.52, 0.34])
    fundo = np.array([0.30, 0.19, 0.12])
    rgb = R[..., None] * tinta * A[..., None] + fundo * (1 - A[..., None])
    sep = Image.fromarray((np.clip(rgb, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGB')
    zoom_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'abismo-build', 'refs', '14b-andarilho-rosto-zoom.png')
    zoom = Image.open(zoom_path).convert('RGB') if os.path.exists(zoom_path) else Image.new('RGB', (680, 760), (0, 0, 0))
    zw, zh = zoom.size
    # mesmo enquadramento do zoom (medido na referência: x ∈ [-0,67, 0,67], y ∈ [-0,79, 0,70])
    cx0, cx1 = int((-0.67 - X0) / (X1 - X0) * TW), int((0.67 - X0) / (X1 - X0) * TW)
    cy0, cy1 = int((-0.79 - Y0) / (Y1 - Y0) * TH), int((0.70 - Y0) / (Y1 - Y0) * TH)
    rec = sep.crop((cx0, cy0, cx1, cy1))
    rec = rec.resize((round(rec.width * zh / rec.height), zh), Image.BICUBIC)
    full = sep.resize((round(TW * zh / TH), zh), Image.BICUBIC)
    out = Image.new('RGB', (zw + rec.width + full.width + 24, zh), (12, 8, 6))
    out.paste(zoom, (0, 0))
    out.paste(rec, (zw + 12, 0))
    out.paste(full, (zw + rec.width + 24, 0))
    out.save(os.path.join(pv, 'andarilho-previa.png'))
    canais = Image.new('L', (TW * 4 + 30, TH), 40)
    for i, c in enumerate((R, G, B, A)):
        canais.paste(Image.fromarray((np.clip(c, 0, 1) * 255 + 0.5).astype(np.uint8), 'L'), (i * (TW + 10), 0))
    canais.save(os.path.join(pv, 'andarilho-canais.png'))
    print('previa', os.path.join(pv, 'andarilho-previa.png'))
