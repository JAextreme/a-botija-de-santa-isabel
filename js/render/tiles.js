/* =========================================================
   tiles.js — tipos de tile (16x16) e como cada um é desenhado.
   Cada caractere do mapa vira um tipo daqui.
     solido     : bloqueia passagem
     opaco      : bloqueia visão dos inimigos
     inflamavel : segundos queimando (0 = não pega fogo)
     vira       : no que o tile se transforma depois de queimar
   ========================================================= */
(function () {
  'use strict';
  var C = BSI.cor, H = BSI.util.hash, T = BSI.cfg.TILE;

  // pontinhos aleatórios (mas fixos por posição) para dar textura
  function salpicar(g, x, y, tx, ty, cor, qtd, semente) {
    g.fillStyle = cor;
    for (var i = 0; i < qtd; i++) {
      var px = Math.floor(H(tx, ty, semente + i * 7) * 16), py = Math.floor(H(tx, ty, semente + i * 13 + 3) * 16);
      g.fillRect(x + px, y + py, 1, 1);
    }
  }
  function chao(g, x, y, tx, ty, base, esc, clara) {
    g.fillStyle = base; g.fillRect(x, y, T, T);
    salpicar(g, x, y, tx, ty, esc, 6, 1);
    salpicar(g, x, y, tx, ty, clara, 4, 2);
    // pedrinha ocasional
    if (H(tx, ty, 9) > 0.8) { g.fillStyle = esc; g.fillRect(x + Math.floor(H(tx, ty, 4) * 12) + 1, y + Math.floor(H(tx, ty, 5) * 12) + 1, 2, 1); }
  }
  function terra(g, x, y, tx, ty) { chao(g, x, y, tx, ty, C.terra, C.terraEsc, C.terraClara); }
  // chão de dentro de casa (embaixo de mesa etc.)
  function tiles_chao(g, x, y, tx, ty) { g.fillStyle = '#8a6a48'; g.fillRect(x, y, T, T); salpicar(g, x, y, tx, ty, '#a07a52', 4, 101); }

  var defs = {
    '.': { nome: 'terra', desenhar: terra },
    '^': { nome: 'trilha de piçarra', desenhar: function (g, x, y, tx, ty) { chao(g, x, y, tx, ty, C.picarra, C.picarraEsc, C.picarraClara); } },
    ',': {
      nome: 'mato seco', inflamavel: 2.6, vira: 'B',
      desenhar: function (g, x, y, tx, ty) {
        terra(g, x, y, tx, ty);
        // tufos de capim seco
        for (var i = 0; i < 4; i++) {
          var px = x + 1 + Math.floor(H(tx, ty, 20 + i) * 12), py = y + 3 + Math.floor(H(tx, ty, 30 + i) * 10);
          g.fillStyle = C.matoSecoEsc; g.fillRect(px, py + 2, 3, 1);
          g.fillStyle = C.matoSeco; g.fillRect(px, py, 1, 2); g.fillRect(px + 2, py - 1, 1, 3);
          g.fillStyle = C.matoSecoClaro; g.fillRect(px + 1, py - 1, 1, 3);
        }
      }
    },
    'B': {
      nome: 'cinza', desenhar: function (g, x, y, tx, ty) {
        chao(g, x, y, tx, ty, C.cinza, '#2a2420', C.cinzaClara);
        if (H(tx, ty, 77) > 0.7) { g.fillStyle = '#7a3a20'; g.fillRect(x + Math.floor(H(tx, ty, 78) * 14), y + Math.floor(H(tx, ty, 79) * 14), 1, 1); }
      }
    },
    '=': {
      nome: 'piso do alpendre', desenhar: function (g, x, y, tx, ty) {
        g.fillStyle = C.cimento; g.fillRect(x, y, T, T);
        g.fillStyle = C.cimentoEsc; g.fillRect(x, y + 15, T, 1); g.fillRect(x + 15, y, 1, T);
        salpicar(g, x, y, tx, ty, C.cimentoClaro, 3, 4);
      }
    },
    '#': {
      nome: 'parede de taipa', solido: true, opaco: true, desenhar: function (g, x, y, tx, ty) {
        g.fillStyle = C.taipa; g.fillRect(x, y, T, T);
        g.fillStyle = C.taipaEsc;
        // trama de varas da taipa aparecendo
        for (var i = 0; i < 16; i += 5) g.fillRect(x, y + i + (tx % 2), T, 1);
        for (var j = 2; j < 16; j += 6) g.fillRect(x + j + (ty % 2), y, 1, T);
        salpicar(g, x, y, tx, ty, C.taipaClara, 5, 6);
        salpicar(g, x, y, tx, ty, '#6a3e22', 3, 8);
      }
    },
    'p': {
      nome: 'porta', solido: true, opaco: true, desenhar: function (g, x, y) {
        g.fillStyle = C.madeiraEsc; g.fillRect(x, y, T, T);
        g.fillStyle = C.madeira; g.fillRect(x + 2, y + 1, 12, 15);
        g.fillStyle = C.madeiraEsc; g.fillRect(x + 7, y + 1, 1, 15); g.fillRect(x + 2, y + 6, 12, 1);
        g.fillStyle = C.amarelo; g.fillRect(x + 10, y + 9, 1, 1);
      }
    },
    'T': {
      nome: 'juazeiro', solido: true, opaco: true, desenhar: function (g, x, y, tx, ty) {
        terra(g, x, y, tx, ty);
        g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x + 2, y + 12, 13, 3);
        g.fillStyle = C.madeiraEsc; g.fillRect(x + 7, y + 10, 3, 5);
        g.fillStyle = C.verdeEsc; g.fillRect(x + 1, y + 2, 14, 10); g.fillRect(x + 3, y + 1, 10, 12);
        g.fillStyle = C.verde; g.fillRect(x + 2, y + 2, 11, 8); g.fillRect(x + 4, y + 1, 8, 9);
        g.fillStyle = C.verdeClaro; g.fillRect(x + 4, y + 2, 4, 3); g.fillRect(x + 9, y + 4, 2, 2);
        salpicar(g, x, y - 4, tx, ty, C.verdeEsc, 4, 11);
      }
    },
    'M': {
      nome: 'mandacaru', solido: true, desenhar: function (g, x, y, tx, ty) {
        terra(g, x, y, tx, ty);
        g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x + 3, y + 13, 10, 2);
        var v = C.verde, e = C.verdeEsc, c = C.verdeClaro;
        g.fillStyle = e; g.fillRect(x + 6, y + 1, 4, 14); g.fillRect(x + 2, y + 5, 3, 6); g.fillRect(x + 11, y + 3, 3, 6); g.fillRect(x + 4, y + 9, 3, 2); g.fillRect(x + 9, y + 7, 3, 2);
        g.fillStyle = v; g.fillRect(x + 7, y + 1, 2, 14); g.fillRect(x + 3, y + 5, 1, 5); g.fillRect(x + 12, y + 3, 1, 5);
        g.fillStyle = c; g.fillRect(x + 7, y + 2, 1, 10);
        g.fillStyle = C.creme; g.fillRect(x + 6, y + 4, 1, 1); g.fillRect(x + 9, y + 8, 1, 1); g.fillRect(x + 2, y + 7, 1, 1); g.fillRect(x + 13, y + 5, 1, 1);
      }
    },
    'x': {
      nome: 'xique-xique', solido: true, desenhar: function (g, x, y, tx, ty) {
        terra(g, x, y, tx, ty);
        g.fillStyle = C.verdeEsc; g.fillRect(x + 2, y + 8, 12, 6); g.fillRect(x + 4, y + 5, 3, 3); g.fillRect(x + 9, y + 4, 3, 4);
        g.fillStyle = C.verde; g.fillRect(x + 3, y + 9, 10, 3); g.fillRect(x + 5, y + 6, 1, 3); g.fillRect(x + 10, y + 5, 1, 3);
        g.fillStyle = C.creme; g.fillRect(x + 4, y + 9, 1, 1); g.fillRect(x + 8, y + 10, 1, 1); g.fillRect(x + 11, y + 8, 1, 1);
      }
    },
    'P': {
      nome: 'pedra', solido: true, opaco: true, desenhar: function (g, x, y, tx, ty) {
        g.fillStyle = C.pedraEsc; g.fillRect(x, y, T, T);
        var o = Math.floor(H(tx, ty, 40) * 3);
        g.fillStyle = C.pedra; g.fillRect(x + 1, y + 1 + o, 14, 12 - o); g.fillRect(x + 2, y + o, 12, 1);
        g.fillStyle = C.pedraClara; g.fillRect(x + 2, y + 1 + o, 6, 2); g.fillRect(x + 2, y + 3 + o, 2, 3);
        g.fillStyle = C.pedraEsc; g.fillRect(x + 9, y + 6, 4, 1); g.fillRect(x + 5, y + 9, 1, 3);
        salpicar(g, x, y, tx, ty, '#4a4038', 3, 41);
      }
    },
    'D': {
      // pedra com desenho antigo (o Miguel jura que é obra dele)
      nome: 'pedra com desenho', solido: true, opaco: true, desenhar: function (g, x, y, tx, ty) {
        defs.P.desenhar(g, x, y, tx, ty);
        g.fillStyle = '#b8502a';
        g.fillRect(x + 4, y + 4, 1, 6); g.fillRect(x + 5, y + 4, 4, 1); g.fillRect(x + 8, y + 5, 1, 2);
        g.fillRect(x + 5, y + 9, 5, 1); g.fillRect(x + 10, y + 6, 1, 4); g.fillRect(x + 7, y + 7, 2, 1);
        g.fillStyle = '#e0a050'; g.fillRect(x + 11, y + 4, 1, 1);
      }
    },
    'G': {
      nome: 'garrancheira seca', solido: true, opaco: true, inflamavel: 3.4, vira: 'B',
      desenhar: function (g, x, y, tx, ty) {
        terra(g, x, y, tx, ty);
        g.fillStyle = '#5a4030';
        for (var i = 0; i < 7; i++) {
          var a = H(tx, ty, 50 + i), b = H(tx, ty, 60 + i);
          var px = x + Math.floor(a * 14), py = y + Math.floor(b * 14);
          g.fillRect(px, py, 3, 1); g.fillRect(px + 1, py - 1, 1, 3);
        }
        g.fillStyle = '#7a5a3a'; g.fillRect(x + 1, y + 6, 14, 1); g.fillRect(x + 3, y + 11, 11, 1); g.fillRect(x + 6, y + 2, 1, 12);
        g.fillStyle = C.matoSecoEsc; g.fillRect(x + 2, y + 3, 1, 1); g.fillRect(x + 12, y + 9, 1, 1);
      }
    },
    'C': {
      nome: 'cerca de varas', solido: true, inflamavel: 3.0, vira: 'B',
      desenhar: function (g, x, y, tx, ty) {
        terra(g, x, y, tx, ty);
        g.fillStyle = C.madeiraEsc; g.fillRect(x + 2, y + 2, 2, 13); g.fillRect(x + 11, y + 1, 2, 14);
        g.fillStyle = C.madeira; g.fillRect(x, y + 5, T, 2); g.fillRect(x, y + 10, T, 2);
        g.fillStyle = C.madeiraClara; g.fillRect(x, y + 5, T, 1);
      }
    },
    '~': {
      nome: 'água do açude', solido: true, passaTiro: true, desenhar: function (g, x, y, tx, ty) {
        g.fillStyle = C.agua; g.fillRect(x, y, T, T);
        g.fillStyle = C.aguaClara; g.fillRect(x + 2 + (ty % 3), y + 4, 4, 1); g.fillRect(x + 9 - (tx % 3), y + 11, 4, 1);
        salpicar(g, x, y, tx, ty, C.aguaEsc, 4, 70);
      }
    },
    'v': {
      // a grota: barranco fundo, ninguém passa (tiro passa por cima)
      nome: 'grota', solido: true, passaTiro: true, desenhar: function (g, x, y, tx, ty) {
        g.fillStyle = '#0a0710'; g.fillRect(x, y, T, T);
        g.fillStyle = '#1a1220';
        for (var i = 0; i < 3; i++) g.fillRect(x + Math.floor(H(tx, ty, 90 + i) * 14), y + Math.floor(H(tx, ty, 95 + i) * 14), 2, 1);
        // beirada do barranco se o vizinho de cima não for grota
        if (H(tx, ty - 1, 0) >= 0 && BSI.tiles._mapaAtual && BSI.tiles._mapaAtual.ch(tx, ty - 1) !== 'v') {
          g.fillStyle = C.pedraEsc; g.fillRect(x, y, T, 3); g.fillStyle = C.pedra; g.fillRect(x, y, T, 1);
        }
      }
    },
    'L': {
      nome: 'linha de cal', desenhar: function (g, x, y, tx, ty) {
        terra(g, x, y, tx, ty);
        var m = BSI.tiles._mapaAtual, cal = '#e8e2d0';
        g.fillStyle = cal;
        var e = m && m.ch(tx - 1, ty) === 'L', d = m && m.ch(tx + 1, ty) === 'L', c = m && m.ch(tx, ty - 1) === 'L', b = m && m.ch(tx, ty + 1) === 'L';
        if (e || d || (!c && !b)) g.fillRect(e ? x : x + 7, y + 7, (e ? 8 : 0) + (d ? 9 : 2), 2);
        if (c || b) g.fillRect(x + 7, c ? y : y + 7, 2, (c ? 8 : 0) + (b ? 9 : 2));
      }
    },
    'b': {
      nome: 'arquibancada', solido: true, desenhar: function (g, x, y, tx, ty) {
        g.fillStyle = C.madeiraEsc; g.fillRect(x, y, T, T);
        g.fillStyle = C.madeira; g.fillRect(x, y + 2, T, 4); g.fillRect(x, y + 10, T, 4);
        g.fillStyle = C.madeiraClara; g.fillRect(x, y + 2, T, 1); g.fillRect(x, y + 10, T, 1);
        g.fillStyle = '#3a2010'; g.fillRect(x + (tx % 2 ? 3 : 11), y, 2, T);
      }
    },
    'f': {
      nome: 'chão de dentro', desenhar: function (g, x, y, tx, ty) {
        g.fillStyle = '#8a6a48'; g.fillRect(x, y, T, T);
        g.fillStyle = '#7a5a3a'; g.fillRect(x, y + ((tx + ty) % 2 ? 7 : 15), T, 1);
        salpicar(g, x, y, tx, ty, '#a07a52', 4, 101);
        salpicar(g, x, y, tx, ty, '#6a4a2e', 3, 102);
      }
    },
    'i': {
      nome: 'parede caiada', solido: true, opaco: true, desenhar: function (g, x, y, tx, ty) {
        g.fillStyle = '#e8e0cc'; g.fillRect(x, y, T, T);
        g.fillStyle = '#d0c6b0'; g.fillRect(x, y + 14, T, 2);
        salpicar(g, x, y, tx, ty, '#c8bca2', 4, 103);
        if (H(tx, ty, 104) > 0.85) { g.fillStyle = '#b09a80'; g.fillRect(x + 4, y + 5, 3, 2); } // reboco caído
        if (ty % 4 === 0) { g.fillStyle = '#4f7a9a'; g.fillRect(x, y, T, 2); } // faixa azul da igrejinha/bodega
      }
    },
    'k': {
      nome: 'balcão', solido: true, desenhar: function (g, x, y) {
        g.fillStyle = C.madeiraEsc; g.fillRect(x, y, T, T);
        g.fillStyle = C.madeira; g.fillRect(x, y + 1, T, 6);
        g.fillStyle = C.madeiraClara; g.fillRect(x, y + 1, T, 1);
        g.fillStyle = '#6a9a6a'; g.fillRect(x + 4, y - 0, 2, 4); g.fillStyle = '#e8d080'; g.fillRect(x + 10, y + 2, 2, 3);
      }
    },
    'm': {
      nome: 'mesa', solido: true, desenhar: function (g, x, y, tx, ty) {
        tiles_chao(g, x, y, tx, ty);
        g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x + 1, y + 12, 15, 3);
        g.fillStyle = C.madeiraEsc; g.fillRect(x + 1, y + 3, 14, 10);
        g.fillStyle = C.madeira; g.fillRect(x + 2, y + 3, 12, 7);
        g.fillStyle = '#e8d080'; g.fillRect(x + 5, y + 4, 2, 3); g.fillStyle = C.branco; g.fillRect(x + 5, y + 4, 2, 1);
      }
    },
    'e': {
      nome: 'escada do porão', desenhar: function (g, x, y) {
        g.fillStyle = '#3a2a20'; g.fillRect(x, y, T, T);
        g.fillStyle = C.madeira;
        for (var i = 0; i < 4; i++) { g.fillRect(x + 1, y + 1 + i * 4, 14, 2); }
        g.fillStyle = C.madeiraClara; for (var j = 0; j < 4; j++) g.fillRect(x + 1, y + 1 + j * 4, 14, 1);
      }
    },
    'q': {
      // palanque gigante do Rafael CDs (tiro passa por cima, gente não sobe)
      nome: 'palanque', solido: true, passaTiro: true, desenhar: function (g, x, y, tx, ty) {
        var m = BSI.tiles._mapaAtual, borda = m && m.ch(tx, ty + 1) !== 'q';
        g.fillStyle = '#5a3a22'; g.fillRect(x, y, T, T);
        g.fillStyle = '#8a5a32'; g.fillRect(x, y, T, 14);
        g.fillStyle = '#a06a3a'; g.fillRect(x, y + (tx % 2 ? 3 : 9), T, 1);
        if (borda) { for (var i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#e8e2d0' : '#c0303a'; g.fillRect(x + i * 4, y + 10, 4, 6); } }
      }
    },
    'n': {
      // barraca da quermesse (lona listrada)
      nome: 'barraca', solido: true, opaco: true, desenhar: function (g, x, y, tx, ty) {
        var cores = [['#c0303a', '#f2e6c9'], ['#3b5b8c', '#f2e6c9'], ['#4f7a3a', '#f0c75e']][(Math.floor(tx / 3) + ty) % 3];
        for (var i = 0; i < 4; i++) { g.fillStyle = cores[i % 2]; g.fillRect(x + i * 4, y, 4, 10); }
        g.fillStyle = C.madeiraEsc; g.fillRect(x, y + 10, T, 6); g.fillStyle = C.madeira; g.fillRect(x + 1, y + 10, 14, 2);
        g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x, y + 9, T, 1);
      }
    },
    '_': {
      // pedra falsa: parece pedra, mas é passagem (o Vander revela)
      nome: 'passagem escondida', segredo: true, desenhar: function (g, x, y, tx, ty) { defs.P.desenhar(g, x, y, tx, ty); }
    }
  };

  // preenche campos padrão
  Object.keys(defs).forEach(function (ch) {
    var d = defs[ch];
    d.ch = ch;
    d.solido = !!d.solido; d.opaco = !!d.opaco;
    d.inflamavel = d.inflamavel || 0;
  });

  BSI.tiles = { defs: defs };
})();
