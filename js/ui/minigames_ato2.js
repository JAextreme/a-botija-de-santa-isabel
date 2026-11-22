/* =========================================================
   minigames_ato2.js — CAVAR A BOTIJA (os três irmãos juntos)
   Davi, Gadernal e Diazepan cavam no mesmo ritmo. As pazadas
   descem nas três colunas; aperte ATACAR (ou toque) quando a
   pazada chegar na linha. 14 pazadas certas = botija!
   7 erros = a terra desmorona um pouco e recomeça a contagem
   (não tem como perder: só demora mais).
   ========================================================= */
(function () {
  'use strict';
  var C = BSI.cor, Tx = BSI.texto, I = BSI.input;
  var IRMAOS = ['davi', 'gadernal', 'diazepan'];

  function Cavar(aoFim) {
    this.aoFim = aoFim; this.t = 0; this.intro = 1.4;
    this.notas = []; this.tNota = 0; this.acertos = 0; this.erros = 0; this.meta = 14;
    this.msg = ''; this.tMsg = 0; this.fim = null; this.tFim = 0; this.terra = 0;
    this.sprs = IRMAOS.map(function (id) {
      var v = (BSI.data.personagens[id] || BSI.data.falantes[id]).visual;
      return BSI.sprites.humano((BSI.data.personagens[id] ? 'heroi:' : 'npc:') + id, v);
    });
  }
  Cavar.prototype.telaCheia = true;
  Cavar.prototype.terminar = function (ok) {
    if (this.fim) return;
    this.fim = { ok: ok }; this.tFim = 1.8;
    BSI.audio.sfx('gol');
  };
  Cavar.prototype.atualizar = function (dt) {
    this.t += dt;
    if (this.tMsg > 0) this.tMsg -= dt;
    if (this.fim) { this.tFim -= dt; if (this.tFim <= 0) { BSI.jogo.fecharModal(); this.aoFim(true); } return; }
    if (this.t < this.intro) return;
    var H = BSI.view.h, linha = H * 0.72, vel = 70;
    this.tNota -= dt;
    if (this.tNota <= 0) { this.tNota = 0.75; this.notas.push({ col: Math.floor(Math.random() * 3), y: 40 }); }
    for (var i = this.notas.length - 1; i >= 0; i--) {
      var n = this.notas[i];
      n.y += vel * dt;
      if (n.y > linha + 16) { this.notas.splice(i, 1); this.errar('Fora do ritmo!'); }
    }
    if (I.apertou('ataque') || I.apertou('confirmar') || I.apertou('interagir') || I.toque) {
      var melhor = -1, md = 999;
      this.notas.forEach(function (n, k) { var d = Math.abs(n.y - linha); if (d < md) { md = d; melhor = k; } });
      if (melhor >= 0 && md < 14) {
        this.notas.splice(melhor, 1); this.acertos++; this.terra = 0.3;
        this.msg = md < 6 ? 'JUNTOS!' : 'Boa!'; this.tMsg = 0.4;
        BSI.audio.sfx('soco');
        if (this.acertos >= this.meta) this.terminar(true);
      } else this.errar('Cada um cavou num tempo!');
    }
  };
  Cavar.prototype.errar = function (txt) {
    this.erros++; this.msg = txt; this.tMsg = 0.6; BSI.audio.sfx('estalo');
    if (this.erros >= 7) { this.erros = 0; this.acertos = Math.max(0, this.acertos - 5); this.msg = 'A TERRA DESMORONOU! De novo...'; this.tMsg = 1.2; BSI.audio.sfx('falha'); }
  };
  Cavar.prototype.desenhar = function (g) {
    var W = BSI.view.w, H = BSI.view.h, linha = Math.round(H * 0.72);
    g.fillStyle = '#1a1220'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#3a2a20'; g.fillRect(0, linha + 10, W, H);
    // buraco ficando mais fundo
    var prof = Math.round(this.acertos / this.meta * 30);
    g.fillStyle = '#1a1210'; g.fillRect(W / 2 - 40, linha + 14, 80, 6 + prof);
    if (this.fim) { var o = BSI.sprites.objeto('botija'); g.drawImage(o.c, W / 2 - 7, linha + 12 + prof - 10, o.w, o.h); }
    var lx = [W / 2 - 50, W / 2, W / 2 + 50];
    for (var c = 0; c < 3; c++) {
      g.fillStyle = 'rgba(242,230,201,0.08)'; g.fillRect(lx[c] - 12, 36, 24, linha - 30);
      g.fillStyle = C.amarelo; g.fillRect(lx[c] - 14, linha, 28, 2);
      // os irmãos (sobem e descem cavando)
      var s = this.sprs[c], pula = this.terra > 0 ? -3 : 0;
      var ks = 1.5 / (s.esc || 1);
      g.drawImage(s.dirs.down[this.terra > 0 ? 1 : 0], Math.round(lx[c] - s.ox * ks), Math.round(linha + 8 - s.oy * ks + pula), s.w * ks, s.h * ks);
    }
    if (this.terra > 0) this.terra -= 1 / 60;
    this.notas.forEach(function (n) {
      var x = lx[n.col];
      g.fillStyle = C.contorno; g.fillRect(x - 5, Math.round(n.y) - 5, 11, 11);
      g.fillStyle = '#a8aeb6'; g.fillRect(x - 4, Math.round(n.y) - 4, 9, 6); g.fillStyle = C.madeira; g.fillRect(x - 1, Math.round(n.y) + 2, 3, 3);
    });
    BSI.hud.barra(g, 12, H - 18, 90, 7, this.acertos / this.meta, C.amarelo);
  };
  Cavar.prototype.desenharTexto = function () {
    var W = BSI.view.w, H = BSI.view.h;
    Tx.escrever('OS TRÊS IRMÃOS CAVAM JUNTOS', W / 2, 6, { tam: 11, alinhar: 'center', cordel: true, cor: C.amarelo });
    Tx.quebrar('Aperte ATACAR (ou toque) quando a pá chegar na linha amarela!', W - 20, 7).forEach(function (l, i) { Tx.escrever(l, W / 2, 20 + i * 9, { tam: 7, alinhar: 'center' }); });
    Tx.escrever('Pazadas: ' + this.acertos + '/' + this.meta, 12, H - 28, { tam: 6.5 });
    if (this.t < this.intro) Tx.escrever('UM, DOIS...', W / 2, H / 2 - 20, { tam: 16, alinhar: 'center', cordel: true, cor: C.barro, grossura: 4 });
    if (this.tMsg > 0 && !this.fim) Tx.escrever(this.msg, W / 2, H * 0.42, { tam: 10, alinhar: 'center', cor: this.msg === 'JUNTOS!' || this.msg === 'Boa!' ? '#9fe0a0' : '#ff9a7a' });
    if (this.fim) Tx.escrever('TEM ALGUMA COISA AQUI!', W / 2, H / 2 - 30, { tam: 15, alinhar: 'center', cordel: true, cor: '#9fe0a0', grossura: 4 });
  };

  BSI.minigames.cavar = function (aoFim) { BSI.jogo.abrirModal(new Cavar(aoFim)); };
  BSI.minigames.Cavar = Cavar;
})();
