/* =========================================================
   retratos.js — RETRATOS DE DIÁLOGO 80x80 com 5 EXPRESSÕES:
   normal · rindo · bravo · assustado · desconfiado
   Feitos por código a partir do visual de cada um (mesmo
   cabelo, chapéu, barba, óculos e camisa do boneco), com luz
   vindo da esquerda calculada pixel a pixel.
   Na fala, a expressão vem de 'quem:expressao' (ex.:
   ['miguel:bravo', '...']) ou é adivinhada pelo texto.
   ENCAIXE PRA PNG: BSI.imagens['retrato:id:expressao'].
   ========================================================= */
(function () {
  'use strict';
  var C = BSI.cor, H = BSI.util.hash;
  var N = 80;
  var EXPRESSOES = ['normal', 'rindo', 'bravo', 'assustado', 'desconfiado'];

  function rgb(h) { var s = (h || '#888').replace('#', ''); if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2]; var n = parseInt(s, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function luz(c, f) { return f >= 0 ? [c[0] + (255 - c[0]) * f, c[1] + (244 - c[1]) * f, c[2] + (210 - c[2]) * f * 0.8] : [c[0] + (20 - c[0]) * -f, c[1] + (10 - c[1]) * -f, c[2] + (34 - c[2]) * -f]; }

  function Quadro() { this.d = new Uint8ClampedArray(N * N * 4); this.z = new Float32Array(N * N); }
  Quadro.prototype.set = function (x, y, c) { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= N || y >= N) return; var i = (y * N + x) * 4; this.d[i] = c[0]; this.d[i + 1] = c[1]; this.d[i + 2] = c[2]; this.d[i + 3] = 255; };
  Quadro.prototype.tem = function (x, y) { if (x < 0 || y < 0 || x >= N || y >= N) return false; return this.d[(y * N + x) * 4 + 3] > 0; };
  Quadro.prototype.rect = function (x, y, w, h, c) { for (var yy = y; yy < y + h; yy++) for (var xx = x; xx < x + w; xx++) this.set(xx, yy, c); };
  // elipse com volume (luz da esquerda/cima); filtro opcional decide quais pixels pintar
  Quadro.prototype.elipse = function (cx, cy, rx, ry, cor, forca, filtro) {
    forca = forca === undefined ? 1 : forca;
    for (var y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (var x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      var nx = (x - cx) / rx, ny = (y - cy) / ry, d = nx * nx + ny * ny;
      if (d > 1) continue;
      if (filtro && !filtro(x, y, nx, ny)) continue;
      var nz = Math.sqrt(1 - d), l = -0.55 * nx - 0.5 * ny + 0.65 * nz - 0.45;
      var q = Math.round(l * 4) / 4; // luz em degraus (cara de pixel art)
      this.set(x, y, luz(cor, q * 0.55 * forca));
    }
  };

  function pintar(def, id, expr) {
    var Q = new Quadro();
    var pele = rgb(def.pele || '#c98b5e'), cab = rgb(def.cabelo || '#2b1d14'), cam = rgb(def.camisa || C.creme);
    var cam2 = rgb(def.camisa2 || '#8a8a8a'), chap = rgb(def.chapeu || C.madeira);
    var estilo = def.cabeca || 'curto', padrao = def.padrao || 'liso', ex = def.extras || [];
    var cx = 40, cy = 38, rx = 15, ry = 18; // cabeça
    var tem = function (e) { return ex.indexOf(e) >= 0; };

    // ----- fundo: capuz por trás -----
    if (estilo === 'capuz') Q.elipse(cx, cy + 2, rx + 6, ry + 6, luz(cam, -0.15));
    if (estilo === 'liso' || estilo === 'coque') Q.elipse(cx, cy + 4, rx + 2, ry + 2, luz(cab, -0.2)); // cabelo de trás

    // ----- ombros e camisa -----
    var ombroY = 62;
    for (var y = ombroY; y < N; y++) {
      var meia = 14 + (y - ombroY) * 1.4; if (meia > 34) meia = 34;
      for (var x = Math.round(cx - meia); x <= Math.round(cx + meia); x++) {
        var nx = (x - cx) / meia, c = cam;
        if (padrao === 'listra' && Math.floor(y / 4) % 2) c = cam2;
        if (padrao === 'xadrez' && (Math.floor(y / 4) % 2 || Math.floor(x / 4) % 2 === 0)) c = luz(cam2, (Math.floor(y / 4) % 2 && Math.floor(x / 4) % 2 === 0) ? -0.25 : 0);
        if (padrao === 'metade' && x > cx) c = cam2;
        if (padrao === 'jaleco') c = Math.abs(x - cx) < 6 ? cam2 : rgb('#f4f1ea');
        if (padrao === 'macacao' && Math.abs(x - cx) < 9 && y > ombroY + 7) c = rgb(def.calca || '#3b5b8c');
        if (padrao === 'macacao' && (Math.abs(x - cx + 9) < 2 || Math.abs(x - cx - 9) < 2)) c = rgb(def.calca || '#3b5b8c');
        Q.set(x, y, luz(c, -nx * 0.25 - 0.05));
      }
    }
    if (padrao === 'jaleco') { for (var j = 0; j < 14; j++) { Q.set(cx - 6 - j * 0.3, ombroY + j, luz(rgb('#f4f1ea'), -0.35)); Q.set(cx + 6 + j * 0.3, ombroY + j, luz(rgb('#f4f1ea'), -0.35)); } }
    // pescoço com sombra do queixo
    Q.rect(cx - 6, cy + ry - 4, 12, 10, luz(pele, -0.12)); Q.rect(cx - 6, cy + ry - 3, 12, 3, luz(pele, -0.35));
    // gola
    for (var gx = -7; gx <= 7; gx++) Q.set(cx + gx, ombroY + Math.abs(gx) * 0.4, luz(cam, -0.3));
    if (tem('estetoscopio')) { for (var s = -9; s <= 9; s++) Q.set(cx + s, ombroY + 2 + (s * s) / 12, rgb('#5a5f66')); Q.elipse(cx + 3, ombroY + 11, 2, 2, rgb('#b8c0c8')); }
    if (tem('terco')) { for (var t = 0; t < 12; t++) Q.set(cx - 8 + t * 1.4, ombroY + 3 + Math.sin(t / 11 * Math.PI) * 7, rgb('#e8e0c8')); Q.rect(cx - 1, ombroY + 10, 2, 6, rgb('#c8a040')); Q.rect(cx - 3, ombroY + 12, 6, 2, rgb('#c8a040')); }
    if (tem('colar')) for (var k = -8; k <= 8; k++) Q.set(cx + k, ombroY + 2 + (k * k) / 16, rgb('#e8c040'));

    // ----- orelhas e cabeça -----
    Q.elipse(cx - rx, cy + 2, 3, 5, luz(pele, 0.05)); Q.elipse(cx + rx, cy + 2, 3, 5, luz(pele, -0.15));
    Q.elipse(cx, cy, rx, ry, pele);
    // queixo um pouco mais estreito
    for (var qy = cy + ry - 6; qy <= cy + ry; qy++) { var corta = (qy - (cy + ry - 6)) * 0.9; Q.set(cx - rx + corta, qy, [0, 0, 0]); }

    // ----- rosto -----
    var olhoY = cy + 1, oE = cx - 7, oD = cx + 7;
    var esc = luz(cab, -0.2), lab = luz(rgb('#b0503a'), -0.1);
    function sobrancelha(x0, lado, incl) { for (var i = 0; i < 7; i++) { var yy = olhoY - 6 + Math.round((i - 3) * incl * lado) - (expr === 'assustado' ? 2 : 0); Q.set(x0 - 3 + i, yy, esc); Q.set(x0 - 3 + i, yy - 1, esc); } }
    var incE = 0, incD = 0;
    if (expr === 'bravo') { incE = 0.45; incD = -0.45; }       // pontas pra dentro descendo
    if (expr === 'assustado') { incE = -0.25; incD = 0.25; }
    if (expr === 'desconfiado') { incE = 0.3; incD = 0.15; }   // uma sobe, outra desce
    if (expr === 'rindo') { incE = -0.1; incD = 0.1; }
    sobrancelha(oE, 1, incE); sobrancelha(oD, 1, incD);
    if (expr === 'desconfiado') for (var i2 = 0; i2 < 7; i2++) Q.set(oD - 3 + i2, olhoY - 8, esc);
    function olho(x0) {
      if (expr === 'rindo' || def.olhos === 'sono') { for (var i = -3; i <= 3; i++) Q.set(x0 + i, olhoY - (expr === 'rindo' ? Math.round(1.5 - Math.abs(i) * 0.5) : 0), rgb('#2a1a1a')); return; }
      var aberto = expr === 'assustado' || def.olhos === 'arregalado' ? 3 : (expr === 'bravo' || expr === 'desconfiado' ? 1.5 : 2.2);
      Q.elipse(x0, olhoY, 3.6, aberto, rgb('#f4f0e6'), 0.3);
      var olhar = expr === 'desconfiado' ? 1.5 : 0;
      var ir = expr === 'assustado' ? 1.3 : 2;
      Q.elipse(x0 + olhar, olhoY + 0.3, ir, Math.min(ir, aberto), rgb('#4a3020'), 0.2);
      Q.set(x0 + olhar, olhoY, rgb('#140c10')); Q.set(x0 + olhar + 1, olhoY, rgb('#140c10'));
      Q.set(x0 + olhar - 1, olhoY - 1, rgb('#ffffff'));
      if (expr === 'bravo' || expr === 'desconfiado') for (var p = -3; p <= 3; p++) Q.set(x0 + p, olhoY - 2, luz(pele, -0.3)); // pálpebra baixa
    }
    olho(oE); olho(oD);
    // nariz
    for (var ny2 = 0; ny2 < 6; ny2++) Q.set(cx + 1, olhoY + 2 + ny2, luz(pele, -0.15));
    Q.rect(cx - 2, olhoY + 8, 5, 1, luz(pele, -0.3)); Q.set(cx - 2, olhoY + 7, luz(pele, 0.2));
    // boca
    var by = olhoY + 12;
    if (expr === 'rindo') { for (var m = -5; m <= 5; m++) { var cur = Math.round((25 - m * m) / 10); Q.set(cx + m, by + cur, rgb('#5a1a1a')); if (Math.abs(m) < 5) for (var mm = 0; mm < cur; mm++) Q.set(cx + m, by + mm, mm === 0 ? rgb('#f4f0e6') : rgb('#7a2a2a')); } }
    else if (expr === 'assustado') { Q.elipse(cx, by + 2, 3, 3.5, rgb('#3a1010'), 0.2); Q.rect(cx - 1, by + 4, 3, 1, rgb('#9a3a3a')); }
    else if (expr === 'bravo') { for (var b2 = -5; b2 <= 5; b2++) Q.set(cx + b2, by + 1 - Math.round((25 - b2 * b2) / 14), rgb('#5a1a1a')); Q.rect(cx - 3, by + 1, 6, 1, rgb('#e8e0d0')); }
    else if (expr === 'desconfiado') { for (var d2 = -4; d2 <= 5; d2++) Q.set(cx + d2, by + (d2 > 2 ? -1 : 0), lab); }
    else { for (var n2 = -4; n2 <= 4; n2++) Q.set(cx + n2, by + (Math.abs(n2) > 3 ? -0.4 : 0) + (def.boca === 'sorriso' ? (Math.abs(n2) > 2 ? -1 : 0) : 0), lab); }
    // bochecha corada quando ri
    if (expr === 'rindo') { Q.elipse(cx - 10, olhoY + 6, 3, 2, luz(rgb('#d06a5a'), 0.1), 0.2); Q.elipse(cx + 10, olhoY + 6, 3, 2, luz(rgb('#c05a4a'), -0.05), 0.2); }
    // gota de suor (assustado)
    if (expr === 'assustado') { Q.elipse(cx + rx - 1, cy - 8, 1.5, 2.5, rgb('#bfe6ff'), 0.4); }

    // ----- barba, bigode, óculos -----
    if (tem('barba')) Q.elipse(cx, cy + 12, rx - 1, 9, cab, 1, function (x, y) { return y > cy + 6 && !(Math.abs(x - cx) < 5 && y < by + 3 && y > by - 2); });
    if (tem('bigode')) for (var bg = -6; bg <= 6; bg++) { Q.set(cx + bg, by - 3 + Math.abs(bg) * 0.25, cab); Q.set(cx + bg, by - 2 + Math.abs(bg) * 0.3, luz(cab, 0.1)); }
    if (tem('oculos')) { [oE, oD].forEach(function (x0) { for (var a = 0; a < 24; a++) { var an = a / 24 * Math.PI * 2; Q.set(x0 + Math.cos(an) * 5, olhoY + Math.sin(an) * 4, rgb('#2a2a33')); } }); Q.rect(cx - 2, olhoY - 1, 4, 1, rgb('#2a2a33')); Q.set(oE - 2, olhoY - 2, rgb('#ffffff')); }
    if (tem('bigodinho')) { var bgd = luz(cab, 0.25).map(function (v, k) { return v * 0.75 + pele[k] * 0.25; }); for (var bb = -4; bb <= 4; bb++) Q.set(cx + bb, by - 2 + (Math.abs(bb) > 3 ? 0.4 : 0), bgd); }
    if (tem('mascara')) { // máscara respiradora (Daniel): cobre nariz e boca
      Q.rect(cx - rx, olhoY + 5, 6, 2, rgb('#1a1a1e')); Q.rect(cx + rx - 5, olhoY + 5, 6, 2, rgb('#1a1a1e')); // tiras
      Q.elipse(cx, olhoY + 10, 9, 7.5, rgb('#7a7e86'), 1);
      Q.elipse(cx - 10, olhoY + 12, 3.5, 4, rgb('#b8bec6'), 1); Q.elipse(cx + 10, olhoY + 12, 3.5, 4, rgb('#b8bec6'), 1);
      Q.elipse(cx, by + 3, 5.5, 4.5, rgb('#24242a'), 0.6);
      Q.rect(cx - 5, by, 11, 2, rgb('#e8c030'));
      for (var mf = -3; mf <= 3; mf += 2) { Q.set(cx + mf, by + 4, rgb('#0e0e12')); Q.set(cx + mf + 1, by + 6, rgb('#0e0e12')); }
    }
    if (tem('oculosEscuros')) { Q.rect(oE - 5, olhoY - 3, 11, 6, rgb('#141018')); Q.rect(oD - 5, olhoY - 3, 11, 6, rgb('#141018')); Q.rect(cx - 2, olhoY - 2, 4, 1, rgb('#141018')); Q.rect(oE - 3, olhoY - 2, 3, 1, rgb('#5a6a8a')); Q.rect(oD - 3, olhoY - 2, 3, 1, rgb('#5a6a8a')); }

    // ----- cabelo e chapéu -----
    function topoCabelo(alt) { Q.elipse(cx, cy - 3, rx + 1.5, ry - 1, cab, 1, function (x, y) { return y < cy - ry + alt || (x < cx - rx + 2.5 && y < cy - 2) || (x > cx + rx - 2.5 && y < cy - 2); }); }
    switch (estilo) {
      case 'careca': Q.elipse(cx - 5, cy - 13, 4, 2, luz(pele, 0.45), 0.2); Q.rect(cx - rx, cy - 4, 2, 6, cab); Q.rect(cx + rx - 2, cy - 4, 2, 6, luz(cab, -0.2)); break;
      case 'cacheado':
        for (var cc = 0; cc < 14; cc++) { var an2 = Math.PI + cc / 13 * Math.PI; Q.elipse(cx + Math.cos(an2) * (rx + 1), cy - 4 + Math.sin(an2) * (ry - 2), 4.5, 4.5, cab); }
        Q.elipse(cx, cy - 12, rx - 2, 6, cab);
        break;
      case 'arrepiado':
        topoCabelo(9);
        for (var sp = 0; sp < 6; sp++) { var bx = cx - 12 + sp * 5; for (var hh = 0; hh < 7; hh++) for (var ww = -2 + Math.floor(hh / 3); ww <= 2 - Math.floor(hh / 3); ww++) Q.set(bx + ww + hh * 0.3, cy - ry - hh + 2, luz(cab, hh > 4 ? 0.15 : 0)); }
        break;
      case 'liso': topoCabelo(10); for (var ls = 0; ls < 12; ls++) { Q.set(cx - rx + 1, cy - 4 + ls, cab); Q.set(cx - rx + 2, cy - 4 + ls, cab); } break;
      case 'coque': topoCabelo(9); Q.elipse(cx, cy - ry - 3, 6, 5, cab); Q.elipse(cx, cy - ry - 3, 6, 5, cab); break;
      case 'capuz': Q.elipse(cx, cy - 5, rx + 4, ry - 2, luz(cam, -0.05), 1, function (x, y) { return y < cy - 9 || Math.abs(x - cx) > rx - 1; }); break;
      case 'bone': case 'boneTras':
        Q.elipse(cx, cy - 8, rx + 1, 11, chap, 1, function (x, y) { return y < cy - 7; });
        Q.rect(cx - rx, cy - 8, rx * 2 + 1, 2, luz(chap, -0.4));
        if (estilo === 'bone') for (var ab = -rx - 3; ab <= rx + 3; ab++) { Q.set(cx + ab, cy - 7, luz(chap, -0.25)); Q.set(cx + ab, cy - 6, luz(chap, -0.5)); }
        else Q.rect(cx - 3, cy - 18, 6, 2, luz(chap, -0.3));
        Q.rect(cx - rx, cy - 6, 3, 6, cab); Q.rect(cx + rx - 2, cy - 6, 3, 6, luz(cab, -0.2));
        break;
      case 'chapeu': case 'chapeuPreto': case 'palha':
        var ch = estilo === 'chapeuPreto' ? rgb('#2a2228') : (estilo === 'palha' ? rgb(def.chapeu || '#e0c27a') : chap);
        Q.elipse(cx, cy - 11, rx + 12, 5, luz(ch, -0.05)); // aba
        Q.elipse(cx, cy - 18, rx - 2, 9, ch, 1, function (x, y) { return y < cy - 11; }); // copa
        Q.rect(cx - rx + 2, cy - 13, rx * 2 - 3, 2, luz(ch, -0.5)); // fita
        if (estilo === 'chapeu') for (var cs = -rx - 10; cs <= rx + 10; cs += 3) Q.set(cx + cs, cy - 9, luz(ch, -0.45)); // costura do couro
        if (estilo === 'palha') for (var tp = -rx - 10; tp <= rx + 10; tp += 2) Q.set(cx + tp, cy - 11 + (tp % 4 ? 1 : 0), luz(ch, -0.25));
        for (var sh = -rx + 1; sh < rx; sh++) Q.set(cx + sh, cy - 6, luz(pele, -0.35)); // sombra da aba na testa
        break;
      default: topoCabelo(8); Q.rect(cx - rx, cy - 6, 2, 5, cab); Q.rect(cx + rx - 1, cy - 6, 2, 5, luz(cab, -0.2));
    }
    if (tem('faixa')) { var fx = rgb(def.faixa || '#7a2a1c'); for (var fy = 0; fy < 3; fy++) for (var fxx = -rx - 1; fxx <= rx + 1; fxx++) Q.set(cx + fxx, cy - 10 + fy, luz(fx, fy === 0 ? 0.2 : (fy === 2 ? -0.25 : 0))); }

    // ----- mania de cada um (no retrato também) -----
    if (id === 'helano' && expr === 'normal') { Q.rect(cx + 18, 56, 7, 12, rgb('#1e1e24')); Q.rect(cx + 19, 57, 5, 9, rgb('#9fd8ff')); }
    if (id === 'daniel') { Q.rect(cx + 20, 52, 1, 9, rgb('#d8b080')); Q.elipse(cx + 20, 50, 1.5, 2.5, rgb('#f7a733'), 0.2); }

    // contorno escuro suave
    var d = Q.d, cheio = new Uint8Array(N * N), ii;
    for (ii = 0; ii < N * N; ii++) cheio[ii] = d[ii * 4 + 3] > 0 && !(d[ii * 4] === 0 && d[ii * 4 + 1] === 0 && d[ii * 4 + 2] === 0) ? 1 : 0;
    for (ii = 0; ii < N * N; ii++) if (!cheio[ii]) d[ii * 4 + 3] = 0;
    for (var yy = 0; yy < N; yy++) for (var xx = 0; xx < N; xx++) {
      ii = yy * N + xx; if (cheio[ii]) continue;
      if ((xx > 0 && cheio[ii - 1]) || (xx < N - 1 && cheio[ii + 1]) || (yy > 0 && cheio[ii - N]) || (yy < N - 1 && cheio[ii + N])) { d[ii * 4] = 26; d[ii * 4 + 1] = 16; d[ii * 4 + 2] = 24; d[ii * 4 + 3] = 255; }
    }
    var c = document.createElement('canvas'); c.width = N; c.height = N;
    var g = c.getContext('2d'), img = g.createImageData(N, N); img.data.set(d); g.putImageData(img, 0, 0);
    return c;
  }

  // adivinha a expressão pelo texto da fala
  function adivinhar(txt) {
    var t = (txt || '').toLowerCase();
    if (/k{3,}|haha|rsrs|hehe|kkk|ahaha/.test(t)) return 'rindo';
    if (/socorro|vixe|valha|ai meu|meu deus|corre|fantasma|alma|\?!|!\?/.test(t)) return 'assustado';
    if (/desgra|miser[aá]vel|peste|cabra safado|vou te pegar|cala a boca|raiva|!!/.test(t)) return 'bravo';
    if (/sei n[aã]o|hum+|desconfi|será|mentira|tá estranho|\.\.\.\?/.test(t)) return 'desconfiado';
    return 'normal';
  }

  var cache = {};
  function defDe(id) {
    var p = BSI.data.personagens[id]; if (p) return p.visual;
    var f = BSI.data.falantes[id]; if (f && f.visual && !f.bicho) return f.visual;
    return null;
  }
  var temImg = (function () { try { var c = document.createElement('canvas').getContext('2d').createImageData(2, 2); return !!(c && c.data && c.data.length === 16 && typeof ImageData !== 'undefined'); } catch (e) { return false; } })();

  BSI.retratos = {
    EXPRESSOES: EXPRESSOES, N: N, adivinhar: adivinhar,
    de: function (id, expr) {
      if (!temImg) return null;
      expr = EXPRESSOES.indexOf(expr) >= 0 ? expr : 'normal';
      var png = BSI.imagens && BSI.imagens['retrato:' + id + ':' + expr];
      if (png) return png;
      var k = id + ':' + expr;
      if (cache[k] !== undefined) return cache[k];
      var def = defDe(id);
      return (cache[k] = def ? pintar(def, id, expr) : null);
    }
  };
})();
