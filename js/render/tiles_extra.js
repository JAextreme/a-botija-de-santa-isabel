/* =========================================================
   tiles_extra.js — acabamento dos mapas (Atualização pré-1.0)
   1. CHÃO VIVO: manchas grandes de cor, transição pontilhada
      entre terra / piçarra / cinza, sombra ao pé de parede e pedra,
      e miudezas (capim verde, pedrinha, graveto, folha, osso...).
   2. COISAS ALTAS: copa do juazeiro, mandacaru alto e beiral de
      telha são desenhados NA ORDEM DE PROFUNDIDADE junto com os
      personagens. Quem passa por trás some atrás da copa (que
      fica meio transparente pra não esconder o jogador).
   Tudo gerado por código e fixo por posição (hash), sem imagem.
   ========================================================= */
(function () {
  'use strict';
  var C = BSI.cor, H = BSI.util.hash, T = BSI.cfg.TILE, defs = BSI.tiles.defs;

  function px(g, x, y, cor) { g.fillStyle = cor; g.fillRect(x, y, 1, 1); }
  function terraBase(g, x, y, tx, ty) {
    g.fillStyle = C.terra; g.fillRect(x, y, T, T);
    for (var i = 0; i < 6; i++) px(g, x + Math.floor(H(tx, ty, 1 + i * 7) * 16), y + Math.floor(H(tx, ty, 1 + i * 13 + 3) * 16), C.terraEsc);
    for (var j = 0; j < 4; j++) px(g, x + Math.floor(H(tx, ty, 2 + j * 7) * 16), y + Math.floor(H(tx, ty, 2 + j * 13 + 3) * 16), C.terraClara);
  }

  // ---------- juazeiro e mandacaru: no mapa fica só a base ----------
  defs.T.desenhar = function (g, x, y, tx, ty) {
    terraBase(g, x, y, tx, ty);
    g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(x - 2, y + 8, 20, 7); g.fillRect(x, y + 6, 16, 10);
    g.fillStyle = C.madeiraEsc; g.fillRect(x + 6, y + 4, 4, 11);
    g.fillStyle = C.madeira; g.fillRect(x + 7, y + 4, 1, 10);
    g.fillStyle = C.madeiraEsc; g.fillRect(x + 4, y + 13, 2, 2); g.fillRect(x + 10, y + 13, 3, 2); // raiz
  };
  defs.T.alto = 'copa';
  defs.M.desenhar = function (g, x, y, tx, ty) {
    terraBase(g, x, y, tx, ty);
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x + 2, y + 12, 13, 3);
    g.fillStyle = C.verdeEsc; g.fillRect(x + 6, y + 8, 4, 7);
  };
  defs.M.alto = 'mandacaru';
  defs['#'].alto = 'beiral';
  defs.i.alto = 'cornija';

  // ---------- sprites das coisas altas (cache por variação) ----------
  var cache = {};
  function canvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; var g = c.getContext('2d'); g.imageSmoothingEnabled = false; return { c: c, g: g }; }
  function bolha(g, cx, cy, r, cor) {
    g.fillStyle = cor;
    for (var y = -r; y <= r; y++) { var w = Math.round(Math.sqrt(r * r - y * y)); g.fillRect(cx - w, cy + y, w * 2 + 1, 1); }
  }
  function copa(v) {
    var k = 'copa' + v; if (cache[k]) return cache[k];
    var s = canvas(30, 26), g = s.g;
    var seed = v * 31;
    // sombra interna, massa verde e luz da lua por cima/esquerda
    var blobs = [[15, 14, 10], [8, 13, 7], [22, 13, 7], [12, 8, 7], [19, 8, 6], [15, 18, 7]];
    blobs.forEach(function (b) { bolha(g, b[0], b[1] + 1, b[2] + 1, '#1a2a14'); });
    blobs.forEach(function (b) { bolha(g, b[0], b[1], b[2], C.verdeEsc); });
    blobs.forEach(function (b) { bolha(g, b[0] - 1, b[1] - 1, b[2] - 2, C.verde); });
    [[11, 6, 3], [18, 6, 2], [7, 11, 2], [14, 10, 2]].forEach(function (b) { bolha(g, b[0], b[1], b[2], C.verdeClaro); });
    // textura de folhinha
    for (var i = 0; i < 40; i++) {
      var x = Math.floor(H(seed, i, 3) * 28) + 1, y = Math.floor(H(seed, i, 4) * 22) + 2;
      var d = g.getImageData(x, y, 1, 1).data;
      if (d[3] > 0) px(g, x, y, H(seed, i, 5) > 0.5 ? C.verdeEsc : '#7aa04a');
    }
    // frutinha de juá (amarelinho) às vezes
    if (v % 2) for (var f = 0; f < 4; f++) px(g, 6 + Math.floor(H(seed, f, 8) * 18), 8 + Math.floor(H(seed, f, 9) * 12), C.amarelo);
    contorno(s);
    return (cache[k] = s.c);
  }
  function mandacaru(v) {
    var k = 'mand' + v; if (cache[k]) return cache[k];
    var s = canvas(18, 34), g = s.g, e = C.verdeEsc, m = C.verde, c = C.verdeClaro;
    var alt = 30 - (v % 3) * 3, top = 34 - alt;
    g.fillStyle = e; g.fillRect(7, top, 5, alt);
    g.fillStyle = m; g.fillRect(8, top + 1, 3, alt - 2);
    g.fillStyle = c; g.fillRect(8, top + 2, 1, alt - 6);
    // braços (variam)
    var bracoE = 12 + (v % 2) * 4, bracoD = 8 + (v % 3) * 3;
    g.fillStyle = e; g.fillRect(2, bracoE, 6, 3); g.fillRect(2, bracoE - 8, 4, 9);
    g.fillStyle = m; g.fillRect(3, bracoE - 7, 2, 8);
    g.fillStyle = e; g.fillRect(11, bracoD + 3, 5, 3); g.fillRect(13, bracoD - 4, 4, 9);
    g.fillStyle = m; g.fillRect(14, bracoD - 3, 2, 8);
    // espinhos e a flor branca no topo
    for (var i = 0; i < 9; i++) px(g, i % 2 ? 6 : 12, top + 3 + i * 3, C.creme);
    px(g, 3, bracoE - 6, C.creme); px(g, 15, bracoD - 2, C.creme);
    if (v % 3 === 0) { px(g, 9, top - 0, '#f2e6c9'); px(g, 8, top, '#e0c8d0'); px(g, 10, top, '#e0c8d0'); }
    contorno(s);
    return (cache[k] = s.c);
  }
  function beiral(caiada) {
    var k = caiada ? 'cornija' : 'beiral'; if (cache[k]) return cache[k];
    var s = canvas(16, 7), g = s.g;
    if (caiada) {
      g.fillStyle = '#f4eee0'; g.fillRect(0, 2, 16, 4); g.fillStyle = '#c8bca2'; g.fillRect(0, 5, 16, 1);
      g.fillStyle = '#4f7a9a'; g.fillRect(0, 3, 16, 1);
    } else {
      // telha de barro (capa e canal)
      g.fillStyle = '#6a2a18'; g.fillRect(0, 1, 16, 6);
      for (var i = 0; i < 16; i += 4) { g.fillStyle = '#b0502e'; g.fillRect(i, 1, 3, 5); g.fillStyle = '#d0703e'; g.fillRect(i, 1, 1, 4); }
      g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 6, 16, 1);
    }
    return (cache[k] = s.c);
  }
  function contorno(s) {
    var w = s.c.width, h = s.c.height, d = s.g.getImageData(0, 0, w, h), o = s.g.createImageData(w, h);
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var i = (y * w + x) * 4;
      if (d.data[i + 3]) { o.data[i] = d.data[i]; o.data[i + 1] = d.data[i + 1]; o.data[i + 2] = d.data[i + 2]; o.data[i + 3] = 255; continue; }
      var viz = (x > 0 && d.data[i - 1]) || (x < w - 1 && d.data[i + 7]) || (y > 0 && d.data[i - w * 4 + 3]) || (y < h - 1 && d.data[i + w * 4 + 3]);
      if (viz) { o.data[i] = 20; o.data[i + 1] = 14; o.data[i + 2] = 24; o.data[i + 3] = 255; }
    }
    s.g.putImageData(o, 0, 0);
  }

  // objeto "alto" que entra na lista de profundidade do mundo
  function Alto(tipo, tx, ty) {
    this.tipo = tipo; this.tx = tx; this.ty = ty;
    this.x = tx * T + T / 2;
    this.y = ty * T + (tipo === 'beiral' || tipo === 'cornija' ? T - 1 : T - 2);
    this.v = Math.floor(H(tx, ty, 61) * 6);
  }
  Alto.prototype.desenhar = function (g, cx, cy, mundo) {
    var x = this.tx * T - cx, y = this.ty * T - cy, img, dx, dy, e = 1;
    if (BSI.tilesHD && BSI.tilesHD.ok) {
      e = 2;
      if (this.tipo === 'copa') { img = BSI.tilesHD.copa(this.v); dx = x - 7.5; dy = y - 18; }
      else if (this.tipo === 'mandacaru') { img = BSI.tilesHD.mandacaru(this.v); dx = x - 1; dy = y - 21; }
      else { img = BSI.tilesHD.beiral(this.tipo === 'cornija'); dx = x; dy = y - 5; }
    }
    else if (this.tipo === 'copa') { img = copa(this.v); dx = x - 7; dy = y - 17; }
    else if (this.tipo === 'mandacaru') { img = mandacaru(this.v); dx = x - 1; dy = y - 20; }
    else { img = beiral(this.tipo === 'cornija'); dx = x; dy = y - 5; }
    var iw = img.width / e, ih = img.height / e;
    if (dx > BSI.view.w || dy > BSI.view.h || dx + iw < 0 || dy + ih < 0) return;
    // alguém do grupo atrás? a copa fica transparente
    var a = 1;
    if (mundo && this.tipo !== 'beiral' && this.tipo !== 'cornija') {
      var L = mundo.lider();
      if (L && L.y < this.y && L.y > this.y - ih - 4 && Math.abs(L.x - this.x) < iw / 2 + 4) a = 0.42;
    }
    g.globalAlpha = a;
    g.drawImage(img, Math.round(dx * e) / e, Math.round(dy * e) / e, iw, ih);
    g.globalAlpha = 1;
  };
  BSI.Alto = Alto;

  // ---------- acabamento do chão (chamado depois de cada tile) ----------
  var FAMILIA = { '.': 'terra', ',': 'terra', '^': 'picarra', 'B': 'cinza', 'T': 'terra', 'M': 'terra', 'x': 'terra', 'G': 'terra', 'C': 'terra', 'L': 'terra' };
  var COR_FAM = { terra: [C.terra, C.terraEsc], picarra: [C.picarra, C.picarraEsc], cinza: [C.cinza, '#2a2420'] };
  var PAREDE = { '#': 1, 'i': 1, 'P': 1, 'D': 1, '_': 1, 'k': 1 };

  // ruído suave (manchas grandes de chão mais claro/escuro)
  function ruido(tx, ty) {
    var s = 5, x0 = Math.floor(tx / s), y0 = Math.floor(ty / s), fx = (tx % s) / s, fy = (ty % s) / s;
    var a = H(x0, y0, 7), b = H(x0 + 1, y0, 7), c = H(x0, y0 + 1, 7), d = H(x0 + 1, y0 + 1, 7);
    var top = a + (b - a) * fx, bot = c + (d - c) * fx;
    return top + (bot - top) * fy; // 0..1
  }

  function miudeza(g, x, y, tx, ty, ch) {
    var dens = BSI.config.visual.decoracao.densidadeMiudezas * (ch === '^' ? 0.4 : 1);
    var r = H(tx, ty, 171);
    if (r > dens) return;
    var ox = x + 2 + Math.floor(H(tx, ty, 172) * 10), oy = y + 3 + Math.floor(H(tx, ty, 173) * 10);
    var tipo = H(tx, ty, 174);
    if (tipo < 0.3) { // capinzinho verde que nasceu teimoso
      px(g, ox, oy, C.verdeEsc); px(g, ox + 1, oy - 1, C.verde); px(g, ox + 2, oy, C.verdeEsc); px(g, ox + 1, oy, '#3a5a2a');
      px(g, ox + 4, oy + 1, C.verdeEsc); px(g, ox + 4, oy, C.verde);
    } else if (tipo < 0.55) { // pedrinhas
      g.fillStyle = C.pedraEsc; g.fillRect(ox, oy, 3, 2); g.fillStyle = C.pedra; g.fillRect(ox, oy, 2, 1);
      px(g, ox + 4, oy + 2, C.pedra); px(g, ox + 5, oy + 1, C.pedraEsc);
    } else if (tipo < 0.72) { // graveto
      g.fillStyle = C.madeiraEsc; g.fillRect(ox, oy, 5, 1); px(g, ox + 3, oy - 1, C.madeiraEsc); px(g, ox + 1, oy, C.madeira);
    } else if (tipo < 0.86) { // folha seca de juazeiro
      px(g, ox, oy, '#a8823a'); px(g, ox + 1, oy, '#c8a04a'); px(g, ox + 1, oy + 1, '#8a6a2a');
      px(g, ox + 4, oy + 2, '#a8823a');
    } else if (tipo < 0.94) { // tampinha / caco de telha
      px(g, ox, oy, H(tx, ty, 175) > 0.5 ? '#c03030' : '#b0502e'); px(g, ox + 1, oy, '#6a2a18');
    } else { // ossinho de boi (é o sertão)
      g.fillStyle = '#e8e0c8'; g.fillRect(ox, oy, 4, 1); px(g, ox, oy - 1, '#e8e0c8'); px(g, ox + 3, oy + 1, '#e8e0c8');
    }
  }

  BSI.tiles.acabamento = function (mapa, g, tx, ty) {
    var ch = mapa.ch(tx, ty), d = defs[ch];
    if (!d || d.solido && !d.alto) return;
    var x = tx * T, y = ty * T, fam = FAMILIA[ch];
    if (d.solido) return; // sólidos com "alto" (árvore) já desenharam a base
    // 1. manchas grandes (só no chão de fora)
    if (fam) {
      var n = ruido(tx, ty);
      if (n < 0.35) { g.fillStyle = 'rgba(40,20,10,' + ((0.35 - n) * 0.28).toFixed(3) + ')'; g.fillRect(x, y, T, T); }
      else if (n > 0.65) { g.fillStyle = 'rgba(255,230,180,' + ((n - 0.65) * 0.16).toFixed(3) + ')'; g.fillRect(x, y, T, T); }
      // 2. transição pontilhada com o vizinho de outra família de chão
      var viz = [[0, -1], [1, 0], [0, 1], [-1, 0]];
      for (var k = 0; k < 4; k++) {
        var vc = mapa.ch(tx + viz[k][0], ty + viz[k][1]), vf = FAMILIA[vc];
        if (!vf || vf === fam || !COR_FAM[vf]) continue;
        var cor = COR_FAM[vf];
        for (var p = 0; p < 16; p++) for (var q = 0; q < 4; q++) {
          if (H(tx * 16 + p, ty * 16 + q, 300 + k) > (0.75 - q * 0.2)) continue;
          var ex, ey;
          if (k === 0) { ex = p; ey = q; } else if (k === 1) { ex = 15 - q; ey = p; } else if (k === 2) { ex = p; ey = 15 - q; } else { ex = q; ey = p; }
          px(g, x + ex, y + ey, (p + q) % 3 ? cor[0] : cor[1]);
        }
      }
      // 3. miudezas
      if (ch === '.' || ch === '^') miudeza(g, x, y, tx, ty, ch);
    }
    // 4. sombra ao pé de parede/pedra (o que está em cima faz sombra pra baixo)
    var cima = mapa.ch(tx, ty - 1);
    if (cima && (PAREDE[cima] || cima === 'p')) {
      g.fillStyle = 'rgba(10,6,14,0.32)'; g.fillRect(x, y, T, 2);
      g.fillStyle = 'rgba(10,6,14,0.16)'; g.fillRect(x, y + 2, T, 3);
    }
    var esq = mapa.ch(tx - 1, ty);
    if (esq && PAREDE[esq]) { g.fillStyle = 'rgba(10,6,14,0.18)'; g.fillRect(x, y, 2, T); }
  };

  // fachada: parede de taipa com chão embaixo ganha rodapé e, às vezes, janela
  // TELHADO: parede com mais parede embaixo é o "teto" visto de cima
  function telhado(g, x, y, tx, ty, m, caiada) {
    var linha = ty;
    // telha de barro em fileiras (capa clara, canal escuro), com sujeira e musgo
    g.fillStyle = caiada ? '#9a4a2a' : '#8a3a22'; g.fillRect(x, y, T, T);
    for (var r = 0; r < 4; r++) {
      var yy = y + r * 4, off = ((linha * 4 + r) % 2) * 2;
      for (var c = -2; c < 16; c += 4) {
        g.fillStyle = '#b8582e'; g.fillRect(x + c + off, yy, 3, 3);
        g.fillStyle = '#d8783e'; g.fillRect(x + c + off, yy, 1, 2);
      }
      g.fillStyle = 'rgba(40,10,6,0.45)'; g.fillRect(x, yy + 3, T, 1);
    }
    if (H(tx, ty, 501) > 0.8) { g.fillStyle = 'rgba(70,80,40,0.55)'; g.fillRect(x + Math.floor(H(tx, ty, 502) * 10), y + Math.floor(H(tx, ty, 503) * 10), 4, 2); }
    if (H(tx, ty, 504) > 0.93) { g.fillStyle = '#5a5a5a'; g.fillRect(x + 6, y + 5, 4, 3); } // telha remendada
    // cumeeira: borda de cima do telhado mais clara, borda de baixo com sombra
    var cima = m.ch(tx, ty - 1);
    if (cima !== '#' && cima !== 'i') { g.fillStyle = 'rgba(255,220,170,0.18)'; g.fillRect(x, y, T, 3); }
    var e = m.ch(tx - 1, ty), d = m.ch(tx + 1, ty);
    if (e !== '#' && e !== 'i') { g.fillStyle = 'rgba(255,220,170,0.12)'; g.fillRect(x, y, 2, T); }
    if (d !== '#' && d !== 'i') { g.fillStyle = 'rgba(20,6,6,0.3)'; g.fillRect(x + 14, y, 2, T); }
  }
  var caiadaOrig = defs.i.desenhar;
  defs.i.desenhar = function (g, x, y, tx, ty) {
    var m = BSI.tiles._mapaAtual, baixo = m && m.ch(tx, ty + 1);
    if (m && (baixo === 'i' || baixo === '#') && !m.dados.semTelhado) { telhado(g, x, y, tx, ty, m, true); return; }
    caiadaOrig(g, x, y, tx, ty);
  };
  var taipaOrig = defs['#'].desenhar;
  defs['#'].desenhar = function (g, x, y, tx, ty) {
    var m = BSI.tiles._mapaAtual;
    var baixo0 = m && m.ch(tx, ty + 1);
    if (m && (baixo0 === '#' || baixo0 === 'i' || baixo0 === 'p') && !m.dados.semTelhado) { telhado(g, x, y, tx, ty, m, false); return; }
    taipaOrig(g, x, y, tx, ty);
    if (!m) return;
    var baixo = m.ch(tx, ty + 1), bd = baixo && defs[baixo];
    if (bd && !bd.solido) {
      g.fillStyle = '#6a3e22'; g.fillRect(x, y + 12, T, 4); g.fillStyle = '#8a5432'; g.fillRect(x, y + 12, T, 1);
      if (H(tx, ty, 401) > 0.72 && m.ch(tx - 1, ty) === '#' && m.ch(tx + 1, ty) === '#') {
        // janela de madeira azul (a cor de toda casa do interior)
        g.fillStyle = '#2a1a10'; g.fillRect(x + 4, y + 2, 8, 8);
        g.fillStyle = '#3b6a8c'; g.fillRect(x + 4, y + 2, 3, 8); g.fillRect(x + 9, y + 2, 3, 8);
        g.fillStyle = '#5a8aac'; g.fillRect(x + 4, y + 2, 1, 8); g.fillRect(x + 9, y + 2, 1, 8);
        g.fillStyle = '#e8e0cc'; g.fillRect(x + 3, y + 10, 10, 1);
      }
    }
  };
})();
