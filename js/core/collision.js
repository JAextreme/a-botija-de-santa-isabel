/* =========================================================
   collision.js — colisão com a grade de tiles e entre caixas.
   Entidades usam x,y = centro da "caixa dos pés" e hw,hh = meia
   largura/altura dessa caixa.
   ========================================================= */
(function () {
  'use strict';
  var T = BSI.cfg.TILE;

  // A caixa da entidade encosta em algum tile sólido?
  function tocaSolido(e, mapa, x, y) {
    var x0 = Math.floor((x - e.hw) / T), x1 = Math.floor((x + e.hw - 0.001) / T);
    var y0 = Math.floor((y - e.hh) / T), y1 = Math.floor((y + e.hh - 0.001) / T);
    for (var ty = y0; ty <= y1; ty++)
      for (var tx = x0; tx <= x1; tx++)
        if (mapa.solido(tx, ty)) return true;
    return false;
  }

  // Move num eixo, parando rente à parede. Retorna true se bateu.
  function moverEixo(e, mapa, d, eixo) {
    if (!d) return false;
    var passos = Math.ceil(Math.abs(d) / 4);
    var p = d / passos;
    for (var i = 0; i < passos; i++) {
      var nx = eixo === 'x' ? e.x + p : e.x;
      var ny = eixo === 'y' ? e.y + p : e.y;
      if (tocaSolido(e, mapa, nx, ny)) {
        // encosta rente à borda do tile
        if (eixo === 'x') {
          if (p > 0) e.x = Math.floor((e.x + e.hw + p) / T) * T - e.hw - 0.01;
          else e.x = (Math.floor((e.x - e.hw + p) / T) + 1) * T + e.hw + 0.01;
          if (tocaSolido(e, mapa, e.x, e.y)) e.x = nx - p; // segurança
        } else {
          if (p > 0) e.y = Math.floor((e.y + e.hh + p) / T) * T - e.hh - 0.01;
          else e.y = (Math.floor((e.y - e.hh + p) / T) + 1) * T + e.hh + 0.01;
          if (tocaSolido(e, mapa, e.x, e.y)) e.y = ny - p;
        }
        return true;
      }
      e.x = nx; e.y = ny;
    }
    return false;
  }

  BSI.colisao = {
    tocaSolido: tocaSolido,

    // Move a entidade com deslize nas paredes e "escorrega" em quinas
    // (se bater quase na ponta de um tile, empurra pro lado livre).
    mover: function (e, mapa, dx, dy) {
      var bateuX = moverEixo(e, mapa, dx, 'x');
      var bateuY = moverEixo(e, mapa, dy, 'y');
      var QUINA = 5;
      if (bateuX && !dy) {
        for (var o = 1; o <= QUINA; o++) {
          if (!tocaSolido(e, mapa, e.x + Math.sign(dx), e.y - o)) { e.y -= Math.min(1, o); break; }
          if (!tocaSolido(e, mapa, e.x + Math.sign(dx), e.y + o)) { e.y += Math.min(1, o); break; }
        }
      }
      if (bateuY && !dx) {
        for (var q = 1; q <= QUINA; q++) {
          if (!tocaSolido(e, mapa, e.x - q, e.y + Math.sign(dy))) { e.x -= Math.min(1, q); break; }
          if (!tocaSolido(e, mapa, e.x + q, e.y + Math.sign(dy))) { e.x += Math.min(1, q); break; }
        }
      }
      return bateuX || bateuY;
    },

    // sobreposição de caixas (entidade a e b)
    sobrepoe: function (a, b) {
      return Math.abs(a.x - b.x) < a.hw + b.hw && Math.abs(a.y - b.y) < a.hh + b.hh;
    },
    // caixa contra retângulo {x,y,w,h} em pixels
    noRet: function (e, r) {
      return e.x + e.hw > r.x && e.x - e.hw < r.x + r.w && e.y + e.hh > r.y && e.y - e.hh < r.y + r.h;
    },
    // linha de visão simples: amostra tiles opacos entre dois pontos
    visao: function (mapa, ax, ay, bx, by) {
      var d = Math.sqrt((bx - ax) * (bx - ax) + (by - ay) * (by - ay));
      var n = Math.ceil(d / 8);
      for (var i = 1; i < n; i++) {
        var x = ax + (bx - ax) * i / n, y = ay + (by - ay) * i / n;
        if (mapa.opaco(Math.floor(x / T), Math.floor(y / T))) return false;
      }
      return true;
    }
  };
})();
