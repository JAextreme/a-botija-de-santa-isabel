/* =========================================================
   animals.js — bichos da caatinga.
   Caçar dá pra caçar... mas cada caça sobe a RAIVA DA CAIPORA.
   (No protótipo: o peba. Tatu, mocó e avoante chegam no Ato 1.)
   ========================================================= */
(function () {
  'use strict';
  var U = BSI.util;

  BSI.data.bichos = {
    peba: { nome: 'Peba', vida: 1, vel: 34, fuga: 55, raiva: 12, sprite: 'peba' },
    tatu: { nome: 'Tatu', vida: 2, vel: 40, fuga: 60, raiva: 12, sprite: 'tatu' },
    moco: { nome: 'Mocó', vida: 1, vel: 55, fuga: 70, raiva: 8, sprite: 'moco' },
    avoante: { nome: 'Avoante', vida: 1, vel: 20, fuga: 45, raiva: 6, sprite: 'avoante', voa: true }
  };

  function Bicho(id, x, y) {
    BSI.Entidade.call(this, x, y, 5, 3);
    this.id = id;
    this.d = BSI.data.bichos[id];
    this.vida = this.d.vida;
    this.time = 'neutro';
    this.casa = { x: x, y: y };
    this.destino = null; this.tDest = 0;
    this.face = { x: -1, y: 0 };
    this.quadro = 0; this.passo = 0;
    this.spr = BSI.sprites[this.d.sprite]();
  }
  Bicho.prototype = Object.create(BSI.Entidade.prototype);

  Bicho.prototype.atualizar = function (dt, mundo) {
    this.t += dt;
    if (this.flash > 0) this.flash -= dt;
    this.empurrao(dt, mundo.mapa);
    // foge de quem chegar perto (menos do Davi, que conversa com bicho)
    var perigo = null, md = this.d.fuga * this.d.fuga;
    mundo.herois.forEach(function (h) {
      if (h.caido || h.id === 'davi' || h.st.invisivel > 0) return;
      var d2 = U.dist2(h.x, h.y, this.x, this.y);
      if (d2 < md) { md = d2; perigo = h; }
    }, this);
    var nx = 0, ny = 0, mult = 0.4;
    // avoante: levanta voo e vai embora por cima de tudo
    if (this.d.voa && (perigo || this.voando)) {
      if (!this.voando) { this.voando = true; var nv = perigo ? U.norm(this.x - perigo.x, this.y - perigo.y) : { x: 1, y: -1 }; this.vx = nv.x * 90; this.vy = nv.y * 90 - 30; }
      this.x += this.vx * dt; this.y += this.vy * dt; this.alt = Math.min(14, (this.alt || 0) + dt * 30);
      this.face.x = this.vx; this.quadro = 1 + Math.floor(this.t * 14) % 2;
      var T = BSI.cfg.TILE;
      if (this.x < -20 || this.y < -20 || this.x > mundo.mapa.w * T + 20 || this.y > mundo.mapa.h * T + 20) this.morto = true;
      return;
    }
    if (perigo) {
      var n = U.norm(this.x - perigo.x, this.y - perigo.y);
      nx = n.x; ny = n.y; mult = 1.5;
    } else {
      this.tDest -= dt;
      if (!this.destino || this.tDest <= 0) {
        this.destino = { x: this.casa.x + (Math.random() - 0.5) * 60, y: this.casa.y + (Math.random() - 0.5) * 60 };
        this.tDest = 2 + Math.random() * 3;
      }
      if (U.dist(this.destino, this) > 4) { var m = U.norm(this.destino.x - this.x, this.destino.y - this.y); nx = m.x; ny = m.y; }
    }
    if (nx || ny) {
      var ax = this.x, ay = this.y;
      BSI.colisao.mover(this, mundo.mapa, nx * this.d.vel * mult * dt, ny * this.d.vel * mult * dt);
      if (Math.abs(nx) > 0.1) this.face.x = nx;
      this.passo += U.len(this.x - ax, this.y - ay);
      this.quadro = Math.floor(this.passo / 3) % 2;
    } else this.quadro = 0;
  };

  Bicho.prototype.levarDano = function (qtd, mundo, fonte, tipo) {
    if (this.morto) return;
    this.vida -= qtd;
    this.flash = 0.2;
    if (this.vida <= 0) {
      this.morto = true;
      mundo.particulas.explosao(this.x, this.y - 3, 10, ['#a89070', '#c8b090', 'rgba(225,190,140,0.9)'], 40, 0.5);
      BSI.audio.sfx('morte');
      mundo.aoCacar(this);
    }
  };

  Bicho.prototype.desenhar = function (g, cx, cy) {
    this.sombra(g, cx, cy, this.d.voa ? 6 : 12);
    this.desenharSprite(g, cx, cy - Math.round(this.alt || 0), this.spr, this.face.x > 0 ? 'right' : 'left', this.quadro);
  };

  BSI.Bicho = Bicho;
})();
