/* =========================================================
   minigames.js — minigames rápidos.
   Protótipo: WEB NAMORADA do Helano (teste de ESPERTEZA).
   Chega mensagem no celular; o jogador tem 2 segundos para
   DESLIZAR na direção mostrada (seta/WASD, dedo ou analógico).
   Falhou = Lapuca fica parado digitando, vulnerável.
   ========================================================= */
(function () {
  'use strict';
  var C = BSI.cor, Tx = BSI.texto;
  var SETAS = { cima: '↑', baixo: '↓', esq: '←', dir: '→' };

  function WebNamorada(h, mundo, aoFim, msg) {
    this.h = h; this.mundo = mundo; this.aoFim = aoFim || null;
    this.msg = msg || BSI.rng.pick(BSI.data.webNamoradas);
    this.dir = BSI.rng.pick(['cima', 'baixo', 'esq', 'dir']);
    this.tempo = 2.0; this.total = 2.0;
    this.fim = 0; this.resultado = null;
    BSI.audio.sfx('celular');
  }
  WebNamorada.prototype.atualizar = function (dt) {
    if (this.resultado) {
      this.fim -= dt;
      if (this.fim <= 0) { BSI.jogo.fecharModal(); if (this.aoFim) { var cb = this.aoFim; this.aoFim = null; cb(this.resultado === 'ok'); } }
      return;
    }
    this.tempo -= dt;
    var I = BSI.input, apertou = null;
    ['cima', 'baixo', 'esq', 'dir'].forEach(function (d) { if (I.apertou(d)) apertou = d; });
    if (I.deslize) apertou = I.deslize;
    if (apertou) this.terminar(apertou === this.dir);
    else if (this.tempo <= 0) this.terminar(false);
  };
  WebNamorada.prototype.terminar = function (ok) {
    this.resultado = ok ? 'ok' : 'falhou';
    this.fim = 1.0;
    if (ok) {
      BSI.audio.sfx('confirma');
      BSI.hud.aviso('Lapuca deixou no vácuo. Profeta firme.', '#9fe0a0');
    } else {
      BSI.audio.sfx('falha');
      this.h.st.digitando = 4;
      BSI.state.stats.golpes = (BSI.state.stats.golpes || 0) + 1;
      BSI.hud.aviso('Lapuca caiu no papo da ' + this.msg.de + '...', '#ff9a7a');
      this.mundo.falar(this.h, 'Só vou responder rapidinho...', 2);
    }
  };
  WebNamorada.prototype.desenhar = function (g) {
    var W = BSI.view.w, H = BSI.view.h;
    g.fillStyle = 'rgba(10,6,20,0.55)'; g.fillRect(0, 0, W, H);
    // celular
    var cw = 96, ch = 128, x = Math.round(W / 2 - cw / 2), y = Math.round(H / 2 - ch / 2);
    if (this.resultado === 'ok') x += Math.round((1 - this.fim) * ({ esq: -200, dir: 200 }[this.dir] || 0)), y += Math.round((1 - this.fim) * ({ cima: -200, baixo: 200 }[this.dir] || 0));
    g.fillStyle = C.contorno; g.fillRect(x - 2, y - 2, cw + 4, ch + 4);
    g.fillStyle = '#2a2a33'; g.fillRect(x, y, cw, ch);
    g.fillStyle = '#e8eef6'; g.fillRect(x + 4, y + 10, cw - 8, ch - 20);
    g.fillStyle = '#3b8a5a'; g.fillRect(x + 4, y + 10, cw - 8, 14);
    g.fillStyle = '#d0f0d0'; g.fillRect(x + 8, y + 34, cw - 22, 30);
    // barra de tempo
    if (!this.resultado) {
      var f = Math.max(0, this.tempo / this.total);
      g.fillStyle = C.contorno; g.fillRect(x + 4, y + ch - 24, cw - 8, 6);
      g.fillStyle = f > 0.4 ? C.amarelo : C.barro; g.fillRect(x + 5, y + ch - 23, Math.round((cw - 10) * f), 4);
    }
  };
  WebNamorada.prototype.desenharTexto = function () {
    var W = BSI.view.w, H = BSI.view.h;
    var cw = 96, ch = 128, x = Math.round(W / 2 - cw / 2), y = Math.round(H / 2 - ch / 2);
    if (this.resultado === 'ok') { Tx.escrever('IGNORADA!', W / 2, y + ch / 2, { tam: 12, alinhar: 'center', cor: '#9fe0a0', cordel: true }); return; }
    if (this.resultado === 'falhou') { Tx.escrever('digitando...', W / 2, y + ch / 2, { tam: 11, alinhar: 'center', cor: '#ff9a7a', cordel: true }); return; }
    Tx.escrever(this.msg.de, x + 8, y + 13, { tam: 6.5, cor: '#ffffff' });
    var linhas = Tx.quebrar(this.msg.msg, cw - 28, 6, false);
    linhas.slice(0, 4).forEach(function (l, i) { Tx.escrever(l, x + 10, y + 36 + i * 7, { tam: 6, negrito: false, cor: '#1a1018', contorno: false }); });
    Tx.escrever('DESLIZA PRA IGNORAR!', W / 2, y - 14, { tam: 9, alinhar: 'center', cor: C.amarelo });
    var pul = 1 + Math.sin(BSI.util.agora() / 80) * 0.1;
    Tx.escrever(SETAS[this.dir], W / 2, y + 70, { tam: Math.round(26 * pul), alinhar: 'center', cor: C.barro, grossura: 3 });
  };

  BSI.minigames = {
    webNamorada: function (h, mundo, aoFim, msg) {
      if (BSI.falasVivas && mundo) { var outro = mundo.herois.filter(function (o) { return o !== h && !o.caido; })[0]; if (outro) mundo.agendar(0.3, function () { BSI.falasVivas.reagir(mundo, 'web'); }, true); }
      BSI.jogo.abrirModal(new WebNamorada(h, mundo, aoFim, msg));
    }
  };
})();
