/* =========================================================
   dogs.js — TROVÃO e PIABA, os cachorros de caça.
   Seguem o grupo, mordem inimigo que chega perto e, de noite
   na mata, latem pro nada (e ninguém sabe pra quê).
   Ninguém consegue machucar os cachorros.
   ========================================================= */
(function () {
  'use strict';
  var U = BSI.util;

  function Cachorro(id, x, y, lado) {
    BSI.Entidade.call(this, x, y, 4, 3);
    this.id = id;
    this.nome = id === 'trovao' ? 'Trovão' : 'Piaba';
    this.spr = BSI.sprites[id]();
    this.lado = lado;
    this.time = 'cachorro';
    this.face = { x: 1, y: 0 };
    this.quadro = 0; this.passo = 0;
    this.cdMordida = 0;
    this.tLatido = 8 + Math.random() * 15;
    this.latindo = 0;
  }
  Cachorro.prototype = Object.create(BSI.Entidade.prototype);

  Cachorro.prototype.latir = function (mundo, dir) {
    this.latindo = 1.4;
    if (dir) this.face.x = dir;
    BSI.audio.sfx('latido');
    mundo.falar(this, 'Au! Au!', 1.2);
  };

  Cachorro.prototype.atualizar = function (dt, mundo) {
    this.t += dt;
    if (this.cdMordida > 0) this.cdMordida -= dt;
    if (this.latindo > 0) { this.latindo -= dt; this.quadro = 0; return; }
    var L = mundo.lider();
    if (!L) return;
    if (U.dist(this, L) > 190) { var p = mundo.mapa.pontoLivre(L.x - L.face.x * 14, L.y - L.face.y * 14, 4, 3); this.x = p.x; this.y = p.y; }

    // inimigo perto: vai morder
    var alvo = null, md = 75 * 75;
    if (!BSI.roteiro.emCena()) mundo.inimigos.forEach(function (e) {
      if (e.morto || e.time !== 'inimigos' || U.dist(e, L) > 150) return;
      var d = U.dist2(e.x, e.y, this.x, this.y);
      if (d < md) { md = d; alvo = e; }
    }, this);
    var tx, ty, vel = 82;
    if (alvo) {
      tx = alvo.x; ty = alvo.y;
      if (md < 13 * 13 && this.cdMordida <= 0) {
        this.cdMordida = 1.0;
        alvo.levarDano(1, mundo, this, 'corpo');
        BSI.audio.sfx('latido');
      }
    } else {
      // segue do lado do líder
      tx = L.x - L.face.x * 10 + this.lado * 12 * (Math.abs(L.face.y) > 0.5 ? 1 : 0);
      ty = L.y - L.face.y * 10 + this.lado * 10 * (Math.abs(L.face.x) > 0.5 ? 1 : 0);
      vel = U.dist2(this.x, this.y, tx, ty) > 60 * 60 ? 100 : 70;
    }
    var d2 = U.dist2(this.x, this.y, tx, ty);
    if (d2 > 36) {
      var n = U.norm(tx - this.x, ty - this.y), ax = this.x;
      BSI.colisao.mover(this, mundo.mapa, n.x * vel * dt, n.y * vel * dt);
      if (Math.abs(n.x) > 0.2) this.face.x = n.x;
      this.passo += Math.abs(this.x - ax) + 0.3;
      this.quadro = [1, 0, 2, 0][Math.floor(this.passo / 4) % 4];
    } else this.quadro = 0;

    // latindo pro nada na mata escura
    if (mundo.dados.mata && !BSI.roteiro.emCena()) {
      this.tLatido -= dt;
      if (this.tLatido <= 0) { this.tLatido = 18 + Math.random() * 25; this.latir(mundo, Math.random() < 0.5 ? -1 : 1); }
    }
  };
  Cachorro.prototype.levarDano = function () { };
  Cachorro.prototype.desenhar = function (g, cx, cy) {
    this.sombra(g, cx, cy, 10);
    this.desenharSprite(g, cx, cy, this.spr, this.face.x > 0 ? 'right' : 'left', this.quadro);
  };

  BSI.Cachorro = Cachorro;
})();
