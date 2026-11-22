/* =========================================================
   minigames_interludio.js — FAZER PIPOCA NA FOGUEIRA (timing)
   O ponteiro do calor vai e volta. Aperte ATACAR (sacudir a panela)
   quando ele estiver na faixa VERDE: estoura pipoca. Na faixa
   vermelha queima o milho. 20 pipocas ganha; 4 queimadas perde.
   ========================================================= */
(function () {
  'use strict';
  var C = BSI.cor, Tx = BSI.texto, I = BSI.input;

  function Pipoca(aoFim) {
    this.aoFim = aoFim; this.t = 0; this.intro = 1.4; this.dur = 16;
    this.pipocas = 0; this.queimadas = 0; this.cd = 0;
    this.ponteiro = 0.2; this.zona = 0.55; this.larg = 0.22;
    this.graos = []; this.msg = ''; this.tMsg = 0;
    this.fim = null; this.tFim = 0;
  }
  Pipoca.prototype.telaCheia = true;
  Pipoca.prototype.terminar = function (ok, txt) {
    if (this.fim) return;
    this.fim = { ok: ok, txt: txt || (ok ? 'PIPOCA NO PONTO!' : 'QUEIMOU TUDO!') };
    this.tFim = 1.8;
    BSI.audio.sfx(ok ? 'gol' : 'falha');
  };
  Pipoca.prototype.atualizar = function (dt) {
    this.t += dt;
    if (this.tMsg > 0) this.tMsg -= dt;
    for (var i = this.graos.length - 1; i >= 0; i--) {
      var gr = this.graos[i];
      gr.vy += 220 * dt; gr.x += gr.vx * dt; gr.y += gr.vy * dt; gr.vida -= dt;
      if (gr.vida <= 0) this.graos.splice(i, 1);
    }
    if (this.fim) { this.tFim -= dt; if (this.tFim <= 0) { BSI.jogo.fecharModal(); this.aoFim(this.fim.ok); } return; }
    if (this.t < this.intro) return;
    var tt = this.t - this.intro;
    // o ponteiro acelera com o tempo; a faixa verde passeia devagar
    this.ponteiro = 0.5 + 0.48 * Math.sin(tt * (2.2 + tt * 0.08));
    this.zona = 0.55 + Math.sin(tt * 0.5) * 0.15;
    this.cd -= dt;
    if (this.cd <= 0 && (I.apertou('ataque') || I.apertou('confirmar') || I.apertou('interagir') || I.toque)) {
      this.cd = 0.22;
      var p = this.ponteiro, a = this.zona - this.larg / 2, b = this.zona + this.larg / 2;
      if (p >= a && p <= b) {
        var n = 2 + Math.floor(Math.random() * 2);
        this.pipocas += n;
        for (var k = 0; k < n * 3; k++) this.graos.push({ x: (Math.random() - 0.5) * 30, y: 0, vx: (Math.random() - 0.5) * 90, vy: -120 - Math.random() * 90, vida: 1.2 });
        BSI.audio.sfx('pipoca'); this.msg = 'POC!'; this.tMsg = 0.3;
      } else if (p > b) {
        this.queimadas++; BSI.audio.sfx('falha'); this.msg = 'QUEIMOU!'; this.tMsg = 0.5;
      } else { this.msg = 'tá frio...'; this.tMsg = 0.4; BSI.audio.sfx('estalo'); }
    }
    if (this.pipocas >= 20) this.terminar(true);
    else if (this.queimadas >= 4) this.terminar(false, 'QUEIMOU O MILHO!');
    else if (tt > this.dur) this.terminar(false, 'DEMOROU DEMAIS...');
  };
  Pipoca.prototype.desenhar = function (g) {
    var W = BSI.view.w, H = BSI.view.h, cx = Math.round(W / 2), base = Math.round(H * 0.68);
    g.fillStyle = '#120c1c'; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(247,167,51,0.10)'; g.fillRect(cx - 90, base - 70, 180, 110);
    // fogo
    for (var i = 0; i < 6; i++) {
      var alt = Math.round(10 + Math.sin(this.t * 11 + i) * 4);
      g.fillStyle = C.fogo3; g.fillRect(cx - 24 + i * 8, base + 8 - alt, 6, alt);
      g.fillStyle = C.fogo2; g.fillRect(cx - 23 + i * 8, base + 8 - alt * 0.6, 4, alt * 0.6);
    }
    g.fillStyle = C.madeiraEsc; g.fillRect(cx - 30, base + 8, 60, 5);
    // panela sacudindo
    var sac = this.tMsg > 0 && this.msg === 'POC!' ? Math.round(Math.sin(this.t * 60) * 2) : 0;
    g.fillStyle = C.contorno; g.fillRect(cx - 28 + sac, base - 12, 56, 12);
    g.fillStyle = '#5a5f66'; g.fillRect(cx - 27 + sac, base - 11, 54, 10);
    g.fillStyle = '#7a8088'; g.fillRect(cx - 27 + sac, base - 11, 54, 2);
    g.fillStyle = '#3a3a40'; g.fillRect(cx + 27 + sac, base - 9, 22, 3);
    // pipocas pulando
    var self = this;
    this.graos.forEach(function (gr) { g.fillStyle = C.branco; g.fillRect(Math.round(cx + gr.x), Math.round(base - 14 + gr.y), 3, 3); g.fillStyle = C.amarelo; g.fillRect(Math.round(cx + gr.x) + 1, Math.round(base - 13 + gr.y), 1, 1); });
    // barra do calor
    var bw = Math.min(W - 40, 220), bx = Math.round(cx - bw / 2), by = 44;
    g.fillStyle = C.contorno; g.fillRect(bx - 1, by - 1, bw + 2, 12);
    g.fillStyle = '#3b5b8c'; g.fillRect(bx, by, bw, 10);
    g.fillStyle = C.barro; g.fillRect(bx + Math.round(bw * (this.zona + this.larg / 2)), by, bw - Math.round(bw * (this.zona + this.larg / 2)), 10);
    g.fillStyle = '#5aa04a'; g.fillRect(bx + Math.round(bw * (this.zona - this.larg / 2)), by, Math.round(bw * this.larg), 10);
    var px = bx + Math.round(bw * this.ponteiro);
    g.fillStyle = C.branco; g.fillRect(px - 1, by - 4, 3, 18);
    // tigela
    var tx = W - 60, ty = H - 40;
    g.fillStyle = C.barro; g.fillRect(tx, ty, 40, 14); g.fillStyle = C.barroEsc; g.fillRect(tx, ty + 10, 40, 4);
    for (var p = 0; p < Math.min(20, self.pipocas); p++) { g.fillStyle = C.branco; g.fillRect(tx + 2 + (p % 10) * 4, ty - 2 - Math.floor(p / 10) * 3, 3, 3); }
  };
  Pipoca.prototype.desenharTexto = function () {
    var W = BSI.view.w, H = BSI.view.h;
    Tx.escrever('PIPOCA NA FOGUEIRA', W / 2, 6, { tam: 12, alinhar: 'center', cordel: true, cor: C.amarelo });
    Tx.quebrar('Sacuda a panela (ATACAR/toque) quando o ponteiro estiver no VERDE!', W - 20, 7).forEach(function (l, i) { Tx.escrever(l, W / 2, 21 + i * 9, { tam: 7, alinhar: 'center' }); });
    Tx.escrever('Pipocas: ' + this.pipocas + '/20', W - 20, H - 54, { tam: 7, alinhar: 'right' });
    Tx.escrever('Queimadas: ' + this.queimadas + '/4', 14, H - 20, { tam: 7, cor: this.queimadas ? '#ff9a7a' : C.creme });
    if (this.t < this.intro) Tx.escrever(this.t < this.intro * 0.5 ? 'PREPARA...' : 'JÁ!', W / 2, H / 2 - 30, { tam: 18, alinhar: 'center', cordel: true, cor: C.barro, grossura: 4 });
    if (this.tMsg > 0 && !this.fim) Tx.escrever(this.msg, W / 2, H * 0.36, { tam: 12, alinhar: 'center', cor: this.msg === 'POC!' ? C.branco : '#ff9a7a' });
    if (this.fim) Tx.escrever(this.fim.txt, W / 2, H / 2 - 30, { tam: 16, alinhar: 'center', cordel: true, cor: this.fim.ok ? '#9fe0a0' : '#ff9a7a', grossura: 4 });
  };

  BSI.minigames.pipoca = function (aoFim) { BSI.jogo.abrirModal(new Pipoca(aoFim)); };
  BSI.minigames.Pipoca = Pipoca;
})();
