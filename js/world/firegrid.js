/* =========================================================
   firegrid.js — fogo que se espalha pelos tiles.
   Mato seco, garrancheira e cerca queimam e viram cinza.
   Querosene faz até chão comum queimar um pouquinho.
   Em plena seca, o fogo do Daniel abre caminho... e queima gente.
   ========================================================= */
(function () {
  'use strict';
  var T = BSI.cfg.TILE;
  var MAX_CELULAS = 350;
  var TICK = 0.1; // o fogo "pensa" 10x por segundo

  function Fogo(mapa) {
    this.mapa = mapa;
    this.celulas = {};   // índice → {tx, ty, t, total}
    this.n = 0;
    this.acum = 0;
    this.vento = { x: 0.3, y: -0.2 }; // vento leve do sertão
    this.anim = 0;
  }

  Fogo.prototype.queimando = function (tx, ty) {
    return !!this.celulas[ty * this.mapa.w + tx];
  };
  Fogo.prototype.queimandoPx = function (px, py) {
    return this.queimando(Math.floor(px / T), Math.floor(py / T));
  };

  // acende um tile. querosene = queima até chão que não pega fogo
  Fogo.prototype.acender = function (tx, ty, querosene) {
    var d = this.mapa.def(tx, ty);
    if (!d || this.n >= MAX_CELULAS) return false;
    var k = ty * this.mapa.w + tx;
    if (this.celulas[k]) return false;
    var dur = d.inflamavel;
    if (!dur) {
      if (!querosene || d.solido) return false;
      dur = 1.0 + Math.random() * 0.6;
    }
    this.celulas[k] = { tx: tx, ty: ty, t: dur, total: dur };
    this.n++;
    return true;
  };

  // acende em raio (em tiles)
  Fogo.prototype.acenderArea = function (px, py, raioTiles, querosene) {
    var cx = Math.floor(px / T), cy = Math.floor(py / T), n = 0;
    for (var y = -raioTiles; y <= raioTiles; y++)
      for (var x = -raioTiles; x <= raioTiles; x++)
        if (x * x + y * y <= raioTiles * raioTiles + 0.5 && this.acender(cx + x, cy + y, querosene)) n++;
    return n;
  };

  Fogo.prototype.apagarTudo = function () { this.celulas = {}; this.n = 0; };

  Fogo.prototype.atualizar = function (dt, mundo) {
    this.anim += dt;
    this.acum += dt;
    while (this.acum >= TICK) {
      this.acum -= TICK;
      this.passo(mundo);
    }
  };

  Fogo.prototype.passo = function (mundo) {
    var mapa = this.mapa, novos = [], k, c;
    var viz = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (k in this.celulas) {
      c = this.celulas[k];
      c.t -= TICK;
      // espalha para vizinhos inflamáveis (o vento ajuda)
      for (var i = 0; i < 4; i++) {
        var nx = c.tx + viz[i][0], ny = c.ty + viz[i][1];
        var d = mapa.def(nx, ny);
        if (!d || !d.inflamavel) continue;
        var p = 0.07 + Math.max(0, viz[i][0] * this.vento.x + viz[i][1] * this.vento.y) * 0.08;
        if (Math.random() < p) novos.push([nx, ny]);
      }
      if (c.t <= 0) {
        var def = mapa.def(c.tx, c.ty);
        if (def && def.vira) { mapa.trocar(c.tx, c.ty, def.vira); if (BSI.state) { var st = BSI.state.stats; st.queimados = (st.queimados || 0) + 1; } }
        delete this.celulas[k];
        this.n--;
        if (mundo && mundo.particulas) mundo.particulas.fumaca(c.tx * T + 8, c.ty * T + 6);
      } else if (mundo && Math.random() < 0.12) {
        mundo.particulas.faisca(c.tx * T + 4 + Math.random() * 8, c.ty * T + 6);
      }
    }
    for (var j = 0; j < novos.length; j++) this.acender(novos[j][0], novos[j][1]);
    if (this.n > 0 && Math.random() < 0.3) BSI.audio.sfx('crepita');
  };

  // desenha as chamas (antes das entidades)
  Fogo.prototype.desenhar = function (g, cx, cy) {
    var C = BSI.cor, vw = BSI.view.w, vh = BSI.view.h;
    for (var k in this.celulas) {
      var c = this.celulas[k];
      var x = c.tx * T - cx, y = c.ty * T - cy;
      if (x < -T || y < -T * 2 || x > vw || y > vh + T) continue;
      var vigor = Math.min(1, c.t / c.total * 1.6);
      // três línguas de fogo tremendo
      for (var i = 0; i < 3; i++) {
        var fase = this.anim * 9 + i * 2.1 + c.tx * 1.7 + c.ty * 0.9;
        var alt = Math.round((7 + Math.sin(fase) * 3) * vigor) + 2;
        var fx = x + 2 + i * 5;
        g.fillStyle = C.fogo4; g.fillRect(fx, y + 15 - alt, 4, alt);
        g.fillStyle = C.fogo3; g.fillRect(fx + 1, y + 15 - alt + 1, 3, alt - 1);
        g.fillStyle = C.fogo2; g.fillRect(fx + 1, y + 15 - Math.round(alt * 0.6), 2, Math.round(alt * 0.6));
        g.fillStyle = C.fogo1; g.fillRect(fx + 1, y + 15 - Math.round(alt * 0.3), 1, Math.round(alt * 0.3));
      }
    }
  };

  // luzes do fogo (amostra se tiver muito tile queimando)
  Fogo.prototype.luzes = function (lista) {
    var passo = this.n > 80 ? 3 : (this.n > 40 ? 2 : 1), i = 0;
    for (var k in this.celulas) {
      if ((i++ % passo) !== 0) continue;
      var c = this.celulas[k];
      lista.push({ x: c.tx * T + 8, y: c.ty * T + 8, r: 26 + passo * 8 + Math.sin(this.anim * 11 + i) * 3, forca: 0.95, cor: '#f7a733' });
    }
  };

  BSI.Fogo = Fogo;
})();
