/* =========================================================
   bosses/paulo.js — BOSS 1: PAULO DO ZÉ BAIXINHO
   Presidente do Roma, bêbado, um braço muito maior que o outro.
   - Anda cambaleando em padrão imprevisível (e às vezes tropeça:
     fica vulnerável, dano x1.5).
   - Soco do braço gigante: círculo vermelho no chão ANTES do golpe.
   - Garrafas: a sombra mostra onde vão cair. (Miguel pode roubar a
     garrafa dele: sem garrafa, ele para de arremessar e fica sóbrio.)
   - Fase 3: giro do braço (aviso antes).
   - Cada vez que a vida de uma fase zera, vem um DESAFIO
     (queda de braço, pênaltis no escuro ou rodada de cachaça).
     Ganhou 3 desafios = Paulo derrotado.
   ========================================================= */
(function () {
  'use strict';
  var U = BSI.util, C = BSI.cor, T = BSI.cfg.TILE;

  var VISUAL = { pele: '#c08858', cabelo: '#2b1d14', camisa: '#a8302a', camisa2: '#1a1a20', padrao: 'listra', calca: '#3a3a44', chapeu: '#a8302a', cabeca: 'bone', extras: ['bigode'] };
  BSI.data.falantes.paulo = { nome: 'Paulo do Zé Baixinho', visual: VISUAL };
  var VIDAS = [60, 70, 85]; // o grupo inteiro bate junto (e os cachorros mordem)
  var DESAFIOS = ['braco', 'penaltis', 'cachaca'];

  function Paulo(x, y) {
    BSI.Entidade.call(this, x, y, 7, 4);
    this.chefe = true; this.humano = true; this.conversavel = true;
    this.d = { nome: 'Paulo do Zé Baixinho', visao: 220 };
    this.time = 'inimigos';
    this.fase = 0;
    this.vidaFase = VIDAS[0]; this.vida = VIDAS[0];
    this.ativo = false;
    this.estado = 'parado'; this.tEstado = 0;
    this.face = { x: -1, y: 0 }; this.dir = 'left';
    this.quadro = 0; this.passo = 0;
    this.st = {};
    this.cdSoco = 1.5; this.cdGarrafa = 2.5; this.cdGiro = 6; this.cdTropeca = 9;
    this.garrafaRoubada = !!BSI.story.tem('paulo_sem_garrafa');
    this.spr = BSI.sprites.humano('chefe:paulo', VISUAL);
    this.alvoSoco = null;
  }
  Paulo.prototype = Object.create(BSI.Entidade.prototype);
  var P = Paulo.prototype;

  // ---------- interface comum de inimigo ----------
  P.atordoar = function (s) { if (this.livre()) { this.st.atordoado = Math.max(this.st.atordoado || 0, s); this.estado = 'anda'; } };
  P.acalmar = function (s) { if (this.livre()) { this.st.acalmado = s; } };
  P.virarBode = function (s) { if (this.livre()) this.st.bode = Math.min(3, s); };
  P.converter = function () { };
  P.forcarAlvo = function (h, s) { this.provocador = h; this.st.provocado = s; };
  P.fugir = function (s, de) { if (this.livre()) { this.st.medo = Math.min(2, s); this.medoDe = { x: de.x, y: de.y }; } };
  P.ouvir = function () { };
  P.livre = function () { return this.ativo && ['desafio', 'derrotado', 'paz'].indexOf(this.estado) < 0; };
  P.ativar = function () { this.ativo = true; this.estado = 'anda'; this.tEstado = 0; };

  P.roubarGarrafa = function (m) {
    if (this.garrafaRoubada) return;
    this.garrafaRoubada = true;
    BSI.story.flag('paulo_sem_garrafa');
    BSI.audio.sfx('pegar');
    m.falar(this, 'CADÊ MINHA GARRAFA?!', 2.2);
    BSI.hud.aviso('Miguel roubou a garrafa do Paulo! Sem cachaça, ele fica sóbrio (e mais lento).', '#9fe0a0');
  };

  P.levarDano = function (q, m, fonte, tipo) {
    if (!this.livre()) return;
    if (this.st.bode > 0) { m.falar(this, 'Mééé! (hic)', 0.8); return; }
    if (this.estado === 'tropeca') q *= 1.5;
    // companheiros (IA) e cachorros ajudam, mas quem decide a luta é o jogador
    if (fonte && (fonte.time === 'cachorro' || (fonte.time === 'herois' && fonte.def && fonte !== m.lider()))) q *= 0.35;
    if (m.conselho > 0) q *= 1.5;
    this.vida -= q;
    this.flash = 0.2;
    if (fonte && fonte.time === 'herois') m.encherPoder(q * 2);
    BSI.audio.sfx('acerto');
    m.particulas.explosao(this.x, this.y - 12, 5, [C.branco, C.amarelo], 40, 0.25);
    if (this.vida <= 0) { this.vida = 0; this.iniciarDesafio(m); }
  };
  P.morrer = function (m) { this.levarDano(999, m, null, 'debug'); };

  // ---------- desafios entre as fases ----------
  P.iniciarDesafio = function (m) {
    var self = this;
    this.estado = 'desafio'; this.tEstado = 0; this.st = {};
    m.efeitos = m.efeitos.filter(function (e) { return e.tipo !== 'garrafa'; });
    DESAFIOS.forEach(function (d) { BSI.story.flag('paulo_esc_' + d, false); });
    BSI.roteiro.rodar([
      ['fala', 'paulo_desafio'],
      ['faz', function () {
        if (BSI.story.tem('paulo_paz')) { self.fazerPaz(m); return; }
        var esc = DESAFIOS.filter(function (d) { return BSI.story.tem('paulo_esc_' + d); })[0] || self.proximoDesafio();
        BSI.roteiro.rodar([['minigame', function (mm, pronto) {
          BSI.minigames.desafioPaulo(esc, self.fase, function (ok) { self.resultado(m, esc, ok); pronto(); });
        }]]);
      }]
    ]);
  };
  P.proximoDesafio = function () {
    return DESAFIOS.filter(function (d) { return !BSI.story.tem('paulo_venceu_' + d); })[0] || 'braco';
  };
  P.resultado = function (m, esc, ok) {
    if (ok) {
      BSI.story.flag('paulo_venceu_' + esc);
      this.fase++;
      if (this.fase >= 3) { this.derrotar(m); return; }
      this.vidaFase = this.vida = VIDAS[this.fase];
      m.falar(this, ['Sorte de principiante! Hic!', 'Agora é sério! Vou usar o braço bom!'][this.fase - 1] || 'Hic!', 2.2);
    } else {
      this.vida = this.vidaFase * 0.5;
      m.falar(this, 'HAHAHA! No Roma ninguém me ganha! Hic!', 2.2);
      BSI.story.medidor('juizo', -5, 'Perdeu o desafio... Juízo -5');
    }
    this.estado = 'anda'; this.tEstado = 0; this.cdSoco = 1.5; this.cdGarrafa = 2;
  };
  // Ritual dos Três Amadeus: pula a fase inteira
  P.pularFase = function (m) {
    if (!this.livre()) return;
    var esc = this.proximoDesafio();
    this.resultado(m, esc, true);
  };
  P.fazerPaz = function (m) {
    this.estado = 'paz';
    BSI.story.flag('paulo_aliado');
    BSI.roteiro.rodar([['fala', 'paulo_paz_fim'], ['faz', function () { BSI.data.eventos.paulo_fim_ato(m); }]]);
  };
  P.derrotar = function (m) {
    this.estado = 'derrotado';
    BSI.story.flag('paulo_derrotado');
    BSI.audio.sfx('queda');
    m.camera.tremer(6);
    BSI.roteiro.rodar([['espera', 1.2], ['fala', 'paulo_derrota'], ['faz', function () { BSI.data.eventos.paulo_fim_ato(m); }]]);
  };

  // ---------- cérebro ----------
  P.alvo = function (m) {
    if (this.st.provocado > 0 && this.provocador && !this.provocador.caido) return this.provocador;
    var melhor = null, md = 1e9, self = this;
    m.herois.forEach(function (h) { if (h.caido || h.st.invisivel > 0) return; var d = U.dist2(h.x, h.y, self.x, self.y); if (d < md) { md = d; melhor = h; } });
    return melhor;
  };

  P.atualizar = function (dt, m) {
    this.t += dt; this.tEstado += dt;
    if (this.flash > 0) this.flash -= dt;
    for (var k in this.st) if (this.st[k] > 0) this.st[k] -= dt;
    this.empurrao(dt, m.mapa);
    if (!this.ativo || !this.livre()) { this.quadro = 0; return; }
    ['cdSoco', 'cdGarrafa', 'cdGiro', 'cdTropeca'].forEach(function (c) { this[c] -= dt; }, this);
    if (this.st.atordoado > 0 || this.st.acalmado > 0) { this.quadro = 0; return; }
    var sobrio = this.garrafaRoubada;
    var a = this.alvo(m);
    if (this.st.bode > 0 || this.st.medo > 0) {
      var nf = this.st.medo > 0 ? U.norm(this.x - this.medoDe.x, this.y - this.medoDe.y) : U.norm(Math.sin(this.t), Math.cos(this.t * 0.7));
      this.andar(dt, m, nf.x, nf.y, 0.6);
      return;
    }

    switch (this.estado) {
      case 'anda':
        if (!a) { this.quadro = 0; return; }
        var dx = a.x - this.x, dy = a.y - this.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
        var n = { x: dx / d, y: dy / d };
        // cambaleio de bêbado (sóbrio cambaleia menos)
        var w = U.girar(n.x, n.y, Math.sin(this.t * 2.3) * (sobrio ? 0.4 : 1.1) + Math.sin(this.t * 0.7) * 0.5);
        if (d > 20) this.andar(dt, m, w.x, w.y, 1);
        else this.quadro = 0;
        this.face = n; this.dir = U.dirDe(n.x, n.y);
        if (this.cdTropeca <= 0 && !sobrio) { this.estado = 'tropeca'; this.tEstado = 0; this.cdTropeca = 8 + Math.random() * 6; m.falar(this, BSI.rng.pick(['Hic! Quem botou esse chão aqui?', 'Eita, o campo tá torto!', 'Hic!']), 1.5); return; }
        if (d < 34 && this.cdSoco <= 0) { this.prepararSoco(n); return; }
        if (this.fase >= 2 && d < 55 && this.cdGiro <= 0) { this.estado = 'prepGiro'; this.tEstado = 0; return; }
        if (!sobrio && d > 36 && this.cdGarrafa <= 0) { this.estado = 'prepGarrafa'; this.tEstado = 0; return; }
        if (sobrio && d > 60 && this.cdSoco <= 0) { this.andar(dt, m, n.x, n.y, 1.6); }
        break;
      case 'prepSoco':
        if (this.tEstado > (this.fase === 0 ? 0.85 : 0.7)) this.socar(m);
        break;
      case 'recupera':
        if (this.tEstado > (sobrio ? 0.9 : 0.6)) { this.estado = 'anda'; this.tEstado = 0; }
        break;
      case 'prepGarrafa':
        if (this.tEstado > 0.35) this.arremessar(m, a);
        break;
      case 'prepGiro':
        if (this.tEstado > 0.75) { this.estado = 'giro'; this.tEstado = 0; this.tGolpeGiro = 0; BSI.audio.sfx('facada'); }
        break;
      case 'giro':
        this.tGolpeGiro -= dt;
        if (a) { var ng = U.norm(a.x - this.x, a.y - this.y); this.andar(dt, m, ng.x, ng.y, 0.5); }
        if (this.tGolpeGiro <= 0) {
          this.tGolpeGiro = 0.35;
          var self = this;
          m.herois.forEach(function (h) { if (!h.caido && U.dist2(h.x, h.y, self.x, self.y) < 30 * 30) h.levarDano(1, m, self, 'corpo'); });
        }
        if (this.tEstado > 1.5) { this.estado = 'recupera'; this.tEstado = 0; this.cdGiro = 7 + Math.random() * 3; }
        break;
      case 'tropeca':
        this.quadro = 0;
        if (this.tEstado > 1.4) { this.estado = 'anda'; this.tEstado = 0; }
        break;
    }
  };

  P.andar = function (dt, m, nx, ny, mult) {
    var vel = (this.garrafaRoubada ? 24 : 30 + this.fase * 5) * mult * (m.multVelInimigo || 1);
    var ax = this.x;
    BSI.colisao.mover(this, m.mapa, nx * vel * dt, ny * vel * dt);
    this.passo += Math.abs(this.x - ax) + Math.abs(ny * vel * dt);
    this.quadro = [1, 0, 2, 0][Math.floor(this.passo / 6) % 4];
  };

  P.prepararSoco = function (n) {
    this.estado = 'prepSoco'; this.tEstado = 0;
    this.face = n; this.dir = U.dirDe(n.x, n.y);
    this.alvoSoco = { x: this.x + n.x * 18, y: this.y + n.y * 14, r: 22 + this.fase * 3 };
  };
  P.socar = function (m) {
    var a = this.alvoSoco, self = this;
    this.estado = 'recupera'; this.tEstado = 0; this.cdSoco = 1.6 + Math.random() * 0.8 - this.fase * 0.2;
    m.herois.forEach(function (h) { if (!h.caido && U.dist2(h.x, h.y, a.x, a.y) < a.r * a.r) h.levarDano(2, m, self, 'corpo'); });
    BSI.audio.sfx('soco');
    m.camera.tremer(5);
    m.particulas.explosao(a.x, a.y, 18, ['rgba(225,190,140,0.9)', '#9a6a3c'], 70, 0.5);
    m.efeitos.push({ tipo: 'onda', x: a.x, y: a.y, r: 0, rMax: a.r, t: 0.3, t0: 0.3 });
  };
  P.arremessar = function (m, a) {
    this.estado = 'recupera'; this.tEstado = 0;
    this.cdGarrafa = 2.6 - this.fase * 0.4 + Math.random();
    if (!a) return;
    var n = 1 + this.fase;
    for (var i = 0; i < n; i++) {
      var ox = (i - (n - 1) / 2) * 22 + (Math.random() - 0.5) * 10, oy = (Math.random() - 0.5) * 14;
      var tx = a.x + (a.kbx || 0) * 0.1 + ox, ty = a.y + oy;
      m.efeitos.push({ tipo: 'garrafa', x0: this.x + 10, y0: this.y - 24, x: tx, y: ty, t: 0.95, t0: 0.95, raio: 13 });
    }
    BSI.audio.sfx('facada');
  };

  // ---------- desenho ----------
  P.desenhar = function (g, cx, cy) {
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    // aviso do soco: círculo vermelho enchendo
    if (this.estado === 'prepSoco' && this.alvoSoco) {
      var a = this.alvoSoco, f = Math.min(1, this.tEstado / 0.8);
      g.fillStyle = 'rgba(232,64,58,' + (0.18 + f * 0.25).toFixed(2) + ')';
      g.beginPath(); g.ellipse(Math.round(a.x - cx), Math.round(a.y - cy), a.r, a.r * 0.6, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(255,120,100,0.9)'; g.lineWidth = 1;
      g.beginPath(); g.ellipse(Math.round(a.x - cx), Math.round(a.y - cy), a.r * f, a.r * 0.6 * f, 0, 0, Math.PI * 2); g.stroke();
    }
    if (this.estado === 'prepGiro' || this.estado === 'giro') {
      g.strokeStyle = this.estado === 'giro' ? 'rgba(255,120,100,0.8)' : 'rgba(232,64,58,' + (0.3 + Math.sin(this.t * 30) * 0.2).toFixed(2) + ')';
      g.beginPath(); g.ellipse(x, y, 30, 18, 0, 0, Math.PI * 2); g.stroke();
    }
    if (this.st.bode > 0) {
      var b = BSI.sprites.bode();
      var kb = 1.4 / (b.esc || 1);
      g.drawImage(b.dirs[this.face.x > 0 ? 'right' : 'left'][0], x - b.ox * kb, y - b.oy * kb, b.w * kb, b.h * kb);
      return;
    }
    // sombra grande
    g.fillStyle = 'rgba(20,10,20,0.4)'; g.fillRect(x - 10, y, 20, 3);
    var spr = this.spr, dir = this.estado === 'tropeca' ? 'down' : this.dir;
    var img = this.flash > 0 ? spr.branco[dir][this.quadro] : spr.dirs[dir][this.quadro];
    var esc = 1.5 / (spr.esc || 1), w = Math.round(spr.w * esc), h = Math.round(spr.h * esc);
    var inclina = this.estado === 'tropeca' ? Math.sin(this.tEstado * 9) * 0.3 : Math.sin(this.t * 2.3) * (this.garrafaRoubada ? 0.03 : 0.08);
    g.save();
    g.translate(x, y);
    g.rotate(inclina);
    g.drawImage(img, -Math.round(spr.ox * esc), -Math.round(spr.oy * esc), w, h);
    this.desenharBraco(g);
    g.restore();
    if (this.st.atordoado > 0 || this.st.acalmado > 0 || this.estado === 'tropeca') {
      g.fillStyle = C.amarelo;
      for (var i = 0; i < 3; i++) { var an = this.t * 5 + i * 2.1; g.fillRect(Math.round(x + Math.cos(an) * 8), Math.round(y - 30 + Math.sin(an) * 2), 1, 1); }
    }
  };

  // o braço gigante (desenhado por cima do boneco)
  P.desenharBraco = function (g) {
    var lado = this.face.x >= 0 ? 1 : -1, pele = '#c08858', peleE = '#9a6a40';
    var ombroX = lado * 7, ombroY = -16;
    var ang;
    if (this.estado === 'prepSoco') ang = -2.2 + Math.sin(this.tEstado * 20) * 0.05;            // braço lá em cima
    else if (this.estado === 'recupera' && this.tEstado < 0.25) ang = Math.atan2(this.face.y, this.face.x * lado) * 0.6 + 0.4; // soco no chão
    else if (this.estado === 'giro') ang = this.t * 14;
    else if (this.estado === 'prepGarrafa') ang = -2.6;
    else ang = 0.9 + Math.sin(this.t * 3) * 0.15;                                                 // pendurado, pesado
    g.save();
    g.translate(ombroX, ombroY);
    g.scale(lado, 1);
    g.rotate(ang);
    g.fillStyle = C.contorno; g.fillRect(-4, -4, 19, 9); g.fillRect(13, -6, 11, 13);
    g.fillStyle = pele; g.fillRect(-3, -3, 17, 7);
    g.fillStyle = peleE; g.fillRect(-3, 2, 17, 2);
    g.fillStyle = pele; g.fillRect(14, -5, 9, 11);                    // punho enorme
    g.fillStyle = peleE; g.fillRect(14, 3, 9, 3); g.fillRect(17, -5, 1, 4); g.fillRect(20, -5, 1, 4);
    if (this.estado === 'prepGarrafa' && !this.garrafaRoubada) { g.fillStyle = '#6a9a6a'; g.fillRect(20, -12, 4, 8); }
    g.restore();
  };

  // depois da luta, o Paulo vira um NPC no campo
  Paulo.depois = function () { return (BSI.story.tem('paulo_derrotado') || BSI.story.tem('paulo_aliado')) ? 'npc' : null; };

  BSI.chefes = BSI.chefes || {};
  BSI.chefes.paulo = Paulo;
})();
