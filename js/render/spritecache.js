/* =========================================================
   spritecache.js — transforma os desenhos do painter.js em
   pequenos canvas prontos (uma vez só), com contorno escuro
   automático e versão espelhada. Desenhar no jogo = drawImage.
   ========================================================= */
(function () {
  'use strict';

  var cache = {};

  function novoCanvas(w, h) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    return { c: c, g: g };
  }

  // Contorno: todo pixel vazio vizinho de um pixel cheio vira contorno
  function contornar(cv, cor) {
    var w = cv.c.width, h = cv.c.height;
    var img;
    try { img = cv.g.getImageData(0, 0, w, h); } catch (e) { return; }
    if (!img || !img.data || img.data.length < w * h * 4) return;
    var d = img.data, cheio = new Uint8Array(w * h), i, x, y;
    for (i = 0; i < w * h; i++) cheio[i] = d[i * 4 + 3] > 40 ? 1 : 0;
    var rgb = [26, 16, 24];
    if (cor) { var n = parseInt(cor.replace('#', ''), 16); rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      i = y * w + x;
      if (cheio[i]) continue;
      if ((x > 0 && cheio[i - 1]) || (x < w - 1 && cheio[i + 1]) || (y > 0 && cheio[i - w]) || (y < h - 1 && cheio[i + w])) {
        d[i * 4] = rgb[0]; d[i * 4 + 1] = rgb[1]; d[i * 4 + 2] = rgb[2]; d[i * 4 + 3] = 255;
      }
    }
    cv.g.putImageData(img, 0, 0);
  }

  function espelhar(cv) {
    var e = novoCanvas(cv.c.width, cv.c.height);
    e.g.translate(cv.c.width, 0); e.g.scale(-1, 1);
    e.g.drawImage(cv.c, 0, 0);
    return e.c;
  }

  // Versão "branca" do sprite para piscar ao levar dano
  function silhueta(c, cor) {
    var s = novoCanvas(c.width, c.height);
    s.g.drawImage(c, 0, 0);
    s.g.globalCompositeOperation = 'source-in';
    s.g.fillStyle = cor || '#ffffff';
    s.g.fillRect(0, 0, c.width, c.height);
    return s.c;
  }

  // ---------- RELEVO 2x (Etapa 2): a arte antiga ganha o dobro de pixels,
  // luz na borda de cima/esquerda de cada mancha de cor, sombra na de
  // baixo/direita, grão leve e contorno fino. Vale pra objetos e bichos.
  function hdLigado() { return BSI.view && BSI.view.det > 1 && BSI.tilesHD && BSI.tilesHD.ok; }
  function relevo2x(src) {
    var w = src.width, h = src.height, sg = src.getContext('2d'), sd;
    try { sd = sg.getImageData(0, 0, w, h).data; } catch (e) { return null; }
    var W2 = w * 2 + 2, H2 = h * 2 + 2, out = novoCanvas(W2, H2), od = out.g.createImageData(W2, H2), d = od.data;
    function px(x, y) { if (x < 0 || y < 0 || x >= w || y >= h) return -1; var i = (y * w + x) * 4; return sd[i + 3] < 40 ? -1 : (sd[i] << 16 | sd[i + 1] << 8 | sd[i + 2]); }
    var Hh = BSI.util.hash;
    for (var ay = 0; ay < h * 2; ay++) for (var ax = 0; ax < w * 2; ax++) {
      var sx = ax >> 1, sy = ay >> 1, c = px(sx, sy); if (c < 0) continue;
      var r = c >> 16 & 255, g = c >> 8 & 255, b = c & 255, f = 0;
      if (!(ax & 1) && px(sx - 1, sy) !== c) f += 0.16;
      if (!(ay & 1) && px(sx, sy - 1) !== c) f += 0.18;
      if ((ax & 1) && px(sx + 1, sy) !== c) f -= 0.2;
      if ((ay & 1) && px(sx, sy + 1) !== c) f -= 0.24;
      f += (Hh(ax, ay, 7) - 0.5) * 0.07;
      if (f > 0) { r += (255 - r) * f; g += (244 - g) * f; b += (210 - b) * f * 0.8; } else { r += (20 - r) * -f; g += (10 - g) * -f; b += (34 - b) * -f; }
      var i = ((ay + 1) * W2 + ax + 1) * 4; d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255;
    }
    out.g.putImageData(od, 0, 0);
    contornar(out);
    return out;
  }

  var S = BSI.sprites = {
    hdLigado: hdLigado, relevo2x: relevo2x,
    // Boneco humano: 4 direções x 3 quadros
    humano: function (chave, def) {
      if (cache[chave]) return cache[chave];
      var W = 16, H = 19;
      var spr = { w: W, h: H, ox: 8, oy: 16, dirs: {}, branco: {} };
      ['down', 'up', 'left'].forEach(function (dir) {
        spr.dirs[dir] = [];
        for (var q = 0; q < 3; q++) {
          var cv = novoCanvas(W, H);
          cv.g.save(); cv.g.translate(0, 1);
          BSI.painter.humano(cv.g, def, dir, q);
          cv.g.restore();
          contornar(cv, def.contorno);
          spr.dirs[dir].push(cv.c);
        }
      });
      spr.dirs.right = spr.dirs.left.map(function (c) { var t = novoCanvas(W, H); t.g.drawImage(c, 0, 0); return espelhar(t); });
      spr.vermelho = {};
      for (var d in spr.dirs) {
        spr.branco[d] = spr.dirs[d].map(function (c) { return silhueta(c); });
        spr.vermelho[d] = spr.dirs[d].map(function (c) { return silhueta(c, BSI.acess ? BSI.acess.corAviso() : '#e8403a'); });
      }
      // retrato: recorte da cabeça de frente
      var rt = novoCanvas(16, 13);
      rt.g.drawImage(spr.dirs.down[0], 0, 0, 16, 13, 0, 0, 16, 13);
      spr.retrato = rt.c;
      cache[chave] = spr;
      return spr;
    },

    // Bicho: desenhado virado pra esquerda; gera "right" espelhado
    bicho: function (chave, fnPintar, W, H, ox, oy) {
      if (cache[chave]) return cache[chave];
      if (hdLigado()) {
        var sh = { w: W * 2 + 2, h: H * 2 + 2, ox: ox * 2 + 1, oy: oy * 2 + 1, esc: 2, dirs: { left: [], right: [] }, branco: { left: [], right: [] }, vermelho: { left: [], right: [] } };
        var okHd = true;
        for (var q2 = 0; q2 < 3 && okHd; q2++) {
          var b1 = novoCanvas(W, H); fnPintar(b1.g, q2);
          var r2 = relevo2x(b1.c); if (!r2) { okHd = false; break; }
          sh.dirs.left.push(r2.c); sh.dirs.right.push(espelhar(r2));
        }
        if (okHd) {
          ['left', 'right'].forEach(function (d) { sh.branco[d] = sh.dirs[d].map(function (c) { return silhueta(c); }); sh.vermelho[d] = sh.dirs[d].map(function (c) { return silhueta(c, BSI.acess ? BSI.acess.corAviso() : '#e8403a'); }); });
          sh.retrato = sh.dirs.left[0]; sh.retratoEsc = 2;
          cache[chave] = sh;
          return sh;
        }
      }
      var spr = { w: W, h: H, ox: ox, oy: oy, dirs: { left: [], right: [] }, branco: { left: [], right: [] } };
      for (var q = 0; q < 3; q++) {
        var cv = novoCanvas(W + 2, H + 2);
        cv.g.save(); cv.g.translate(1, 1); fnPintar(cv.g, q); cv.g.restore();
        contornar(cv);
        spr.dirs.left.push(cv.c);
        spr.dirs.right.push(espelhar(cv));
      }
      spr.w = W + 2; spr.h = H + 2; spr.ox = ox + 1; spr.oy = oy + 1;
      ['left', 'right'].forEach(function (d) { spr.branco[d] = spr.dirs[d].map(function (c) { return silhueta(c); }); });
      var rt = novoCanvas(spr.w, spr.h); rt.g.drawImage(spr.dirs.left[0], 0, 0); spr.retrato = rt.c;
      cache[chave] = spr;
      return spr;
    },

    // Objeto parado (item, placa, moto)
    objeto: function (nome) {
      var k = 'obj:' + nome;
      if (cache[k]) return cache[k];
      var o = BSI.painter.objetos[nome];
      if (!o) return null;
      // o.hd: objeto que já tem desenho próprio em 2x (pinta direto em pixels de arte)
      if (hdLigado() && (o.hd || true)) {
        var base = novoCanvas(o.w, o.h);
        o.pintar(BSI.painter.P(base.g));
        var hd = o.hd ? (function () { var c2 = novoCanvas(o.w * 2 + 2, o.h * 2 + 2); c2.g.translate(1, 1); o.hd(BSI.painter.P(c2.g)); contornar(c2); return c2; })() : relevo2x(base.c);
        if (hd) {
          cache[k] = { c: hd.c, w: hd.c.width / 2, h: hd.c.height / 2, esc: 2, espelho: espelhar(hd) };
          return cache[k];
        }
      }
      var cv = novoCanvas(o.w + 2, o.h + 2);
      cv.g.save(); cv.g.translate(1, 1); o.pintar(BSI.painter.P(cv.g)); cv.g.restore();
      contornar(cv);
      cache[k] = { c: cv.c, w: o.w + 2, h: o.h + 2, espelho: null };
      cache[k].espelho = espelhar(cv);
      return cache[k];
    },

    // textura de luz (gradiente radial branco → transparente)
    luz: function () {
      if (cache.luz) return cache.luz;
      var cv = novoCanvas(128, 128);
      var gr = cv.g.createRadialGradient(64, 64, 0, 64, 64, 64);
      gr.addColorStop(0, 'rgba(255,255,255,1)');
      gr.addColorStop(0.45, 'rgba(255,255,255,0.85)');
      gr.addColorStop(0.75, 'rgba(255,255,255,0.35)');
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      cv.g.fillStyle = gr; cv.g.fillRect(0, 0, 128, 128);
      cache.luz = cv.c;
      return cv.c;
    },
    // brilho colorido (fogo, alma)
    brilho: function (cor) {
      var k = 'brilho:' + cor;
      if (cache[k]) return cache[k];
      var cv = novoCanvas(64, 64);
      var gr = cv.g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, cor); gr.addColorStop(1, 'rgba(0,0,0,0)');
      cv.g.fillStyle = gr; cv.g.fillRect(0, 0, 64, 64);
      cache[k] = cv.c;
      return cv.c;
    },

    novoCanvas: novoCanvas,
    limpar: function () { cache = {}; },
    // desenha objeto (1x ou 2x) com o tamanho lógico
    obj: function (g, o, x, y, espelho) { g.drawImage(espelho && o.espelho ? o.espelho : o.c, x, y, o.w, o.h); }
  };

  // Atalhos dos bichos
  S.peba = function () { return S.bicho('peba', BSI.painter.peba, 16, 9, 8, 7); };
  S.tatu = function () { return S.bicho('tatu', function (g, q) { BSI.painter.peba(g, q, { casco: '#7a6a5c', cascoE: '#5a4a3e', cascoC: '#9a8a7a' }); }, 16, 9, 8, 7); };
  S.bode = function () { return S.bicho('bode', BSI.painter.bode, 17, 16, 9, 14); };
  S.moco = function () { return S.bicho('moco', BSI.painter.moco, 11, 7, 6, 6); };
  S.avoante = function () { return S.bicho('avoante', BSI.painter.avoante, 9, 7, 5, 6); };
  S.boi = function () { return S.bicho('boi', BSI.painter.boi, 23, 16, 12, 14); };
  S.trovao = function () { return S.bicho('trovao', function (g, q) { BSI.painter.cachorro(g, q, '#5a3a24', '#3a2414'); }, 15, 11, 8, 10); };
  S.piaba = function () { return S.bicho('piaba', function (g, q) { BSI.painter.cachorro(g, q, '#c8904a', '#9a6a30'); }, 15, 11, 8, 10); };
})();
