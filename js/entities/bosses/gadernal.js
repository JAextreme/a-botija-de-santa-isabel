/* =========================================================
   bosses/gadernal.js — BOSS 2: EMANUEL, vulgo "GADERNAL"
   Irmão perdido do Davi, guardando "o tesouro do vô Joaquim".
   Caos puro: A CADA POUCO AS REGRAS MUDAM (faixa avisa):
     BRIGA       corre atrás e joga cadeira (aviso: pisca vermelho)
     INVERTIDO   os controles do grupo ficam invertidos
     A SALA GIRA a tela gira enquanto ele briga
     CAFEZINHO   para tudo e oferece café (aceitar cura... e ele
                 ataca pelas costas)
     TELHADO     sobe no telhado e joga telha (sombra mostra onde cai)
     CHORO       senta e chora: leva dano dobrado
   A barra é a FÚRIA dele. Na metade, alguém tropeça no DIAZEPAN
   dormindo no meio da sala. Acordar o Diazepan (ficar perto dele
   3 s sem levar dano) acalma o Gadernal e termina a luta.
   ========================================================= */
(function () {
  'use strict';
  var U = BSI.util, C = BSI.cor;

  var REGRAS = {
    briga: { nome: 'BRIGA!', dica: 'Ele corre atrás e joga cadeira.' },
    invertido: { nome: 'CONTROLES INVERTIDOS!', dica: 'Esquerda é direita, cima é baixo.' },
    gira: { nome: 'A SALA TÁ GIRANDO!', dica: 'Ou é tu que tá girando?' },
    cafe: { nome: 'HORA DO CAFEZINHO', dica: 'Ele parou tudo pra passar um café.' },
    telhado: { nome: 'SUBIU NO TELHADO!', dica: 'Cuidado com as telhas: a sombra mostra onde caem.' },
    chora: { nome: 'ELE TÁ CHORANDO', dica: 'Agora! Dano dobrado.' }
  };

  function Gadernal(x, y) {
    BSI.Entidade.call(this, x, y, 5, 3);
    this.chefe = true; this.humano = true; this.semPips = true;
    this.d = { nome: 'Emanuel "Gadernal" — fúria', visao: 300 };
    this.time = 'inimigos';
    this.vidaFase = 100; this.vida = 100;
    this.ativo = false; this.estado = 'parado'; this.regra = 'briga'; this.tRegra = 0;
    this.st = {}; this.face = { x: 0, y: 1 }; this.dir = 'down'; this.quadro = 0; this.passo = 0;
    this.cdCadeira = 2; this.cdGolpe = 0; this.tGolpe = 0; this.prep = 0;
    this.revelouDiazepan = !!BSI.story.tem('diazepan_achado');
    this.spr = BSI.sprites.humano('npc:gadernal', BSI.data.falantes.gadernal.visual);
    this.tFala = 2; this.usadas = [];
    if (BSI.story.tem('gadernal_luta') && !BSI.story.tem('gadernal_calmo')) { this.ativo = true; this.estado = 'luta'; }
  }
  Gadernal.prototype = Object.create(BSI.Entidade.prototype);
  var P = Gadernal.prototype;
  P.livre = function () { return this.ativo && this.estado === 'luta'; };
  P.atordoar = function (s) { if (this.livre() && this.regra !== 'telhado') this.st.atordoado = Math.min(1.5, s); };
  P.acalmar = function (s) { if (this.livre()) this.st.atordoado = Math.min(2, s); };
  P.virarBode = function (s) { if (this.livre() && this.regra !== 'telhado') this.st.bode = Math.min(3, s); };
  P.converter = function () { }; P.ouvir = function () { };
  P.forcarAlvo = function (h, s) { this.provocador = h; this.st.provocado = s; };
  P.fugir = function (s, de) { if (this.livre()) { this.st.medo = Math.min(2, s); this.medoDe = { x: de.x, y: de.y }; } };
  P.morrer = function (m) { this.levarDano(999, m, null, 'debug'); };
  P.pularFase = function (m) { this.levarDano(35, m, null, 'ritual'); };

  P.ativar = function () { this.ativo = true; this.estado = 'luta'; this.trocarRegra('briga'); BSI.story.flag('gadernal_luta'); };

  P.trocarRegra = function (forcada, m) {
    var lista = ['briga', 'invertido', 'gira', 'cafe', 'telhado', 'chora'].filter(function (r) { return r !== this.regra; }, this);
    if (this.vida <= 0) lista = ['chora'];
    var r = forcada || BSI.rng.pick(lista);
    if (r === 'cafe' && this.usadas.indexOf('cafe') >= 0 && Math.random() < 0.6) r = 'briga'; // café não toda hora
    this.usadas.push(r);
    this.regra = r; this.tRegra = 0;
    var M = m || BSI.jogo.mundo;
    if (M) { M.inverterForcado = r === 'invertido'; if (r !== 'gira') M.giro = 0; }
    BSI.hud.faixa('NOVA REGRA: ' + REGRAS[r].nome, REGRAS[r].dica, '');
    BSI.audio.sfx('alerta');
    if (r === 'telhado' && M) { this.subiu = { x: this.x, y: this.y }; M.particulas.explosao(this.x, this.y - 8, 10, ['rgba(225,190,140,0.9)'], 40, 0.5); }
    if (r === 'cafe' && M) this.cafe(M);
  };

  P.cafe = function (m) {
    var self = this;
    BSI.story.flag('aceitou_cafe', false);
    BSI.roteiro.rodar([
      ['fala', 'gadernal_cafe'],
      ['faz', function (mm) {
        if (BSI.story.tem('aceitou_cafe')) {
          mm.herois.forEach(function (h) { if (h.caido) h.reviver(4); else h.vida = h.vidaMax; });
          var L = mm.lider();
          self.x = L.x - L.face.x * 12; self.y = L.y - L.face.y * 12;
          L.inv = 0; L.levarDano(2, mm, self, 'corpo');
          mm.falar(self, 'HAHAHA! Café com traição!', 2);
        } else mm.falar(self, 'Ninguém aceita meu café! *chora*', 2);
        self.trocarRegra(BSI.story.tem('aceitou_cafe') ? 'briga' : 'chora', mm);
      }]
    ]);
  };

  P.levarDano = function (q, m, fonte, tipo) {
    if (!this.livre() || this.regra === 'telhado' || this.regra === 'cafe') return;
    if (this.regra === 'chora') q *= 2;
    if (fonte && (fonte.time === 'cachorro' || (fonte.def && fonte !== m.lider()))) q *= 0.4;
    if (m.conselho > 0) q *= 1.5;
    this.vida = Math.max(0, this.vida - q);
    this.flash = 0.2;
    if (fonte && fonte.time === 'herois') m.encherPoder(q * 2);
    BSI.audio.sfx('acerto');
    if (this.vida <= 50 && !this.revelouDiazepan) {
      this.revelouDiazepan = true;
      BSI.story.flag('diazepan_achado');
      BSI.roteiro.rodar([['fala', 'diazepan_tropeco'], ['objetivo', 'Acorde o rapaz dormindo: fique perto dele 3 s sem levar dano.']]);
    }
    if (this.vida <= 0 && this.regra !== 'chora') { this.trocarRegra('chora', m); m.falar(this, 'Eu cansei... *soluça*', 2); }
  };

  P.calmar = function (m) {
    this.estado = 'calmo'; this.ativo = false;
    m.inverterForcado = false; m.giro = 0;
    BSI.story.flag('gadernal_calmo');
  };

  P.atualizar = function (dt, m) {
    this.t += dt; this.tFala -= dt; this.tRegra += dt;
    if (this.flash > 0) this.flash -= dt;
    for (var k in this.st) if (this.st[k] > 0) this.st[k] -= dt;
    this.empurrao(dt, m.mapa);
    if (!this.ativo || this.estado !== 'luta') { this.quadro = 0; return; }
    if (BSI.roteiro.emCena()) return;
    var r = this.regra;
    // a cada ~11 s (ou menos com fúria baixa), regra nova
    var dur = r === 'telhado' ? 8 : (r === 'chora' ? (this.vida <= 0 ? 999 : 5) : 11);
    if (this.tRegra > dur) this.trocarRegra(null, m);
    if (r === 'gira') m.giro = Math.sin(this.tRegra * 0.9) * 0.32;
    if (r === 'cafe') { this.quadro = 0; return; }
    if (r === 'chora') {
      this.quadro = 0; this.dir = 'down';
      if (Math.random() < 0.06) m.particulas.add({ x: this.x + (Math.random() < 0.5 ? -3 : 3), y: this.y - 14, vx: 0, vy: 20, vida: 0.4, cor: '#9fd8ff', tam: 1 });
      if (this.tFala <= 0) { this.tFala = 3; m.falar(this, BSI.rng.pick(['Ninguém me ama!', 'Nem o vô Joaquim me visitava!', 'Eu só queria guardar o tesouro!']), 2); }
      return;
    }
    if (r === 'telhado') {
      // em cima do telhado: joga telha perto do grupo
      this.cdCadeira -= dt;
      if (this.cdCadeira <= 0) {
        this.cdCadeira = 0.45;
        var alvos = m.herois.filter(function (h) { return !h.caido; });
        var a = alvos[Math.floor(Math.random() * alvos.length)];
        if (a) m.efeitos.push({ tipo: 'telha', x: a.x + (Math.random() - 0.5) * 40, y: a.y + (Math.random() - 0.5) * 30, t: 0.9, t0: 0.9, raio: 11 });
      }
      if (this.tRegra > dur - 0.3) { var L0 = m.lider(); var p = m.mapa.pontoLivre(L0.x + 40, L0.y, 5, 3); this.x = p.x; this.y = p.y; }
      return;
    }
    if (this.st.atordoado > 0) { this.quadro = 0; return; }
    // briga / invertido / gira
    var alvo = null, md = 1e12, self = this;
    if (this.st.provocado > 0 && this.provocador && !this.provocador.caido) alvo = this.provocador;
    else m.herois.forEach(function (h) { if (h.caido || h.st.invisivel > 0) return; var d = U.dist2(h.x, h.y, self.x, self.y); if (d < md) { md = d; alvo = h; } });
    if (!alvo) return;
    var dx = alvo.x - this.x, dy = alvo.y - this.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    this.face = { x: dx / d, y: dy / d }; this.dir = U.dirDe(dx, dy);
    if (this.prep > 0) {
      this.prep -= dt;
      if (this.prep <= 0) {
        if (this.tipoPrep === 'golpe') {
          if (d < 18) alvo.levarDano(2, m, this, 'corpo');
          BSI.audio.sfx('facada');
        } else {
          m.projeteis.push(new BSI.Projetil({ x: this.x, y: this.y - 8, vx: dx / d * 140, vy: dy / d * 140, vida: 1.2, dano: 2, time: 'inimigos', tipo: 'cadeira', dono: this, raio: 4 }));
          BSI.audio.sfx('facada');
        }
      }
      return;
    }
    this.cdCadeira -= dt; this.cdGolpe -= dt;
    if (d < 15 && this.cdGolpe <= 0) { this.prep = 0.45; this.tipoPrep = 'golpe'; this.cdGolpe = 1.1; return; }
    if (d > 45 && this.cdCadeira <= 0) { this.prep = 0.55; this.tipoPrep = 'cadeira'; this.cdCadeira = 2.4; return; }
    var w = this.st.medo > 0 ? U.norm(this.x - this.medoDe.x, this.y - this.medoDe.y) : U.girar(dx / d, dy / d, Math.sin(this.t * 4) * 0.5);
    var ax = this.x;
    BSI.colisao.mover(this, m.mapa, w.x * 56 * dt, w.y * 56 * dt);
    this.passo += Math.abs(this.x - ax) + 0.3; this.quadro = [1, 0, 2, 0][Math.floor(this.passo / 5) % 4];
    if (this.tFala <= 0) { this.tFala = 4; m.falar(this, BSI.rng.pick(['O TESOURO É DO VÔ JOAQUIM!', 'Ninguém entra na tapera!', 'HAHAHA! Regra nova!', 'Tu tem cara de parente!']), 1.8); }
  };

  P.desenhar = function (g, cx, cy) {
    if (!this.ativo && this.estado !== 'parado') return;
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    if (this.ativo && this.regra === 'telhado') {
      // ele está lá em cima: só a voz e a poeira caindo
      return;
    }
    this.sombra(g, cx, cy, 10);
    var spr = this.spr, prep = this.prep > 0 && Math.floor(this.prep * 16) % 2 === 0;
    var img = this.flash > 0 ? spr.branco[this.dir][this.quadro] : (prep ? spr.vermelho[this.dir][this.quadro] : spr.dirs[this.dir][this.quadro]);
    BSI.sprites.pintar(g, spr, img, x, y);
    if (this.prep > 0) { g.fillStyle = C.barro; g.fillRect(x - 1, y - 24, 2, 4); g.fillRect(x - 1, y - 19, 2, 1); }
    if (this.prep > 0 && this.tipoPrep === 'cadeira') { var o = BSI.sprites.objeto('cadeira'); g.drawImage(o.c, x + 4, y - 26, o.w, o.h); }
  };

  Gadernal.depois = function () { return BSI.story.tem('gadernal_calmo') ? 'nada' : null; };
  Gadernal.semNpc = true;

  // =========================================================
  //  DIAZEPAN — dormindo embaixo dos sacos no meio da sala
  // =========================================================
  function Diazepan(x, y) {
    BSI.Entidade.call(this, x, y, 6, 3);
    this.diazepan = true; this.prog = 0;
    this.spr = BSI.sprites.humano('npc:diazepan', BSI.data.falantes.diazepan.visual);
  }
  Diazepan.prototype = Object.create(BSI.Entidade.prototype);
  Diazepan.prototype.revelado = function () { return BSI.story.tem('diazepan_achado'); };
  Diazepan.prototype.atualizar = function (dt, m) {
    this.t += dt;
    if (!this.revelado() || BSI.story.tem('gadernal_calmo') || BSI.roteiro.emCena()) return;
    // qualquer um do grupo perto acorda ele (não precisa ser o controlado)
    var self = this, L = null;
    m.herois.forEach(function (h) { if (!L && !h.caido && U.dist(h, self) < 24) L = h; });
    if (L) {
      if (L.flash > 0) this.prog = 0; // levou dano: perdeu a concentração
      else this.prog += dt;
      if (this.prog >= 3) {
        this.prog = 0;
        BSI.fases.dispararEvento('diazepan_acorda', m);
      }
    } else this.prog = Math.max(0, this.prog - dt);
  };
  Diazepan.prototype.desenhar = function (g, cx, cy) {
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    if (!this.revelado()) { var s = BSI.sprites.objeto('sacos'); g.drawImage(s.c, x - 11, y - 10, s.w, s.h); return; }
    if (BSI.story.tem('gadernal_calmo')) return;
    // deitado, dormindo
    g.save(); g.translate(x, y - 2); g.rotate(-Math.PI / 2); var sd = this.spr, ed = sd.esc || 1; g.drawImage(sd.dirs.down[0], -sd.w / ed / 2, -sd.h / ed / 2 - 2, sd.w / ed, sd.h / ed); g.restore();
    g.fillStyle = C.creme; var z = Math.floor(this.t * 2) % 3;
    g.fillRect(x + 6 + z * 2, y - 14 - z * 3, 3, 1); g.fillRect(x + 8 + z * 2, y - 13 - z * 3, 1, 1); g.fillRect(x + 6 + z * 2, y - 12 - z * 3, 3, 1);
    if (this.prog > 0) { BSI.hud.barra(g, x - 12, y - 22, 24, 4, this.prog / 3, C.amarelo); }
  };

  BSI.chefes = BSI.chefes || {};
  BSI.chefes.gadernal = Gadernal;
  BSI.Diazepan = Diazepan;
})();
