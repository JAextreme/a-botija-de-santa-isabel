/* =========================================================
   menus.js — tela de título (estilo capa de cordel), pausa e
   confirmação. Navega com setas/analógico, confirma com
   Espaço/Enter/J/A, ou toca direto na opção.
   ========================================================= */
(function () {
  'use strict';
  var C = BSI.cor, Tx = BSI.texto, U = BSI.util;

  // ---------- menu genérico ----------
  // itens: [{ txt: string|fn, acao: fn, ativo: fn? }]
  function Menu(itens, op) {
    this.itens = itens;
    this.sel = 0;
    this.op = op || {};
    this.ajustarSel(1);
  }
  Menu.prototype.ativo = function (i) { var it = this.itens[i]; return !it.ativo || it.ativo(); };
  Menu.prototype.ajustarSel = function (passo) {
    for (var k = 0; k < this.itens.length; k++) { if (this.ativo(this.sel)) return; this.sel = (this.sel + passo + this.itens.length) % this.itens.length; }
  };
  Menu.prototype.texto = function (i) { var t = this.itens[i].txt; return typeof t === 'function' ? t() : t; };
  Menu.prototype.geometria = function (i) {
    var W = BSI.view.w, alt = this.op.alt || 14;
    var y0 = typeof this.op.y === 'function' ? this.op.y() : this.op.y;
    var w = this.op.larg || 150;
    return { x: W / 2 - w / 2, y: y0 + i * alt, w: w, h: alt - 2 };
  };
  Menu.prototype.atualizar = function () {
    var I = BSI.input, n = this.itens.length;
    if (I.apertou('cima')) { this.sel = (this.sel - 1 + n) % n; this.ajustarSel(-1); BSI.audio.sfx('menu'); }
    if (I.apertou('baixo')) { this.sel = (this.sel + 1) % n; this.ajustarSel(1); BSI.audio.sfx('menu'); }
    if (I.toque) {
      for (var i = 0; i < n; i++) {
        var gm = this.geometria(i);
        if (I.toque.x >= gm.x && I.toque.x <= gm.x + gm.w && I.toque.y >= gm.y && I.toque.y <= gm.y + gm.h && this.ativo(i)) {
          this.sel = i; this.escolher(); return;
        }
      }
    }
    if (I.confirmou()) this.escolher();
  };
  Menu.prototype.escolher = function () {
    if (!this.ativo(this.sel)) return;
    BSI.audio.sfx('confirma');
    this.itens[this.sel].acao();
  };
  Menu.prototype.desenhar = function (g) {
    for (var i = 0; i < this.itens.length; i++) {
      var gm = this.geometria(i), sel = i === this.sel;
      if (BSI.cordel && BSI.view.det > 1) { BSI.cordel.caixa(g, gm.x, gm.y, gm.w, gm.h, sel ? '#d39b3a' : 'rgba(20,12,24,0.88)', sel); continue; }
      g.fillStyle = sel ? C.ocre : 'rgba(20,12,24,0.75)'; g.fillRect(gm.x, gm.y, gm.w, gm.h);
      g.fillStyle = sel ? C.amarelo : 'rgba(90,70,60,0.8)'; g.fillRect(gm.x, gm.y, gm.w, 1); g.fillRect(gm.x, gm.y + gm.h - 1, gm.w, 1);
    }
  };
  Menu.prototype.desenharTexto = function () {
    for (var i = 0; i < this.itens.length; i++) {
      var gm = this.geometria(i), sel = i === this.sel, at = this.ativo(i);
      Tx.escrever(this.texto(i), gm.x + gm.w / 2, gm.y + 2, { tam: 8, alinhar: 'center', cor: !at ? '#6a5a50' : (sel ? C.contorno : C.creme), contorno: !sel });
    }
  };
  BSI.Menu = Menu;

  // ---------- fundo da tela de título ----------
  var estrelas = [];
  for (var i = 0; i < 70; i++) estrelas.push({ x: Math.random(), y: Math.random() * 0.6, f: Math.random() * 6 });

  function serra(g, W, base, alt, cor, sem) {
    g.fillStyle = cor;
    for (var x = 0; x < W; x++) {
      var h = Math.sin(x * 0.013 + sem) * alt * 0.5 + Math.sin(x * 0.041 + sem * 2) * alt * 0.25 + alt * 0.6;
      g.fillRect(x, Math.round(base - h), 1, Math.round(h) + 200);
    }
  }
  function mandacaru(g, x, y, s, cor) {
    g.fillStyle = cor;
    g.fillRect(x, y - 22 * s, 4 * s, 22 * s);
    g.fillRect(x - 5 * s, y - 15 * s, 3 * s, 8 * s); g.fillRect(x - 5 * s, y - 9 * s, 5 * s, 3 * s);
    g.fillRect(x + 6 * s, y - 18 * s, 3 * s, 8 * s); g.fillRect(x + 4 * s, y - 12 * s, 5 * s, 3 * s);
  }

  BSI.telas = {
    fundoTitulo: function (g, t) {
      if (BSI.cordel && BSI.view.det > 1) { BSI.cordel.titulo(g, t); return; } // cena animada em alta
      var W = BSI.view.w, H = BSI.view.h;
      // céu em faixas (estilo pixel)
      var faixas = ['#0d0a1c', '#141030', '#1b1638', '#2a1a40', '#3a1e3e', '#5a2a3a', '#8a3a30', '#c4562a'];
      var hf = Math.ceil(H * 0.75 / faixas.length);
      faixas.forEach(function (c, i) { g.fillStyle = c; g.fillRect(0, i * hf, W, hf); });
      estrelas.forEach(function (e) {
        var b = 0.5 + Math.sin(t * 2 + e.f) * 0.5;
        g.fillStyle = 'rgba(244,236,208,' + b.toFixed(2) + ')';
        g.fillRect(Math.round(e.x * W), Math.round(e.y * H), 1, 1);
      });
      // lua cheia
      var lx = Math.round(W * 0.78), ly = Math.round(H * 0.2);
      g.fillStyle = 'rgba(244,236,208,0.15)'; g.fillRect(lx - 16, ly - 16, 32, 32);
      g.fillStyle = C.lua;
      for (var r = -11; r <= 11; r++) { var w = Math.round(Math.sqrt(121 - r * r)); g.fillRect(lx - w, ly + r, w * 2, 1); }
      g.fillStyle = '#d8d0b0'; g.fillRect(lx - 4, ly - 3, 3, 3); g.fillRect(lx + 3, ly + 4, 2, 2);
      // luzes estranhas no céu (igual às histórias de Quixadá)
      for (var k = 0; k < 3; k++) {
        var ox = (W * 0.15 + k * 40 + Math.sin(t * 0.7 + k) * 30) | 0, oy = (H * 0.15 + Math.cos(t * 0.9 + k * 2) * 10) | 0;
        g.fillStyle = 'rgba(160,255,220,' + (0.5 + Math.sin(t * 5 + k) * 0.4).toFixed(2) + ')';
        g.fillRect(ox, oy, 2, 2);
      }
      serra(g, W, H * 0.72, H * 0.28, '#2a1830', 1.3);
      serra(g, W, H * 0.8, H * 0.18, '#1d1226', 4.1);
      // igrejinha da padroeira
      var ix = Math.round(W * 0.2), iy = Math.round(H * 0.8);
      g.fillStyle = '#140c1c';
      g.fillRect(ix, iy - 18, 20, 18); g.fillRect(ix + 7, iy - 30, 6, 12); g.fillRect(ix + 9, iy - 35, 2, 5); g.fillRect(ix + 7, iy - 33, 6, 1);
      g.fillStyle = '#f0c75e'; g.fillRect(ix + 9, iy - 10, 2, 4);
      mandacaru(g, Math.round(W * 0.62), Math.round(H * 0.86), 1, '#120a18');
      mandacaru(g, Math.round(W * 0.9), Math.round(H * 0.9), 1, '#120a18');
      g.fillStyle = '#120a18'; g.fillRect(0, Math.round(H * 0.86), W, H);
    },

    // moldura de xilogravura no título
    moldura: function (g, x, y, w, h) {
      g.fillStyle = C.contorno; g.fillRect(x, y, w, h);
      g.fillStyle = C.creme; g.fillRect(x + 2, y + 2, w - 4, h - 4);
      g.fillStyle = C.contorno; g.fillRect(x + 4, y + 4, w - 8, h - 8);
      g.fillStyle = '#e8d8b0'; g.fillRect(x + 5, y + 5, w - 10, h - 10);
      // dentinhos da borda
      g.fillStyle = C.contorno;
      for (var i = x + 8; i < x + w - 8; i += 4) { g.fillRect(i, y + 5, 2, 2); g.fillRect(i, y + h - 7, 2, 2); }
    }
  };
})();
