/* =========================================================
   tiles_hd.js — CENÁRIO EM ALTA (Etapa 2 da atualização pré-1.0)
   Cada tile vira 32x32 pixels de arte, pintados PIXEL A PIXEL
   num buffer (rápido): grão de terra, rachadura, cascalho,
   capim seco em tufos, pedra com volume (luz calculada por
   pixel, vindo de cima/esquerda), água com margem e espuma,
   telhado de telha, parede de taipa com reboco caído...
   E também as coisas altas (copa do juazeiro, mandacaru,
   beiral) com volume de verdade.
   Se o navegador não tiver ImageData (validador), o jogo usa
   o desenho antigo — nada quebra.
   Tiles raros sem versão nova são desenhados no tamanho antigo
   e ampliados (continuam funcionando).
   ========================================================= */
(function () {
  'use strict';
  var C = BSI.cor, H = BSI.util.hash, T = BSI.cfg.TILE, A = 32; // A = lado do tile em pixels de arte
  var defs = BSI.tiles.defs;

  // ---------------- cores ----------------
  var cacheRgb = {};
  function rgb(h) {
    if (Array.isArray(h)) return h;
    if (cacheRgb[h]) return cacheRgb[h];
    var s = h.replace('#', ''), n = parseInt(s, 16);
    return (cacheRgb[h] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]);
  }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function luz(c, f) { return f >= 0 ? mix(c, [255, 244, 210], f) : mix(c, [20, 10, 34], -f); }

  // ---------------- buffer de um tile ----------------
  function Buf() { this.d = new Uint8ClampedArray(A * A * 4); }
  Buf.prototype.set = function (x, y, c) { if (x < 0 || y < 0 || x >= A || y >= A) return; var i = (y * A + x) * 4, d = this.d; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; };
  Buf.prototype.blend = function (x, y, c, a) { if (x < 0 || y < 0 || x >= A || y >= A || a <= 0) return; var i = (y * A + x) * 4, d = this.d; d[i] += (c[0] - d[i]) * a; d[i + 1] += (c[1] - d[i + 1]) * a; d[i + 2] += (c[2] - d[i + 2]) * a; d[i + 3] = 255; };
  Buf.prototype.get = function (x, y) { var i = (y * A + x) * 4; return [this.d[i], this.d[i + 1], this.d[i + 2]]; };
  Buf.prototype.rect = function (x, y, w, h, c) { c = rgb(c); for (var yy = y; yy < y + h; yy++) for (var xx = x; xx < x + w; xx++) this.set(xx, yy, c); };
  Buf.prototype.rectA = function (x, y, w, h, c, a) { c = rgb(c); for (var yy = y; yy < y + h; yy++) for (var xx = x; xx < x + w; xx++) this.blend(xx, yy, c, a); };
  Buf.prototype.linha = function (x0, y0, x1, y1, c) { c = rgb(c); var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx - dy, k = 0; while (k++ < 80) { this.set(x0, y0, c); if (x0 === x1 && y0 === y1) break; var e2 = 2 * e; if (e2 > -dy) { e -= dy; x0 += sx; } if (e2 < dx) { e += dx; y0 += sy; } } };

  // ruído suave (manchas grandes, contínuo entre tiles)
  function vnoise(px, py, cel, s) {
    var x0 = Math.floor(px / cel), y0 = Math.floor(py / cel), fx = px / cel - x0, fy = py / cel - y0;
    fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
    var a = H(x0, y0, s), b = H(x0 + 1, y0, s), c = H(x0, y0 + 1, s), d = H(x0 + 1, y0 + 1, s);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  }

  // ---------------- chãos ----------------
  var TERRA = [rgb('#8f6238'), rgb(C.terraEsc), rgb(C.terra), rgb(C.terraClara), rgb('#e0b07a')];
  function chaoGenerico(b, X, Y, pal, grao) {
    for (var y = 0; y < A; y++) for (var x = 0; x < A; x++) {
      var px = X + x, py = Y + y;
      var v = vnoise(px, py, 22, 7) * 0.6 + vnoise(px, py, 7, 8) * 0.4; // manchas
      var idx = v < 0.3 ? 1 : (v < 0.62 ? 2 : 3);
      var c = pal[idx];
      var gr = H(px, py, 3);
      if (gr < grao) c = pal[idx - 1]; else if (gr > 1 - grao * 0.7) c = pal[Math.min(pal.length - 1, idx + 1)];
      b.set(x, y, mix(pal[idx], c, 0.85));
    }
  }
  function pedrinhas(b, X, Y, tx, ty, qtd, pal) {
    for (var i = 0; i < qtd; i++) {
      var x = Math.floor(H(tx, ty, 40 + i) * 29), y = Math.floor(H(tx, ty, 60 + i) * 29), w = 1 + Math.floor(H(tx, ty, 80 + i) * 3);
      b.rect(x, y + 1, w + 1, 1, pal[0]); b.rect(x, y, w, 1, pal[1]); b.set(x, y, pal[2]);
    }
  }
  function rachadura(b, tx, ty, cor) {
    var x = 4 + Math.floor(H(tx, ty, 14) * 24), y = 4 + Math.floor(H(tx, ty, 15) * 24), esc = rgb(cor), cl = rgb(C.terraClara);
    for (var k = 0; k < 14; k++) {
      b.set(x, y, esc); b.set(x, y + 1, cl);
      x += Math.round(H(tx * 7 + k, ty, 16) * 2 - 1); y += H(tx, ty * 5 + k, 17) > 0.5 ? 1 : 0; x += 1;
      if (H(tx, ty, 18 + k) > 0.85) { b.set(x, y - 1, esc); b.set(x + 1, y - 2, esc); }
    }
  }
  function terra(b, X, Y, tx, ty) {
    chaoGenerico(b, X, Y, TERRA, 0.07);
    pedrinhas(b, X, Y, tx, ty, H(tx, ty, 9) > 0.6 ? 2 : 0, [rgb('#6a4a30'), rgb('#a89480'), rgb('#d8cab0')]);
    if (H(tx, ty, 13) > 0.84) rachadura(b, tx, ty, '#6a4428');
  }
  var PICARRA = [rgb('#a87a48'), rgb(C.picarraEsc), rgb(C.picarra), rgb(C.picarraClara), rgb('#f2d29a')];
  function picarra(b, X, Y, tx, ty) {
    chaoGenerico(b, X, Y, PICARRA, 0.12);
    // cascalho miúdo
    for (var i = 0; i < 26; i++) {
      var x = Math.floor(H(tx, ty, 200 + i) * 31), y = Math.floor(H(tx, ty, 300 + i) * 31), t = H(tx, ty, 400 + i);
      b.set(x, y + 1, [140, 100, 64]); b.set(x, y, t > 0.5 ? [236, 206, 160] : [180, 150, 120]); if (t > 0.8) b.set(x + 1, y, [210, 190, 170]);
    }
    // marca de roda/pegada
    if (H(tx, ty, 21) > 0.7) for (var k = 0; k < 32; k += 3) b.blend(k, 10 + Math.round(Math.sin((tx * 32 + k) / 9) * 2), [120, 86, 52], 0.35);
  }
  function mato(b, X, Y, tx, ty) {
    terra(b, X, Y, tx, ty);
    var esc = rgb(C.matoSecoEsc), med = rgb(C.matoSeco), cl = rgb(C.matoSecoClaro), ponta = rgb('#f0dc9a');
    for (var t = 0; t < 7; t++) {
      var x0 = 2 + Math.floor(H(tx, ty, 500 + t) * 27), y0 = 8 + Math.floor(H(tx, ty, 520 + t) * 22);
      b.rectA(x0 - 3, y0, 8, 2, [60, 36, 20], 0.35); // sombra do tufo
      for (var s = 0; s < 6; s++) {
        var alt = 4 + Math.floor(H(tx * 3 + s, ty + t, 540) * 6), inc = (H(tx + s, ty * 3 + t, 560) - 0.5) * 1.4;
        for (var k = 0; k < alt; k++) {
          var x = Math.round(x0 + (s - 2.5) * 0.9 + inc * k * 0.7), y = y0 - k;
          b.set(x, y, k < 2 ? esc : (k < alt - 2 ? (s % 2 ? med : cl) : ponta));
        }
      }
    }
  }
  function cinza(b, X, Y, tx, ty) {
    chaoGenerico(b, X, Y, [rgb('#221c1a'), rgb('#2e2622'), rgb(C.cinza), rgb(C.cinzaClara), rgb('#7a6e66')], 0.12);
    for (var i = 0; i < 5; i++) { var x = Math.floor(H(tx, ty, 600 + i) * 30), y = Math.floor(H(tx, ty, 610 + i) * 30); b.set(x, y, H(tx, ty, 620 + i) > 0.6 ? [230, 120, 50] : [150, 60, 30]); }
    for (var g = 0; g < 2; g++) { var gx = Math.floor(H(tx, ty, 630 + g) * 22), gy = Math.floor(H(tx, ty, 640 + g) * 28); b.rect(gx, gy, 8, 1, '#14100e'); b.set(gx + 2, gy - 1, rgb('#14100e')); }
  }
  function cimento(b, X, Y, tx, ty) { // piso vermelhão do alpendre, encerado
    for (var y = 0; y < A; y++) for (var x = 0; x < A; x++) {
      var v = vnoise(X + x, Y + y, 26, 91);
      var c = mix(rgb('#5a1810'), rgb('#7e2a1c'), v);
      if ((x + y + X + Y) % 61 < 3) c = luz(c, 0.12); // reflexo diagonal da cera
      b.set(x, y, c);
    }
    for (var k = 0; k < A; k++) { b.set(k, 31, [44, 14, 10]); b.set(31, k, [44, 14, 10]); b.set(k, 0, [140, 60, 44]); b.set(0, k, [120, 50, 36]); }
    if (H(tx, ty, 77) > 0.7) b.rectA(6 + Math.floor(H(tx, ty, 78) * 14), 20, 8, 5, '#3a1810', 0.25); // gasto
  }
  function assoalho(b, X, Y, tx, ty) { // chão de tábua
    for (var r = 0; r < 4; r++) {
      var base = mix(rgb('#8a6a48'), rgb(H(tx, ty * 4 + r, 700) > 0.5 ? '#9a7a52' : '#7a5a3a'), 0.6);
      var off = Math.floor(H(tx, ty * 4 + r, 701) * 32);
      for (var y = r * 8; y < r * 8 + 8; y++) for (var x = 0; x < A; x++) {
        var gr = Math.sin((X + x) * 0.35 + r * 3 + Math.sin((X + x) * 0.07) * 4) * 0.5 + 0.5;
        var c = luz(base, (gr - 0.5) * 0.12 + (y === r * 8 ? 0.1 : 0));
        if (y === r * 8 + 7) c = luz(base, -0.4);
        if ((x + off) % 32 === 0) c = luz(base, -0.45);
        b.set(x, y, c);
      }
      b.set((off + 4) % 32, r * 8 + 3, [60, 50, 50]); b.set((off + 27) % 32, r * 8 + 3, [60, 50, 50]); // pregos
    }
  }
  function pedra(b, X, Y, tx, ty) {
    // fundo de rocha escura + um matacão com volume (luz por pixel)
    var esc = rgb('#3e342e'), tons = [rgb('#4a3e36'), rgb(C.pedraEsc), rgb(C.pedra), rgb('#a49484'), rgb(C.pedraClara), rgb('#d0c2b0')];
    chaoGenerico(b, X, Y, [esc, rgb('#463a32'), rgb('#52463c'), rgb('#5c5046'), rgb('#6a5c50')], 0.1);
    var cx = 16 + (H(tx, ty, 50) - 0.5) * 6, cy = 15 + (H(tx, ty, 51) - 0.5) * 4, r0 = 13 + H(tx, ty, 52) * 3;
    for (var y = 0; y < A; y++) for (var x = 0; x < A; x++) {
      var dx = x - cx, dy = (y - cy) * 1.15, ang = Math.atan2(dy, dx);
      var rr = r0 * (0.86 + 0.14 * Math.sin(ang * 3 + tx) + 0.06 * Math.sin(ang * 7 + ty));
      var d = Math.sqrt(dx * dx + dy * dy) / rr;
      if (d > 1) { if (d < 1.15 && dy > 0) b.blend(x, y, [20, 12, 20], 0.45); continue; } // sombra no pé
      var nx = dx / rr, ny = dy / rr, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
      var l = Math.max(0, -0.55 * nx - 0.65 * ny + 0.55 * nz);
      l += (H(X + x, Y + y, 5) - 0.5) * 0.18;
      var i = Math.max(0, Math.min(5, Math.floor(l * 5.2)));
      b.set(x, y, tons[i]);
    }
    // rachadura e líquen
    var lx = Math.round(cx + 2), ly = Math.round(cy - 6);
    for (var k = 0; k < 8; k++) { b.set(lx, ly + k, [50, 40, 36]); lx += H(tx, ty + k, 53) > 0.6 ? 1 : 0; }
    for (var m = 0; m < 6; m++) b.set(Math.round(cx - 6 + H(tx, ty, 54 + m) * 8), Math.round(cy - 8 + H(tx, ty, 60 + m) * 6), H(tx, ty, 66 + m) > 0.5 ? [120, 140, 80] : [190, 180, 110]);
  }
  function aguaTile(b, X, Y, tx, ty, m) {
    var raso = rgb('#5f8a84'), med = rgb(C.agua), fundo = rgb('#2c4a52'), espuma = rgb('#d8e8e0');
    function borda(dx, dy) { var c = m && m.ch(tx + dx, ty + dy); return c && c !== '~'; }
    var bc = borda(0, -1), bb = borda(0, 1), be = borda(-1, 0), bd = borda(1, 0);
    for (var y = 0; y < A; y++) for (var x = 0; x < A; x++) {
      var dist = 99;
      if (bc) dist = Math.min(dist, y); if (bb) dist = Math.min(dist, 31 - y); if (be) dist = Math.min(dist, x); if (bd) dist = Math.min(dist, 31 - x);
      var prof = Math.min(1, dist / 14) * (0.7 + vnoise(X + x, Y + y, 18, 31) * 0.3);
      var c = mix(raso, fundo, prof);
      c = mix(c, med, 0.3);
      var onda = Math.sin((X + x) * 0.3 + Math.sin((Y + y) * 0.21) * 2 + (Y + y) * 0.05);
      if (onda > 0.93) c = luz(c, 0.25);
      if (dist <= 1) c = mix(rgb(C.terraEsc), raso, 0.4); else if (dist === 2 && H(X + x, Y + y, 9) > 0.4) c = espuma;
      b.set(x, y, c);
    }
  }
  function grota(b, X, Y, tx, ty, m) {
    for (var y = 0; y < A; y++) for (var x = 0; x < A; x++) b.set(x, y, mix([8, 6, 14], [26, 18, 30], vnoise(X + x, Y + y, 9, 41) * 0.8));
    for (var i = 0; i < 4; i++) b.rect(Math.floor(H(tx, ty, 90 + i) * 28), Math.floor(H(tx, ty, 95 + i) * 28), 3, 1, '#2a2030');
    if (m && m.ch(tx, ty - 1) !== 'v') { // paredão do barranco
      for (var yy = 0; yy < 10; yy++) for (var xx = 0; xx < A; xx++) {
        var estrato = Math.floor((yy + Math.sin((X + xx) * 0.2) * 1.5) / 3);
        b.set(xx, yy, luz(rgb(estrato % 2 ? C.pedraEsc : '#6a5446'), -yy * 0.06 + (H(X + xx, Y + yy, 3) - 0.5) * 0.15));
      }
      b.rect(0, 0, A, 1, C.pedraClara);
    }
  }
  function cerca(b, X, Y, tx, ty, m) {
    terra(b, X, Y, tx, ty);
    var mad = rgb(C.madeira), esc = rgb(C.madeiraEsc), cl = rgb(C.madeiraClara);
    b.rectA(0, 25, 32, 3, [40, 20, 20], 0.35);
    [[4, 0], [22, 1]].forEach(function (p) { // estacas tortas
      var x = p[0] + Math.round((H(tx, ty, 120 + p[1]) - 0.5) * 3);
      for (var y = 2; y < 28; y++) { b.set(x, y, cl); b.set(x + 1, y, mad); b.set(x + 2, y, mad); b.set(x + 3, y, esc); }
      b.rect(x, 1, 4, 1, esc); b.set(x + 1, 6, esc); b.set(x + 2, 15, esc);
    });
    [9, 19].forEach(function (y) { // varas atravessadas
      for (var x = 0; x < A; x++) { var dy = Math.round(Math.sin((X + x) * 0.12 + y) * 0.8); b.set(x, y + dy, cl); b.set(x, y + 1 + dy, mad); b.set(x, y + 2 + dy, esc); }
    });
  }
  function garrancho(b, X, Y, tx, ty) {
    terra(b, X, Y, tx, ty);
    b.rectA(2, 22, 28, 6, [40, 24, 16], 0.3);
    var cores = ['#3e2c20', '#5a4030', '#7a5a3a', '#8a7a6a'];
    for (var i = 0; i < 14; i++) {
      var x0 = Math.floor(H(tx, ty, 130 + i) * 32), y0 = 6 + Math.floor(H(tx, ty, 150 + i) * 24);
      var x1 = x0 + Math.round((H(tx, ty, 170 + i) - 0.5) * 22), y1 = y0 - 4 - Math.floor(H(tx, ty, 190 + i) * 10);
      b.linha(x0, y0, x1, y1, cores[i % 4]);
      if (i % 3 === 0) b.set(x1, y1 - 1, rgb('#c8b080'));
    }
  }
  function xique(b, X, Y, tx, ty) {
    terra(b, X, Y, tx, ty);
    var t = [rgb('#24401f'), rgb(C.verdeEsc), rgb(C.verde), rgb(C.verdeClaro), rgb('#9ac06a')];
    b.rectA(3, 25, 26, 4, [30, 20, 20], 0.35);
    var lobos = [[9, 26, 10], [16, 27, 15], [23, 26, 9], [13, 27, 7], [20, 27, 6]];
    lobos.forEach(function (l) {
      var cx = l[0], base = l[1], alt = l[2];
      for (var y = base - alt; y < base; y++) for (var x = cx - 3; x <= cx + 3; x++) {
        var nx = (x - cx) / 3.5, top = (y - (base - alt)) < 3 ? (3 - (y - (base - alt))) / 3 : 0;
        if (Math.abs(nx) + top * 0.9 > 1) continue;
        var l2 = 0.5 - nx * 0.45 + (y - base + alt < 3 ? 0.15 : 0);
        var c = t[Math.max(0, Math.min(4, Math.floor(l2 * 5)))];
        if ((x - cx) % 2 === 0 && Math.abs(x - cx) < 3) c = luz(c, -0.15); // gomos
        b.set(x, y, c);
      }
      for (var s = base - alt + 1; s < base; s += 3) { b.set(cx - 3, s, [240, 230, 200]); b.set(cx + 3, s + 1, [240, 230, 200]); }
    });
  }
  function baseArvore(b, X, Y, tx, ty) {
    terra(b, X, Y, tx, ty);
    for (var y = 12; y < 32; y++) for (var x = -4; x < 36; x++) { var dx = (x - 16) / 22, dy = (y - 22) / 10; var d = dx * dx + dy * dy; if (d < 1) b.blend(x, y, [24, 14, 28], 0.42 * (1 - d)); }
    var casca = [rgb('#3a2418'), rgb(C.madeiraEsc), rgb('#6a4026'), rgb(C.madeira)];
    for (var yy = 6; yy < 29; yy++) for (var xx = 12; xx < 21; xx++) {
      var w = yy > 24 ? 1 : 0; if ((xx === 12 || xx === 20) && !w) continue;
      var i = xx < 14 ? 3 : (xx < 17 ? 2 : (xx < 19 ? 1 : 0));
      if (H(xx, yy + ty * 31, 3) > 0.8) i = Math.max(0, i - 1);
      b.set(xx, yy, casca[i]);
    }
    b.rect(9, 27, 4, 2, casca[1]); b.rect(20, 27, 5, 2, casca[0]); // raízes
  }
  function baseMandacaru(b, X, Y, tx, ty) {
    terra(b, X, Y, tx, ty);
    for (var y = 20; y < 32; y++) for (var x = 2; x < 30; x++) { var dx = (x - 16) / 13, dy = (y - 26) / 5; var d = dx * dx + dy * dy; if (d < 1) b.blend(x, y, [24, 14, 28], 0.4 * (1 - d)); }
    b.rect(12, 14, 8, 14, C.verdeEsc); b.rect(13, 14, 2, 14, C.verde);
  }

  // ---------------- casas ----------------
  function telhado(b, X, Y, tx, ty, m, caiada) {
    var capa = rgb(caiada ? '#c0643a' : '#b8582e'), canal = rgb(caiada ? '#8a3a22' : '#7a3220'), cl = rgb('#e08a56'), som = rgb('#4a1a12');
    for (var y = 0; y < A; y++) {
      var fil = Math.floor((ty * A + y) / 8), yl = (ty * A + y) % 8;
      for (var x = 0; x < A; x++) {
        var off = (fil % 2) * 4, col = ((X + x + off) % 8);
        var c = col < 5 ? capa : canal;
        if (col === 0) c = cl; else if (col === 4) c = luz(capa, -0.2);
        if (yl === 7) c = som; else if (yl === 6) c = luz(c, -0.3); else if (yl === 0) c = luz(c, 0.12);
        c = luz(c, (vnoise(X + x, Y + y, 16, 77) - 0.5) * 0.25);
        b.set(x, y, c);
      }
    }
    if (H(tx, ty, 501) > 0.82) b.rectA(4 + Math.floor(H(tx, ty, 502) * 18), 4 + Math.floor(H(tx, ty, 503) * 18), 7, 4, '#6a7a3a', 0.45); // limo
    if (H(tx, ty, 504) > 0.94) b.rect(12, 10, 7, 6, '#6a6a6a'); // telha remendada (de amianto)
    var cima = m.ch(tx, ty - 1), e = m.ch(tx - 1, ty), d = m.ch(tx + 1, ty);
    if (cima !== '#' && cima !== 'i') { b.rectA(0, 0, A, 4, '#ffe0b0', 0.25); b.rect(0, 0, A, 1, '#e8a070'); }
    if (e !== '#' && e !== 'i') b.rectA(0, 0, 3, A, '#ffe0b0', 0.18);
    if (d !== '#' && d !== 'i') b.rectA(A - 4, 0, 4, A, '#200808', 0.35);
  }
  function taipa(b, X, Y, tx, ty, m) { // parede de taipa rebocada (fachada)
    var reb = [rgb('#8a5a38'), rgb(C.taipaEsc), rgb(C.taipa), rgb(C.taipaClara), rgb('#d8a878')];
    chaoGenerico(b, X, Y, reb, 0.08);
    // reboco caído mostrando as varas
    if (H(tx, ty, 410) > 0.6) {
      var rx = 4 + Math.floor(H(tx, ty, 411) * 14), ry = 4 + Math.floor(H(tx, ty, 412) * 10);
      b.rect(rx, ry, 10, 7, '#6a4028');
      for (var v = 0; v < 10; v += 3) b.rect(rx + v, ry, 1, 7, '#4a2a18');
      b.rect(rx, ry + 3, 10, 1, '#8a6040'); b.rect(rx, ry - 1, 10, 1, '#d8a878');
    }
    var baixo = m.ch(tx, ty + 1), bd = baixo && defs[baixo];
    if (bd && !bd.solido) {
      b.rect(0, 24, A, 8, '#5a3420'); b.rect(0, 24, A, 1, '#8a5432'); b.rectA(0, 28, A, 4, '#000000', 0.2); // rodapé encardido
      if (H(tx, ty, 401) > 0.72 && m.ch(tx - 1, ty) === '#' && m.ch(tx + 1, ty) === '#') {
        b.rect(7, 3, 18, 17, '#2a1a10');
        b.rect(8, 4, 7, 15, '#3b6a8c'); b.rect(17, 4, 7, 15, '#3b6a8c');
        b.rect(8, 4, 1, 15, '#6a9abc'); b.rect(17, 4, 1, 15, '#6a9abc');
        for (var k = 7; k < 19; k += 5) { b.rect(9, k, 5, 1, '#2a4a6a'); b.rect(18, k, 5, 1, '#2a4a6a'); }
        b.rect(5, 20, 22, 2, '#e8e0cc'); b.rect(5, 21, 22, 1, '#a89a80'); // peitoril
      }
    }
  }
  function caiada(b, X, Y, tx, ty, m) {
    var cal = [rgb('#b8ae98'), rgb('#d0c6b0'), rgb('#e8e0cc'), rgb('#f2ecdc'), rgb('#fffaf0')];
    chaoGenerico(b, X, Y, cal, 0.06);
    if (H(tx, ty, 104) > 0.8) b.rect(8, 10, 7, 5, '#b09a80');
    b.rect(0, 26, A, 6, '#4f7a9a'); b.rect(0, 26, A, 1, '#7aa0c0'); // barra azul
    b.rectA(0, 0, A, 32, '#4a3a2a', 0); // nada
  }
  function porta(b, X, Y, tx, ty) {
    b.rect(0, 0, A, A, '#2a1a10');
    var mad = rgb(C.madeira);
    for (var y = 2; y < 32; y++) for (var x = 4; x < 28; x++) {
      var c = luz(mad, Math.sin((x + y * 0.1) * 1.3) * 0.06 + (x < 6 ? 0.15 : 0) + (x > 25 ? -0.2 : 0));
      if (x === 15 || x === 16) c = luz(mad, -0.35);
      if (y === 12 || y === 22) c = luz(mad, -0.3);
      b.set(x, y, c);
    }
    b.rect(20, 17, 2, 2, C.amarelo); b.rect(2, 0, 2, 32, '#4e2d18'); b.rect(28, 0, 2, 32, '#3a2010');
  }
  function linhaCal(b, X, Y, tx, ty, m) {
    terra(b, X, Y, tx, ty);
    var cal = rgb('#ece6d4'), e = m && m.ch(tx - 1, ty) === 'L', d = m && m.ch(tx + 1, ty) === 'L', c = m && m.ch(tx, ty - 1) === 'L', bx = m && m.ch(tx, ty + 1) === 'L';
    function mancha(x, y) { if (H(X + x, Y + y, 4) > 0.15) b.set(x, y, cal); else b.set(x, y, [200, 190, 170]); }
    if (e || d || (!c && !bx)) for (var x = e ? 0 : 14; x < (d ? 32 : 18); x++) for (var y = 14; y < 18; y++) mancha(x, y);
    if (c || bx) for (var yy = c ? 0 : 14; yy < (bx ? 32 : 18); yy++) for (var xx = 14; xx < 18; xx++) mancha(xx, yy);
  }

  var PINTOR = {
    '.': terra, '^': picarra, ',': mato, 'B': cinza, '=': cimento, 'f': assoalho, 'P': pedra, '_': pedra,
    '~': aguaTile, 'v': grota, 'C': cerca, 'G': garrancho, 'x': xique, 'T': baseArvore, 'M': baseMandacaru,
    'p': porta, 'L': linhaCal,
    'D': function (b, X, Y, tx, ty) { pedra(b, X, Y, tx, ty); var c = rgb('#b8502a'); b.rect(9, 8, 2, 12, c); b.rect(11, 8, 8, 2, c); b.rect(17, 10, 2, 4, c); b.rect(11, 18, 10, 2, c); b.rect(21, 12, 2, 8, c); b.rect(14, 13, 4, 2, c); b.rect(23, 8, 2, 2, '#e0a050'); },
    '#': function (b, X, Y, tx, ty, m) { var bx = m.ch(tx, ty + 1); if ((bx === '#' || bx === 'i' || bx === 'p') && !m.dados.semTelhado) telhado(b, X, Y, tx, ty, m, false); else taipa(b, X, Y, tx, ty, m); },
    'i': function (b, X, Y, tx, ty, m) { var bx = m.ch(tx, ty + 1); if ((bx === '#' || bx === 'i') && !m.dados.semTelhado) telhado(b, X, Y, tx, ty, m, true); else caiada(b, X, Y, tx, ty, m); }
  };

  // ---------------- acabamento: transição e sombra ----------------
  var FAMILIA = { '.': 'terra', ',': 'terra', '^': 'picarra', 'B': 'cinza', 'T': 'terra', 'M': 'terra', 'x': 'terra', 'G': 'terra', 'C': 'terra', 'L': 'terra' };
  var COR_FAM = { terra: [TERRA[2], TERRA[1]], picarra: [PICARRA[2], PICARRA[3]], cinza: [rgb(C.cinza), rgb('#2a2420')] };
  var SOMBREIA = { '#': 1, 'i': 1, 'P': 1, 'D': 1, '_': 1, 'k': 1, 'p': 1, 'n': 1 };
  function acabar(b, m, tx, ty, X, Y) {
    var ch = m.ch(tx, ty), fam = FAMILIA[ch];
    if (fam) {
      var viz = [[0, -1], [1, 0], [0, 1], [-1, 0]];
      for (var k = 0; k < 4; k++) {
        var vc = m.ch(tx + viz[k][0], ty + viz[k][1]), vf = FAMILIA[vc];
        if (!vf || vf === fam || !COR_FAM[vf]) continue;
        var cor = COR_FAM[vf];
        for (var p = 0; p < A; p++) for (var q = 0; q < 10; q++) {
          var ex, ey;
          if (k === 0) { ex = p; ey = q; } else if (k === 1) { ex = 31 - q; ey = p; } else if (k === 2) { ex = p; ey = 31 - q; } else { ex = q; ey = p; }
          // borda em manchas irregulares (não pontilhado), misturando aos poucos
          var alcance = 3 + vnoise(X + ex, Y + ey, 6, 300 + k) * 9;
          if (q > alcance) continue;
          b.blend(ex, ey, cor[0], 0.75 * (1 - q / alcance) + (H(X + ex, Y + ey, 301) - 0.5) * 0.15);
        }
      }
    }
    if (defs[ch] && defs[ch].solido && ch !== 'T' && ch !== 'M') return;
    // oclusão: o que está em cima/à esquerda e é sólido faz sombra
    var cima = m.ch(tx, ty - 1), esq = m.ch(tx - 1, ty), dir = m.ch(tx + 1, ty);
    if (cima && SOMBREIA[cima]) for (var y = 0; y < 10; y++) b.rectA(0, y, A, 1, [16, 8, 20], 0.5 * (1 - y / 10));
    if (esq && SOMBREIA[esq]) for (var x = 0; x < 6; x++) b.rectA(x, 0, 1, A, [16, 8, 20], 0.3 * (1 - x / 6));
    if (dir && SOMBREIA[dir]) for (var x2 = 0; x2 < 3; x2++) b.rectA(31 - x2, 0, 1, A, [16, 8, 20], 0.15 * (1 - x2 / 3));
  }

  // ---------------- COISAS ALTAS EM ALTA ----------------
  function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function bufGrande(w, h) { return { w: w, h: h, d: new Uint8ClampedArray(w * h * 4) }; }
  function pset(B, x, y, c, a) { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= B.w || y >= B.h) return; var i = (y * B.w + x) * 4; B.d[i] = c[0]; B.d[i + 1] = c[1]; B.d[i + 2] = c[2]; B.d[i + 3] = a === undefined ? 255 : a; }
  function finalizar(B) {
    // contorno suave nas bordas
    var d = B.d, w = B.w, h = B.h, cheio = new Uint8Array(w * h), i;
    for (i = 0; i < w * h; i++) cheio[i] = d[i * 4 + 3] > 100 ? 1 : 0;
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) { i = y * w + x; if (cheio[i]) continue; if ((x > 0 && cheio[i - 1]) || (x < w - 1 && cheio[i + 1]) || (y > 0 && cheio[i - w]) || (y < h - 1 && cheio[i + w])) { d[i * 4] = 22; d[i * 4 + 1] = 14; d[i * 4 + 2] = 24; d[i * 4 + 3] = 220; } }
    var c = cv(w, h), g = c.getContext('2d'), img = g.createImageData(w, h); img.data.set(d); g.putImageData(img, 0, 0); return c;
  }
  var cacheAlto = {};
  // copa de juazeiro: bolhas de folha com luz calculada (esfera) e textura
  function copaHD(v) {
    var k = 'copa' + v; if (cacheAlto[k]) return cacheAlto[k];
    var w = 62, h = 54, B = bufGrande(w, h), s = v * 13 + 1;
    var bolas = [[31, 30, 19], [16, 28, 13], [46, 28, 13], [23, 17, 13], [40, 16, 12], [31, 38, 13], [31, 12, 10]];
    var tons = [rgb('#16261a'), rgb('#1e3a20'), rgb(C.verdeEsc), rgb('#3e6430'), rgb(C.verde), rgb(C.verdeClaro), rgb('#8ab45a'), rgb('#b0d070')];
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var melhor = null, mz = -1;
      for (var b2 = 0; b2 < bolas.length; b2++) {
        var bb = bolas[b2], dx = (x - bb[0]) / bb[2], dy = (y - bb[1]) / bb[2], dd = dx * dx + dy * dy;
        var irreg = 1 + (H(x >> 1, y >> 1, s) - 0.5) * 0.22;
        if (dd < irreg) { var z = Math.sqrt(Math.max(0, 1 - dd)) * bb[2]; if (z > mz) { mz = z; melhor = [dx, dy, Math.sqrt(Math.max(0, 1 - dd))]; } }
      }
      if (!melhor) continue;
      var l = -0.5 * melhor[0] - 0.62 * melhor[1] + 0.6 * melhor[2];
      l += (H(x, y, s + 5) - 0.5) * 0.35; // folhagem
      var ti = Math.max(0, Math.min(7, Math.floor((l + 0.35) * 5)));
      pset(B, x, y, tons[ti]);
    }
    // frutinhas de juá
    if (v % 2) for (var f = 0; f < 7; f++) { var fx = 10 + H(v, f, 8) * 42, fy = 10 + H(v, f, 9) * 32; if (B.d[(Math.round(fy) * w + Math.round(fx)) * 4 + 3]) { pset(B, fx, fy, rgb('#f0c75e')); pset(B, fx, fy + 1, rgb('#c08a2a')); } }
    return (cacheAlto[k] = finalizar(B));
  }
  // mandacaru alto com gomos, espinhos e (às vezes) a flor
  function mandacaruHD(v) {
    var k = 'mand' + v; if (cacheAlto[k]) return cacheAlto[k];
    var w = 36, h = 70, B = bufGrande(w, h);
    var tons = [rgb('#1c321a'), rgb(C.verdeEsc), rgb('#3e6430'), rgb(C.verde), rgb(C.verdeClaro), rgb('#9ac06a')];
    function coluna(cx, y0, y1, r) {
      for (var y = y0; y < y1; y++) for (var x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
        var top = y - y0 < r ? (r - (y - y0)) / r : 0, nx = (x - cx) / r;
        if (nx * nx + top * top > 1) continue;
        var l = 0.55 - nx * 0.5 - top * 0.2;
        var gomo = Math.cos((x - cx) / r * 4.7);
        l += gomo * 0.12;
        pset(B, x, y, tons[Math.max(0, Math.min(5, Math.floor(l * 6)))]);
        if (gomo > 0.95 && (y + Math.round(x)) % 4 === 0) pset(B, x - 0.5, y, rgb('#f2ecd0'));
      }
    }
    var alt = 62 - (v % 3) * 6, base = 69;
    var bE = 26 + (v % 2) * 8, bD = 18 + (v % 3) * 6;
    coluna(7, base - bE - 18, base - bE + 4, 3.2); for (var x = 7; x < 18; x++) coluna(x, base - bE, base - bE + 5, 2.6);
    coluna(29, base - bD - 16, base - bD + 4, 3); for (var x2 = 18; x2 < 30; x2++) coluna(x2, base - bD, base - bD + 5, 2.6);
    coluna(18, base - alt, base, 5);
    if (v % 3 === 0) { pset(B, 17, base - alt - 1, rgb('#ffffff')); pset(B, 18, base - alt - 2, rgb('#f8e8f0')); pset(B, 19, base - alt - 1, rgb('#ffffff')); pset(B, 18, base - alt - 1, rgb('#f0c75e')); }
    return (cacheAlto[k] = finalizar(B));
  }
  function beiralHD(caiada) {
    var k = 'beiral' + caiada; if (cacheAlto[k]) return cacheAlto[k];
    var w = 32, h = 12, B = bufGrande(w, h);
    for (var y = 2; y < h; y++) for (var x = 0; x < w; x++) {
      var c;
      if (caiada) { c = y < 9 ? rgb('#f4eee0') : rgb('#c8bca2'); if (y === 5 || y === 6) c = rgb('#4f7a9a'); if (y === 2) c = rgb('#ffffff'); }
      else { var col = x % 8; c = col < 5 ? rgb('#b8582e') : rgb('#7a3220'); if (col === 0) c = rgb('#e08a56'); if (y === 2 || y === 3) c = rgb('#c86a3e'); if (y >= 9) c = rgb('#4a1a12'); }
      pset(B, x, y, c);
    }
    return (cacheAlto[k] = finalizar(B));
  }

  // ---------------- API ----------------
  var teste = document.createElement('canvas').getContext('2d');
  var temImageData = false;
  try { var t0 = teste.createImageData(2, 2); temImageData = !!(t0 && t0.data && t0.data.length === 16 && typeof ImageData !== 'undefined'); } catch (e) { temImageData = false; }

  var tmp16 = null;
  BSI.tilesHD = {
    A: A, rgb: rgb, luz: luz, mix: mix, vnoise: vnoise, Buf: Buf,
    get ok() { return temImageData && BSI.view && BSI.view.det > 1; },
    pintores: PINTOR,
    copa: copaHD, mandacaru: mandacaruHD, beiral: beiralHD,
    pintar: function (m, g, tx, ty) {
      var ch = m.ch(tx, ty), X = tx * A, Y = ty * A;
      if (ch === '_' && m.revelado[ty * m.w + tx]) ch = '^';
      var f = PINTOR[ch];
      if (!f) { // tile sem versão nova: desenha o antigo e amplia
        if (!tmp16) { tmp16 = document.createElement('canvas'); tmp16.width = T; tmp16.height = T; }
        var tg = tmp16.getContext('2d'); tg.clearRect(0, 0, T, T); tg.imageSmoothingEnabled = false;
        BSI.tiles._mapaAtual = m;
        // o chão por baixo (barraca, mesa, balcão têm transparência)
        var bf = new Buf(); terra(bf, X, Y, tx, ty); var imb = g.createImageData(A, A); imb.data.set(bf.d); g.putImageData(imb, X, Y);
        defs[ch].desenhar(tg, 0, 0, tx, ty);
        g.imageSmoothingEnabled = false; g.drawImage(tmp16, X, Y, A, A);
        return;
      }
      var b = new Buf();
      f(b, X, Y, tx, ty, m);
      acabar(b, m, tx, ty, X, Y);
      var img = g.createImageData(A, A); img.data.set(b.d); g.putImageData(img, X, Y);
    }
  };
})();
