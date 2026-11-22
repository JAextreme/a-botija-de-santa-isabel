/* =========================================================
   companion_ai.js — IA dos companheiros.
   - Seguem o "rastro de migalhas" do líder (fila indiana).
   - Atacam inimigos perto (corpo a corpo vai pra cima;
     espingarda atira de longe, economizando munição).
   - Fogem de tile pegando fogo.
   - NUNCA ficam presos: se travar ou ficar longe demais,
     reaparecem atrás do líder com uma nuvenzinha de poeira.
   ========================================================= */
(function () {
  'use strict';
  var U = BSI.util;
  var ESPACO = 7;      // pontos de rastro entre um companheiro e outro
  var LONGE = 170;     // distância máxima do líder antes de teletransportar

  function nada() { return { x: 0, y: 0, mag: 0, correndo: false }; }

  BSI.ia = {
    heroi: function (h, mundo, dt) {
      var lider = mundo.lider();
      if (!lider || lider === h) return nada();
      var ordem = mundo.ordemSeguidor(h);
      var dLider = U.dist(h, lider);
      var ia = h.ia;

      // ---- tarefa de especialista (cortar cabo, pegar a botija...) ----
      if (ia.tarefa) return BSI.grupo.andarTarefa(h, mundo, dt);

      // ---- ordem do grupo (tecla T) ----
      var cmd = mundo.ordem || 'seguir';
      var bal = BSI.config.balance.ordens;
      if (cmd === 'segurar' && !mundo.pontoOrdem) cmd = 'seguir';

      // ---- travou ou ficou pra trás: reaparece perto do líder ----
      if ((cmd !== 'segurar' && dLider > LONGE) || (ia.parado > 1.0 && cmd !== 'segurar') || dLider > LONGE * 2.2) {
        BSI.ia.teletransportar(h, mundo, ordem);
        return nada();
      }

      // ---- desvia de projétil vindo na direção dele ----
      for (var pj = 0; pj < mundo.projeteis.length; pj++) {
        var pr = mundo.projeteis[pj];
        if (pr.time === 'herois' || pr.morto || !pr.vx) continue;
        var rx = h.x - pr.x, ry = (h.y - 6) - pr.y, dd = rx * rx + ry * ry;
        if (dd > 40 * 40) continue;
        var vel2 = Math.sqrt(pr.vx * pr.vx + pr.vy * pr.vy) || 1;
        if ((rx * pr.vx + ry * pr.vy) / vel2 < 0) continue; // já passou
        var lado = (pr.vx * ry - pr.vy * rx) > 0 ? 1 : -1;
        return { x: -pr.vy / vel2 * lado, y: pr.vx / vel2 * lado, mag: 1, correndo: true };
      }

      // ---- habilidade sozinho, quando faz sentido ----
      BSI.grupo.autoHabilidade(h, mundo, dt);

      // ---- fugir do fogo ----
      if (mundo.fogo.queimandoPx(h.x, h.y) && h.id !== 'daniel') {
        var fuga = U.norm(h.x - lider.x || 1, h.y - lider.y || 1);
        return { x: -fuga.x, y: -fuga.y, mag: 1, correndo: true };
      }

      // ---- combate ----
      ia.pensar -= dt;
      if (ia.pensar <= 0) {
        ia.pensar = 0.25 + Math.random() * 0.15;
        ia.alvo = null;
        if (!BSI.roteiro.emCena() && !(mundo.desobediencia && Math.random() < mundo.desobediencia)) {
          var alvos = mundo.alvosPara('herois', true), melhor = 9999;
          // AVANÇAR: procuram briga mais longe; SEGURAR: só quem chegar perto do posto
          var raioBusca = cmd === 'avancar' ? bal.avancarAlcance : (cmd === 'segurar' ? 60 : 90);
          var centro = cmd === 'segurar' ? mundo.pontoOrdem : lider;
          var raioCentro = cmd === 'avancar' ? bal.avancarAlcance + 60 : (cmd === 'segurar' ? 70 : 150);
          for (var i = 0; i < alvos.length; i++) {
            var a = alvos[i];
            if (a.morto || a.time === 'neutro') continue; // não caçam bicho sozinhos
            var d = U.dist(a, h);
            if (d < raioBusca && U.dist(a, centro) < raioCentro && d < melhor) { melhor = d; ia.alvo = a; }
          }
        }
      }
      var alvo = ia.alvo;
      if (alvo && !alvo.morto) {
        var dx = alvo.x - h.x, dy = alvo.y - h.y, dist = Math.sqrt(dx * dx + dy * dy) || 1;
        h.face = { x: dx / dist, y: dy / dist };
        h.dir = U.dirDe(dx, dy);
        var armaIA = h.arma;
        if (armaIA.tipo !== 'corpo') {
          // atira/arremessa se tiver munição sobrando (o jogador tem prioridade)
          if (dist < (armaIA.tipo === 'arremesso' ? 90 : 120) && h.cdAtaque <= 0 && BSI.armas.iaPodeUsar(h) && Math.random() < (armaIA.tipo === 'arremesso' ? 0.12 : 0.5)) {
            h.atacar(mundo);
            h.cdAtaque *= 1.8;
          }
          if (dist < 40) return { x: -dx / dist, y: -dy / dist, mag: 0.8, correndo: false };
        } else {
          if (dist < 15) {
            if (h.cdAtaque <= 0) { h.atacar(mundo); h.cdAtaque *= 1.4; }
            return nada();
          }
          return BSI.ia.andarPara(h, mundo, dt, alvo.x, alvo.y, 0.9);
        }
      }

      // ---- SEGURAR POSIÇÃO: volta pro posto, cada um no seu lugar em roda ----
      if (cmd === 'segurar') {
        var ang = ordem * 2.1, rr = bal.segurarRaio * 0.5;
        var px0 = mundo.pontoOrdem.x + Math.cos(ang) * rr, py0 = mundo.pontoOrdem.y + Math.sin(ang) * rr * 0.6;
        if (U.dist2(h.x, h.y, px0, py0) < 16) { ia.parado = 0; return nada(); }
        var mv = BSI.ia.andarPara(h, mundo, dt, px0, py0, 0.9);
        if (ia.parado > 1.2) { ia.parado = 0; return nada(); } // não alcança o posto: fica onde está
        return mv;
      }

      // ---- seguir o rastro ----
      var tr = mundo.trilha;
      var idx = tr.length - 1 - ordem * ESPACO;
      var p = idx >= 0 ? tr[idx] : (tr[0] || lider);
      var dd = U.dist2(h.x, h.y, p.x, p.y);
      if (dd < 9) { ia.parado = 0; return nada(); }
      var mov = BSI.ia.andarPara(h, mundo, dt, p.x, p.y, dd > 900 ? 1 : 0.85);
      mov.correndo = lider.correndo || dd > 1600 || lider.st.montado > 0;
      return mov;
    },

    // vai na direção do ponto e mede se está travado
    andarPara: function (h, mundo, dt, x, y, mag) {
      var ia = h.ia;
      var n = U.norm(x - h.x, y - h.y);
      // separação: não amontoar com os outros companheiros
      var heroi = mundo.herois;
      for (var i = 0; i < heroi.length; i++) {
        var o = heroi[i];
        if (o === h || o.caido) continue;
        var dx = h.x - o.x, dy = h.y - o.y, d2 = dx * dx + dy * dy;
        if (d2 < 100 && d2 > 0.01) { var d = Math.sqrt(d2); n.x += dx / d * 0.5; n.y += dy / d * 0.5; }
      }
      n = U.norm(n.x, n.y);
      var andou = U.dist2(h.x, h.y, ia.ultX, ia.ultY);
      if (andou < 0.04) ia.parado += dt; else ia.parado = Math.max(0, ia.parado - dt * 2);
      ia.ultX = h.x; ia.ultY = h.y;
      return { x: n.x, y: n.y, mag: mag, correndo: false };
    },

    teletransportar: function (h, mundo, ordem) {
      var lider = mundo.lider();
      var tr = mundo.trilha;
      var idx = Math.max(0, tr.length - 1 - (ordem || 1) * 4);
      var p = tr[idx] || lider;
      var livre = mundo.mapa.pontoLivre(p.x, p.y, h.hw, h.hh);
      mundo.particulas.explosao(h.x, h.y, 6, 'rgba(225,190,140,0.8)', 25, 0.4);
      h.x = livre.x; h.y = livre.y;
      h.ia.parado = 0; h.ia.ultX = h.x; h.ia.ultY = h.y;
      mundo.particulas.explosao(h.x, h.y, 6, 'rgba(225,190,140,0.8)', 25, 0.4);
    }
  };
})();
