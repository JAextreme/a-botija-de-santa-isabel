/* =========================================================
   tilemap.js — transforma o texto do mapa (linhas de caracteres)
   numa grade de tiles e pré-desenha tudo num canvas grande.
   Quando um tile muda (fogo queimou o mato), só ele é redesenhado.
   ========================================================= */
(function () {
  'use strict';
  var T = BSI.cfg.TILE;

  function Mapa(id) {
    var dados = BSI.data.maps[id];
    if (!dados) throw new Error('Mapa inexistente: ' + id);
    this.id = id;
    this.dados = dados;
    this.h = dados.linhas.length;
    this.w = 0;
    for (var i = 0; i < this.h; i++) this.w = Math.max(this.w, dados.linhas[i].length);
    this.grade = new Array(this.w * this.h);
    this.revelado = {}; // passagens secretas já reveladas
    for (var y = 0; y < this.h; y++) {
      var lin = dados.linhas[y];
      for (var x = 0; x < this.w; x++) {
        var ch = lin[x] || 'P';
        if (!BSI.tiles.defs[ch]) ch = '.';
        this.grade[y * this.w + x] = ch;
      }
    }
    // cenário em alta (32x32 de arte por tile) quando o navegador deixa
    this.esc = BSI.tilesHD && BSI.tilesHD.ok ? 2 : 1;
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.w * T * this.esc;
    this.canvas.height = this.h * T * this.esc;
    this.g = this.canvas.getContext('2d');
    this.g.imageSmoothingEnabled = false;
    this.redesenharTudo();
    this.montarAltos();
  }

  Mapa.prototype.ch = function (tx, ty) {
    if (tx < 0 || ty < 0 || tx >= this.w || ty >= this.h) return null;
    return this.grade[ty * this.w + tx];
  };
  Mapa.prototype.def = function (tx, ty) {
    var c = this.ch(tx, ty);
    return c ? BSI.tiles.defs[c] : null;
  };
  // fora do mapa conta como parede
  Mapa.prototype.solido = function (tx, ty) {
    var d = this.def(tx, ty);
    if (!d) return true;
    if (d.segredo) return !this.revelado[ty * this.w + tx] && true;
    return d.solido;
  };
  Mapa.prototype.opaco = function (tx, ty) {
    var d = this.def(tx, ty);
    return !d || d.opaco;
  };
  Mapa.prototype.solidoPx = function (px, py) { return this.solido(Math.floor(px / T), Math.floor(py / T)); };
  // tiro passa por cima de água e mato, mas para em pedra, parede, árvore, cacto, cerca
  Mapa.prototype.bloqueiaTiroPx = function (px, py) {
    var tx = Math.floor(px / T), ty = Math.floor(py / T), d = this.def(tx, ty);
    if (!d) return true;
    if (d.passaTiro) return false;
    return this.solido(tx, ty);
  };

  Mapa.prototype.trocar = function (tx, ty, ch) {
    if (this.ch(tx, ty) === null) return;
    this.grade[ty * this.w + tx] = ch;
    // o acabamento olha os vizinhos: redesenha a volta toda
    for (var y = ty - 1; y <= ty + 1; y++) for (var x = tx - 1; x <= tx + 1; x++) if (this.ch(x, y) !== null) this.desenharTile(x, y);
    this.montarAltos();
    if (BSI.minimapa) BSI.minimapa.sujar();
  };
  // coisas altas (copa, mandacaru, beiral) que entram na ordem de profundidade
  Mapa.prototype.montarAltos = function () {
    this.altos = [];
    if (!BSI.Alto) return;
    for (var y = 0; y < this.h; y++) for (var x = 0; x < this.w; x++) {
      var d = this.def(x, y);
      if (!d || !d.alto) continue;
      if (d.alto === 'beiral' || d.alto === 'cornija') {
        if (this.dados.semTelhado) continue;
        var c = this.def(x, y - 1);
        if (c && (c.alto === 'beiral' || c.alto === 'cornija' || c.ch === 'p')) continue; // só na beirada de cima
      }
      this.altos.push(new BSI.Alto(d.alto, x, y));
    }
  };

  Mapa.prototype.desenharTile = function (tx, ty) {
    var d = this.def(tx, ty);
    if (!d) return;
    BSI.tiles._mapaAtual = this;
    if (this.esc === 2) { BSI.tilesHD.pintar(this, this.g, tx, ty); return; }
    this.g.clearRect(tx * T, ty * T, T, T);
    if (d.segredo && this.revelado[ty * this.w + tx]) BSI.tiles.defs['^'].desenhar(this.g, tx * T, ty * T, tx, ty);
    else d.desenhar(this.g, tx * T, ty * T, tx, ty);
    if (BSI.tiles.acabamento) BSI.tiles.acabamento(this, this.g, tx, ty);
  };
  Mapa.prototype.redesenharTudo = function () {
    BSI.tiles._mapaAtual = this; // alguns tiles olham os vizinhos (linha de cal, beirada da grota)
    for (var y = 0; y < this.h; y++) for (var x = 0; x < this.w; x++) this.desenharTile(x, y);
  };

  // Vander revela passagens escondidas perto dele
  Mapa.prototype.revelarSegredos = function (px, py, raio) {
    var n = 0, r = Math.ceil(raio / T), cx = Math.floor(px / T), cy = Math.floor(py / T);
    for (var y = cy - r; y <= cy + r; y++) for (var x = cx - r; x <= cx + r; x++) {
      var d = this.def(x, y);
      if (d && d.segredo && !this.revelado[y * this.w + x]) {
        this.revelado[y * this.w + x] = true; this.desenharTile(x, y); n++;
      }
    }
    return n;
  };

  // procura o ponto livre mais próximo (renascer, teletransporte)
  Mapa.prototype.pontoLivre = function (px, py, hw, hh) {
    var e = { x: px, y: py, hw: hw || 4, hh: hh || 3 };
    if (!BSI.colisao.tocaSolido(e, this, px, py)) return { x: px, y: py };
    for (var r = 4; r < 200; r += 4) {
      for (var a = 0; a < 16; a++) {
        var x = px + Math.cos(a / 16 * Math.PI * 2) * r, y = py + Math.sin(a / 16 * Math.PI * 2) * r;
        if (!BSI.colisao.tocaSolido(e, this, x, y)) return { x: x, y: y };
      }
    }
    return { x: px, y: py };
  };

  BSI.Mapa = Mapa;
})();
