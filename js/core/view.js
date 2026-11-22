/* =========================================================
   view.js — resolução virtual e escala da tela
   - Paisagem: altura virtual ~216 px, largura se adapta (288 a 480).
   - Retrato: largura virtual ~240 px e o jogo ocupa a parte de
     cima; os controles de toque ficam na faixa de baixo.
   - Escala sempre inteira em pixels físicos = pixel nítido.
   Dois canvas: "tela" (pixel art, baixa resolução) e
   "tela-texto" (texto nítido na resolução real da tela).
   ========================================================= */
(function () {
  'use strict';

  var V = BSI.view = {
    w: 384, h: 216,     // tamanho virtual atual
    s: 1,               // pixels físicos por pixel virtual
    det: 1,             // DETALHE: pixels de desenho por pixel virtual (Gráficos Médio/Bonito = 2)
    qualidade: 'medio', // leve | medio | bonito
    dpr: 1,
    retrato: false,
    faixaControles: 0,  // altura (css px) da faixa de controles no retrato
    css: { x: 0, y: 0, w: 384, h: 216 },
    mudou: true,        // avisa quem precisa recriar buffers (luz)

    init: function () {
      BSI.canvas = document.getElementById('tela');
      BSI.ctx = BSI.canvas.getContext('2d');
      BSI.ucanvas = document.getElementById('tela-texto');
      BSI.uctx = BSI.ucanvas.getContext('2d');
      V.palco = document.getElementById('palco');
      window.addEventListener('resize', V.redimensionar);
      window.addEventListener('orientationchange', function () { setTimeout(V.redimensionar, 150); });
      V.redimensionar();
    },

    redimensionar: function () {
      var w = window.innerWidth || 384, h = window.innerHeight || 216;
      var dpr = Math.min(window.devicePixelRatio || 1, 3);
      V.dpr = dpr;
      V.retrato = h > w * 1.05;
      var temToque = BSI.touch && BSI.touch.ativo;
      V.faixaControles = (V.retrato && temToque) ? Math.round(h * 0.36) : 0;
      document.body.classList.toggle('retrato', V.retrato);

      var areaW = w, areaH = h - V.faixaControles;
      var pw = Math.floor(areaW * dpr), ph = Math.floor(areaH * dpr);
      var s, vw, vh;
      if (!V.retrato) {
        s = Math.max(1, Math.round(ph / 216));
        vh = Math.floor(ph / s);
        if (vh < 180 && s > 1) { s--; vh = Math.floor(ph / s); }
        vw = Math.floor(pw / s);
        vw = Math.min(Math.max(vw, 200), 480);
        vh = Math.min(vh, 300);
      } else {
        // ~200 px virtuais de largura: personagem grande na tela do celular
        s = Math.max(1, Math.round(pw / 200));
        vw = Math.floor(pw / s);
        if (vw < 176 && s > 1) { s--; vw = Math.floor(pw / s); }
        vw = Math.min(vw, 300);
        vh = Math.min(Math.floor(ph / s), 360);
      }
      vw = Math.max(vw, 160); vh = Math.max(vh, 120);

      // DETALHE 2x: a lógica do jogo continua em pixels "virtuais", mas a tela
      // tem o dobro de pixels pra arte nova ficar fina. Pra ficar nítido, cada
      // pixel de desenho tem que virar um número INTEIRO de pixels da tela.
      var q = (BSI.save && BSI.save.cfg().graficos) || 'medio';
      V.qualidade = q;
      var det = q === 'leve' ? 1 : 2;
      if (det === 2 && s < 2) det = 1;
      if (det === 2 && s % 2 === 1 && !V.retrato) { s--; vh = Math.min(Math.floor(ph / s), 300); vw = Math.min(Math.max(Math.floor(pw / s), 200), 480); }
      V.det = det;
      V.w = vw; V.h = vh; V.s = s;
      BSI.canvas.width = vw * det; BSI.canvas.height = vh * det;
      BSI.ucanvas.width = vw * s; BSI.ucanvas.height = vh * s;
      BSI.ctx.imageSmoothingEnabled = false;

      var cw = vw * s / dpr, ch = vh * s / dpr;
      V.css.w = cw; V.css.h = ch;
      V.css.x = Math.floor((areaW - cw) / 2);
      V.css.y = V.retrato ? Math.max(0, Math.floor((areaH - ch) / 2)) : Math.floor((areaH - ch) / 2);
      var st = V.palco.style;
      st.left = V.css.x + 'px'; st.top = V.css.y + 'px';
      st.width = cw + 'px'; st.height = ch + 'px';
      V.mudou = true;
      if (BSI.touch && BSI.touch.reposicionar) BSI.touch.reposicionar();
    },

    // Converte coordenada da janela (clientX/Y) para pixel virtual
    paraVirtual: function (cx, cy) {
      return {
        x: (cx - V.css.x) / V.css.w * V.w,
        y: (cy - V.css.y) / V.css.h * V.h
      };
    }
  };
})();
