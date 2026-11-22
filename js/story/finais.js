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
        ['faz', function () { BSI.jogo.salvar(); BSI.jogo.abrirModal(new Creditos(fim)); }]
      ]);
    }
  };

  // ---------------- CRÉDITOS (rolando de baixo pra cima) ----------------
  function Creditos(fim) { this.fim = fim; this.t = 0; this.y = BSI.view.h + 10; this.saindo = false; }
  Creditos.prototype.telaCheia = true;
  Creditos.prototype.altura = function () { return BSI.data.creditos.length * 12 + 80; };
  Creditos.prototype.atualizar = function (dt) {
    this.t += dt;
    var I = BSI.input;
    this.y -= dt * (I.segurando('ataque') || I.segurando('confirmar') ? 90 : 22);
    var acabou = this.y < -this.altura();
    if (!this.saindo && (acabou || (this.t > 2 && I.apertou('pausa')))) {
      this.saindo = true;
      BSI.jogo.fecharModal();
      BSI.jogo.fadeOut(function () { BSI.jogo.mundo = null; BSI.jogo.criarMenuTitulo(); }, 0.6);
    }
  };
  Creditos.prototype.desenhar = function (g) {
    var W = BSI.view.w, H = BSI.view.h;
    BSI.telas.fundoTitulo(g, this.t);
    g.fillStyle = 'rgba(10,6,20,0.7)'; g.fillRect(0, 0, W, H);
  };
  Creditos.prototype.desenharTexto = function () {
    var W = BSI.view.w, H = BSI.view.h, y = this.y;
    BSI.data.creditos.forEach(function (c) {
      if (y > -20 && y < H + 10) {
        var op = c[1] === 'titulo' ? { tam: 12, cordel: true, cor: C.amarelo } : (c[1] === 'secao' ? { tam: 8, cor: C.barro, cordel: true } : { tam: 7, cor: C.creme, negrito: false });
        op.alinhar = 'center';
        Tx.escrever(c[0], W / 2, y, op);
      }
      y += c[1] === 'titulo' ? 18 : 12;
    });
    var vistos = Object.keys(F.vistos()).length;
    Tx.escrever('Seu final: ' + this.fim.nome + '   —   Finais descobertos: ' + vistos + '/' + BSI.data.finais.length, W / 2, y + 20, { tam: 7, alinhar: 'center', cor: '#9fe0a0' });
    Tx.escrever('(segure ATACAR pra acelerar, Esc pra sair)', W / 2, H - 10, { tam: 5.5, alinhar: 'center', cor: '#9a8a80' });
  };
  BSI.Creditos = Creditos;
})();
