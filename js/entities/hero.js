/* =========================================================
   hero.js — personagem jogável. O mesmo objeto serve para o
   controlado pelo jogador e para os companheiros (IA).
   Vida em "meios corações": 6 = 3 corações.
   ========================================================= */
(function () {
  'use strict';
  var U = BSI.util;

  function Heroi(id, x, y) {
    BSI.Entidade.call(this, x, y, 4, 3);
    this.id = id;
    this.def = BSI.data.personagens[id];
    this.time = 'herois';
    this.vidaMax = 6;
    this.vida = 6;
    this.dir = 'down';
    this.face = { x: 0, y: 1 };
    this.quadro = 0;
    this.passo = 0;
    this.cdAtaque = 0;
    this.cdHab = 0;
    this.st = {};           // estados com tempo: zonzo, invisivel, rapido, forte, montado, digitando, desmaio, escudo...
    this.caido = false;
    this.inv = 0;           // invencibilidade após levar dano
    this.animAtaque = 0;
    this.careca = false;
    this.ia = { parado: 0, ultX: x, ultY: y, pensar: 0, alvo: null };
    this.correndo = false;
    this.movendo = false;
    this.atualizarSprite();
  }
  Heroi.prototype = Object.create(BSI.Entidade.prototype);
  // a arma que está na mão AGORA (arsenal novo: js/entities/armas.js)
  Object.defineProperty(Heroi.prototype, 'arma', { get: function () { return BSI.armas ? BSI.armas.efetiva(this) : BSI.data.armas[this.def.arma]; } });

  Heroi.prototype.atualizarSprite = function () {
    var v = this.def.visual;
    if (this.careca) {
      v = U.clonar(v); v.cabeca = 'careca';
      this.spr = BSI.sprites.humano('heroi:' + this.id + ':careca', v);
    } else this.spr = BSI.sprites.humano('heroi:' + this.id, v);
  };

  Heroi.prototype.nome = function () { return this.def.curto || this.def.nome; };
  Heroi.prototype.bloqueado = function () {
    return this.caido || this.st.desmaio > 0 || this.st.digitando > 0 || this.st.atordoado > 0 || this.st.abracado > 0;
  };

  Heroi.prototype.velocidade = function (mundo) {
    var v = this.def.vel;
    if (this.correndo) v *= 1.55;
    if (this.st.rapido > 0) v *= 1.4;
    if (this.st.montado > 0) v *= 2.1;
    if (this.st.escudo > 0) v *= 0.55;
    if (this.st.zonzo > 0) v *= 0.85;
    if (this.precisao) v *= 0.55; // mira de precisão: anda devagar
    if (this.esquiva) return this.def.vel * BSI.config.balance.combate.esquivaVel;
    if (this.recarga) v *= 0.85;
    if (this.st.rezando > 0) v *= 0.3;
    return v * (mundo.multVel || 1);
  };

  // ---------------- atualização ----------------
  Heroi.prototype.atualizar = function (dt, mundo, controlado) {
    this.t += dt;
    for (var k in this.st) if (this.st[k] > 0) { this.st[k] -= dt; if (this.st[k] <= 0) this.fimEstado(k, mundo); }
    if (this.cdAtaque > 0) this.cdAtaque -= dt;
    if (this.cdHab > 0) this.cdHab -= BSI.debug && BSI.debug.op.semRecarga ? 99 : dt;
    if (this.inv > 0) this.inv -= dt;
    if (this.flash > 0) this.flash -= dt;
    if (this.animAtaque > 0) this.animAtaque -= dt;
    this.empurrao(dt, mundo.mapa);
    if (this.caido) return;

    // corpo e arma apontam pro MOUSE (só quem você controla, jogando de mouse)
    var I0 = BSI.input;
    this.mirandoMouse = !!(controlado && I0.mouse.dentro && I0.ultimoDispositivo === 'teclado' && mundo.camera && !this.bloqueado());
    if (controlado && mundo.travaAlvo && !this.bloqueado()) { // trava de alvo [X]
      var nt = U.norm(mundo.travaAlvo.x - this.x, mundo.travaAlvo.y - 5 - (this.y - 6)); this.face = nt; this.dir = U.dirDe(nt.x, nt.y); this.mirandoMouse = true; this.travado = true;
    } else if (this.mirandoMouse) {
      this.travado = false;
      var mxw = mundo.camera.x + I0.mouse.x, myw = mundo.camera.y + I0.mouse.y;
      var nm = U.norm(mxw - this.x, myw - (this.y - 9));
      if (nm.x || nm.y) { this.face = nm; this.dir = U.dirDe(nm.x, nm.y); }
    }
    // relógio da animação; parado muito tempo = mania
    this.tAnim = (this.tAnim || 0) + dt;
    this.tParado = this.movendo || this.animAtaque > 0 ? 0 : (this.tParado || 0) + dt;

    if (this.cdEsquiva > 0) this.cdEsquiva -= dt;
    if (controlado && BSI.input.apertou('esquiva') && BSI.impacto) BSI.impacto.esquivar(this, mundo);

    // de onde vem a vontade de andar: jogador ou IA
    var m;
    if (this.esquiva) m = BSI.impacto.movimentoEsquiva(this, dt, mundo) || { x: 0, y: 0, mag: 0, correndo: false };
    else if (this.bloqueado()) m = { x: 0, y: 0, mag: 0, correndo: false };
    else if (controlado) m = BSI.input.movimento();
    else m = BSI.ia.heroi(this, mundo, dt);

    // remédio errado do Zé Neto: anda em zigue-zague
    if (this.st.zonzo > 0 && m.mag > 0) {
      var r = U.girar(m.x, m.y, Math.sin(this.t * 7) * 1.1);
      m.x = r.x; m.y = r.y;
    }

    this.correndo = m.correndo && m.mag > 0.3;
    var vel = this.velocidade(mundo) * Math.min(1, m.mag * 1.2);
    this.movendo = m.mag > 0.12;
    if (this.movendo) {
      var ax = this.x, ay = this.y;
      BSI.colisao.mover(this, mundo.mapa, m.x * vel * dt, m.y * vel * dt);
      if (m.mag > 0.25 && this.animAtaque <= 0 && !this.mirandoMouse) {
        var n = U.norm(m.x, m.y);
        this.face = { x: n.x, y: n.y };
        this.dir = U.dirDe(n.x, n.y);
      }
      var andou = U.len(this.x - ax, this.y - ay);
      this.passo += andou;
      this.quadro = [1, 0, 2, 0][Math.floor(this.passo / 5) % 4];
      if (this.correndo && Math.random() < 0.3) mundo.particulas.poeira(this.x, this.y + 2);
      if (this.st.montado > 0 && Math.random() < 0.5) mundo.particulas.fumaca(this.x - this.face.x * 12, this.y);
    } else {
      this.quadro = 0;
    }

    // REZA do Vander: segurar K (ou a IA, se a alma chegar perto) afasta e machuca almas
    var alma = mundo.chefe && mundo.chefe.alma && mundo.chefe.livre() ? mundo.chefe : null;
    if (this.id === 'vander' && alma && !this.bloqueado()) {
      var rezar = controlado ? BSI.input.segurando('habilidade') : (U.dist(alma, this) < 80 && !BSI.roteiro.emCena());
      if (rezar) {
        this.st.rezando = 0.15;
        if (Math.random() < 0.01) mundo.falar(this, BSI.rng.pick(['Sai, alma penada!', 'Vai pro teu lugar, coronel!', 'Pelo Tio Ota e por Santa Isabel...']), 1.6);
      }
    }

    // arma: recarga, troca pela roda do mouse, combo, mira de precisão
    this.precisao = controlado && BSI.input.segurando('mira') && !this.bloqueado();
    if (BSI.armas) BSI.armas.atualizarHeroi(this, dt, mundo, controlado);

    // botões (só o controlado)
    if (controlado && !this.bloqueado() && !(this.st.rezando > 0)) {
      var A0 = this.arma;
      if (BSI.input.apertou('ataque') || (BSI.input.segurando('ataque') && (A0.tipo === 'corpo' || A0.cd < 0.2))) this.atacar(mundo);
      if (BSI.input.apertou('habilidade')) BSI.habilidades.usar(this, mundo);
    }
  };

  Heroi.prototype.fimEstado = function (k, mundo) {
    if (k === 'invisivel' && this.id === 'vander') this.st.posInvis = 1.5; // Vander: dano dobrado logo depois
    if (k === 'montado') mundo.falar(this, 'Desceu da moto.', 1);
    if (k === 'digitando') mundo.falar(this, '...mandei um "kkk".', 1.5);
  };

  // ---------------- mira (com ajuda automática leve) ----------------
  Heroi.prototype.mira = function (mundo, alcance, cone) {
    var fx = this.face.x, fy = this.face.y;
    var melhor = null, melhorD = alcance * alcance;
    var alvos = mundo.alvosPara('herois', true);
    for (var i = 0; i < alvos.length; i++) {
      var a = alvos[i];
      if (a.morto || a.ignorarMira) continue;
      var dx = a.x - this.x, dy = (a.y - 4) - (this.y - 6);
      var d2 = dx * dx + dy * dy;
      if (d2 > melhorD) continue;
      var d = Math.sqrt(d2) || 1;
      var cos = (dx * fx + dy * fy) / d;
      if (cos < Math.cos(cone)) continue;
      melhor = { x: dx / d, y: dy / d }; melhorD = d2;
    }
    return melhor || { x: fx, y: fy };
  };

  // ---------------- ataque ----------------
  Heroi.prototype.atacar = function (mundo, mult) {
    if (BSI.armas) return BSI.armas.atacar(this, mundo, mult);
    if (this.cdAtaque > 0 || this.st.montado > 0 || this.caido) return false;
    var A = this.arma;
    var forca = (this.st.forte > 0 ? 2 : 1) * (mult || 1) * (mundo.multDano || 1);
    if (A.tipo === 'tiro') {
      if (BSI.state.municao <= 0 && !(BSI.debug && BSI.debug.op.municaoInfinita)) {
        BSI.audio.sfx('estalo');
        this.cdAtaque = 0.4;
        mundo.falar(this, BSI.falas.sorteia('semMunicao'), 1.2, 'semMunicao');
        return false;
      }
      if (!(BSI.debug && BSI.debug.op.municaoInfinita)) BSI.state.municao--;
      // Caipora com raiva: a espingarda nega fogo
      if (mundo.dados.mata && BSI.state.medidores.raiva >= 50 && BSI.rng.chance(0.25)) {
        BSI.audio.sfx('estalo');
        this.cdAtaque = 0.8;
        mundo.falar(this, BSI.falas.sorteia('negaFogo'), 1.6);
        return false;
      }
      var cone = BSI.input.ultimoDispositivo === 'teclado' ? 0.35 : 0.7;
      var dir = this.mira(mundo, A.vel * A.vida, cone);
      this.face = dir; this.dir = U.dirDe(dir.x, dir.y);
      for (var i = 0; i < A.n; i++) {
        var esp = A.n > 1 ? (i / (A.n - 1) - 0.5) * A.espalha * 2 : 0;
        esp += (Math.random() - 0.5) * 0.06;
        var v = U.girar(dir.x, dir.y, esp);
        var vel = A.vel * (0.9 + Math.random() * 0.2);
        mundo.projeteis.push(new BSI.Projetil({
          x: this.x + dir.x * 8, y: this.y - 6 + dir.y * 6, vx: v.x * vel, vy: v.y * vel,
          vida: A.vida, dano: A.dano * forca, time: 'herois', tipo: 'chumbo', dono: this
        }));
      }
      mundo.clarao(this.x + dir.x * 10, this.y - 6 + dir.y * 8);
      mundo.camera.tremer(A.tremor);
      BSI.audio.sfx(A.som || 'tiro');
      this.kbx -= dir.x * 40; this.kby -= dir.y * 40;
      this.cdAtaque = A.cd;
      this.animAtaque = 0.12;
      mundo.barulho(this.x, this.y, 160); // tiro chama atenção
      return true;
    }
    // corpo a corpo
    var alc = A.alcance;
    var dirM = this.mira(mundo, 26, 0.9);
    this.face = dirM; this.dir = U.dirDe(dirM.x, dirM.y);
    var hx = this.x + dirM.x * 9, hy = this.y - 4 + dirM.y * 8;
    var acertou = false;
    var alvos = mundo.alvosPara('herois');
    for (var j = 0; j < alvos.length; j++) {
      var a = alvos[j];
      if (a.morto) continue;
      if (U.dist2(a.x, a.y - 4, hx, hy) < (alc + a.hw) * (alc + a.hw)) {
        a.levarDano(A.dano * forca, mundo, this, 'corpo');
        acertou = true;
      }
    }
    // rebater as PROMESSAS do Rafael CDs de volta pro palanque
    var ch = mundo.chefe;
    if (ch && ch.cds && ch.refletir) {
      var self = this;
      mundo.projeteis.forEach(function (p) {
        if (p.tipo === 'promessa' && p.time !== 'herois' && U.dist2(p.x, p.y, hx, hy) < (alc + 9) * (alc + 9)) { ch.refletir(p, self); acertou = true; }
      });
    }
    BSI.audio.sfx(acertou ? 'acerto' : 'facada');
    this.cdAtaque = A.cd;
    this.animAtaque = 0.14;
    return acertou;
  };

  // ---------------- dano e cura ----------------
  Heroi.prototype.levarDano = function (qtd, mundo, fonte, tipo) {
    if (this.caido || this.inv > 0) return;
    // dificuldade: dano dos inimigos (arredonda no sorteio pra meio-coração continuar justo)
    if (fonte && fonte.time !== 'herois' && BSI.dificuldade && qtd > 0) { var dq = qtd * BSI.dificuldade().danoInimigo; qtd = Math.floor(dq) + (Math.random() < dq % 1 ? 1 : 0); if (qtd <= 0) { this.inv = 0.3; this.flash = 0.1; return; } }
    // nota da caixa de som do Gojoba: não tira vida, tira JUÍZO
    if (tipo === 'nota') {
      this.inv = 0.5; this.flash = 0.2;
      BSI.story.medidor('juizo', -4, null, true);
      BSI.audio.sfx('blip');
      return;
    }
    // chinelada da Tia Zane: não tira vida, mas conta na perseguição
    if (fonte && fonte.chinela) {
      this.inv = 0.9; this.flash = 0.3; this.empurrar(fonte.x, fonte.y, 160);
      BSI.audio.sfx('chinela'); mundo.camera.tremer(3);
      if (mundo.perseguicao) mundo.perseguicao.chinelada(mundo);
      return;
    }
    if (BSI.debug && BSI.debug.op.invencivel) return;
    if (this.id === 'daniel' && tipo === 'fogo') return; // Daniel não se queima. Ele sorri.
    // escudo do João Luiz segura golpe de frente
    if (this.st.escudo > 0 && fonte && tipo !== 'fogo') {
      var dx = fonte.x - this.x, dy = fonte.y - this.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
      if ((dx * this.face.x + dy * this.face.y) / d > 0.2) { BSI.audio.sfx('estalo'); return; }
    }
    this.vida -= qtd;
    this.inv = 1.0;
    this.flash = 0.3;
    if (fonte) this.empurrar(fonte.x, fonte.y, 140);
    mundo.camera.tremer(2);
    BSI.audio.sfx('dano');
    if (this.st.digitando > 0) this.st.digitando = 0.01; // levou um susto e largou o celular
    if (this.id === 'zeneto' && this.vida > 0) {
      this.st.desmaio = 2;
      mundo.falar(this, BSI.falas.sorteia('zenetoDesmaio'), 1.6);
    }
    if (this.vida <= 0) {
      this.vida = 0;
      this.caido = true;
      this.st = {};
      BSI.audio.sfx('queda');
      mundo.aoCairHeroi(this);
    }
  };

  Heroi.prototype.curar = function (qtd) {
    if (this.caido) return;
    var antes = this.vida;
    this.vida = Math.min(this.vidaMax, this.vida + qtd);
    if (this.vida > antes && BSI.falasVivas && BSI.jogo && BSI.jogo.mundo) BSI.falasVivas.dizer(BSI.jogo.mundo, this, 'curado', { chance: 0.5 });
  };
  Heroi.prototype.reviver = function (vida) {
    this.caido = false;
    this.vida = Math.min(this.vidaMax, vida || 2);
    this.inv = 1.5;
    this.st = {};
  };

  // ---------------- desenho ----------------
  Heroi.prototype.desenhar = function (g, cx, cy) {
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    var spr = this.spr;
    if (this.caido) {
      // deitado no chão
      g.save();
      g.globalAlpha = 0.85;
      g.translate(x, y - 2);
      g.rotate(Math.PI / 2);
      var ec = spr.esc || 1;
      g.drawImage(spr.quadro ? spr.quadro('cair', 'down', 2) : spr.dirs.down[0], -spr.w / ec / 2, -spr.h / ec / 2 - 2, spr.w / ec, spr.h / ec);
      g.restore();
      g.globalAlpha = 1;
      return;
    }
    var montado = this.st.montado > 0;
    this.sombra(g, cx, cy, montado ? 22 : 10);
    if (montado) {
      var moto = BSI.sprites.objeto('moto');
      var esq = this.face.x < 0;
      g.drawImage(esq ? moto.c : moto.espelho, x - 14, y - 14, moto.w, moto.h);
    }
    var alfa = (this.st.invisivel > 0) ? 0.3 : 1;
    if (this.inv > 0 && !this.flash && Math.floor(this.inv * 12) % 2 === 0) alfa *= 0.5;
    var oy = montado ? -5 : 0;
    var yb = this.y + oy;
    var an = this.animacao(), img = spr.quadro ? spr.quadro(an.nome, this.dir, an.i) : spr.dirs[this.dir][this.quadro];
    if (this.flash > 0 && Math.floor(this.flash * 20) % 2 === 0) img = spr.flash ? spr.flash(img, '#ffffff') : spr.branco[this.dir][this.quadro];
    // arma atrás do corpo quando está de costas
    var armaAtras = this.dir === 'up';
    if (armaAtras && !montado) this.desenharArma(g, x, y + oy, alfa, an);
    if (this.esquiva) { // rolamento: o boneco dá uma cambalhota
      var pe = 1 - this.esquiva.t / this.esquiva.t0;
      g.save(); g.translate(this.x - cx, yb - cy - 8); g.rotate(pe * Math.PI * 2 * (this.esquiva.x < 0 ? -1 : 1));
      BSI.sprites.pintar(g, spr, spr.quadro ? spr.quadro('cair', this.dir, 1) : img, 0, 8 + 4, alfa); g.restore();
    } else BSI.sprites.pintar(g, spr, img, this.x - cx, yb - cy, alfa);
    if (!armaAtras && !montado) this.desenharArma(g, x, y + oy, alfa, an);

    // golpe: risco branco na direção do ataque
    if (this.animAtaque > 0) {
      var fx = this.face.x, fy = this.face.y;
      if (this.arma.tipo === 'corpo') {
        g.fillStyle = 'rgba(255,250,230,0.9)';
        for (var i = -2; i <= 2; i++) {
          var p = U.girar(fx, fy, i * 0.35);
          g.fillRect(Math.round(x + p.x * 11), Math.round(y - 5 + p.y * 9), 2, 2);
        }
      } else {
        g.fillStyle = BSI.cor.fogo1;
        g.fillRect(Math.round(x + fx * 11) - 1, Math.round(y - 6 + fy * 9) - 1, 3, 3);
      }
    }
    // escudo do João Luiz
    if (this.st.escudo > 0) {
      var sx = Math.round(x + this.face.x * 9), sy = Math.round(y - 6 + this.face.y * 7);
      g.fillStyle = '#b8bec6'; g.fillRect(sx - 4, sy - 5, 8, 10);
      g.fillStyle = '#e8eef6'; g.fillRect(sx - 3, sy - 4, 2, 2);
      g.fillStyle = BSI.cor.contorno; g.fillRect(sx - 1, sy - 1, 2, 2);
    }
    this.desenharEstados(g, x, y + oy);
  };

  // qual animação e quadro mostrar agora
  Heroi.prototype.animacao = function () {
    var spr = this.spr;
    if (!spr.quadro) return { nome: 'parado', i: this.quadro };
    if (this.flash > 0) return { nome: 'dano', i: this.flash > 0.12 ? 0 : 1 };
    if (this.animAtaque > 0) {
      if (!(this._atkMax >= this.animAtaque)) this._atkMax = this.animAtaque;
      var p = 1 - this.animAtaque / this._atkMax, tiro = this.arma.tipo === 'tiro';
      var n = spr.n(tiro ? 'atirar' : 'atacar');
      return { nome: tiro ? 'atirar' : 'atacar', i: Math.min(n - 1, Math.floor(p * n)), p: p };
    }
    this._atkMax = 0;
    if (this.movendo) return { nome: this.correndo ? 'correr' : 'andar', i: Math.floor(this.passo / (this.correndo ? 4.5 : 3.2)) };
    // mania: depois de 5 s parado, faz a mania por uns 3 s e para um pouco
    var tp = this.tParado || 0;
    if (tp > 5 && (tp - 5) % 9 < 3) return { nome: 'mania', i: Math.floor(tp * 5) };
    return { nome: 'parado', i: Math.floor((this.tAnim || 0) * 2.2) };
  };

  // a arma na mão, apontando pra onde ele olha (o mouse, se for você)
  Heroi.prototype.desenharArma = function (g, x, y, alfa, an) {
    if (!BSI.boneco || !BSI.boneco.arma) return;
    var arte = BSI.boneco.arma(this.arma.id || this.def.arma);
    if (!arte) return;
    var ang = Math.atan2(this.face.y, this.face.x);
    var corpo = this.arma.tipo === 'corpo';
    // golpe: a lâmina varre um arco
    if (corpo && an && an.nome === 'atacar') ang += (an.p - 0.5) * 2.4 * (this.face.x < 0 ? -1 : 1);
    else if (corpo) ang += this.face.x < 0 ? -0.9 : 0.9; // em repouso, ponta pra baixo
    var recuo = an && an.nome === 'atirar' && an.i === 1 ? -2 : 0;
    var hx = x + this.face.x * (3 + recuo), hy = y - 9 + this.face.y * 2 + (this.dir === 'down' ? 1 : 0);
    g.save();
    g.globalAlpha = alfa === undefined ? 1 : alfa;
    g.translate(hx, hy);
    g.rotate(ang);
    if (Math.cos(ang) < 0) g.scale(1, -1); // não fica de cabeça pra baixo
    g.drawImage(arte.c, -arte.px / 2, -arte.py / 2, arte.c.width / 2, arte.c.height / 2);
    g.restore();
    // clarão na boca do cano (textura CC0) e risco do golpe
    var IM = BSI.imagens || {};
    if (an && an.nome === 'atirar' && an.i <= 1 && IM['part:boca1']) {
      var dist0 = arte.c.width / 2 - arte.px / 2 + 4;
      g.save(); g.globalCompositeOperation = 'lighter'; g.imageSmoothingEnabled = true; g.globalAlpha = an.i === 0 ? 0.95 : 0.5;
      g.translate(hx + Math.cos(ang) * dist0, hy + Math.sin(ang) * dist0); g.rotate(ang + Math.PI / 2);
      g.drawImage(BSI.imagemTingida('part:boca' + (1 + (Math.floor(this.t * 30) % 2)), '#ffd060'), -7, -13, 14, 14);
      g.restore();
    } else if (an && an.nome === 'atacar' && an.i >= 1 && an.i <= 3 && IM['part:corte']) {
      g.save(); g.globalCompositeOperation = 'lighter'; g.imageSmoothingEnabled = true; g.globalAlpha = 0.7 - Math.abs(an.i - 2) * 0.2;
      g.translate(x + this.face.x * 9, y - 7 + this.face.y * 7); g.rotate(Math.atan2(this.face.y, this.face.x));
      g.drawImage(BSI.imagemTingida('part:corte', '#fff1d0'), -9, -9, 18, 18);
      g.restore();
    }
    else if (an && an.nome === 'atirar' && an.i <= 1) {
      var bx = hx + Math.cos(ang) * (arte.c.width / 2 - arte.px / 2), byy = hy + Math.sin(ang) * (arte.c.width / 2 - arte.px / 2);
      g.fillStyle = '#fff1a8'; g.fillRect(Math.round(bx) - 1, Math.round(byy) - 1, 3, 3);
      g.fillStyle = BSI.cor.fogo2; g.fillRect(Math.round(bx + Math.cos(ang) * 3) - 1, Math.round(byy + Math.sin(ang) * 3) - 1, 2, 2);
    }
  };

  Heroi.prototype.desenharEstados = function (g, x, y) {
    var t = this.t;
    if (this.st.rezando > 0) {
      // aura dourada da reza
      g.strokeStyle = 'rgba(240,199,94,' + (0.35 + Math.sin(t * 9) * 0.2).toFixed(2) + ')';
      g.beginPath(); g.ellipse(x, y - 2, 56 + Math.sin(t * 4) * 3, 32, 0, 0, Math.PI * 2); g.stroke();
      g.fillStyle = BSI.cor.amarelo; g.fillRect(x, y - 28, 1, 5); g.fillRect(x - 2, y - 27, 5, 1);
    }
    if (this.st.zonzo > 0 || this.st.desmaio > 0 || this.st.atordoado > 0) {
      g.fillStyle = BSI.cor.amarelo;
      for (var i = 0; i < 3; i++) {
        var a = t * 5 + i * 2.1;
        g.fillRect(Math.round(x + Math.cos(a) * 6), Math.round(y - 19 + Math.sin(a) * 2), 1, 1);
      }
    }
    if (this.st.digitando > 0) {
      // balãozinho de "digitando..."
      g.fillStyle = BSI.cor.branco; g.fillRect(x + 3, y - 25, 11, 6);
      g.fillStyle = BSI.cor.contorno;
      for (var j = 0; j < 3; j++) if (Math.floor(t * 4) % 3 >= j) g.fillRect(x + 5 + j * 3, y - 22, 1, 1);
    }
  };

  BSI.Heroi = Heroi;
})();
