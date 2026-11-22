/* =========================================================
   finais.js (MOTOR) — escolhe o final, toca a cena, mostra a
   cartela e os créditos, e anota os finais já vistos (ficam
   guardados mesmo começando um jogo novo).
   ========================================================= */
(function () {
  'use strict';
  var C = BSI.cor, Tx = BSI.texto;

  var F = BSI.finais = {
    // qual final? (o primeiro da lista cuja condição bate)
    escolher: function (S) {
      var l = BSI.data.finais;
      for (var i = 0; i < l.length; i++) if (l[i].teste(S)) return l[i];
      return l[l.length - 1];
    },
    vistos: function () { var c = BSI.save.cfg(); return c.finais || {}; },
    marcarVisto: function (id) { var c = BSI.save.cfg(); c.finais = c.finais || {}; c.finais[id] = true; BSI.save.salvarCfg(c); },

    // toca o final inteiro (chamado depois da última luta)
    tocar: function (m) {
      var S = BSI.state;
      if ((S.stats.queimados || 0) >= 150) BSI.story.flag('daniel_descontrolado');
      var fim = F.escolher(S);
      S.final = fim.id;
      BSI.story.flag('jogo_zerado');
      F.marcarVisto(fim.id);
      BSI.roteiro.rodar([
        ['fala', 'final_' + fim.id],
        ['cartela', 'FIM', fim.nome, fim.frase],
        ['faz', function () { BSI.jogo.salvar(); if (BSI.conquistas) BSI.conquistas.checar(); BSI.jogo.abrirModal(BSI.Estatisticas ? new BSI.Estatisticas(fim) : new Creditos(fim)); }]
      ]);
    }
  };

  // ---------------- CRÉDITOS (folheto de cordel rolando) ----------------
  // fim: o final que acabou de tocar (ou null) · doMenu: aberto pelo menu do título
  function Creditos(fim, doMenu) { this.fim = fim; this.doMenu = !!doMenu; this.t = 0; this.y = BSI.view.h + 10; this.saindo = false; }
  Creditos.prototype.telaCheia = true;
  function passo(c) { return c[1] === 'titulo' ? 20 : (c[1] === 'autor' ? 22 : (c[1] === 'secao' ? 14 : (c[1] === 'verso' ? 10 : 11))); }
  Creditos.prototype.altura = function () { var h = 60; BSI.data.creditos.forEach(function (c) { h += passo(c); }); return h; };
  Creditos.prototype.sair = function () {
    if (this.saindo) return;
    this.saindo = true;
    if (this.doMenu) { BSI.audio.sfx('menu'); BSI.jogo.fecharModal(); return; }
    BSI.jogo.fecharModal();
    BSI.jogo.fadeOut(function () { BSI.jogo.mundo = null; BSI.jogo.criarMenuTitulo(); }, 0.6);
  };
  Creditos.prototype.atualizar = function (dt) {
    this.t += dt;
    var I = BSI.input;
    this.y -= dt * (I.segurando('ataque') || I.segurando('confirmar') || I.mouse.segurando ? 110 : 24);
    if (this.y < -this.altura() || (this.t > 1 && I.apertou('pausa'))) this.sair();
  };
  Creditos.prototype.coluna = function () { var W = BSI.view.w, w = Math.min(W - 24, 290); return { x: Math.round(W / 2 - w / 2), w: w }; };
  Creditos.prototype.desenhar = function (g) {
    var W = BSI.view.w, H = BSI.view.h, col = this.coluna();
    BSI.telas.fundoTitulo(g, this.t);
    g.fillStyle = 'rgba(10,6,20,0.55)'; g.fillRect(0, 0, W, H);
    // a folha do folheto: papel de cordel com borda de xilogravura
    g.fillStyle = '#2a1a10'; g.fillRect(col.x - 3, 0, col.w + 6, H);
    g.fillStyle = '#e6d6ae'; g.fillRect(col.x, 0, col.w, H);
    g.fillStyle = '#d8c69a'; for (var y = (Math.floor(this.y) % 7 + 7) % 7; y < H; y += 7) g.fillRect(col.x + 2, y, col.w - 4, 1); // fibra do papel
    g.fillStyle = '#2a1a10';
    for (var k = (Math.floor(this.y) % 8 + 8) % 8; k < H; k += 8) { g.fillRect(col.x + 3, k, 2, 4); g.fillRect(col.x + col.w - 5, k, 2, 4); }
    g.fillStyle = 'rgba(18,10,22,0.92)'; g.fillRect(0, H - 15, W, 15); // faixa da dica, por cima do papel
  };
  Creditos.prototype.desenharTexto = function () {
    var W = BSI.view.w, H = BSI.view.h, y = this.y, col = this.coluna(), tinta = '#2a1a10';
    BSI.data.creditos.forEach(function (c) {
      if (y > -24 && y < H - 18) {
        var op;
        if (c[1] === 'titulo') op = { tam: 12, cordel: true, cor: '#8a2a1a', contorno: false };
        else if (c[1] === 'secao') op = { tam: 8, cordel: true, cor: '#6a3a1a', contorno: false };
        else if (c[1] === 'autor') op = { tam: 15, cordel: true, cor: '#8a2a1a', contorno: false };
        else if (c[1] === 'verso') op = { tam: 7, cor: '#4a2a14', contorno: false, negrito: false };
        else op = { tam: 6.5, cor: tinta, contorno: false, negrito: false };
        op.alinhar = 'center';
        var linhas = Tx.quebrar(c[0], col.w - 20, op.tam);
        linhas.forEach(function (l, i) { Tx.escrever(l, W / 2, y + i * (op.tam + 2), op); });
        if (c[1] === 'secao' && BSI.uctx) { var u = BSI.uctx; u.fillStyle = '#6a3a1a'; u.fillRect(W / 2 - 30, y - 3, 60, 1); }
      }
      y += passo(c);
    });
    if (this.fim) {
      var vistos = Object.keys(F.vistos()).length;
      Tx.escrever('Seu final: ' + this.fim.nome, W / 2, y + 14, { tam: 7, alinhar: 'center', cor: '#2a5a1a', contorno: false });
      Tx.escrever('Finais descobertos: ' + vistos + '/' + BSI.data.finais.length, W / 2, y + 24, { tam: 6.5, alinhar: 'center', cor: '#2a5a1a', contorno: false });
    }
    Tx.escrever('(segure ATACAR pra acelerar · Esc sai)', W / 2, H - 9, { tam: 5.5, alinhar: 'center', cor: '#c8bca0' });
  };
  BSI.Creditos = Creditos;
})();
