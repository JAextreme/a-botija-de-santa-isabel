/* =========================================================
   enemies.js — inimigo do protótipo: JAGUNÇO do CDs.
   Duas variações: peixeira (corpo a corpo) e baladeira (atira pedra).
   Todo golpe tem AVISO antes (pisca vermelho + "!").
   Estados: patrulha → persegue → prepara → golpe → recupera
            investiga (ouviu barulho), foge (medo), volta
   ========================================================= */
(function () {
  'use strict';
  var U = BSI.util, C = BSI.cor;

  var VISUAL_JAGUNCO = { pele: '#a87048', cabelo: '#1a120c', camisa: '#5a5a62', calca: '#2a2a33', chapeu: '#1a1a20', cabeca: 'chapeuPreto', extras: ['oculosEscuros'], acessorio: 'peixeira' };
  var VISUAL_ATIRADOR = { pele: '#b88050', cabelo: '#1a120c', camisa: '#6a4a3a', camisa2: '#4a3020', padrao: 'listra', calca: '#2a2a33', chapeu: '#3a2a1a', cabeca: 'chapeuPreto', extras: ['bigode'] };

  BSI.data.inimigos = {
    jagunco: { nome: 'Jagunço', vida: 4, vel: 44, visao: 95, dano: 2, ataque: 'corpo', humano: true, visual: VISUAL_JAGUNCO },
    atirador: { nome: 'Jagunço de baladeira', vida: 3, vel: 38, visao: 125, dano: 1, ataque: 'baladeira', humano: true, visual: VISUAL_ATIRADOR },
    // torcedor do Roma, bêbado, cobrando pedágio pro presidente
    bebado: {
      nome: 'Torcedor do Roma', vida: 3, vel: 34, visao: 80, dano: 1, ataque: 'corpo', humano: true, conversavel: true, cambaleia: true,
      visual: { pele: '#b88050', cabelo: '#2b1d14', camisa: '#a8302a', camisa2: '#1a1a20', padrao: 'listra', calca: '#3a3a44', chapeu: '#1a1a20', cabeca: 'bone', acessorio: 'copo' },
      falas: ['Hic! Ô do pedágio!', 'Roma campeão! Hic!', 'Paga o pedágio, abestado!', 'Tu é torcedor de quem, hein?']
    }
  };

  function Inimigo(id, x, y) {
    BSI.Entidade.call(this, x, y, 4, 3);
    var d = this.d = BSI.data.inimigos[id];
    this.id = id;
    this.time = 'inimigos';
    this.vida = d.vida;
    this.humano = !!d.humano;
    this.alma = !!d.alma;
    this.conversavel = !!d.conversavel;
    this.casa = { x: x, y: y };
    this.estado = 'patrulha';
    this.tEstado = 0;
    this.alvo = null;
    this.destino = null;
    this.dir = 'down';
    this.face = { x: 0, y: 1 };
    this.quadro = 0; this.passo = 0;
    this.cd = 0;
    this.st = {};
    this.alerta = 0;  // tempo do "!" acima da cabeça
    this.roubado = false;
    this.spr = BSI.sprites.humano('inimigo:' + id, d.visual);
  }
  Inimigo.prototype = Object.create(BSI.Entidade.prototype);

  // ---------- efeitos vindos das habilidades ----------
  Inimigo.prototype.atordoar = function (s) { this.st.atordoado = Math.max(this.st.atordoado || 0, s); this.estado = 'recupera'; this.tEstado = 0; };
  Inimigo.prototype.virarBode = function (s) { this.st.bode = s; this.ignorarMira = true; };
  Inimigo.prototype.converter = function (s) { this.st.convertido = s; this.time = 'herois'; this.alvo = null; };
  Inimigo.prototype.acalmar = function (s) { this.st.acalmado = s; };
  Inimigo.prototype.forcarAlvo = function (h, s) { this.st.provocado = s; this.provocador = h; this.alvo = h; this.estado = 'persegue'; };
  Inimigo.prototype.fugir = function (s, de) { this.st.medo = s; this.medoDe = { x: de.x, y: de.y }; };
  Inimigo.prototype.ouvir = function (x, y) {
    if (this.st.convertido > 0 || this.alvo) return;
    this.estado = 'investiga'; this.destino = { x: x, y: y }; this.tEstado = 0;
  };

  Inimigo.prototype.levarDano = function (qtd, mundo, fonte, tipo) {
    if (this.morto) return;
    if (this.st.bode > 0) { mundo.falar(this, 'Méééé!', 0.8); return; } // não se bate em bode
    if (mundo.conselho > 0) qtd *= 1.5; // Conselho do Alpendre mostrou o ponto fraco
    this.vida -= qtd;
    this.flash = 0.25;
    if (fonte && fonte.time === 'herois') mundo.encherPoder(qtd * 2.5);
    if (fonte) {
      this.empurrar(fonte.x, fonte.y, tipo === 'corpo' ? 170 : 110);
      if (this.st.convertido <= 0 && fonte.time === 'herois' && fonte.caido === false) { this.alvo = fonte; this.estado = 'persegue'; }
    }
    if (this.estado === 'prepara' && tipo === 'corpo') { this.estado = 'recupera'; this.tEstado = 0; } // golpe interrompe
    mundo.particulas.explosao(this.x, this.y - 6, 5, ['#ffffff', '#f0c75e'], 40, 0.25);
    BSI.audio.sfx('acerto');
    if (this.vida <= 0) this.morrer(mundo);
  };

  Inimigo.prototype.morrer = function (mundo) {
    this.morto = true;
    if (this.ultimoGolpe && BSI.falasVivas) BSI.falasVivas.dizer(mundo, this.ultimoGolpe, 'abate', { chance: 0.35 });
    BSI.audio.sfx('morte');
    mundo.particulas.explosao(this.x, this.y - 6, 14, ['rgba(225,190,140,0.9)', '#5a5a62', '#1a1a20'], 50, 0.6);
    if (BSI.rng.chance(0.5)) mundo.soltarItem('municao', this.x, this.y, 2);
    if (BSI.rng.chance(0.3)) mundo.soltarItem('sucata', this.x, this.y, 1);
    else if (BSI.rng.chance(0.2)) mundo.soltarItem('dinheiro', this.x, this.y, 1);
    else if (BSI.rng.chance(0.15)) mundo.soltarItem('rapadura', this.x, this.y, 1);
    mundo.aoMatarInimigo(this);
  };

  // ---------- cérebro ----------
  Inimigo.prototype.escolherAlvo = function (mundo) {
    if (this.st.provocado > 0 && this.provocador && !this.provocador.caido) return this.provocador;
    var lista = this.time === 'herois' ? mundo.alvosPara('herois', true) : mundo.alvosPara('inimigos');
    var visao = this.d.visao * (mundo.dados.noite ? 0.85 : 1);
    if (this.alvo && !this.alvo.morto && !this.alvo.caido && !(this.alvo.st && this.alvo.st.invisivel > 0) && U.dist(this.alvo, this) < visao * 1.7) return this.alvo;
    var melhor = null, md = visao * visao;
    for (var i = 0; i < lista.length; i++) {
      var a = lista[i];
      if (a === this || a.morto || a.caido || (a.st && a.st.invisivel > 0)) continue;
      var d2 = U.dist2(a.x, a.y, this.x, this.y);
      if (d2 < md && BSI.colisao.visao(mundo.mapa, this.x, this.y - 6, a.x, a.y - 6)) { md = d2; melhor = a; }
    }
    return melhor;
  };

  Inimigo.prototype.andar = function (dt, mundo, nx, ny, mult) {
    var v = this.d.vel * (mult || 1) * (mundo.multVelInimigo || 1);
    if (this.d.cambaleia && (nx || ny)) { var w = U.girar(nx, ny, Math.sin(this.t * 3.1) * 0.9); nx = w.x; ny = w.y; }
    var ax = this.x, ay = this.y;
    BSI.colisao.mover(this, mundo.mapa, nx * v * dt, ny * v * dt);
    if (Math.abs(nx) + Math.abs(ny) > 0.1) { this.face = { x: nx, y: ny }; this.dir = U.dirDe(nx, ny); }
    var andou = U.len(this.x - ax, this.y - ay);
    this.passo += andou;
    this.quadro = andou > 0.05 ? [1, 0, 2, 0][Math.floor(this.passo / 5) % 4] : 0;
    return andou;
  };

  Inimigo.prototype.atualizar = function (dt, mundo) {
    this.t += dt;
    for (var k in this.st) if (this.st[k] > 0) {
      this.st[k] -= dt;
      if (this.st[k] <= 0) {
        if (k === 'convertido') { this.time = 'inimigos'; this.alvo = null; mundo.falar(this, 'Pera... de que lado eu tava?', 1.5); }
        if (k === 'bode') { this.ignorarMira = false; mundo.particulas.explosao(this.x, this.y - 6, 8, ['#e8e0d0', '#d9798a'], 30, 0.4); }
      }
    }
    if (this.flash > 0) this.flash -= dt;
    if (this.alerta > 0) this.alerta -= dt;
    if (this.cd > 0) this.cd -= dt;
    this.tEstado += dt;
    this.empurrao(dt, mundo.mapa);

    if (this.st.atordoado > 0 || this.st.acalmado > 0) { this.quadro = 0; return; }
    if (this.st.bode > 0) {
      // bode passeando à toa
      if (!this.destino || this.tEstado > 1.5) { this.destino = { x: this.x + (Math.random() - 0.5) * 30, y: this.y + (Math.random() - 0.5) * 30 }; this.tEstado = 0; }
      var nb = U.norm(this.destino.x - this.x, this.destino.y - this.y);
      this.andar(dt, mundo, nb.x, nb.y, 0.4);
      return;
    }
    if (this.st.medo > 0) {
      var nf = U.norm(this.x - this.medoDe.x, this.y - this.medoDe.y);
      this.andar(dt, mundo, nf.x, nf.y, 1.3);
      return;
    }

    var alvo = this.escolherAlvo(mundo);
    if (alvo && !this.alvo && this.time === 'inimigos') {
      this.alerta = 0.7; BSI.audio.sfx('alerta');
      if (BSI.falasVivas) { var qv = BSI.falasVivas.alguem(mundo, 'luta', this); if (qv) BSI.falasVivas.dizer(mundo, qv, 'luta', { chance: 0.5, cd: 9 }); }
      if (this.d.falas && Math.random() < 0.6) mundo.falar(this, this.d.falas[Math.floor(Math.random() * this.d.falas.length)], 1.6);
    }
    this.alvo = alvo;

    // ---- máquina de estados ----
    if (this.estado === 'prepara') {
      if (this.tEstado > (this.d.ataque === 'corpo' ? 0.45 : 0.55)) this.golpear(mundo);
      return;
    }
    if (this.estado === 'recupera') {
      if (this.tEstado > (this.d.ataque === 'corpo' ? 0.7 : 1.0)) { this.estado = alvo ? 'persegue' : 'volta'; this.tEstado = 0; }
      return;
    }

    if (alvo) {
      this.estado = 'persegue';
      var dx = alvo.x - this.x, dy = alvo.y - this.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
      var nx = dx / d, ny = dy / d;
      if (this.d.ataque === 'corpo') {
        if (d < 16) { this.comecarGolpe(nx, ny); return; }
        this.andar(dt, mundo, nx, ny, 1);
      } else {
        // baladeira: mantém distância e anda de lado
        var lado = Math.sin(this.t * 1.3) > 0 ? 1 : -1;
        if (d < 60) this.andar(dt, mundo, -nx + -ny * lado * 0.4, -ny + nx * lado * 0.4, 0.9);
        else if (d > 100) this.andar(dt, mundo, nx, ny, 1);
        else this.andar(dt, mundo, -ny * lado, nx * lado, 0.5);
        this.face = { x: nx, y: ny }; this.dir = U.dirDe(nx, ny);
        if (this.cd <= 0 && d < 130) this.comecarGolpe(nx, ny);
      }
      return;
    }

    // sem alvo
    if (this.time === 'herois') {
      // convertido sem briga: segue o líder de longe
      var L = mundo.lider();
      if (L && U.dist(L, this) > 40) { var nl = U.norm(L.x - this.x, L.y - this.y); this.andar(dt, mundo, nl.x, nl.y, 1); }
      else this.quadro = 0;
      return;
    }
    if (this.estado === 'investiga' && this.destino) {
      var ni = U.norm(this.destino.x - this.x, this.destino.y - this.y);
      var mov = this.andar(dt, mundo, ni.x, ni.y, 0.9);
      if (U.dist(this.destino, this) < 10 || this.tEstado > 5 || mov < 0.01) { this.estado = 'volta'; this.tEstado = 0; }
      return;
    }
    if (this.estado === 'persegue' || this.estado === 'volta') {
      var nv = U.norm(this.casa.x - this.x, this.casa.y - this.y);
      if (U.dist(this.casa, this) < 12 || this.tEstado > 6) { this.estado = 'patrulha'; this.tEstado = 0; }
      else this.andar(dt, mundo, nv.x, nv.y, 0.7);
      return;
    }
    // patrulha: passeia perto de casa
    if (!this.destino || this.tEstado > 2.5) {
      this.destino = { x: this.casa.x + (Math.random() - 0.5) * 70, y: this.casa.y + (Math.random() - 0.5) * 70 };
      this.tEstado = Math.random();
    }
    var np = U.norm(this.destino.x - this.x, this.destino.y - this.y);
    if (U.dist(this.destino, this) > 6) this.andar(dt, mundo, np.x, np.y, 0.45); else this.quadro = 0;
  };

  Inimigo.prototype.comecarGolpe = function (nx, ny) {
    this.estado = 'prepara'; this.tEstado = 0;
    this.face = { x: nx, y: ny }; this.dir = U.dirDe(nx, ny);
    this.quadro = 0;
  };

  Inimigo.prototype.golpear = function (mundo) {
    this.estado = 'recupera'; this.tEstado = 0;
    var f = this.face;
    if (this.d.ataque === 'corpo') {
      var hx = this.x + f.x * 10, hy = this.y + f.y * 8;
      var alvos = this.time === 'herois' ? mundo.alvosPara('herois', true) : mundo.alvosPara('inimigos');
      for (var i = 0; i < alvos.length; i++) {
        var a = alvos[i];
        if (a === this || a.morto || a.caido) continue;
        if (U.dist2(a.x, a.y, hx, hy) < 15 * 15) a.levarDano(this.d.dano, mundo, this, 'corpo');
      }
      BSI.audio.sfx('facada');
      mundo.efeitos.push({ tipo: 'corte', x: hx, y: hy - 4, t: 0.12, t0: 0.12 });
    } else {
      var alvo = this.alvo;
      var d = alvo ? U.norm(alvo.x - this.x, alvo.y - this.y) : f;
      mundo.projeteis.push(new BSI.Projetil({ x: this.x + d.x * 6, y: this.y - 7, vx: d.x * 125, vy: d.y * 125, vida: 1.1, dano: this.d.dano, time: this.time, tipo: 'pedra', dono: this }));
      BSI.audio.sfx('facada');
      this.cd = 1.6 + Math.random() * 0.8;
    }
  };

  // ---------- desenho ----------
  Inimigo.prototype.desenhar = function (g, cx, cy) {
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    if (this.st.bode > 0) {
      var b = BSI.sprites.bode();
      this.sombra(g, cx, cy, 12);
      this.desenharSprite(g, cx, cy, b, this.face.x > 0 ? 'right' : 'left', this.quadro);
      return;
    }
    this.sombra(g, cx, cy, 10);
    // aviso de golpe: pisca vermelho
    var prep = this.estado === 'prepara';
    var spr = this.spr, img = spr.dirs[this.dir][this.quadro];
    if (this.flash > 0 || (prep && Math.floor(this.tEstado * 16) % 2 === 0)) img = (prep && !this.flash ? spr.vermelho : spr.branco)[this.dir][this.quadro];
    BSI.sprites.pintar(g, spr, img, x, y);
    if (prep) {
      g.fillStyle = C.barro;
      g.fillRect(x - 1, y - 24, 2, 4); g.fillRect(x - 1, y - 19, 2, 1);
    }
    if (this.alerta > 0) {
      g.fillStyle = C.amarelo;
      g.fillRect(x - 1, y - 25, 2, 4); g.fillRect(x - 1, y - 20, 2, 1);
    }
    if (this.st.atordoado > 0 || this.st.acalmado > 0) {
      g.fillStyle = C.amarelo;
      for (var i = 0; i < 3; i++) { var a = this.t * 5 + i * 2.1; g.fillRect(Math.round(x + Math.cos(a) * 6), Math.round(y - 19 + Math.sin(a) * 2), 1, 1); }
    }
    if (this.st.convertido > 0) {
      // coraçãozinho verde: está do nosso lado
      g.fillStyle = '#7ad07a';
      g.fillRect(x - 2, y - 22, 2, 1); g.fillRect(x + 1, y - 22, 2, 1); g.fillRect(x - 2, y - 21, 5, 1); g.fillRect(x - 1, y - 20, 3, 1); g.fillRect(x, y - 19, 1, 1);
    }
  };

  BSI.Inimigo = Inimigo;
})();
