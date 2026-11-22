/* =========================================================
   telas_extra.js — cartela de capítulo (capa de cordel) e o
   Caderno de Pistas.
   ========================================================= */
(function () {
  'use strict';
  var C = BSI.cor, Tx = BSI.texto;

  // ---------------- CARTELA DE CAPÍTULO ----------------
  function Cartela(ato, titulo, sub) {
    this.ato = ato; this.titulo = titulo; this.sub = sub;
    this.t = 0; this.dur = 4.2;
    BSI.audio.sfx('salvar');
  }
  Cartela.prototype.telaCheia = true;
  Cartela.prototype.atualizar = function (dt) {
    this.t += dt;
    if (this.t > 0.8 && (BSI.input.confirmou() || BSI.input.toque)) this.t = Math.max(this.t, this.dur - 0.4);
    if (this.t >= this.dur) BSI.jogo.fecharModal();
  };
  Cartela.prototype.alfa = function () { return Math.min(1, this.t * 3, (this.dur - this.t) * 3); };
  Cartela.prototype.desenhar = function (g) {
    var W = BSI.view.w, H = BSI.view.h, a = this.alfa();
    g.globalAlpha = 1; g.fillStyle = '#120c1c'; g.fillRect(0, 0, W, H);
    g.globalAlpha = Math.max(0, a);
    var mw = Math.min(W - 16, 260), mh = Math.min(H - 24, 150);
    var x = Math.round(W / 2 - mw / 2), y = Math.round(H / 2 - mh / 2);
    BSI.telas.moldura(g, x, y, mw, mh);
    // xilogravura: sol do sertão e mandacarus
    var cx = Math.round(W / 2), sy = y + 18;
    g.fillStyle = C.contorno;
    for (var r = -6; r <= 6; r++) { var w = Math.round(Math.sqrt(36 - r * r)); g.fillRect(cx - w, sy + r, w * 2, 1); }
    for (var k = 0; k < 12; k++) { var an = k / 12 * Math.PI * 2; g.fillRect(Math.round(cx + Math.cos(an) * 9), Math.round(sy + Math.sin(an) * 9), 2, 2); }
    g.fillStyle = '#e8d8b0'; g.fillRect(cx - 2, sy - 1, 2, 2); g.fillRect(cx + 2, sy - 1, 2, 2); g.fillRect(cx - 2, sy + 3, 6, 1);
    g.fillStyle = C.contorno;
    [x + 18, x + mw - 26].forEach(function (mx) {
      var by = y + mh - 10;
      g.fillRect(mx + 3, by - 22, 3, 22); g.fillRect(mx - 1, by - 15, 3, 8); g.fillRect(mx - 1, by - 9, 5, 2); g.fillRect(mx + 7, by - 18, 3, 8); g.fillRect(mx + 5, by - 12, 4, 2);
    });
    g.fillRect(x + 6, y + mh - 10, mw - 12, 2);
    g.globalAlpha = 1;
  };
  Cartela.prototype.desenharTexto = function () {
    var W = BSI.view.w, H = BSI.view.h, a = Math.max(0, this.alfa());
    var mh = Math.min(H - 24, 150), y = Math.round(H / 2 - mh / 2);
    Tx.escrever(this.ato, W / 2, y + 32, { tam: 9, alinhar: 'center', cordel: true, cor: C.barro, contorno: false, alfa: a });
    var tam = Math.min(17, Math.floor((Math.min(W - 16, 260) - 24) / (this.titulo.length * 0.55)));
    var linhas = Tx.quebrar(this.titulo.toUpperCase(), Math.min(W - 16, 260) - 24, tam, true);
    linhas.forEach(function (l, i) { Tx.escrever(l, W / 2, y + 46 + i * (tam + 2), { tam: tam, alinhar: 'center', cordel: true, cor: C.contorno, contorno: false, alfa: a }); });
    if (this.sub) Tx.escrever(this.sub, W / 2, y + 50 + linhas.length * (tam + 2), { tam: 7, alinhar: 'center', cor: '#5a4030', contorno: false, negrito: false, alfa: a });
  };

  // ---------------- CADERNO DE PISTAS ----------------
  function Caderno() { this.ini = 0; }
  Caderno.prototype.telaCheia = true;
  Caderno.prototype.lista = function () {
    var S = BSI.state;
    return (S.pistas || []).map(function (id) { return BSI.data.pistas[id]; }).filter(Boolean);
  };
  Caderno.prototype.atualizar = function () {
    var I = BSI.input, n = this.lista().length;
    if (I.apertou('baixo')) this.ini = Math.min(Math.max(0, n - 1), this.ini + 1);
    if (I.apertou('cima')) this.ini = Math.max(0, this.ini - 1);
    if (I.apertou('pausa') || I.confirmou() || I.toque) { BSI.audio.sfx('menu'); BSI.jogo.abrirModal(BSI.jogo.pausa()); }
  };
  Caderno.prototype.desenhar = function (g) {
    var W = BSI.view.w, H = BSI.view.h;
    g.fillStyle = 'rgba(10,6,20,0.85)'; g.fillRect(0, 0, W, H);
    var x = 8, y = 8, w = W - 16, h = H - 16;
    g.fillStyle = C.contorno; g.fillRect(x, y, w, h);
    g.fillStyle = '#e8dcc0'; g.fillRect(x + 2, y + 2, w - 4, h - 4);
    g.fillStyle = '#c8b898';
    for (var ly = y + 24; ly < y + h - 4; ly += 9) g.fillRect(x + 4, ly, w - 8, 1);
    g.fillStyle = '#c45a4a'; g.fillRect(x + 18, y + 2, 1, h - 4);
  };
  Caderno.prototype.desenharTexto = function () {
    var W = BSI.view.w, H = BSI.view.h, lista = this.lista(), x = 30, y = 12;
    Tx.escrever('CADERNO DE PISTAS', W / 2, y, { tam: 10, alinhar: 'center', cordel: true, cor: C.contorno, contorno: false });
    y += 16;
    if (!lista.length) { Tx.escrever('Nenhuma pista ainda. Fale com tudo e com todos.', x, y, { tam: 7, cor: '#3a2a20', contorno: false, negrito: false }); return; }
    for (var i = this.ini; i < lista.length && y < H - 20; i++) {
      var p = lista[i];
      Tx.escrever('• ' + p.titulo, x, y, { tam: 7, cor: '#2a1a40', contorno: false });
      y += 9;
      Tx.quebrar(p.texto, W - x - 18, 6.5, false).forEach(function (l) {
        if (y < H - 20) Tx.escrever(l, x + 6, y, { tam: 6.5, cor: '#3a2a20', contorno: false, negrito: false });
        y += 8;
      });
      y += 3;
    }
    Tx.escrever('(' + lista.length + ' pista' + (lista.length > 1 ? 's' : '') + ')  ↑↓ rolar', W - 14, H - 18, { tam: 6, alinhar: 'right', cor: '#5a4030', contorno: false });
  };

  BSI.Cartela = Cartela;
  BSI.Caderno = Caderno;
})();
