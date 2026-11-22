/* =========================================================
   camera.js — segue o personagem controlado, olha um pouco
   pra frente, treme em tiros e explosões e respeita a borda do mapa.
   ========================================================= */
(function () {
  'use strict';

  function Camera() {
    this.x = 0; this.y = 0;       // canto superior esquerdo (pixels do mundo)
    this.tremor = 0;              // intensidade atual do tremor
    this.ox = 0; this.oy = 0;     // deslocamento do tremor neste quadro
  }

  // centraliza na hora (troca de mapa)
  Camera.prototype.pular = function (alvo, mapa) {
    this.x = alvo.x - BSI.view.w / 2;
    this.y = alvo.y - BSI.view.h / 2;
    this.limitar(mapa);
  };

  Camera.prototype.atualizar = function (dt, alvo, mapa) {
    if (alvo) {
      var fx = alvo.face ? alvo.face.x * 14 : 0;
      var fy = alvo.face ? alvo.face.y * 10 : 0;
      var tx = alvo.x + fx - BSI.view.w / 2;
      var ty = alvo.y + fy - BSI.view.h / 2 - 6;
      var k = 1 - Math.exp(-7 * dt);
      this.x += (tx - this.x) * k;
      this.y += (ty - this.y) * k;
    }
    this.limitar(mapa);
    // tremor decai sozinho
    if (this.tremor > 0) {
      this.tremor = Math.max(0, this.tremor - dt * 12);
      this.ox = (Math.random() * 2 - 1) * this.tremor;
      this.oy = (Math.random() * 2 - 1) * this.tremor;
    } else { this.ox = this.oy = 0; }
  };

  Camera.prototype.limitar = function (mapa) {
    if (!mapa) return;
    var mw = mapa.w * BSI.cfg.TILE, mh = mapa.h * BSI.cfg.TILE;
    var vw = BSI.view.w, vh = BSI.view.h;
    // mapa menor que a tela: centraliza
    if (mw <= vw) this.x = (mw - vw) / 2;
    else this.x = BSI.util.clamp(this.x, 0, mw - vw);
    if (mh <= vh) this.y = (mh - vh) / 2;
    else this.y = BSI.util.clamp(this.y, 0, mh - vh);
  };

  Camera.prototype.tremer = function (forca) { if (BSI.acess && BSI.acess.semTremor()) return; this.tremor = Math.max(this.tremor, forca); };

  // posição inteira para desenhar (pixel perfeito)
  Camera.prototype.ix = function () { return Math.round(this.x + this.ox); };
  Camera.prototype.iy = function () { return Math.round(this.y + this.oy); };

  BSI.Camera = Camera;
})();
