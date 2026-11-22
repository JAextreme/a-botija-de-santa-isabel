/* =========================================================
   entity.js — base de tudo que anda no mundo.
   x,y = centro da caixa dos pés; hw,hh = meia caixa.
   time: 'herois' | 'inimigos' | 'neutro' (bichos)
   ========================================================= */
(function () {
  'use strict';

  function Entidade(x, y, hw, hh) {
    this.x = x; this.y = y;
    this.hw = hw || 4; this.hh = hh || 3;
    this.kbx = 0; this.kby = 0;   // empurrão (knockback)
    this.flash = 0;               // piscar branco ao levar dano
    this.morto = false;
    this.time = 'neutro';
    this.t = Math.random() * 10;  // relógio próprio (animações)
  }

  // aplica e amortece o empurrão
  Entidade.prototype.empurrao = function (dt, mapa) {
    if (Math.abs(this.kbx) < 1 && Math.abs(this.kby) < 1) { this.kbx = this.kby = 0; return; }
    BSI.colisao.mover(this, mapa, this.kbx * dt, this.kby * dt);
    var at = Math.pow(0.0005, dt);
    this.kbx *= at; this.kby *= at;
  };
  Entidade.prototype.empurrar = function (deX, deY, forca) {
    var n = BSI.util.norm(this.x - deX, this.y - deY);
    this.kbx += n.x * forca; this.kby += n.y * forca;
  };

  // desenha sombra oval nos pés
  Entidade.prototype.sombra = function (g, cx, cy, larg) {
    larg = larg || 10;
    if (BSI.efeitos && BSI.view.det > 1) { BSI.efeitos.sombra(g, this, cx, cy, larg); return; }
    g.fillStyle = 'rgba(20,10,20,0.35)';
    var x = Math.round(this.x - cx), y = Math.round(this.y - cy);
    g.fillRect(x - larg / 2 + 1, y, larg - 2, 2);
    g.fillRect(x - larg / 2, y + 1, larg, 1);
  };

  // desenha sprite de um conjunto (spritecache) na direção/quadro
  Entidade.prototype.desenharSprite = function (g, cx, cy, spr, dir, quadro, alfa) {
    var lista = spr.dirs[dir] || spr.dirs.left || spr.dirs.down;
    var img = (this.flash > 0 && Math.floor(this.flash * 20) % 2 === 0) ? (spr.branco[dir] || spr.branco.left)[quadro] : lista[quadro];
    BSI.sprites.pintar(g, spr, img, this.x - cx, this.y - cy, alfa);
  };

  BSI.Entidade = Entidade;
})();
