/* =========================================================
   minigames_boss.js — os DESAFIOS do Paulo do Zé Baixinho
   1. QUEDA DE BRAÇO   — aperte ATACAR sem parar contra o braço gigante
   2. PÊNALTIS NO ESCURO — chute na hora certa, longe do goleiro (2 de 3)
   3. RODADA DE CACHAÇA — mantenha a mira no círculo enquanto tudo gira
   Cada um recebe a fase da luta (0, 1, 2: fica mais difícil) e
   chama aoFim(ganhou) quando acaba.
   ========================================================= */
(function () {
  'use strict';
  var C = BSI.cor, Tx = BSI.texto, U = BSI.util, I = BSI.input;

  function apertouAcao() { return I.apertou('ataque') || I.apertou('confirmar') || I.apertou('interagir') || I.apertou('habilidade') || !!I.toque; }

  // base comum: título, instrução, resultado
  function Base(fase, aoFim) { this.fase = fase; this.aoFim = aoFim; this.t = 0; this.fim = null; this.tFim = 0; this.intro = 1.6; }
  Base.prototype.telaCheia = true;
  Base.prototype.terminar = function (ok, txt) {
    if (this.fim) return;
    this.fim = { ok: ok, txt: txt || (ok ? 'GANHOU!' : 'PERDEU!') };
    this.tFim = 1.8;
    BSI.audio.sfx(ok ? 'gol' : 'falha');
  };
  Base.prototype.atualizar = function (dt) {
    this.t += dt;
    if (this.fim) { this.tFim -= dt; if (this.tFim <= 0) { BSI.jogo.fecharModal(); this.aoFim(this.fim.ok); } return; }
    if (this.t < this.intro) return;
    this.passo(dt);
  };
  Base.prototype.textoComum = function (titulo, instrucao) {
    var W = BSI.view.w, H = BSI.view.h;
    Tx.escrever(titulo, W / 2, 6, { tam: 12, alinhar: 'center', cordel: true, cor: C.amarelo });
    Tx.quebrar(instrucao, W - 20, 7).forEach(function (l, i) { Tx.escrever(l, W / 2, 21 + i * 9, { tam: 7, alinhar: 'center' }); });
    if (this.t < this.intro) Tx.escrever(this.t < this.intro * 0.5 ? 'PREPARA...' : 'JÁ!', W / 2, H / 2 - 10, { tam: 18, alinhar: 'center', cordel: true, cor: C.barro, grossura: 4 });
    if (this.fim) Tx.escrever(this.fim.txt, W / 2, H / 2 - 10, { tam: 18, alinhar: 'center', cordel: true, cor: this.fim.ok ? '#9fe0a0' : '#ff9a7a', grossura: 4 });
  };

  // =========================================================
  //  1. QUEDA DE BRAÇO
  // =========================================================
  function Braco(fase, aoFim) {
    Base.call(this, fase, aoFim);
    this.pos = 0.5; this.dur = 8; this.surto = 0; this.tSurto = 1.2;
    this.lider = BSI.jogo.mundo.lider();
  }
  Braco.prototype = Object.create(Base.prototype);
  Braco.prototype.passo = function (dt) {
    var forca = 0.15 + this.fase * 0.05;
    this.tSurto -= dt;
    if (this.tSurto <= 0) { this.tSurto = 0.9 + Math.random() * 1.2; this.surto = 0.25; BSI.audio.sfx('soco'); }
    if (this.surto > 0) { this.surto -= dt; forca += 0.35; }
    this.pos -= forca * dt;
    if (apertouAcao()) { this.pos += (this.lider && this.lider.st.forte > 0) ? 0.06 : 0.042; BSI.audio.sfx('blip'); }
    this.pos = U.clamp(this.pos, 0, 1);
    if (this.pos >= 1) this.terminar(true, 'DERRUBOU O BRAÇO!');
    else if (this.pos <= 0) this.terminar(false, 'O BRAÇO GIGANTE VENCEU!');
    else if (this.t - this.intro > this.dur) this.terminar(this.pos > 0.5, this.pos > 0.5 ? 'GANHOU NO TEMPO!' : 'PERDEU NO TEMPO!');
  };
  Braco.prototype.desenhar = function (g) {
    var W = BSI.view.w, H = BSI.view.h;
    g.fillStyle = '#1a1220'; g.fillRect(0, 0, W, H);
    // lampião em cima da mesa
    g.fillStyle = 'rgba(247,183,51,0.12)'; g.fillRect(W / 2 - 80, 30, 160, H - 30);
    var mx = Math.round(W / 2), my = Math.round(H * 0.62);
    g.fillStyle = C.madeiraEsc; g.fillRect(mx - 70, my, 140, 30); g.fillStyle = C.madeira; g.fillRect(mx - 70, my, 140, 4);
    // ângulo: pos 0 = mão do herói deitada à esquerda; 1 = Paulo deitado à direita
    var ang = -Math.PI / 2 + (this.pos - 0.5) * 2.6 + Math.sin(this.t * 30) * 0.02;
    var cx = mx, cy = my - 2;
    function antebraco(len, larg, cor, corE, a) {
      g.save(); g.translate(cx, cy); g.rotate(a);
      g.fillStyle = C.contorno; g.fillRect(-1, -larg / 2 - 1, len + 2, larg + 2);
      g.fillStyle = cor; g.fillRect(0, -larg / 2, len, larg);
      g.fillStyle = corE; g.fillRect(0, larg / 2 - 2, len, 2);
      g.restore();
    }
    // braço gigante do Paulo (vem da direita) e o do herói (da esquerda)
    antebraco(46, 16, '#c08858', '#9a6a40', ang + 0.25);
    var pele = (this.lider && this.lider.def.visual.pele) || '#c98b5e';
    antebraco(36, 8, pele, BSI.painter.escurecer(pele, 0.2), ang - 0.25);
    // mãos juntas
    var hx = cx + Math.cos(ang) * 40, hy = cy + Math.sin(ang) * 40;
    g.fillStyle = C.contorno; g.fillRect(Math.round(hx) - 8, Math.round(hy) - 8, 16, 16);
    g.fillStyle = '#c08858'; g.fillRect(Math.round(hx) - 7, Math.round(hy) - 7, 14, 14);
    g.fillStyle = pele; g.fillRect(Math.round(hx) - 7, Math.round(hy) - 2, 7, 6);
    // barra de força
    var bw = Math.min(W - 40, 200), bx = Math.round(W / 2 - bw / 2), by = H - 22;
    BSI.hud.barra(g, bx, by, bw, 9, this.pos, this.pos > 0.5 ? '#7ad07a' : C.barro);
    g.fillStyle = C.branco; g.fillRect(bx + bw / 2, by - 2, 1, 13);
  };
  Braco.prototype.desenharTexto = function () {
    this.textoComum('QUEDA DE BRAÇO', 'Aperte ATACAR (ou toque na tela) sem parar!');
    var W = BSI.view.w, H = BSI.view.h;
    Tx.escrever(this.lider ? this.lider.nome() : 'Grupo', 20, H - 34, { tam: 7, cor: '#7ad07a' });
    Tx.escrever('Braço do Paulo', W - 20, H - 34, { tam: 7, alinhar: 'right', cor: '#ff9a7a' });
    if (this.surto > 0 && !this.fim) Tx.escrever('HIC! FORÇA!', W / 2, H * 0.3, { tam: 10, alinhar: 'center', cor: '#ff9a7a' });
  };

  // =========================================================
  //  2. PÊNALTIS NO ESCURO
  // =========================================================
  function Penaltis(fase, aoFim) {
    Base.call(this, fase, aoFim);
    this.chute = 0; this.gols = 0; this.defesas = 0;
    this.mira = 0; this.velMira = 1.4 + fase * 0.5; this.dirMira = 1;
    this.goleiro = 0; this.faseGol = Math.random() * 6; this.velGol = 1.6 + fase * 0.5;
    this.bola = null; this.msg = ''; this.tMsg = 0;
    this.goleiroSpr = BSI.sprites.humano('inimigo:bebado', BSI.data.inimigos.bebado.visual);
  }
  Penaltis.prototype = Object.create(Base.prototype);
  Penaltis.prototype.passo = function (dt) {
    if (this.tMsg > 0) { this.tMsg -= dt; if (this.tMsg <= 0) this.proximo(); return; }
    this.faseGol += dt * this.velGol;
    this.goleiro = Math.sin(this.faseGol) * 0.75 + Math.sin(this.faseGol * 2.7) * 0.15;
    if (!this.bola) {
      this.mira += this.dirMira * this.velMira * dt;
      if (this.mira > 1) { this.mira = 1; this.dirMira = -1; }
      if (this.mira < -1) { this.mira = -1; this.dirMira = 1; }
      if (apertouAcao()) { this.bola = { t: 0, x: this.mira }; BSI.audio.sfx('soco'); }
    } else {
      this.bola.t += dt * 1.8;
      if (this.bola.t >= 1) {
        var bx = this.bola.x;
        if (Math.abs(bx) > 0.93) { this.msg = 'NA TRAVE!'; this.defesas++; BSI.audio.sfx('estalo'); }
        else if (Math.abs(bx - this.goleiro) < 0.3) { this.msg = 'DEFENDEU!'; this.defesas++; BSI.audio.sfx('falha'); }
        else { this.msg = 'GOOOL!'; this.gols++; BSI.audio.sfx('gol'); }
        this.tMsg = 1.1;
      }
    }
  };
  Penaltis.prototype.proximo = function () {
    this.chute++; this.bola = null; this.msg = '';
    this.velMira *= 1.12;
    if (this.gols >= 2) this.terminar(true, 'ROMA DERROTADO NOS PÊNALTIS!');
    else if (this.defesas >= 2) this.terminar(false, 'O GOLEIRO PEGOU TUDO!');
  };
  Penaltis.prototype.desenhar = function (g) {
    var W = BSI.view.w, H = BSI.view.h;
    g.fillStyle = '#0d0a1c'; g.fillRect(0, 0, W, H);
    // campo escuro e a luz fraca do poste
    var gw = Math.min(W - 60, 220), gx = Math.round(W / 2 - gw / 2), gy = Math.round(H * 0.28);
    g.fillStyle = '#3a2a20'; g.fillRect(0, gy + 30, W, H);
    g.fillStyle = 'rgba(247,220,160,0.10)'; g.fillRect(gx - 30, gy - 10, gw + 60, H);
    g.fillStyle = '#e8e2d0'; g.fillRect(0, gy + 30, W, 1);
    // gol
    g.fillStyle = '#f0f0e8'; g.fillRect(gx, gy, 3, 32); g.fillRect(gx + gw - 3, gy, 3, 32); g.fillRect(gx, gy, gw, 3);
    g.fillStyle = 'rgba(220,220,210,0.25)'; for (var i = gx + 6; i < gx + gw - 3; i += 6) g.fillRect(i, gy + 3, 1, 28);
    // goleiro
    var px = gx + gw / 2 + this.goleiro * gw / 2;
    var spr = this.goleiroSpr, img = spr.dirs.down[Math.floor(this.t * 6) % 3];
    var eg = 2 / (spr.esc || 1);
    g.drawImage(img, Math.round(px - spr.ox * eg), Math.round(gy + 31 - spr.oy * eg - 2), spr.w * eg, spr.h * eg);
    g.fillStyle = '#e0702a'; g.fillRect(Math.round(px) - 15, gy + 12, 6, 4); g.fillRect(Math.round(px) + 9, gy + 12, 6, 4); // luvas
    // mira
    var mx = gx + gw / 2 + this.mira * gw / 2;
    if (!this.bola) { g.fillStyle = C.amarelo; g.fillRect(Math.round(mx) - 1, gy + 4, 3, 26); g.fillRect(Math.round(mx) - 4, gy + 34, 9, 2); }
    // bola
    var by0 = H - 30, bxx = W / 2, byy = by0;
    if (this.bola) { var t = Math.min(1, this.bola.t); bxx = U.lerp(W / 2, gx + gw / 2 + this.bola.x * gw / 2, t); byy = U.lerp(by0, gy + 18, t) - Math.sin(t * Math.PI) * 14; }
    var tb = this.bola ? 5 - Math.min(1, this.bola.t) * 2 : 5;
    g.fillStyle = C.contorno; g.fillRect(Math.round(bxx - tb / 2) - 1, Math.round(byy - tb / 2) - 1, tb + 2, tb + 2);
    g.fillStyle = C.branco; g.fillRect(Math.round(bxx - tb / 2), Math.round(byy - tb / 2), tb, tb);
    // placar
    for (var k = 0; k < 3; k++) {
      var cor = k < this.chute ? '#555' : '#888';
      g.fillStyle = cor; g.fillRect(12 + k * 10, H - 16, 7, 7);
    }
  };
  Penaltis.prototype.desenharTexto = function () {
    this.textoComum('PÊNALTIS CONTRA O ROMA', 'Chute (ATACAR/toque) quando a mira estiver longe do goleiro. Faça 2 gols.');
    var W = BSI.view.w, H = BSI.view.h;
    Tx.escrever('Gols: ' + this.gols + '   Defesas: ' + this.defesas, W - 12, H - 16, { tam: 7, alinhar: 'right' });
    if (this.msg) Tx.escrever(this.msg, W / 2, H * 0.55, { tam: 16, alinhar: 'center', cordel: true, cor: this.msg === 'GOOOL!' ? '#9fe0a0' : '#ff9a7a', grossura: 4 });
  };

  // =========================================================
  //  3. RODADA DE CACHAÇA
  // =========================================================
  function Cachaca(fase, aoFim) {
    Base.call(this, fase, aoFim);
    this.dur = 7; this.x = 0; this.y = 0; this.vx = 0; this.vy = 0; this.fora = 0;
    this.giro = 0;
  }
  Cachaca.prototype = Object.create(Base.prototype);
  Cachaca.prototype.passo = function (dt) {
    var forca = 1.6 + this.fase * 0.6, tt = this.t - this.intro;
    this.vx += (Math.sin(tt * 1.7) * 0.8 + (Math.random() - 0.5) * 1.5) * forca * dt;
    this.vy += (Math.cos(tt * 1.3) * 0.8 + (Math.random() - 0.5) * 1.5) * forca * dt;
    var m = I.movimento();
    this.vx += m.x * 3.2 * dt; this.vy += m.y * 3.2 * dt;
    this.vx *= Math.pow(0.35, dt); this.vy *= Math.pow(0.35, dt);
    this.x = U.clamp(this.x + this.vx * dt, -1.3, 1.3); this.y = U.clamp(this.y + this.vy * dt, -1.3, 1.3);
    this.giro = Math.sin(tt * 1.1) * 0.35 + tt * 0.06;
    if (Math.sqrt(this.x * this.x + this.y * this.y) > 0.5) this.fora += dt;
    else this.fora = Math.max(0, this.fora - dt * 0.3);
    if (this.fora > 1.6) this.terminar(false, 'O MUNDO GIROU DEMAIS...');
    else if (tt > this.dur) this.terminar(true, 'SEGUROU A CACHAÇA!');
  };
  Cachaca.prototype.terminar = function (ok, txt) {
    if (this.fim) return;
    Base.prototype.terminar.call(this, ok, txt);
    BSI.story.medidor('juizo', ok ? -4 : -10, ok ? 'Bebeu e aguentou. Juízo -4' : 'Bebeu e caiu. Juízo -10');
    if (!ok && BSI.jogo.mundo) BSI.jogo.mundo.herois.forEach(function (h) { if (!h.caido) h.st.zonzo = 4; });
  };
  Cachaca.prototype.desenhar = function (g) {
    var W = BSI.view.w, H = BSI.view.h, cx = W / 2, cy = H / 2 + 10, R = Math.min(W, H) * 0.32;
    g.fillStyle = '#1a1220'; g.fillRect(0, 0, W, H);
    g.save(); g.translate(cx, cy); g.rotate(this.giro);
    // mesa do bar vista de cima, girando
    g.fillStyle = C.madeiraEsc; g.fillRect(-R * 1.6, -R * 1.2, R * 3.2, R * 2.4);
    g.fillStyle = C.madeira; for (var i = -3; i <= 3; i++) g.fillRect(-R * 1.6, i * R * 0.35, R * 3.2, 2);
    g.fillStyle = '#6a9a6a'; g.fillRect(R * 0.9, -R * 0.8, 10, 22); g.fillStyle = C.creme; g.fillRect(R * 0.9, -R * 0.7, 10, 7);
    g.fillStyle = 'rgba(232,210,128,0.8)'; g.fillRect(-R * 1.1, R * 0.5, 9, 11); g.fillRect(-R * 0.6, -R * 0.9, 9, 11);
    // círculo do equilíbrio
    g.strokeStyle = C.amarelo; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, R * 0.5, 0, Math.PI * 2); g.stroke();
    g.restore();
    // a mira (fica fora do giro)
    var px = cx + this.x * R, py = cy + this.y * R;
    var fora = Math.sqrt(this.x * this.x + this.y * this.y) > 0.5;
    g.fillStyle = C.contorno; g.fillRect(Math.round(px) - 4, Math.round(py) - 4, 9, 9);
    g.fillStyle = fora ? C.barro : '#9fe0a0'; g.fillRect(Math.round(px) - 3, Math.round(py) - 3, 7, 7);
    // visão embaçada
    g.fillStyle = 'rgba(200,120,60,' + (0.06 + this.fora * 0.12).toFixed(2) + ')'; g.fillRect(0, 0, W, H);
    BSI.hud.barra(g, 12, H - 18, 70, 7, 1 - this.fora / 1.6, '#9fe0a0');
  };
  Cachaca.prototype.desenharTexto = function () {
    this.textoComum('RODADA DE CACHAÇA', 'Use o direcional pra manter o ponto dentro do círculo!');
    var H = BSI.view.h;
    Tx.escrever('Juízo na rodada', 12, H - 28, { tam: 6.5 });
  };

  BSI.minigames.desafioPaulo = function (tipo, fase, aoFim) {
    var M = { braco: Braco, penaltis: Penaltis, cachaca: Cachaca }[tipo] || Braco;
    BSI.jogo.abrirModal(new M(fase, aoFim));
  };
  BSI.minigames.Braco = Braco; BSI.minigames.Penaltis = Penaltis; BSI.minigames.Cachaca = Cachaca;
})();
