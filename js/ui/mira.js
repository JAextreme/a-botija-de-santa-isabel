/* =========================================================
   mira.js — A MIRA COM O MOUSE (Etapa 3)
   - Retícula desenhada no jogo: abre depois de cada tiro e
     fecha aos poucos; fica fininha na MIRA DE PRECISÃO
     (segurar o botão direito, com linha de mira até a parede).
   - Espingarda mostra o CONE; arremesso e rojão mostram o
     ARCO e o ponto de queda (com o tamanho da explosão/nuvem).
   - TRAVA DE ALVO [X]: fixa no inimigo mais perto do cursor.
   - Setas na borda da tela pra inimigo que vem de fora.
   - Opções: assistência de mira (desligada/leve) e fogo amigo.
   ========================================================= */
(function () {
  'use strict';
  var C = BSI.cor, U = BSI.util;
  function cfg() { return BSI.save.cfg(); }

  var Mira = BSI.mira = {
    // posição do mouse no mundo
    mundoMouse: function (m) { var I = BSI.input; return { x: m.camera.x + I.mouse.x, y: m.camera.y + I.mouse.y }; },

    atualizar: function (m) {
      var I = BSI.input, L = m.lider();
      var t = m.travaAlvo;
      if (t && (t.morto || t.time !== 'inimigos' || U.dist(t, L) > 260)) m.travaAlvo = null;
      if (I.apertou('travar')) {
        if (m.travaAlvo) { m.travaAlvo = null; BSI.audio.sfx('menu'); }
        else {
          var p = Mira.mundoMouse(m), melhor = null, md = 70 * 70;
          if (!L.mirandoMouse) { p = { x: L.x + L.face.x * 60, y: L.y + L.face.y * 60 }; md = 140 * 140; }
          m.inimigos.forEach(function (i) { if (i.morto || i.time !== 'inimigos') return; var d2 = U.dist2(i.x, i.y, p.x, p.y); if (d2 < md) { md = d2; melhor = i; } });
          m.travaAlvo = melhor; BSI.audio.sfx(melhor ? 'confirma' : 'estalo');
        }
      }
    },
    // assistência leve: puxa a mira pro inimigo que está quase na linha
    assistir: function (h, m, dir, alcance) {
      if (cfg().assistenciaMira !== 'leve') return dir;
      var melhor = null, mcos = Math.cos(0.18);
      m.inimigos.forEach(function (i) {
        if (i.morto || i.time !== 'inimigos') return;
        var dx = i.x - h.x, dy = (i.y - 5) - (h.y - 6), d = Math.sqrt(dx * dx + dy * dy) || 1;
        if (d > alcance) return; var c = (dx * dir.x + dy * dir.y) / d;
        if (c > mcos) { mcos = c; melhor = { x: dx / d, y: dy / d }; }
      });
      return melhor || dir;
    },

    // ---------------- desenho no mundo (canvas de pixel) ----------------
    desenhar: function (g, m) {
      var L = m.lider(); if (!L || L.caido || BSI.roteiro.emCena() || BSI.dialogo.ativo) return;
      var cx = m.camera.ix(), cy = m.camera.iy(), e = L.arma, I = BSI.input;
      // setas pra inimigo fora da tela
      var W = BSI.view.w, H = BSI.view.h;
      m.inimigos.forEach(function (i) {
        if (i.morto || i.time !== 'inimigos' || U.dist(i, L) > 280) return;
        if (!(i.estado === 'persegue' || i.estado === 'prepara' || i.chefe || i.alvo)) return;
        var sx = i.x - cx, sy = i.y - 8 - cy;
        if (sx > 0 && sy > 0 && sx < W && sy < H) return;
        var n = U.norm(sx - W / 2, sy - H / 2), k = Math.min((W / 2 - 10) / Math.abs(n.x || 0.001), (H / 2 - 10) / Math.abs(n.y || 0.001));
        var ax = W / 2 + n.x * k, ay = H / 2 + n.y * k, pul = Math.sin(m.tempo * 8) * 1.5;
        g.save(); g.translate(ax + n.x * pul, ay + n.y * pul); g.rotate(Math.atan2(n.y, n.x));
        g.fillStyle = C.contorno; g.beginPath(); g.moveTo(5, 0); g.lineTo(-4, -4.5); g.lineTo(-4, 4.5); g.fill();
        g.fillStyle = i.chefe ? '#ff4040' : '#e8603a'; g.beginPath(); g.moveTo(4, 0); g.lineTo(-3, -3.5); g.lineTo(-3, 3.5); g.fill();
        g.restore();
      });
      // trava de alvo
      var t = m.travaAlvo;
      if (t) {
        var tx = t.x - cx, ty = t.y - 8 - cy, r = 9 + Math.sin(m.tempo * 6);
        g.strokeStyle = '#ff6040'; g.lineWidth = 1;
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { g.beginPath(); g.moveTo(tx + c[0] * r, ty + c[1] * (r - 4)); g.lineTo(tx + c[0] * r, ty + c[1] * r); g.lineTo(tx + c[0] * (r - 4), ty + c[1] * r); g.stroke(); });
      }
      if (!L.mirandoMouse && !t) return;
      var hx = L.x - cx, hy = L.y - 6 - cy;
      var alvo = t ? { x: t.x - cx, y: t.y - 8 - cy } : { x: I.mouse.x, y: I.mouse.y };
      var dx = alvo.x - hx, dy = alvo.y - hy, dist = Math.sqrt(dx * dx + dy * dy) || 1, ang = Math.atan2(dy, dx);
      // arco de arremesso / rojão
      if (e.tipo === 'arremesso' || (e.especial && e.especial.arco)) {
        var alc = e.alcance || 100, dd = Math.min(dist, alc), ex = hx + Math.cos(ang) * dd, ey = hy + 6 + Math.sin(ang) * dd, alt = 10 + dd * 0.15;
        g.fillStyle = 'rgba(255,241,168,0.7)';
        for (var k = 1; k < 14; k++) { var p = k / 14; g.fillRect(hx + (ex - hx) * p - 0.5, hy + (ey - hy) * p - Math.sin(p * Math.PI) * alt - 0.5, 1, 1); }
        var raio = (e.especial.explode || e.especial.raio || 5);
        g.strokeStyle = 'rgba(255,160,80,0.75)'; g.beginPath(); g.ellipse(ex, ey, raio, raio * 0.55, 0, 0, Math.PI * 2); g.stroke();
        return;
      }
      if (e.tipo === 'tiro') {
        var alcT = (e.vel || 200) * (e.vida || 0.5), leque = (e.espalha || 0) * (L.precisao ? 0.35 : 1) + (L.abertura || 0);
        // cone da espingarda
        if (e.n > 1 || leque > 0.12) {
          g.save(); g.globalAlpha = L.precisao ? 0.18 : 0.1; g.fillStyle = '#fff1a8';
          g.beginPath(); g.moveTo(hx, hy); g.arc(hx, hy, alcT, ang - leque, ang + leque); g.closePath(); g.fill();
          g.globalAlpha = 0.35; g.strokeStyle = '#fff1a8'; g.lineWidth = 0.5; g.stroke(); g.restore();
        }
        // linha de mira (precisão): para na parede
        if (L.precisao) {
          g.fillStyle = 'rgba(255,80,60,0.85)';
          for (var s = 8; s < Math.min(alcT, 260); s += 3) {
            var wx = L.x + Math.cos(ang) * s, wy = L.y - 6 + Math.sin(ang) * s;
            if (m.mapa.bloqueiaTiroPx(wx, wy + 4)) break;
            g.fillRect(wx - cx - 0.25, wy - cy - 0.25, 0.5, 0.5);
          }
        }
      }
      // retícula (abre com o tiro, fecha com o tempo; precisão fecha mais)
      if (t) return;
      var abre = 2.5 + ((e.espalha || 0) * (L.precisao ? 0.35 : 1) + (L.abertura || 0)) * Math.min(dist, 160) * 0.6;
      abre = Math.min(abre, 22);
      var mx = I.mouse.x, my = I.mouse.y;
      g.fillStyle = C.contorno;
      [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(function (d) { g.fillRect(mx + d[0] * abre - (d[0] ? (d[0] > 0 ? 0 : 3) : 1), my + d[1] * abre - (d[1] ? (d[1] > 0 ? 0 : 3) : 1), d[0] ? 4 : 2, d[1] ? 4 : 2); });
      g.fillStyle = e.tipo === 'corpo' ? '#d8cdb0' : C.amarelo;
      [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(function (d) { g.fillRect(mx + d[0] * abre - (d[0] ? (d[0] > 0 ? 0 : 2.5) : 0.5), my + d[1] * abre - (d[1] ? (d[1] > 0 ? 0 : 2.5) : 0.5), d[0] ? 3 : 1, d[1] ? 3 : 1); });
      g.fillStyle = '#fff6e0'; g.fillRect(mx - 0.5, my - 0.5, 1, 1);
      // recarga: anel em volta da retícula
      if (L.recarga) { g.strokeStyle = C.amarelo; g.lineWidth = 1; g.beginPath(); g.arc(mx, my, abre + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - L.recarga.t / L.recarga.total)); g.stroke(); }
    }
  };
})();
