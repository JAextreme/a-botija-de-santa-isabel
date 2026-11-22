/* =========================================================
   efeitos.js — LUZ, SOMBRA E EFEITOS (Etapa 2 da atualização)
   - Sombra projetada: cada personagem faz sombra pro lado
     contrário da luz mais forte por perto (fogueira, lampião,
     lanterna) — mais comprida quanto mais longe da luz.
   - Sombra de nuvem passando (de dia e na lua).
   - Água brilhando, mariposas nas lâmpadas.
   - Pós-processamento: brilho estourado (bloom), vinheta e
     granulado. Dá pra desligar (Opções → Efeitos de tela).
   Gráficos: Leve = nada disso · Médio = sombras, nuvem, água,
   vinheta · Bonito = tudo.
   ========================================================= */
(function () {
  'use strict';
  var U = BSI.util, T = BSI.cfg.TILE;
  function Q() { return BSI.view.qualidade || 'medio'; }
  function posLigado() { var c = BSI.save.cfg(); return c.efeitosTela !== false && Q() !== 'leve'; }

  var E = BSI.efeitos = {
    luzesFortes: [],

    // antes de desenhar: quais luzes projetam sombra
    preparar: function (m) {
      var r = [], L = m.lider();
      m.props.forEach(function (p) {
        if (!p.luz || p.morto) return;
        var l = p.luz(); if (l && l.r > 34 && (l.forca || 1) > 0.6) r.push(l);
      });
      if (L && !L.caido && m.ambienteAtual < 0.7 && BSI.state.pilha > 0) r.push({ x: L.x + L.face.x * 18, y: L.y + L.face.y * 14, r: 60, forca: 0.6, lanterna: true, dono: L });
      E.luzesFortes = r;
    },

    // sombra no chão (substitui o retângulo antigo)
    sombra: function (g, ent, cx, cy, larg) {
      var x = ent.x - cx, y = ent.y - cy, m = BSI.jogo && BSI.jogo.mundo;
      var dx = 0.6, dy = 0.35, forca = 0.3, compr = 1; // luz "do céu" (lua/sol) vem de cima à esquerda
      if (m && Q() !== 'leve') {
        var melhor = null, md = 1e9;
        E.luzesFortes.forEach(function (l) {
          if (l.dono === ent) return;
          var d2 = U.dist2(l.x, l.y, ent.x, ent.y);
          if (d2 < l.r * l.r * 1.6 && d2 < md) { md = d2; melhor = l; }
        });
        if (melhor) {
          var d = Math.sqrt(md) || 1;
          dx = (ent.x - melhor.x) / d; dy = (ent.y - melhor.y) / d * 0.55;
          compr = 1 + Math.min(1.6, d / 40);
          forca = 0.38 * Math.max(0.3, 1 - d / (melhor.r * 1.3));
        }
      }
      g.save();
      g.globalAlpha = forca;
      g.fillStyle = '#140a18';
      g.translate(x + dx * larg * 0.25 * compr, y + 1 + dy * 3 * compr);
      g.rotate(Math.atan2(dy, dx));
      g.beginPath(); g.ellipse(0, 0, larg * 0.5 * compr, larg * 0.22, 0, 0, Math.PI * 2); g.fill();
      g.globalAlpha = forca * 0.9;
      g.restore();
      // a sombra de contato (bem debaixo do pé) é sempre escura
      g.globalAlpha = 0.35; g.fillStyle = '#140a18';
      g.beginPath(); g.ellipse(x, y + 1, larg * 0.42, 1.6, 0, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 1;
    },

    // nuvens passando (sombras grandes e suaves) + brilho da água + mariposas
    mundo: function (g, m, cx, cy, t) {
      if (Q() === 'leve' || m.terror()) return;
      var W = BSI.view.w, Hh = BSI.view.h;
      // nuvens
      var dia = m.ambienteAtual > 0.75;
      g.save();
      g.globalAlpha = dia ? 0.12 : 0.07;
      g.fillStyle = '#100818';
      for (var i = 0; i < 3; i++) {
        var nx = ((t * (6 + i * 2) + i * 260) % (W + 400)) - 200 - (cx * 0.0);
        var ny = ((i * 137) % Hh) + Math.sin(t * 0.05 + i) * 20;
        g.beginPath();
        g.ellipse(nx, ny, 90 + i * 20, 40, 0.1, 0, Math.PI * 2);
        g.ellipse(nx + 60, ny + 10, 60, 30, 0, 0, Math.PI * 2);
        g.ellipse(nx - 55, ny + 8, 55, 26, 0, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
      // brilho na água
      var mapa = m.mapa, x0 = Math.floor(cx / T), y0 = Math.floor(cy / T), x1 = x0 + Math.ceil(W / T) + 1, y1 = y0 + Math.ceil(Hh / T) + 1;
      g.fillStyle = '#e8f4ff';
      for (var ty = y0; ty < y1; ty++) for (var tx = x0; tx < x1; tx++) {
        if (mapa.ch(tx, ty) !== '~') continue;
        for (var k = 0; k < 2; k++) {
          var fase = (t * 1.3 + BSI.util.hash(tx, ty, k) * 10) % 3;
          if (fase > 0.5) continue;
          var px = tx * T + 2 + BSI.util.hash(tx, ty, k + 5) * 12 - cx, py = ty * T + 2 + BSI.util.hash(tx, ty, k + 9) * 12 - cy;
          g.globalAlpha = Math.sin(fase / 0.5 * Math.PI) * 0.8;
          g.fillRect(px, py, 2, 0.5); g.fillRect(px + 0.5, py - 0.5, 1, 1.5);
        }
      }
      g.globalAlpha = 1;
      // mariposas rodando as lâmpadas (de noite)
      if (m.ambienteAtual < 0.7) m.props.forEach(function (p) {
        if (!p.raioLuz || p.morto) return;
        var o = BSI.sprites.objeto(p.sprite), lx = p.x - cx, ly = p.y - cy - o.h + 6;
        if (lx < -20 || ly < -20 || lx > W + 20 || ly > Hh + 20) return;
        g.fillStyle = '#e8dcc0';
        for (var j = 0; j < 4; j++) {
          var a = t * (3 + j) + j * 1.7, r = 4 + j * 1.5;
          var bx = lx + Math.cos(a) * r, by = ly + Math.sin(a * 1.3) * r * 0.6;
          g.fillRect(bx, by, Math.floor(t * 20 + j) % 2 ? 1 : 0.5, 0.5);
        }
      });
    },

    // ---------------- pós-processamento ----------------
    pos: function (g, W, Hh, t) {
      if (!posLigado()) return;
      var bonito = Q() === 'bonito';
      if (bonito) E.bloom(g, W, Hh);
      // vinheta suave
      if (!E.vinheta || E.vinheta.w !== W || E.vinheta.h !== Hh) {
        var c = document.createElement('canvas'); c.width = W; c.height = Hh;
        var gg = c.getContext('2d'), gr = gg.createRadialGradient(W / 2, Hh / 2, Hh * 0.35, W / 2, Hh / 2, Math.max(W, Hh) * 0.72);
        gr.addColorStop(0, 'rgba(10,4,16,0)'); gr.addColorStop(1, 'rgba(10,4,16,0.55)');
        gg.fillStyle = gr; gg.fillRect(0, 0, W, Hh);
        E.vinheta = { c: c, w: W, h: Hh };
      }
      g.drawImage(E.vinheta.c, 0, 0, W, Hh);
      // granulado (filme velho, bem leve)
      if (bonito) {
        if (!E.grao) {
          var gc = document.createElement('canvas'); gc.width = 96; gc.height = 96;
          var g2 = gc.getContext('2d');
          for (var i = 0; i < 1400; i++) { var v = Math.random() > 0.5 ? 255 : 0; g2.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',0.5)'; g2.fillRect(Math.random() * 96, Math.random() * 96, 1, 1); }
          E.grao = gc;
        }
        g.save(); g.globalAlpha = 0.05;
        var ox = Math.floor(Math.random() * 96), oy = Math.floor(Math.random() * 96);
        for (var yy = -oy; yy < Hh; yy += 48) for (var xx = -ox; xx < W; xx += 48) g.drawImage(E.grao, xx, yy, 48, 48);
        g.restore();
      }
    },
    // bloom: a tela em tamanho pequeno, borrada, somada por cima (as luzes "estouram")
    bloom: function (g, W, Hh) {
      var src = g.canvas;
      if (!E.bl || E.bl.width !== Math.ceil(src.width / 6)) { E.bl = document.createElement('canvas'); E.bl.width = Math.ceil(src.width / 6); E.bl.height = Math.ceil(src.height / 6); }
      var bg = E.bl.getContext('2d');
      bg.imageSmoothingEnabled = true;
      bg.globalCompositeOperation = 'copy';
      bg.drawImage(src, 0, 0, E.bl.width, E.bl.height);
      // só o que é claro: escurece tudo e deixa passar os pontos de luz
      bg.globalCompositeOperation = 'multiply';
      bg.drawImage(E.bl, 0, 0); bg.drawImage(E.bl, 0, 0); // ao cubo: só o que é bem claro passa
      bg.globalCompositeOperation = 'source-over';
      g.save();
      g.imageSmoothingEnabled = true;
      g.globalCompositeOperation = 'lighter';
      g.globalAlpha = 0.3;
      g.drawImage(E.bl, 0, 0, W, Hh);
      g.restore();
      g.imageSmoothingEnabled = false;
    }
  };
})();
