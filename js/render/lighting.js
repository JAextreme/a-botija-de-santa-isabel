/* =========================================================
   lighting.js — escuridão de verdade.
   Pinta uma camada escura do tamanho da tela e "fura" buracos
   de luz (lanterna, fogueira, fogo, vagalume, lua). Depois
   soma um brilho quente por cima onde tem fogo.
   ========================================================= */
(function () {
  'use strict';

  var camada = null, g = null;

  function garantir() {
    var e = BSI.view.det || 1;
    if (!camada || BSI.view.mudou || camada.width !== BSI.view.w * e || camada.height !== BSI.view.h * e) {
      camada = document.createElement('canvas');
      camada.width = BSI.view.w * e; camada.height = BSI.view.h * e;
      g = camada.getContext('2d');
      BSI.view.mudou = false;
    }
  }

  BSI.luz = {
    /*
      luzes: [{x, y, r, forca(0-1), cor?}] em coordenadas do mundo
      ambiente: 0 = breu total, 1 = dia claro
    */
    desenhar: function (ctx, luzes, ambiente, cx, cy, tinta) {
      if (ambiente >= 0.99) return;
      garantir();
      var e = BSI.view.det || 1, W = BSI.view.w, Hh = BSI.view.h;
      var tex = BSI.sprites.luz();
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalCompositeOperation = 'source-over';
      g.clearRect(0, 0, camada.width, camada.height); // sem isso a escuridão acumula de um quadro pro outro
      g.setTransform(e, 0, 0, e, 0, 0);
      g.imageSmoothingEnabled = true; // luz com degradê suave
      g.fillStyle = tinta || 'rgb(10,8,30)';
      g.globalAlpha = 1 - ambiente;
      g.fillRect(0, 0, W, Hh);
      g.globalAlpha = 1;
      g.globalCompositeOperation = 'destination-out';
      for (var i = 0; i < luzes.length; i++) {
        var L = luzes[i];
        var x = L.x - cx, y = L.y - cy, r = L.r;
        if (x + r < 0 || y + r < 0 || x - r > W || y - r > Hh) continue;
        g.globalAlpha = L.forca === undefined ? 1 : L.forca;
        g.drawImage(tex, x - r, y - r, r * 2, r * 2);
      }
      g.globalAlpha = 1;
      g.globalCompositeOperation = 'source-over';
      ctx.drawImage(camada, 0, 0, W, Hh);

      // brilho colorido somado (fogo laranja, alma azul)
      ctx.globalCompositeOperation = 'lighter';
      for (var j = 0; j < luzes.length; j++) {
        var Lc = luzes[j];
        if (!Lc.cor) continue;
        var xx = Lc.x - cx, yy = Lc.y - cy, rr = Lc.r * 0.8;
        if (xx + rr < 0 || yy + rr < 0 || xx - rr > W || yy - rr > Hh) continue;
        ctx.globalAlpha = 0.22 * (Lc.forca === undefined ? 1 : Lc.forca);
        ctx.drawImage(BSI.sprites.brilho(Lc.cor), xx - rr, yy - rr, rr * 2, rr * 2);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }
  };
})();
